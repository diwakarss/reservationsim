'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from "lucide-react";
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";
import { useSimulationContext } from '@/contexts/simulationcontext';

export function Simulator() {
  const { classes } = useSimulationContext();
  const [year, setYear] = useState(2022);
  const [isPlaying, setIsPlaying] = useState(false);
  const [totalReservationCap, setTotalReservationCap] = useState(0);
  const [classReservations, setClassReservations] = useState<Record<string, number>>({});
  const [remainingGeneralQuota, setRemainingGeneralQuota] = useState(100);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSettings, setSavedSettings] = useState({
    totalReservationCap: 0,
    classReservations: {} as Record<string, number>,
  });
  const { toast } = useToast(); 


  useEffect(() => {
    const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
    setRemainingGeneralQuota(Math.max(100 - totalReservation, 0));
  }, [classReservations]);

  const handleReservationChange = (className: string, value: number) => {
    if (value >= 0 && value <= 100) {
      const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
      const newTotal = totalReservation - (classReservations[className] || 0) + value;

      if (newTotal <= totalReservationCap) {
        setClassReservations({
          ...classReservations,
          [className]: value,
        });
        setErrors({
          ...errors,
          [className]: '', // Clear the error when the input is valid
        });
      } else {
        const maxAllowed = totalReservationCap - (totalReservation - (classReservations[className] || 0));
        setErrors({
          ...errors,
          [className]: `The total reservation cap is ${totalReservationCap}%. You can only allocate up to ${Math.max(maxAllowed, 0)}% to this class.`,
        });
      }
    }
  };  
  
  const handleBlur = (className: string) => {
    const value = classReservations[className] || 0;
    const totalReservation = Object.values(classReservations).reduce((sum, val) => sum + val, 0);
    const newTotal = totalReservation - (classReservations[className] || 0) + value;

    if (newTotal <= totalReservationCap) {
      setErrors({
        ...errors,
        [className]: '', // Clear the error on blur if the input is valid
      });
    }
  };

  const handleApplySettings = () => {
    // Save the settings
    setSavedSettings({
      totalReservationCap,
      classReservations,
    });

   toast({
      description: "Your settings have been saved successfully.",
    });
  };

  useEffect(() => {
    if (Object.keys(savedSettings.classReservations).length > 0) {
      setTotalReservationCap(savedSettings.totalReservationCap);
      setClassReservations(savedSettings.classReservations);
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

  return (
    <div className="flex flex-col items-center w-full min-h-screen p-4">
      <header className="flex items-center justify-between w-full p-4 border-b">
        <Drawer>
          <DrawerTrigger asChild>
            <Button>Reservation Settings</Button>
          </DrawerTrigger>
          <DrawerContent>
            <div className="p-4 space-y-4">
              <h2 className="text-2xl font-semibold">Reservation Percentages</h2>
              <div className="grid grid-cols-2 gap-4">
                {[...classes].reverse().map((group) => (
                  <div key={group} className="space-y-2">
                    <Label>{group}</Label>
                    <Input
                      type="number"
                      placeholder="0%"
                      value={classReservations[group] || ''}
                      onChange={(e) => handleReservationChange(group, parseFloat(e.target.value) || 0)}
                      onBlur={() => handleBlur(group)} // Clear error on blur
                    />
                    {errors[group] && <p className="text-red-500 text-sm">{errors[group]}</p>}
                    <div className="flex items-center space-x-2">
                      <Switch id={`creamy-layer-${group}`} />
                      <Label htmlFor={`creamy-layer-${group}`}>Creamy Layer</Label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Total Reservation Cap</h3>
                <Input
                  type="number" 
                  placeholder="0%"
                  value={totalReservationCap}
                  onChange={(e) => setTotalReservationCap(Math.min(parseFloat(e.target.value) || 0, 100))}
                  min="0"
                  max="100"
                />
                <div className="flex justify-between">
                  <span>Remaining General Quota: {remainingGeneralQuota}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Economically Weaker Section Reservation</h3>
                <p>(Applies to only excluded class)</p>
                <Input placeholder="0%" />
                <div className="flex items-center space-x-2">
                  <Switch id="all-classes" />
                  <Label htmlFor="all-classes">All classes are eligible</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
                <Button onClick={handleApplySettings}>Apply</Button>
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
            min={2000}
            max={2050}
            step={1}
            value={[year]}
            onValueChange={(value) => setYear(value[0])}
          />
          <div className="flex flex-col items-center space-y-2">
            <span className="text-lg font-semibold">{year}</span>
            <div className="space-x-2">
              <Button variant="outline" size="icon">
                <Rewind className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon">
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <FastForward className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
