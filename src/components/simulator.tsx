'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Play, Pause, SkipForward, Rewind, FastForward, SkipBack, StepBack, Loader } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, Bar, LineChart, Line, Cell, YAxis } from "recharts";
import { useSimulationContext } from '@/contexts/simulationcontext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SimulationData } from '../app/page';
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { calculateNextTimeStep, type ClassMetrics, type ReservationSettings } from '../lib/calculations';
import type { ChartConfig } from "@/components/ui/chart";
import { Typography } from "@/components/ui/typography";
import { ChartLoadingOverlay } from "@/components/chart-loading-overlay";

export interface SimulatorProps {
  initialData: SimulationData;
}

interface ChartDataPoint {
  class: string;
  population?: number;
  primary?: number;
  secondary?: number;
  tertiary?: number;
  wealth?: number;
  gdp?: number;
  poverty?: number;
  lifeExpectancy?: number;
  infantMortality?: number;
  fill: string;
}

const COLORS = [
  'hsl(12, 76%, 61%)',   // Red (Class 1)
  'hsl(173, 58%, 39%)',  // Teal (Class 2)
  'hsl(197, 37%, 24%)',  // Dark Blue (Class 3)
  'hsl(43, 74%, 66%)',   // Gold (Class 4)
  'hsl(27, 87%, 67%)'    // Orange (Class 5)
];

