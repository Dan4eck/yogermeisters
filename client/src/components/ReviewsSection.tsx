import { motion } from "framer-motion";
import { Star } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const reviews = [
  {
    id: 1,
    name: "Emma Thompson",
    role: "Yoga Student",
    content: "Sarah's retreats are nothing short of magical. I arrived feeling burnt out and left with a renewed sense of purpose and clarity. The location was breathtaking.",
    rating: 5,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Retreat Guest",
    content: "The perfect balance of challenge and relaxation. Sarah has a unique gift for holding space for everyone, no matter their level of experience.",
    rating: 5,
  },
  {
    id: 3,
    name: "Sofia Rodriguez",
    role: "Regular Student",
    content: "I've been practicing with Sarah for 3 years. Her teaching style is grounded, authentic, and incredibly knowledgeable. Highly recommend her personal classes.",
    rating: 5,
  },
];

export default function ReviewsSection() {
  return (
    <section id="reviews" className="py-24 bg-secondary/10 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/40 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
            Stories from the Mat
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full opacity-50" />
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem key={review.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="border-none shadow-sm bg-background/60 backdrop-blur-sm h-full">
                    <CardContent className="flex flex-col p-8 h-full">
                      <div className="flex gap-1 mb-6">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                      </div>
                      
                      <blockquote className="text-lg text-foreground/80 font-light italic mb-8 flex-grow">
                        "{review.content}"
                      </blockquote>

                      <div className="flex items-center gap-4 mt-auto">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.name}`} />
                          <AvatarFallback>{review.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12" />
            <CarouselNext className="-right-12" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
