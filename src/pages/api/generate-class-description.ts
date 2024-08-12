import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Trait } from '@/lib/nameGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { className, allClassNames, trait, planetName, countryName } = req.body as { 
        className: string; 
        allClassNames: string[]; 
        trait: Trait; 
        planetName: string; 
        countryName: string 
      };

      // Log the request body for debugging
      console.log('Request body:', req.body);

      // Validate request body
      if (!className || !allClassNames || !trait || !planetName || !countryName) {
        console.error('Missing required fields:', { className, allClassNames, trait, planetName, countryName });
        return res.status(400).json({ error: 'Missing required fields in request body' });
      }

      const classIndex = allClassNames.indexOf(className);
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a satirical sociologist exposing the absurdities of a strictly tiered caste system in alien societies." },
          { role: "user", content: `Describe the "${className}" social class (tier ${classIndex + 1} of 5) on planet ${planetName} in ${countryName}, where society is divided based on the trait "${trait.trait}". The 5 tiers from highest to lowest are: ${allClassNames.join(', ')}. Highlight this class's specific privileges or lack thereof, and the absurd justifications for their social position. Reference at least one other tier by name for context. Be scathingly satirical in 200 characters or less.` },
        ],
        max_tokens: 100,
        temperature: 0.8,
      });

      const description = response.choices[0].message.content?.trim() || "Description unavailable.";
      res.status(200).json({ description });
    } catch (error) {
      console.error('Error generating class description:', error);
      res.status(500).json({ error: `Failed to generate class description: ${error instanceof Error ? error.message : String(error)}` });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}