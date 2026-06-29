import { useRef } from 'react';
import { Link } from 'wouter';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import { TitleOrnament } from '../ui';
import styles from './ClassesSection.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ClassesSectionProps {
  language: Language;
}

export default function ClassesSection({ language }: ClassesSectionProps) {
  const copy = landingCopy[language].classes;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track) return;
      if (window.matchMedia('(max-width: 940px)').matches) return;

      const getDistance = (): number => Math.max(0, track.scrollWidth - window.innerWidth);

      const tween = gsap.to(track, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${getDistance() * 3}`,
          pin: true,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: sectionRef },
  );

  return (
    <section className={`section ${styles.section}`} id='classes' ref={sectionRef}>
      <div className={styles.header}>
        <h2 className={styles.title}>{copy.title}</h2>
        <TitleOrnament className={styles.ornament} />
      </div>
      <div className={styles.sliderWrap}>
        <div className={styles.track} ref={trackRef}>
          {copy.cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={styles.card}
              aria-label={card.cta}
            >
              <div className={styles.cardCopy}>
                <span className={styles.cardLabel}>{card.label}</span>
                <h3>{card.title}</h3>
                <span className={styles.titleRule}></span>
                <p className={styles.cardPrice}>{card.price}</p>
                <small>{card.description}</small>
              </div>
              <span className={styles.cardCta}>{card.cta}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}