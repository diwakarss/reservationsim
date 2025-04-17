import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";

interface ChartLoadingOverlayProps {
  isLoading: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const ChartLoadingOverlay: React.FC<ChartLoadingOverlayProps> = ({
  isLoading,
  hasError = false,
  errorMessage = "Failed to load chart data",
}) => {
  if (!isLoading && !hasError) return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
      {isLoading && <Spinner className="h-10 w-10 text-primary mb-2" />}
      {hasError && (
        <Typography variant="small" className="text-destructive">
          {errorMessage}
        </Typography>
      )}
      {isLoading && (
        <Typography variant="small" className="text-muted-foreground">
          Loading chart data...
        </Typography>
      )}
    </div>
  );
}; 