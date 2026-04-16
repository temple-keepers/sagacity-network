import "server-only";
import { Resend } from "resend";

interface EnrolmentEmailPayload {
  learnerName: string | null;
  learnerEmail: string;
  courseTitle: string;
  amountPaidPence: number;
  stripeSessionUrl: string;
  adminEnrolmentsUrl: string;
}

export async function sendEnrolmentEmail(payload: EnrolmentEmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY missing \u2014 skipping enrolment email");
    return;
  }
  const resend = new Resend(apiKey);

  const who = payload.learnerName
    ? `${payload.learnerName} (${payload.learnerEmail})`
    : payload.learnerEmail;
  const amount = `\u00a3${(payload.amountPaidPence / 100).toFixed(2)}`;

  const subject = `New Academy enrolment \u2014 ${payload.learnerName ?? payload.learnerEmail}`;
  const text = [
    `${who} just enrolled in "${payload.courseTitle}" for ${amount}.`,
    ``,
    `View in Stripe: ${payload.stripeSessionUrl}`,
    `Open admin enrolments: ${payload.adminEnrolmentsUrl}`,
  ].join("\n");

  try {
    await resend.emails.send({
      from: "Sagacity Academy <denise@sagacitynetwork.net>",
      to: "denise@sagacitynetwork.net",
      subject,
      text,
    });
  } catch (err) {
    console.error("Enrolment email failed:", err);
    // deliberately swallow \u2014 enrolment must succeed even if email fails
  }
}
