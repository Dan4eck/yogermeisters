import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto space-y-8"
        >
          <h2 className="text-4xl md:text-6xl font-serif font-medium leading-tight">
            Begin Your Journey Today
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/80 font-light">
            Whether you're looking for a personal session to refine your alignment or ready to embark on a life-changing retreat.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button 
              size="lg" 
              variant="secondary" 
              className="rounded-full px-10 h-14 text-lg w-full sm:w-auto bg-white text-primary hover:bg-white/90"
            >
              Book Personal Class
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-full px-10 h-14 text-lg w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:text-white"
            >
              Contact Me
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
