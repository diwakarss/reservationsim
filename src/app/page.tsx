'use client';
import { useState } from 'react';
import { Start } from "@/components/start";
import { Simulator } from "@/components/simulator";

export default function HomePage() {
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);

  const handleStartSimulation = () => {
    setIsSimulationStarted(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {!isSimulationStarted ? (
        <Start onStartSimulation={handleStartSimulation} />
      ) : (
        <Simulator />
      )}
    </div>
  );
}