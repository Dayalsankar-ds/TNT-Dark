/**
 * CONTACT SUBMISSION — the single seam between /contact's two form tabs and
 * wherever submissions will eventually go.
 *
 * ⚠ PENDING INTEGRATION (2026-10-08, decided with the user). No destination
 * has been confirmed — no inbox, CRM or backend API exists for this site yet
 * (there is no .env and no mail/CRM dependency). Until one is chosen this
 * returns "not-configured", and the form says plainly that nothing was sent.
 * It must never report success for a request that went nowhere.
 *
 * To connect: implement the body (e.g. POST to a route handler under
 * src/app/api/ that forwards to the approved inbox/CRM with server-side
 * credentials) and return "sent" only on a confirmed 2xx. Attachments need
 * their own verified, secure destination before they're transmitted.
 */

export type ContactKind = "quote" | "enquiry";

export type SubmitResult =
  | { status: "sent" }
  | { status: "not-configured" }
  | { status: "failed"; message: string };

export async function submitContact(
  kind: ContactKind,
  data: Record<string, string>,
): Promise<SubmitResult> {
  void kind;
  void data;
  return { status: "not-configured" };
}
