import { useState, useEffect } from 'react';
import { Smartphone, Download, Sparkles, HelpCircle, AlertCircle, RefreshCw, Menu, X, Lock, Home, Users, Calendar, Briefcase, TrendingUp, Camera, Activity, LogOut, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Core Types
import { Patient, Procedure, Appointment, PatientEvolution, EvolutionPhoto } from './types';

// Storage & APIs
import {
  getPatients,
  getProcedures,
  getAppointments,
  getEvolutions,
  addPatient,
  updatePatient,
  deletePatient,
  addProcedure,
  updateProcedure,
  deleteProcedure,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  addEvolution,
  deleteEvolution,
  initLocalStorage,
  isAuthSessionActive,
  setAuthSession
} from './utils/storage';

// Tabs & Modals
import DashboardTab from './components/DashboardTab';
import PatientsTab from './components/PatientsTab';
import AgendaTab from './components/AgendaTab';
import ProceduresTab from './components/ProceduresTab';
import AnalyticsTab from './components/AnalyticsTab';
import AIAssistantTab from './components/AIAssistantTab';
import BottomNav from './components/BottomNav';
import InstallGuide from './components/InstallGuide';
import LockScreen from './components/LockScreen';
import PhotoComparisonModal from './components/PhotoComparisonModal';
import EvolutionReportModal from './components/EvolutionReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLocked, setIsLocked] = useState<boolean>(() => !isAuthSessionActive());
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // New Modals State
  const [showPhotoComparisonModal, setShowPhotoComparisonModal] = useState<boolean>(false);
  const [showEvolutionReportModal, setShowEvolutionReportModal] = useState<boolean>(false);
  const [selectedReportPatient, setSelectedReportPatient] = useState<Patient | null>(null);

  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'procedimentos', label: 'Procedimentos', icon: Briefcase },
    { id: 'fisioai', label: 'FisioAI', icon: Sparkles },
    { id: 'relatorios', label: 'Relatórios', icon: TrendingUp },
  ];
  
  // Data States
  const [patients, setPatients] = useState<Patient[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [evolutions, setEvolutions] = useState<PatientEvolution[]>([]);

  // Force Open modal states (for quick actions from dashboard)
  const [forceOpenNewPatient, setForceOpenNewPatient] = useState(false);
  const [forceOpenNewAppointment, setForceOpenNewAppointment] = useState(false);

  // Install Guide Overlay State
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  // Initialize and load storage
  useEffect(() => {
    initLocalStorage();
    reloadAllData();
  }, []);

  const reloadAllData = () => {
    setPatients(getPatients());
    setProcedures(getProcedures());
    setAppointments(getAppointments());
    setEvolutions(getEvolutions());
  };

  // --- ACTIONS ---

  // 1. Patient Actions
  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    addPatient(patientData);
    reloadAllData();
  };

  const handleUpdatePatient = (patient: Patient) => {
    updatePatient(patient);
    reloadAllData();
  };

  const handleDeletePatient = (id: string) => {
    deletePatient(id);
    reloadAllData();
  };

  // 2. Procedure Actions
  const handleAddProcedure = (procData: Omit<Procedure, 'id'>) => {
    addProcedure(procData);
    reloadAllData();
  };

  const handleDeleteProcedure = (id: string) => {
    deleteProcedure(id);
    reloadAllData();
  };

  const handleUpdateProcedure = (proc: Procedure) => {
    updateProcedure(proc);
    reloadAllData();
  };

  // 3. Appointment Actions
  const handleAddAppointment = (appData: Omit<Appointment, 'id'>) => {
    addAppointment(appData);
    reloadAllData();
  };

  const handleUpdateAppointment = (app: Appointment) => {
    updateAppointment(app);
    reloadAllData();
  };

  const handleDeleteAppointment = (id: string) => {
    deleteAppointment(id);
    reloadAllData();
  };

  // Quick action from dashboard to complete appointment
  const handleCompleteAppointment = (id: string) => {
    const app = appointments.find(a => a.id === id);
    if (app) {
      handleUpdateAppointment({
        ...app,
        status: 'completed'
      });
    }
  };

  // 4. Evolution Actions
  const handleAddEvolution = (
    patientId: string, 
    procedureId: string, 
    description: string, 
    photos: Omit<EvolutionPhoto, 'id'>[]
  ) => {
    addEvolution(patientId, procedureId, description, photos);
    reloadAllData();
  };

  const handleDeleteEvolution = (id: string) => {
    deleteEvolution(id);
    reloadAllData();
  };

  // Helper to switch tabs from dashboard
  const handleNavigateFromDashboard = (tab: string) => {
    setActiveTab(tab);
  };

  // Quick Action Navigators
  const triggerQuickNewPatient = () => {
    setForceOpenNewPatient(true);
    setActiveTab('pacientes');
  };

  const triggerQuickNewAppointment = () => {
    setForceOpenNewAppointment(true);
    setActiveTab('agenda');
  };

  if (isLocked) {
    return <LockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="h-screen w-full max-w-full bg-[#fcf6f4] flex flex-col md:flex-row text-slate-800 font-sans antialiased overflow-hidden">
      
      {/* BARRA SUPERIOR PARA MÓVEL */}
      <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-[#2c2523] border-b border-[#dfaba0]/10 shrink-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#dfaba0] text-[#2c2523] flex items-center justify-center font-bold font-serif shadow-sm text-xs">
            AFM
          </div>
          <div>
            <h1 className="font-serif text-sm font-bold text-white leading-tight">Dra. Aline Franchi Modesto</h1>
            <p className="text-[9px] text-[#dfaba0] font-medium tracking-wide">Portal Privativo • Fisioterapia</p>
          </div>
        </div>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#dfaba0] active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* SIDEBAR FIXA NAVEGAÇÃO WEB (Computador / Notebook) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#2c2523] border-r border-[#dfaba0]/10 h-screen shrink-0 relative z-30">
        {/* Clinica Logo e Titulo */}
        <div className="p-6 border-b border-[#dfaba0]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#dfaba0] text-[#2c2523] flex items-center justify-center font-extrabold font-serif text-xs shadow-sm shrink-0">
              AFM
            </div>
            <div>
              <h2 className="font-serif text-sm font-extrabold text-white leading-tight">Dra. Aline Franchi Modesto</h2>
              <p className="text-[9px] text-[#dfaba0] font-bold tracking-wider uppercase">Uso Particular Exclusivo</p>
            </div>
          </div>
        </div>

        {/* Links de Navegação Vertical */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-[#dfaba0] text-[#2c2523] shadow-lg shadow-[#dfaba0]/15 scale-[1.02]'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'stroke-[2.5px]' : 'opacity-80'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-[#dfaba0]/10 space-y-2 shrink-0">
          <button
            onClick={() => setShowInstallGuide(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-[#dfaba0]/10 rounded-xl text-[11px] font-bold text-[#dfaba0] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Atalhos / Instalar App
          </button>

          <button
            onClick={() => {
              setAuthSession(false);
              setIsLocked(true);
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/25 hover:bg-red-950/45 border border-red-900/30 rounded-xl text-[10px] font-bold text-red-400 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair / Bloquear
          </button>
        </div>
      </aside>

      {/* DRAWER DESLIZANTE PARA DISPOSITIVOS MÓVEIS */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop escuro */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
            />

            {/* Sidebar deslizante */}
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-64 bg-[#2c2523] border-r border-[#dfaba0]/10 flex flex-col z-50 h-full shadow-2xl md:hidden"
            >
              {/* Header do drawer */}
              <div className="p-6 border-b border-[#dfaba0]/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#dfaba0] text-[#2c2523] flex items-center justify-center font-extrabold font-serif text-xs shadow-sm">
                    AFM
                  </div>
                  <div>
                    <h2 className="font-serif text-sm font-extrabold text-white leading-tight">Dra. Aline Franchi Modesto</h2>
                    <p className="text-[9px] text-[#dfaba0] font-bold tracking-wider uppercase">Uso Particular Exclusivo</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#dfaba0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links de Navegação do drawer */}
              <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto no-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 ${
                        isActive
                          ? 'bg-[#dfaba0] text-[#2c2523]'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Rodapé do drawer */}
              <div className="p-4 border-t border-[#dfaba0]/10 space-y-2 shrink-0">
                <button
                  onClick={() => {
                    setShowInstallGuide(true);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-white/5 hover:bg-white/10 border border-[#dfaba0]/10 rounded-xl text-[11px] font-bold text-[#dfaba0] transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Atalhos / Instalar App
                </button>
                <button
                  onClick={() => {
                    setAuthSession(false);
                    setIsLocked(true);
                    setIsSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-950/30 rounded-xl text-[10px] font-bold text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair / Bloquear
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ÁREA DE CONTEÚDO PRINCIPAL DA PLATAFORMA WEB */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#fcf6f4]">
        {/* CABEÇALHO SUPERIOR SITE / DESKTOP WEB */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-white border-b border-[#dfaba0]/20 sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-serif font-bold text-[#2c2523] text-sm">Dra. Aline Franchi Modesto</span>
              <span>/</span>
              <span className="text-[#dfaba0] font-bold uppercase text-[11px] tracking-wide">
                {tabs.find(t => t.id === activeTab)?.label || 'Painel'}
              </span>
            </div>
          </div>

          {/* Ações Rápidas de Topo */}
          <div className="flex items-center gap-3">
            {/* Status da IA */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf3f0] border border-[#dfaba0]/30 rounded-full text-[11px] font-bold text-[#2c2523]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <Sparkles className="w-3.5 h-3.5 text-[#dfaba0]" />
              <span>FisioAI Conectado</span>
            </div>

            {/* Atalhos Rápidos no Header */}
            <button
              onClick={() => setShowPhotoComparisonModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf3f0] hover:bg-[#f3e5e0] text-[#2c2523] rounded-xl text-xs font-bold transition-all border border-[#dfaba0]/30 cursor-pointer active:scale-95"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#dfaba0]" />
              <span>Comparar Fotos</span>
            </button>

            <button
              onClick={() => {
                setSelectedReportPatient(patients[0] || null);
                setShowEvolutionReportModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#faf3f0] hover:bg-[#f3e5e0] text-[#2c2523] rounded-xl text-xs font-bold transition-all border border-[#dfaba0]/30 cursor-pointer active:scale-95"
            >
              <Activity className="w-3.5 h-3.5 text-[#dfaba0]" />
              <span>Relatório Clínico</span>
            </button>

            <button
              onClick={triggerQuickNewPatient}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#faf3f0] hover:bg-[#f3e5e0] text-[#2c2523] rounded-xl text-xs font-bold transition-all border border-[#dfaba0]/20 active:scale-95"
            >
              <Users className="w-3.5 h-3.5 text-[#dfaba0]" />
              <span>+ Novo Paciente</span>
            </button>

            <button
              onClick={triggerQuickNewAppointment}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>+ Agendar</span>
            </button>

            {/* Perfil da Profissional */}
            <div className="pl-3 border-l border-slate-200 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2c2523] text-[#dfaba0] flex items-center justify-center font-serif font-bold text-[10px] shadow-xs">
                AFM
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">Dra. Aline Franchi Modesto</p>
                <p className="text-[10px] text-slate-500">Fisioterapeuta Dermatofuncional</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO DAS PÁGINAS DO SITE */}
        <div className="flex-1 overflow-y-auto bg-[#fcf6f4] p-4 md:p-8 relative">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardTab
                    patients={patients}
                    procedures={procedures}
                    appointments={appointments}
                    onNavigate={handleNavigateFromDashboard}
                    onOpenNewPatient={triggerQuickNewPatient}
                    onOpenNewAppointment={triggerQuickNewAppointment}
                    onCompleteAppointment={handleCompleteAppointment}
                  />
                )}

                {activeTab === 'pacientes' && (
                  <PatientsTab
                    patients={patients}
                    procedures={procedures}
                    evolutions={evolutions}
                    appointments={appointments}
                    onAddPatient={handleAddPatient}
                    onUpdatePatient={handleUpdatePatient}
                    onDeletePatient={handleDeletePatient}
                    onAddEvolution={handleAddEvolution}
                    onDeleteEvolution={handleDeleteEvolution}
                    forceOpenAddModal={forceOpenNewPatient}
                    onCloseForceOpen={() => setForceOpenNewPatient(false)}
                  />
                )}

                {activeTab === 'agenda' && (
                  <AgendaTab
                    appointments={appointments}
                    patients={patients}
                    procedures={procedures}
                    onAddAppointment={handleAddAppointment}
                    onUpdateAppointment={handleUpdateAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                    forceOpenAddModal={forceOpenNewAppointment}
                    onCloseForceOpen={() => setForceOpenNewAppointment(false)}
                  />
                )}

                {activeTab === 'procedimentos' && (
                  <ProceduresTab
                    procedures={procedures}
                    onAddProcedure={handleAddProcedure}
                    onUpdateProcedure={handleUpdateProcedure}
                    onDeleteProcedure={handleDeleteProcedure}
                  />
                )}

                {activeTab === 'fisioai' && (
                  <AIAssistantTab
                    patients={patients}
                  />
                )}

                {activeTab === 'relatorios' && (
                  <AnalyticsTab
                    appointments={appointments}
                    patients={patients}
                    procedures={procedures}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* GUIA DE INSTALAÇÃO DO PWA */}
      <AnimatePresence>
        {showInstallGuide && (
          <InstallGuide onClose={() => setShowInstallGuide(false)} />
        )}
      </AnimatePresence>

      {/* MODAL DE COMPARAÇÃO DE FOTOS ANTES & DEPOIS */}
      <PhotoComparisonModal
        isOpen={showPhotoComparisonModal}
        onClose={() => setShowPhotoComparisonModal(false)}
        patients={patients}
        evolutions={evolutions}
      />

      {/* MODAL DE RELATÓRIO CLÍNICO COM GRÁFICOS */}
      <EvolutionReportModal
        isOpen={showEvolutionReportModal}
        onClose={() => setShowEvolutionReportModal(false)}
        patient={selectedReportPatient || patients[0] || null}
        evolutions={evolutions}
      />
    </div>
  );
}
