import YogaLandingV2 from '@/components/landing-v2/YogaLandingV2';
import type { Language } from '@/lib/i18n';

interface HomeProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function Home({ language, setLanguage }: HomeProps) {
  return <YogaLandingV2 language={language} setLanguage={setLanguage} />;
}
