export type SocialClass = 'class1' | 'class2' | 'class3' | 'class4' | 'class5';

// Initial parameters for the simulation
export const initialParameters = {
  populationDistribution: {
    class1: 0.05, // 5% of the population
    class2: 0.15, // 15% of the population
    class3: 0.30, // 30% of the population
    class4: 0.35, // 35% of the population
    class5: 0.15, // 15% of the population
  },
  fertilityRateDistribution: {
    class1: 1.6,
    class2: 1.8,
    class3: 2.5,
    class4: 3.2,
    class5: 3.8,
  },
  higherEducationAccess: {
    class1: { primary: 1.0, secondary: 0.98, tertiary: 0.95 },
    class2: { primary: 0.95, secondary: 0.85, tertiary: 0.65 },
    class3: { primary: 0.85, secondary: 0.70, tertiary: 0.40 },
    class4: { primary: 0.70, secondary: 0.45, tertiary: 0.15 },
    class5: { primary: 0.50, secondary: 0.20, tertiary: 0.02 },
  },
  skilledJobAccess: {
    class1: 0.90,
    class2: 0.75,
    class3: 0.50,
    class4: 0.25,
    class5: 0.05,
  },
  gdpPerCapita: {
    class1: 150000,
    class2: 80000,
    class3: 40000,
    class4: 20000,
    class5: 5000,
  },
  wealthDistribution: {
    class1: 0.42,
    class2: 0.28,
    class3: 0.18,
    class4: 0.08,
    class5: 0.04,
  },
  socialIndicators: {
    lifeExpectancy: {
      class1: 85,
      class2: 80,
      class3: 72,
      class4: 68,
      class5: 60,
    },
    infantMortalityRate: {
      class1: 3,
      class2: 9,
      class3: 22,
      class4: 35,
      class5: 50,
    },
    crimeRates: {
      class1: 'very low',
      class2: 'low',
      class3: 'medium',
      class4: 'high',
      class5: 'very high',
    },
    trustInGovernment: {
      class1: 0.80,
      class2: 0.55,
      class3: 0.35,
      class4: 0.15,
      class5: 0.05,
    },
  },
  povertyIndicator: {
    class1: 0.01, // 1% of class 1 in poverty
    class2: 0.10, // 10% of class 2 in poverty
    class3: 0.30, // 30% of class 3 in poverty
    class4: 0.60, // 60% of class 4 in poverty
    class5: 0.85, // 85% of class 5 in poverty
  },
  deathRate: {
    class1: 0.005,
    class2: 0.007,
    class3: 0.010,
    class4: 0.015,
    class5: 0.020,
  },
  migrationEffect: {
    class1: 0.002,
    class2: 0.001,
    class3: 0.000,
    class4: -0.003,
    class5: -0.005,
  },
  economicGrowth: {
    class1: 0.04,
    class2: 0.03,
    class3: 0.02,
    class4: 0.01,
    class5: 0.005,
  },
  fertilityAdjustment: {
    class1: 0.01,
    class2: 0.02,
    class3: 0.03,
    class4: 0.04,
    class5: 0.05,
  },
  reservationFertilityImpact: {
    class1: -0.005,
    class2: 0.005,
    class3: 0.010,
    class4: 0.015,
    class5: 0.020,
  },
  dropoutRate: {
    class1: 0.01,
    class2: 0.02,
    class3: 0.05,
    class4: 0.10,
    class5: 0.20,
  },
  educationInvestmentEffectiveness: {
    class1: 0.08,
    class2: 0.06,
    class3: 0.04,
    class4: 0.02,
    class5: 0.01,
  },
  savingsRate: {
    class1: 0.15,
    class2: 0.10,
    class3: 0.05,
    class4: 0.02,
    class5: 0.01,
  },
  consumptionRate: {
    class1: 0.05,
    class2: 0.07,
    class3: 0.10,
    class4: 0.15,
    class5: 0.20,
  },
  reservationEffect: {
    class1: 0.05,
    class2: 0.04,
    class3: 0.03,
    class4: 0.02,
    class5: 0.01,
  },
  skillsMismatchFactor: {
    class1: 0.05,
    class2: 0.10,
    class3: 0.15,
    class4: 0.20,
    class5: 0.25,
  },
  wealthRedistributionEffect: {
    class1: 0.02,
    class2: 0.015,
    class3: 0.010,
    class4: 0.005,
    class5: 0.001,
  },
  socialUnrestFactor: {
    class1: 0.05,
    class2: 0.10,
    class3: 0.15,
    class4: 0.20,
    class5: 0.25,
  },
};

