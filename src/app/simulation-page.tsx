'use client';
import { useState } from 'react';
import { Start } from '../components/start';
import { Simulator, SimulatorProps } from '../components/simulator';

export function SimulationPage() {
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulatorProps['initialData'] | null>(null);

  const handleStartSimulation = (data: SimulatorProps['initialData']) => {
    setSimulationData(data);
    setIsSimulationStarted(true);
  };

  return (
    <>
      {!simulationData ? (
        <Start onStartSimulation={handleStartSimulation} />
      ) : (
        <Simulator initialData={simulationData} />
      )}
    </>
  );
}