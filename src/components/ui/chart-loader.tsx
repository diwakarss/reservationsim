import React from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Typography } from '@/components/ui/typography';

interface ChartLoadingOverlayProps {
  loading: boolean;
  message?: string;
  className?: string;
}

export function ChartLoadingOverlay({
  loading,
  message = 'Calculating...',
  className
}: ChartLoadingOverlayProps) {
  if (!loading) return null;
  
  return (
    <div 
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center",
        className
      )}
    >
      <Loader className="h-8 w-8 animate-spin text-primary" />
      <Typography variant="small" className="mt-2 text-muted-foreground">
        {message}
      </Typography>
    </div>
  );
} 