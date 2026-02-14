import { motion } from 'framer-motion';
import { Video, MapPin, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { siteCopy, type Language } from '@/lib/i18n';

const iconByClassId: Record<number, typeof Video> = {
  1: Video,
  2: MapPin,
};

interface ClassesSectionProps {
  language: Language;
}

export default function ClassesSection({ language }: ClassesSectionProps) {
  const copy = siteCopy[language].classes;

  return (
    <section id="classes" className="py-24 bg-background border-t border-white/5">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {copy.classTypes.map((classType, index) => {
            const Icon = iconByClassId[classType.id] ?? Video;

            return (
            <motion.div
              key={classType.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="group h-full bg-card border border-white/10 hover:border-white/20 transition-all duration-300 p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="rounded-full bg-white/5 p-3 border border-white/10">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="outline" className="border-white/10 text-white/60 font-mono text-xs">
                    {classType.price}
                  </Badge>
                </div>

                <h3 className="text-2xl font-semibold text-white mb-3">
                  {classType.title}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {classType.description}
                </p>

                <ul className="space-y-4 mb-8">
                  {classType.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  size="sm" 
                  className="w-full h-9 px-5 rounded-full bg-white text-black hover:bg-white/90 text-sm font-medium"
                  onClick={() => window.open('https://t.me/AnastasiaPagliacci', '_blank')}
                >
                  {copy.bookSession}
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </Card>
            </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground mb-4">
            {copy.firstTime}
          </p>
          <Button 
            variant="outline" 
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
            onClick={() => window.open('https://t.me/AnastasiaPagliacci', '_blank')}
          >
            {copy.getInTouch}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