// Helper functions for initial state calculations
export function getInitialPopulationDistribution(): { aggregated: number, perClass: Record<string, number> } {
  const perClassPopulation: Record<string, number> = {};
  let totalPopulation = 0;

  Object.keys(initialParameters.populationDistribution).forEach((classKey) => {
    const populationShare = initialParameters.populationDistribution[classKey as keyof typeof initialParameters.populationDistribution];
    const classPopulation = populationShare * 100; 

    perClassPopulation[classKey] = classPopulation;
    totalPopulation += classPopulation;
  });

  return {
    aggregated: totalPopulation,
    perClass: perClassPopulation
  };
}

export function getInitialFertilityRate(): { aggregated: number, perClass: Record<string, number> } {
  const perClassFertilityRate: Record<string, number> = {};
  let totalFertilityRate = 0;

  Object.keys(initialParameters.fertilityRateDistribution).forEach((classKey) => {
    const fertilityRate = initialParameters.fertilityRateDistribution[classKey as keyof typeof initialParameters.fertilityRateDistribution];
    perClassFertilityRate[classKey] = fertilityRate;
    totalFertilityRate += fertilityRate;
  });

  return {
    aggregated: totalFertilityRate / Object.keys(initialParameters.fertilityRateDistribution).length,
    perClass: perClassFertilityRate
  };
}

export function getInitialHigherEducationAccess(): { aggregated: number, perClass: Record<string, number> } {
  const perClassEducationAccess: Record<string, number> = {};
  let totalEducationAccess = 0;

  Object.keys(initialParameters.higherEducationAccess).forEach((classKey) => {
    const classAccess = initialParameters.higherEducationAccess[classKey as keyof typeof initialParameters.higherEducationAccess];
    perClassEducationAccess[classKey] = classAccess.tertiary;
    totalEducationAccess += classAccess.tertiary;
  });

  return {
    aggregated: totalEducationAccess / Object.keys(initialParameters.higherEducationAccess).length,
    perClass: perClassEducationAccess
  };
}

export function getInitialSkilledJobAccess(): { aggregated: number, perClass: Record<string, number> } {
  const perClassJobAccess: Record<string, number> = {};
  let totalJobAccess = 0;

  Object.keys(initialParameters.skilledJobAccess).forEach((classKey) => {
    const jobAccess = initialParameters.skilledJobAccess[classKey as keyof typeof initialParameters.skilledJobAccess] || 0.05;
    perClassJobAccess[classKey] = jobAccess;
    totalJobAccess += jobAccess;
  });

  return {
    aggregated: totalJobAccess / Object.keys(initialParameters.skilledJobAccess).length,
    perClass: perClassJobAccess
  };
}

export function getInitialWealthDistribution(): { median: number, perClass: Record<string, number> } {
  const perClassWealth: Record<string, number> = {};
  let totalWealth = 0;
  let middleClassWealth = 0;

  Object.keys(initialParameters.wealthDistribution).forEach((classKey) => {
    const classWealth = initialParameters.wealthDistribution[classKey as keyof typeof initialParameters.wealthDistribution];
    perClassWealth[classKey] = classWealth;
    totalWealth += classWealth;

    if (classKey === 'class3') {
      middleClassWealth = classWealth;
    }
  });

  return {
    median: totalWealth > 0 ? (middleClassWealth / totalWealth) : 0,
    perClass: perClassWealth
  };
}

