import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeatureVoiceChat from "@/components/FeatureVoiceChat";
import PromptTicker from "@/components/PromptTicker";
import FeatureMemory from "@/components/FeatureMemory";
import IntegrationMarquee from "@/components/IntegrationMarquee";
import Testimonials from "@/components/Testimonials";
import FinalCta from "@/components/FinalCta";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <FeatureVoiceChat />
      <PromptTicker />
      <FeatureMemory />
      <IntegrationMarquee />
      <Testimonials />
      <FinalCta />
      <Footer />
    </main>
  );
}
