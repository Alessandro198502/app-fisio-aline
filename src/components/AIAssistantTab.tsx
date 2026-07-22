import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, FileText, Send, User, Bot, Loader2, Copy, Check, Info, Trash2, ArrowRight, CornerDownRight, RefreshCw } from 'lucide-react';
import { Patient } from '../types';

interface AIAssistantTabProps {
  patients: Patient[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantTab({ patients }: AIAssistantTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'anamnesis'>('chat');
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Olá, Dra. Aline! Sou a **FisioAI**, sua assistente clínica avançada. Posso ajudar você a criar protocolos, conferir ativos cosméticos para rotinas de home care, sugerir técnicas para queixas corporais ou revisar contraindicações de procedimentos. Como posso apoiar seus atendimentos hoje?'
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Anamnesis state
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Clipboard copied indicator
  const [copiedText, setCopiedText] = useState(false);

  // AI Config status
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/ai/status')
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.configured === 'boolean') {
          setIsAiConfigured(data.configured);
        }
      })
      .catch(err => console.error('Erro ao verificar status da IA:', err));
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeSubTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeSubTab]);

  // Clean copied text notification after delay
  useEffect(() => {
    if (copiedText) {
      const timer = setTimeout(() => setCopiedText(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedText]);

  // Chat preset suggestions
  const chatPresets = [
    { label: 'Ativos p/ Melasma', text: 'Quais os melhores ativos cosméticos para tratar melasma resistente em pele mista?' },
    { label: 'Protocolo de Estrias', text: 'Sugerir protocolo completo de microagulhamento associado a ativos para estrias vermelhas.' },
    { label: 'Contraindicações RF', text: 'Quais as principais contraindicações absolutas para o uso de Radiofrequência corporal?' },
    { label: 'Home Care Pele Acneica', text: 'Monte uma rotina simples de home care (manhã e noite) para pele madura com acne ativa.' }
  ];

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput.trim();
    if (!text || isChatLoading) return;

    if (!textToSend) {
      setChatInput('');
    }

    const newUserMessage: Message = { role: 'user', content: text };
    setChatMessages(prev => [...prev, newUserMessage]);
    setIsChatLoading(true);
    setChatError(null);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: chatMessages.slice(-10) // Send last 10 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao obter resposta do assistente.');
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'Houve uma falha na conexão. Verifique sua chave de API nos Secrets.');
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    if (!selectedPatientId || isAnalysisLoading) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    setIsAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisResult(null);

    // Calculate age
    let ageText = 'Não informada';
    if (patient.birthDate) {
      const birth = new Date(patient.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      ageText = `${age} anos`;
    }

    try {
      const response = await fetch('/api/ai/analyze-anamnesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: patient.name,
          age: ageText,
          anamnesis: patient.anamnesis
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar análise da anamnese.');
      }

      setAnalysisResult(data.analysis);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || 'Erro ao gerar a análise. Verifique sua chave de API nos Secrets.');
    } finally {
      setIsAnalysisLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
  };

  // Helper to parse Markdown bold, lists and paragraphs into JSX elements beautifully
  const parseMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      let trimmed = line.trim();
      
      // Headers
      if (trimmed.startsWith('###')) {
        const headerText = trimmed.replace(/^###\s*/, '');
        return (
          <h4 key={index} className="font-serif text-sm font-bold text-slate-800 mt-5 mb-2 border-b border-slate-100 pb-1 flex items-center gap-1.5 first:mt-1">
            <CornerDownRight className="w-3.5 h-3.5 text-[#dfaba0]" />
            {headerText}
          </h4>
        );
      }
      
      // Warnings or alerts
      if (trimmed.startsWith('⚠️') || trimmed.includes('ALERTA') || trimmed.includes('PROIBIDO') || trimmed.startsWith('!') || trimmed.startsWith('**ALERTA')) {
        // Render alert box for safety warnings
        const content = trimmed.replace(/^⚠️\s*/, '').replace(/^\s*!\s*/, '');
        return (
          <div key={index} className="my-3 p-3 bg-red-50/70 border border-red-100 rounded-xl text-[11px] text-red-700 leading-relaxed font-medium">
            ⚠️ {content.replace(/\*\*/g, '')}
          </div>
        );
      }

      // Bullet items
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const bulletText = trimmed.replace(/^[-*]\s*/, '');
        // Highlight bold in bullet
        const parts = bulletText.split('**');
        return (
          <li key={index} className="ml-4 text-xs text-slate-600 leading-relaxed list-disc py-0.5">
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-800">{part}</strong> : part)}
          </li>
        );
      }

      // Numbered lists
      const numListMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
      if (numListMatch) {
        const listText = numListMatch[2];
        const parts = listText.split('**');
        return (
          <li key={index} className="ml-4 text-xs text-slate-600 leading-relaxed list-decimal py-0.5">
            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-800">{part}</strong> : part)}
          </li>
        );
      }

      // Empty line
      if (!trimmed) {
        return <div key={index} className="h-2" />;
      }

      // Default paragraph with bold replacements
      const parts = trimmed.split('**');
      return (
        <p key={index} className="text-xs text-slate-600 leading-relaxed py-0.5">
          {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className="font-bold text-slate-800">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#dfaba0] to-[#e8c0b6] p-4 rounded-3xl text-white shadow-sm flex items-center justify-between font-sans">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-90 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Inteligência Artificial
          </span>
          <h2 className="font-serif text-xl font-bold tracking-tight mt-0.5">FisioAI Consultora</h2>
          <p className="text-[10px] opacity-80 mt-1">Gere protocolos clínicos, ativos e home care personalizados</p>
        </div>
      </div>

      {/* Missing API Key Warning Box */}
      {!isAiConfigured && (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-3xl text-slate-700 text-xs leading-relaxed space-y-2.5 shadow-sm font-sans">
          <div className="flex items-center gap-2 text-amber-800 font-bold">
            <Bot className="w-5 h-5 text-[#dfaba0] animate-bounce" />
            <span>Como ativar a sua FisioAI (Assistente Inteligente)?</span>
          </div>
          <p className="text-slate-600 text-[11px]">
            Dra. Aline, o serviço de Inteligência Artificial do Google Gemini precisa de uma chave de ativação chamada <strong>GEMINI_API_KEY</strong> para funcionar de forma privada e segura para as suas pacientes. Siga os passos simples abaixo para ativar em 1 minuto:
          </p>
          <ol className="list-decimal pl-5 space-y-1 text-slate-600 text-[11.5px] font-medium">
            <li>No menu lateral esquerdo da plataforma onde você visualiza este app, clique na engrenagem de <strong>Settings / Configurações</strong>.</li>
            <li>Procure pela seção de <strong>Secrets</strong> (Chaves e Segredos).</li>
            <li>Adicione um novo Secret com o nome exato de: <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-900 font-mono font-bold">GEMINI_API_KEY</code></li>
            <li>Cole a sua chave de API do Gemini no campo de valor. Se você não tiver uma chave, você pode obter gratuitamente no console oficial do Google AI Studio.</li>
            <li>Após salvar, as funções de análise de anamnese e chat inteligente estarão totalmente ativas!</li>
          </ol>
          <div className="pt-1.5 border-t border-amber-200/60 flex justify-between items-center text-[10px] text-slate-500">
            <span>🛡️ Seus dados e prontuários estão 100% seguros e confidenciais.</span>
            <button 
              onClick={() => {
                fetch('/api/ai/status')
                  .then(res => res.json())
                  .then(data => {
                    if (data && data.configured) {
                      setIsAiConfigured(true);
                    } else {
                      alert('A chave ainda não foi detectada. Verifique se o nome é GEMINI_API_KEY e se foi salva corretamente.');
                    }
                  });
              }}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Testar Conexão
            </button>
          </div>
        </div>
      )}

      {/* Sub tabs selectors */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('chat')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'chat'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Chat Clínico IA
        </button>
        <button
          onClick={() => setActiveSubTab('anamnesis')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'anamnesis'
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Análise de Anamnese
        </button>
      </div>

      {/* SUBTAB 1: Interactive Clinical Chatbot */}
      {activeSubTab === 'chat' && (
        <div className="flex flex-col h-[520px] bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Chat message logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs shadow-sm font-bold ${
                  msg.role === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-[#dfaba0] text-white'
                }`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                {/* Message bubble */}
                <div className={`p-3 rounded-2xl text-xs space-y-1 ${
                  msg.role === 'user'
                    ? 'bg-[#f5eae6] text-slate-800 rounded-tr-none'
                    : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100/50 shadow-sm'
                }`}>
                  {parseMarkdownText(msg.content)}
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-2.5 max-w-[85%] mr-auto">
                <div className="w-7 h-7 rounded-full bg-[#dfaba0] text-white flex items-center justify-center shadow-sm shrink-0">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="p-3 bg-slate-50 text-slate-500 rounded-2xl rounded-tl-none border border-slate-100/50 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#dfaba0]" />
                  <span>FisioAI está formulando resposta técnica...</span>
                </div>
              </div>
            )}

            {chatError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex gap-2 border border-red-100">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Falha no serviço IA</p>
                  <p className="text-[10px] mt-0.5 leading-relaxed">{chatError}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt quick suggestions (only shown when conversation is fresh) */}
          {chatMessages.length <= 2 && !isChatLoading && (
            <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/50 space-y-1.5 shrink-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sugestões de consulta:</span>
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                {chatPresets.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleSendChatMessage(preset.text)}
                    className="shrink-0 py-1 px-2.5 bg-white border border-slate-100 rounded-lg text-[10px] font-semibold text-slate-600 hover:border-[#dfaba0] hover:text-[#dfaba0] transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="p-3 border-t border-slate-100 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChatMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Pergunte sobre ativos, peeling, microagulhamento..."
                disabled={isChatLoading}
                className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#dfaba0] focus:bg-white disabled:opacity-60 transition-all"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isChatLoading}
                className="w-9 h-9 rounded-xl bg-[#dfaba0] hover:bg-[#d4998e] text-white flex items-center justify-center shadow-sm disabled:opacity-40 disabled:hover:bg-[#dfaba0] transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Smart Anamnesis & Skincare Routine Generator */}
      {activeSubTab === 'anamnesis' && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="space-y-2">
            <h3 className="font-serif text-sm font-bold text-slate-800">Prescritor Inteligente de Protocolo</h3>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Selecione um paciente registrado. A FisioAI analisará as contraindicações de saúde, tipo de pele e queixa principal para formatar um plano completo e uma rotina de skincare segura.
            </p>
          </div>

          {/* Patient Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selecionar Paciente</label>
            {patients.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-700 rounded-xl text-xs border border-amber-100 flex items-center gap-2">
                <Info className="w-4 h-4" />
                <span>Nenhum paciente cadastrado. Cadastre um paciente na aba 'Pacientes' primeiro.</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    setAnalysisResult(null);
                    setAnalysisError(null);
                  }}
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                >
                  <option value="">-- Escolha um Paciente --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <button
                  onClick={handleGenerateAnalysis}
                  disabled={!selectedPatientId || isAnalysisLoading}
                  className="py-2 px-4 bg-[#dfaba0] hover:bg-[#d4998e] text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1.5"
                >
                  {isAnalysisLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Analisar Ficha
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Loader or dynamic messages during processing */}
          {isAnalysisLoading && (
            <div className="p-8 border border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#dfaba0]" />
              <div>
                <p className="text-xs font-bold text-slate-700 animate-pulse">Avaliando ficha médica do paciente...</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[280px]">Cruzar ativos de home care seguros, analisar possíveis contraindicações de equipamentos e traçar as sessões clínicas ideais.</p>
              </div>
            </div>
          )}

          {analysisError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex gap-2 border border-red-100">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Erro ao Analisar</p>
                <p className="text-[10px] mt-0.5 leading-relaxed">{analysisError}</p>
              </div>
            </div>
          )}

          {/* Analysis output render */}
          {analysisResult && (
            <div className="space-y-3 border-t border-slate-50 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-[#dfaba0] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Relatório Completo Gerado pela IA
                </span>
                
                <div className="flex gap-1.5">
                  {/* Share button or Copy action */}
                  <button
                    onClick={() => handleCopyText(analysisResult)}
                    className="flex items-center gap-1 py-1 px-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600 transition-colors"
                  >
                    {copiedText ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar Relatório
                      </>
                    )}
                  </button>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `Olá, aqui está o seu plano de home care e protocolo sugerido gerado em nosso consultório:\n\n${analysisResult}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-[10px] font-bold text-emerald-600 transition-colors"
                  >
                    Enviar p/ WhatsApp
                  </a>
                </div>
              </div>

              {/* The generated content */}
              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 max-h-[400px] overflow-y-auto space-y-2 no-scrollbar">
                {parseMarkdownText(analysisResult)}
              </div>
              
              <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl flex gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-amber-700 leading-relaxed">
                  <strong>Nota clínica:</strong> Este relatório serve de sugestão terapêutica baseada nos dados clínicos preenchidos na anamnese. Revise e altere conforme seu critério profissional de fisioterapia estética dermatofuncional.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
