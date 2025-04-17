'use client';
import { useState } from 'react';
import { Start } from "@/components/start";
import { Simulator } from "@/components/simulator";
import { ClassMetrics } from '@/lib/calculations';

export type SimulationData = {
  worldData: { planetName: string; countryName: string };
  trait: { trait: string } | null;
  socialClasses: string[];
  population: string;
  metrics: Record<string, ClassMetrics>;
  majorMetrics: {
    fertilityRate: number;
    educationAccess: number;
    jobAccess: number;
    wealthDistribution: number;
    populationInPoverty: number;
    gdpPerCapita: number;
    socialIndicators: {
      lifeExpectancy: number;
      infantMortalityRate: number;
      crimeRates: string;
      trustInGovernment: number;
    };
  };
};

export default function HomePage() {
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);

  const handleStartSimulation = (data: SimulationData) => {
    setSimulationData(data);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {!simulationData ? (
        <Start onStartSimulation={handleStartSimulation} />
      ) : (
        <Simulator initialData={simulationData} />
      )}
    </div>
  );
}