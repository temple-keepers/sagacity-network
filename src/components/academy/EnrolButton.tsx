"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  courseSlug: string;
  priceLabel: string;
  isSignedIn: boolean;
}

export default function EnrolButton({ courseSlug, priceLabel, isSignedIn }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setError(null);

    if (!isSignedIn) {
      const redirect = encodeURIComponent(`/academy/${courseSlug}?enrol=1`);
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    setPending(true);
    try {
      const res = await fetch("/api/academy/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseSlug }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setPending(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not reach the payment page. Please try again.");
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="w-full px-5 py-3 text-[14px] font-[500] rounded-[8px] mb-3 transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-wait"
        style={{ background: "var(--gradient-purple)", color: "#fff" }}
      >
        {pending ? "Redirecting to payment\u2026" : `Enrol \u2014 ${priceLabel}`}
      </button>
      {error ? (
        <p className="text-[12px] mt-1" style={{ color: "#d4443a" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
