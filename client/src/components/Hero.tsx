import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Command } from "lucide-react";
import heroVideo from "@assets/yoga_ubud_preroll_Copy_01_1765386774436.mp4";

export default function Hero() {
  return (
    <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex flex-col items-center justify-center pt-20">
      {/* Background with tech overlay */}
      <div className="absolute inset-0 z-0">
         {/* Using the video with a heavy dark overlay to match the tech aesthetic */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70 grayscale-[30%]"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
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
            <span className="mr-2 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-black uppercase tracking-wide">Early Birds</span>
            <span className="font-medium">Cyrali retreat in May</span>
            <ArrowRight className="ml-2 h-3 w-3 opacity-50" />
          </div>
          
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-6">
            Practice, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Observe, Connect
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience yoga reimagined. Precision alignment, mindfulness engineering, and transformative retreats designed for the modern practitioner.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 font-medium w-full sm:w-auto transition-all hover:scale-105"
            >
              Book Class
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Book Retreat
            </Button>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
