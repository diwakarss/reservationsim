export type SocialClass = 'class1' | 'class2' | 'class3' | 'class4' | 'class5';

export const initialParameters = {
  populationDistribution: {
    class1: 0.05,
    class2: 0.15,
    class3: 0.30,
    class4: 0.35,
    class5: 0.15,
  },
  fertilityRateDistribution: {
    class1: 1.8,
    class2: 2.0,
    class3: 2.5,
    class4: 3.0,
    class5: 3.5,
  },
  educationAccess: {
    class1: { primary: 1.0, secondary: 0.98, tertiary: 0.90 },
    class2: { primary: 0.95, secondary: 0.85, tertiary: 0.60 },
    class3: { primary: 0.85, secondary: 0.70, tertiary: 0.40 },
    class4: { primary: 0.75, secondary: 0.50, tertiary: 0.20 },
    class5: { primary: 0.60, secondary: 0.30, tertiary: 0.05 },
  },
  jobAccess: {
    class1: 0.98,
    class2: 0.90,
    class3: 0.80,
    class4: 0.65,
    class5: 0.50,
  },
  wealthDistribution: {
    class1: 0.40,
    class2: 0.30,
    class3: 0.20,
    class4: 0.08,
    class5: 0.02,
  },
  socialIndicators: {
    lifeExpectancy: {
      class1: 85,
      class2: 80,
      class3: 75,
      class4: 70,
      class5: 65,
    },
    infantMortalityRate: {
      class1: 4,
      class2: 10,
      class3: 20,
      class4: 30,
      class5: 40,
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
      class2: 0.60,
      class3: 0.40,
      class4: 0.20,
      class5: 0.10,
    },
  },
};

export function calculateFertilityRate(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.fertilityRateDistribution;
    return acc + (initialParameters.fertilityRateDistribution[classKey] || 2.5);
  }, 0) / socialClasses.length;
}

export function calculateEducationAccess(socialClasses: string[]): number {
  const defaultAccess = 0.5; // Default access value
  let totalAccess = 0;
  
  socialClasses.forEach((className, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.educationAccess;
    const classAccess = initialParameters.educationAccess[classKey];
    if (classAccess) {
      totalAccess += (classAccess.primary + classAccess.secondary + classAccess.tertiary) / 3;
    } else {
      totalAccess += defaultAccess;
    }
  });

  return totalAccess / socialClasses.length;
}

export function calculateJobAccess(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.jobAccess;
    return acc + (initialParameters.jobAccess[classKey] || 0.5);
  }, 0) / socialClasses.length;
}

export function calculateWealthDistribution(socialClasses: string[]): number {
  return socialClasses.reduce((acc, _, index) => {
    const classKey = `class${index + 1}` as keyof typeof initialParameters.wealthDistribution;
    return acc + (initialParameters.wealthDistribution[classKey] || 0.2);
  }, 0) / socialClasses.length;
}

export function calculateSocialIndicators(socialClasses: string[]): any {
  return {
    lifeExpectancy: (initialParameters.socialIndicators.lifeExpectancy.class1 + initialParameters.socialIndicators.lifeExpectancy.class5) / 2,
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