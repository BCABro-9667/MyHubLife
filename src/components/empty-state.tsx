
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  IconComponent: LucideIcon;
  title: string;
  description: string;
  actionButtonText?: string;
  onActionClick?: () => void;
}

export function EmptyState({
  IconComponent,
  title,
  description,
  actionButtonText,
  onActionClick,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-border rounded-lg bg-card/50 h-full min-h-[300px]">
      <IconComponent className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {actionButtonText && onActionClick && (
        <Button onClick={onActionClick} variant="default" size="lg">
          {actionButtonText}
        </Button>
      )}
    </div>
  );
}