export function getInitialGDPPerCapita(): { aggregated: number, perClass: Record<string, number> } {
  const perClassGDP: Record<string, number> = {};
  let totalGDP = 0;
  let totalPopulationShare = 0;

  Object.keys(initialParameters.gdpPerCapita).forEach((classKey) => {
    const gdp = initialParameters.gdpPerCapita[classKey as keyof typeof initialParameters.gdpPerCapita];
    const populationShare = initialParameters.populationDistribution[classKey as keyof typeof initialParameters.populationDistribution];
    perClassGDP[classKey] = gdp;
    totalGDP += gdp * populationShare;
    totalPopulationShare += populationShare;
  });

  return {
    aggregated: totalGDP / totalPopulationShare,
    perClass: perClassGDP
  };
}

export function getInitialSocialIndicators(): { aggregated: any, perClass: Record<string, any> } {
  const perClassIndicators: Record<string, any> = {};
  let totalLifeExpectancy = 0;
  let totalTrustInGovernment = 0;
  let aggregatedCrimeRates: Record<string, number> = {
    'Very low': 0,
    'Low': 0,
    'Medium': 0,
    'High': 0,
    'Very high': 0,
  };
  let totalIMR = 0;
  let totalPopulationShare = 0;

  Object.keys(initialParameters.socialIndicators.lifeExpectancy).forEach((classKey) => {
    const lifeExpectancy = initialParameters.socialIndicators.lifeExpectancy[classKey as keyof typeof initialParameters.socialIndicators.lifeExpectancy];
    const infantMortalityRate = initialParameters.socialIndicators.infantMortalityRate[classKey as keyof typeof initialParameters.socialIndicators.infantMortalityRate];
    const crimeRates = initialParameters.socialIndicators.crimeRates[classKey as keyof typeof initialParameters.socialIndicators.crimeRates];
    const trustInGovernment = initialParameters.socialIndicators.trustInGovernment[classKey as keyof typeof initialParameters.socialIndicators.trustInGovernment];
    const populationShare = initialParameters.populationDistribution[classKey as keyof typeof initialParameters.populationDistribution];

    perClassIndicators[classKey] = {
      lifeExpectancy,
      infantMortalityRate,
      crimeRates,
      trustInGovernment,
    };

    totalLifeExpectancy += lifeExpectancy;
    totalTrustInGovernment += trustInGovernment;
    aggregatedCrimeRates[crimeRates]++;
    totalIMR += infantMortalityRate * populationShare;
    totalPopulationShare += populationShare;
  });

  const mostCommonCrimeRate = Object.keys(aggregatedCrimeRates).reduce((a, b) => 
    aggregatedCrimeRates[a] > aggregatedCrimeRates[b] ? a : b
  );

  return {
    aggregated: {
      lifeExpectancy: totalLifeExpectancy / Object.keys(initialParameters.socialIndicators.lifeExpectancy).length,
      infantMortalityRate: totalIMR / totalPopulationShare,
      crimeRates: mostCommonCrimeRate,
      trustInGovernment: totalTrustInGovernment / Object.keys(initialParameters.socialIndicators.trustInGovernment).length,
    },
    perClass: perClassIndicators
  };
}

export function getInitialPopulationInPoverty(): { aggregated: number, perClass: Record<string, number> } {
  const perClassPoverty: Record<string, number> = {};
  let totalPoverty = 0;

  Object.keys(initialParameters.populationDistribution).forEach((classKey) => {
    const populationShare = initialParameters.populationDistribution[classKey as keyof typeof initialParameters.populationDistribution];
    const povertyShare = initialParameters.povertyIndicator[classKey as keyof typeof initialParameters.povertyIndicator];
    const classPoverty = populationShare * povertyShare * 100;
    perClassPoverty[classKey] = classPoverty;
    totalPoverty += classPoverty;
  });

  return {
    aggregated: totalPoverty,
    perClass: perClassPoverty
  };
}

// Metrics per class used to load charts on simulator page

export function calculateFertilityRatePerClass(socialClass: string): number {
  const classKey = socialClass as keyof typeof initialParameters.fertilityRateDistribution;
  const adjustment = initialParameters.fertilityAdjustment[classKey];
  const reservationImpact = initialParameters.reservationFertilityImpact[classKey];
  return initialParameters.fertilityRateDistribution[classKey] * (1 - adjustment) + reservationImpact;
}

