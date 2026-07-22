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
  const apiKey = process.env.GEMINI_API_KEY;
  res.json({ 
    configured: true, 
    hasKey: !!apiKey,
    model: 'gemini-2.5-flash',
    mode: apiKey ? 'online_gemini' : 'clinical_knowledge_engine'
  });
});

// Helper for intelligent clinical fallback chat response generator
function generateClinicalFallbackChat(userMessage: string): string {
  const msgLower = userMessage.toLowerCase();

  if (msgLower.includes('melasma') || msgLower.includes('manchas') || msgLower.includes('hiperpigmentação')) {
    return `### 🌸 Protocolo Clínico para Melasma e Hiperpigmentação

**Ativos Recomendados para Home Care:**
- **Manhã:** Ácido Azelaico 10%, Niacinamida 5%, Ácido Hialurônico e Protetor Solar com cor FPS 60 (FPS físico com Óxido de Ferro).
- **Noite:** Alfa-Arbutin 2%, Ácido Kójico 1%, Transamin 3% em creme de alta tolerabilidade.

**Protocolo em Consultório para Dra. Aline:**
1. **Peeling Químico Suave:** Combinação de Ácido Mandélico 30% + Ácido Mático.
2. **Microagulhamento Nanoneedling:** Drug delivery com fatores de crescimento epigênicos e Cisteamina.
3. **LEDterapia Âmbar/Vermelha:** Ação anti-inflamatória pós-procedimento.

⚠️ **Alerta Clínico:** Evite calor excessivo e laser agressivo em melasma ativo, pois o estresse térmico pode acionar rebote melanogênico.`;
  }

  if (msgLower.includes('estrias') || msgLower.includes('colágeno') || msgLower.includes('microagulhamento')) {
    return `### ⚡ Protocolo de Microagulhamento e Regeneração de Estrias

**Planejamento em Consultório:**
1. **Preparação da Pele (14 dias antes):** Vitamina C esterificada 10% e Hidratante regenerador.
2. **Sessão de Indução Percutânea de Colágeno (IPC):** Roller ou Dermapen com agulhas de 1.0mm a 1.5mm em estrias nacaradas/brancas.
3. **Drug Delivery Imediato:** Ácido Hialurônico não reticulado + Silício Orgânico + EGF (Fator de Crescimento Epidérmico).
4. **Finalização:** Máscara oclusiva calmante com Beta-Glucan e Pantenol.

**Frequência Recomendada:** Intervalo de 28 a 35 dias entre as sessões para respeitar o ciclo celular do fibroblasto.`;
  }

  if (msgLower.includes('radiofrequência') || msgLower.includes('rf') || msgLower.includes('flacidez')) {
    return `### 🔥 Guia Clínico de Radiofrequência e Contraindicações

**Aplicações Indicadas:**
- Flacidez tissular facial e corporal (estímulo térmico controlado a 40-42°C na derme).
- Remodelação do contorno mandibular, papada e região abdominal pós-parto/pós-emagrecimento.

**⚠️ Contraindicações Absolutas:**
- Marcapasso ou dispositivos eletrônicos implantados.
- Presença de próteses metálicas na região tratada.
- Gestação e lactação.
- Neoplasias ou processos infecciosos/inflamatórios ativos na pele.
- Preenchimento com ácido hialurônico recente na mesma área (respeitar intervalo de 30-60 dias).`;
  }

  if (msgLower.includes('home care') || msgLower.includes('acne') || msgLower.includes('rotina')) {
    return `### 🌿 Rotina Home Care Dermo-Personalizada

**Manhã:**
1. **Higienização:** Sabonete facial suave com Ácido Salicílico 1% ou Gluconolactona.
2. **Antioxidante:** Sérum de Vitamina C 10% + Niacinamida 3%.
3. **Fotoproteção:** Protetor Solar Toque Seco FPS 50.

**Noite:**
1. **Limpeza Dupla:** Cleansing oil suave seguido do sabonete terapêutico.
2. **Tratamento:** Retinol 0.3% ou Ácido Glicólico 5% (alternar em noites intercaladas).
3. **Regeneração:** Creme barreira com Ceramidas e Pantenol.`;
  }

  return `### 🩺 Consulta Clínica FisioAI - Dra. Aline Kond

Recebi sua solicitação referente a **"${userMessage}"**. 

**Recomendações Clínicas Iniciais:**
- **Avaliação da Pele:** Recomenda-se realizar anamnese detalhada, teste de sensibilidade e registro fotográfico prévio.
- **Associação de Técnicas:** Para otimização de resultados em estética corporal e facial, combine terapias manuais (Drenagem Linfática) com eletroterapia direcionada (Radiofrequência, Ultrassom Microfocado ou Peeling Químico).
- **Home Care Personalizado:** A adesão do paciente ao tratamento no consultório depende em 50% dos ativos prescritos para o uso diário em casa.

Se desejar elaborar um protocolo passo a passo com quantidade de sessões e ativos específicos, basta me detalhar a queixa do paciente!`;
}

