import { describe, expect, it } from "vitest";

import { handleZapytanie } from "./handler";
import { type InquiryEmail, inquiryMailer } from "./mailer";

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

const WAZNE = {
  imie: "Anna Kowalska",
  kontakt: "anna@example.com",
  typWydarzenia: "wesele",
  termin: "sierpień 2027",
  wiadomosc: "Szukamy oprawy na wesele w Szczecinie, około 80 osób.",
};

function submission(payload: Record<string, unknown>): Request {
  return new Request("http://localhost/api/kontakt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    // Filled in at the pace of a person rather than a script, so the
    // time-to-submit guard lets it through.
    body: JSON.stringify({ otwarto: Date.now() - 30_000, ...payload }),
  });
}

describe("handleZapytanie", () => {
  it("turns a valid submission into one inquiry the owner can reply to", async () => {
    const { mailer, wyslane } = recordingMailer();

    const response = await handleZapytanie(submission(WAZNE), mailer);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "wyslane" });

    expect(wyslane).toHaveLength(1);
    const [email] = wyslane;
    expect(email.to).toBe(ODBIORCA);
    // Hitting reply reaches the person who wrote, not the site's own mailbox.
    expect(email.replyTo).toBe(WAZNE.kontakt);
    // Triage happens in the inbox list, so the subject alone has to answer
    // "what kind of event, and when".
    expect(email.subject).toContain("Wesele");
    expect(email.subject).toContain(WAZNE.termin);
    for (const wartosc of Object.values(WAZNE)) {
      expect(email.text).toContain(wartosc);
    }
  });

  it("reports a phone number as the contact it is, and replies to nobody", async () => {
    const { mailer, wyslane } = recordingMailer();

    const response = await handleZapytanie(
      submission({ ...WAZNE, kontakt: "+48 601 234 567" }),
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

    const response = await handleZapytanie(
      submission({ ...WAZNE, imie: "", kontakt: "gdzie-tam", wiadomosc: "cze" }),
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

    const response = await handleZapytanie(
      submission({ ...WAZNE, witryna: "https://kasyno.example" }),
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

    const response = await handleZapytanie(
      submission({ ...WAZNE, otwarto: Date.now() }),
      mailer,
    );

    expect(response.status).toBe(200);
    expect(wyslane).toEqual([]);
  });

  it("owns up when delivery fails, rather than reporting a send that did not happen", async () => {
    const mailer = inquiryMailer(ODBIORCA, async () => {
      throw new Error("Resend nie odpowiada");
    });

    const response = await handleZapytanie(submission(WAZNE), mailer);

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      status: "niedostarczone",
    });
  });
});
