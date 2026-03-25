import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { siteCopy, type Language } from '@/lib/i18n';
import { getRetreatAssetUrl } from '@/lib/retreat-assets';
import { openExternal } from '@/lib/open-external';
import { fetchJson } from '@/lib/query-client';
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
import type { RetreatListResponse, RetreatRecord } from '@shared/retreat-content';

function formatDateRange(startDate: string, endDate: string, locale: string): string {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
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

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

interface ToursSectionProps {
  language: Language;
}

export default function ToursSection({ language }: ToursSectionProps) {
  const copy = siteCopy[language].tours;
  const [selectedRetreat, setSelectedRetreat] = useState<RetreatRecord | null>(null);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['retreats', 'upcoming', language],
    queryFn: () =>
      fetchJson<RetreatListResponse>(`/api/retreats?view=upcoming&language=${language}`),
  });
  const localizedRetreats = data?.retreats ?? [];
  const dateRanges = useMemo(
    () =>
      localizedRetreats.reduce<Record<number, string>>((acc, retreat) => {
        acc[retreat.id] = retreat.dateLabel ?? formatDateRange(retreat.startDate, retreat.endDate, copy.dateLocale);
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

        {isLoading ? (
          <div className='rounded-2xl border border-white/10 bg-card px-6 py-10 text-center text-sm text-muted-foreground'>
            Loading retreats...
          </div>
        ) : null}

        {isError ? (
          <div className='rounded-2xl border border-red-500/20 bg-card px-6 py-10 text-center text-sm text-white/70'>
            Unable to load retreats right now.
          </div>
        ) : null}

        {!isLoading && !isError ? (
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
                      src={getRetreatAssetUrl(retreat.coverAssetKey)}
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

                    <div className='mt-6 flex flex-col items-center gap-3 border-t border-white/5 pt-4 text-center'>
                      <div className='flex items-center justify-center gap-2 font-mono text-xs text-muted-foreground'>
                        <Calendar className='h-3 w-3' />
                        {dateRanges[retreat.id]}
                      </div>
                      <Button
                        size="sm"
                        className="h-8 px-4 rounded-full bg-white text-black hover:bg-white/90 text-xs font-medium"
                        onClick={() => openExternal(retreat.bookingUrl)}
                      >
                        {copy.bookNow}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : null}
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
                src={getRetreatAssetUrl(selectedRetreat.coverAssetKey)}
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
                {selectedRetreat.postBlocks.map((block) => {
                  if (block.type === 'paragraph') {
                    return (
                      <p
                        key={`${selectedRetreat.id}-${block.id}`}
                        className='text-sm leading-relaxed text-white/80 md:text-base'
                      >
                        {block.text}
                      </p>
                    );
                  }

                  return (
                    <div
                      key={`${selectedRetreat.id}-${block.id}`}
                      className='overflow-hidden rounded-md border border-white/10'
                    >
                      <img
                        src={block.assetKey ? getRetreatAssetUrl(block.assetKey) : ''}
                        alt={block.alt ?? selectedRetreat.title}
                        className='max-h-[480px] w-full object-cover'
                      />
                    </div>
                  );
                })}
              </div>

              <div className='flex justify-center pt-2'>
                <Button
                  className='h-10 rounded-full bg-white px-6 text-black hover:bg-white/90'
                  onClick={() => openExternal(selectedRetreat.bookingUrl)}
                >
                  {copy.bookRetreat}
                </Button>
              </div>
            </div>
          </DialogContent>
        ) : null}
      </Dialog>
    </section>
  );
}
