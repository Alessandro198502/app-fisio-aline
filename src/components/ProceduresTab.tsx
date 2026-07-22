import React, { useState } from 'react';
import { Search, Plus, Trash2, Edit3, Sparkles, Clock, DollarSign, Tag, Check, AlertCircle } from 'lucide-react';
import { Procedure } from '../types';

interface ProceduresTabProps {
  procedures: Procedure[];
  onAddProcedure: (proc: Omit<Procedure, 'id'>) => void;
  onUpdateProcedure: (proc: Procedure) => void;
  onDeleteProcedure: (id: string) => void;
}

export default function ProceduresTab({ procedures, onAddProcedure, onUpdateProcedure, onDeleteProcedure }: ProceduresTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'facial' | 'corporal' | 'outros'>('all');
  
  // New Procedure Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('45');
  const [newCategory, setNewCategory] = useState<'facial' | 'corporal' | 'outros'>('facial');

  // Edit Procedure Form State
  const [procedureToEdit, setProcedureToEdit] = useState<Procedure | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('45');
  const [editCategory, setEditCategory] = useState<'facial' | 'corporal' | 'outros'>('facial');

  const [procedureToDelete, setProcedureToDelete] = useState<string | null>(null);

  // Filtered list
  const filteredProcedures = procedures.filter(proc => {
    const matchesSearch = proc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          proc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || proc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) return;

    onAddProcedure({
      name: newName,
      description: newDesc,
      price: parseFloat(newPrice) || 0,
      duration: parseInt(newDuration) || 45,
      category: newCategory,
      color: '' // system will automatically pick
    });

    // Reset fields
    setNewName('');
    setNewDesc('');
    setNewPrice('');
    setNewDuration('45');
    setNewCategory('facial');
    setShowAddModal(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!procedureToEdit || !editName.trim() || !editPrice.trim()) return;

    onUpdateProcedure({
      ...procedureToEdit,
      name: editName,
      description: editDesc,
      price: parseFloat(editPrice) || 0,
      duration: parseInt(editDuration) || 45,
      category: editCategory
    });

    setProcedureToEdit(null);
  };

  return (
    <div className="space-y-4">
      {/* Search and Quick Filters */}
      <div className="flex justify-between items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar procedimentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 text-sm border border-slate-100 rounded-xl focus:outline-none focus:border-[#dfaba0] focus:ring-1 focus:ring-[#dfaba0]"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2.5 bg-[#dfaba0] hover:bg-[#d4998e] active:scale-95 text-white rounded-xl shadow-md shadow-red-100 transition-transform"
          title="Novo Procedimento"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(['all', 'facial', 'corporal', 'outros'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              categoryFilter === cat 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {cat === 'all' ? 'Todos' : cat === 'facial' ? 'Facial' : cat === 'corporal' ? 'Corporal' : 'Outros'}
          </button>
        ))}
      </div>

      {/* Procedures List */}
      <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto no-scrollbar pb-10">
        {filteredProcedures.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-dashed border-slate-200">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Nenhum procedimento encontrado.</p>
          </div>
        ) : (
          filteredProcedures.map((proc) => (
            <div 
              key={proc.id} 
              className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm relative overflow-hidden group hover:border-[#dfaba0]/30 transition-all"
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5" 
                style={{ backgroundColor: proc.color }}
              />
              
              <div className="flex justify-between items-start pl-1">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${proc.color}15`, color: proc.color }}
                  >
                    {proc.category === 'facial' ? 'Facial' : proc.category === 'corporal' ? 'Corporal' : 'Outro'}
                  </span>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base mt-2">{proc.name}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{proc.description}</p>
                </div>
                
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => {
                      setProcedureToEdit(proc);
                      setEditName(proc.name);
                      setEditDesc(proc.description);
                      setEditPrice(proc.price.toString());
                      setEditDuration(proc.duration.toString());
                      setEditCategory(proc.category);
                    }}
                    className="p-1.5 text-slate-300 hover:text-[#dfaba0] rounded-lg hover:bg-[#faf3f0] transition-colors"
                    title="Editar"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProcedureToDelete(proc.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Excluir"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 items-center mt-3 pt-3 border-t border-slate-50 text-xs font-semibold text-slate-500 pl-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {proc.duration} min
                </span>
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <DollarSign className="w-3.5 h-3.5" />
                  {proc.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Procedure Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="font-serif text-lg font-bold text-slate-800">Cadastrar Procedimento</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Botox preventivo, Drenagem pós-op"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição</label>
                <textarea
                  placeholder="Breve descrição dos benefícios, contraindicações ou do passo a passo..."
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150,00"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['facial', 'corporal', 'outros'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-semibold uppercase border transition-all ${
                        newCategory === cat 
                          ? 'bg-[#faf3f0] border-[#dfaba0] text-[#dfaba0]' 
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      {cat === 'facial' ? 'Facial' : cat === 'corporal' ? 'Corporal' : 'Outro'}
                    </button>
                  ))}
                </div>
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
                className="flex-1 py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl shadow-md shadow-red-100"
              >
                Salvar Procedimento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Procedure Modal */}
      {procedureToEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleEditSubmit} 
            className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="font-serif text-lg font-bold text-slate-800">Editar Procedimento</h3>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nome do Procedimento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Botox preventivo, Drenagem pós-op"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Descrição</label>
                <textarea
                  placeholder="Breve descrição dos benefícios, contraindicações..."
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150,00"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duração (Minutos)</label>
                  <input
                    type="number"
                    placeholder="45"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#dfaba0]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Categoria</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['facial', 'corporal', 'outros'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditCategory(cat)}
                      className={`py-2 rounded-xl text-xs font-semibold uppercase border transition-all ${
                        editCategory === cat 
                          ? 'bg-[#faf3f0] border-[#dfaba0] text-[#dfaba0]' 
                          : 'bg-slate-50 border-slate-100 text-slate-500'
                      }`}
                    >
                      {cat === 'facial' ? 'Facial' : cat === 'corporal' ? 'Corporal' : 'Outro'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProcedureToEdit(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl shadow-md shadow-red-100"
              >
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {procedureToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <h4 className="font-serif text-lg font-bold text-slate-800">Remover Procedimento?</h4>
            <p className="text-xs text-slate-500 mt-2">Deseja realmente excluir este procedimento? Esta ação não pode ser desfeita.</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setProcedureToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteProcedure(procedureToDelete);
                  setProcedureToDelete(null);
                }}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
