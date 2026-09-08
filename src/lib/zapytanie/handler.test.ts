import { describe, expect, it } from "vitest";

import { handleZapytanie } from "./handler";
import { limitZapytan, type LimitZapytan, MAKSIMUM_NA_OKNO } from "./limit";
import {
  type InquiryEmail,
  type InquiryMailer,
  inquiryMailer,
} from "./mailer";

const ODBIORCA = "kontakt@twojadekoracja.pl";

/**
 * The port with a recorder behind it.
 *
 * Built with `inquiryMailer` rather than as a hand-written stub so the tests
 * exercise the composition the Resend implementation also uses: who the mail
 * is addressed to, what the subject says and what the body carries are decided
 * once, and a test that substituted its own shaping could not disagree with
 * the real one.
 */
function recordingMailer() {
  const wyslane: InquiryEmail[] = [];
  const mailer = inquiryMailer(ODBIORCA, async (email) => {
    wyslane.push(email);
  });
  return { mailer, wyslane };
}

const POPRAWNE = {
  imie: "Anna Kowalska",
  kontakt: "anna@example.com",
  typWydarzenia: "wesele",
  termin: "sierpień 2027",
  wiadomosc: "Szukamy oprawy na wesele w Szczecinie, około 80 osób.",
};

function submission(
  payload: Record<string, unknown>,
  nadawca?: string,
): Request {
  return new Request("http://localhost/api/kontakt", {
    method: "POST",
    headers: nadawca
      ? { "content-type": "application/json", "x-real-ip": nadawca }
      : { "content-type": "application/json" },
    // Filled in at the pace of a person rather than a script, so the
    // time-to-submit guard lets it through.
    body: JSON.stringify({ otwarto: Date.now() - 30_000, ...payload }),
  });
}

/**
 * The handler with a limiter of its own.
 *
 * A fresh one per call, so that a test which is not about the rate limit
 * cannot be made to fail by one that is — and so the tests that *are* about it
 * have to pass their own limiter in, which is the only way to spend it twice.
 */
function przyjmij(
  request: Request,
  mailer: InquiryMailer,
  limit: LimitZapytan = limitZapytan(),
) {
  return handleZapytanie(request, mailer, limit);
}

