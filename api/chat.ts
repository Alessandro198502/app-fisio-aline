import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { message, history } = req.body;

  try {
    const formattedHistory = (history || []).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: `Você é a FisioAI... (adicione aqui a instrução original)`,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });
    return res.status(200).json({ response: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
