import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatRetreatDateLabel } from '@/lib/retreat-date';
import { getRetreatImageUrl } from '@/lib/retreat-assets';
import { siteCopy, type Language } from '@/lib/i18n';
import { useRetreats } from '@/lib/retreat-queries';

interface ToursSectionProps {
  language: Language;
}

export default function ToursSection({ language }: ToursSectionProps) {
  const copy = siteCopy[language].tours;
  const { data, isLoading, isError } = useRetreats('upcoming', language);
  const localizedRetreats = data?.retreats ?? [];

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
            {localizedRetreats.map((retreat, index) => {
              const dateLabel = formatRetreatDateLabel(
                retreat.startDate,
                retreat.endDate,
                retreat.dateLabel,
                copy.dateLocale,
                language,
              );

              return (
                <motion.div
                  key={retreat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <Card className='group relative overflow-hidden border border-white/10 bg-card transition-all duration-300 hover:border-white/20'>
                    <Link href={`/retreats/${retreat.slug}`}>
                      <a className='block aspect-[16/9] w-full overflow-hidden'>
                        <img
                          src={getRetreatImageUrl(retreat.coverImage)}
                          alt={retreat.title}
                          className='h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100'
                        />
                      </a>
                    </Link>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4 gap-4">
                        <div>
                          <Link href={`/retreats/${retreat.slug}`}>
                            <a className="text-lg font-semibold text-white transition-colors group-hover:text-white/90">
                              {retreat.title}
                            </a>
                          </Link>
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
                          {dateLabel}
                        </div>
                        <Button
                          asChild
                          size="sm"
                          className="h-8 px-4 rounded-full bg-white text-black hover:bg-white/90 text-xs font-medium"
                        >
                          <Link href={`/retreats/${retreat.slug}`}>{copy.viewDetails}</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
