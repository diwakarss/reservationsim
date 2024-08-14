export type SocialClass = 'class1' | 'class2' | 'class3' | 'class4' | 'class5';

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

// Adjusted Calculations

export function calculateFertilityRate(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.fertilityRateDistribution;
    const adjustment = initialParameters.fertilityAdjustment[classKey];
    const reservationImpact = initialParameters.reservationFertilityImpact[classKey];
    return acc + (initialParameters.fertilityRateDistribution[classKey] * (1 - adjustment) + reservationImpact);
  }, 0) / socialClasses.length;
}

export function calculateHigherEducationAccess(socialClasses: string[]): number {
  let totalAccess = 0;

  socialClasses.forEach((_, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.higherEducationAccess;
    const classAccess = initialParameters.higherEducationAccess[classKey];
    const dropoutRate = initialParameters.dropoutRate[classKey];
    const investmentEffectiveness = initialParameters.educationInvestmentEffectiveness[classKey];
    const reservationEffect = initialParameters.reservationEffect[classKey];

    totalAccess += (classAccess.tertiary + (investmentEffectiveness - dropoutRate) - reservationEffect);
  });

  return totalAccess / socialClasses.length;
}

export function calculateSkilledJobAccess(socialClasses: string[]): number {
  let totalJobAccess = 0;

  socialClasses.forEach((_, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.skilledJobAccess;
    const baseAccess = initialParameters.skilledJobAccess[classKey] || 0.05; 
    const educationImpact = initialParameters.higherEducationAccess[classKey].tertiary * 0.4; 
    const povertyImpact = (1 - initialParameters.povertyIndicator[classKey]) * 0.4;
    const skillsMismatch = initialParameters.skillsMismatchFactor[classKey];
    
    totalJobAccess += baseAccess * educationImpact * povertyImpact * (1 - skillsMismatch);
  });

  return Math.min(totalJobAccess / socialClasses.length, 1.0);
}

export function calculateWealthDistribution(socialClasses: string[]): number {
  const totalWealth = Object.values(initialParameters.wealthDistribution).reduce((sum, value) => sum + value, 0);
  const middleClassWealth = initialParameters.wealthDistribution.class3;
  return middleClassWealth / totalWealth;
}

export function calculateGDPPerCapita(socialClasses: string[]): number {
  let totalGDP = 0;
  let totalPopulationShare = 0;

  socialClasses.forEach((_, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.gdpPerCapita;
    const populationKey = `class${index + 1}` as keyof typeof initialParameters.populationDistribution;
    const gdp = initialParameters.gdpPerCapita[classKey];
    const populationShare = initialParameters.populationDistribution[populationKey];

    const wealthRedistribution = initialParameters.wealthRedistributionEffect[classKey];
    
    totalGDP += (gdp + wealthRedistribution) * populationShare;
    totalPopulationShare += populationShare;
  });

  return totalGDP / totalPopulationShare;
}

export function calculateSocialIndicators(socialClasses: string[]): any {
  const lifeExpectancy = socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.socialIndicators.lifeExpectancy;
    return acc + initialParameters.socialIndicators.lifeExpectancy[classKey];
  }, 0) / socialClasses.length;

  const socialUnrest = socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.socialUnrestFactor;
    return acc + initialParameters.socialUnrestFactor[classKey];
  }, 0) / socialClasses.length;

  return {
    lifeExpectancy: lifeExpectancy * (1 - socialUnrest), 
    infantMortalityRate: (initialParameters.socialIndicators.infantMortalityRate.class1 + initialParameters.socialIndicators.infantMortalityRate.class5) / 2,
    crimeRates: socialClasses.map((_, index) => {
      const classKey = `class${index + 1}` as keyof typeof initialParameters.socialIndicators.crimeRates;
      return initialParameters.socialIndicators.crimeRates[classKey] || 'medium';
    }),
    trustInGovernment: socialClasses.reduce((acc, _, index) => {
      const classKey = `class${index + 1}` as keyof typeof initialParameters.socialIndicators.trustInGovernment;
      return acc + (initialParameters.socialIndicators.trustInGovernment[classKey] || 0.5);
    }, 0) / socialClasses.length,
  };
}

export function calculateAggregatedCrimeRate(socialClasses: string[]): string {
  const crimeRateCounts: Record<string, number> = {
    'Very low': 0,
    'Low': 0,
    'Medium': 0,
    'High': 0,
    'Very high': 0,
  };

  socialClasses.forEach((_, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.socialIndicators.crimeRates;
    const crimeRate = initialParameters.socialIndicators.crimeRates[classKey];
    if (crimeRate) {
      crimeRateCounts[crimeRate]++;
    }
  });

  let maxCount = 0;
  let mostCommonCrimeRate = 'Medium';
  for (const rate in crimeRateCounts) {
    if (crimeRateCounts[rate] > maxCount) {
      maxCount = crimeRateCounts[rate];
      mostCommonCrimeRate = rate;
    }
  }

  return mostCommonCrimeRate;
}