export function Simulator({ initialData }: SimulatorProps) {
  const { classes } = useSimulationContext();
  const startYear = new Date().getFullYear();
  const [currentYear, setCurrentYear] = useState(startYear);
  const [isPlaying, setIsPlaying] = useState(false);
  const maxYear = startYear + 500;
  const [totalReservationCap, setTotalReservationCap] = useState<number | null>(null); // null means no cap
  const [classReservations, setClassReservations] = useState<Record<string, number>>({
    class2: 0,
    class3: 0,
    class4: 0,
    class5: 0
  });
  const [remainingGeneralQuota, setRemainingGeneralQuota] = useState(100);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ewsSettings, setEwsSettings] = useState({
    percentage: 0,
    allClassesEligible: false
  });
  const [savedSettings, setSavedSettings] = useState<{
    totalReservationCap: number | null;
    classReservations: Record<string, number>;
    ewsSettings: {
      percentage: number;
      allClassesEligible: boolean;
    };
  }>({
    totalReservationCap: null,
    classReservations: {
      class2: 0,
      class3: 0,
      class4: 0,
      class5: 0
    },
    ewsSettings: {
      percentage: 0,
      allClassesEligible: false
    }
  }); 
  const { toast } = useToast(); 

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [timeStepResults, setTimeStepResults] = useState<Record<number, Record<string, ClassMetrics>>>({});
  const [currentMetrics, setCurrentMetrics] = useState(initialData.majorMetrics);
  const [chartData, setChartData] = useState({
    populationData: [] as any[],
    educationData: [] as any[],
    wealthData: [] as any[],
    socialData: [] as any[]
  });

  const [chartLoading, setChartLoading] = useState({
    population: false,
    education: false,
    wealth: false,
    social: false,
    gdp: false,
    poverty: false,
    error: {
      population: false,
      education: false,
      wealth: false,
      social: false,
      gdp: false,
      poverty: false
    }
  });
  const [calculationPending, setCalculationPending] = useState(false);
  const stableYearTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastYearChangeTime = useRef<number>(Date.now());

  const handleTotalCapChange = (value: string) => {
    if (value === '') {
      setTotalReservationCap(null);
      // When cap is removed, recalculate remaining quota based on actual reservations
      const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
      setRemainingGeneralQuota(Math.max(0, 100 - totalReservation));
      setErrors(prev => {
        const { totalCap, ...rest } = prev;
        return rest;
      });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setErrors(prev => ({
        ...prev,
        totalCap: 'Please enter a valid number'
      }));
      return;
    }

    if (numValue < 0 || numValue > 100) {
      setErrors(prev => ({
        ...prev,
        totalCap: 'Total cap must be between 0% and 100%'
      }));
      return;
    }

    setTotalReservationCap(numValue);
    setRemainingGeneralQuota(100 - numValue);
    
    // Validate existing reservations against new cap
    const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
    if (totalReservation > numValue) {
      setErrors(prev => ({
        ...prev,
        totalCap: `Current total reservations (${totalReservation}%) exceed the new cap (${numValue}%)`
      }));
    } else {
      setErrors(prev => {
        const { totalCap, ...rest } = prev;
        return rest;
      });
    }
  };

  // Memoize settings to prevent unnecessary recalculations
  const currentSettings = useMemo(() => ({
    classReservations: savedSettings.classReservations,
    ewsSettings: savedSettings.ewsSettings,
    totalReservationCap: savedSettings.totalReservationCap
  }), [savedSettings]);

  // Memoize the time step calculation
  const currentTimeStep = useMemo(() => 
    Math.floor((currentYear - startYear) / 5),
    [currentYear, startYear]
  );
  
  // Memoize the calculation function with stable dependencies
  const calculateCurrentMetrics = useCallback((year: number) => {
    try {
      const timeStep = Math.floor((year - startYear) / 5);
      
      // Set all charts to loading
      setChartLoading({
        population: true,
        education: true,
        wealth: true,
        social: true,
        gdp: true,
        poverty: true,
        error: {
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false
        }
      });
      
      // If we already have results for this time step, just update loading and return early
      if (timeStepResults[timeStep]) {
        setTimeout(() => {
          setChartLoading({
            population: false,
            education: false,
            wealth: false,
            social: false,
            gdp: false,
            poverty: false,
            error: {
              population: false,
              education: false,
              wealth: false,
              social: false,
              gdp: false,
              poverty: false
            }
          });
        }, 500); // Small delay for UX
        return;
      }
      
      // Get previous time step results or initial conditions
      const prevTimeStep = timeStep - 1;
      const prevMetrics = timeStepResults[prevTimeStep] || initialData.metrics;

      // Calculate next time step with proper ReservationSettings type
      const settings: ReservationSettings = {
        classReservations: currentSettings.classReservations,
        ewsSettings: currentSettings.ewsSettings,
        totalReservationCap: currentSettings.totalReservationCap
      };
      const newResults = calculateNextTimeStep(prevMetrics, settings, timeStep);
      
      if (!newResults) {
        // If calculation failed, clear loading
        setChartLoading({
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false,
          error: {
            population: false,
            education: false,
            wealth: false,
            social: false,
            gdp: false,
            poverty: false
          }
        });
        return;
      }

      // Calculate aggregated metrics
      let totalPopulation = 0;
      let weightedMetrics = {
        fertility: 0,
        education: 0,
        jobs: 0,
        wealth: 0,
        poverty: 0,
        gdp: 0,
        lifeExpectancy: 0,
        infantMortality: 0
      };

      // Calculate weighted metrics based on population distribution
      Object.values(newResults).forEach((metrics: ClassMetrics) => {
        totalPopulation += metrics.population;
        weightedMetrics.fertility += metrics.fertility * metrics.population;
        weightedMetrics.education += metrics.education.tertiary * metrics.population;
        weightedMetrics.jobs += metrics.jobAccess * metrics.population;
        weightedMetrics.wealth += metrics.wealth * metrics.population;
        weightedMetrics.poverty += metrics.povertyRate * metrics.population;
        weightedMetrics.gdp += metrics.gdpPerCapita * metrics.population;
        weightedMetrics.lifeExpectancy += metrics.socialIndicators.lifeExpectancy * metrics.population;
        weightedMetrics.infantMortality += metrics.socialIndicators.infantMortality * metrics.population;
      });

      // Normalize weighted metrics
      Object.keys(weightedMetrics).forEach(key => {
        weightedMetrics[key as keyof typeof weightedMetrics] /= totalPopulation;
      });

      // Determine crime level
      const crimeLevel = weightedMetrics.poverty > 40 && weightedMetrics.education < 50 
        ? 'very high' 
        : weightedMetrics.poverty > 30 && weightedMetrics.education < 60 
          ? 'high' 
          : weightedMetrics.poverty > 20 && weightedMetrics.education < 70 
            ? 'medium' 
            : 'low';

      // Prepare all updates in a batch
      const updates = {
        timeStepResults: {
          ...timeStepResults,
          [timeStep]: newResults
        },
        currentMetrics: {
          fertilityRate: Number(weightedMetrics.fertility.toFixed(2)),
          educationAccess: Number(weightedMetrics.education.toFixed(2)),
          jobAccess: Number(weightedMetrics.jobs.toFixed(2)),
          wealthDistribution: Number(weightedMetrics.wealth.toFixed(2)),
          populationInPoverty: Number(weightedMetrics.poverty.toFixed(2)),
          gdpPerCapita: Number(weightedMetrics.gdp.toFixed(2)),
          socialIndicators: {
            lifeExpectancy: Number(weightedMetrics.lifeExpectancy.toFixed(2)),
            infantMortalityRate: Number(weightedMetrics.infantMortality.toFixed(2)),
            crimeRates: crimeLevel,
            trustInGovernment: Math.max(20, Math.min(90, 38 + timeStep))
          }
        },
        chartData: {
          populationData: classes.map((className, index) => ({
            class: className,
            population: newResults[className]?.population || 0,
            fill: COLORS[index % COLORS.length]
          })),
          educationData: classes.map((className, index) => ({
            class: className,
            primary: newResults[className]?.education.primary || 0,
            secondary: newResults[className]?.education.secondary || 0,
            tertiary: newResults[className]?.education.tertiary || 0,
            fill: COLORS[index % COLORS.length]
          })),
          wealthData: classes.map((className, index) => ({
            class: className,
            wealth: newResults[className]?.wealth || 0,
            gdp: newResults[className]?.gdpPerCapita || 0,
            poverty: newResults[className]?.povertyRate || 0,
            fill: COLORS[index % COLORS.length]
          })),
          socialData: classes.map((className, index) => ({
            class: className,
            lifeExpectancy: newResults[className]?.socialIndicators.lifeExpectancy || 0,
            infantMortality: newResults[className]?.socialIndicators.infantMortality || 0,
            fill: COLORS[index % COLORS.length]
          }))
        }
      };

      // Update all state at once to prevent cascading updates
      setTimeStepResults(updates.timeStepResults);
      setCurrentMetrics(updates.currentMetrics);
      setChartData(updates.chartData);

      // Clear loading states with slight delays to show progression
      setTimeout(() => {
        setChartLoading(prev => ({ ...prev, population: false }));
      }, 200);
      setTimeout(() => {
        setChartLoading(prev => ({ ...prev, education: false }));
      }, 400);
      setTimeout(() => {
        setChartLoading(prev => ({ ...prev, wealth: false }));
      }, 600);
      setTimeout(() => {
        setChartLoading(prev => ({ ...prev, gdp: false, poverty: false }));
      }, 800);
      setTimeout(() => {
        setChartLoading(prev => ({ ...prev, social: false }));
      }, 1000);

    } catch (error) {
      console.error('Error calculating metrics:', error);
      // Clear loading on error
      setChartLoading({
        population: false,
        education: false,
        wealth: false,
        social: false,
        gdp: false,
        poverty: false,
        error: {
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false
        }
      });
    }
  }, [currentSettings, timeStepResults, initialData.metrics, startYear, classes]);
  
  // Debounced year change handler with stable reference
  const debouncedYearChange = useCallback(
    (value: number[]) => {
      const newYear = value[0];
      if (newYear !== currentYear) {
        setCurrentYear(newYear);
        lastYearChangeTime.current = Date.now();
        setCalculationPending(true);
        
        // Set all charts to loading
        setChartLoading({
          population: true,
          education: true,
          wealth: true,
          social: true,
          gdp: true,
          poverty: true,
          error: {
            population: false,
            education: false,
            wealth: false,
            social: false,
            gdp: false,
            poverty: false
          }
        });
        
        // Clear any existing timeout
        if (stableYearTimeout.current) {
          clearTimeout(stableYearTimeout.current);
        }
      }
    },
    [currentYear]
  );
  
  // Now add the simulation control functions after calculateCurrentMetrics
  // Define simulation control functions
  const startSimulation = () => {
    setIsPlaying(true);
    
    // Set all charts to loading when play is pressed
    setChartLoading({
      population: true,
      education: true,
      wealth: true,
      social: true,
      gdp: true,
      poverty: true,
      error: {
        population: false,
        education: false,
        wealth: false,
        social: false,
        gdp: false,
        poverty: false
      }
    });
    
    setCalculationPending(true);
    
    // Initial calculation to ensure we have data for the first year
    calculateCurrentMetrics(currentYear);
    
    intervalRef.current = setInterval(() => {
      setCurrentYear(prev => {
        const newYear = Math.min(prev + 5, maxYear);
        if (newYear !== prev) {
          lastYearChangeTime.current = Date.now();
          
          // Only recalculate if we don't have this timestep already
          const timeStep = Math.floor((newYear - startYear) / 5);
          if (!timeStepResults[timeStep]) {
            calculateCurrentMetrics(newYear);
          }
        }
        return newYear;
      });
    }, 1000); // Update every second
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // When paused, start the 3-second timer for calculations
    if (stableYearTimeout.current) {
      clearTimeout(stableYearTimeout.current);
    }
    
    stableYearTimeout.current = setTimeout(() => {
      calculateCurrentMetrics(currentYear);
      setCalculationPending(false);
      
      // Clear all loading states
      setChartLoading({
        population: false,
        education: false,
        wealth: false,
        social: false,
        gdp: false,
        poverty: false,
        error: {
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false
        }
      });
    }, 3000);
  };

  const rewindToStart = () => {
    const newYear = startYear;
    setCurrentYear(newYear);
    
    // If year actually changed, start loading
    if (newYear !== currentYear) {
      lastYearChangeTime.current = Date.now();
      setCalculationPending(true);
      setChartLoading({
        population: true,
        education: true,
        wealth: true,
        social: true,
        gdp: true,
        poverty: true,
        error: {
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false
        }
      });
      
      // Clear any existing timeout
      if (stableYearTimeout.current) {
        clearTimeout(stableYearTimeout.current);
      }
      
      // Set timeout to detect stable year
      stableYearTimeout.current = setTimeout(() => {
        calculateCurrentMetrics(newYear);
        setCalculationPending(false);
      }, 3000);
    }
  };

  const rewindYear = () => {
    const newYear = Math.max(startYear, currentYear - 20);
    setCurrentYear(newYear);
    
    // If year actually changed, start loading
    if (newYear !== currentYear) {
      lastYearChangeTime.current = Date.now();
      setCalculationPending(true);
      setChartLoading({
        population: true,
        education: true,
        wealth: true,
        social: true,
        gdp: true,
        poverty: true,
        error: {
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false
        }
      });
      
      // Clear any existing timeout
      if (stableYearTimeout.current) {
        clearTimeout(stableYearTimeout.current);
      }
      
      // Set timeout to detect stable year
      stableYearTimeout.current = setTimeout(() => {
        calculateCurrentMetrics(newYear);
        setCalculationPending(false);
      }, 3000);
    }
  };

  const skipYear = () => {
    const newYear = Math.min(currentYear + 20, maxYear);
    setCurrentYear(newYear);
    
    // If year actually changed, start loading
    if (newYear !== currentYear) {
      lastYearChangeTime.current = Date.now();
      setCalculationPending(true);
      setChartLoading({
        population: true,
        education: true,
        wealth: true,
        social: true,
        gdp: true,
        poverty: true,
        error: {
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false
        }
      });
      
      // Clear any existing timeout
      if (stableYearTimeout.current) {
        clearTimeout(stableYearTimeout.current);
      }
      
      // Set timeout to detect stable year
      stableYearTimeout.current = setTimeout(() => {
        calculateCurrentMetrics(newYear);
        setCalculationPending(false);
      }, 3000);
    }
  };
  
  // Modify the useEffect to trigger calculation when the year is stable
  useEffect(() => {
    // Clear any existing timeout
    if (stableYearTimeout.current) {
      clearTimeout(stableYearTimeout.current);
    }
    
    // Set a new timeout to detect when the year has been stable for 3 seconds
    stableYearTimeout.current = setTimeout(() => {
      if (calculationPending) {
        calculateCurrentMetrics(currentYear);
        setCalculationPending(false);
        
        // Clear loading states when calculation completes
        setChartLoading({
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false,
          error: {
            population: false,
            education: false,
            wealth: false,
            social: false,
            gdp: false,
            poverty: false
          }
        });
      }
    }, 3000);
    
    return () => {
      if (stableYearTimeout.current) {
        clearTimeout(stableYearTimeout.current);
      }
    };
  }, [currentYear, calculationPending, calculateCurrentMetrics]);

  // Effect to handle year changes during playback
  useEffect(() => {
    if (isPlaying) {
      lastYearChangeTime.current = Date.now();
      setCalculationPending(true);
      
      // Set all charts to loading during playback
      setChartLoading({
        population: true,
        education: true,
        wealth: true,
        social: true,
        gdp: true,
        poverty: true,
        error: {
          population: false,
          education: false,
          wealth: false,
          social: false,
          gdp: false,
          poverty: false
        }
      });
    } else {
      // If simulation is paused, start the 3-second timer to complete calculations
      if (calculationPending) {
        if (stableYearTimeout.current) {
          clearTimeout(stableYearTimeout.current);
        }
        
        stableYearTimeout.current = setTimeout(() => {
          calculateCurrentMetrics(currentYear);
          setCalculationPending(false);
          
          // Clear all loading states
          setChartLoading({
            population: false,
            education: false,
            wealth: false,
            social: false,
            gdp: false,
            poverty: false,
            error: {
              population: false,
              education: false,
              wealth: false,
              social: false,
              gdp: false,
              poverty: false
            }
          });
        }, 3000);
      }
    }
  }, [isPlaying, currentYear, calculationPending, calculateCurrentMetrics]);

  // Single useEffect to handle metric updates with stable dependencies
  useEffect(() => {
    // Calculate metrics for the first time immediately
    calculateCurrentMetrics(currentYear);
    
    // Rest of your useEffect code
    if (!timeStepResults[currentTimeStep]) {
      calculateCurrentMetrics(currentYear);
    }
  }, [currentTimeStep, calculateCurrentMetrics, currentYear, timeStepResults]);

  useEffect(() => {
    const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
    
    // When cap is set, remaining quota is (100 - cap)
    // When no cap, remaining quota is (100 - actual reservations)
    if (totalReservationCap !== null) {
      setRemainingGeneralQuota(100 - totalReservationCap);
    } else {
      setRemainingGeneralQuota(Math.max(0, 100 - totalReservation));
    }
  }, [classReservations, totalReservationCap]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleReservationChange = (className: string, value: string) => {
    // Skip class1 as it's not eligible for reservation
    if (className === 'class1') return;

    if (value === '') {
      setClassReservations(prev => ({ ...prev, [className]: 0 }));
      setErrors(prev => {
        const { [className]: removed, ...rest } = prev;
        return rest;
      });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setErrors(prev => ({ ...prev, [className]: 'Please enter a valid number' }));
      return;
    }

    if (numValue < 0 || numValue > 100) {
      setErrors(prev => ({ ...prev, [className]: 'Reservation must be between 0% and 100%' }));
      return;
    }

    const newReservations = { ...classReservations, [className]: numValue };
    const totalReservation = Object.values(newReservations).reduce((sum, val) => sum + val, 0);
    const effectiveCap = totalReservationCap !== null ? totalReservationCap : 100;

    if (totalReservation > effectiveCap) {
      setErrors(prev => ({
        ...prev,
        [className]: `Total reservation (${totalReservation}%) exceeds the ${totalReservationCap !== null ? 'cap' : 'maximum'} (${effectiveCap}%)`
      }));
    } else {
      setClassReservations(newReservations);
      setErrors(prev => {
        const { [className]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleBlur = (className: string) => {
    const value = classReservations[className] || 0;
    const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
    const newTotal = totalReservation - (classReservations[className] || 0) + value;

    if (newTotal <= 100) {
      setErrors({
        ...errors,
        [className]: '', // Clear the error on blur if the input is valid
      });
    }
  };

  const handleEWSChange = (value: string) => {
    if (value === '') {
      setEwsSettings(prev => ({ ...prev, percentage: 0 }));
      setErrors(prev => {
        const { ews, ...rest } = prev;
        return rest;
      });
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setErrors(prev => ({
        ...prev,
        ews: 'Please enter a valid number'
      }));
      return;
    }

    if (numValue < 0 || numValue > 100) {
      setErrors(prev => ({
        ...prev,
        ews: 'EWS reservation must be between 0% and 100%'
      }));
      return;
    }

    // Calculate maximum allowed EWS based on remaining general quota
    const maxEWS = remainingGeneralQuota;

    if (numValue > maxEWS) {
      setErrors(prev => ({
        ...prev,
        ews: `EWS reservation cannot exceed remaining general quota (${maxEWS.toFixed(2)}%)`
      }));
      return;
    }

    setEwsSettings(prev => ({
      ...prev,
      percentage: numValue
    }));
    setErrors(prev => {
      const { ews, ...rest } = prev;
      return rest;
    });
  };

  const validateSettings = () => {
    const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
    const effectiveCap = totalReservationCap !== null ? totalReservationCap : 100;
    
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // Validate total reservations against cap
    if (totalReservation > effectiveCap) {
      newErrors.totalCap = `Total reservations (${totalReservation}%) exceed the ${totalReservationCap !== null ? 'cap' : 'maximum'} (${effectiveCap}%)`;
      isValid = false;
    }

    // Validate EWS against remaining general quota
    if (ewsSettings.percentage > remainingGeneralQuota) {
      newErrors.ews = `EWS reservation (${ewsSettings.percentage}%) exceeds remaining general quota (${remainingGeneralQuota}%)`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleApplySettings = () => {
    const isValid = validateSettings();
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please correct the errors before applying settings.",
      });
      return;
    }

    // Save the settings
    setSavedSettings({
      totalReservationCap,
      classReservations,
      ewsSettings
    });

    // Reset time step results to force recalculation with new settings
    setTimeStepResults({});
    
    // Recalculate metrics with new settings
    calculateCurrentMetrics(currentYear);

    toast({
      description: "Your settings have been saved successfully.",
    });
  };

  const handleCloseDrawer = () => {
    if (Object.keys(errors).length > 0) {
      // Reset to last saved settings
      setTotalReservationCap(savedSettings.totalReservationCap);
      setClassReservations(savedSettings.classReservations);
      setEwsSettings(savedSettings.ewsSettings);
      setErrors({});
    }
  };

  useEffect(() => {
    if (savedSettings.totalReservationCap !== null || Object.values(savedSettings.classReservations).some(val => val > 0)) {
    setTotalReservationCap(savedSettings.totalReservationCap);
    setClassReservations(savedSettings.classReservations);
    setEwsSettings(savedSettings.ewsSettings);
    }
  }, [savedSettings]);

  const { populationData, educationData, wealthData, socialData } = chartData;

  const chartConfig: ChartConfig = {
      population: {
      label: "Population",
      color: "hsl(var(--chart-1))"
    },
    primary: {
      label: "Primary Education",
      color: "hsl(var(--chart-2))"
    },
    secondary: {
      label: "Secondary Education",
      color: "hsl(var(--chart-3))"
    },
    tertiary: {
      label: "Tertiary Education",
      color: "hsl(var(--chart-4))"
    },
    wealth: {
      label: "Wealth",
      color: "hsl(var(--chart-5))"
    },
    gdp: {
      label: "GDP per Capita",
      color: "hsl(var(--chart-6))"
    },
    poverty: {
      label: "Poverty Rate",
      color: "hsl(var(--chart-7))"
    },
    lifeExpectancy: {
      label: "Life Expectancy",
      color: "hsl(var(--chart-8))"
    },
    infantMortality: {
      label: "Infant Mortality",
      color: "hsl(var(--chart-9))"
    }
  };

  useEffect(() => {
    // Set default data if no chart data is available
    if (chartData.populationData.length === 0) {
      const defaultClasses = classes.length > 0 ? classes : [
        "Crystal Elite", 
        "Crystallized Upper", 
        "Crystallized Middle", 
        "Crystallizing Lower", 
        "Crystallizing Base"
      ];
      
      setChartData({
        populationData: defaultClasses.map((className, index) => ({
          class: className,
          population: 20 + index * 15,
          fill: COLORS[index % COLORS.length]
        })),
        educationData: defaultClasses.map((className, index) => ({
          class: className,
          primary: 90 - index * 10,
          secondary: 80 - index * 10,
          tertiary: 70 - index * 15,
          fill: COLORS[index % COLORS.length]
        })),
        wealthData: defaultClasses.map((className, index) => ({
          class: className,
          wealth: 100 - index * 15,
          gdp: 80 - index * 10,
          poverty: 5 + index * 15,
          fill: COLORS[index % COLORS.length]
        })),
        socialData: defaultClasses.map((className, index) => ({
          class: className,
          lifeExpectancy: 85 - index * 5,
          infantMortality: 5 + index * 5,
          fill: COLORS[index % COLORS.length]
        }))
      });
    }
  }, [classes, chartData.populationData.length]);

  useEffect(() => {
    console.log("Chart data:", chartData);
    console.log("Classes:", classes);
    console.log("Population data:", chartData.populationData);
  }, [chartData, classes]);

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4">
      <header className="flex items-center justify-between w-full p-4 border-b">
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Reservation Settings</Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerTitle className="p-4 text-2xl font-semibold">Reservation Settings</DrawerTitle>
            <div className="p-4 space-y-4">
              <h2 className="text-2xl font-semibold">Reservation Percentages</h2>
              <div className="grid grid-cols-2 gap-4">
                {[...classes].reverse().map((group) => (
                  <div key={group} className="space-y-2">
                    <Label>{group}</Label>
                    <Input
                      type="text" // Changed from "number" to "text"
                      placeholder="0%"
                      value={classReservations[group] || ''}
                      onChange={(e) => handleReservationChange(group, e.target.value)}
                      onBlur={() => handleBlur(group)} // Clear error on blur
                    />
                    {errors[group] && <p className="text-red-500 text-sm">{errors[group]}</p>}
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Total Reservation Cap</h3>
                <Input
                  type="text"
                  placeholder="0%"
                  value={totalReservationCap !== null ? totalReservationCap.toString() : ''}
                  onChange={(e) => handleTotalCapChange(e.target.value)}
                />
                {errors.totalCap && <p className="text-red-500 text-sm">{errors.totalCap}</p>}
                <div className="flex justify-between">
                  <span>Remaining General Quota: {remainingGeneralQuota.toFixed(2)}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Economically Weaker Section Reservation</h3>
                <p>(Applies to only excluded class)</p>
                <Input
                  type="text" // Changed from "number" to "text"
                  placeholder="0%"
                  value={ewsSettings.percentage || ''}
                  onChange={(e) => handleEWSChange(e.target.value)}
                />
                {errors.ews && <p className="text-red-500 text-sm">{errors.ews}</p>}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="all-classes"
                    checked={ewsSettings.allClassesEligible}
                    onCheckedChange={(checked) => setEwsSettings(prev => ({ ...prev, allClassesEligible: checked }))}
                  />
                  <Label htmlFor="all-classes">All classes are eligible</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <DrawerClose asChild>
                  <Button variant="outline" onClick={handleCloseDrawer}>Close</Button>
                </DrawerClose>
                <Button 
                  onClick={handleApplySettings}
                  disabled={false}
                >
                  Apply
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
        <Link href="#" className="text-lg font-semibold">
          Logo
        </Link>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost">View Stats</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-96">
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">World Information</h4>
                <p className="text-sm">Planet Name: {initialData.worldData.planetName}</p>
                <p className="text-sm">Country Name: {initialData.worldData.countryName}</p>
                <p className="text-sm">Total Population: {initialData.population}</p>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Major Metrics</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm">Fertility Rate: {currentMetrics.fertilityRate}</p>
                  <p className="text-sm">Education Access: {currentMetrics.educationAccess}%</p>
                  <p className="text-sm">Job Access: {currentMetrics.jobAccess}%</p>
                  <p className="text-sm">Wealth Distribution: {currentMetrics.wealthDistribution}%</p>
                  <p className="text-sm">Population in Poverty: {currentMetrics.populationInPoverty}%</p>
                  <p className="text-sm">GDP per Capita: {currentMetrics.gdpPerCapita}</p>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Social Indicators</h4>
                <div className="grid grid-cols-2 gap-2">
                  <p className="text-sm">Life Expectancy: {currentMetrics.socialIndicators.lifeExpectancy} years</p>
                  <p className="text-sm">Infant Mortality Rate: {currentMetrics.socialIndicators.infantMortalityRate}</p>
                  <p className="text-sm">Crime Rates: {currentMetrics.socialIndicators.crimeRates}</p>
                  <p className="text-sm">Trust in Government: {currentMetrics.socialIndicators.trustInGovernment}%</p>
                </div>
              </div>
              {initialData.trait && (
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">Innate Trait</h4>
                  <p className="text-sm">{initialData.trait.trait}</p>
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </header>
      <main className="flex flex-col items-center w-full max-w-7xl p-4 space-y-8">
        <h1 className="text-3xl font-bold">Reservation Simulator</h1>
        
        {calculationPending && (
          <div className="fixed top-4 right-4 bg-background border rounded-md p-2 shadow-md z-50 flex items-center space-x-2">
            <Loader className="h-4 w-4 animate-spin text-primary" />
            <span className="text-sm">Calculating metrics...</span>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Population Distribution</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.population && <ChartLoadingOverlay isLoading={true} />}
              <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <BarChart
                    data={populationData} 
                    barSize={50} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="population"
                      radius={4}
                      isAnimationActive={false}
                    >
                      {populationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Primary Education Access</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.education && <ChartLoadingOverlay isLoading={true} />}
              <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <BarChart
                    data={educationData} 
                    barSize={50} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 105]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="primary" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={false}
                    >
                      {educationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secondary Education Access</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.education && <ChartLoadingOverlay isLoading={true} />}
              <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <BarChart
                    data={educationData} 
                    barSize={50} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 105]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="secondary" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={false}
                    >
                      {educationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tertiary Education Access</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.education && <ChartLoadingOverlay isLoading={true} />}
              <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <BarChart
                    data={educationData} 
                    barSize={50} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 105]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="tertiary" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={false}
                    >
                      {educationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wealth Distribution</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.wealth && <ChartLoadingOverlay isLoading={true} />}
              <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <BarChart
                    data={wealthData} 
                    barSize={50} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="wealth" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={false}
                    >
                      {wealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>

            <Card>
              <CardHeader>
              <CardTitle>GDP per Capita</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
              </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.gdp && <ChartLoadingOverlay isLoading={true} />}
                <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <BarChart
                    data={wealthData} 
                    barSize={50} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="gdp" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={false}
                    >
                      {wealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
              <CardTitle>Poverty Rate</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
              </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.poverty && <ChartLoadingOverlay isLoading={true} />}
                <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <BarChart
                    data={wealthData} 
                    barSize={50} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="poverty" 
                      radius={[4, 4, 0, 0]} 
                      isAnimationActive={false}
                    >
                      {wealthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </div>
                </ChartContainer>
              </CardContent>
            </Card>

          <Card>
            <CardHeader>
              <CardTitle>Life Expectancy</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.social && <ChartLoadingOverlay isLoading={true} />}
              <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <LineChart
                    data={socialData} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone"
                      dataKey="lifeExpectancy" 
                      stroke={COLORS[0]}
                      strokeWidth={3}
                      dot={{ r: 6, fill: COLORS[0], strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
          </div>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Infant Mortality Rate</CardTitle>
              <CardDescription>By Social Class - {currentYear}</CardDescription>
            </CardHeader>
            <CardContent className="relative h-[300px]">
              {chartLoading.social && <ChartLoadingOverlay isLoading={true} />}
              <ChartContainer config={chartConfig}>
                <div style={{ filter: 'saturate(150%) brightness(120%)', height: '300px', width: '100%', position: 'relative' }}>
                  <LineChart
                    data={socialData} 
                    width={370} 
                    height={300}
                    margin={{ top: 20, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="class"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    />
                    <YAxis domain={[0, 'dataMax + 10']} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone"
                      dataKey="infantMortality" 
                      stroke={COLORS[1]} 
                      strokeWidth={3}
                      dot={{ r: 6, fill: COLORS[1], strokeWidth: 2 }}
                      activeDot={{ r: 8 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </div>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="w-full space-y-4">
          <Slider
            min={startYear}
            max={maxYear}
            step={5}
            value={[currentYear]}
            onValueChange={debouncedYearChange}
          />
          <div className="flex flex-col items-center space-y-2">
            <span className="text-lg font-semibold">{currentYear}</span>
            <div className="space-x-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={rewindToStart}>
                      <Rewind className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset to start year</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={rewindYear}>
                      <StepBack className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Rewind 20 years</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={isPlaying ? pauseSimulation : startSimulation}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPlaying ? 'Pause simulation' : 'Start simulation'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={skipYear}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Skip forward 20 years</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}