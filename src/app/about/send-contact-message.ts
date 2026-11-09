"use server";

import { ownerInboxFromEnvironment } from "@/owner-inbox/from-environment";
import type { ContactIssue } from "@/owner-inbox/owner-inbox";

type Values = { name: string; email: string; message: string };

/** Where the Contact form stands; after a rejection it carries the Reader's text back so nothing is lost. */
export type ContactFormState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; issues: ContactIssue[]; values: Values }
  | { status: "unavailable"; values: Values };

const text = (form: FormData, name: string) => {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
};

/** The Contact form's Server Action: hands the Reader's message to the Owner inbox. */
export async function sendContactMessage(_previous: ContactFormState, form: FormData): Promise<ContactFormState> {
  const values = { name: text(form, "name"), email: text(form, "email"), message: text(form, "message") };
  const result = await ownerInboxFromEnvironment().sendContactMessage({ ...values, honeypot: text(form, "website") });

  if (result.ok) return { status: "sent" };
  if (result.reason === "invalid") return { status: "invalid", issues: result.issues, values };
  // A bot gets the same failure a person would see when mail is down, nothing more telling.
  return { status: "unavailable", values };
}
