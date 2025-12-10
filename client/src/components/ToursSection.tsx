import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import beachImg from "@assets/generated_images/tropical_beach_yoga_retreat_location.png";
import mountainImg from "@assets/generated_images/mountain_yoga_retreat_location.png";
import desertImg from "@assets/generated_images/desert_yoga_retreat_at_sunset.png";

const tours = [
  {
    id: 1,
    title: "Coastal Serenity Retreat",
    location: "Bali, Indonesia",
    date: "Oct 12 - 19, 2024",
    price: "$2,400",
    image: beachImg,
    tags: ["Beach", "Relaxation"],
    description: "7 days of sunrise yoga, ocean meditation, and tropical bliss.",
  },
  {
    id: 2,
    title: "Mountain Soul Journey",
    location: "Swiss Alps",
    date: "Nov 05 - 12, 2024",
    price: "$2,800",
    image: mountainImg,
    tags: ["Hiking", "Adventure"],
    description: "Reconnect with nature high in the mountains. Breathwork and hiking included.",
  },
  {
    id: 3,
    title: "Desert Silence Quest",
    location: "Joshua Tree, USA",
    date: "Dec 01 - 05, 2024",
    price: "$1,900",
    image: desertImg,
    tags: ["Silence", "Meditation"],
    description: "A profound journey into silence under the vast desert stars.",
  },
];

export default function ToursSection() {
  return (
    <section id="tours" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-4">
              Upcoming Retreats
            </h2>
            <p className="text-muted-foreground text-lg font-light">
              Immersive experiences designed to deepen your practice and restore your spirit.
            </p>
          </div>
          <Button variant="outline" className="rounded-full">
            View All Dates <ArrowUpRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour, index) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="group overflow-hidden border-none shadow-none bg-transparent h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    {tour.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm shadow-sm border-none">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <CardHeader className="p-0 mb-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-2xl font-serif group-hover:text-primary transition-colors">
                      {tour.title}
                    </CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" /> {tour.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {tour.date}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-0 mb-6 flex-grow">
                  <p className="text-muted-foreground leading-relaxed">
                    {tour.description}
                  </p>
                </CardContent>

                <CardFooter className="p-0 flex items-center justify-between border-t border-border/50 pt-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider block">Starting from</span>
                    <span className="text-xl font-medium text-primary">{tour.price}</span>
                  </div>
                  <Button className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
