'use client';
import React, { createContext, useContext, ReactNode, useState } from 'react';

interface SimulationContextType {
  classes: string[];
  setClasses: React.Dispatch<React.SetStateAction<string[]>>;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<string[]>([]);

  return (
    <SimulationContext.Provider value={{ classes, setClasses }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulationContext() {
  const context = useContext(SimulationContext);
  if (context === undefined) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
}