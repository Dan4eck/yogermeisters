import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import beachImg from "@assets/generated_images/tropical_beach_yoga_retreat_location.png";
import mountainImg from "@assets/generated_images/mountain_yoga_retreat_location.png";
import desertImg from "@assets/generated_images/desert_yoga_retreat_at_sunset.png";

const tours = [
  {
    id: 1,
    title: "Coastal Serenity",
    location: "Bali, Indonesia",
    date: "Oct 12 - 19",
    price: "$2,400",
    image: beachImg,
    tags: ["Relaxation", "Ocean"],
  },
  {
    id: 2,
    title: "Alpine Flow",
    location: "Swiss Alps",
    date: "Nov 05 - 12",
    price: "$2,800",
    image: mountainImg,
    tags: ["Hiking", "Altitude"],
  },
  {
    id: 3,
    title: "Desert Silence",
    location: "Joshua Tree",
    date: "Dec 01 - 05",
    price: "$1,900",
    image: desertImg,
    tags: ["Meditation", "Stars"],
  },
];

export default function ToursSection() {
  return (
    <section id="tours" className="py-24 bg-background border-t border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
              Upcoming Retreats
            </h2>
            <p className="text-muted-foreground">
              Curated experiences for deep focus and restoration.
            </p>
          </div>
          <Button variant="link" className="text-white p-0 h-auto hover:text-white/70">
            View all dates <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="group relative overflow-hidden bg-card border border-white/10 hover:border-white/20 transition-all duration-300">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
                        {tour.title}
                      </h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {tour.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="border-white/10 text-white/60 font-mono text-xs">
                      {tour.price}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                      <Calendar className="w-3 h-3" />
                      {tour.date}
                    </div>
                    <div className="flex gap-2">
                      {tour.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-white/5 px-2 py-1 rounded text-white/40 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
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
