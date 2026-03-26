import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRetreatImageUrl } from '@/lib/retreat-assets';
import { formatRetreatDateLabel } from '@/lib/retreat-date';
import { siteCopy, type Language } from '@/lib/i18n';
import { openExternal } from '@/lib/open-external';
import { useRetreat } from '@/lib/retreat-queries';

interface RetreatPageProps {
  slug: string;
  language: Language;
  setLanguage: (language: Language) => void;
}

export default function RetreatPage({ slug, language, setLanguage }: RetreatPageProps) {
  const copy = siteCopy[language].tours;
  const { data, isLoading, isError } = useRetreat(slug, language);
  const retreat = data?.retreat;
  const dateLabel = retreat
    ? formatRetreatDateLabel(retreat.startDate, retreat.endDate, retreat.dateLabel, copy.dateLocale, language)
    : '';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar language={language} setLanguage={setLanguage} />

      <main className='pt-28'>
        <div className='container mx-auto px-6'>
          <Link href='/#tours'>
            <a className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-white'>
              <ArrowLeft className='h-4 w-4' />
              {copy.backToRetreats}
            </a>
          </Link>
        </div>

        {isLoading ? (
          <div className='container mx-auto px-6 py-16'>
            <div className='rounded-2xl border border-white/10 bg-card px-6 py-12 text-center text-sm text-muted-foreground'>
              Loading retreat...
            </div>
          </div>
        ) : null}

        {isError ? (
          <div className='container mx-auto px-6 py-16'>
            <div className='rounded-2xl border border-red-500/20 bg-card px-6 py-12 text-center text-sm text-white/70'>
              Unable to load this retreat right now.
            </div>
          </div>
        ) : null}

        {retreat ? (
          <>
            <section className='container mx-auto px-6 py-10'>
              <div className='overflow-hidden rounded-[2rem] border border-white/10 bg-card'>
                <img
                  src={getRetreatImageUrl(retreat.coverImage)}
                  alt={retreat.title}
                  className='h-[320px] w-full object-cover md:h-[520px]'
                />
              </div>
            </section>

            <section className='container mx-auto px-6 pb-20'>
              <div className='mx-auto max-w-4xl space-y-8'>
                <div className='space-y-5'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <Badge variant='outline' className='border-white/10 font-mono text-xs text-white/70'>
                      {retreat.price}
                    </Badge>
                    <Badge variant='outline' className='border-white/10 font-mono text-xs text-white/70'>
                      <span className='inline-flex items-center gap-2'>
                        <Calendar className='h-3 w-3' />
                        {dateLabel}
                      </span>
                    </Badge>
                  </div>

                  <div className='space-y-3'>
                    <h1 className='text-4xl font-bold tracking-tight text-white md:text-6xl'>
                      {retreat.title}
                    </h1>
                    <p className='flex items-center gap-2 text-base text-white/70 md:text-lg'>
                      <MapPin className='h-4 w-4' />
                      {retreat.location}
                    </p>
                  </div>

                  <div className='pt-2'>
                    <Button
                      className='h-11 rounded-full bg-white px-6 text-black hover:bg-white/90'
                      onClick={() => openExternal(retreat.bookingUrl)}
                    >
                      {copy.bookRetreat}
                    </Button>
                  </div>
                </div>

                <div className='space-y-6'>
                  {retreat.postBlocks.map((block) => {
                    if (block.type === 'heading') {
                      return (
                        <h2
                          key={block.id}
                          className='pt-2 text-2xl font-semibold tracking-tight text-white md:text-3xl'
                        >
                          {block.text}
                        </h2>
                      );
                    }

                    if (block.type === 'paragraph') {
                      return (
                        <p key={block.id} className='text-base leading-relaxed text-white/80 md:text-lg'>
                          {block.text}
                        </p>
                      );
                    }

                    if (block.type === 'callout') {
                      return (
                        <div
                          key={block.id}
                          className={`relative overflow-hidden ${getCalloutClasses(block.variant)}`}
                        >
                          <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:22px_22px] opacity-25' />
                          <div className='relative'>
                            <p className={getCalloutTextClasses(block.variant)}>
                              {block.text}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    if (block.type === 'countdown') {
                      return (
                        <CountdownBlock
                          key={block.id}
                          deadline={block.deadline}
                          priceCurrent={block.priceCurrent}
                          priceCompare={block.priceCompare}
                          language={language}
                        />
                      );
                    }

                    return (
                      <div key={block.id} className='overflow-hidden rounded-2xl border border-white/10 bg-card'>
                        <img
                          src={block.image ? getRetreatImageUrl(block.image) : ''}
                          alt={block.alt ?? retreat.title}
                          className='max-h-[560px] w-full object-cover'
                        />
                      </div>
                    );
                  })}
                </div>

                <div className='relative overflow-hidden rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_38%),linear-gradient(225deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-8 md:px-8 md:py-10'>
                  <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] opacity-30' />
                  <div className='pointer-events-none absolute left-3 top-2 text-[2.35rem] opacity-95 md:hidden'>
                    📿
                  </div>
                  <div className='relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between'>
                    <div className='space-y-4 text-center md:max-w-2xl md:text-left'>
                      <h2 className='mx-auto max-w-[14ch] text-[1.78rem] font-semibold leading-[1.06] tracking-tight text-white md:mx-0 md:max-w-none md:text-4xl'>
                        <span className='md:hidden'>
                          {language === 'ru' ? 'Готов присоединиться к ретриту?' : 'Ready to join this retreat?'}
                        </span>
                        <span className='hidden md:inline'>{copy.detailCtaTitle}</span>
                      </h2>
                      <p className='text-base leading-relaxed text-white/75 md:text-lg'>
                        {copy.detailCtaDescription}
                      </p>
                    </div>

                    <div className='flex justify-center md:justify-end'>
                      <Button
                        className='h-12 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_12px_40px_rgba(255,255,255,0.18)] transition-transform hover:scale-[1.02] hover:bg-white/90'
                        onClick={() => openExternal(retreat.bookingUrl)}
                      >
                        {copy.bookRetreat}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </main>

      <Footer language={language} />
    </div>
  );
}

interface CountdownBlockProps {
  deadline?: string;
  priceCurrent?: string;
  priceCompare?: string;
  language: Language;
}

function CountdownBlock({
  deadline,
  priceCurrent,
  priceCompare,
  language,
}: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline));

  useEffect(() => {
    setTimeLeft(getTimeLeft(deadline));

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return null;
  }

  const labels =
    language === 'ru'
      ? { days: 'дней', hours: 'часов', minutes: 'минут', seconds: 'секунд' }
      : { days: 'days', hours: 'hours', minutes: 'minutes', seconds: 'seconds' };

  return (
    <div className='relative overflow-hidden rounded-[1.75rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_bottom,rgba(217,119,6,0.12),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] px-4 py-5 text-center shadow-[0_22px_60px_rgba(0,0,0,0.28)] md:px-5 md:py-6'>
      <div className='pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent' />
      <div className='pointer-events-none absolute inset-x-16 bottom-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent' />

      <div className='relative flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1'>
        {priceCurrent ? (
          <span className='bg-gradient-to-b from-white to-white/78 bg-clip-text text-4xl font-semibold tracking-tight text-transparent md:text-5xl'>
            {priceCurrent}
          </span>
        ) : null}
        {priceCompare ? (
          <span className='text-lg text-white/28 line-through decoration-white/28 decoration-2 md:text-2xl'>
            {priceCompare}
          </span>
        ) : null}
      </div>

      <div className='relative mt-4 rounded-[1.4rem] bg-black/36 px-3 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_14px_36px_rgba(0,0,0,0.24)] backdrop-blur-[2px] md:px-4 md:py-4'>
        <div className='pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent' />

        <div className='mx-auto grid max-w-[30rem] grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-end text-center'>
          <CountdownValue value={timeLeft.days} />
          <CountdownSeparator />
          <CountdownValue value={timeLeft.hours} />
          <CountdownSeparator />
          <CountdownValue value={timeLeft.minutes} />
          <CountdownSeparator />
          <CountdownValue value={timeLeft.seconds} />
        </div>

        <div className='mx-auto mt-2.5 grid max-w-[30rem] grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center text-center text-[9px] uppercase tracking-[0.24em] text-white/28 md:text-[10px]'>
          <span className='block text-center'>{labels.days}</span>
          <span />
          <span className='block text-center'>{labels.hours}</span>
          <span />
          <span className='block text-center'>{labels.minutes}</span>
          <span />
          <span className='block text-center'>{labels.seconds}</span>
        </div>
      </div>
    </div>
  );
}