describe("handleZapytanie", () => {
  it("turns a valid submission into one inquiry the owner can reply to", async () => {
    const { mailer, wyslane } = recordingMailer();

    const response = await przyjmij(submission(POPRAWNE), mailer);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "wyslane" });

    expect(wyslane).toHaveLength(1);
    const [email] = wyslane;
    expect(email.to).toBe(ODBIORCA);
    // Hitting reply reaches the person who wrote, not the site's own mailbox.
    expect(email.replyTo).toBe(POPRAWNE.kontakt);
    // Triage happens in the inbox list, so the subject alone has to answer
    // "what kind of event, and when".
    expect(email.subject).toContain("Wesele");
    expect(email.subject).toContain(POPRAWNE.termin);
    for (const wartosc of Object.values(POPRAWNE)) {
      expect(email.text).toContain(wartosc);
    }
  });

  it("reports a phone number as the contact it is, and replies to nobody", async () => {
    const { mailer, wyslane } = recordingMailer();

    const response = await przyjmij(
      submission({ ...POPRAWNE, kontakt: "+48 601 234 567" }),
      mailer,
    );

    expect(response.status).toBe(200);
    expect(wyslane).toHaveLength(1);
    // A `Reply-To` holding a phone number bounces every reply sent to it.
    expect(wyslane[0].replyTo).toBeUndefined();
    expect(wyslane[0].text).toContain("+48 601 234 567");
  });

  it("sends nothing when the submission fails validation, and says which fields", async () => {
    const { mailer, wyslane } = recordingMailer();

    const response = await przyjmij(
      submission({ ...POPRAWNE, imie: "", kontakt: "gdzie-tam", wiadomosc: "cze" }),
      mailer,
    );

    expect(response.status).toBe(400);
    expect(wyslane).toEqual([]);

    const tresc = await response.json();
    expect(tresc.status).toBe("niepoprawne");
    expect(Object.keys(tresc.bledy).sort()).toEqual([
      "imie",
      "kontakt",
      "wiadomosc",
    ]);
    // The message under the field is the schema's own, so what the browser
    // showed and what the server would have said cannot be different sentences.
    expect(tresc.bledy.kontakt).toMatch(/e-mail albo numer/);
  });

  it("drops a submission that filled in the field no visitor can see", async () => {
    const { mailer, wyslane } = recordingMailer();

    const response = await przyjmij(
      submission({ ...POPRAWNE, witryna: "https://kasyno.example" }),
      mailer,
    );

    // Reported as sent on purpose: telling the sender which field gave them
    // away is how the trap stops working.
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "wyslane" });
    expect(wyslane).toEqual([]);
  });

  it("drops a submission filled in faster than anyone could type it", async () => {
    const { mailer, wyslane } = recordingMailer();

    const response = await przyjmij(
      submission({ ...POPRAWNE, otwarto: Date.now() }),
      mailer,
    );

    expect(response.status).toBe(200);
    expect(wyslane).toEqual([]);
  });

  it("owns up when delivery fails, rather than reporting a send that did not happen", async () => {
    const mailer = inquiryMailer(ODBIORCA, async () => {
      throw new Error("Resend nie odpowiada");
    });

    const response = await przyjmij(submission(POPRAWNE), mailer);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      status: "niedostarczone",
    });
  });

  it("still sends when the page carried no trap at all", async () => {
    const { mailer, wyslane } = recordingMailer();
    const bezPrzynety = new Request("http://localhost/api/kontakt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...POPRAWNE, otwarto: Date.now() - 30_000 }),
    });

    const response = await przyjmij(bezPrzynety, mailer);

    // The trap catches what is in it. Treating its absence as proof of a bot
    // would mean a form that one day stopped rendering it swallowed every
    // genuine inquiry, silently.
    expect(response.status).toBe(200);
    expect(wyslane).toHaveLength(1);
  });

  it("drops a submission that never said when it was opened", async () => {
    const { mailer, wyslane } = recordingMailer();
    const bezZnacznika = new Request("http://localhost/api/kontakt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(POPRAWNE),
    });

    // Unlike the trap, this one has to be required: a threshold that can be
    // skipped by leaving the field out is not a threshold.
    await przyjmij(bezZnacznika, mailer);

    expect(wyslane).toEqual([]);
  });

  it("stops one sender from filling the inbox, and never says it did", async () => {
    const { mailer, wyslane } = recordingMailer();
    const limit = limitZapytan();
    const nadawca = "203.0.113.7";

    for (let i = 0; i < MAKSIMUM_NA_OKNO; i += 1) {
      await przyjmij(submission(POPRAWNE, nadawca), mailer, limit);
    }
    const response = await przyjmij(
      submission(POPRAWNE, nadawca),
      mailer,
      limit,
    );

    expect(wyslane).toHaveLength(MAKSIMUM_NA_OKNO);
    // Word for word what a delivered inquiry gets, so a script cannot learn
    // from the answer that it has found the ceiling.
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "wyslane" });
  });

  it("holds the count against the sender, not against everyone at once", async () => {
    const { mailer, wyslane } = recordingMailer();
    const limit = limitZapytan();

    for (let i = 0; i < MAKSIMUM_NA_OKNO; i += 1) {
      await przyjmij(submission(POPRAWNE, "203.0.113.7"), mailer, limit);
    }
    await przyjmij(submission(POPRAWNE, "198.51.100.4"), mailer, limit);

    expect(wyslane).toHaveLength(MAKSIMUM_NA_OKNO + 1);
  });

  it("lets an inquiry through when the deployment named no sender", async () => {
    const { mailer, wyslane } = recordingMailer();
    const limit = limitZapytan();

    for (let i = 0; i < MAKSIMUM_NA_OKNO + 1; i += 1) {
      await przyjmij(submission(POPRAWNE), mailer, limit);
    }

    // Nothing identifies these, and an unidentified visitor is a visitor. A
    // limiter that counted them all as one sender would silence a whole site
    // the moment a proxy stopped setting the header.
    expect(wyslane).toHaveLength(MAKSIMUM_NA_OKNO + 1);
  });
});
