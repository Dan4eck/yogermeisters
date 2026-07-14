import type { SVGProps } from 'react';

const vajraSrc = '/assets/landing-v2/icons/vajra.png';

export default function VajraIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='82 34 89 181' {...props}>
      <image href={vajraSrc} x='0' y='0' width='250' height='250' />
    </svg>
  );
}
