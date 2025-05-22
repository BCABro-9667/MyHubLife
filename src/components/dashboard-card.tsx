
import type { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  description: string;
  link: string;
  itemCount?: number;
  Icon: LucideIcon;
  ctaText?: string;
}

export function DashboardCard({ title, description, link, itemCount, Icon, ctaText = "Manage" }: DashboardCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <Icon className="h-6 w-6 text-accent" />
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-1">{description}</p>
        {itemCount !== undefined && (
           <div className="text-2xl font-bold text-primary">{itemCount}</div>
        )}
      </CardContent>
      <CardHeader className="pt-0"> {/* Use CardHeader for padding consistency */}
        <Link href={link} passHref>
          <Button variant="outline" className="w-full mt-auto">
            {ctaText} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
    </Card>
  );
}
