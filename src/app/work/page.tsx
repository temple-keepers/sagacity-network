import type { Metadata } from "next";
import Portfolio from "@/components/sections/Portfolio";

export const metadata: Metadata = {
  title: "Our Work — Sagacity Network",
  description:
    "Live platforms built by Sagacity Network. From faith & wellness to diaspora commerce — production-grade digital products.",
};

export default function WorkPage() {
  return (
    <div className="pt-20">
      <Portfolio />
    </div>
  );
}