interface CountdownValueProps {
  value: number;
}

function CountdownValue({ value }: CountdownValueProps) {
  return (
    <div className='relative min-w-[3.2rem] text-center md:min-w-[4rem]'>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.span
          key={String(value).padStart(2, '0')}
          initial={{ opacity: 0.35, y: 10, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0.2, y: -10, filter: 'blur(2px)' }}
          transition={{ duration: 0.26, ease: 'easeOut' }}
          className='block bg-gradient-to-b from-white to-white/72 bg-clip-text text-4xl font-semibold tracking-[-0.04em] text-transparent md:text-5xl'
        >
          {String(value).padStart(2, '0')}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function CountdownSeparator() {
  return <span className='pb-1.5 px-1 text-center text-2xl font-medium text-white/22 md:text-3xl'>:</span>;
}

function getTimeLeft(
  deadline?: string,
): { days: number; hours: number; minutes: number; seconds: number } | null {
  if (!deadline) {
    return null;
  }

  const baseTarget = new Date(deadline).getTime();
  if (Number.isNaN(baseTarget)) {
    return null;
  }

  const now = Date.now();
  const diff = baseTarget - now;
  if (diff <= 0) {
    return null;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

function getCalloutClasses(variant?: string): string {
  if (variant === 'cta') {
    return 'rounded-[2rem] border border-white/15 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-6 py-8 shadow-[0_22px_70px_rgba(0,0,0,0.24)] md:px-8 md:py-10';
  }

  if (variant === 'sunrise') {
    return 'rounded-[1.9rem] border border-orange-200/20 bg-[radial-gradient(circle_at_top,rgba(253,186,116,0.34),transparent_30%),linear-gradient(145deg,rgba(120,53,15,0.5),rgba(251,113,133,0.2)_46%,rgba(15,23,42,0.42))] px-6 py-6 shadow-[0_20px_64px_rgba(120,53,15,0.26)] md:px-8 md:py-7';
  }

  if (variant === 'lagoon') {
    return 'rounded-[1.9rem] border border-cyan-200/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.28),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.24),transparent_24%),linear-gradient(145deg,rgba(8,47,73,0.62),rgba(15,118,110,0.32)_48%,rgba(15,23,42,0.38))] px-6 py-6 shadow-[0_20px_64px_rgba(8,47,73,0.26)] md:px-8 md:py-7';
  }

  if (variant === 'outline') {
    return 'rounded-[1.75rem] border border-white/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-5 py-5 shadow-[0_16px_50px_rgba(0,0,0,0.16)] ring-1 ring-inset ring-white/8 md:px-6';
  }

  return 'rounded-[1.75rem] border border-white/15 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] px-5 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] md:px-6';
}

function getCalloutTextClasses(variant?: string): string {
  if (variant === 'cta') {
    return 'mx-auto max-w-2xl text-center text-3xl font-semibold tracking-tight text-white md:text-4xl';
  }

  if (variant === 'sunrise') {
    return 'mx-auto max-w-2xl text-center text-base font-semibold leading-relaxed text-orange-50 md:text-[1.08rem]';
  }

  if (variant === 'lagoon') {
    return 'mx-auto max-w-2xl text-center text-base font-semibold leading-relaxed text-cyan-50 md:text-[1.08rem]';
  }

  if (variant === 'outline') {
    return 'mx-auto max-w-2xl text-center text-base leading-relaxed text-white/90 md:text-[1.02rem]';
  }

  return 'mx-auto max-w-2xl text-center text-base font-medium leading-relaxed text-white/92 md:text-[1.05rem]';
}
