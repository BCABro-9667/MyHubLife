
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import hero from './hero.png'; // use relative path


export default function HeroSection() {
  return (
    <section id="home" className="py-16  bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Organize Your Life, <span className="text-primary">Effortlessly</span>.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
              MyLifeHub is your all-in-one personal dashboard to manage todos, passwords, plans, stories, and more. Simplify your digital life today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started Free <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src={hero}
              alt="MyLifeHub Dashboard Preview"
              width={600}
              height={400}
              // className="rounded-lg shadow-2xl"
              // priority
              // data-ai-hint="dashboard productivity"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
