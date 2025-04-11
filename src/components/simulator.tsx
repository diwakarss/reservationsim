'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerTitle } from "@/components/ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Play, Pause, SkipForward, Rewind, FastForward, SkipBack, StepBack } from "lucide-react";
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";
import { useSimulationContext } from '@/contexts/simulationcontext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SimulationData } from '../app/page';

export interface SimulatorProps {
  initialData: SimulationData;
}

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

  const startSimulation = () => {
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setCurrentYear(prev => Math.min(prev + 5, maxYear));
    }, 1000); // Update every second
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const rewindToStart = () => {
    setCurrentYear(startYear);
  };

  const rewindYear = () => {
    setCurrentYear(prev => Math.max(startYear, prev - 20));
  };

  const skipYear = () => {
    setCurrentYear(prev => Math.min(maxYear, prev + 20));
  };

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
  

  // Ensure that sampleData and chartConfig are dynamically mapped based on the classes
  const sampleData = classes.map((className, index) => ({
    name: className,
    value: 500 - index * 100 // Example value, adjust this as per your actual data logic
  }));

  const chartConfig: Record<string, { color: string }> = {}; // Explicitly typing the chartConfig

  classes.forEach((className, index) => {
    chartConfig[className] = { color: `hsl(${index * 60}, 100%, 50%)` }; // Example colors, adjust as needed
  });

  // Reverse the classes array before mapping
  const reversedClasses = [...classes].reverse();

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
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">Simulation Statistics</h4>
                <p className="text-sm">
                  View detailed statistics about the current simulation state.
                </p>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </header>
      <main className="flex flex-col items-center w-full max-w-6xl p-4 space-y-8">
        <h1 className="text-3xl font-bold">Reservation Simulator</h1>
        
        <div className="grid grid-cols-3 gap-4 w-full">
          <Card>
            <CardHeader>
              <CardTitle>Population Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <RechartsPrimitive.BarChart data={sampleData}>
                  <RechartsPrimitive.Bar dataKey="value" />
                  <RechartsPrimitive.XAxis dataKey="name" />
                  <RechartsPrimitive.YAxis />
                  <ChartTooltip />
                  <ChartLegend />
                </RechartsPrimitive.BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Education Access</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <RechartsPrimitive.BarChart data={sampleData} layout="vertical">
                  <RechartsPrimitive.Bar dataKey="value" />
                  <RechartsPrimitive.XAxis type="number" />
                  <RechartsPrimitive.YAxis dataKey="name" type="category" />
                  <ChartTooltip />
                  <ChartLegend />
                </RechartsPrimitive.BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Healthcare Access</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <RechartsPrimitive.PieChart>
                  <RechartsPrimitive.Pie data={sampleData} dataKey="value" nameKey="name" />
                  <ChartTooltip />
                  <ChartLegend />
                </RechartsPrimitive.PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Living Conditions</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <RechartsPrimitive.PieChart>
                  <RechartsPrimitive.Pie data={sampleData} dataKey="value" nameKey="name" />
                  <ChartTooltip />
                  <ChartLegend />
                </RechartsPrimitive.PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Job Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <RechartsPrimitive.PieChart>
                  <RechartsPrimitive.Pie data={sampleData} dataKey="value" nameKey="name" innerRadius="50%" />
                  <ChartTooltip />
                  <ChartLegend />
                </RechartsPrimitive.PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>MMR</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <RechartsPrimitive.AreaChart data={sampleData}>
                    <RechartsPrimitive.Area type="monotone" dataKey="value" stackId="1" />
                    <RechartsPrimitive.XAxis dataKey="name" />
                    <RechartsPrimitive.YAxis />
                    <ChartTooltip />
                    <ChartLegend />
                  </RechartsPrimitive.AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>IMR</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <RechartsPrimitive.AreaChart data={sampleData}>
                    <RechartsPrimitive.Area type="monotone" dataKey="value" stackId="1" />
                    <RechartsPrimitive.XAxis dataKey="name" />
                    <RechartsPrimitive.YAxis />
                    <ChartTooltip />
                    <ChartLegend />
                  </RechartsPrimitive.AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="w-full space-y-4">
          <Slider
            min={startYear}
            max={maxYear}
            step={5}
            value={[currentYear]}
            onValueChange={(value) => setCurrentYear(value[0])}
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