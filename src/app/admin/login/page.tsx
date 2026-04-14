"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function AdminLogin() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gradient-hero)" }}>
      <form action={formAction} className="w-full max-w-sm p-8 rounded-2xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
          Admin Console
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--color-muted)" }}>
          Sagacity Network
        </p>

        {state?.error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(224,82,82,0.1)", color: "#E05252" }}>
            {state.error}
          </div>
        )}

        <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--color-muted)" }}>
          Password
        </label>
        <input
          type="password"
          name="password"
          autoFocus
          required
          className="w-full px-4 py-3 rounded-lg text-sm mb-4 outline-none focus:ring-2"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            color: "var(--color-ink)",
            // @ts-expect-error CSS custom property
            "--tw-ring-color": "var(--color-accent)",
          }}
        />

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--gradient-purple)" }}
        >
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
