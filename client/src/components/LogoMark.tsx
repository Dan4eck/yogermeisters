import type { JSX } from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps {
  readonly className?: string;
  readonly variant?: 'white' | 'black';
  readonly alt?: string;
}

const logoSources: Record<NonNullable<LogoMarkProps['variant']>, string> = {
  white: '/assets/brand/yogermeisters-logo-white-transparent.png',
  black: '/assets/brand/yogermeisters-logo-black-transparent.png',
};

export default function LogoMark({ className, variant = 'white', alt = '' }: LogoMarkProps): JSX.Element {
  return (
    <img
      src={logoSources[variant]}
      alt={alt}
      className={cn('block shrink-0 object-contain', className)}
      width={256}
      height={256}
      loading='eager'
      decoding='async'
    />
  );
}
