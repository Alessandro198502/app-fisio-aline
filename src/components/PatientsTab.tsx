import React, { useState, useRef } from 'react';
import { Search, Plus, Trash2, Edit, User, Phone, Mail, Calendar, CreditCard, Heart, Sparkles, FileText, Clock, Camera, Check, Upload, ChevronRight, AlertCircle, RefreshCw, Shield, ShieldAlert, Printer } from 'lucide-react';
import { Patient, Procedure, PatientEvolution, EvolutionPhoto, Appointment } from '../types';
import { compressImage } from '../utils/storage';

interface PatientsTabProps {
  patients: Patient[];
  procedures: Procedure[];
  evolutions: PatientEvolution[];
  appointments: Appointment[];
  onAddPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
  onAddEvolution: (patientId: string, procedureId: string, description: string, photos: Omit<EvolutionPhoto, 'id'>[]) => void;
  onDeleteEvolution: (id: string) => void;
  forceOpenAddModal?: boolean;
  onCloseForceOpen?: () => void;
}

export default function PatientsTab({
  patients,
  procedures,
  evolutions,
  appointments,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient,
  onAddEvolution,
  onDeleteEvolution,
  forceOpenAddModal = false,
  onCloseForceOpen
}: PatientsTabProps) {
  // Search / Selection State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetailTab, setPatientDetailTab] = useState<'anamnese' | 'evolucao' | 'sessoes'>('anamnese');

  // Modals & New Form States
  const [showAddModal, setShowAddModal] = useState(forceOpenAddModal);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [showLgpdModal, setShowLgpdModal] = useState(false);

  // New Patient Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newCpf, setNewCpf] = useState('');
  
  // New Patient Anamnesis fields
  const [skinType, setSkinType] = useState('Mista');
  const [allergies, setAllergies] = useState('');
  const [contraindications, setContraindications] = useState('');
  const [mainComplaint, setMainComplaint] = useState('');
  const [medications, setMedications] = useState('');
  const [diseases, setDiseases] = useState('');
  const [observations, setObservations] = useState('');

  // Editing Anamnesis State
  const [isEditingAnamnesis, setIsEditingAnamnesis] = useState(false);
  const [editSkinType, setEditSkinType] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editContraindications, setEditContraindications] = useState('');
  const [editMainComplaint, setEditMainComplaint] = useState('');
  const [editMedications, setEditMedications] = useState('');
  const [editDiseases, setEditDiseases] = useState('');
  const [editObservations, setEditObservations] = useState('');

  // New Evolution State
  const [showAddEvolutionModal, setShowAddEvolutionModal] = useState(false);
  const [evoProcedureId, setEvoProcedureId] = useState('');
  const [evoDescription, setEvoDescription] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<{ type: 'before' | 'after' | 'single'; dataUrl: string; notes: string }[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);

  // Photo Slider comparison state
  const [activeBeforePhoto, setActiveBeforePhoto] = useState<string | null>(null);
  const [activeAfterPhoto, setActiveAfterPhoto] = useState<string | null>(null);

  const fileInputRefBefore = useRef<HTMLInputElement>(null);
  const fileInputRefAfter = useRef<HTMLInputElement>(null);

  // Handle outside activation if triggered from Dashboard
  if (forceOpenAddModal && !showAddModal) {
    setShowAddModal(true);
    if (onCloseForceOpen) onCloseForceOpen();
  }

  // Filter patients
  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.cpf.includes(searchTerm)
  );

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const patientEvolutions = evolutions.filter(e => e.patientId === selectedPatientId);
  const patientAppointments = appointments.filter(a => a.patientId === selectedPatientId);

  // Calculate age helper
  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return '';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age + ' anos';
  };

  const handleCreatePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddPatient({
      name: newName,
      phone: newPhone,
      email: newEmail,
      birthDate: newBirthDate,
      cpf: newCpf,
      anamnesis: {
        skinType,
        allergies,
        contraindications,
        mainComplaint,
        medications,
        diseases,
        observations
      }
    });

    // Reset fields
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewBirthDate('');
    setNewCpf('');
    setSkinType('Mista');
    setAllergies('');
    setContraindications('');
    setMainComplaint('');
    setMedications('');
    setDiseases('');
    setObservations('');
    setShowAddModal(false);
  };

  // Trigger editing anamnesis
  const startEditingAnamnesis = () => {
    if (!selectedPatient) return;
    setEditSkinType(selectedPatient.anamnesis.skinType);
    setEditAllergies(selectedPatient.anamnesis.allergies);
    setEditContraindications(selectedPatient.anamnesis.contraindications);
    setEditMainComplaint(selectedPatient.anamnesis.mainComplaint);
    setEditMedications(selectedPatient.anamnesis.medications);
    setEditDiseases(selectedPatient.anamnesis.diseases);
    setEditObservations(selectedPatient.anamnesis.observations);
    setIsEditingAnamnesis(true);
  };

  const handleUpdateAnamnesis = () => {
    if (!selectedPatient) return;
    const updated: Patient = {
      ...selectedPatient,
      anamnesis: {
        skinType: editSkinType,
        allergies: editAllergies,
        contraindications: editContraindications,
        mainComplaint: editMainComplaint,
        medications: editMedications,
        diseases: editDiseases,
        observations: editObservations
      }
    };
    onUpdatePatient(updated);
    setIsEditingAnamnesis(false);
  };

  // Image uploads for evolution sessions
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      // Auto-compress to ~350x350 to optimize client side storage
      const compressedUrl = await compressImage(file, 350, 350);
      
      setUploadedPhotos(prev => {
        const filtered = prev.filter(p => p.type !== type);
        return [...filtered, { type, dataUrl: compressedUrl, notes: '' }];
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar a imagem. Tente outra foto.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveEvolution = () => {
    if (!selectedPatientId || !evoProcedureId || !evoDescription) {
      alert('Preencha o procedimento e a descrição da evolução.');
      return;
    }

    const photosToSave: Omit<EvolutionPhoto, 'id'>[] = uploadedPhotos.map(p => ({
      date: new Date().toISOString().split('T')[0],
      type: p.type,
      image: p.dataUrl,
      notes: p.type === 'before' ? 'Antes do procedimento.' : 'Resultado obtido.'
    }));

    onAddEvolution(selectedPatientId, evoProcedureId, evoDescription, photosToSave);

    // Reset
    setEvoProcedureId('');
    setEvoDescription('');
    setUploadedPhotos([]);
    setShowAddEvolutionModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Search / Header when patient is NOT selected */}
      {!selectedPatientId ? (
        <>
          <div className="flex justify-between items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar paciente por nome, CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white pl-10 pr-4 py-2 text-sm border border-slate-100 rounded-xl focus:outline-none focus:border-[#dfaba0] focus:ring-1 focus:ring-[#dfaba0]"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2.5 bg-[#dfaba0] hover:bg-[#d4998e] active:scale-95 text-white rounded-xl shadow-md shadow-red-100 transition-transform"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Patients List */}
          <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto no-scrollbar pb-10">
            {filteredPatients.length === 0 ? (
              <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-200">
                <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhum paciente cadastrado.</p>
              </div>
            ) : (
              filteredPatients.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPatientId(p.id);
                    setPatientDetailTab('anamnese');
                  }}
                  className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex justify-between items-center hover:border-[#dfaba0]/30 transition-all cursor-pointer active:scale-98 duration-100"
                >
                  <div className="flex gap-3 items-center min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-[#faf3f0] flex items-center justify-center text-[#dfaba0] shrink-0 font-bold font-serif">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">{p.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {p.phone || 'Sem telefone'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 shrink-0" />
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Patient Details View */
        selectedPatient && (
          <div className="space-y-4 max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar pb-16">
            {/* Patient Mini Banner */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3 relative">
              <button
                onClick={() => setSelectedPatientId(null)}
                className="absolute top-4 right-4 text-xs font-semibold text-[#dfaba0] hover:underline"
              >
                Voltar à Lista
              </button>

              <div className="flex gap-3.5 items-center">
                <div className="w-14 h-14 rounded-2xl bg-[#faf3f0] flex items-center justify-center text-[#dfaba0] font-bold font-serif text-xl shrink-0">
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-800 leading-tight">{selectedPatient.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedPatient.birthDate ? `${selectedPatient.birthDate.split('-').reverse().join('/')} (${calculateAge(selectedPatient.birthDate)})` : 'Não informada'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50 text-xs text-slate-500">
                <p className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {selectedPatient.phone || 'N/A'}
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                  CPF: {selectedPatient.cpf || 'N/A'}
                </p>
                <p className="col-span-2 flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedPatient.email || 'Sem e-mail'}
                </p>
              </div>

              {/* LGPD Protection Status Card */}
              <div className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                selectedPatient.lgpdAccepted 
                  ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800' 
                  : 'bg-amber-50/70 border-amber-100 text-amber-800'
              }`}>
                <div className="space-y-0.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#dfaba0]" />
                    {selectedPatient.lgpdAccepted ? 'Consentimento LGPD Assinado' : 'Consentimento LGPD Pendente'}
                  </p>
                  <p className="text-[10px] opacity-90 leading-normal">
                    {selectedPatient.lgpdAccepted 
                      ? `Autorizado em ${selectedPatient.lgpdAcceptedAt?.split('-').reverse().join('/') || ''}` 
                      : 'Esta paciente precisa assinar o termo de proteção e uso de dados clínicos.'}
                  </p>
                </div>
                <button
                  onClick={() => setShowLgpdModal(true)}
                  className={`py-1 px-2.5 rounded-lg text-[10px] font-bold transition-all ${
                    selectedPatient.lgpdAccepted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-[#dfaba0] hover:bg-[#d4998e] text-white shadow-sm'
                  }`}
                >
                  {selectedPatient.lgpdAccepted ? 'Ver Termo' : 'Gerar Termo de Consentimento'}
                </button>
              </div>

              <button
                onClick={() => setPatientToDelete(selectedPatient.id)}
                className="w-full py-1.5 mt-2 text-center text-xs text-red-400 hover:text-red-600 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir Ficha do Paciente
              </button>
            </div>

            {/* Segmented Controller for Patient Details */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setPatientDetailTab('anamnese')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  patientDetailTab === 'anamnese'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Anamnese
              </button>
              <button
                onClick={() => setPatientDetailTab('evolucao')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  patientDetailTab === 'evolucao'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Evolução Fotográfica
              </button>
              <button
                onClick={() => setPatientDetailTab('sessoes')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  patientDetailTab === 'sessoes'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Sessões
              </button>
            </div>

            {/* TAB: Anamnese */}
            {patientDetailTab === 'anamnese' && (
              <div className="bg-white p-5 rounded-3xl border border-slate-50 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h4 className="font-serif text-base font-bold text-slate-800 flex items-center gap-1.5">
                    <Heart className="w-4.5 h-4.5 text-[#dfaba0]" />
                    Ficha de Avaliação Estética
                  </h4>
                  {!isEditingAnamnesis ? (
                    <button
                      onClick={startEditingAnamnesis}
                      className="text-xs font-bold text-[#dfaba0] hover:underline flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                  ) : (
                    <button
                      onClick={handleUpdateAnamnesis}
                      className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Salvar
                    </button>
                  )}
                </div>

                {!isEditingAnamnesis ? (
                  /* Read Mode */
                  <div className="space-y-4 text-xs sm:text-sm">
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tipo de Pele</span>
                        <span className="text-slate-800 font-semibold mt-1 block">{selectedPatient.anamnesis.skinType || 'Não informado'}</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Queixa Principal</span>
                        <span className="text-slate-800 font-semibold mt-1 block">{selectedPatient.anamnesis.mainComplaint || 'Não informada'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Alergias</span>
                        <p className={`mt-1 font-semibold ${selectedPatient.anamnesis.allergies ? 'text-red-500' : 'text-slate-600'}`}>
                          {selectedPatient.anamnesis.allergies || 'Nenhuma alergia relatada.'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Contraindicações</span>
                        <p className={`mt-1 font-semibold ${selectedPatient.anamnesis.contraindications ? 'text-amber-600' : 'text-slate-600'}`}>
                          {selectedPatient.anamnesis.contraindications || 'Nenhuma contraindicação.'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Medicamentos de uso contínuo</span>
                        <p className="mt-1 text-slate-600 font-medium">{selectedPatient.anamnesis.medications || 'Nenhum.'}</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Patologias/Doenças</span>
                        <p className="mt-1 text-slate-600 font-medium">{selectedPatient.anamnesis.diseases || 'Nenhuma.'}</p>
                      </div>

                      <div className="border-t border-slate-50 pt-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Observações Gerais</span>
                        <p className="mt-1.5 text-slate-500 leading-relaxed italic">{selectedPatient.anamnesis.observations || 'Nenhuma observação extra.'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode Form */
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipo de Pele</label>
                      <input
                        type="text"
                        value={editSkinType}
                        onChange={(e) => setEditSkinType(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#dfaba0]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Queixa Principal</label>
                      <input
                        type="text"
                        value={editMainComplaint}
                        onChange={(e) => setEditMainComplaint(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#dfaba0]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Alergias</label>
                      <input
                        type="text"
                        value={editAllergies}
                        placeholder="Ex: Ácido salicílico, iodo..."
                        onChange={(e) => setEditAllergies(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#dfaba0]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contraindicações</label>
                      <input
                        type="text"
                        value={editContraindications}
                        placeholder="Ex: Grávida, marcapasso, placas metálicas..."
                        onChange={(e) => setEditContraindications(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#dfaba0]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Medicamentos de uso contínuo</label>
                      <input
                        type="text"
                        value={editMedications}
                        onChange={(e) => setEditMedications(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#dfaba0]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Patologias/Doenças</label>
                      <input
                        type="text"
                        value={editDiseases}
                        placeholder="Ex: Hipertensão, Diabetes..."
                        onChange={(e) => setEditDiseases(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#dfaba0]"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Observações Gerais</label>
                      <textarea
                        value={editObservations}
                        rows={3}
                        onChange={(e) => setEditObservations(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#dfaba0] resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingAnamnesis(false)}
                        className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdateAnamnesis}
                        className="flex-1 py-2 bg-[#dfaba0] text-white rounded-lg text-xs font-semibold"
                      >
                        Salvar Alterações
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Evolução Fotográfica (Galeria de evolução e controle de antes/depois) */}
            {patientDetailTab === 'evolucao' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-serif text-base font-bold text-slate-800">Evolução do Tratamento</h4>
                  <button
                    onClick={() => setShowAddEvolutionModal(true)}
                    className="flex items-center gap-1 py-1.5 px-3 bg-[#dfaba0] hover:bg-[#d4998e] text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Nova Foto de Evolução
                  </button>
                </div>

                {patientEvolutions.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-3xl">
                    <Camera className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-500 font-semibold">Nenhuma foto registrada para este paciente.</p>
                    <p className="text-xs text-slate-400 mt-1">Toque no botão acima para registrar a evolução de uma sessão!</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Before / After comparison tool if multiple photos exist */}
                    {activeBeforePhoto && activeAfterPhoto && (
                      <div className="bg-[#2c2523] p-4 rounded-3xl text-white space-y-3 shadow-md">
                        <div className="flex justify-between items-center border-b border-neutral-700 pb-2">
                          <span className="text-xs font-bold text-brand-rose flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Comparativo Antes & Depois
                          </span>
                          <button
                            onClick={() => {
                              setActiveBeforePhoto(null);
                              setActiveAfterPhoto(null);
                            }}
                            className="text-[10px] text-neutral-400 hover:text-white"
                          >
                            Fechar Comparação
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <div className="relative rounded-xl overflow-hidden aspect-square bg-neutral-800">
                            <img referrerPolicy="no-referrer" src={activeBeforePhoto} alt="Antes" className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-red-400">Antes</span>
                          </div>
                          <div className="relative rounded-xl overflow-hidden aspect-square bg-neutral-800">
                            <img referrerPolicy="no-referrer" src={activeAfterPhoto} alt="Depois" className="w-full h-full object-cover" />
                            <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-emerald-400">Depois</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timeline logs of evolutions */}
                    {patientEvolutions.map((evo) => {
                      const proc = procedures.find(p => p.id === evo.procedureId);
                      return (
                        <div key={evo.id} className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm space-y-3 relative">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400">
                                {evo.date.split('-').reverse().join('/')}
                              </span>
                              <h5 className="font-bold text-slate-800 text-sm mt-0.5">
                                {proc ? proc.name : 'Procedimento Geral'}
                              </h5>
                              <p className="text-xs text-slate-500 mt-1">{evo.description}</p>
                            </div>
                            <button
                              onClick={() => onDeleteEvolution(evo.id)}
                              className="text-slate-300 hover:text-red-500 p-1 rounded-lg"
                              title="Excluir Registro"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Photos within this session */}
                          <div className="grid grid-cols-2 gap-2 pt-2">
                            {evo.photos.map((photo) => (
                              <div 
                                key={photo.id}
                                className="relative rounded-xl overflow-hidden aspect-square border border-slate-100 bg-slate-50 group cursor-pointer"
                                onClick={() => {
                                  if (photo.type === 'before') {
                                    setActiveBeforePhoto(photo.image);
                                  } else {
                                    setActiveAfterPhoto(photo.image);
                                  }
                                }}
                              >
                                <img 
                                  referrerPolicy="no-referrer" 
                                  src={photo.image} 
                                  alt={photo.type} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                />
                                
                                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white ${
                                  photo.type === 'before' ? 'bg-red-500' : 'bg-emerald-500'
                                }`}>
                                  {photo.type === 'before' ? 'Antes' : 'Depois'}
                                </span>

                                <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-[9px] text-white truncate text-center font-medium">Comparar imagem</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: Sessões agendadas / Histórico de agendamentos */}
            {patientDetailTab === 'sessoes' && (
              <div className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm space-y-3">
                <h4 className="font-serif text-base font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-1.5">
                  <Clock className="w-4.5 h-4.5 text-[#dfaba0]" />
                  Histórico de Atendimentos
                </h4>

                {patientAppointments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Este paciente ainda não possui atendimentos agendados.</p>
                ) : (
                  <div className="space-y-3.5">
                    {patientAppointments.map((app) => {
                      const proc = procedures.find(p => p.id === app.procedureId) || { name: 'Procedimento', color: '#666' };
                      return (
                        <div key={app.id} className="flex justify-between items-start gap-2 border-b border-slate-50 pb-3 last:border-b-0 last:pb-0 text-xs">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold text-slate-400">
                              {app.date.split('-').reverse().join('/')} às {app.time}
                            </span>
                            <p className="font-bold text-slate-800 text-sm mt-0.5">{proc.name}</p>
                            {app.notes && <p className="text-[11px] text-slate-500 italic mt-1 font-medium">Obs: {app.notes}</p>}
                          </div>

                          <div className="shrink-0 text-right">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider block text-center ${
                              app.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-600' 
                                : app.status === 'cancelled'
                                ? 'bg-red-50 text-red-500'
                                : 'bg-amber-50 text-amber-600'
                            }`}>
                              {app.status === 'completed' ? 'Atendido' : app.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 block mt-1">
                              {app.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleCreatePatientSubmit} 
            className="bg-white rounded-3xl p-5 max-w-lg w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <User className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="font-serif text-lg font-bold text-slate-800">Cadastrar Paciente</h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <h4 className="font-serif font-bold text-slate-700 text-xs uppercase tracking-wider border-l-2 border-[#dfaba0] pl-2">Informações de Contato</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mariana Silva"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Telefone *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Data de Nascimento *</label>
                    <input
                      type="date"
                      required
                      value={newBirthDate}
                      onChange={(e) => setNewBirthDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="123.456.789-00"
                      value={newCpf}
                      onChange={(e) => setNewCpf(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">E-mail</label>
                    <input
                      type="email"
                      placeholder="mariana@email.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                </div>
              </div>

              <h4 className="font-serif font-bold text-slate-700 text-xs uppercase tracking-wider border-l-2 border-[#dfaba0] pl-2 pt-1">Anamnese / Ficha de Saúde</h4>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipo de Pele</label>
                    <input
                      type="text"
                      placeholder="Mista, seca, oleosa, acneica..."
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Queixa Principal</label>
                    <input
                      type="text"
                      placeholder="Rugas, flacidez, manchas..."
                      value={mainComplaint}
                      onChange={(e) => setMainComplaint(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Alergias Conocidas</label>
                  <input
                    type="text"
                    placeholder="Ex: Iodo, ácido salicílico, dipirona..."
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Contraindicações Estéticas</label>
                  <input
                    type="text"
                    placeholder="Ex: Grávida, marcapasso, pinos..."
                    value={contraindications}
                    onChange={(e) => setContraindications(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Medicamentos Contínuos</label>
                    <input
                      type="text"
                      placeholder="Lista de remédios..."
                      value={medications}
                      onChange={(e) => setMedications(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Doenças Preexistentes</label>
                    <input
                      type="text"
                      placeholder="Hipertensão, lúpus, herpes..."
                      value={diseases}
                      onChange={(e) => setDiseases(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Outras Observações</label>
                  <textarea
                    placeholder="Mais detalhes relevantes..."
                    rows={2}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl shadow-md shadow-red-100"
              >
                Salvar Paciente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Evolution Modal (Photos before / after upload) */}
      {showAddEvolutionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Camera className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="font-serif text-lg font-bold text-slate-800">Registrar Evolução</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Procedimento Realizado *</label>
                <select
                  required
                  value={evoProcedureId}
                  onChange={(e) => setEvoProcedureId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#dfaba0]"
                >
                  <option value="">Selecione o procedimento...</option>
                  {procedures.map((proc) => (
                    <option key={proc.id} value={proc.id}>{proc.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição / Anotações *</label>
                <textarea
                  required
                  placeholder="Relato clínico da evolução da sessão (ex: Pele respondeu super bem, edema reduzido em 3cm, etc)..."
                  rows={2}
                  value={evoDescription}
                  onChange={(e) => setEvoDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0] resize-none"
                />
              </div>

              {/* Photos upload area */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fotos da Evolução (Opcional)</label>
                
                {isCompressing && (
                  <div className="text-center py-2 text-xs text-[#dfaba0] font-semibold flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Otimizando foto para celular...
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {/* Photo Before */}
                  <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center relative flex flex-col items-center justify-center aspect-video bg-slate-50">
                    <input
                      type="file"
                      ref={fileInputRefBefore}
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'before')}
                      className="hidden"
                    />
                    
                    {uploadedPhotos.some(p => p.type === 'before') ? (
                      <div className="relative w-full h-full group rounded-lg overflow-hidden">
                        <img referrerPolicy="no-referrer" src={uploadedPhotos.find(p => p.type === 'before')?.dataUrl} alt="Before" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos(prev => prev.filter(p => p.type !== 'before'))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-xs text-white font-bold flex items-center justify-center transition-opacity"
                        >
                          Trocar Foto
                        </button>
                        <span className="absolute bottom-1 right-1 bg-red-500 text-[8px] text-white font-bold px-1 rounded uppercase">Antes</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRefBefore.current?.click()}
                        className="text-slate-400 hover:text-slate-600 flex flex-col items-center"
                      >
                        <Upload className="w-5 h-5 mb-1 text-[#dfaba0]" />
                        <span className="text-[10px] font-bold">Adicionar "Antes"</span>
                      </button>
                    )}
                  </div>

                  {/* Photo After */}
                  <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center relative flex flex-col items-center justify-center aspect-video bg-slate-50">
                    <input
                      type="file"
                      ref={fileInputRefAfter}
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, 'after')}
                      className="hidden"
                    />
                    
                    {uploadedPhotos.some(p => p.type === 'after') ? (
                      <div className="relative w-full h-full group rounded-lg overflow-hidden">
                        <img referrerPolicy="no-referrer" src={uploadedPhotos.find(p => p.type === 'after')?.dataUrl} alt="After" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedPhotos(prev => prev.filter(p => p.type !== 'after'))}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 text-xs text-white font-bold flex items-center justify-center transition-opacity"
                        >
                          Trocar Foto
                        </button>
                        <span className="absolute bottom-1 right-1 bg-emerald-500 text-[8px] text-white font-bold px-1 rounded uppercase">Depois</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRefAfter.current?.click()}
                        className="text-slate-400 hover:text-slate-600 flex flex-col items-center"
                      >
                        <Upload className="w-5 h-5 mb-1 text-[#dfaba0]" />
                        <span className="text-[10px] font-bold">Adicionar "Depois"</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUploadedPhotos([]);
                  setShowAddEvolutionModal(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEvolution}
                className="flex-1 py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl shadow-md shadow-red-100"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Patient Confirmation */}
      {patientToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-serif text-lg font-bold text-slate-800">Remover Paciente?</h4>
            <p className="text-xs text-slate-500 mt-2">Deseja realmente excluir este paciente? Todos os dados dele, históricos de agendamentos e evoluções fotográficas também serão permanentemente excluídos.</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setPatientToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeletePatient(patientToDelete);
                  setPatientToDelete(null);
                  setSelectedPatientId(null);
                }}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl"
              >
                Remover Tudo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LGPD Consent Form Modal */}
      {showLgpdModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full max-h-[85vh] flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#dfaba0]/10 flex items-center justify-center text-[#dfaba0]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-sm font-bold text-slate-800">Termo de Consentimento - LGPD</h4>
                  <p className="text-[10px] text-slate-400">Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
                </div>
              </div>
              <button
                onClick={() => setShowLgpdModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Document Content */}
            <div className="flex-1 overflow-y-auto pr-1 text-slate-600 text-xs leading-relaxed space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100/60 font-sans">
              <p className="font-bold text-center text-slate-800 text-xs uppercase underline">
                TERMO DE CONSENTIMENTO LIVRE E ESCLARECIDO PARA TRATAMENTO DE DADOS CLÍNICOS E EVOLUÇÃO FOTOGRÁFICA
              </p>
              
              <p>
                Pelo presente instrumento, eu, <strong className="text-slate-800">{selectedPatient.name}</strong>, inscrito(a) no CPF sob o nº <strong className="text-slate-800">{selectedPatient.cpf || 'Não Informado'}</strong>, declaro que autorizo de livre e espontânea vontade o tratamento e armazenamento seguro de meus dados pessoais e sensíveis por parte da profissional <strong>Dra. Aline - Fisioterapia Dermatofuncional</strong>.
              </p>

              <h5 className="font-bold text-slate-700 mt-2">1. Finalidade do Tratamento</h5>
              <p>
                Os dados coletados neste formulário (ficha de anamnese, histórico de saúde, alergias, contraindicações médicas e medicamentos de uso contínuo) serão utilizados exclusivamente com fins terapêuticos clínicos, para traçar tratamentos de fisioterapia estética seguros, minimizar riscos de intercorrências e estruturar formulações home care customizadas.
              </p>

              <h5 className="font-bold text-slate-700 mt-2">2. Uso de Fotos de Evolução</h5>
              <p>
                As fotos do "Antes" e "Depois" serão armazenadas de forma segura e estritamente restrita dentro do aplicativo. Servirão exclusivamente para o acompanhamento clínico-visual de evolução das disfunções dermatológicas/corporais sob intervenção profissional, sendo proibida a divulgação pública ou uso comercial sem prévia autorização escrita complementar por minha parte.
              </p>

              <h5 className="font-bold text-slate-700 mt-2">3. Direitos e Segurança dos Dados</h5>
              <p>
                A Dra. Aline compromete-se a manter a confidencialidade e a segurança destas informações. Fica assegurado ao titular o direito de, a qualquer momento, consultar estes registros, solicitar alterações, bem como revogar este consentimento com a exclusão total de seus dados sensíveis e fotos da base de dados do aplicativo.
              </p>

              <div className="pt-4 border-t border-slate-200 mt-4 text-center">
                <p className="font-bold text-slate-700 font-serif">Dra. Aline - Fisioterapia Dermatofuncional</p>
                <p className="text-[10px] text-slate-400">Aplicativo Clínico Fisio Aline • Segurança Criptografada Local</p>
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="pt-3 mt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  window.print();
                }}
                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Termo
              </button>

              {!selectedPatient.lgpdAccepted ? (
                <button
                  onClick={() => {
                    onUpdatePatient({
                      ...selectedPatient,
                      lgpdAccepted: true,
                      lgpdAcceptedAt: new Date().toISOString().split('T')[0]
                    });
                    setShowLgpdModal(false);
                  }}
                  className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  Assinar Termo pelo Paciente
                </button>
              ) : (
                <button
                  onClick={() => {
                    onUpdatePatient({
                      ...selectedPatient,
                      lgpdAccepted: false,
                      lgpdAcceptedAt: undefined
                    });
                    setShowLgpdModal(false);
                  }}
                  className="py-2 px-4 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition-all"
                >
                  Revogar Consentimento
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
