import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Trait } from '@/lib/nameGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { trait } = req.body as { trait: Trait };
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a creative assistant that generates names for a strictly tiered social hierarchy based on innate traits." },
          { role: "user", content: `Generate 5 hierarchical social class names based on the trait "${trait.trait}", from highest to lowest status. Each name should be exactly two words, clearly indicate its tier in the hierarchy (e.g., using words like Elite, Upper, Middle, Lower, Bottom), and relate to the trait. The names should become progressively less prestigious. Provide only the names, one per line.` },
        ],
        max_tokens: 100,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content;
      const socialClasses = content ? content.split('\n').filter(line => line.trim() !== '') : [];
      
      res.status(200).json(socialClasses);
    } catch (error) {
      console.error('Error generating social classes:', error);
      res.status(500).json({ error: 'Failed to generate social classes' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}