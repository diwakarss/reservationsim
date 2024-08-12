import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { Trait } from '@/lib/nameGenerator';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates country names." },
          { role: "user", content: "Generate a single country name. Provide only the name without any explanation or context." },
        ],
        max_tokens: 10,
        n: 1,
      });

      const name = response.choices[0].message.content?.trim() || 'Unknown Country';
      
      res.status(200).json({ name });
    } catch (error) {
      console.error('Error generating country name:', error);
      res.status(500).json({ error: 'Failed to generate country name' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}