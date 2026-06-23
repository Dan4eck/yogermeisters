import { ArrowRight, Flower2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { AnchorHref } from './types';

type ButtonLinkProps = {
  children: ReactNode;
  className?: string;
  href: AnchorHref;
  icon?: LucideIcon | null;
};

type OrnamentProps = {
  className: string;
};

type MultilineTextProps = {
  lines: readonly string[];
};

export function ButtonLink({ children, className = '', href, icon: Icon = ArrowRight }: ButtonLinkProps) {
  return (
    <a className={`button button-dark arrow-button${className ? ` ${className}` : ''}`} href={href}>
      {children}
      {Icon ? <Icon aria-hidden='true' /> : null}
    </a>
  );
}

export function TitleOrnament({ className }: OrnamentProps) {
  return (
    <div className={className} aria-hidden='true'>
      <span></span>
      <Flower2 />
      <span></span>
    </div>
  );
}

export function MultilineText({ lines }: MultilineTextProps) {
  return lines.map((line, index) => (
    <span key={line}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}
