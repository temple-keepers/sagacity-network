import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Sagacity Network",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const sp = await searchParams;
  const redirect = sp.redirect ?? "/academy/my-learning";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--gradient-hero)" }}
    >
      <LoginForm redirect={redirect} />
    </div>
  );
}
