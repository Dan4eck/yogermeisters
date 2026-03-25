import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToursSection from "@/components/ToursSection";
import ClassesSection from "@/components/ClassesSection";
import ReviewsSection from "@/components/ReviewsSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import type { Language } from '@/lib/i18n';

interface HomeProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function Home({ language, setLanguage }: HomeProps) {
  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Navbar language={language} setLanguage={setLanguage} />
      <Hero language={language} />
      <ToursSection language={language} />
      <ClassesSection language={language} />
      <AboutSection language={language} />
      <ReviewsSection language={language} />
      <CTASection language={language} />
      <Footer language={language} />
    </div>
  );
}
