
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ListChecks, Lock, ClipboardList, BookText, Sparkles, Image as ImageIcon, LayoutDashboard, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: <ListChecks className="h-8 w-8 text-primary mb-4" />,
    title: 'Todo Management',
    description: 'Keep track of your tasks and boost productivity.',
  },
  {
    icon: <Lock className="h-8 w-8 text-primary mb-4" />,
    title: 'Password Storage',
    description: 'Securely store and manage your website logins (locally).',
  },
  {
    icon: <ClipboardList className="h-8 w-8 text-primary mb-4" />,
    title: 'Plan Tracking',
    description: 'Outline and monitor your short and long-term goals.',
  },
  {
    icon: <BookText className="h-8 w-8 text-primary mb-4" />,
    title: 'Story Writing',
    description: 'Jot down your creative narratives and ideas.',
  },
  {
    icon: <Sparkles className="h-8 w-8 text-primary mb-4" />,
    title: 'AI Suggestions',
    description: 'Get smart ideas for new todos, plans, or stories.',
  },
  {
    icon: <ImageIcon className="h-8 w-8 text-primary mb-4" />,
    title: 'Photo Gallery',
    description: 'Organize and view your photos in albums.',
  },
   {
    icon: <LayoutDashboard className="h-8 w-8 text-primary mb-4" />,
    title: 'Personalized Dashboard',
    description: 'All your information, accessible in one central place.',
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-primary mb-4" />,
    title: 'Secure Authentication',
    description: 'Your data is protected with secure user accounts.',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Discover What <span className="text-primary">MyLifeHub</span> Offers
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            A comprehensive suite of tools designed to help you manage various aspects of your digital life efficiently.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                {feature.icon}
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="mt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
