// Types for our calculations
export interface ClassMetrics {
  population: number;
  fertility: number;
  education: {
    primary: number;
    secondary: number;
    tertiary: number;
  };
  jobAccess: number;
  wealth: number;
  gdpPerCapita: number;
  povertyRate: number;
  socialIndicators: {
    lifeExpectancy: number;
    infantMortality: number;
    maternalMortality: number;
  };
}

export interface ReservationSettings {
  classReservations: Record<string, number>;
  totalReservationCap: number | null;
  ewsSettings: {
    percentage: number;
    allClassesEligible: boolean;
  };
}

// Initial conditions from whitepaper
export const initialConditions: Record<string, ClassMetrics> = {
  class1: {
    population: 0.05, // 5% of total population
    fertility: 1.6,   // children per woman
    education: {
      primary: 100,   // 100% enrollment
      secondary: 98,  // 98% enrollment
      tertiary: 95,   // 95% enrollment
    },
    jobAccess: 90,    // 90% access to skilled jobs
    wealth: 0.35,     // 35% of total wealth
    gdpPerCapita: 150000, // $150,000 per capita
    povertyRate: 1,   // 1% in poverty
    socialIndicators: {
      lifeExpectancy: 82,
      infantMortality: 2,
      maternalMortality: 5
    }
  },
  class2: {
    population: 0.15,
    fertility: 1.8,
    education: {
      primary: 95,
      secondary: 85,
      tertiary: 65,
    },
    jobAccess: 75,
    wealth: 0.25,
    gdpPerCapita: 80000,
    povertyRate: 10,
    socialIndicators: {
      lifeExpectancy: 78,
      infantMortality: 5,
      maternalMortality: 10
    }
  },
  class3: {
    population: 0.30,
    fertility: 2.5,
    education: {
      primary: 85,
      secondary: 70,
      tertiary: 40,
    },
    jobAccess: 50,
    wealth: 0.20,
    gdpPerCapita: 40000,
    povertyRate: 30,
    socialIndicators: {
      lifeExpectancy: 72,
      infantMortality: 15,
      maternalMortality: 25
    }
  },
  class4: {
    population: 0.35,
    fertility: 3.2,
    education: {
      primary: 70,
      secondary: 45,
      tertiary: 15,
    },
    jobAccess: 25,
    wealth: 0.15,
    gdpPerCapita: 20000,
    povertyRate: 60,
    socialIndicators: {
      lifeExpectancy: 65,
      infantMortality: 30,
      maternalMortality: 45
    }
  },
  class5: {
    population: 0.15,
    fertility: 3.8,
    education: {
      primary: 50,
      secondary: 20,
      tertiary: 2,
    },
    jobAccess: 5,
    wealth: 0.05,
    gdpPerCapita: 5000,
    povertyRate: 85,
    socialIndicators: {
      lifeExpectancy: 58,
      infantMortality: 50,
      maternalMortality: 70
    }
  }
};

// Population Distribution Model: Pc(t + 1) = Pc(t) + (Pc(t) × Bc(t)) - (Pc(t) × Dc(t)) + Mc(t) - (Pc(t) × Rc(t))
export function calculatePopulation(
  currentMetrics: ClassMetrics,
  birthRate: number,
  deathRate: number,
  migrationEffect: number,
  reservationEffect: number
): number {
  const currentPop = currentMetrics.population;
  // Scale factors to keep population changes smaller
  const scaledBirthRate = birthRate * 0.01;
  const scaledDeathRate = deathRate * 0.01;
  const scaledMigration = migrationEffect * 0.001;
  const scaledReservation = reservationEffect * 0.001;
  
  return currentPop + 
         (currentPop * scaledBirthRate) - 
         (currentPop * scaledDeathRate) + 
         scaledMigration - 
         (currentPop * scaledReservation);
}

// Fertility Rate Model: Bc(t + 1) = Bc(t) × (1 - αc(t)) + γc(t)
export function calculateFertility(
  currentRate: number,
  socioEconomicEffect: number,
  reservationImpact: number
): number {
  // Enhanced reservation impact
  const reservationEffect = reservationImpact * 0.12; // Reduced from 0.15
  
  // Socioeconomic effect with increased impact
  const socioEffect = socioEconomicEffect * 0.12; // Increased from 0.08
  
  // Calculate new rate with balanced effects
  const newRate = currentRate * (1 + reservationEffect - socioEffect);
  
  // Ensure sustainable bounds with tighter range
  return Math.max(1.8, Math.min(2.8, newRate)); // Reduced range from 1.5-3.5
}