export function calculatePopulationInPoverty(socialClasses: string[]): number {
  return socialClasses.reduce((totalPoverty, className, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.populationDistribution;
    const populationShare = initialParameters.populationDistribution[classKey];
    const povertyShare = initialParameters.povertyIndicator[classKey];
    return totalPoverty + (populationShare * povertyShare);
  }, 0) * 100;
}

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

export function calculatePopulationOverTime(
  socialClasses: SocialClass[],
  year: number,
  reservations: Record<string, number>
): any {
  return socialClasses.map((className: SocialClass) => {
    const population = initialParameters.populationDistribution[className];
    const birthRate = initialParameters.fertilityRateDistribution[className];
    const deathRate = initialParameters.deathRate[className];
    const migrationEffect = initialParameters.migrationEffect[className];
    const reservationEffect = reservations[className] || 0;

    const populationAtYear = population + (population * birthRate) - (population * deathRate) + migrationEffect - (population * reservationEffect);
    return {
      name: className,
      value: Math.max(0, populationAtYear),  // Ensuring population doesn't drop below zero
    };
  });
}

export function calculateFertilityRateOverTime(
  socialClasses: SocialClass[],
  year: number,
  reservations: Record<string, number>
): any {
  return socialClasses.map((className: SocialClass) => {
    const baseFertility = initialParameters.fertilityRateDistribution[className];
    const adjustmentFactor = initialParameters.fertilityAdjustment[className];
    const reservationImpact = initialParameters.reservationFertilityImpact[className];
    
    const fertilityRateAtYear = baseFertility * (1 - adjustmentFactor) + reservationImpact;
    return {
      name: className,
      value: Math.max(0, fertilityRateAtYear),  // Prevent negative fertility rates
    };
  });
}

export function calculateEducationAccessOverTime(
  socialClasses: SocialClass[],
  year: number,
  reservations: Record<string, number>
): any {
  return socialClasses.map((className: SocialClass) => {
    const baseEducationAccess = initialParameters.higherEducationAccess[className].tertiary;
    const dropoutRate = initialParameters.dropoutRate[className];
    const investmentEffectiveness = initialParameters.educationInvestmentEffectiveness[className];
    const reservationEffect = reservations[className] || 0;

    const educationAccessAtYear = baseEducationAccess + (investmentEffectiveness - dropoutRate) - reservationEffect;
    return {
      name: className,
      value: Math.max(0, Math.min(1, educationAccessAtYear)),  // Ensures education access stays within 0-1
    };
  });
}

export function calculateJobAccessOverTime(
  socialClasses: SocialClass[],
  year: number,
  reservations: Record<string, number>
): any {
  return socialClasses.map((className: SocialClass) => {
    const baseJobAccess = initialParameters.skilledJobAccess[className];
    const economicGrowth = initialParameters.economicGrowth[className];
    const unemploymentRate = 1 - baseJobAccess;  // Assuming unemployment rate is inverse of job access
    const reservationEffect = reservations[className] || 0;
    const skillsMismatch = initialParameters.skillsMismatchFactor[className];
    
    const jobAccessAtYear = baseJobAccess + (economicGrowth - unemploymentRate) - reservationEffect * (1 - skillsMismatch);
    return {
      name: className,
      value: Math.max(0, Math.min(1, jobAccessAtYear)),  // Ensures job access stays between 0 and 1
    };
  });
}

export function calculateWealthDistributionOverTime(
  socialClasses: SocialClass[],
  year: number,
  reservations: Record<string, number>
): any {
  return socialClasses.map((className: SocialClass) => {
    const baseWealth = initialParameters.wealthDistribution[className];
    const savingsRate = initialParameters.savingsRate[className];
    const consumptionRate = initialParameters.consumptionRate[className];
    const reservationEffect = reservations[className] || 0;
    const wealthRedistribution = initialParameters.wealthRedistributionEffect[className];

    const wealthAtYear = baseWealth + (savingsRate - consumptionRate) + wealthRedistribution + reservationEffect;
    return {
      name: className,
      value: Math.max(0, wealthAtYear),  // Prevent negative wealth values
    };
  });
}

export function calculateSocialIndicatorsOverTime(
  socialClasses: SocialClass[],
  year: number,
  reservations: Record<string, number>
): any {
  return socialClasses.map((className: SocialClass) => {
    const baseLifeExpectancy = initialParameters.socialIndicators.lifeExpectancy[className];
    const baseInfantMortalityRate = initialParameters.socialIndicators.infantMortalityRate[className];
    const trustInGovernment = initialParameters.socialIndicators.trustInGovernment[className];
    const crimeRate = initialParameters.socialIndicators.crimeRates[className];
    const reservationEffect = reservations[className] || 0;
    const socialUnrest = initialParameters.socialUnrestFactor[className];

    return {
      name: className,
      lifeExpectancy: Math.max(0, baseLifeExpectancy * (1 - reservationEffect) * (1 - socialUnrest)),
      infantMortalityRate: baseInfantMortalityRate * (1 + reservationEffect),
      crimeRates: crimeRate,
      trustInGovernment: Math.max(0, trustInGovernment * (1 - reservationEffect)),
    };
  });
}