export function calculateHigherEducationAccessPerClass(socialClass: string): number {
  const classKey = socialClass as keyof typeof initialParameters.higherEducationAccess;
  const classAccess = initialParameters.higherEducationAccess[classKey];
  const dropoutRate = initialParameters.dropoutRate[classKey];
  const investmentEffectiveness = initialParameters.educationInvestmentEffectiveness[classKey];
  const reservationEffect = initialParameters.reservationEffect[classKey];

  return classAccess.tertiary + (investmentEffectiveness - dropoutRate) - reservationEffect;
}

export function calculateSkilledJobAccessPerClass(socialClass: string): number {
  const classKey = socialClass as keyof typeof initialParameters.skilledJobAccess;
  const baseAccess = initialParameters.skilledJobAccess[classKey] || 0.05;
  const educationImpact = initialParameters.higherEducationAccess[classKey].tertiary * 0.4;
  const povertyImpact = (1 - initialParameters.povertyIndicator[classKey]) * 0.4;
  const skillsMismatch = initialParameters.skillsMismatchFactor[classKey];

  return Math.min(baseAccess * educationImpact * povertyImpact * (1 - skillsMismatch), 1.0);
}

export function calculateWealthDistributionPerClass(socialClass: string): number {
  const classKey = socialClass as keyof typeof initialParameters.wealthDistribution;
  return initialParameters.wealthDistribution[classKey];
}

export function calculateGDPPerCapitaPerClass(socialClass: string): number {
  const classKey = socialClass as keyof typeof initialParameters.gdpPerCapita;
  const populationKey = socialClass as keyof typeof initialParameters.populationDistribution;
  const gdp = initialParameters.gdpPerCapita[classKey];
  const populationShare = initialParameters.populationDistribution[populationKey];
  const wealthRedistribution = initialParameters.wealthRedistributionEffect[classKey];

  return (gdp + wealthRedistribution) * populationShare;
}

export function calculatePopulationInPovertyPerClass(socialClass: string): number {
  const classKey = socialClass as keyof typeof initialParameters.populationDistribution;
  const populationShare = initialParameters.populationDistribution[classKey];
  const povertyShare = initialParameters.povertyIndicator[classKey];

  return populationShare * povertyShare * 100;
}

//Aggregated metrics per class used to load charts on view stats panel

export function calculateSocialIndicatorsPerClass(socialClass: string): any {
  const classKey = socialClass as keyof typeof initialParameters.socialIndicators.lifeExpectancy;

  const lifeExpectancy = initialParameters.socialIndicators.lifeExpectancy[classKey];
  const infantMortalityRate = initialParameters.socialIndicators.infantMortalityRate[classKey];
  const crimeRates = initialParameters.socialIndicators.crimeRates[classKey];
  const trustInGovernment = initialParameters.socialIndicators.trustInGovernment[classKey];

  return {
    lifeExpectancy,
    infantMortalityRate,
    crimeRates,
    trustInGovernment,
  };
}

//Variable metrics used in the calculation of the metrics over time

export function calculateSkillsMismatch(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.skillsMismatchFactor;
    return acc + initialParameters.skillsMismatchFactor[classKey];
  }, 0) / socialClasses.length;
}

export function calculateWealthRedistribution(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.wealthRedistributionEffect;
    return acc + initialParameters.wealthRedistributionEffect[classKey];
  }, 0) / socialClasses.length;
}

export function calculateSocialUnrest(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.socialUnrestFactor;
    return acc + initialParameters.socialUnrestFactor[classKey];
  }, 0) / socialClasses.length;
}

//Metrics over time used to calculate when the simulation is run

export function calculatePopulationOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: number, perClass: Record<string, number> } {
  let totalPopulation = 0;
  const perClassPopulation: Record<string, number> = {};

  socialClasses.forEach((className) => {
    const classKey = className as keyof typeof initialParameters.populationDistribution;
    const population = initialParameters.populationDistribution[classKey];
    const birthRate = initialParameters.fertilityRateDistribution[classKey];
    const deathRate = initialParameters.deathRate[classKey];
    const migrationEffect = initialParameters.migrationEffect[classKey];
    const reservationEffect = reservations[className] || 0;

    const populationAtYear = population + (population * birthRate) - (population * deathRate) + migrationEffect - (population * reservationEffect);
    const adjustedPopulation = Math.max(0, populationAtYear);

    perClassPopulation[className] = adjustedPopulation;
    totalPopulation += adjustedPopulation;
  });

  return {
    aggregated: totalPopulation,  // Aggregated metric
    perClass: perClassPopulation  // Per-class metrics
  };
}

