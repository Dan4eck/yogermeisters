import { useEffect, useState } from 'react';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ToursSection from "@/components/ToursSection";
import ClassesSection from "@/components/ClassesSection";
import ReviewsSection from "@/components/ReviewsSection";
import AboutSection from "@/components/AboutSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { DEFAULT_LANGUAGE, type Language } from '@/lib/i18n';

export default function Home() {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('language') : null;
    if (stored === 'ru' || stored === 'en') {
      return stored;
    }
    return DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('language', language);
  }, [language]);

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-x-hidden selection:bg-primary/20">
      <Navbar language={language} setLanguage={setLanguage} />
      <Hero language={language} />
      <ToursSection language={language} />
      <ClassesSection language={language} />
      <AboutSection language={language} />
      <ReviewsSection language={language} />
      <CTASection language={language} />
      <Footer />
    </div>
  );
}
