import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import TrustStrip from "@/components/landing/TrustStrip";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import TechSection from "@/components/landing/TechSection";
import WhySection from "@/components/landing/WhySection";
import RoadmapSection from "@/components/landing/RoadmapSection";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <TrustStrip />
      <FeaturesSection />
      <HowItWorks />
      <TechSection />
      <WhySection />
      <RoadmapSection />
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default Index;
