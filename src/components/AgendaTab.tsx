import React, { useState } from 'react';
import { Calendar, Clock, Plus, CheckCircle, XCircle, Search, Trash2, CalendarDays, User, Heart, Sparkles, MessageSquare } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');

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
    <div className="space-y-4">
      {/* Calendar Header with Date Input */}
      <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-50 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-[#dfaba0]" />
          <span className="font-serif text-base font-bold text-slate-800">Selecione o Dia</span>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#dfaba0]"
        />
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
                  : 'bg-white border border-slate-50 text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold">{weekdayNames[day.getDay()]}</span>
              <span className="text-base mt-1 font-serif">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Main Agenda Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-lg font-bold text-slate-800">
            {selectedDate === new Date().toISOString().split('T')[0] ? 'Agenda de Hoje' : 'Sessões Agendadas'}
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 py-1.5 px-3 bg-[#dfaba0] text-white hover:bg-[#d4998e] font-semibold rounded-xl text-xs shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Agendamento
          </button>
        </div>

        {/* List of daily appointments */}
        <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto no-scrollbar pb-10">
          {dailyAppointments.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-3xl">
              <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Nenhum atendimento neste dia.</p>
              <p className="text-xs text-slate-400 mt-1">Toque no botão acima para agendar!</p>
            </div>
          ) : (
            dailyAppointments.map((app) => {
              const proc = getProcedure(app.procedureId);
              return (
                <div 
                  key={app.id} 
                  className={`bg-white p-4 rounded-2xl border border-slate-50 shadow-sm relative overflow-hidden transition-all ${
                    app.status === 'completed' ? 'opacity-75' : app.status === 'cancelled' ? 'opacity-60 bg-slate-50/50' : ''
                  }`}
                >
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5" 
                    style={{ backgroundColor: proc.color }}
                  />

                  <div className="flex justify-between items-start pl-1">
                    <div className="flex gap-2.5 items-center">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex flex-col items-center justify-center border border-slate-100 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-800 mt-1">{app.time}</span>
                      </div>
                      
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm truncate">{getPatientName(app.patientId)}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proc.color }} />
                          <span className="text-xs text-slate-500 font-medium truncate">{proc.name}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteAppointment(app.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {app.notes && (
                    <div className="mt-3 bg-slate-50/70 p-2.5 rounded-xl border border-slate-50/40 text-xs text-slate-500 pl-1.5 flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <p className="italic leading-relaxed">{app.notes}</p>
                    </div>
                  )}

                  {/* Actions Grid */}
                  <div className="mt-3.5 pt-3 border-t border-slate-50 flex justify-between items-center pl-1">
                    <span className="text-xs font-semibold text-[#dfaba0]">
                      {app.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>

                    <div className="flex gap-1.5">
                      {app.status === 'scheduled' ? (
                        <>
                          <button
                            onClick={() => handleStatusChange(app, 'completed')}
                            className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Atendido
                          </button>
                          <button
                            onClick={() => handleStatusChange(app, 'cancelled')}
                            className="py-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" />
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            app.status === 'completed' 
                              ? 'bg-emerald-50 text-emerald-600' 
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {app.status === 'completed' ? 'Atendido' : 'Cancelado'}
                          </span>
                          <button
                            onClick={() => handleStatusChange(app, 'scheduled')}
                            className="text-[10px] font-bold text-slate-400 hover:text-[#dfaba0] underline"
                          >
                            Reagendar
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddSubmit} 
            className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="font-serif text-lg font-bold text-slate-800">Agendar Procedimento</h3>
            </div>

            <p className="text-xs text-slate-400">
              Agendamento para o dia selecionado: <strong className="text-slate-600">{selectedDate.split('-').reverse().join('/')}</strong>
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Selecione o Paciente *</label>
                {patients.length === 0 ? (
                  <p className="text-xs text-red-500">Cadastre um paciente primeiro na aba Pacientes!</p>
                ) : (
                  <select
                    required
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#dfaba0]"
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
                  <p className="text-xs text-red-500">Cadastre um procedimento primeiro!</p>
                ) : (
                  <select
                    required
                    value={newProcedureId}
                    onChange={(e) => setNewProcedureId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#dfaba0]"
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
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Data Ajustada</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observações da Sessão</label>
                <textarea
                  placeholder="Ex: Foco em relaxamento, evitar áreas inflamadas, aplicar máscara de argila..."
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0] resize-none"
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
