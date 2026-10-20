import { useCallback, useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Language } from '@/lib/i18n';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type SceneName = 'hero' | 'about' | 'classes';
type ScatterPosition = readonly [number, number, number, number];

const SCATTER_POSITIONS: readonly ScatterPosition[] = [
  [0.04, 0.07, 0.8, -7],
  [0.73, 0.005, 1, -13],
  [1.015, 0.22, 1, 11],
  [-0.04, 0.55, 0.85, 11],
  [0.4, -0.24, 0.9, -9],
  [1.04, 0.63, 0.95, -9],
  [0.39, 1.2, 0.85, 13],
  [0.92, 1.015, 1, 15],
  [0.75, -0.12, 0.8, 8],
];

export function useIntroMotion(
  rootRef: RefObject<HTMLDivElement | null>,
  language: Language,
): (id: string, behavior?: ScrollBehavior) => boolean {
  const triggerRef = useRef<ScrollTrigger | null>(null);

  const scrollToSection = useCallback((id: string, behavior: ScrollBehavior = 'smooth'): boolean => {
    const root = rootRef.current;
    const target = root?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);

    if (!target) {
      return false;
    }

    const trigger = triggerRef.current;
    const progress: Record<string, number> = { home: 0, about: 0.5, classes: 0.95 };
    const headerOffset = id === 'home' || id === 'retreats'
      ? 0
      : (root?.querySelector('header')?.clientHeight ?? 88) + 12;
    const top = trigger && id in progress
      ? trigger.start + (trigger.end - trigger.start) * progress[id]
      : target.getBoundingClientRect().top + window.scrollY - headerOffset;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : behavior });
    window.requestAnimationFrame((): void => ScrollTrigger.update());
    return true;
  }, [rootRef]);

  useGSAP((): (() => void) | void => {
    const root = rootRef.current;
    const intro = root?.querySelector<HTMLElement>('[data-intro]');
    const stage = root?.querySelector<HTMLElement>('[data-intro-stage]');

    if (!root || !intro || !stage) {
      return;
    }

    const scenes = {
      hero: root.querySelector<HTMLElement>('[data-v3-scene="hero"]')!,
      about: root.querySelector<HTMLElement>('[data-v3-scene="about"]')!,
      classes: root.querySelector<HTMLElement>('[data-v3-scene="classes"]')!,
    };
    const tiles = Array.from(root.querySelectorAll<HTMLElement>('[data-hero-tile]'));
    const camera = root.querySelector<HTMLElement>('[data-hero-camera]');
    const heroCopy = root.querySelector<HTMLElement>('[data-hero-copy]');
    const heroBottom = root.querySelector<HTMLElement>('[data-hero-bottom]');
    const heroShade = root.querySelector<HTMLElement>('[data-hero-shade]');
    const aboutText = Array.from(root.querySelectorAll<HTMLElement>('[data-about-text]'));
    const portrait = root.querySelector<HTMLElement>('[data-about-portrait]');
    const classPhoto = root.querySelector<HTMLElement>('[data-classes-photo]');
    const classHeading = root.querySelector<HTMLElement>('[data-classes-heading]');
    const classRows = root.querySelectorAll<HTMLElement>('[data-class-row]');
    const media = gsap.matchMedia();
    let disposed = false;

    const restoreScenes = (): void => {
      delete intro.dataset.motion;
      delete root.dataset.activeScene;
      Object.values(scenes).forEach((scene: HTMLElement): void => {
        scene.inert = false;
        scene.removeAttribute('aria-hidden');
      });
      triggerRef.current = null;
    };

    media.add({
      all: 'all',
      desktop: '(min-width: 1000px) and (min-height: 680px)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, (context: gsap.Context): (() => void) | void => {
      const { desktop, reduced } = context.conditions as { desktop: boolean; reduced: boolean };

      gsap.set([
        ...Object.values(scenes), ...tiles, camera, heroCopy, heroBottom, heroShade,
        ...aboutText, portrait, classPhoto, classHeading, ...Array.from(classRows),
        ...Array.from(root.querySelectorAll('[data-about-decor]')),
      ], { clearProps: 'transform,opacity,visibility,boxShadow' });

      if (reduced) {
        return restoreScenes;
      }

      if (!desktop) {
        gsap.set(Object.values(scenes), { autoAlpha: 1 });
        gsap.set(camera, { scale: 1 });
        gsap.set(heroShade, { autoAlpha: 1 });
        tiles.forEach((tile: HTMLElement, index: number): void => {
          gsap.fromTo(tile, { x: 0, y: 0, rotation: 0, scale: 1, autoAlpha: 1 }, {
            x: (): number => (tile.offsetLeft + tile.offsetWidth / 2 - stage.clientWidth / 2) * 0.4,
            y: (): number => -window.innerHeight * (0.13 + (index % 4) * 0.025),
            rotation: index % 2 ? 10 : -10,
            scale: 0.88,
            ease: 'none',
            scrollTrigger: { trigger: scenes.hero, start: 'top top', end: 'bottom 18%', scrub: 0.5 },
          });
        });
        gsap.fromTo([heroCopy, heroBottom], { y: 0, scale: 1, autoAlpha: 1 }, {
          y: -55,
          autoAlpha: 0,
          scrollTrigger: { trigger: scenes.hero, start: '30% top', end: 'bottom 35%', scrub: 0.4 },
        });
        gsap.to(root.querySelectorAll('[data-about-decor]'), {
          y: -160,
          rotation: (index: number): number => index % 2 ? 22 : -22,
          autoAlpha: 0,
          scrollTrigger: { trigger: scenes.about, start: 'bottom 80%', end: 'bottom 15%', scrub: 0.4 },
        });
        gsap.from([classHeading, ...Array.from(classRows)], {
          y: 35,
          opacity: 0,
          duration: 0.65,
          stagger: 0.06,
          scrollTrigger: { trigger: classHeading, start: 'top 92%', once: true },
        });
        return restoreScenes;
      }

      intro.dataset.motion = 'on';
      const setActiveScene = (name: SceneName): void => {
        if (root.dataset.activeScene === name) {
          return;
        }
        root.dataset.activeScene = name;
        (Object.entries(scenes) as [SceneName, HTMLElement][]).forEach(([key, scene]): void => {
          scene.inert = key !== name;
          scene.setAttribute('aria-hidden', String(key !== name));
        });
      };
      setActiveScene('hero');

      gsap.set([scenes.about, scenes.classes], { autoAlpha: 0 });
      gsap.set(tiles, { transformOrigin: 'center center', force3D: true });
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });

      timeline
        .addLabel('hero', 0)
        .to(camera, { scale: 1.17, duration: 1.1 }, 1.1)
        .to(heroCopy, { autoAlpha: 0, scale: 1.08, y: -35, duration: 0.85 }, 1.2)
        .to(heroBottom, { autoAlpha: 0, y: 20, duration: 0.65 }, 1.25)
        .to(heroShade, { autoAlpha: 0, duration: 0.7 }, 1.7)
        .to(scenes.about, { autoAlpha: 1, duration: 1.2 }, 2.05)
        .fromTo(aboutText, { y: 60, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.045,
        }, 2.3)
        .fromTo(portrait, { y: 75, scale: 0.88, autoAlpha: 0 }, {
          y: 0, scale: 1, autoAlpha: 1, duration: 1.25,
        }, 2.25)
        .to(camera, { scale: 1, duration: 1.45 }, 2.1);

      tiles.forEach((tile: HTMLElement, index: number): void => {
        const [centerX, centerY, size, rotation] = SCATTER_POSITIONS[index % SCATTER_POSITIONS.length];
        const scale = (): number => Math.min(
          stage.clientWidth * 0.21 / tile.offsetWidth,
          stage.clientHeight * 0.26 / tile.offsetHeight,
        ) * size;
        const x = (): number => stage.clientWidth * centerX - tile.offsetLeft - tile.offsetWidth / 2;
        const y = (): number => stage.clientHeight * centerY - tile.offsetTop - tile.offsetHeight / 2;

        timeline.to(tile, {
          x, y, scale, rotation, duration: 1.55, ease: 'power2.inOut',
          boxShadow: '0 16px 28px rgba(23,25,24,0.18)',
        }, 1.85 + (index % 4) * 0.055);
        timeline.to(tile, {
          x: (): number => x() + (centerX - 0.5) * stage.clientWidth * 1.9,
          y: (): number => y() + (centerY - 0.5) * stage.clientHeight * 1.8,
          rotation: rotation * 2.7,
          scale: (): number => scale() * 0.7,
          autoAlpha: 0,
          duration: 1.35,
          ease: 'power2.in',
        }, 6.65 + (index % 3) * 0.07);
      });

      timeline
        .addLabel('about', 4.9)
        .to(aboutText, {
          x: (index: number): number => -stage.clientWidth * (0.32 + index * 0.055),
          y: (index: number): number => (index % 2 ? -1 : 1) * stage.clientHeight * 0.16,
          rotation: -7,
          autoAlpha: 0,
          stagger: 0.065,
          duration: 1.1,
          ease: 'power2.in',
        }, 6.9)
        .to(portrait, {
          x: (): number => stage.clientWidth * 0.73,
          y: (): number => -stage.clientHeight * 0.24,
          rotation: 20,
          autoAlpha: 0,
          duration: 1.25,
          ease: 'power2.in',
        }, 6.95)
        .to(scenes.about, { autoAlpha: 0, duration: 0.5 }, 7.9)
        .to(scenes.classes, { autoAlpha: 1, duration: 0.85 }, 7.65)
        .fromTo(classPhoto, { xPercent: -15, scale: 1.1 }, {
          xPercent: 0, scale: 1, duration: 1.3,
        }, 7.7)
        .fromTo(classHeading, { y: 65, autoAlpha: 0 }, {
          y: 0, autoAlpha: 1, duration: 0.85,
        }, 7.85)
        .fromTo(classRows, { x: 75, autoAlpha: 0 }, {
          x: 0, autoAlpha: 1, stagger: 0.09, duration: 0.8,
        }, 8.05)
        .addLabel('classes', 9.4)
        .to({}, { duration: 0.65 }, 9.35);

      timeline.eventCallback('onUpdate', (): void => {
        const time = timeline.time();
        setActiveScene(time < 2.8 ? 'hero' : time < 8.1 ? 'about' : 'classes');
      });

      triggerRef.current = ScrollTrigger.create({
        id: 'homepage-v3-intro',
        trigger: intro,
        pin: stage,
        animation: timeline,
        start: 'top top',
        end: (): string => `+=${Math.round(window.innerHeight * 4.25)}`,
        scrub: 0.55,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });

      return restoreScenes;
    });

    const refresh = (): void => {
      if (!disposed) {
        ScrollTrigger.refresh();
      }
    };
    void document.fonts.ready.then(refresh);
    const images = Array.from(intro.querySelectorAll('img'));
    images.forEach((image: HTMLImageElement): void => {
      if (!image.complete) {
        image.addEventListener('load', refresh, { once: true });
      }
    });

    return (): void => {
      disposed = true;
      images.forEach((image: HTMLImageElement): void => image.removeEventListener('load', refresh));
      media.revert();
      restoreScenes();
    };
  }, { scope: rootRef, dependencies: [language], revertOnUpdate: true });

  return scrollToSection;
}
