import type { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export type AnchorHref = `#${string}` | `/${string}` | `mailto:${string}` | `https://${string}`;

export type NavItem = {
  label: string;
  href: `#${string}`;
};

export type HeroActionTone = "dark" | "gold" | "sand";

export type HeroAction = {
  title: string;
  text: string;
  href: `#${string}`;
  icon: IconComponent;
  tone: HeroActionTone;
};

export type SocialLink = {
  label: string;
  href: AnchorHref;
  icon: IconComponent;
};

export type RetreatCard = {
  number: `${number}${number}`;
  title: string;
  icon: IconComponent;
  meta: readonly [date: string, season: string, theme: string];
  seasonIcon: IconComponent;
  description: readonly string[];
  image: string;
};

export type ClassCard = {
  label: string;
  title: string;
  price: string;
  description: string;
  cta: string;
  href: AnchorHref;
};

export type PracticeBenefit = {
  accent: string;
  title: string;
  text: string;
};

export type PracticeVideo = {
  src: string;
  title: string;
};
