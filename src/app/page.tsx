'use client';
import { useState } from 'react';
import { Start } from "@/components/start";
import { Simulator } from "@/components/simulator";

export default function HomePage() {
  const [isSimulationStarted, setIsSimulationStarted] = useState(false);
  const [planetName, setPlanetName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [trait, setTrait] = useState('');
  const [socialClasses, setSocialClasses] = useState([]);
  const [population, setPopulation] = useState('');
  const [majorMetrics, setMajorMetrics] = useState({});
  


  const handleStartSimulation = () => {
    setIsSimulationStarted(true);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {!isSimulationStarted ? (
        <Start onStartSimulation={handleStartSimulation} />
      ) : (
        <Simulator initialData={{
          worldData: {
            planetName: planetName,
            countryName: countryName
          },
          trait: { trait: trait },
          socialClasses: socialClasses,
          population: population,
          majorMetrics: {
            fertilityRate: 0,
            educationAccess: 0,
            jobAccess: 0,
            wealthDistribution: 0,
            populationInPoverty: 0,
            gdpPerCapita: 0,
            socialIndicators: {
              lifeExpectancy: 0,
              infantMortalityRate: 0,
              crimeRates: '',
              trustInGovernment: 0,
            }
          }
        }} />
      )}
    </div>
  );
}