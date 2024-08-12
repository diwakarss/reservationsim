'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generatePlanetName, generateCountryName, generateSocialClasses, generateTrait, generatePopulation, Trait, SocialClass } from '../lib/nameGenerator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generateTraitDescription, generateClassDescription } from '../lib/descriptionGenerator';
import { initialParameters } from '../config/initialParameters';
import { calculateFertilityRate, calculateEducationAccess, calculateJobAccess, calculateWealthDistribution, calculateSocialIndicators } from '../config/initialParameters';

export function Start({ onStartSimulation }: { onStartSimulation: () => void }) {
  const [planetName, setPlanetName] = useState('');
  const [countryName, setCountryName] = useState('');
  const [trait, setTrait] = useState<Trait | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [traitDescription, setTraitDescription] = useState('');
  const [classDescriptions, setClassDescriptions] = useState<Record<string, string>>({});
  const [socialClasses, setSocialClasses] = useState<SocialClass[]>([]);
  const [population, setPopulation] = useState('');
  const [majorMetrics, setMajorMetrics] = useState<Record<string, any>>({});
  

  const isInitialized = useRef(false); // To track if the component has initialized

  const capitalizeFirstLetter = (string: string | undefined) => {
    if (!string) return '';
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleGenerateTrait = useCallback(async () => {
    try {
      setError(null);
      const newTrait = await generateTrait();
      setTrait(newTrait);
      updateTraitDescription(newTrait, planetName, countryName);

      const classes = await generateSocialClasses(newTrait);
      setSocialClasses(classes);
    } catch (err) {
      setError('Failed to generate trait. Please try again.');
      console.error(err);
    }
  }, [planetName, countryName]);

  const updateTraitDescription = useCallback(async (newTrait: Trait, planetName: string, countryName: string) => {
    if (newTrait && planetName && countryName) {
      const description = await generateTraitDescription(newTrait, planetName, countryName);
      setTraitDescription(description);
    }
  }, []);

  const calculateMajorMetrics = useCallback(() => {
    // Assume functions like calculateFertilityRate, calculateEducationAccess, etc., are predefined
   const fertilityRate = calculateFertilityRate(socialClasses);
    const educationAccess = calculateEducationAccess(socialClasses);
    const jobAccess = calculateJobAccess(socialClasses);
    const wealthDistribution = calculateWealthDistribution(socialClasses);
    const socialIndicators = calculateSocialIndicators(socialClasses);

    setMajorMetrics({
      fertilityRate,
      educationAccess,
      jobAccess,
      wealthDistribution,
      socialIndicators,
    });
  }, [socialClasses]);

  const updateData = useCallback(async () => {
    if (!trait || !planetName || !countryName) return;

    console.log('Updating data');
    try {
      const classes = await generateSocialClasses(trait);
      setSocialClasses((prevClasses) => {
        if (JSON.stringify(prevClasses) === JSON.stringify(classes)) {
          return prevClasses; // No change, avoid re-render
        }
        return classes;
      });

      const descriptions = await Promise.all(
        classes.map(async (className) => {
          try {
            const classDesc = await generateClassDescription(className, classes, trait, planetName, countryName);
            return [className, classDesc];
          } catch (error) {
            console.error(`Error generating description for ${className}:`, error);
            return [className, `Failed to generate description: ${error instanceof Error ? error.message : String(error)}`];
          }
        })
      );

      setClassDescriptions((prevDescriptions) => {
        const newDescriptions = Object.fromEntries(descriptions);
        if (JSON.stringify(prevDescriptions) === JSON.stringify(newDescriptions)) {
          return prevDescriptions; // No change, avoid re-render
        }
        return newDescriptions;
      });

      // Recalculate metrics after updating data
      calculateMajorMetrics();

    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update simulation data. Please try again.");
    }
  }, [trait, planetName, countryName, calculateMajorMetrics]);

  const handleRandomize = useCallback(async () => {
    if (isInitialized.current) return; // Skip if already initialized

    console.log('Randomizing values');
    try {
      const [newTrait, newPlanetName, newCountryName] = await Promise.all([
        generateTrait(),
        generatePlanetName(),
        generateCountryName(),
      ]);

      setTrait(newTrait);
      setPlanetName(newPlanetName);
      setCountryName(newCountryName);
      setPopulation(generatePopulation());
      const classes = await generateSocialClasses(newTrait);
      setSocialClasses(classes);
      updateTraitDescription(newTrait, newPlanetName, newCountryName);

      // Generate descriptions for social classes
      const descriptions = await Promise.all(
        classes.map(async (className) => {
          try {
            const classDesc = await generateClassDescription(className, classes, newTrait, newPlanetName, newCountryName);
            return [className, classDesc];
          } catch (error) {
            console.error(`Error generating description for ${className}:`, error);
            return [className, `Failed to generate description: ${error instanceof Error ? error.message : String(error)}`];
          }
        })
      );
      setClassDescriptions(Object.fromEntries(descriptions));

      // Calculate initial metrics
      calculateMajorMetrics();

      isInitialized.current = true; // Mark as initialized
    } catch (error) {
      setError("Failed to randomize data. Please try again.");
      console.error("Error during randomize:", error);
    }
  }, [calculateMajorMetrics, updateTraitDescription]);

  useEffect(() => {
    console.log('Component mounted');
    handleRandomize();
  }, [handleRandomize]);

  useEffect(() => {
    console.log('Trait, PlanetName, or CountryName changed');
    if (trait && planetName && countryName) {
      updateData();
    }
  }, [trait, planetName, countryName, updateData]);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center w-full min-h-screen p-4">
        <header className="flex items-center justify-between w-full p-4 border-b">
          <Link href="#" className="text-lg font-semibold" prefetch={false}>
            Logo
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="#" className="text-lg" prefetch={false}>
                View Stats
              </Link>
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] p-2 whitespace-normal">
              <p><strong>Total Population:</strong> {population}</p>
              <p><strong>Planet Name:</strong> {planetName}</p>
              <p><strong>Country Name:</strong> {countryName}</p>
              <p><strong>Fertility Rate:</strong> {majorMetrics.fertilityRate}</p>
              <p><strong>Education Access:</strong> {majorMetrics.educationAccess}</p>
              <p><strong>Job Access:</strong> {majorMetrics.jobAccess}</p>
              <p><strong>Wealth Distribution:</strong> {majorMetrics.wealthDistribution}</p>
              <p><strong>Social Indicators:</strong> {majorMetrics.socialIndicators}</p>
              <p><strong>Innate Trait:</strong> {trait ? capitalizeFirstLetter(trait.trait) : 'Generating...'}</p>
            </TooltipContent>
          </Tooltip>
        </header>
        <main className="flex flex-col items-center w-full max-w-4xl p-4 space-y-8">
          <h1 className="text-3xl font-bold">Reservation Simulator</h1>
          <Button onClick={handleRandomize}>Randomize All</Button>
          <section className="w-full space-y-4">
            <h2 className="text-2xl font-semibold">World Generator</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="planet-name">Planet Name</Label>
                <div className="flex space-x-2">
                  <Input id="planet-name" value={planetName} onChange={(e) => setPlanetName(e.target.value)} placeholder="Planet Name" />
                  <Button variant="secondary" onClick={async () => setPlanetName(await generatePlanetName())}>Randomize</Button>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                <Label htmlFor="country-name">Country Name</Label>
                <div className="flex space-x-2">
                  <Input id="country-name" value={countryName} onChange={(e) => setCountryName(e.target.value)} placeholder="Country Name" />
                  <Button variant="secondary" onClick={async () => setCountryName(await generateCountryName())}>Randomize</Button>
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
                  <TooltipTrigger>
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
        </main>
      </div>
    </TooltipProvider>
  );
}