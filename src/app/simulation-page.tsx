'use client';
import { useState } from 'react';
import { Start } from '../components/start';
import { Simulator } from '../components/simulator';
export function SimulationPage() {
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);

  const handleStartSimulation = () => {
    setIsSimulationStarted(true);
  };

  return (
    <>
      {!isSimulationStarted ? (
        <Start onStartSimulation={handleStartSimulation} />
      ) : (
        <Simulator />
      )}
    </>
  );
}