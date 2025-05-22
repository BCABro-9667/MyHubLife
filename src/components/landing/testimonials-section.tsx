
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    name: 'Sarah L.',
    role: 'Freelance Writer',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'woman portrait',
    stars: 5,
    testimonial: "MyLifeHub has been a game-changer for my productivity. I can finally keep all my notes, plans, and todos in one place. The AI suggestions are surprisingly helpful!",
  },
  {
    name: 'Mike P.',
    role: 'Software Developer',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'man portrait',
    stars: 5,
    testimonial: "I love having a central dashboard for everything. The password manager (local, but still handy) and web links section are features I use daily. Highly recommend!",
  },
  {
    name: 'Jessica B.',
    role: 'Student',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'person smiling',
    stars: 4,
    testimonial: "Great for organizing my assignments and personal projects. The story writing module is a nice touch for creative breaks. Wish there were more theme options though!",
  },
  {
    name: 'David K.',
    role: 'Small Business Owner',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'professional person',
    stars: 5,
    testimonial: "Finally, an app that's simple yet powerful enough to manage different parts of my life. The plans section helps me stay on track with business goals.",
  },
  {
    name: 'Emily R.',
    role: 'Project Manager',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'professional woman',
    stars: 5,
    testimonial: "The ability to switch between todos, plans, and stories in one interface is fantastic. It's streamlined my workflow significantly.",
  },
   {
    name: 'Alex C.',
    role: 'Photographer',
    avatar: 'https://placehold.co/100x100.png',
    dataAiHint: 'artist person',
    stars: 4,
    testimonial: "The gallery feature is great for organizing my photo albums by project. User interface is clean and intuitive!",
  },
];

const CARDS_PER_VIEW = 3;

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };
  
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < CARDS_PER_VIEW; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visible;
  };

  const displayedTestimonials = getVisibleTestimonials();

  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            What Our <span className="text-primary">Users Say</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Hear from people who have transformed their organization with MyLifeHub.
          </p>
        </div>
        
        {testimonials.length === 0 ? (
            <p className="text-center text-muted-foreground">No testimonials yet.</p>
        ) : (
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              // This style is not needed when we map over `displayedTestimonials` directly
              // style={{ transform: `translateX(-${(100 / CARDS_PER_VIEW) * (currentIndex % testimonials.length)}%)` }}
            >
              {displayedTestimonials.map((testimonial, index) => (
                <div key={index} className={cn("w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-3 snap-start")}>
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center space-x-4">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                        data-ai-hint={testimonial.dataAiHint}
                      />
                      <div>
                        <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <div className="flex mb-2">
                        {Array(testimonial.stars).fill(0).map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                        ))}
                        {Array(5 - testimonial.stars).fill(0).map((_, i) => (
                          <Star key={i + testimonial.stars} className="h-5 w-5 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground italic">
                        "{testimonial.testimonial}"
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {testimonials.length > CARDS_PER_VIEW && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-0 -translate-y-1/2 transform -translate-x-4 z-10 bg-background/80 hover:bg-background"
                onClick={handlePrev}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-0 -translate-y-1/2 transform translate-x-4 z-10 bg-background/80 hover:bg-background"
                onClick={handleNext}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
        )}
      </div>
    </section>
  );
}
