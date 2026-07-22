import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, XCircle, Trash2, CalendarDays, User, MessageSquare } from 'lucide-react';
import { Appointment, Patient, Procedure } from '../types';

interface AgendaTabProps {
  appointments: Appointment[];
  patients: Patient[];
  procedures: Procedure[];
  onAddAppointment: (app: Omit<Appointment, 'id'>) => void;
  onUpdateAppointment: (app: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  forceOpenAddModal?: boolean;
  onCloseForceOpen?: () => void;
}

export default function AgendaTab({
  appointments,
  patients,
  procedures,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  forceOpenAddModal = false,
  onCloseForceOpen
}: AgendaTabProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  // Modals and Forms
  const [showAddModal, setShowAddModal] = useState(forceOpenAddModal);

  // Form Fields
  const [newPatientId, setNewPatientId] = useState('');
  const [newProcedureId, setNewProcedureId] = useState('');
  const [newTime, setNewTime] = useState('14:00');
  const [newNotes, setNewNotes] = useState('');

  // Handle outside activation if triggered from Dashboard
  if (forceOpenAddModal && !showAddModal) {
    setShowAddModal(true);
    if (onCloseForceOpen) onCloseForceOpen();
  }

  // Generate 7-day strip centered around selectedDate
  const getWeekDays = () => {
    const list = [];
    const baseDate = new Date(selectedDate + 'T12:00:00');
    
    // Get preceding 3 days, selected day, and following 3 days
    for (let i = -3; i <= 3; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      list.push(d);
    }
    return list;
  };

  const weekdays = getWeekDays();

  // Filter appointments for the selected day
  const dailyAppointments = appointments.filter((app) => app.date === selectedDate);

  const getPatientName = (pId: string) => {
    return patients.find((p) => p.id === pId)?.name || 'Paciente';
  };

  const getProcedure = (prId: string) => {
    return procedures.find((p) => p.id === prId) || { name: 'Procedimento', color: '#666', price: 0 };
  };

  const handleStatusChange = (app: Appointment, status: 'completed' | 'cancelled' | 'scheduled') => {
    onUpdateAppointment({
      ...app,
      status
    });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientId || !newProcedureId || !selectedDate || !newTime) return;

    const proc = getProcedure(newProcedureId);

    onAddAppointment({
      patientId: newPatientId,
      procedureId: newProcedureId,
      date: selectedDate,
      time: newTime,
      notes: newNotes,
      status: 'scheduled',
      price: proc.price
    });

    // Reset fields
    setNewPatientId('');
    setNewProcedureId('');
    setNewNotes('');
    setNewTime('14:00');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4 font-sans text-slate-800">
      
      {/* GRID CONTAINER FOR DESKTOP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Daily Schedule and Days Strip (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Calendar Header with Date Input */}
          <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-[#dfaba0]" />
              <span className="font-serif text-base font-bold text-[#2c2523]">Agenda Diária</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#faf3f0] border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#dfaba0] focus:bg-white"
              />
              <button
                onClick={() => setShowAddModal(true)}
                className="p-2 bg-[#dfaba0] hover:bg-[#d4998e] text-white rounded-xl lg:hidden flex items-center justify-center shadow-sm"
                title="Novo Agendamento"
              >
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
 
          {/* Week Day Horizontal Strip */}
          <div className="flex justify-between gap-1.5 overflow-x-auto no-scrollbar py-1">
            {weekdays.map((day, idx) => {
              const dateStr = day.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
              
              const weekdayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-1 min-w-[45px] py-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-[#dfaba0] text-white shadow-md shadow-red-100 scale-105 font-bold'
                      : isToday
                      ? 'bg-[#faf3f0] border border-[#dfaba0]/30 text-[#dfaba0] font-semibold'
                      : 'bg-white border border-slate-50 text-slate-500 hover:text-slate-700 hover:border-[#dfaba0]/20'
                  }`}
                >
                  <span className="text-[10px] uppercase font-semibold">{weekdayNames[day.getDay()]}</span>
                  <span className="text-base mt-1 font-serif">{day.getDate()}</span>
                </button>
              );
            })}
          </div>
 
          {/* Appointments List for the selected day */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-[#2c2523] uppercase tracking-wider pl-1">
                Atendimentos de {selectedDate.split('-').reverse().join('/')}
              </h3>
              <span className="text-[10px] bg-[#faf3f0] border border-[#dfaba0]/10 px-2.5 py-1 rounded-full text-slate-600 font-bold">
                {dailyAppointments.length} agendados
              </span>
            </div>
 
            {dailyAppointments.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Nenhum atendimento agendado para este dia.</p>
                <p className="text-xs text-slate-400 mt-1">Selecione outro dia na tira acima ou agende um procedimento ao lado.</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 py-1.5 px-3 bg-[#faf3f0] hover:bg-[#dfaba0]/10 border border-[#dfaba0]/20 text-[#2c2523] rounded-xl text-xs font-bold transition-all lg:hidden"
                >
                  Agendar Sessão +
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[calc(100vh-220px)] overflow-y-auto no-scrollbar pb-10">
                {dailyAppointments.map((app) => {
                  const proc = getProcedure(app.procedureId);
                  return (
                    <div 
                      key={app.id} 
                      className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden transition-all"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 w-1.5" 
                        style={{ backgroundColor: proc.color }}
                      />

                      <div className="flex justify-between items-start gap-3 pl-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-[#faf3f0] flex flex-col items-center justify-center border border-slate-50 shrink-0">
                            <Clock className="w-3.5 h-3.5 text-[#dfaba0]" />
                            <span className="text-[11px] font-bold text-[#2c2523] mt-0.5">{app.time}</span>
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#dfaba0] shrink-0" />
                              {getPatientName(app.patientId)}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-1 text-xs">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: proc.color }}
                              />
                              <span className="text-slate-500 font-semibold truncate">{proc.name}</span>
                            </div>
                          </div>
                        </div>
 
                        <button
                          onClick={() => onDeleteAppointment(app.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
                          title="Excluir Agendamento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
 
                      {app.notes && (
                        <div className="mt-3 ml-2.5 bg-[#faf3f0]/30 p-3 rounded-2xl border border-slate-50 text-xs text-slate-500 pl-2.5 flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-[#dfaba0] mt-0.5 shrink-0" />
                          <p className="italic leading-relaxed font-medium">{app.notes}</p>
                        </div>
                      )}
 
                      {/* Actions Grid */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center pl-3">
                        <span className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full">
                          {app.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
 
                        <div className="flex gap-1.5">
                          {app.status === 'scheduled' ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(app, 'completed')}
                                className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm border border-emerald-200"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Concluir
                              </button>
                              <button
                                onClick={() => handleStatusChange(app, 'cancelled')}
                                className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm border border-red-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                                app.status === 'completed' 
                                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                                  : 'bg-slate-100 border border-slate-200 text-slate-400'
                              }`}>
                                {app.status === 'completed' ? '✓ Atendido' : '✕ Cancelado'}
                              </span>
                              <button
                                onClick={() => handleStatusChange(app, 'scheduled')}
                                className="text-[11px] font-bold text-slate-400 hover:text-[#dfaba0] underline transition-colors"
                              >
                                Reativar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
 
        {/* RIGHT COLUMN: Quick Appointment Form Widget (Only on Desktop) */}
        <div className="hidden lg:block bg-white p-6 rounded-3xl border border-[#dfaba0]/15 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-[#dfaba0]" />
            <h3 className="font-serif text-base font-bold text-[#2c2523]">Agendar Procedimento</h3>
          </div>
          
          <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
            Preencha os dados abaixo para reservar um horário para o dia selecionado: <strong className="text-[#dfaba0]">{selectedDate.split('-').reverse().join('/')}</strong>
          </p>
 
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Paciente *</label>
              {patients.length === 0 ? (
                <p className="text-xs text-red-500 font-bold">Cadastre uma paciente primeiro na aba Pacientes!</p>
              ) : (
                <select
                  required
                  value={newPatientId}
                  onChange={(e) => setNewPatientId(e.target.value)}
                  className="w-full bg-[#faf3f0] border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0] focus:bg-white"
                >
                  <option value="">Selecione...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              )}
            </div>
 
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Procedimento *</label>
              {procedures.length === 0 ? (
                <p className="text-xs text-red-500 font-bold">Cadastre um procedimento primeiro na aba Procedimentos!</p>
              ) : (
                <select
                  required
                  value={newProcedureId}
                  onChange={(e) => setNewProcedureId(e.target.value)}
                  className="w-full bg-[#faf3f0] border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0] focus:bg-white"
                >
                  <option value="">Selecione...</option>
                  {procedures.map((proc) => (
                    <option key={proc.id} value={proc.id}>
                      {proc.name} - {proc.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </option>
                  ))}
                </select>
              )}
            </div>
 
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Horário *</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-[#faf3f0] border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0] focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Data Ajustada</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#faf3f0] border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0] focus:bg-white"
                />
              </div>
            </div>
 
            <div>
              <label className="text-[10px] font-extrabold text-slate-400 uppercase block mb-1">Observações da Sessão</label>
              <textarea
                placeholder="Ex: Foco em celulite, evitar áreas sensíveis..."
                rows={3}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full bg-[#faf3f0] border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0] focus:bg-white resize-none"
              />
            </div>
 
            <button
              type="submit"
              disabled={patients.length === 0 || procedures.length === 0}
              className="w-full py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl shadow-md shadow-red-100 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              Confirmar Agendamento
            </button>
          </form>
        </div>
 
      </div>
 
      {/* Add Appointment Modal (Displayed on mobile when triggered) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleAddSubmit} 
            className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="font-serif text-lg font-bold text-slate-800">Agendar Procedimento</h3>
            </div>
 
            <p className="text-xs text-slate-400 font-semibold">
              Agendamento para o dia selecionado: <strong className="text-slate-600">{selectedDate.split('-').reverse().join('/')}</strong>
            </p>
 
            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Selecione o Paciente *</label>
                {patients.length === 0 ? (
                  <p className="text-xs text-red-500 font-bold">Cadastre um paciente primeiro na aba Pacientes!</p>
                ) : (
                  <select
                    required
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0]"
                  >
                    <option value="">Selecione...</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                )}
              </div>
 
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Procedimento *</label>
                {procedures.length === 0 ? (
                  <p className="text-xs text-red-500 font-bold">Cadastre um procedimento primeiro!</p>
                ) : (
                  <select
                    required
                    value={newProcedureId}
                    onChange={(e) => setNewProcedureId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0]"
                  >
                    <option value="">Selecione...</option>
                    {procedures.map((proc) => (
                      <option key={proc.id} value={proc.id}>
                        {proc.name} - {proc.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </option>
                    ))}
                  </select>
                )}
              </div>
 
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Horário *</label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Data Ajustada</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>
              </div>
 
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observações da Sessão</label>
                <textarea
                  placeholder="Ex: Foco em relaxamento, evitar áreas inflamadas..."
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#dfaba0] resize-none"
                />
              </div>
            </div>
 
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={patients.length === 0 || procedures.length === 0}
                className="flex-1 py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl shadow-md shadow-red-100 disabled:opacity-50"
              >
                Agendar Horário
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
