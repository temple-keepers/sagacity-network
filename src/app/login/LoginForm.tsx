"use client";

import { useActionState } from "react";
import { requestMagicLink } from "./actions";

export default function LoginForm({ redirect }: { redirect: string }) {
  const [state, formAction, pending] = useActionState(requestMagicLink, null);

  if (state?.ok) {
    return (
      <div
        className="w-full max-w-sm p-8 rounded-2xl text-center"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <h1
          className="text-2xl font-bold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          Check your inbox
        </h1>
        <p className="text-sm" style={{ color: "var(--color-muted)" }}>
          We&rsquo;ve sent you a login link. Click it to continue to your Academy.
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="w-full max-w-sm p-8 rounded-2xl"
      style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <h1
        className="text-2xl font-bold mb-1"
        style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
      >
        Sign in
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
        We&rsquo;ll email you a one-click login link.
      </p>

      {state?.error && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ background: "rgba(224,82,82,0.1)", color: "#E05252" }}
        >
          {state.error}
        </div>
      )}

      <input type="hidden" name="redirect" value={redirect} />

      <label
        className="block text-xs font-medium uppercase tracking-wider mb-2"
        style={{ color: "var(--color-muted)" }}
      >
        Email
      </label>
      <input
        type="email"
        name="email"
        autoFocus
        required
        className="w-full px-4 py-3 rounded-lg text-sm mb-4 outline-none focus:ring-2"
        style={{
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-ink)",
        }}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
        style={{ background: "var(--gradient-purple)" }}
      >
        {pending ? "Sending..." : "Send me a login link"}
      </button>
    </form>
  );
}
