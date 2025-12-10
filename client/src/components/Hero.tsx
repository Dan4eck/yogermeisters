import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroBg from "@assets/generated_images/serene_yoga_studio_overlooking_forest_at_sunrise.png";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Serene Yoga Studio"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 md:bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm text-sm font-medium tracking-wider uppercase">
            Reconnect with Nature
          </span>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight md:leading-tight">
            Find Your Inner <br />
            <span className="italic font-light">Sanctuary</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-light leading-relaxed">
            Join Sarah for transformative yoga journeys. From local studio sessions to immersive retreats in the world's most breathtaking locations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 h-14 text-base bg-white text-black hover:bg-white/90 w-full sm:w-auto"
            >
              Explore Retreats
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-8 h-14 text-base border-white text-white hover:bg-white/10 hover:text-white w-full sm:w-auto"
            >
              <Play className="w-4 h-4 mr-2" /> Watch Video
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
}
