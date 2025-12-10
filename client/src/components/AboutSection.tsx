import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import aboutImg from "@assets/generated_images/friendly_female_yoga_teacher_portrait_in_nature.png";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Image Side */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-1/2 relative"
          >
            <div className="relative aspect-square max-w-md mx-auto lg:max-w-none">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl transform -translate-x-10 translate-y-10" />
              <div className="absolute inset-0 bg-secondary/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
              <img
                src={aboutImg}
                alt="Sarah Yoga Teacher"
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-xl"
              />
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 z-20 bg-background p-6 rounded-2xl shadow-lg max-w-[200px] hidden md:block">
                <p className="font-serif text-3xl font-bold text-primary mb-1">10+</p>
                <p className="text-sm text-muted-foreground">Years of teaching experience worldwide</p>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-1/2 space-y-8"
          >
            <div>
              <span className="text-primary font-medium tracking-wider uppercase text-sm mb-2 block">About Me</span>
              <h2 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
                Teaching yoga from <br />
                <span className="italic text-secondary">the heart</span>
              </h2>
            </div>

            <div className="space-y-6 text-muted-foreground text-lg font-light leading-relaxed">
              <p>
                Namaste, I'm Sarah. My journey with yoga began over a decade ago when I was searching for a way to quiet my busy mind. What started as a physical practice quickly transformed into a way of life.
              </p>
              <p>
                I believe that yoga is not just about flexibility or strength, but about coming home to yourself. My classes weave together fluid movement, breathwork, and mindfulness to help you find balance both on and off the mat.
              </p>
              <p>
                Whether you're a complete beginner or an advanced practitioner, my goal is to create a safe, welcoming space for you to explore your potential.
              </p>
            </div>

            <div className="pt-4">
              <Button size="lg" className="rounded-full px-8">
                Read My Full Story
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
