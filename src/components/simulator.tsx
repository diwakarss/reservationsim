'use client';

import { useState } from "react";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Play, Pause, SkipBack, SkipForward, Rewind, FastForward } from "lucide-react";
import * as RechartsPrimitive from "recharts";
import { ChartContainer, ChartTooltip, ChartLegend } from "@/components/ui/chart";

export function Simulator() {
  const [year, setYear] = useState(2022);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sample data for charts (replace with your actual data)
  const sampleData = [
    { name: 'Smallfolk', value: 400 },
    { name: 'Hill Tribes', value: 300 },
    { name: 'Traders', value: 300 },
    { name: 'Artisans', value: 200 },
    { name: 'Gentry', value: 100 },
  ];

  const chartConfig = {
    Smallfolk: { color: "#ff0000" },
    'Hill Tribes': { color: "#00ff00" },
    Traders: { color: "#0000ff" },
    Artisans: { color: "#ffff00" },
    Gentry: { color: "#ff00ff" },
  };

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
                {["Smallfolk", "Hill Tribes", "Traders", "Artisans", "Gentry"].map((group) => (
                  <div key={group} className="space-y-2">
                    <Label>{group}</Label>
                    <Input placeholder="0%" />
                    <div className="flex items-center space-x-2">
                      <Switch id={`creamy-layer-${group}`} />
                      <Label htmlFor={`creamy-layer-${group}`}>Creamy Layer</Label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Total Reservation Cap</h3>
                <Input type="number" placeholder="Enter percentage" min="0" max="100" />
                <div className="flex justify-between">
                  <span>Remaining General Quota: 10%</span>
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
                <Button>Apply</Button>
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