// Education Access Model: Ec(t + 1) = Ec(t) + (Ic(t) × δc(t)) - (Dc(t) × ρc(t))
export function calculateEducation(
  currentAccess: number,
  investment: number,
  reservationImpact: number,
  dropoutRate: number,
  unemploymentRate: number,
  metrics: ClassMetrics | undefined,
  timeStep: number
): number {
  // Enhanced reservation effect on education
  const reservationBoost = calculateReservationImpact(metrics, reservationImpact, timeStep);
  
  // Progressive education improvement with higher minimum
  const baseImprovement = Math.max(0.1, investment * 0.25); // Increased from 0.08
  const gapMultiplier = Math.pow((100 - currentAccess) / 100, 1.05);
  
  // Combined effect with stronger reservation impact
  const totalImprovement = (baseImprovement + reservationBoost * 1.5) * gapMultiplier; // Increased reservation multiplier
  
  // Stronger dropout impact
  const effectiveDropout = dropoutRate * Math.max(0.4, 1 - reservationBoost * 0.6);
  
  // Calculate new access level - no minimum improvement in negative scenarios
  let newAccess = currentAccess;
  if (totalImprovement > effectiveDropout) {
    newAccess += Math.max(0.01, totalImprovement - effectiveDropout); // Increased minimum positive change
  } else {
    newAccess -= Math.max(0.005, effectiveDropout - totalImprovement);
  }
  
  // Ensure bounds
  return Math.max(0, Math.min(100, newAccess));
}

// Job Access Model: Jc(t + 1) = Jc(t) + (Gc(t) × εc(t)) - Uc(t)
export function calculateJobAccess(
  currentAccess: number,
  economicGrowth: number,
  reservationImpact: number,
  unemploymentRate: number,
  metrics: ClassMetrics | undefined,
  timeStep: number
): number {
  // Enhanced reservation effect with education linkage
  const reservationBoost = calculateReservationImpact(metrics, reservationImpact, timeStep);
  
  // Education-based job creation with higher minimum
  const educationBonus = metrics ? metrics.education.tertiary / 100 : 0;
  const educationMultiplier = Math.max(1.4, 1 + (educationBonus * 1.1)); // Increased from 1.3
  
  // Progressive job access improvement
  const baseImprovement = Math.max(0.1, economicGrowth * 0.3); // Increased from 0.08
  const gapMultiplier = Math.pow((100 - currentAccess) / 100, 1.1);
  
  // Combined effect with education linkage
  const totalImprovement = (baseImprovement + reservationBoost * 1.5) * gapMultiplier * educationMultiplier; // Increased reservation multiplier
  
  // Stronger unemployment impact
  const effectiveUnemployment = unemploymentRate * Math.max(0.4, 1 - reservationBoost * 0.5);
  
  // Calculate new access level - no minimum improvement in negative scenarios
  let newAccess = currentAccess;
  if (totalImprovement > effectiveUnemployment) {
    newAccess += Math.max(0.01, totalImprovement - effectiveUnemployment); // Increased minimum positive change
  } else {
    newAccess -= Math.max(0.005, effectiveUnemployment - totalImprovement);
  }
  
  // Ensure bounds
  return Math.max(0, Math.min(100, newAccess));
}

// Wealth Distribution Model: Wc(t + 1) = Wc(t) + (Yc(t) × λc(t)) - Cc(t)
export function calculateWealth(
  currentWealth: number,
  income: number,
  savingsRate: number,
  consumptionRate: number
): number {
  return currentWealth + 
         (income * savingsRate) - 
         consumptionRate;
}

// Social Indicators Model: Sc(t + 1) = Sc(t) + (ψc(t) × φc(t))
export function calculateSocialIndicators(
  currentIndicators: ClassMetrics['socialIndicators'],
  socioEconomicEffect: number,
  reservationImpact: number
): ClassMetrics['socialIndicators'] {
  const impactFactor = socioEconomicEffect * reservationImpact;
  const maxLifeExpectancy = 85;
  const minInfantMortality = 2;
  const minMaternalMortality = 3;
  
  // Scale improvements based on current gap to target
  const lifeExpectancyGap = maxLifeExpectancy - currentIndicators.lifeExpectancy;
  const scaledLifeExpectancyImprovement = impactFactor * 0.2 * (lifeExpectancyGap / 20);
  
  // Calculate new life expectancy with increased improvement rate
  const newLifeExpectancy = Math.min(
    maxLifeExpectancy,
    currentIndicators.lifeExpectancy * (1 + scaledLifeExpectancyImprovement)
  );
  
  // Scale mortality improvements based on current rates
  const infantMortalityReduction = impactFactor * 0.3 * (currentIndicators.infantMortality / 50);
  const maternalMortalityReduction = impactFactor * 0.3 * (currentIndicators.maternalMortality / 70);
  
  const newInfantMortality = Math.max(
    minInfantMortality,
    currentIndicators.infantMortality * (1 - infantMortalityReduction)
  );
  
  const newMaternalMortality = Math.max(
    minMaternalMortality,
    currentIndicators.maternalMortality * (1 - maternalMortalityReduction)
  );
  
  return {
    lifeExpectancy: newLifeExpectancy,
    infantMortality: newInfantMortality,
    maternalMortality: newMaternalMortality
  };
}

