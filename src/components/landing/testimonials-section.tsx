
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';

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
];

export default function TestimonialsSection() {
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
        <div className="relative">
          <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-accent/20">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="min-w-[300px] md:min-w-[350px] flex-shrink-0 snap-start">
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
                <CardContent>
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
            ))}
          </div>
           {/* Optional: Add custom scroll arrows if native scrollbar is not desired */}
        </div>
      </div>
    </section>
  );
}
