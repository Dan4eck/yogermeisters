import { useCallback, useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import type { Language } from '@/lib/i18n';

gsap.registerPlugin(useGSAP, ScrollTrigger);

type SceneName = 'hero' | 'about' | 'classes';

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
    const camera = root.querySelector<HTMLElement>('[data-hero-camera]');
    const heroCopy = root.querySelector<HTMLElement>('[data-hero-copy]');
    const heroBottom = root.querySelector<HTMLElement>('[data-hero-bottom]');
    const heroShade = root.querySelector<HTMLElement>('[data-hero-shade]');
    const aboutCopy = root.querySelector<HTMLElement>('[data-about-copy]');
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
      mobile: '(max-width: 999px)',
      reduced: '(prefers-reduced-motion: reduce)',
    }, (context: gsap.Context): (() => void) | void => {
      const { desktop, mobile, reduced } = context.conditions as {
        desktop: boolean;
        mobile: boolean;
        reduced: boolean;
      };

      gsap.set([
        ...Object.values(scenes), camera, heroCopy, heroBottom, heroShade, aboutCopy,
        ...aboutText, portrait, classPhoto, classHeading, ...Array.from(classRows),
      ], { clearProps: 'transform,opacity,visibility,boxShadow' });

      if (reduced || mobile) {
        restoreScenes();
        return restoreScenes;
      }

      if (!desktop) {
        gsap.set(Object.values(scenes), { autoAlpha: 1 });
        gsap.set(camera, { scale: 1 });
        gsap.set(heroShade, { autoAlpha: 1 });
        gsap.fromTo([camera, heroCopy, heroBottom], { x: 0, y: 0, autoAlpha: 1 }, {
          x: (): number => -stage.clientWidth * 0.12,
          y: -24,
          autoAlpha: 0,
          ease: 'none',
          scrollTrigger: { trigger: scenes.hero, start: '20% top', end: 'bottom 35%', scrub: 0.4 },
        });
        gsap.fromTo(aboutCopy, { x: 48, y: 24, autoAlpha: 0 }, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          ease: 'power2.out',
          scrollTrigger: { trigger: scenes.about, start: 'top 85%', end: 'top 25%', scrub: 0.35 },
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
      const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });

      timeline
        .addLabel('hero', 0)
        .addLabel('heroExit', 1.05)
        .to(scenes.hero, {
          xPercent: -100,
          duration: 1.4,
          ease: 'power2.inOut',
        }, 'heroExit')
        .to(scenes.hero, { autoAlpha: 0, duration: 0.6 }, 'heroExit+=0.8')
        .addLabel('aboutEnter', 2.45)
        .fromTo(scenes.about, { xPercent: 100, autoAlpha: 1 }, {
          xPercent: 0, autoAlpha: 1, duration: 1.4, ease: 'power2.inOut',
        }, 'heroExit')
        .fromTo(aboutText, { x: 60, y: 24, autoAlpha: 0 }, {
          x: 0, y: 0, autoAlpha: 1, duration: 0.95, stagger: 0.045, ease: 'power3.out',
        }, 'heroExit+=0.65')
        .fromTo(portrait, { x: 80, y: 30, autoAlpha: 0 }, {
          x: 0, y: 0, autoAlpha: 1, duration: 1.15, ease: 'power3.out',
        }, 'heroExit+=0.55');

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
        setActiveScene(time < timeline.labels.aboutEnter ? 'hero' : time < 8.1 ? 'about' : 'classes');
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