// Main calculation function that combines all models
export function calculateNextTimeStep(
  currentMetrics: Record<string, ClassMetrics>,
  reservationSettings: ReservationSettings,
  timeStep: number
): Record<string, ClassMetrics> {
  const newMetrics: Record<string, ClassMetrics> = {};
  
  // Calculate reservation effects
  const totalReservation = Object.values(reservationSettings.classReservations).reduce((sum, val) => sum + val, 0);
  const effectiveCap = reservationSettings.totalReservationCap ?? 100;
  
  // Calculate total population for normalization
  let totalPopulation = 0;
  
  // Calculate creamy layer threshold - set at 8x poverty line GDP per capita
  const povertyLineGDP = 5000; // Based on class5 GDP per capita
  const creamyLayerThreshold = povertyLineGDP * 8;
  
  // Enhanced support for lower classes
  const enhancedSupportThreshold = povertyLineGDP * 2.5;
  
  for (const [className, metrics] of Object.entries(currentMetrics)) {
    // Calculate class-specific effects
    let reservationEffect = reservationSettings.classReservations[className] ?? 0;
    
    // Stricter creamy layer exclusion
    if (metrics.gdpPerCapita >= creamyLayerThreshold * 0.95) { // 5% buffer zone
      reservationEffect = 0;
    }
    
    // Enhanced support for very low income groups
    const needsEnhancedSupport = metrics.gdpPerCapita <= enhancedSupportThreshold;
    const supportGap = (enhancedSupportThreshold - metrics.gdpPerCapita) / enhancedSupportThreshold;
    const enhancedSupportMultiplier = needsEnhancedSupport ? 
      2.8 * Math.pow(supportGap, 1.1) : 0; // Increased multiplier, smoother curve
    
    // Apply EWS benefits
    const ewsEffect = calculateEWSEffect(
      metrics,
      reservationSettings.ewsSettings,
      creamyLayerThreshold,
      className,
      reservationEffect
    );
    
    const socioEconomicEffect = calculateSocioEconomicEffect(metrics);
    const economicGrowth = calculateEconomicGrowth(metrics, timeStep);
    
    // Combine all effects
    const totalReservationEffect = (reservationEffect + ewsEffect) * (1 + enhancedSupportMultiplier);
    
    // Strengthen reservation impact with enhanced support
    const reservationMultiplier = totalReservationEffect > 0 ? 
      1 + (totalReservationEffect / 100) * (1 + enhancedSupportMultiplier) : 1;
    
    // Calculate education investment boost
    const educationBoost = needsEnhancedSupport ? 0.1 : 0;
    
    // Apply all calculations with enhanced effects
    const newMetric = {
      population: calculatePopulation(
        metrics,
        metrics.fertility,
        0.01,
        0.001,
        totalReservationEffect * 0.01
      ),
      fertility: calculateFertility(
        metrics.fertility,
        socioEconomicEffect,
        totalReservationEffect * 0.001
      ),
      education: {
        primary: calculateEducation(
          metrics.education.primary,
          (0.07 + educationBoost) * reservationMultiplier, // Increased from 0.06
          totalReservationEffect * 0.12, // Increased from 0.10
          0.01,
          1 - socioEconomicEffect,
          metrics,
          timeStep
        ),
        secondary: calculateEducation(
          metrics.education.secondary,
          (0.06 + educationBoost) * reservationMultiplier, // Increased from 0.05
          totalReservationEffect * 0.11, // Increased from 0.09
          0.02,
          1 - socioEconomicEffect,
          metrics,
          timeStep
        ),
        tertiary: calculateEducation(
          metrics.education.tertiary,
          (0.05 + educationBoost) * reservationMultiplier, // Increased from 0.04
          totalReservationEffect * 0.10, // Increased from 0.08
          0.03,
          1 - socioEconomicEffect,
          metrics,
          timeStep
        )
      },
      jobAccess: calculateJobAccess(
        metrics.jobAccess,
        economicGrowth * reservationMultiplier * 1.2, // Added 20% boost
        totalReservationEffect * 0.10, // Increased from 0.08
        0.05 * (1 - socioEconomicEffect),
        metrics,
        timeStep
      ),
      wealth: calculateWealth(
        metrics.wealth,
        metrics.gdpPerCapita,
        0.2 * socioEconomicEffect * reservationMultiplier * (1 + enhancedSupportMultiplier),
        metrics.gdpPerCapita * (0.7 - (needsEnhancedSupport ? 0.1 : 0)) // Reduced consumption for enhanced savings
      ),
      gdpPerCapita: metrics.gdpPerCapita * (1 + economicGrowth * reservationMultiplier * (1 + enhancedSupportMultiplier)),
      povertyRate: Math.max(
        1, // Minimum poverty rate of 1%
        metrics.povertyRate * (1 - (
          totalReservationEffect * 0.03 + // Increased from 0.02
          economicGrowth * 0.06 + // Increased from 0.05
          (metrics.education.tertiary / 100) * 0.04 + // Increased from 0.03
          (metrics.jobAccess / 100) * 0.05 // Increased from 0.04
        ))
      ),
      socialIndicators: calculateSocialIndicators(
        metrics.socialIndicators,
        socioEconomicEffect,
        totalReservationEffect * 0.03 // Increased from 0.02
      )
    };
    
    newMetrics[className] = newMetric;
    totalPopulation += newMetric.population;
  }
  
  // Normalize population to maintain total at 100%
  for (const className of Object.keys(newMetrics)) {
    newMetrics[className].population = newMetrics[className].population / totalPopulation;
  }
  
  return newMetrics;
}

