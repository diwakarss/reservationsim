import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant that generates planet names." },
          { role: "user", content: "Generate a single planet name. Provide only the name without any explanation or context." },
        ],
        max_tokens: 10,
        n: 1,
      });

      const name = response.choices[0].message.content?.trim() || 'Unknown Planet';
      
      res.status(200).json({ name });
    } catch (error) {
      console.error('Error generating planet name:', error);
      res.status(500).json({ error: 'Failed to generate planet name' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}