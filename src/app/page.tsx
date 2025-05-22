
import HomePageNavbar from '@/components/landing/home-page-navbar';
import HeroSection from '@/components/landing/hero-section';
import FeaturesSection from '@/components/landing/features-section';
import HowToUseSection from '@/components/landing/how-to-use-section';
import TestimonialsSection from '@/components/landing/testimonials-section';
import LandingFooter from '@/components/landing/landing-footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <HomePageNavbar />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <HowToUseSection />
        <TestimonialsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
