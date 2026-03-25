import { Link } from 'wouter';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getRetreatAssetUrl } from '@/lib/retreat-assets';
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
                  src={getRetreatAssetUrl(retreat.coverAssetKey)}
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
                    if (block.type === 'paragraph') {
                      return (
                        <p key={block.id} className='text-base leading-relaxed text-white/80 md:text-lg'>
                          {block.text}
                        </p>
                      );
                    }

                    return (
                      <div key={block.id} className='overflow-hidden rounded-2xl border border-white/10 bg-card'>
                        <img
                          src={block.assetKey ? getRetreatAssetUrl(block.assetKey) : ''}
                          alt={block.alt ?? retreat.title}
                          className='max-h-[560px] w-full object-cover'
                        />
                      </div>
                    );
                  })}
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

