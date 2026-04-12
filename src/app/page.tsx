import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import Portfolio from "@/components/sections/Portfolio";
import Academy from "@/components/sections/Academy";
import GuyanaStrip from "@/components/sections/GuyanaStrip";
import Founders from "@/components/sections/Founders";
import ContactCTA from "@/components/sections/ContactCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Portfolio />
      <Academy />
      <GuyanaStrip />
      <Founders />
      <ContactCTA />
    </>
  );
}
