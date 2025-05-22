
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserPlus, Edit, Smartphone, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: <UserPlus className="h-10 w-10 text-primary mb-4" />,
    title: 'Sign Up Quickly',
    description: 'Create your free MyLifeHub account in seconds with email or Google.',
  },
  {
    icon: <Edit className="h-10 w-10 text-primary mb-4" />,
    title: 'Add Your Data',
    description: 'Easily input your todos, plans, passwords, story ideas, and upload photos.',
  },
  {
    icon: <Smartphone className="h-10 w-10 text-primary mb-4" />,
    title: 'Access Anywhere',
    description: 'Your personalized dashboard is available on any device with a web browser.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary mb-4" />,
    title: 'Stay Organized & Secure',
    description: 'Manage your life efficiently while keeping your information organized.',
  },
];

export default function HowToUseSection() {
  return (
    <section id="how-to-use" className="py-16 md:py-24 bg-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Simple Steps to Get <span className="text-primary">Organized</span>
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Getting started with MyLifeHub is easy. Follow these simple steps to take control of your digital life.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center p-6 flex flex-col items-center">
              {step.icon}
              <CardTitle className="mb-2 text-xl">{step.title}</CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
