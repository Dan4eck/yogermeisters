import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { siteCopy, type Language } from '@/lib/i18n';

interface HeroProps {
  language: Language;
}

export default function Hero({ language }: HeroProps) {
  const copy = siteCopy[language].hero;
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px 200px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen min-h-[800px] w-full overflow-hidden flex flex-col items-center justify-center pt-20">
      {/* Background with tech overlay */}
      <div className="absolute inset-0 z-0">
        {shouldLoad ? (
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/assets/videos/hero-poster.jpg"
            className="w-full h-full object-cover opacity-70 grayscale-[30%]"
          >
            <source src="/assets/videos/hero.webm" type="video/webm" />
            <source src="/assets/videos/hero.mp4" type="video/mp4" />
          </video>
        ) : (
          <img
            src="/assets/videos/hero-poster.jpg"
            alt=""
            className="w-full h-full object-cover opacity-50 grayscale-[30%]"
          />
        )}
        <div className="absolute inset-0 bg-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="mb-8 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white backdrop-blur-xl">
            <span className="mr-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wide">
              {copy.badgeLabel}
            </span>
            <span className="font-medium">{copy.badgeText}</span>
            <ArrowRight className="ml-2 h-3 w-3 opacity-50" />
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-6">
            {copy.titleTop} <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              {copy.titleBottom}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            {copy.description}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-medium w-full sm:w-auto transition-all hover:scale-105"
              onClick={() => {
                const element = document.getElementById('classes');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {copy.bookClass}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 w-full sm:w-auto"
              onClick={() => {
                const element = document.getElementById('tours');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {copy.bookRetreat}
            </Button>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
