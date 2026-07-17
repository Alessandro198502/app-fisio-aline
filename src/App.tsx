import { useState, useEffect } from 'react';
import { Smartphone, Download, Sparkles, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';
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
  deleteProcedure,
  addAppointment,
  updateAppointment,
  deleteAppointment,
  addEvolution,
  deleteEvolution,
  initLocalStorage,
  getAppPin
} from './utils/storage';

// Tabs
import DashboardTab from './components/DashboardTab';
import PatientsTab from './components/PatientsTab';
import AgendaTab from './components/AgendaTab';
import ProceduresTab from './components/ProceduresTab';
import AnalyticsTab from './components/AnalyticsTab';
import AIAssistantTab from './components/AIAssistantTab';
import BottomNav from './components/BottomNav';
import InstallGuide from './components/InstallGuide';
import LockScreen from './components/LockScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isLocked, setIsLocked] = useState<boolean>(() => !!getAppPin());
  
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
    <div className="min-h-screen w-screen bg-[#fcf6f4] md:bg-gradient-to-br md:from-[#fcf6f4] md:via-[#f5eae6] md:to-[#eddcd6] flex flex-col md:flex-row items-center justify-center font-sans antialiased md:p-6 select-none overflow-x-hidden">
      
      {/* LEFT COLUMN: Decorative clinical intro for desktop view only */}
      <div className="hidden lg:flex flex-col max-w-sm mr-8 text-slate-800 space-y-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#dfaba0] uppercase">Fisioterapia Dermatofuncional</span>
          <h1 className="font-serif text-4xl font-extrabold tracking-tight mt-1 text-[#2c2523]">Fisio Aline</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Gestão moderna e evolução estética profissional para consultórios de fisioterapia estética avançada.
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-sm space-y-3">
          <h3 className="font-bold text-xs text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#dfaba0]" /> Recursos Exclusivos
          </h3>
          <ul className="space-y-2 text-xs text-slate-600 pl-1">
            <li className="flex items-center gap-2">✓ Controle total de procedimentos corporais/faciais</li>
            <li className="flex items-center gap-2">✓ Agenda médica semanal sincronizada</li>
            <li className="flex items-center gap-2">✓ Linha do tempo de antes & depois fotográfico</li>
            <li className="flex items-center gap-2">✓ Relatório financeiro e ticket médio</li>
          </ul>
        </div>

        {/* Install instruction guide trigger */}
        <button
          onClick={() => setShowInstallGuide(true)}
          className="flex items-center justify-center gap-2 py-3 bg-white hover:bg-slate-50 border border-white rounded-xl text-xs font-semibold text-slate-700 shadow-sm hover:shadow active:scale-95 transition-all"
        >
          <Download className="w-4 h-4 text-[#dfaba0]" />
          Baixar app no seu Celular
        </button>
      </div>

      {/* CENTER: Smart Phone View Container */}
      <div className="w-full max-w-[420px] md:h-[840px] md:rounded-[40px] bg-slate-50 md:iphone-frame md:border-[10px] md:border-[#2c2523] md:relative md:flex md:flex-col md:overflow-hidden flex flex-col min-h-screen md:min-h-0 md:shadow-2xl">
        
        {/* Phone Notch/Speaker for desktop look */}
        <div className="hidden md:block absolute top-0 inset-x-0 h-6 bg-[#2c2523] z-50 rounded-b-xl">
          <div className="w-32 h-4 bg-[#2c2523] mx-auto rounded-b-xl flex items-center justify-center">
            <div className="w-10 h-1 bg-neutral-700 rounded-full mb-1" />
          </div>
        </div>

        {/* Top PWA Download Banner (Visible on mobile inside Safari/Chrome without PWA mode to promote download) */}
        <div className="bg-[#faf3f0] border-b border-[#dfaba0]/20 px-4 py-2.5 flex justify-between items-center z-40 md:pt-8 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#dfaba0] text-white flex items-center justify-center font-bold text-xs shadow-sm font-serif">
              FA
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800 leading-tight">Fisio Aline</p>
              <p className="text-[9px] text-[#dfaba0] font-semibold leading-none">Toque para baixar o App</p>
            </div>
          </div>
          <button
            onClick={() => setShowInstallGuide(true)}
            className="flex items-center gap-1 py-1 px-2.5 bg-white hover:bg-slate-50 border border-[#dfaba0]/30 rounded-lg text-[10px] font-bold text-[#dfaba0] transition-colors shadow-sm"
          >
            <Download className="w-3 h-3" />
            Baixar
          </button>
        </div>

        {/* APP BODY VIEWPORT */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50 px-4 py-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
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

        {/* NATIVE-LIKE BOTTOM NAVIGATION BAR */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* PWA INSTALLATION INSTRUCTION OVERLAY */}
      <AnimatePresence>
        {showInstallGuide && (
          <InstallGuide onClose={() => setShowInstallGuide(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
