import { useEffect, useState, type ReactElement } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

import { cn } from '@/lib/utils';
import { siteCopy, type Language } from '@/lib/i18n';
import { videoTestimonials, type VideoTestimonial } from '@/lib/video-testimonials';

interface ReviewsSectionProps {
  language: Language;
}

function VideoPreview({
  item,
  isSelected,
  onSelect,
}: {
  item: VideoTestimonial;
  isSelected: boolean;
  onSelect: (item: VideoTestimonial) => void;
}): ReactElement {
  const hasPoster: boolean = item.posterUrl.trim().length > 0;

  return (
    <button
      type='button'
      onClick={() => onSelect(item)}
      className={cn(
        'group flex w-full items-start gap-3 rounded-[22px] border p-2.5 text-left transition-all duration-300',
        isSelected
          ? 'border-white/20 bg-white/[0.08] shadow-[0_18px_50px_rgba(0,0,0,0.28)]'
          : 'border-white/8 bg-white/[0.03] hover:border-white/16 hover:bg-white/[0.05]',
      )}
      aria-pressed={isSelected}
    >
      <div className='relative aspect-[9/16] w-20 shrink-0 overflow-hidden rounded-[18px] border border-white/10 bg-black sm:w-24'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.88))]' />
        {hasPoster ? (
          <img
            src={item.posterUrl}
            alt={item.quote}
            loading='lazy'
            className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]'
          />
        ) : null}
        <div className='absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent' />
        <div className='absolute bottom-2.5 left-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white text-black'>
          <Play className='ml-0.5 h-3.5 w-3.5 fill-current' />
        </div>
      </div>

      <div className='min-w-0 space-y-1.5 pt-0.5'>
        <h3 className='text-sm font-medium leading-snug text-white'>{item.name}</h3>
        <p className='text-xs text-white/46'>{item.role}</p>
        <p className='line-clamp-3 text-sm leading-relaxed text-white/62'>{item.quote}</p>
      </div>
    </button>
  );
}

export default function ReviewsSection({ language }: ReviewsSectionProps): ReactElement {
  const copy = siteCopy[language].reviews;
  const items = videoTestimonials[language];
  const [selected, setSelected] = useState<VideoTestimonial>(items[0]);
  const hasVideo: boolean = selected.videoUrl.trim().length > 0;
  const hasPoster: boolean = selected.posterUrl.trim().length > 0;

  useEffect(() => {
    setSelected(items[0]);
  }, [items]);

  return (
    <section id='reviews' className='relative overflow-hidden border-t border-white/5 bg-background py-14 lg:py-16'>
      <div className='pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_60%)]' />

      <div className='container relative z-10 mx-auto px-6'>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className='mb-6 max-w-3xl space-y-3 lg:mb-8'
        >
          <h2 className='text-3xl font-bold tracking-tight text-white md:text-5xl'>
            {copy.title}
          </h2>
          <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base'>
            {copy.description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className='grid items-start gap-4 xl:grid-cols-[minmax(0,1.12fr)_330px]'
        >
          <div className='overflow-hidden rounded-[30px] border border-white/10 bg-[#080808] shadow-[0_26px_80px_rgba(0,0,0,0.28)] xl:mt-7'>
            <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]'>
              <div className='relative bg-black'>
                <div className='relative aspect-square w-full overflow-hidden bg-black'>
                  {hasVideo ? (
                    <video
                      key={selected.id}
                      controls
                      playsInline
                      preload='metadata'
                      poster={hasPoster ? selected.posterUrl : undefined}
                      className='h-full w-full object-cover object-center'
                    >
                      <source src={selected.videoUrl} type='video/mp4' />
                      {selected.captionsUrl.trim().length > 0 ? (
                        <track kind='captions' src={selected.captionsUrl} default />
                      ) : null}
                    </video>
                  ) : (
                    <>
                      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.92))]' />
                      {hasPoster ? (
                        <img
                          src={selected.posterUrl}
                          alt={selected.quote}
                          className='absolute inset-0 h-full w-full object-cover object-center opacity-80'
                        />
                      ) : null}
                      <div className='absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent' />
                      <div className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20' />
                      <div className='absolute bottom-0 left-0 right-0 p-5 sm:p-6'>
                        <div className='max-w-md space-y-3'>
                          <div className='inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white text-black'>
                            <Play className='ml-0.5 h-5 w-5 fill-current' />
                          </div>
                          <p className='text-sm leading-relaxed text-white/68 sm:text-base'>
                            {copy.placeholderMessage}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className='flex h-full flex-col justify-between gap-4 border-t border-white/10 bg-white/[0.03] p-5 lg:border-l lg:border-t-0'>
                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <h3 className='text-lg font-semibold leading-tight text-white xl:text-[1.65rem]'>
                      {selected.quote}
                    </h3>
                  </div>
                </div>

                <div className='space-y-3'>
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-white'>{selected.name}</p>
                    <p className='text-sm text-white/50'>{selected.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-2.5'>
            <div className='px-1'>
              <h3 className='text-sm font-medium uppercase tracking-[0.2em] text-white/42'>
                {copy.moreStoriesTitle}
              </h3>
            </div>

            <div className='space-y-2'>
              {items.map((item: VideoTestimonial) => (
                <VideoPreview
                  key={item.id}
                  item={item}
                  isSelected={item.id === selected.id}
                  onSelect={setSelected}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
