import Header from './Header';
import BodhisattvaCtaSection from './sections/BodhisattvaCtaSection';
import ClassesSection from './sections/ClassesSection';
import HeroSection from './sections/HeroSection';
import HimalayanSection from './sections/HimalayanSection';
import PracticeVideoSection from './sections/PracticeVideoSection';
import RetreatsSection from './sections/RetreatsSection';
import type { Language } from '@/lib/i18n';

interface YogaLandingV2Props {
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function YogaLandingV2({ language, setLanguage }: YogaLandingV2Props) {
  return (
    <div className='landing-v2-root'>
      <Header language={language} setLanguage={setLanguage} />
      <main>
        <HeroSection language={language} />
        <RetreatsSection language={language} />
        <ClassesSection language={language} />
        <HimalayanSection language={language} />
        <PracticeVideoSection language={language} />
        <BodhisattvaCtaSection language={language} />
      </main>
    </div>
  );
}
