import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Safe lazy initialization helper for the Gemini SDK
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Enable JSON bodies
app.use(express.json());

// --- API ROUTES ---

// 0. Check if Gemini API is configured
app.get('/api/ai/status', (req, res) => {
  const ai = getAiClient();
  res.json({ configured: !!ai });
});

// 1. Chat with FisioAI for protocols and general query
app.post('/api/ai/chat', async (req, res) => {
  const ai = getAiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'O serviço de Inteligência Artificial não está configurado. Por favor, adicione a chave GEMINI_API_KEY no painel de Secrets.',
    });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem é obrigatória.' });
  }

  try {
    const formattedHistory = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // Add the user message as the final input part
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `Você é a FisioAI, uma inteligência artificial assistente altamente especializada em Fisioterapia Dermatofuncional, Cosmética Avançada e Estética Clínica. 
Seu papel é auxiliar a profissional Dra. Aline na tomada de decisão clínica, criação de protocolos personalizados, indicação de ativos cosméticos (como retinol, vitamina C, niacinamida, ácido hialurônico, ácidos químicos) e revisão de contraindicações de tratamentos (como Radiofrequência, Microagulhamento, Jato de Plasma, Luz Pulsada, Peeling, Drenagem).

Diretrizes importantes:
1. Responda em português de forma clara, técnica, elegante e extremamente estruturada (utilizando listas e negritos).
2. Forneça sempre base científica de forma sutil, focando no bem-estar e na segurança do paciente.
3. Se houver alguma contraindicação aparente (ex: gestante, marcapasso, pele ferida), destaque isso em um bloco de alerta.
4. Mantenha um tom profissional, acolhedor e focado na prática clínica diária.`,
      },
      history: formattedHistory,
    });

    const response = await chat.sendMessage({ message });
    res.json({ response: response.text });
  } catch (error: any) {
    console.error('Erro na rota /api/ai/chat:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar a resposta do Gemini.' });
  }
});

// 2. Generate customized clinical treatment planning and home care recommendation
app.post('/api/ai/analyze-anamnesis', async (req, res) => {
  const ai = getAiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'O serviço de Inteligência Artificial não está configurado. Por favor, adicione a chave GEMINI_API_KEY no painel de Secrets.',
    });
  }

  const { patientName, age, anamnesis } = req.body;

  if (!anamnesis) {
    return res.status(400).json({ error: 'Os dados de anamnese são necessários para a análise.' });
  }

  const prompt = `Por favor, analise as informações de anamnese do paciente abaixo para gerar um plano de tratamento profissional detalhado e uma rotina Home Care personalizada.

DADOS DO PACIENTE:
- Nome: ${patientName || 'Não informado'}
- Idade: ${age || 'Não informada'}
- Tipo de Pele: ${anamnesis.skinType || 'Não informado'}
- Queixa Principal: ${anamnesis.mainComplaint || 'Não informada'}
- Alergias: ${anamnesis.allergies || 'Nenhuma relatada'}
- Contraindicações: ${anamnesis.contraindications || 'Nenhuma relatada'}
- Medicamentos de uso contínuo: ${anamnesis.medications || 'Nenhum'}
- Patologias/Doenças: ${anamnesis.diseases || 'Nenhuma'}
- Observações Gerais: ${anamnesis.observations || 'Nenhuma'}

Gere um relatório estruturado em markdown contendo os seguintes tópicos exatamente:

### 🔍 1. Avaliação e Diagnóstico Clínico
(Analise o tipo de pele, a queixa principal e as possíveis causas biológicas, identificando prioridades.)

### 📋 2. Plano de Tratamento Clínico Proposto
(Esboce um protocolo de 4 a 10 sessões no consultório da Dra. Aline, explicando quais procedimentos fazer (ex: microagulhamento, peeling químico, drenagem linfática, radiofrequência, limpeza de pele profunda) e os intervalos ideais entre as sessões.)

### 🏠 3. Rotina Home Care Personalizada
(Crie uma prescrição de rotina diária em tópicos: Manhã e Noite. Sugira ingredientes ativos específicos de acordo com a queixa e tipo de pele do paciente, com orientações de uso seguro.)

### ⚠️ 4. Alertas Importantes e Contraindicações
(Destaque riscos clínicos específicos para as alergias, contraindicações ou doenças informadas. Liste ingredientes ou técnicas que são estritamente PROIBIDOS para este paciente.)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ analysis: response.text });
  } catch (error: any) {
    console.error('Erro na rota /api/ai/analyze-anamnesis:', error);
    res.status(500).json({ error: error.message || 'Erro ao analisar a anamnese.' });
  }
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
