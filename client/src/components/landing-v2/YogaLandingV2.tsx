import { useEffect, type MouseEvent } from 'react';

import { scrollToAnchor } from '@/lib/scroll-to-anchor';
import type { Language } from '@/lib/i18n';
import Header from './Header';
import BodhisattvaCtaSection from './sections/BodhisattvaCtaSection';
import BodhisattvaInterlude from './sections/BodhisattvaInterlude';
import ClassesSection from './sections/ClassesSection';
import HeroSection from './sections/HeroSection';
import HimalayanSection from './sections/HimalayanSection';
import PracticeVideoSection from './sections/PracticeVideoSection';
import RetreatsSection from './sections/RetreatsSection';

interface YogaLandingV2Props {
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function YogaLandingV2({ language, setLanguage }: YogaLandingV2Props) {
  useEffect(() => {
    const hash = window.location.hash;

    if (!hash.startsWith('#')) {
      return;
    }

    window.setTimeout(() => {
      scrollToAnchor(hash as `#${string}`, 'auto');
    }, 80);
  }, []);

  const handleRootClick = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;

    if (!(target instanceof HTMLAnchorElement) || event.defaultPrevented || event.metaKey || event.ctrlKey) {
      return;
    }

    const href = target.getAttribute('href');

    if (!href?.startsWith('#')) {
      return;
    }

    event.preventDefault();

    if (scrollToAnchor(href as `#${string}`)) {
      window.history.replaceState(null, '', href);
    }
  };

  return (
    <div className='landing-v2-root' onClick={handleRootClick}>
      <Header language={language} setLanguage={setLanguage} />
      <main>
        <HeroSection language={language} />
        <RetreatsSection language={language} />
        <ClassesSection language={language} />
        <HimalayanSection language={language} />
        <PracticeVideoSection language={language} />
        <BodhisattvaInterlude language={language} />
        <BodhisattvaCtaSection language={language} />
      </main>
    </div>
  );
}
