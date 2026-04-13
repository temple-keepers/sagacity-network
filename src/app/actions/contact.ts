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
    // 1. Save to Supabase (assuming you have a 'leads' or 'contacts' table)
    const { error: dbError } = await supabase
      .from("contacts")
      .insert([{ name, email, message, created_at: new Date().toISOString() }]);

    if (dbError) {
      console.error("Supabase Error:", dbError);
      return { error: "Failed to save your message. Please try again.", success: false };
    }

    // 2. Send email via Resend
    // (Uncomment and configure when RESEND_API_KEY is verified and domain is set up)
    /*
    const { error: emailError } = await resend.emails.send({
      from: "Sagacity Network <onboarding@resend.dev>", // replace with your verified domain
      to: "hello@sagacitynetwork.net", // replace with recipient
      subject: `New Contact Request from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    });

    if (emailError) {
      console.error("Resend Error:", emailError);
      // We can decide whether to fail the whole request if email fails, 
      // but usually if DB succeeds we can return true and log the email error.
    }
    */

    return { success: true, error: null };
  } catch (err: any) {
    console.error("Contact action error:", err.message);
    return { error: "Something went wrong. Please try again later.", success: false };
  }
}
