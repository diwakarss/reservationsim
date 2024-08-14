'use client';
import React, { createContext, useContext, ReactNode, useState } from 'react';

export interface SimulationContextType {
  classes: string[];
  setClasses: (classes: string[]) => void;
  metrics: any;
  setMetrics: (metrics: any) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<any>({});

  return (
    <SimulationContext.Provider value={{ classes, setClasses, metrics, setMetrics }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulationContext = () => {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
};
