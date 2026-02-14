import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import aboutImg from '@assets/2025-12-10_18.39.59_1765388536142.jpg';
import { siteCopy, type Language } from '@/lib/i18n';

interface AboutSectionProps {
  language: Language;
}

export default function AboutSection({ language }: AboutSectionProps) {
  const copy = siteCopy[language].about;

  return (
    <section id="about" className="py-24 bg-background border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Content */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <h2 className="text-4xl font-bold tracking-tight text-white">
              {copy.titleTop} <br />
              {copy.titleBottom}
            </h2>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              {copy.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-8 py-6 border-y border-white/5">
              {copy.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-white font-mono">{stat.value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <ul className="space-y-3 mb-8">
                {copy.bullets.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="rounded-full bg-white/10 p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
              <img
                src={aboutImg}
                alt={copy.imageAlt}
                className="w-full h-full object-cover opacity-95"
              />
              
              {/* Tech Overlay lines */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="absolute bottom-0 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
