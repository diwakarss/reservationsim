'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { generatePlanetName, generateCountryName, generateSocialClasses, generateTrait, generatePopulation, Trait, SocialClass } from '../lib/nameGenerator';
import { generateTraitDescription, generateClassDescription } from '../lib/descriptionGenerator';
import { initialParameters } from '../config/initialParameters';
import { calculateFertilityRate, calculateEducationAccess, calculateJobAccess, calculateWealthDistribution, calculateSocialIndicators } from '../config/initialParameters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Start({ onStartSimulation }: { onStartSimulation: () => void }) {
  // State declarations
  const [planetName, setPlanetName] = useState('');
  const [countryName, setCountryName] = useState('');
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
      crimeRates: [],
      trustInGovernment: 0
    }
  });
  
  // Ref to track if the component has initialized
  const isInitialized = useRef(false);

  // Helper function to capitalize first letter of each word
  const capitalizeFirstLetter = (string: string | undefined) => {
    if (!string) return '';
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  // Function to update trait description
  const updateTraitDescription = useCallback(async (newTrait: Trait, planetName: string, countryName: string) => {
    if (newTrait && planetName && countryName) {
      const description = await generateTraitDescription(newTrait, planetName, countryName);
      setTraitDescription(description);
    }
  }, []);

  // Function to generate a new trait
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
  }, [planetName, countryName, updateTraitDescription]);

  // Function to calculate major metrics
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
        crimeRates: calculateSocialIndicators(socialClasses).crimeRates,
        trustInGovernment: Number(calculateSocialIndicators(socialClasses).trustInGovernment.toFixed(2))
      }
    };

    setMajorMetrics(newMetrics);
    console.log('Updated metrics:', newMetrics);
  }, [socialClasses]);

  // Function to update simulation data
  const updateData = useCallback(async () => {
    if (!trait || !planetName || !countryName || isInitialized.current) return;

    try {
      isInitialized.current = true;

      // Generate and update social classes
      const classes = await generateSocialClasses(trait);
      setSocialClasses(classes);

      // Generate and update class descriptions
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

      setClassDescriptions(Object.fromEntries(descriptions));

      // Update trait description
      const traitDesc = await generateTraitDescription(trait, planetName, countryName);
      setTraitDescription(traitDesc);

      // Recalculate metrics
      calculateMajorMetrics();

      console.log('Updated data with planet:', planetName, 'country:', countryName);

    } catch (error) {
      console.error("Error updating data:", error);
      setError("Failed to update simulation data. Please try again.");
    }
  }, [trait, planetName, countryName, calculateMajorMetrics]);

  // Function to randomize all values
  const handleRandomize = useCallback(async () => {
    if (isInitialized.current) return;

    try {
      // Generate new values
      const newPlanetName = await generatePlanetName();
      const newCountryName = await generateCountryName();
      const newPopulation = generatePopulation();
      const newTrait = await generateTrait();

      // Update state with new values
      setPlanetName(newPlanetName);
      setCountryName(newCountryName);
      setPopulation(newPopulation);
      setTrait(newTrait);

      // Generate and update social classes
      const classes = await generateSocialClasses(newTrait);
      setSocialClasses(classes);

      // Update trait description
      const traitDesc = await generateTraitDescription(newTrait, newPlanetName, newCountryName);
      setTraitDescription(traitDesc);

      // Generate and update class descriptions
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

      console.log('Updated planet:', newPlanetName, 'country:', newCountryName);

      isInitialized.current = true;
    } catch (error) {
      setError("Failed to randomize data. Please try again.");
      console.error("Error during randomize:", error);
    }
  }, [calculateMajorMetrics]);

  // Effect to initialize component
  useEffect(() => {
    const initializeComponent = async () => {
      if (isInitialized.current) return;

      try {
        const newPlanetName = await generatePlanetName();
        const newCountryName = await generateCountryName();
        const newPopulation = generatePopulation();
        const newTrait = await generateTrait();

        setPlanetName(newPlanetName);
        setCountryName(newCountryName);
        setPopulation(newPopulation);
        setTrait(newTrait);

        const classes = await generateSocialClasses(newTrait);
        setSocialClasses(classes);

        updateTraitDescription(newTrait, newPlanetName, newCountryName);

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

        calculateMajorMetrics();

        isInitialized.current = true;
      } catch (error) {
        setError("Failed to initialize component. Please refresh the page.");
        console.error("Error during initialization:", error);
      }
    };

    initializeComponent();
  }, [calculateMajorMetrics, updateTraitDescription]);

  // Effect to update data when key values change
  useEffect(() => {
    if (trait && planetName && countryName) {
      updateData();
    }
  }, [trait, planetName, countryName, updateData]);

  // Effect to recalculate metrics when socialClasses change
  useEffect(() => {
    if (socialClasses.length > 0) {
      calculateMajorMetrics();
    }
  }, [socialClasses, calculateMajorMetrics]);

  // Render component
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
              <p><strong>Total Population:</strong> 37,60,03,824</p>
              <p><strong>Planet Name:</strong> Zyronia</p>
              <p><strong>Country Name:</strong> Cascadea</p>
              <div>
                <h3>Major Metrics:</h3>
                <p>Fertility Rate: {majorMetrics.fertilityRate}</p>
                <p>Education Access: {majorMetrics.educationAccess}</p>
                <p>Job Access: {majorMetrics.jobAccess}</p>
                <p>Wealth Distribution: {majorMetrics.wealthDistribution}</p>
                <h4>Social Indicators:</h4>
                <p>Life Expectancy: {majorMetrics.socialIndicators.lifeExpectancy}</p>
                <p>Infant Mortality Rate: {majorMetrics.socialIndicators.infantMortalityRate}</p>
                <p>Crime Rates:</p>
                <p>Trust in Government: {majorMetrics.socialIndicators.trustInGovernment}</p>
              </div>
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