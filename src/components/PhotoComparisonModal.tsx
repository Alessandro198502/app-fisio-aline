import React, { useState } from 'react';
import { SlidersHorizontal, Download, Upload, X, ArrowLeftRight, Image as ImageIcon, Calendar, Sparkles, Check, ZoomIn, AlertCircle } from 'lucide-react';
import { Patient, PatientEvolution } from '../types';
import { compressImage } from '../utils/storage';

interface PhotoComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  evolutions?: PatientEvolution[];
  initialBeforeUrl?: string;
  initialAfterUrl?: string;
  initialTitle?: string;
}

export default function PhotoComparisonModal({
  isOpen,
  onClose,
  patients,
  evolutions = [],
  initialBeforeUrl,
  initialAfterUrl,
  initialTitle,
}: PhotoComparisonModalProps) {
  const [comparisonMode, setComparisonMode] = useState<'slider' | 'sideBySide'>('slider');
  const [sliderPosition, setSliderPosition] = useState<number>(50);

  // Photos State
  const [beforePhoto, setBeforePhoto] = useState<string | null>(initialBeforeUrl || null);
  const [afterPhoto, setAfterPhoto] = useState<string | null>(initialAfterUrl || null);
  const [isUploadingBefore, setIsUploadingBefore] = useState(false);
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);

  // Metadata State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [treatmentTitle, setTreatmentTitle] = useState<string>(initialTitle || 'Evolução de Tratamento Estético');
  const [beforeDate, setBeforeDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [afterDate, setAfterDate] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'before') setIsUploadingBefore(true);
      else setIsUploadingAfter(true);

      const compressed = await compressImage(file, 900, 900);
      if (compressed) {
        if (type === 'before') {
          setBeforePhoto(compressed);
        } else {
          setAfterPhoto(compressed);
        }
      } else {
        alert('Não foi possível ler o arquivo de imagem. Tente uma foto em formato JPG/PNG/WEBP.');
      }
    } catch (err) {
      console.error('Erro ao carregar imagem:', err);
      alert('Erro ao importar imagem. Tente novamente.');
    } finally {
      setIsUploadingBefore(false);
      setIsUploadingAfter(false);
    }
  };

  const handleSelectPatientPhoto = (patientId: string) => {
    setSelectedPatientId(patientId);
    if (!patientId) return;

    const patient = patients.find(p => p.id === patientId);
    
    // Check evolutions for photos
    const patientEvos = evolutions.filter(e => e.patientId === patientId);
    const allEvoPhotos: { url: string; date: string; notes?: string }[] = [];

    patientEvos.forEach(ev => {
      ev.photos?.forEach(ph => {
        if (ph.image) {
          allEvoPhotos.push({
            url: ph.image,
            date: ph.date || ev.date,
            notes: ph.notes
          });
        }
      });
    });

    // Also check patient.photos if present
    if (patient?.photos && patient.photos.length > 0) {
      patient.photos.forEach(ph => {
        allEvoPhotos.push({ url: ph.url, date: ph.date, notes: ph.title });
      });
    }

    if (allEvoPhotos.length >= 2) {
      setBeforePhoto(allEvoPhotos[0].url);
      setAfterPhoto(allEvoPhotos[allEvoPhotos.length - 1].url);
      setBeforeDate(allEvoPhotos[0].date);
      setAfterDate(allEvoPhotos[allEvoPhotos.length - 1].date);
    } else if (allEvoPhotos.length === 1) {
      setBeforePhoto(allEvoPhotos[0].url);
      setBeforeDate(allEvoPhotos[0].date);
    }
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-[#dfaba0]/30 animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#2c2523] text-white flex items-center justify-between border-b border-[#dfaba0]/20 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#dfaba0] text-[#2c2523] flex items-center justify-center font-bold">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-white leading-tight">
                Comparativo de Fotos Antes & Depois
              </h2>
              <p className="text-[10px] text-[#dfaba0] font-medium">
                Dra. Aline Franchi Modesto • Avaliação de Evolução Estética
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-white/10 p-1 rounded-xl text-xs font-bold border border-white/10">
              <button
                onClick={() => setComparisonMode('slider')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  comparisonMode === 'slider' ? 'bg-[#dfaba0] text-[#2c2523]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Divisor Interativo
              </button>
              <button
                onClick={() => setComparisonMode('sideBySide')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  comparisonMode === 'sideBySide' ? 'bg-[#dfaba0] text-[#2c2523]' : 'text-slate-300 hover:text-white'
                }`}
              >
                Lado a Lado
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#fcf6f4]">
          
          {/* Top Controls: Import Photos or Select Patient */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Upload Before Photo */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                1. Importar Foto ANTES
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer bg-[#faf3f0] hover:bg-[#f3e5e0] border border-dashed border-[#dfaba0] rounded-xl p-3 text-center transition-all block">
                  <span className="text-xs font-bold text-[#2c2523] flex items-center justify-center gap-1.5">
                    <Upload className="w-4 h-4 text-[#dfaba0]" />
                    {isUploadingBefore ? 'Importando...' : beforePhoto ? '✓ Foto Antes Carregada (Trocar)' : 'Selecionar Foto Antes'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'before')}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="date"
                value={beforeDate}
                onChange={(e) => setBeforeDate(e.target.value)}
                className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-1.5"
              />
            </div>

            {/* Upload After Photo */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                2. Importar Foto DEPOIS
              </label>
              <div className="flex items-center gap-2">
                <label className="flex-1 cursor-pointer bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-300 rounded-xl p-3 text-center transition-all block">
                  <span className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    {isUploadingAfter ? 'Importando...' : afterPhoto ? '✓ Foto Depois Carregada (Trocar)' : 'Selecionar Foto Depois'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'after')}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="date"
                value={afterDate}
                onChange={(e) => setAfterDate(e.target.value)}
                className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-1.5"
              />
            </div>

            {/* Select from Patient Records */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase block">
                3. Selecionar do Prontuário
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => handleSelectPatientPhoto(e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:border-[#dfaba0]"
              >
                <option value="">-- Escolher paciente cadastrado --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título do Procedimento (ex: Botox, Melasma)"
                value={treatmentTitle}
                onChange={(e) => setTreatmentTitle(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2"
              />
            </div>

          </div>

          {/* DISPLAY CANVAS / COMPARISON AREA */}
          {beforePhoto && afterPhoto ? (
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              
              {/* Header Title Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-serif text-lg font-extrabold text-[#2c2523]">
                    {treatmentTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Dra. Aline Franchi Modesto • Fisioterapia Dermatofuncional
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#dfaba0] bg-[#faf3f0] px-3 py-1.5 rounded-full border border-[#dfaba0]/20">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Resultado Clínico</span>
                </div>
              </div>

              {/* MODE 1: INTERACTIVE SPLIT-SLIDER */}
              {comparisonMode === 'slider' && (
                <div className="space-y-3">
                  <div className="relative w-full h-[380px] sm:h-[460px] rounded-2xl overflow-hidden select-none border border-slate-200 bg-slate-900 group">
                    
                    {/* AFTER PHOTO (Base Layer) */}
                    <img
                      src={afterPhoto}
                      alt="Depois"
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* BEFORE PHOTO (Clipped Overlay Layer) */}
                    <div
                      className="absolute top-0 bottom-0 left-0 overflow-hidden"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={beforePhoto}
                        alt="Antes"
                        className="absolute top-0 bottom-0 left-0 h-full max-w-none object-cover"
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* SLIDER DIVIDER LINE & DRAGGER */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl cursor-ew-resize flex items-center justify-center"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-9 h-9 rounded-full bg-white text-[#2c2523] shadow-lg border-2 border-[#dfaba0] flex items-center justify-center font-bold text-xs active:scale-110 transition-transform">
                        <ArrowLeftRight className="w-4 h-4 text-[#2c2523]" />
                      </div>
                    </div>

                    {/* OVERLAY LABELS */}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                      ANTES ({beforeDate})
                    </div>
                    <div className="absolute top-3 right-3 bg-emerald-600/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20">
                      DEPOIS ({afterDate})
                    </div>
                  </div>

                  {/* Range Slider Controller */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-xs font-bold text-slate-500">ANTES</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderPosition}
                      onChange={(e) => setSliderPosition(Number(e.target.value))}
                      className="flex-1 accent-[#dfaba0] cursor-pointer"
                    />
                    <span className="text-xs font-bold text-emerald-600">DEPOIS</span>
                  </div>
                </div>
              )}

              {/* MODE 2: SIDE-BY-SIDE */}
              {comparisonMode === 'sideBySide' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Before Box */}
                  <div className="space-y-2">
                    <div className="relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-rose-200 bg-slate-100">
                      <img
                        src={beforePhoto}
                        alt="Foto Antes"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        ANTES
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        Data: {beforeDate}
                      </div>
                    </div>
                  </div>

                  {/* After Box */}
                  <div className="space-y-2">
                    <div className="relative h-[320px] sm:h-[400px] rounded-2xl overflow-hidden border-2 border-emerald-300 bg-slate-100">
                      <img
                        src={afterPhoto}
                        alt="Foto Depois"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        DEPOIS
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg backdrop-blur-xs">
                        Data: {afterDate}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#faf3f0] text-[#dfaba0] flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-slate-800 text-base">
                  Importe as fotos ANTES e DEPOIS do seu dispositivo
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Clique nos botões de importação acima para carregar as fotos salvas na sua galeria ou câmera.
                </p>
              </div>

              {/* Direct Quick Upload Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <label className="cursor-pointer px-4 py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Importar Foto ANTES</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'before')}
                    className="hidden"
                  />
                </label>

                <label className="cursor-pointer px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>Importar Foto DEPOIS</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'after')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
            🔒 Uso particular exclusivo Dra. Aline Franchi Modesto • Dados e fotos protegidos
          </p>

          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#2c2523] hover:bg-[#3d3431] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Concluir Comparação
          </button>
        </div>

      </div>
    </div>
  );
}
