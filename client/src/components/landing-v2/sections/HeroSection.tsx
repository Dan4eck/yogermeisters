import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import { ButtonLink } from '../ui';
import styles from './HeroSection.module.css';

gsap.registerPlugin(useGSAP);

const backgroundSrc = '/assets/landing-v2/cutouts/hero-bg.png';
const personSrc = '/assets/landing-v2/cutouts/hero-person-no-bg.png';

interface HeroSectionProps {
  language: Language;
}

export default function HeroSection({ language }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const copy = landingCopy[language].hero;
  const [titleTop, titleBottom] = copy.titleLines;

  useGSAP(
    () => {
      const root = sectionRef.current;

      if (!root) {
        return;
      }

      const background = root.querySelector<HTMLElement>('[data-hero-bg]');
      const titleMasks = root.querySelectorAll<HTMLElement>('[data-hero-mask]');
      const titleLines = root.querySelectorAll<HTMLElement>('[data-hero-line]');
      const figure = root.querySelector<HTMLElement>('[data-hero-figure]');
      const figureFloat = root.querySelector<HTMLElement>('[data-hero-figure-float]');
      const figureImage = root.querySelector<HTMLElement>('[data-hero-figure-image]');
      const introItems = root.querySelectorAll<HTMLElement>('[data-hero-intro]');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!background || !figure || !figureFloat || !figureImage || titleLines.length === 0) {
        return;
      }

      if (reduceMotion) {
        gsap.set(figure, { autoAlpha: 1, xPercent: -50, yPercent: -50, clearProps: 'filter' });
        gsap.set(figureFloat, { clearProps: 'transform' });
        gsap.set(figureImage, { clearProps: 'clipPath,filter,transform' });
        gsap.set([background, titleMasks, titleLines, introItems], {
          autoAlpha: 1,
          clearProps: 'transform,filter,clipPath',
        });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } });

      gsap.set(figure, {
        xPercent: -50,
        yPercent: -50,
        transformOrigin: '50% 58%',
      });
      gsap.set(figureFloat, { transformOrigin: '50% 58%' });
      gsap.set(titleMasks, { clipPath: 'inset(0% 100% 0% 0%)' });
      gsap.set(titleLines, { transformOrigin: '50% 55%', transformPerspective: 700 });

      timeline
        .addLabel('arrival', 0)
        .fromTo(
          background,
          { autoAlpha: 0, scale: 1.16, y: 34, filter: 'blur(22px) saturate(0.82)' },
          {
            autoAlpha: 1,
            scale: 1,
            y: 0,
            filter: 'blur(0px) saturate(1)',
            duration: 1.7,
            ease: 'power2.out',
          },
          'arrival',
        )
        .fromTo(
          titleMasks,
          { clipPath: 'inset(0% 100% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.18,
            stagger: 0.11,
            ease: 'expo.inOut',
          },
          'arrival+=0.22',
        )
        .fromTo(
          titleLines,
          (index: number) => ({
            autoAlpha: 0,
            xPercent: index === 0 ? -8 : 8,
            yPercent: index === 0 ? 16 : -8,
            skewX: index === 0 ? -8 : 8,
            scaleX: 0.92,
            scaleY: 1.12,
            rotationX: index === 0 ? 10 : -8,
          }),
          {
            autoAlpha: 1,
            xPercent: 0,
            yPercent: 0,
            skewX: 0,
            scaleX: 1,
            scaleY: 1,
            rotationX: 0,
            duration: 1.26,
            stagger: 0.12,
            ease: 'expo.out',
          },
          'arrival+=0.24',
        )
        .fromTo(
          figure,
          {
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50,
            y: 96,
            scale: 0.86,
            rotation: -3.5,
            filter: 'blur(16px) saturate(0.76)',
          },
          {
            autoAlpha: 1,
            xPercent: -50,
            yPercent: -50,
            y: 0,
            scale: 1,
            rotation: 0,
            filter: 'blur(0px) saturate(1)',
            duration: 1.56,
            ease: 'expo.out',
          },
          'arrival+=0.52',
        )
        .fromTo(
          figureImage,
          { clipPath: 'inset(18% 18% 24% 18% round 34px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 1.28, ease: 'expo.inOut' },
          'arrival+=0.5',
        )
        .fromTo(
          introItems,
          { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.92, stagger: 0.09 },
          'arrival+=0.94',
        )
        .to(
          titleLines,
          {
            keyframes: [
              { y: -7, skewX: -1.15, duration: 0.28, ease: 'power2.out' },
              { y: 0, skewX: 0, duration: 0.54, ease: 'elastic.out(1, 0.55)' },
            ],
            stagger: 0.08,
          },
          'arrival+=1.14',
        );

      gsap.to(titleLines, {
        y: (index: number) => (index === 0 ? -5 : 5),
        duration: 5.6,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 2.15,
        stagger: 0.2,
      });

      gsap.to(background, {
        scale: 1.035,
        x: -5,
        y: -4,
        duration: 12,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: 0.85,
      });

      const isFinePointer = window.matchMedia('(pointer: fine)').matches;

      if (!isFinePointer) {
        return;
      }

      const figureXTo = gsap.quickTo(figure, 'x', { duration: 1.05, ease: 'power3.out' });
      const figureYTo = gsap.quickTo(figure, 'y', { duration: 1.05, ease: 'power3.out' });
      const titleXTo = gsap.quickTo(titleLines, 'x', { duration: 1.15, ease: 'power3.out' });
      const titleYTo = gsap.quickTo(titleLines, 'y', { duration: 1.15, ease: 'power3.out' });
      const backgroundXTo = gsap.quickTo(background, 'x', { duration: 1.4, ease: 'power3.out' });
      const backgroundYTo = gsap.quickTo(background, 'y', { duration: 1.4, ease: 'power3.out' });

      const handlePointerMove = (event: PointerEvent): void => {
        const rect = root.getBoundingClientRect();
        const xRatio = (event.clientX - rect.left) / rect.width - 0.5;
        const yRatio = (event.clientY - rect.top) / rect.height - 0.5;

        figureXTo(xRatio * 68);
        figureYTo(yRatio * 52);
        titleXTo(xRatio * -10);
        titleYTo(yRatio * -5);
        backgroundXTo(xRatio * 7);
        backgroundYTo(yRatio * 4);
      };

      const handlePointerLeave = (): void => {
        figureXTo(0);
        figureYTo(0);
        titleXTo(0);
        titleYTo(0);
        backgroundXTo(0);
        backgroundYTo(0);
      };

      root.addEventListener('pointermove', handlePointerMove);
      root.addEventListener('pointerleave', handlePointerLeave);

      return () => {
        root.removeEventListener('pointermove', handlePointerMove);
        root.removeEventListener('pointerleave', handlePointerLeave);
      };
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className={`section ${styles.section}`} id='hero'>
      <div className={styles.background} data-hero-bg>
        <img src={backgroundSrc} alt='' aria-hidden='true' decoding='async' />
      </div>

      <div className={styles.heroBrand} data-hero-intro>
        yogermeisters.
      </div>

      <h1 className={styles.title} aria-label={`${titleTop} ${titleBottom}`}>
        <span className={styles.titleMask} data-hero-mask>
          <span data-hero-line>{titleTop}</span>
        </span>
        <span className={`${styles.titleMask} ${styles.titleAccent}`} data-hero-mask>
          <span data-hero-line>{titleBottom}</span>
        </span>
      </h1>

      <div className={styles.figure} data-hero-figure>
        <div className={styles.figureFloat} data-hero-figure-float>
          <img src={personSrc} alt={copy.figureAlt} decoding='async' fetchPriority='high' data-hero-figure-image />
        </div>
      </div>

      <p className={styles.posterLine} data-hero-intro>
        {copy.posterLine}
      </p>

      <div className={styles.actions} aria-label={copy.actionsLabel} data-hero-intro>
        <ButtonLink className={styles.retreatButton} href='#retreats'>
          {copy.primaryCta}
        </ButtonLink>
        <ButtonLink className={styles.classButton} href='#classes'>
          {copy.secondaryCta}
        </ButtonLink>
      </div>

      <footer className={styles.socials} aria-label={copy.socialsLabel} data-hero-intro>
        {copy.socials.map(({ label, href, icon: Icon }) => (
          <a href={href} aria-label={label} key={label}>
            <Icon aria-hidden='true' />
          </a>
        ))}
      </footer>
    </section>
  );
}
