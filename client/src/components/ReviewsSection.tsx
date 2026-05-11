import { useState, type ReactElement } from 'react';
import { Play } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { siteCopy, type Language } from '@/lib/i18n';
import { videoTestimonials, type VideoTestimonial } from '@/lib/video-testimonials';

interface ReviewsSectionProps {
  language: Language;
}

interface VideoCardProps {
  item: VideoTestimonial;
  isFeatured: boolean;
  onPlay: (item: VideoTestimonial) => void;
}

const POSTER_POSITION_BY_ID: Readonly<Record<string, string>> = {
  'retreat-best-so-far': '52% 26%',
  'retreat-nature-reset': '50% 28%',
  'retreat-first-experience': '50% 40%',
  'retreat-community-trust': '50% 24%',
};

function VideoCard({ item, isFeatured, onPlay }: VideoCardProps): ReactElement {
  const hasPoster: boolean = item.posterUrl.trim().length > 0;
  const posterPosition: string = POSTER_POSITION_BY_ID[item.id] ?? '50% 28%';

  return (
    <article
      className={`group relative flex aspect-square flex-col overflow-hidden rounded-[1rem] border border-white/14 bg-black p-4 transition-colors duration-300 hover:border-white/26 ${
        isFeatured ? 'lg:p-4' : 'lg:mt-5 lg:p-4'
      }`}
    >
      <button
        type='button'
        className='relative block h-[58%] w-full shrink-0 overflow-hidden rounded-[1rem] bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/45'
        onClick={() => onPlay(item)}
        aria-label={`Play ${item.name} video review`}
      >
        {hasPoster ? (
          <img
            src={item.posterUrl}
            alt={item.name}
            loading='eager'
            decoding='async'
            style={{ objectPosition: posterPosition }}
            className='pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-70 saturate-[0.82] transition-transform duration-500 group-hover:scale-[1.03]'
          />
        ) : null}
        <div className='absolute inset-0 bg-gradient-to-t from-black/64 via-black/18 to-black/22' />
        <span
          className={`absolute left-1/2 top-1/2 inline-flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-black/20 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 ${
            isFeatured ? 'h-16 w-16' : 'h-12 w-12'
          }`}
        >
          <Play className={`${isFeatured ? 'h-6 w-6' : 'h-5 w-5'} ml-1 fill-current`} />
        </span>
      </button>

      <div className='flex min-h-0 flex-1 flex-col gap-4 px-1 pt-4'>
        <div className='flex items-baseline justify-between gap-4'>
          <h3 className={`font-semibold leading-none text-white ${isFeatured ? 'text-2xl lg:text-2xl' : 'text-xl'}`}>
            {item.name}
          </h3>
          <p className='shrink-0 text-sm text-white/50'>{item.role}</p>
        </div>

        <div className='h-px w-full bg-gradient-to-r from-white/22 via-white/10 to-transparent' />

        <p className={`leading-relaxed text-white/72 ${isFeatured ? 'text-lg' : 'text-base'} line-clamp-3`}>
          "{item.quote}"
        </p>
      </div>
    </article>
  );
}

function VideoDialog({
  item,
  isOpen,
  onOpenChange,
}: {
  item: VideoTestimonial | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}): ReactElement {
  if (!item) {
    return <></>;
  }

  const hasPoster: boolean = item.posterUrl.trim().length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='w-[calc(100%-1.5rem)] max-w-3xl overflow-hidden rounded-[28px] border-white/10 bg-[#0a0a0a] p-3 text-white sm:p-4'>
        <DialogTitle className='sr-only'>{item.name}</DialogTitle>
        <DialogDescription className='sr-only'>{item.quote}</DialogDescription>

        <div className='space-y-3 pr-6'>
          <div className='overflow-hidden rounded-[22px] border border-white/10 bg-black'>
            <div className='relative aspect-video w-full overflow-hidden bg-black'>
              <video
                key={item.id}
                autoPlay
                controls
                playsInline
                preload='metadata'
                poster={hasPoster ? item.posterUrl : undefined}
                className='h-full w-full object-contain object-center'
              >
                <source src={item.videoUrl} type='video/mp4' />
                {item.captionsUrl.trim().length > 0 ? (
                  <track kind='captions' src={item.captionsUrl} default />
                ) : null}
              </video>
            </div>
          </div>

          <h3 className='text-base font-medium leading-none text-white'>{item.name}</h3>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ReviewsSection({ language }: ReviewsSectionProps): ReactElement {
  const copy = siteCopy[language].reviews;
  const items = videoTestimonials[language];
  const featuredIndex = Math.max(
    items.findIndex((item: VideoTestimonial) => item.featured),
    0,
  );
  const [selected, setSelected] = useState<VideoTestimonial | null>(null);
  const visibleItems = [
    items[(featuredIndex - 1 + items.length) % items.length],
    items[featuredIndex],
    items[(featuredIndex + 1) % items.length],
  ];
  const isDialogOpen: boolean = selected !== null;

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setSelected(null);
    }
  };

  return (
    <section id='reviews' className='relative scroll-mt-20 overflow-hidden bg-black py-20 lg:flex lg:h-[calc(100vh-80px)] lg:min-h-[760px] lg:items-center lg:py-5'>
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:120px_120px] opacity-45' />

      <div className='container relative z-10 mx-auto flex h-full flex-col justify-center px-6'>
        <div className='mx-auto mb-12 flex max-w-4xl flex-col items-center text-center lg:mb-6'>
          <div className='mb-7 inline-flex rounded-full border border-white/15 bg-white/[0.03] px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 lg:mb-3 lg:px-4 lg:py-1.5'>
            {copy.badge}
          </div>
          <h2 className='text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-5xl xl:text-6xl'>
            {copy.title}
          </h2>
          <p className='mt-5 max-w-2xl text-base font-medium leading-relaxed text-white/58 md:text-xl lg:mt-3 lg:text-base xl:text-lg'>
            {copy.description}
          </p>
        </div>

        <div className='mx-auto grid w-full max-w-[1380px] items-center gap-5 lg:grid-cols-[0.94fr_1.08fr_0.94fr]'>
          {visibleItems.map((item: VideoTestimonial, index: number) => (
            <VideoCard
              key={item.id}
              item={item}
              isFeatured={index === 1}
              onPlay={setSelected}
            />
          ))}
        </div>
      </div>

      <VideoDialog item={selected} isOpen={isDialogOpen} onOpenChange={handleOpenChange} />
    </section>
  );
}
