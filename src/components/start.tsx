'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { generatePlanetName, generateCountryName, generateSocialClasses, generateTrait, generatePopulation, Trait, SocialClass } from '../lib/nameGenerator';
import { generateTraitDescription, generateClassDescription } from '../lib/descriptionGenerator';
import { calculateFertilityRate, calculateEducationAccess, calculateJobAccess, calculateWealthDistribution, calculateSocialIndicators, calculateAggregatedCrimeRate } from '../config/initialParameters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Skeleton component for loading state
export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function Start({ onStartSimulation }: { onStartSimulation: () => void }) {
  // Initialization and state management
  const isInitialized = useRef(false);
  const [worldData, setWorldData] = useState({ planetName: '', countryName: '' });
  const [trait, setTrait] = useState<Trait | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [traitDescription, setTraitDescription] = useState('');
  const [classDescriptions, setClassDescriptions] = useState<Record<string, string>>({});
  const [socialClasses, setSocialClasses] = useState<SocialClass[]>([]);
  const [population, setPopulation] = useState('');
  const [majorMetrics, setMajorMetrics] = useState({
    fertilityRate: 0,
    educationAccess: 0,
    jobAccess: 0,
    wealthDistribution: 0,
    socialIndicators: {
      lifeExpectancy: 0,
      infantMortalityRate: 0,
      crimeRates: calculateAggregatedCrimeRate(socialClasses),
      trustInGovernment: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const hoverCardRef = useRef<HTMLDivElement | null>(null);

  // Utility functions
 const capitalizeFirstLetter = (string: string | undefined) => {
  if (!string) return '';
  return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const updateWorldData = (newPlanetName: string, newCountryName: string) => {
  setWorldData({ planetName: newPlanetName, countryName: newCountryName });
};

  // Callback functions
  const updateTraitDescription = useCallback(async (newTrait: Trait, planetName: string, countryName: string) => {
    if (newTrait && planetName && countryName) {
      const description = await generateTraitDescription(newTrait, planetName, countryName);
      setTraitDescription(description);
    }
  }, []);

  const calculateMajorMetrics = useCallback(() => {
    if (socialClasses.length === 0) return;

    const newMetrics = {
      fertilityRate: Number(calculateFertilityRate(socialClasses).toFixed(2)),
      educationAccess: Number(calculateEducationAccess(socialClasses).toFixed(2)),
      jobAccess: Number(calculateJobAccess(socialClasses).toFixed(2)),
      wealthDistribution: Number(calculateWealthDistribution(socialClasses).toFixed(2)),
      socialIndicators: {
        lifeExpectancy: Number(calculateSocialIndicators(socialClasses).lifeExpectancy.toFixed(2)),
        infantMortalityRate: Number(calculateSocialIndicators(socialClasses).infantMortalityRate.toFixed(2)),
        crimeRates: calculateAggregatedCrimeRate(socialClasses),
        trustInGovernment: Number(calculateSocialIndicators(socialClasses).trustInGovernment.toFixed(2))
      }
    };

    setMajorMetrics(newMetrics);
    console.log('Updated metrics:', newMetrics);
  }, [socialClasses]);

  const handleGenerateTrait = useCallback(async () => {
    try {
      setLoading(true); // Set loading to true when the randomization starts
      setError(null);
      const newTrait = await generateTrait();
      setTrait(newTrait);
      updateTraitDescription(newTrait, worldData.planetName, worldData.countryName);

      const classes = await generateSocialClasses(newTrait, worldData.planetName, worldData.countryName);
      setSocialClasses(classes);

      const descriptions = await Promise.all(
        classes.map(async (className) => {
          const classDesc = await generateClassDescription(className, classes, newTrait, worldData.planetName, worldData.countryName);
          return [className, classDesc];
        })
      );
      setClassDescriptions(Object.fromEntries(descriptions));
    } catch (err) {
      setError('Failed to generate trait. Please try again.');
      console.error(err);
    } finally {
      setLoading(false); // Set loading to false once the randomization is complete
    }
  }, [worldData, updateTraitDescription]);

  const handleRandomize = useCallback(async () => {
    try {
      setLoading(true); // Set loading to true when the randomization starts
      setError(null);

      const newPlanetName = await generatePlanetName();
      const newCountryName = await generateCountryName();
      const newPopulation = generatePopulation();
      const newTrait = await generateTrait();

      updateWorldData(newPlanetName, newCountryName);
      setPopulation(newPopulation);
      setTrait(newTrait);

      const classes = await generateSocialClasses(newTrait, newPlanetName, newCountryName);
      setSocialClasses(classes);

      const traitDesc = await generateTraitDescription(newTrait, newPlanetName, newCountryName);
      setTraitDescription(traitDesc);

      const descriptions = await Promise.all(
        classes.map(async (className) => {
          const classDesc = await generateClassDescription(className, classes, newTrait, newPlanetName, newCountryName);
          return [className, classDesc];
        })
      );
      setClassDescriptions(Object.fromEntries(descriptions));
    } catch (err) {
      setError("Failed to randomize data. Please try again.");
      console.error("Error during randomize:", err);
    } finally {
      setLoading(false); // Set loading to false once the randomization is complete
    }
  }, [updateTraitDescription]);

  const handleCalculateStats = useCallback(() => {
    calculateMajorMetrics();
    setShowStats(true); // Show the stats after calculating
  }, [calculateMajorMetrics]);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (hoverCardRef.current && !hoverCardRef.current.contains(event.target as Node)) {
      setShowStats(false);
    }
  }, []);

  const handlePlanetNameChange = useCallback(async (newPlanetName: string) => {
    setLoading(true);
    updateWorldData(newPlanetName, worldData.countryName);
    if (trait) {
      updateTraitDescription(trait, newPlanetName, worldData.countryName);
      const descriptions = await Promise.all(
        socialClasses.map(async (className) => {
          const classDesc = await generateClassDescription(className, socialClasses, trait, newPlanetName, worldData.countryName);
          return [className, classDesc];
        })
      );
      setClassDescriptions(Object.fromEntries(descriptions));
    }
    setLoading(false);
  }, [trait, worldData, socialClasses, updateTraitDescription]);

  const handleCountryNameChange = useCallback(async (newCountryName: string) => {
    setLoading(true);
    updateWorldData(worldData.planetName, newCountryName);
    if (trait) {
      updateTraitDescription(trait, worldData.planetName, newCountryName);
      const descriptions = await Promise.all(
        socialClasses.map(async (className) => {
          const classDesc = await generateClassDescription(className, socialClasses, trait, worldData.planetName, newCountryName);
          return [className, classDesc];
        })
      );
      setClassDescriptions(Object.fromEntries(descriptions));
    }
    setLoading(false);
  }, [trait, worldData, socialClasses, updateTraitDescription]);

  // Effects
  useEffect(() => {
    const initialize = async () => {
      await handleRandomize(); // Ensure that data is generated on initial load
      setLoading(false); // Stop loading once everything is ready
    };

    if (!isInitialized.current) {
      initialize();
      isInitialized.current = true;
    }
  }, [handleRandomize]);

  useEffect(() => {
    if (showStats) {
      document.addEventListener('click', handleOutsideClick);
    } else {
      document.removeEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showStats, handleOutsideClick]);

   // Render
  return (
    <TooltipProvider>
      <div className="flex flex-col items-center w-full min-h-screen p-4">
        <header className="flex items-center justify-between w-full p-4 border-b">
          <Link href="#" className="text-lg font-semibold" prefetch={false}>
            Logo
          </Link>
          <HoverCard open={showStats}>
            <HoverCardTrigger asChild>
              <Button variant="secondary" onClick={handleCalculateStats}>
                View Stats
              </Button>
            </HoverCardTrigger>
            <HoverCardContent ref={hoverCardRef}>
              <p><strong>Total Population:</strong> {population}</p>
              <p><strong>Planet Name:</strong> {worldData.planetName}</p>
              <p><strong>Country Name:</strong> {worldData.countryName}</p>
              <div>
                <h3>Major Metrics:</h3>
                <p>Fertility Rate: {majorMetrics.fertilityRate}</p>
                <p>Education Access: {majorMetrics.educationAccess}</p>
                <p>Job Access: {majorMetrics.jobAccess}</p>
                <p>Wealth Distribution: {majorMetrics.wealthDistribution}</p>
                <h4>Social Indicators:</h4>
                <p>Life Expectancy: {majorMetrics.socialIndicators.lifeExpectancy}</p>
                <p>Infant Mortality Rate: {majorMetrics.socialIndicators.infantMortalityRate}</p>
                <p>Crime Rates: {majorMetrics.socialIndicators.crimeRates}</p>
                <p>Trust in Government: {majorMetrics.socialIndicators.trustInGovernment}</p>
              </div>
              <p><strong>Innate Trait:</strong> {trait ? capitalizeFirstLetter(trait.trait) : 'Generating...'}</p>
            </HoverCardContent>
          </HoverCard>
        </header>
        <main className="flex flex-col items-center w-full max-w-4xl p-4 space-y-8">
          {loading ? (
            <div className="flex space-x-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">Reservation Simulator</h1>
              <Button onClick={handleRandomize}>Randomize All</Button>
              <section className="w-full space-y-4">
                <h2 className="text-2xl font-semibold">World Generator</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="planet-name">Planet Name</Label>
                    <div className="flex space-x-2">
                      <Input id="planet-name" value={worldData.planetName} onChange={(e) => handlePlanetNameChange(e.target.value)} placeholder="Planet Name" />
                      <Button variant="secondary" onClick={async () => handlePlanetNameChange(await generatePlanetName())}>Randomize</Button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="country-name">Country Name</Label>
                    <div className="flex space-x-2">
                      <Input id="country-name" value={worldData.countryName} onChange={(e) => handleCountryNameChange(e.target.value)} placeholder="Country Name" />
                      <Button variant="secondary" onClick={async () => handleCountryNameChange(await generateCountryName())}>Randomize</Button>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="total-population">Total Population</Label>
                    <Input id="total-population" value={population} onChange={(e) => setPopulation(e.target.value)} placeholder="Total Population" />
                  </div>
                </div>
              </section>
              <section className="w-full space-y-4">
                <h2 className="text-2xl font-semibold">Innate Trait</h2>
                <div>
                  {trait ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="cursor-help">
                          Trait: {capitalizeFirstLetter(trait.trait)}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[300px] whitespace-normal break-words">
                        <p>{traitDescription || "Loading description..."}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <p>Generating trait...</p>
                  )}
                </div>
                <Button variant="secondary" onClick={handleGenerateTrait}>Randomize Trait</Button>
              </section>
              <section className="w-full space-y-4">
                <h2 className="text-2xl font-semibold">Social Classes</h2>
                <div className="flex flex-wrap gap-2">
                  {socialClasses.map((className, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <span className="px-2 py-1 bg-gray-200 rounded-full">{className}</span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[200px] whitespace-normal break-words">
                        <p>{classDescriptions[className]}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </section>
              <Button className="mt-8" onClick={onStartSimulation}>Start Simulation</Button>
            </>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}