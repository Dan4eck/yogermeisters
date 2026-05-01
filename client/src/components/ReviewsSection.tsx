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

function VideoCard({
  item,
  onPlay,
}: {
  item: VideoTestimonial;
  onPlay: (item: VideoTestimonial) => void;
}): ReactElement {
  const hasVideo: boolean = item.videoUrl.trim().length > 0;
  const hasPoster: boolean = item.posterUrl.trim().length > 0;

  return (
    <button
      type='button'
      className='group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] text-left transition-colors duration-300 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
      onClick={() => onPlay(item)}
      aria-label={`Play ${item.name} video review`}
    >
      <div className='relative aspect-square overflow-hidden bg-black'>
        {hasVideo ? (
          <video
            muted
            playsInline
            preload='metadata'
            poster={hasPoster ? item.posterUrl : undefined}
            className='pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-90 transition-transform duration-500 group-hover:scale-[1.03]'
          >
            <source src={item.videoUrl} type='video/mp4' />
          </video>
        ) : hasPoster ? (
          <img
            src={item.posterUrl}
            alt={item.name}
            loading='lazy'
            className='absolute inset-0 h-full w-full object-cover object-center opacity-90 transition-transform duration-500 group-hover:scale-[1.03]'
          />
        ) : null}
        <div className='absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/10' />
        <div className='absolute inset-0 flex items-center justify-center'>
          <span className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-[0_18px_50px_rgba(0,0,0,0.34)] transition-transform duration-300 group-hover:scale-105'>
            <Play className='ml-1 h-5 w-5 fill-current' />
          </span>
        </div>
        <div className='absolute inset-x-0 bottom-0 p-4'>
          <div className='flex items-center justify-between gap-3'>
            <h3 className='text-base font-medium leading-none text-white'>{item.name}</h3>
            <div className='h-px flex-1 bg-white/18' />
          </div>
        </div>
      </div>
    </button>
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
            <div className='relative aspect-video w-full overflow-hidden bg-black sm:aspect-[16/9]'>
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
  const [selected, setSelected] = useState<VideoTestimonial | null>(null);
  const isDialogOpen: boolean = selected !== null;

  const handleOpenChange = (isOpen: boolean): void => {
    if (!isOpen) {
      setSelected(null);
    }
  };

  return (
    <section id='reviews' className='relative overflow-hidden border-t border-white/5 bg-background py-16 lg:py-20'>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_60%)]' />

      <div className='container relative z-10 mx-auto px-6'>
        <div className='mb-8'>
          <h2 className='text-3xl font-bold tracking-tight text-white md:text-5xl'>
            {copy.title}
          </h2>
        </div>

        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {items.map((item: VideoTestimonial) => (
            <VideoCard key={item.id} item={item} onPlay={setSelected} />
          ))}
        </div>
      </div>

      <VideoDialog item={selected} isOpen={isDialogOpen} onOpenChange={handleOpenChange} />
    </section>
  );
}
