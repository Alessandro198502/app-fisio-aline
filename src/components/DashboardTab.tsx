import { useState } from 'react';
import { Calendar, Users, Briefcase, Plus, TrendingUp, CheckCircle, Clock, FileDown, RotateCcw, Shield, Key, ShieldCheck, Lock } from 'lucide-react';
import { Appointment, Patient, Procedure } from '../types';
import { resetToDefaultData, exportDatabaseBackup, getAppPin, setAppPin, removeAppPin } from '../utils/storage';

interface DashboardTabProps {
  patients: Patient[];
  procedures: Procedure[];
  appointments: Appointment[];
  onNavigate: (tab: string) => void;
  onOpenNewAppointment: () => void;
  onOpenNewPatient: () => void;
  onCompleteAppointment: (id: string) => void;
}

export default function DashboardTab({
  patients,
  procedures,
  appointments,
  onNavigate,
  onOpenNewAppointment,
  onOpenNewPatient,
  onCompleteAppointment
}: DashboardTabProps) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [pinValue, setPinValue] = useState(() => getAppPin() || '');
  const [showPinModal, setShowPinModal] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Get current date string in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's appointments
  const todayAppointments = appointments.filter(app => app.date === todayStr);

  // Stats calculation
  const totalCompletedAppointments = appointments.filter(app => app.status === 'completed').length;
  const scheduledCount = appointments.filter(app => app.status === 'scheduled').length;

  const totalRevenue = appointments
    .filter(app => app.status === 'completed')
    .reduce((acc, app) => acc + app.price, 0);

  // Map patient names
  const getPatientName = (pId: string) => {
    return patients.find(p => p.id === pId)?.name || 'Paciente não encontrado';
  };

  // Map procedure names and colors
  const getProcedureInfo = (prId: string) => {
    const proc = procedures.find(p => p.id === prId);
    return proc || { name: 'Procedimento', color: '#666', price: 0 };
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Premium Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#dfaba0] uppercase">Uso Particular Exclusivo</span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2c2523] tracking-tight mt-1">Dra. Aline Franchi Modesto</h1>
          <p className="text-xs text-slate-500 font-medium">Fisioterapia Dermatofuncional • Prontuários & Evoluções</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-[#2c2523] text-[#dfaba0] flex items-center justify-center font-serif font-bold text-base shadow-md border border-[#dfaba0]/20">
          AFM
        </div>
      </div>
 
      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigate('pacientes')}
          className="bg-white p-5 rounded-3xl border border-[#dfaba0]/15 hover:border-[#dfaba0]/40 transition-all cursor-pointer shadow-sm relative overflow-hidden group active:scale-[0.98] duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#dfaba0]/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <Users className="w-6 h-6 text-[#dfaba0] relative z-10 mb-3" />
          <span className="text-[11px] text-slate-500 font-semibold relative z-10 block uppercase tracking-wider">Pacientes</span>
          <span className="text-3xl font-extrabold text-[#2c2523] mt-1 relative z-10 block">{patients.length}</span>
        </div>
 
        <div 
          onClick={() => onNavigate('agenda')}
          className="bg-white p-5 rounded-3xl border border-[#dfaba0]/15 hover:border-[#dfaba0]/40 transition-all cursor-pointer shadow-sm relative overflow-hidden group active:scale-[0.98] duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#dfaba0]/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <Calendar className="w-6 h-6 text-[#dfaba0] relative z-10 mb-3" />
          <span className="text-[11px] text-slate-500 font-semibold relative z-10 block uppercase tracking-wider">Agendados</span>
          <span className="text-3xl font-extrabold text-[#2c2523] mt-1 relative z-10 block">{scheduledCount}</span>
        </div>
 
        <div 
          onClick={() => onNavigate('procedimentos')}
          className="bg-white p-5 rounded-3xl border border-[#dfaba0]/15 hover:border-[#dfaba0]/40 transition-all cursor-pointer shadow-sm relative overflow-hidden group active:scale-[0.98] duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-[#dfaba0]/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <Briefcase className="w-6 h-6 text-[#dfaba0] relative z-10 mb-3" />
          <span className="text-[11px] text-slate-500 font-semibold relative z-10 block uppercase tracking-wider">Procedimentos</span>
          <span className="text-3xl font-extrabold text-[#2c2523] mt-1 relative z-10 block">{procedures.length}</span>
        </div>
 
        <div 
          onClick={() => onNavigate('relatorios')}
          className="bg-white p-5 rounded-3xl border border-[#dfaba0]/15 hover:border-[#dfaba0]/40 transition-all cursor-pointer shadow-sm relative overflow-hidden group active:scale-[0.98] duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <TrendingUp className="w-6 h-6 text-[#dfaba0] relative z-10 mb-3" />
          <span className="text-[11px] text-slate-500 font-semibold relative z-10 block uppercase tracking-wider">Faturamento</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 relative z-10 block">
            {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>
 
      {/* 2-COLUMN GRID FOR DESKTOP SITE LOOK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Today's Appointments (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#dfaba0]/15 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2c2523]">Atendimentos do Dia</h2>
                <p className="text-xs text-slate-500 font-medium">Sua agenda de sessões reservadas para hoje</p>
              </div>
              <span className="text-xs text-slate-600 bg-[#faf3f0] px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 border border-[#dfaba0]/10">
                <Clock className="w-3.5 h-3.5 text-[#dfaba0]" />
                {todayAppointments.length} agendados
              </span>
            </div>
 
            {todayAppointments.length === 0 ? (
              <div className="text-center p-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Nenhum atendimento agendado para hoje.</p>
                <p className="text-xs text-slate-400 mt-1">Aproveite para organizar prontuários ou use os atalhos para agendar uma nova sessão.</p>
                <button
                  onClick={onOpenNewAppointment}
                  className="mt-4 text-xs font-bold text-[#dfaba0] hover:text-[#d4998e] transition-colors"
                >
                  Agendar para hoje +
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.map((app) => {
                  const proc = getProcedureInfo(app.procedureId);
                  return (
                    <div 
                      key={app.id} 
                      className="bg-[#faf3f0]/30 hover:bg-[#faf3f0]/60 p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4 transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div 
                          className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-slate-900 text-xs shrink-0 font-bold shadow-sm"
                          style={{ backgroundColor: proc.color }}
                        >
                          <span className="text-[13px] font-extrabold">{app.time}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[#2c2523] truncate">{getPatientName(app.patientId)}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: proc.color }}
                            />
                            <span className="text-xs text-slate-500 font-semibold truncate">{proc.name}</span>
                          </div>
                        </div>
                      </div>
 
                      <div>
                        {app.status === 'scheduled' ? (
                          <button
                            onClick={() => onCompleteAppointment(app.id)}
                            className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shrink-0"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Concluir
                          </button>
                        ) : (
                          <span className="py-1.5 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold shrink-0">
                            ✓ Finalizado
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
 
        {/* RIGHT COLUMN: Quick Actions, LGPD & Admin (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white p-5 rounded-3xl border border-[#dfaba0]/15 shadow-sm">
            <h3 className="text-xs font-extrabold text-[#2c2523] uppercase tracking-wider mb-3">Atalhos Clínicos</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenNewPatient}
                className="flex items-center gap-2 justify-center py-2.5 px-3 bg-[#faf3f0] hover:bg-[#dfaba0]/10 border border-[#dfaba0]/20 rounded-xl text-xs font-bold text-[#2c2523] hover:border-[#dfaba0] active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#dfaba0]" />
                Novo Paciente
              </button>
              <button
                onClick={onOpenNewAppointment}
                className="flex items-center gap-2 justify-center py-2.5 px-3 bg-[#faf3f0] hover:bg-[#dfaba0]/10 border border-[#dfaba0]/20 rounded-xl text-xs font-bold text-[#2c2523] hover:border-[#dfaba0] active:scale-95 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#dfaba0]" />
                Nova Sessão
              </button>
            </div>
          </div>
 
          {/* Segurança e Conformidade LGPD */}
          <div className="bg-white p-5 rounded-3xl border border-[#dfaba0]/15 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="text-xs font-bold text-[#2c2523] uppercase tracking-wider">Proteção de Dados (LGPD)</h3>
            </div>
            
            <div className="bg-[#faf3f0]/50 p-3 rounded-xl border border-slate-100">
              {pinValue ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Aplicativo Protegido por PIN</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
                    O acesso aos prontuários, fotos de evolução clínica e fichas de anamnese está bloqueado por senha numérica. Isso garante conformidade com as normas da LGPD sobre sigilo de dados sensíveis de saúde das pacientes.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold text-xs">
                    <Lock className="w-4 h-4 text-[#dfaba0]" />
                    <span>Aplicativo Sem Senha (PIN)</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-relaxed font-medium">
                    Não há bloqueio ativo. Para proteger prontuários e fotos de evolução clínica caso outrem use seu computador, ative um PIN numérico rápido de 4 dígitos.
                  </p>
                </div>
              )}
            </div>
 
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setNewPinInput('');
                  setPinError('');
                  setShowPinModal(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-[#faf3f0] hover:bg-[#dfaba0]/20 rounded-xl text-xs font-bold text-[#2c2523] transition-colors border border-[#dfaba0]/20"
              >
                <Key className="w-3.5 h-3.5 text-[#dfaba0]" />
                {pinValue ? 'Alterar PIN' : 'Ativar Proteção por PIN'}
              </button>
 
              {pinValue && (
                <button
                  onClick={() => {
                    removeAppPin();
                    setPinValue('');
                  }}
                  className="w-full py-2 px-3 bg-red-50 hover:bg-red-100 text-xs font-bold text-red-600 rounded-xl transition-colors border border-red-200"
                >
                  Desativar PIN
                </button>
              )}
            </div>
          </div>
 
          {/* Admin Settings Utilities (Backup e Limpeza de Dados) */}
          <div className="bg-white p-5 rounded-3xl border border-[#dfaba0]/15 shadow-sm">
            <h3 className="text-xs font-bold text-[#2c2523] uppercase tracking-wider mb-3">Backup e Sistema</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={exportDatabaseBackup}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-[#dfaba0]/40 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#faf3f0] transition-colors"
              >
                <FileDown className="w-3.5 h-3.5 text-[#dfaba0]" />
                Exportar Backup (JSON)
              </button>
              
              <button
                onClick={() => setShowConfirmReset(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 border border-red-200 hover:bg-red-50 rounded-xl text-xs font-semibold text-red-600 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-red-400" />
                Limpar Banco de Dados
              </button>
            </div>
          </div>
        </div>
      </div>
 
      {/* Reset Confirmation Overlay */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-[#dfaba0]/15 rounded-3xl p-6 max-w-sm w-full text-center shadow-xl">
            <h4 className="font-serif text-lg font-bold text-[#2c2523]">Limpar todos os dados?</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">Esta ação removerá permanentemente todos os pacientes, fotos de evolução, agendamentos e registros de faturamento. Você deseja prosseguir?</p>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  resetToDefaultData();
                }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Sim, Limpar Tudo
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* PIN Security Setup Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/65 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-xs w-full shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-[#dfaba0]/10 flex items-center justify-center text-[#dfaba0]">
                <Key className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="font-serif text-base font-bold text-[#2c2523]">
                {pinValue ? 'Alterar PIN Clínico' : 'Definir PIN de Segurança'}
              </h4>
              <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                Digite um código de <strong>4 números</strong> para restringir o acesso a prontuários e fotos neste computador.
              </p>
            </div>
 
            <div className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={newPinInput}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setNewPinInput(val);
                }}
                placeholder="Ex: 1234"
                className="w-full text-center bg-[#faf3f0] border border-slate-100 text-[#2c2523] tracking-widest text-lg font-bold py-2.5 px-3 rounded-xl focus:outline-none focus:border-[#dfaba0] focus:bg-white"
              />
 
              {pinError && (
                <p className="text-[10px] font-bold text-red-500 text-center">{pinError}</p>
              )}
 
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newPinInput.length !== 4) {
                      setPinError('O PIN deve conter exatamente 4 dígitos numéricos.');
                      return;
                    }
                    setAppPin(newPinInput);
                    setPinValue(newPinInput);
                    setShowPinModal(false);
                  }}
                  className="flex-1 py-2 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl transition-all"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
