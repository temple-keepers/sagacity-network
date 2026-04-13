import Hero from "@/components/sections/Hero";
import ProofStrip from "@/components/sections/ProofStrip";
import Services from "@/components/sections/Services";
import Portfolio from "@/components/sections/Portfolio";
import LeadCapture from "@/components/sections/LeadCapture";
import GuyanaStrip from "@/components/sections/GuyanaStrip";
import ScrollProgress from "@/components/ui/ScrollProgress";

export default function Home() {
  return (
    <>
      <ScrollProgress />
      <Hero />
      <ProofStrip />
      <Services />
      <Portfolio />
      <LeadCapture />
      <GuyanaStrip />
    </>
  );
}
