import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-32 relative overflow-hidden bg-background flex flex-col items-center justify-center border-t border-white/5">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto space-y-8"
        >
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
            Ready to upgrade?
          </h2>
          <p className="text-xl text-muted-foreground font-light">
            Join the waitlist for the next retreat or book a 1:1 consultation today.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="h-12 px-8 rounded-full bg-white text-black hover:bg-white/90 w-full sm:w-auto font-medium"
            >
              Book Consultation
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-12 px-8 rounded-full border-white/10 bg-black/50 text-white hover:bg-white/10 hover:text-white w-full sm:w-auto backdrop-blur-md"
            >
              View Schedule
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
