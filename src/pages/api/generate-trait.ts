import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Trait } from '@/lib/nameGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const traitCategories = [
  "eyes",
  "skin",
  "hair",
  "limbs",
  "senses",
  "abilities",
  "organs",
  "movement",
  "voice",
  "other physical traits"
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Randomly select a trait category
      const randomCategory = traitCategories[Math.floor(Math.random() * traitCategories.length)];

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a creative assistant that generates unique physical traits." },
          { role: "user", content: `Generate a unique and interesting physical trait related to ${randomCategory} that someone could be born with. Include traits related to various body parts, senses, abilities, number of limbs, or even more outrageous imaginations. Provide only the trait name without any explanation or context.` },
        ],
        max_tokens: 20,
        n: 1,
      });

      const trait = response.choices[0].message.content?.trim() || 'Unknown Trait';
      
      res.status(200).json({ trait });
    } catch (error) {
      console.error('Error generating trait:', error);
      res.status(500).json({ error: 'Failed to generate trait' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