// Helper functions
function calculateSocioEconomicEffect(metrics: ClassMetrics): number {
  return (
    (metrics.education.tertiary / 100) * 0.4 +
    (metrics.jobAccess / 100) * 0.3 +
    (1 - metrics.povertyRate / 100) * 0.3
  );
}

function calculateEconomicGrowth(metrics: ClassMetrics, timeStep: number): number {
  const baseGrowth = 0.03; // 3% base growth rate
  const educationFactor = metrics.education.tertiary / 100;
  const jobFactor = metrics.jobAccess / 100;
  const timeEffect = Math.min(1, timeStep / 10); // Scale effect based on time, max at 10 steps
  return baseGrowth * (1 + educationFactor) * (1 + jobFactor) * (1 + timeEffect);
}

// Helper function to calculate EWS effect
function calculateEWSEffect(
  metrics: ClassMetrics,
  ewsSettings: ReservationSettings['ewsSettings'],
  creamyLayerThreshold: number,
  className: string,
  existingReservation: number
): number {
  // No EWS if already receiving reservation benefits
  if (existingReservation > 0) {
    return 0;
  }
  
  // Check if class is eligible for EWS
  const isEligible = ewsSettings.allClassesEligible || 
                    (className === 'class1' || metrics.gdpPerCapita < creamyLayerThreshold);
  
  if (!isEligible) {
    return 0;
  }
  
  // Calculate EWS effect based on economic criteria
  const economicNeed = 1 - (metrics.gdpPerCapita / creamyLayerThreshold);
  return Math.max(0, ewsSettings.percentage * economicNeed);
}

function calculateReservationImpact(
  metrics: ClassMetrics | undefined,
  reservationPercentage: number,
  timeStep: number
): number {
  // Handle undefined metrics
  if (!metrics) {
    return reservationPercentage * 0.025;
  }

  // Base impact scales with reservation percentage
  let baseImpact = reservationPercentage * 0.03;

  // Progressive scaling based on current access levels
  const educationGap = 100 - (metrics.education?.tertiary || 0);
  const jobGap = 100 - (metrics.jobAccess || 0);
  
  // Higher multipliers for larger gaps
  const educationMultiplier = Math.pow(educationGap / 100, 1.05);
  const jobMultiplier = Math.pow(jobGap / 100, 1.05);
  
  // Combined progressive impact with higher minimum
  const progressiveImpact = Math.max(
    baseImpact * 1.3,
    baseImpact * (educationMultiplier + jobMultiplier)
  );

  // Generational effect (increases impact over time)
  const generationalBoost = Math.min(timeStep / 15, 2.5);
  
  // Education-Employment linkage with higher minimum
  const educationBonus = (metrics.education?.tertiary || 0) / 100;
  const employmentMultiplier = Math.max(1.4, 1 + (educationBonus * 1.0));
  
  // Creamy layer reduction (complete cutoff)
  const creamyLayerThreshold = 25000; // Reduced from 30000
  const gdpRatio = (metrics.gdpPerCapita || 0) / creamyLayerThreshold;
  const creamyLayerReduction = gdpRatio >= 0.6 ? 0 : Math.max(0, 1 - Math.pow(gdpRatio, 3.5)); // Earlier cutoff, steeper decline

  return progressiveImpact * (1 + generationalBoost) * employmentMultiplier * creamyLayerReduction;
} 