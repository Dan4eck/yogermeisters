import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { siteCopy, type Language } from '@/lib/i18n';

interface ReviewsSectionProps {
  language: Language;
}

export default function ReviewsSection({ language }: ReviewsSectionProps) {
  const copy = siteCopy[language].reviews;

  return (
    <section id="reviews" className="py-24 bg-background relative border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="col-span-1 md:col-span-3 text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white mb-4">
              {copy.title}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {copy.description}
            </p>
          </div>
          
          {copy.list.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full bg-card border border-white/10 p-6 hover:bg-white/5 transition-colors duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-3 h-3 fill-white text-white" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    "{review.content}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-white/10">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.name}`} />
                    <AvatarFallback className="bg-white/10 text-xs">{review.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm text-white">{review.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{review.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
