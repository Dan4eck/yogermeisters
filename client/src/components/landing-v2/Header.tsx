import { useState, type MouseEvent } from 'react';
import { UserRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import { languageToggleLabel, type Language } from '@/lib/i18n';
import { scrollToAnchor } from '@/lib/scroll-to-anchor';
import { landingCopy } from './content';
import styles from './Header.module.css';
import { useActiveSection } from './useActiveSection';

interface HeaderProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function Header({ language, setLanguage }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeSection = useActiveSection();
  const [location, navigate] = useLocation();
  const isHomePage = location === '/';
  const copy = landingCopy[language];

  const toggleLanguage = (): void => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const getAnchorHref = (href: `#${string}`): string => (isHomePage ? href : `/${href}`);

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, href: `#${string}`): void => {
    event.preventDefault();
    setIsOpen(false);

    if (isHomePage) {
      if (scrollToAnchor(href)) {
        window.history.replaceState(null, '', href);
      }
      return;
    }

    navigate('/');
    window.setTimeout(() => {
      if (scrollToAnchor(href)) {
        window.history.replaceState(null, '', href);
      }
    }, 120);
  };

  return (
    <header className={`${styles.siteHeader}${isOpen ? ` ${styles.navOpen}` : ''}`} aria-label={copy.header.navigationLabel}>
      <a
        className={styles.brand}
        href={getAnchorHref('#hero')}
        aria-label={copy.header.homeLabel}
        onClick={(event) => handleAnchorClick(event, '#hero')}
      >
        <img src='/assets/brand/yogermeisters-logo-black-128.png' alt='' />
      </a>
      <nav className={styles.mainNav}>
        {copy.navItems.map(({ label, href }) => (
          <a
            key={href}
            className={isHomePage && activeSection === href.slice(1) ? styles.active : undefined}
            href={getAnchorHref(href)}
            onClick={(event) => handleAnchorClick(event, href)}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className={styles.headerActions}>
        <div className={styles.mobileSocials} aria-label={copy.hero.socialsLabel}>
          {copy.hero.socials.map(({ label, href, icon: Icon }) => (
            <a href={href} aria-label={label} key={label} target='_blank' rel='noreferrer'>
              <Icon aria-hidden='true' />
            </a>
          ))}
        </div>
        <Link
          href='/cabinet'
          className={styles.cabinetLink}
          aria-label={language === 'ru' ? 'Личный кабинет' : 'Student cabinet'}
        >
          <UserRound aria-hidden='true' />
          <span>{language === 'ru' ? 'Кабинет' : 'Cabinet'}</span>
        </Link>
        <button
          type='button'
          className={styles.languageButton}
          onClick={toggleLanguage}
          aria-label={copy.header.switchLanguageLabel}
        >
          {languageToggleLabel[language]}
        </button>
      </div>
      <button
        className={styles.menuButton}
        type='button'
        aria-label={isOpen ? copy.header.closeMenuLabel : copy.header.openMenuLabel}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
