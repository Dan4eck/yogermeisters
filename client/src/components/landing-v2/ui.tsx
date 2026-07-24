import type { ReactNode } from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Link } from 'wouter';

import type { AnchorHref } from './types';
import VajraIcon from './VajraIcon';

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
  const content = (
    <>
      {children}
      {Icon ? <Icon aria-hidden='true' /> : null}
    </>
  );
  const buttonClassName = `button button-dark arrow-button${className ? ` ${className}` : ''}`;

  if (href.startsWith('/')) {
    return (
      <Link className={buttonClassName} href={href}>
        {content}
      </Link>
    );
  }

  return (
    <a className={buttonClassName} href={href}>
      {content}
    </a>
  );
}

export function TitleOrnament({ className }: OrnamentProps) {
  return (
    <div className={className} aria-hidden='true'>
      <span></span>
      <VajraIcon />
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
