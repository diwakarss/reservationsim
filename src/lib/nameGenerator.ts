export interface Trait {
    trait: string;
  }
  
  export async function generateTrait(): Promise<Trait> {
    const response = await fetch('/api/generate-trait');
    if (!response.ok) {
      throw new Error('Failed to generate trait');
    }
    const { trait } = await response.json();
    console.log('Trait API Response:', trait);
    return { trait };
  }

export type SocialClass = 'class1' | 'class2' | 'class3' | 'class4' | 'class5';

export async function generateSocialClasses(trait: Trait, planetName: string, countryName: string): Promise<SocialClass[]> {
  const response = await fetch('/api/generate-social-classes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trait, planetName, countryName }),
  });
  if (!response.ok) {
    throw new Error('Failed to generate social classes');
  }
  const socialClasses: string[] = await response.json();
  return socialClasses as SocialClass[];
}

export async function generatePlanetName(): Promise<string> {
  const response = await fetch('/api/generate-planet-name');
  if (!response.ok) {
    throw new Error('Failed to generate planet name');
  }
  const { name } = await response.json();
  return name;
}

export async function generateCountryName(): Promise<string> {
  const response = await fetch('/api/generate-country-name');
  if (!response.ok) {
    throw new Error('Failed to generate country name');
  }
  const { name } = await response.json();
  return name;
}

export function generatePopulation(): string {
  return (Math.floor(Math.random() * 990000000) + 10000000).toLocaleString();
}