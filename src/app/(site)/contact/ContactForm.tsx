"use client";

import { useActionState } from "react";
import { submitContact } from "@/app/actions/contact";

export default function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContact, {
    success: false,
    error: null,
  });

  return (
    <form action={formAction} className="flex flex-col space-y-6">
      {state.success ? (
        <div className="p-4 rounded-md border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400">
          <p className="font-semibold">Message sent successfully!</p>
          <p className="text-sm opacity-90 mt-1">We&apos;ll get back to you as soon as possible.</p>
        </div>
      ) : null}

      {state.error ? (
        <div className="p-4 rounded-md border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400">
          <p>{state.error}</p>
        </div>
      ) : null}

      <div className="flex flex-col space-y-2">
        <label htmlFor="name" className="text-[14px] font-[500]" style={{ color: "var(--color-ink)" }}>
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          disabled={isPending}
          className="px-4 py-3 rounded-md border bg-transparent outline-none transition-colors focus:border-[var(--color-ink)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
          placeholder="Jane Doe"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="email" className="text-[14px] font-[500]" style={{ color: "var(--color-ink)" }}>
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          disabled={isPending}
          className="px-4 py-3 rounded-md border bg-transparent outline-none transition-colors focus:border-[var(--color-ink)]"
          style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
          placeholder="jane@example.com"
        />
      </div>

      <div className="flex flex-col space-y-2">
        <label htmlFor="message" className="text-[14px] font-[500]" style={{ color: "var(--color-ink)" }}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          disabled={isPending}
          className="px-4 py-3 rounded-md border bg-transparent outline-none transition-colors focus:border-[var(--color-ink)] resize-none"
          style={{ borderColor: "var(--color-border)", color: "var(--color-ink)" }}
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || state.success}
        className="mt-4 px-8 py-3.5 text-[14px] font-[500] disabled:opacity-50 transition-opacity"
        style={{
          background: "var(--color-ink)",
          color: "var(--color-bg)",
          borderRadius: "var(--radius-sm)",
        }}
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
