import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { patientName, age, anamnesis } = req.body;

  // Prompt ajustado para o contexto de Fisioterapia
  const prompt = `Analise a anamnese abaixo de forma técnica para a Fisioterapia Dermatofuncional.
  Paciente: ${patientName}, Idade: ${age} anos.
  Anamnese: ${anamnesis}
  
  Forneça uma análise concisa focada em objetivos de tratamento.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash', // Verifique se este é o modelo que você usa
      contents: prompt,
    });
    
    return res.status(200).json({ analysis: response.text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
