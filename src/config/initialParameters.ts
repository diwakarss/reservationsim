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
};

// Adjusted Calculations
export function calculateFertilityRate(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.fertilityRateDistribution;
    return acc + (initialParameters.fertilityRateDistribution[classKey] || 2.5);
  }, 0) / socialClasses.length;
}

export function calculateHigherEducationAccess(socialClasses: string[]): number {
  let totalAccess = 0;

  socialClasses.forEach((_, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.higherEducationAccess;
    const classAccess = initialParameters.higherEducationAccess[classKey];
    if (classAccess) {
      // Focus solely on tertiary education access
      totalAccess += classAccess.tertiary;
    } else {
      totalAccess += 0.02; // Default fallback value, very low access to higher education
    }
  });

  return totalAccess / socialClasses.length;
}

export function calculateSkilledJobAccess(socialClasses: string[]): number {
  let totalJobAccess = 0;

  socialClasses.forEach((_, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.skilledJobAccess;
    const baseAccess = initialParameters.skilledJobAccess[classKey] || 0.05; // Lowered fallback value
    const educationImpact = initialParameters.higherEducationAccess[classKey].tertiary * 0.4; // Stronger impact factor for tertiary education access
    const povertyImpact = (1 - initialParameters.povertyIndicator[classKey]) * 0.4; // New impact factor for poverty levels

    // Combine base job access with the impacts of education and poverty
    totalJobAccess += baseAccess * educationImpact * povertyImpact;
  });

  // Ensure average job access does not exceed 100%
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

    totalGDP += gdp * populationShare;
    totalPopulationShare += populationShare;
  });

  return totalGDP / totalPopulationShare;
}

export function calculateSocialIndicators(socialClasses: string[]): any {
  // Adjusting life expectancy based on more realistic backward society conditions
  const lifeExpectancy = socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.socialIndicators.lifeExpectancy;
    return acc + initialParameters.socialIndicators.lifeExpectancy[classKey];
  }, 0) / socialClasses.length;

  return {
    lifeExpectancy: lifeExpectancy * 0.9, // Reduced to reflect the backward nature of the society
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
  }, 0) * 100; // Multiply by 100 to convert to percentage
}
