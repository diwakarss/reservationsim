import { useState, useEffect, useCallback, useRef } from 'react';
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { generatePlanetName, generateCountryName, generateSocialClasses, generateTrait, generatePopulation, Trait, SocialClass } from '../lib/nameGenerator';
import { generateTraitDescription, generateClassDescription } from '../lib/descriptionGenerator';
import { getInitialFertilityRate, getInitialPopulationDistribution, getInitialHigherEducationAccess, getInitialSkilledJobAccess,
   getInitialWealthDistribution, getInitialGDPPerCapita, getInitialSocialIndicators, getInitialPopulationInPoverty } from '../config/initialParameters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useSimulationContext } from '@/contexts/simulationcontext';
import { initialConditions } from '@/lib/calculations';


// Skeleton component for loading state
export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3 animate-pulse">
      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
      <div className="space-y-6">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export function Start({ onStartSimulation }: { onStartSimulation: (data: any) => void }) {
  const { setClasses, setMetrics } = useSimulationContext();
  const isInitialized = useRef(false);
  const [worldData, setWorldData] = useState({ planetName: '', countryName: '' });
  const [trait, setTrait] = useState<Trait | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [traitDescription, setTraitDescription] = useState('');
  const [classDescriptions, setClassDescriptions] = useState<Record<string, string>>({});
  const [socialClasses, setSocialClasses] = useState<string[]>([]);
  const [population, setPopulation] = useState('');
  const [majorMetrics, setMajorMetrics] = useState({
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
    },
  });

  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const hoverCardRef = useRef<HTMLDivElement | null>(null);

  const capitalizeFirstLetter = (string: string | undefined) => {
    if (!string) return '';
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const updateWorldData = (newPlanetName: string, newCountryName: string) => {
    setWorldData({ planetName: newPlanetName, countryName: newCountryName });
  };

  const updateTraitDescription = useCallback(async (newTrait: Trait, planetName: string, countryName: string) => {
    if (newTrait && planetName && countryName) {
      const description = await generateTraitDescription(newTrait, planetName, countryName);
      setTraitDescription(description);
    }
  }, []);

  const calculateMajorMetrics = useCallback(() => {
    if (socialClasses.length === 0) {
      console.log('No social classes available yet');
      return;
    }

    try {
      const popDistribution = getInitialPopulationDistribution();
      const fertRate = getInitialFertilityRate();
      const eduAccess = getInitialHigherEducationAccess();
      const jobAccess = getInitialSkilledJobAccess();
      const wealthDist = getInitialWealthDistribution();
      const poverty = getInitialPopulationInPoverty();
      const gdp = getInitialGDPPerCapita();
      const socialInd = getInitialSocialIndicators();
      
      // Validate all metrics are available
      if (!fertRate || !eduAccess || !jobAccess || !wealthDist || !poverty || !gdp || !socialInd) {
        console.error('Some metrics are missing');
        return;
      }

      const newMetrics = {
        fertilityRate: Number(fertRate.aggregated.toFixed(2)),
        educationAccess: Number((eduAccess.aggregated * 100).toFixed(2)),
        jobAccess: Number((jobAccess.aggregated * 100).toFixed(2)),
        wealthDistribution: Number((wealthDist.median * 100).toFixed(2)),
        populationInPoverty: Number(poverty.aggregated.toFixed(2)),
        gdpPerCapita: Number(gdp.aggregated.toFixed(2)),
        socialIndicators: {
          lifeExpectancy: Number(socialInd.aggregated.lifeExpectancy.toFixed(2)),
          infantMortalityRate: Number(socialInd.aggregated.infantMortalityRate.toFixed(2)),
          crimeRates: socialInd.aggregated.crimeRates,
          trustInGovernment: Number((socialInd.aggregated.trustInGovernment * 100).toFixed(2)),
        },
      };

      // Log the metrics for debugging
      console.log('Population distribution:', popDistribution);
      console.log('Calculated metrics:', newMetrics);

      setMajorMetrics(newMetrics);
      setMetrics(newMetrics);
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  }, [socialClasses, setMetrics]);

  const handleGenerateTrait = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const newTrait = await generateTrait();
      setTrait(newTrait);
      updateTraitDescription(newTrait, worldData.planetName, worldData.countryName);

      const classes = await generateSocialClasses(newTrait, worldData.planetName, worldData.countryName);
      setSocialClasses(classes as SocialClass[]);

      // Store the generated class names in the context
      setClasses(classes as SocialClass[]);

      const descriptions = await Promise.all(
        classes.map(async (className) => {
          const classDesc = await generateClassDescription(className, classes, newTrait, worldData.planetName, worldData.countryName);
          return [className, classDesc];
        })
      );
      setClassDescriptions(Object.fromEntries(descriptions));

      // Calculate metrics after social classes are generated
      setTimeout(calculateMajorMetrics, 0);
    } catch (err) {
      setError('Failed to generate trait. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [worldData, updateTraitDescription, setClasses, calculateMajorMetrics]);

  const handleRandomize = useCallback(async () => {
    try {
      setLoading(true);
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

      // Store the generated class names in the context
      setClasses(classes);

      const traitDesc = await generateTraitDescription(newTrait, newPlanetName, newCountryName);
      setTraitDescription(traitDesc);

      const descriptions = await Promise.all(
        classes.map(async (className) => {
          const classDesc = await generateClassDescription(className, classes, newTrait, newPlanetName, newCountryName);
          return [className, classDesc];
        })
      );
      setClassDescriptions(Object.fromEntries(descriptions));

      // Calculate metrics after social classes are generated
      setTimeout(calculateMajorMetrics, 0);
    } catch (err) {
      setError("Failed to randomize data. Please try again.");
      console.error("Error during randomize:", err);
    } finally {
      setLoading(false);
    }
  }, [updateTraitDescription, setClasses, calculateMajorMetrics]);

  const handleCalculateStats = useCallback(() => {
    if (socialClasses.length === 0) {
      console.log('Cannot calculate stats: No social classes available');
      return;
    }
    calculateMajorMetrics();
    setShowStats(true);
  }, [calculateMajorMetrics, socialClasses]);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (hoverCardRef.current && !hoverCardRef.current.contains(event.target as Node)) {
      setShowStats(false);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        await handleRandomize();
        // Calculate metrics after initialization with a small delay to ensure state updates
        setTimeout(() => {
          calculateMajorMetrics();
          setLoading(false);
        }, 100);
      } catch (error) {
        console.error('Error during initialization:', error);
        setLoading(false);
      }
    };

    if (!isInitialized.current) {
      initialize();
      isInitialized.current = true;
    }
  }, [handleRandomize, calculateMajorMetrics]);

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

  const handleStartSimulation = useCallback(() => {
    const simulationData = {
      worldData,
      trait,
      socialClasses,
      population,
      metrics: initialConditions,
      majorMetrics
    };

    // Save the simulation data to localStorage or a global state management solution
    localStorage.setItem('simulationData', JSON.stringify(simulationData));

    // Call the onStartSimulation prop to handle navigation
    onStartSimulation(simulationData);
  }, [worldData, trait, socialClasses, population, majorMetrics, onStartSimulation]);

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
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Fertility Rate: {majorMetrics.fertilityRate} <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average number of children born to a woman over her lifetime.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Education Access: {majorMetrics.educationAccess}% <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of population with access to primary, secondary, and tertiary education, weighted more heavily towards higher education.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Job Access: {majorMetrics.jobAccess}% <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of working-age population with access to skilled employment opportunities, influenced by tertiary education levels.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Wealth Distribution: {majorMetrics.wealthDistribution}% <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of total wealth owned by the middle class, indicating the distribution of wealth across society.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Population in Poverty: {majorMetrics.populationInPoverty}% <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of total population living below the poverty line.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>GDP per Capita: {majorMetrics.gdpPerCapita} <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average economic output per person, adjusted for population distribution across social classes.</p>
                  </TooltipContent>
                </Tooltip>

                <h4>Social Indicators:</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Life Expectancy: {majorMetrics.socialIndicators.lifeExpectancy} <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Average number of years a person is expected to live, based on current mortality rates.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Infant Mortality Rate: {majorMetrics.socialIndicators.infantMortalityRate} <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of deaths per 1,000 live births before reaching one year of age.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Crime Rates: {majorMetrics.socialIndicators.crimeRates} <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Overall level of criminal activity in society, categorized by severity.</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p>Trust in Government: {majorMetrics.socialIndicators.trustInGovernment}% <InfoCircledIcon className="inline ml-1 h-4 w-4 cursor-help" /></p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Percentage of population that trusts the government and public institutions.</p>
                  </TooltipContent>
                </Tooltip>
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
              <SkeletonCard />
              <SkeletonCard />
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
                    <Label>Planet Name: {worldData.planetName}</Label>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Country Name: {worldData.countryName}</Label>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Label>Total Population: {population}</Label>
                  </div>
                </div>
              </section>
              <section className="w-full space-y-4">
                <h2 className="text-2xl font-semibold flex items-center">
                  Innate Trait
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircledIcon className="ml-1 h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>An innate trait is a natural characteristic that affects the entire population, influencing their behavior and society.</p>
                    </TooltipContent>
                  </Tooltip>
                </h2>
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
                <h2 className="text-2xl font-semibold flex items-center">
                  Social Classes
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoCircledIcon className="ml-1 h-4 w-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Social classes represent different groups in society based on economic and social status, affecting various aspects of life.</p>
                    </TooltipContent>
                  </Tooltip>
                </h2>
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
              <Button className="mt-8" onClick={handleStartSimulation}>Start Simulation</Button>
            </>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}
