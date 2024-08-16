'use client';
import React, { createContext, useContext, ReactNode, useState } from 'react';
import { SocialClass } from '@/config/initialParameters';

// Define a more specific type for metrics
export interface Metrics {
  // Add specific metric properties here
  fertilityRate: number;
  educationAccess: number;
  // ... other metrics
}

export interface SimulationContextType {
  classes: SocialClass[];
  setClasses: (classes: SocialClass[]) => void;
  metrics: Metrics;
  setMetrics: (metrics: Metrics) => void;
}

export const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<SocialClass[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    fertilityRate: 0,
    educationAccess: 0,
    // ... initialize other metrics
  });

  return (
    <SimulationContext.Provider value={{ classes, setClasses, metrics, setMetrics }}>
      {children}
    </SimulationContext.Provider>
  );
};

export function useSimulationContext() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
}