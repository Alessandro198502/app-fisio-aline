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
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">Consultório Estético</span>
          <h1 className="font-serif text-3xl font-bold text-white tracking-tight mt-1">Dra. Aline</h1>
          <p className="text-sm text-sky-400 font-medium">Fisioterapia Dermatofuncional</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-sky-400 font-serif font-bold text-lg shadow-lg shadow-sky-500/10">
          FA
        </div>
      </div>

      {/* Main Stats Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div 
          onClick={() => onNavigate('pacientes')}
          className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all cursor-pointer shadow-md relative overflow-hidden group active:scale-95 duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800/40 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <Users className="w-5 h-5 text-sky-400 relative z-10 mb-2" />
          <span className="text-xs text-slate-400 font-medium relative z-10 block">Pacientes</span>
          <span className="text-2xl font-bold text-white mt-1 relative z-10 block">{patients.length}</span>
        </div>

        <div 
          onClick={() => onNavigate('agenda')}
          className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all cursor-pointer shadow-md relative overflow-hidden group active:scale-95 duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800/40 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <Calendar className="w-5 h-5 text-sky-400 relative z-10 mb-2" />
          <span className="text-xs text-slate-400 font-medium relative z-10 block">Agendados</span>
          <span className="text-2xl font-bold text-white mt-1 relative z-10 block">{scheduledCount}</span>
        </div>

        <div 
          onClick={() => onNavigate('procedimentos')}
          className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all cursor-pointer shadow-md relative overflow-hidden group active:scale-95 duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800/40 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <Briefcase className="w-5 h-5 text-sky-400 relative z-10 mb-2" />
          <span className="text-xs text-slate-400 font-medium relative z-10 block">Procedimentos</span>
          <span className="text-2xl font-bold text-white mt-1 relative z-10 block">{procedures.length}</span>
        </div>

        <div 
          onClick={() => onNavigate('relatorios')}
          className="bg-slate-900 p-4 rounded-2xl border border-slate-800 hover:border-sky-500/30 transition-all cursor-pointer shadow-md relative overflow-hidden group active:scale-95 duration-150"
        >
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800/40 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform" />
          <TrendingUp className="w-5 h-5 text-sky-400 relative z-10 mb-2" />
          <span className="text-xs text-slate-400 font-medium relative z-10 block">Faturamento</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 relative z-10 block">
            {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Atalhos de Acesso</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onOpenNewPatient}
            className="flex items-center gap-2 justify-center py-2.5 px-3 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl text-xs font-semibold text-slate-200 hover:border-sky-400/50 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            Novo Paciente
          </button>
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-2 justify-center py-2.5 px-3 bg-slate-850 hover:bg-slate-800 border border-slate-750 rounded-xl text-xs font-semibold text-slate-200 hover:border-sky-400/50 active:scale-95 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            Agendar Sessão
          </button>
        </div>
      </div>

      {/* Today's appointments schedule */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-lg font-bold text-white">Sessões de Hoje</h2>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            {todayAppointments.length} agendadas
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="text-center p-8 bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Nenhum atendimento agendado para hoje.</p>
            <button
              onClick={onOpenNewAppointment}
              className="mt-3 text-xs font-semibold text-sky-400 hover:underline"
            >
              Agendar para hoje +
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayAppointments.map((app) => {
              const proc = getProcedureInfo(app.procedureId);
              return (
                <div 
                  key={app.id} 
                  className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-slate-950 text-xs shrink-0 font-bold"
                      style={{ backgroundColor: proc.color }}
                    >
                      <span>{app.time}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-100 truncate">{getPatientName(app.patientId)}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: proc.color }}
                        />
                        <span className="text-xs text-slate-400 truncate">{proc.name}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {app.status === 'scheduled' ? (
                      <button
                        onClick={() => onCompleteAppointment(app.id)}
                        className="py-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1 shrink-0"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Concluir
                      </button>
                    ) : (
                      <span className="py-1 px-2.5 bg-slate-800 text-slate-500 rounded-lg text-xs font-bold shrink-0">
                        Finalizado
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Segurança e Conformidade LGPD */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#dfaba0]" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Segurança e Proteção de Dados (LGPD)</h3>
        </div>
        
        <div className="bg-slate-850/50 p-3 rounded-xl border border-slate-800/80">
          {pinValue ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Aplicativo Protegido por PIN</span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                O acesso aos prontuários, fotos de evolução clínica e fichas de anamnese está bloqueado por senha numérica. Isso garante conformidade rígida com as normas brasileiras da LGPD sobre sigilo de dados sensíveis de saúde.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>Aplicativo Sem Senha (PIN)</span>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                Não há bloqueio ativo. Para evitar vazamento acidental de prontuários ou fotos de evolução caso outrem utilize seu dispositivo, ative um PIN de 4 dígitos.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setNewPinInput('');
              setPinError('');
              setShowPinModal(true);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-750 rounded-xl text-xs font-bold text-slate-200 transition-colors"
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
              className="py-2 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-950 rounded-xl text-xs font-bold text-red-400 transition-colors"
            >
              Desativar PIN
            </button>
          )}
        </div>
      </div>

      {/* Admin Settings Utilities (Backup e Limpeza de Dados) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Backup e Sistema</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={exportDatabaseBackup}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-800 hover:border-slate-750 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-850 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-sky-400" />
            Exportar Backup (JSON)
          </button>
          
          <button
            onClick={() => setShowConfirmReset(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-red-950 hover:border-red-900 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/20 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar Banco de Dados
          </button>
        </div>
      </div>

      {/* Reset Confirmation Overlay */}
      {showConfirmReset && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-sm w-full text-center">
            <h4 className="font-serif text-lg font-bold text-white">Limpar todos os dados?</h4>
            <p className="text-xs text-slate-400 mt-2">Esta ação removerá permanentemente todos os pacientes, fotos de evolução, agendamentos e registros salvos. Você deseja prosseguir?</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl"
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
          <div className="bg-slate-900 border border-slate-850 rounded-2xl p-5 max-w-xs w-full">
            <div className="flex flex-col items-center text-center space-y-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#dfaba0]/10 flex items-center justify-center text-[#dfaba0]">
                <Key className="w-5 h-5 animate-pulse" />
              </div>
              <h4 className="font-serif text-base font-bold text-white">
                {pinValue ? 'Alterar PIN Clínico' : 'Definir PIN de Segurança'}
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Digite um código de <strong>4 números</strong> para restringir o acesso a prontuários e fotos neste aparelho.
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
                className="w-full text-center bg-slate-850 border border-slate-850 text-white tracking-widest text-lg font-bold py-2 px-3 rounded-xl focus:outline-none focus:border-[#dfaba0] focus:bg-slate-800"
              />

              {pinError && (
                <p className="text-[10px] font-bold text-rose-400 text-center">{pinError}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs rounded-xl transition-all"
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
                  className="flex-1 py-2 bg-[#dfaba0] hover:bg-[#d4998e] text-slate-900 font-bold text-xs rounded-xl transition-all"
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
