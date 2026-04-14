"use server";

import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitContact(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const message = formData.get("message") as string;

  if (!name || !email || !message) {
    return { error: "All fields are required.", success: false };
  }

  try {
    const { error: dbError } = await supabase
      .from("contacts")
      .insert([{ name, email, message, created_at: new Date().toISOString() }]);

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return { error: "Failed to save your message. Please try again.", success: false };
    }

    // Send notification email
    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: "Sagacity Network <denise@sagacitynetwork.net>",
        to: "denise@sagacitynetwork.net",
        replyTo: email,
        subject: `New contact: ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }).catch((err) => console.error("Resend notification error:", err));
    }

    return { success: true, error: null };
  } catch (err: any) {
    console.error("Contact action error:", err.message);
    return { error: "Something went wrong. Please try again later.", success: false };
  }
}
