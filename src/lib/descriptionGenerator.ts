import { Trait } from './nameGenerator';

export async function generateTraitDescription(trait: Trait, planetName: string, countryName: string): Promise<string> {
  try {
    const response = await fetch('/api/generate-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trait, planetName, countryName }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate description');
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error('Error generating trait description:', error);
    return "Failed to generate description. Please try again.";
  }
}

export async function generateClassDescription(className: string, allClassNames: string[], trait: Trait, planetName: string, countryName: string): Promise<string> {
  try {
    // Log the data being sent to the server
    console.log('Sending data:', { className, allClassNames, trait, planetName, countryName });

    const response = await fetch('/api/generate-class-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ className, allClassNames, trait, planetName, countryName }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`API responded with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data.description;
  } catch (error) {
    console.error("Error in generateClassDescription:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate class description for ${className}: ${errorMessage}`);
  }
}