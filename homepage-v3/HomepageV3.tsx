import { useEffect, useRef, useState, type MouseEvent, type ReactElement } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

import type { Language } from '@/lib/i18n';
import AboutSection from './sections/about/AboutSection';
import ClassesSection from './sections/classes/ClassesSection';
import FooterSection from './sections/footer/FooterSection';
import HeroSection from './sections/hero/HeroSection';
import PracticeSection from './sections/practice/PracticeSection';
import PhilosophySection from './sections/philosophy/PhilosophySection';
import RetreatsSection from './sections/retreats/RetreatsSection';
import { useIntroMotion } from './useIntroMotion';
import styles from './HomepageV3.module.css';

interface HomepageV3Props {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

const NAVIGATION = [
  { id: 'practice', ru: 'Практика', en: 'Practice' },
  { id: 'classes', ru: 'Занятия', en: 'Classes' },
  { id: 'retreats', ru: 'Ретриты', en: 'Retreats' },
  { id: 'about', ru: 'О проекте', en: 'About' },
] as const;

export default function HomepageV3({ language, setLanguage }: HomepageV3Props): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollToSection = useIntroMotion(rootRef, language);
  const isRussian = language === 'ru';

  useEffect((): (() => void) => {
    let disposed = false;
    const visitHash = (): void => {
      if (!disposed && window.location.hash) {
        scrollToSection(decodeURIComponent(window.location.hash.slice(1)), 'auto');
      }
    };

    void document.fonts.ready.then(visitHash);
    window.addEventListener('hashchange', visitHash);
    return (): void => {
      disposed = true;
      window.removeEventListener('hashchange', visitHash);
    };
  }, [scrollToSection]);

  useEffect((): (() => void) | void => {
    if (!menuOpen) {
      return;
    }
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return (): void => document.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  const handleAnchor = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;

    if (!(target instanceof HTMLAnchorElement) || event.defaultPrevented || event.metaKey
      || event.ctrlKey || event.altKey || event.shiftKey || event.button !== 0) {
      return;
    }

    const href = target.getAttribute('href');
    if (href && scrollToSection(href.slice(1))) {
      event.preventDefault();
      window.history.replaceState(null, '', href);
      setMenuOpen(false);
    }
  };

  return (
    <div className={styles.root} ref={rootRef} onClick={handleAnchor} lang={language} data-homepage-v3>
      <a className={styles.skipLink} href='#classes'>
        {isRussian ? 'Перейти к занятиям' : 'Skip to classes'}
      </a>
      <header className={`${styles.header}${menuOpen ? ` ${styles.menuOpen}` : ''}`}>
        <a className={styles.brand} href='#home' aria-label={isRussian ? 'На главную' : 'Back to the beginning'}>
          yogermeisters.
        </a>
        <nav className={styles.desktopNav} aria-label={isRussian ? 'Главная навигация' : 'Main navigation'}>
          {NAVIGATION.map((item): ReactElement => (
            <a href={`#${item.id}`} key={item.id}>{item[language]}</a>
          ))}
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.shala} href='/cabinet'>
            {isRussian ? 'Шала' : 'Shala'} <ArrowUpRight size={14} aria-hidden='true' />
          </a>
          <button
            className={styles.language}
            type='button'
            onClick={(): void => setLanguage(isRussian ? 'en' : 'ru')}
            aria-label={isRussian ? 'Switch to English' : 'Переключить на русский'}
          >
            <span className={isRussian ? styles.selectedLanguage : undefined}>RU</span>
            <span aria-hidden='true'>/</span>
            <span className={!isRussian ? styles.selectedLanguage : undefined}>EN</span>
          </button>
          <button
            className={styles.menuButton}
            type='button'
            ref={menuButtonRef}
            aria-expanded={menuOpen}
            aria-controls='v3-mobile-navigation'
            aria-label={isRussian ? (menuOpen ? 'Закрыть меню' : 'Открыть меню') : (menuOpen ? 'Close menu' : 'Open menu')}
            onClick={(): void => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} aria-hidden='true' /> : <Menu size={22} aria-hidden='true' />}
          </button>
        </div>
        <nav
          className={styles.mobileNav}
          id='v3-mobile-navigation'
          aria-label={isRussian ? 'Навигация' : 'Navigation'}
          hidden={!menuOpen}
        >
          {NAVIGATION.map((item, index): ReactElement => (
            <a href={`#${item.id}`} key={item.id}>
              <span>0{index + 1}</span>{item[language]}<ArrowUpRight size={24} aria-hidden='true' />
            </a>
          ))}
        </nav>
      </header>
      <main>
        <div className={styles.intro} data-intro>
          <div className={styles.stage} data-intro-stage>
            <HeroSection language={language} />
            <AboutSection language={language} />
            <ClassesSection language={language} />
          </div>
        </div>
        <RetreatsSection language={language} />
        <PracticeSection language={language} />
        <PhilosophySection language={language} />
      </main>
      <FooterSection language={language} />
    </div>
  );
}
