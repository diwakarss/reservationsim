import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Trait } from '@/lib/nameGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use server-side environment variable
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { trait, planetName, countryName } = req.body as { trait: Trait; planetName: string; countryName: string };
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a satirical writer exposing societal inequalities through fictional alien worlds." },
          { role: "user", content: `Generate a brief, satirical description (max 150 characters) of how the trait "${trait.trait}" is used to justify a deeply unfair caste-like system on planet ${planetName} in the country ${countryName}. Be biting and absurd in your critique.` },
        ],
        max_tokens: 60, // This should generate roughly 150 characters
        temperature: 0.8,
      });

      const description = response.choices[0].message.content?.trim() || "Description unavailable.";
      res.status(200).json({ description });
    } catch (error) {
      console.error('Error generating trait description:', error);
      res.status(500).json({ error: 'Failed to generate description' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}