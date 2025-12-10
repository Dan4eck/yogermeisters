import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToursSection from "@/components/ToursSection";
import ReviewsSection from "@/components/ReviewsSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Navbar />
      <Hero />
      <ToursSection />
      <AboutSection />
      <ReviewsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