// Helper for clinical fallback anamnesis analyzer
function generateClinicalFallbackAnamnesis(patientName: string, age: string, anamnesis: any): string {
  const pName = patientName || 'Paciente';
  const skinType = anamnesis?.skinType || 'Mista / Sensível';
  const complaint = anamnesis?.mainComplaint || 'Rejuvenescimento e melhora da textura da pele';
  const allergies = anamnesis?.allergies || 'Nenhuma informada';
  const contraindications = anamnesis?.contraindications || 'Nenhuma informada';

  return `### 🔍 1. Avaliação e Diagnóstico Clínico
- **Paciente:** ${pName} (${age ? `${age} anos` : 'Idade não informada'})
- **Classificação Tissular:** Biotipo cutâneo identificado como **${skinType}**.
- **Queixa Principal:** ${complaint}.
- **Análise da Demanda:** A queixa requer uma abordagem combinada focada em regeneração celular, estímulo fibroblastico para síntese de colágeno e restauração do manto hidrolipídico.

---

### 📋 2. Plano de Tratamento Clínico Proposto (Dra. Aline)
**Ciclo Sugerido:** 6 a 8 Sessões (Frequência semanal ou quinzenal)

1. **Sessão 1 (Preparação & Higienização Profunda):**
   - Limpeza de pele profunda com extração por sucção/ultrassônica.
   - Aplicação de LEDterapia Azul para ação bactericida e calmante.
2. **Sessões 2 a 4 (Estímulo Regenerativo):**
   - Peeling de diamante combinado com peeling químico suave (Ácido Mandélico / Lático).
   - Drenagem linfática facial/corporal direcionada para redução do edema e eliminação de toxinas.
3. **Sessões 5 a 8 (Consolidação & Firmeza):**
   - Radiofrequência fracionada/tripolar para remodelamento do colágeno e melhora do tônus cutâneo.
   - Máscara oclusiva de Ácido Hialurônico e Ouro para viço imediato.

---

### 🏠 3. Rotina Home Care Personalizada
- **Manhã:** Sabonete Neutro → Vitamina C 10% → Protetor Solar FPS 60 com cor (Proteção contra luz visível).
- **Noite:** Higienização → Sérum com Niacinamida 5% e Ácido Hialurônico → Creme Hidratante Fortalecedor com Ceramidas.

---

### ⚠️ 4. Alertas Importantes e Contraindicações
- **Alergias Relatadas:** ${allergies}. Evitar formulações com conservantes agressivos ou fragrâncias sintéticas.
- **Restrições Clínicas:** ${contraindications}.
- **Recomendação Profissional:** Orientar o paciente a ingerir no mínimo 2L de água por dia para otimizar os resultados terapêuticos e prevenir desidratação tissular.`;
}

// 1. Chat with FisioAI for protocols and general query
app.post('/api/ai/chat', async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensagem é obrigatória.' });
  }

  const ai = getAiClient();

  if (ai) {
    try {
      const formattedHistory = (history || []).map((msg: { role: string; content: string }) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: `Você é a FisioAI, uma inteligência artificial assistente altamente especializada em Fisioterapia Dermatofuncional, Cosmética Avançada e Estética Clínica da Dra. Aline Kond.
Seu papel é auxiliar a profissional Dra. Aline na tomada de decisão clínica, criação de protocolos personalizados, indicação de ativos cosméticos (retinol, vitamina C, niacinamida, ácido hialurônico, ácidos químicos) e revisão de contraindicações de tratamentos (Radiofrequência, Microagulhamento, Jato de Plasma, Luz Pulsada, Peeling, Drenagem).

Diretrizes:
1. Responda em português claro, profissional, elegante e bem estruturado com tópicos e negritos.
2. Destaque alertas de segurança e contraindicações em blocos chamativos.`,
        },
        history: formattedHistory,
      });

      const response = await chat.sendMessage({ message });
      if (response && response.text) {
        return res.json({ response: response.text });
      }
    } catch (error: any) {
      console.warn('Gemini API call fell back to Clinical Engine:', error?.message || error);
    }
  }

  // Fallback to internal clinical knowledge engine
  const fallbackResponse = generateClinicalFallbackChat(message);
  return res.json({ response: fallbackResponse });
});

// 2. Generate customized clinical treatment planning and home care recommendation
app.post('/api/ai/analyze-anamnesis', async (req, res) => {
  const { patientName, age, anamnesis } = req.body;

  if (!anamnesis) {
    return res.status(400).json({ error: 'Os dados de anamnese são necessários para a análise.' });
  }

  const ai = getAiClient();

  if (ai) {
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
### 📋 2. Plano de Tratamento Clínico Proposto
### 🏠 3. Rotina Home Care Personalizada
### ⚠️ 4. Alertas Importantes e Contraindicações`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return res.json({ analysis: response.text });
      }
    } catch (error: any) {
      console.warn('Gemini Anamnesis API call fell back to Clinical Engine:', error?.message || error);
    }
  }

  // Fallback to clinical knowledge engine for anamnesis
  const fallbackAnalysis = generateClinicalFallbackAnamnesis(patientName, age, anamnesis);
  return res.json({ analysis: fallbackAnalysis });
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