export function calculateFertilityRateOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: number, perClass: Record<string, number> } {
  let totalFertilityRate = 0;
  const perClassFertilityRate: Record<string, number> = {};

  socialClasses.forEach((className) => {
    const classKey = className as keyof typeof initialParameters.fertilityRateDistribution;
    const baseFertility = initialParameters.fertilityRateDistribution[classKey];
    const adjustmentFactor = initialParameters.fertilityAdjustment[classKey];
    const reservationImpact = initialParameters.reservationFertilityImpact[classKey];

    const fertilityRateAtYear = Math.max(0, baseFertility * (1 - adjustmentFactor) + reservationImpact);
    
    perClassFertilityRate[className] = fertilityRateAtYear;
    totalFertilityRate += fertilityRateAtYear;
  });

  return {
    aggregated: totalFertilityRate / socialClasses.length,  // Aggregated metric
    perClass: perClassFertilityRate  // Per-class metrics
  };
}

export function calculateEducationAccessOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: number, perClass: Record<string, number> } {
  let totalEducationAccess = 0;
  const perClassEducationAccess: Record<string, number> = {};

  socialClasses.forEach((className, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.higherEducationAccess;
    const baseEducationAccess = initialParameters.higherEducationAccess[classKey].tertiary;
    const dropoutRate = initialParameters.dropoutRate[classKey];
    const investmentEffectiveness = initialParameters.educationInvestmentEffectiveness[classKey];
    const reservationEffect = reservations[className] || 0;

    const educationAccessAtYear = Math.max(0, Math.min(1, baseEducationAccess + (investmentEffectiveness - dropoutRate) - reservationEffect));
    
    perClassEducationAccess[className] = educationAccessAtYear;
    totalEducationAccess += educationAccessAtYear;
  });

  return {
    aggregated: totalEducationAccess / socialClasses.length,  // Aggregated metric
    perClass: perClassEducationAccess  // Per-class metrics
  };
}

export function calculateJobAccessOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: number, perClass: Record<string, number> } {
  let totalJobAccess = 0;
  const perClassJobAccess: Record<string, number> = {};

  socialClasses.forEach((className, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.skilledJobAccess;
    const baseJobAccess = initialParameters.skilledJobAccess[classKey];
    const economicGrowth = initialParameters.economicGrowth[classKey];
    const unemploymentRate = 1 - baseJobAccess;  // Assuming unemployment rate is inverse of job access
    const reservationEffect = reservations[className] || 0;
    const skillsMismatch = initialParameters.skillsMismatchFactor[classKey];

    const jobAccessAtYear = Math.max(0, Math.min(1, baseJobAccess + (economicGrowth - unemploymentRate) - reservationEffect * (1 - skillsMismatch)));
    
    perClassJobAccess[className] = jobAccessAtYear;
    totalJobAccess += jobAccessAtYear;
  });

  return {
    aggregated: totalJobAccess / socialClasses.length,  // Aggregated metric
    perClass: perClassJobAccess  // Per-class metrics
  };
}

export function calculateWealthDistributionOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: number, perClass: Record<string, number> } {
  let totalWealth = 0;
  const perClassWealth: Record<string, number> = {};

  socialClasses.forEach((className, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.wealthDistribution;
    const baseWealth = initialParameters.wealthDistribution[classKey];
    const savingsRate = initialParameters.savingsRate[classKey];
    const consumptionRate = initialParameters.consumptionRate[classKey];
    const reservationEffect = reservations[className] || 0;
    const wealthRedistribution = initialParameters.wealthRedistributionEffect[classKey];

    const wealthAtYear = Math.max(0, baseWealth + (savingsRate - consumptionRate) + wealthRedistribution + reservationEffect);

    perClassWealth[className] = wealthAtYear;
    totalWealth += wealthAtYear;
  });

  return {
    aggregated: totalWealth / socialClasses.length,  // Aggregated metric
    perClass: perClassWealth  // Per-class metrics
  };
}

export function calculateSocialIndicatorsOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: any, perClass: Record<string, any> } {
  let totalLifeExpectancy = 0;
  let totalSocialUnrest = 0;
  const perClassIndicators: Record<string, any> = {};

  socialClasses.forEach((className, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.socialIndicators.lifeExpectancy;
    const baseLifeExpectancy = initialParameters.socialIndicators.lifeExpectancy[classKey];
    const baseInfantMortalityRate = initialParameters.socialIndicators.infantMortalityRate[classKey];
    const trustInGovernment = initialParameters.socialIndicators.trustInGovernment[classKey];
    const crimeRate = initialParameters.socialIndicators.crimeRates[classKey];
    const reservationEffect = reservations[className] || 0;
    const socialUnrest = initialParameters.socialUnrestFactor[classKey];

    const adjustedLifeExpectancy = Math.max(0, baseLifeExpectancy * (1 - reservationEffect) * (1 - socialUnrest));
    const adjustedInfantMortalityRate = baseInfantMortalityRate * (1 + reservationEffect);
    const adjustedTrustInGovernment = Math.max(0, trustInGovernment * (1 - reservationEffect));

    perClassIndicators[className] = {
      lifeExpectancy: adjustedLifeExpectancy,
      infantMortalityRate: adjustedInfantMortalityRate,
      crimeRates: crimeRate,
      trustInGovernment: adjustedTrustInGovernment,
    };

    totalLifeExpectancy += adjustedLifeExpectancy;
    totalSocialUnrest += socialUnrest;
  });

  return {
    aggregated: {
      lifeExpectancy: totalLifeExpectancy / socialClasses.length,
      socialUnrest: totalSocialUnrest / socialClasses.length,
    },  // Aggregated metrics
    perClass: perClassIndicators  // Per-class metrics
  };
}

export function calculatePopulationInPovertyOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: number, perClass: Record<string, number> } {
  let totalPoverty = 0;
  const perClassPoverty: Record<string, number> = {};

  socialClasses.forEach((className) => {
    const classKey = className as keyof typeof initialParameters.populationDistribution;
    const populationShare = initialParameters.populationDistribution[classKey];
    const povertyShare = initialParameters.povertyIndicator[classKey];
    const reservationEffect = reservations[className] || 0;

    // Calculate the adjusted poverty rate considering reservations over time
    const adjustedPovertyShare = Math.min(1, povertyShare + reservationEffect);
    const classPoverty = populationShare * adjustedPovertyShare * 100;

    perClassPoverty[className] = classPoverty;
    totalPoverty += classPoverty;
  });

  return {
    aggregated: totalPoverty,  // Aggregated metric
    perClass: perClassPoverty  // Per-class metrics
  };
}

export function calculateGDPPerCapitaOverTime(
  socialClasses: string[],
  year: number,
  reservations: Record<string, number>
): { aggregated: number, perClass: Record<string, number> } {
  let totalGDP = 0;
  let totalPopulationShare = 0;
  const perClassGDP: Record<string, number> = {};

  socialClasses.forEach((className) => {
    const classKey = className as keyof typeof initialParameters.gdpPerCapita;
    const populationKey = className as keyof typeof initialParameters.populationDistribution;
    const gdp = initialParameters.gdpPerCapita[classKey];
    const populationShare = initialParameters.populationDistribution[populationKey];
    const wealthRedistribution = initialParameters.wealthRedistributionEffect[classKey];
    const reservationEffect = reservations[className] || 0;

    // Calculate the adjusted GDP considering wealth redistribution and reservations over time
    const adjustedGDP = gdp + wealthRedistribution + reservationEffect;
    const classGDP = adjustedGDP * populationShare;

    perClassGDP[className] = classGDP;
    totalGDP += classGDP;
    totalPopulationShare += populationShare;
  });

  return {
    aggregated: totalGDP / totalPopulationShare,  // Aggregated metric
    perClass: perClassGDP  // Per-class metrics
  };
}


