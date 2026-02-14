import { useState, useEffect, type MouseEvent } from 'react';
import { Link } from 'wouter';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { languageToggleLabel, siteCopy, type Language } from '@/lib/i18n';

interface NavbarProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function Navbar({ language, setLanguage }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = siteCopy[language].nav.links;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ru' : 'en');
  };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith('#')) {
      return;
    }

    const targetId = href.slice(1);
    const section = document.getElementById(targetId);

    if (!section) {
      return;
    }

    event.preventDefault();

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const centeredTop = sectionTop - window.innerHeight / 2 + section.offsetHeight / 2;
    window.scrollTo({
      top: Math.max(centeredTop, 0),
      behavior: 'smooth',
    });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b border-transparent ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link href="/">
          <a className="text-lg font-bold tracking-tighter flex items-center gap-2">
            <div className="w-5 h-5 bg-white rounded-full" />
            <span className="text-white">Yogermeisters</span>
          </a>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              onClick={(event) => handleNavClick(event, link.href)}
            >
              {link.name}
            </a>
          ))}
          <button
            type='button'
            onClick={toggleLanguage}
            className='h-8 rounded-full border border-white/20 bg-transparent px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10'
            aria-label={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
          >
            {languageToggleLabel[language]}
          </button>
        </div>

        {/* Mobile Toggle */}
        <div className='md:hidden flex items-center gap-2'>
          <button
            type='button'
            onClick={toggleLanguage}
            className='h-8 rounded-full border border-white/20 bg-transparent px-3 text-xs font-semibold text-white transition-colors hover:bg-white/10'
            aria-label={language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
          >
            {languageToggleLabel[language]}
          </button>
          <button
            type='button'
            className='text-foreground'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-white/10"
          >
            <div className="container mx-auto px-6 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={(event) => {
                    handleNavClick(event, link.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
