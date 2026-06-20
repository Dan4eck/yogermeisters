import type { LucideIcon } from "lucide-react";

export type AnchorHref = `#${string}` | `mailto:${string}`;

export type NavItem = {
  label: string;
  href: `#${string}`;
};

export type HeroActionTone = "dark" | "gold" | "sand";

export type HeroAction = {
  title: string;
  text: string;
  href: `#${string}`;
  icon: LucideIcon;
  tone: HeroActionTone;
};

export type SocialLink = {
  label: string;
  href: AnchorHref;
  icon: LucideIcon;
};

export type RetreatCard = {
  number: `${number}${number}`;
  title: string;
  icon: LucideIcon;
  meta: readonly [date: string, season: string, theme: string];
  seasonIcon: LucideIcon;
  description: readonly string[];
  image: string;
};

export type ClassCard = {
  placement: "left" | "right";
  label: string;
  title: string;
  price: string;
  description: string;
  cta: string;
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
