import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { retreats, type Retreat } from '@/lib/retreats';
import { localizeRetreat, siteCopy, type Language } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function formatDateRange(startDate: string, endDate: string, locale: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const dayFormat = new Intl.DateTimeFormat(locale, { day: '2-digit' });
  const monthDayFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
  });
  const fullFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    return `${monthDayFormat.format(start)} - ${dayFormat.format(end)}`;
  }

  return `${fullFormat.format(start)} - ${fullFormat.format(end)}`;
}

interface ToursSectionProps {
  language: Language;
}

export default function ToursSection({ language }: ToursSectionProps) {
  const copy = siteCopy[language].tours;
  const [selectedRetreat, setSelectedRetreat] = useState<Retreat | null>(null);
  const localizedRetreats = useMemo(
    () => retreats.map((retreat) => localizeRetreat(retreat, language)),
    [language],
  );
  const dateRanges = useMemo(
    () =>
      localizedRetreats.reduce<Record<number, string>>((acc, retreat) => {
        acc[retreat.id] = formatDateRange(retreat.startDate, retreat.endDate, copy.dateLocale);
        return acc;
      }, {}),
    [copy.dateLocale, localizedRetreats],
  );

  return (
    <section id='tours' className='border-t border-white/5 bg-background py-24'>
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              {copy.title}
            </h2>
            <p className="text-muted-foreground">
              {copy.description}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
          {localizedRetreats.map((retreat, index) => (
            <motion.div
              key={retreat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className='group relative overflow-hidden border border-white/10 bg-card transition-all duration-300 hover:border-white/20'>
                <button
                  type='button'
                  className='aspect-[16/9] w-full overflow-hidden'
                  onClick={() => {
                    setSelectedRetreat(retreat);
                  }}
                >
                  <img
                    src={retreat.coverImage}
                    alt={retreat.title}
                    className='h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100'
                  />
                </button>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
                        {retreat.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className='h-3 w-3' /> {retreat.location}
                      </p>
                    </div>
                    <Badge variant='outline' className='border-white/10 font-mono text-xs text-white/60'>
                      {retreat.price}
                    </Badge>
                  </div>

                  <div className='mt-6 flex items-center justify-between border-t border-white/5 pt-4'>
                    <div className='flex items-center gap-2 font-mono text-xs text-muted-foreground'>
                      <Calendar className='h-3 w-3' />
                      {dateRanges[retreat.id]}
                    </div>
                    <Button 
                      size="sm" 
                      className="h-8 px-4 rounded-full bg-white text-black hover:bg-white/90 text-xs font-medium"
                      onClick={() => window.open(retreat.bookingUrl, '_blank')}
                    >
                      {copy.bookNow}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog
        open={selectedRetreat !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRetreat(null);
          }
        }}
      >
        {selectedRetreat ? (
          <DialogContent className='max-h-[92vh] max-w-5xl overflow-y-auto border-white/10 bg-card p-0'>
            <div className='w-full overflow-hidden border-b border-white/10'>
              <img
                src={selectedRetreat.coverImage}
                alt={selectedRetreat.title}
                className='h-[320px] w-full object-cover md:h-[460px]'
              />
            </div>

            <div className='space-y-6 p-6'>
              <DialogHeader>
                <DialogTitle className='text-2xl text-white md:text-3xl'>
                  {selectedRetreat.title}
                </DialogTitle>
                <DialogDescription className='text-base text-white/70'>
                  {selectedRetreat.location}
                </DialogDescription>
              </DialogHeader>

              <div className='flex flex-wrap items-center gap-3'>
                <Badge variant='outline' className='border-white/10 font-mono text-xs text-white/70'>
                  {selectedRetreat.price}
                </Badge>
                <Badge variant='outline' className='border-white/10 font-mono text-xs text-white/70'>
                  {dateRanges[selectedRetreat.id]}
                </Badge>
              </div>

              <div className='space-y-5'>
                {selectedRetreat.postBlocks.map((block, blockIndex) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={`${selectedRetreat.id}-paragraph-${blockIndex}`}
                        className='text-sm leading-relaxed text-white/80 md:text-base'
                      >
                        {block.text}
                      </p>
                    );
                  }

                  return (
                    <div
                      key={`${selectedRetreat.id}-image-${blockIndex}`}
                      className='overflow-hidden rounded-md border border-white/10'
                    >
                      <img
                        src={block.image}
                        alt={block.alt}
                        className='max-h-[480px] w-full object-cover'
                      />
                    </div>
                  );
                })}
              </div>

              <Button
                className='h-10 rounded-full bg-white px-6 text-black hover:bg-white/90'
                onClick={() => window.open(selectedRetreat.bookingUrl, '_blank')}
              >
                {copy.bookRetreat}
              </Button>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}
