import type { ReactElement } from 'react';

import type { Language } from '@/lib/i18n';
import HomepageV3 from '../../../homepage-v3/HomepageV3';

interface HomeProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function Home({ language, setLanguage }: HomeProps): ReactElement {
  return <HomepageV3 language={language} setLanguage={setLanguage} />;
}
