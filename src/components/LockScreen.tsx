import React, { useState } from 'react';
import { Lock, ShieldAlert, Key, User, Eye, EyeOff, Check, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';
import { verifyLogin, getAuthCredentials, setAuthCredentials, setAuthSession } from '../utils/storage';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [identifier, setIdentifier] = useState('aline@fisio.com.br');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Change Password state
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  const creds = getAuthCredentials();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (verifyLogin(identifier, password)) {
      setAuthSession(true);
      onUnlock();
    } else {
      setErrorMsg('Login ou senha incorretos. Acesso exclusivo Dra. Aline Franchi Modesto.');
    }
  };

  const handleOpenChangePass = () => {
    setNewEmail(creds.email);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setChangeError(null);
    setChangeSuccess(false);
    setShowChangePassModal(true);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);

    if (currentPass !== creds.passwordHash) {
      setChangeError('Senha atual incorreta.');
      return;
    }

    if (newPass.length < 3) {
      setChangeError('A nova senha deve ter pelo menos 3 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setChangeError('A confirmação da nova senha não confere.');
      return;
    }

    setAuthCredentials(newEmail || creds.email, newPass);
    setChangeSuccess(true);
    setIdentifier(newEmail || creds.email);
    setPassword(newPass);

    setTimeout(() => {
      setShowChangePassModal(false);
      setChangeSuccess(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#2c2523] flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      
      {/* Background Subtle Gradient & Glow */}
      <div className="absolute inset-0 bg-radial from-[#dfaba0]/10 via-transparent to-transparent pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 border border-[#dfaba0]/20 space-y-6">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-[#faf3f0] border border-[#dfaba0]/30 flex items-center justify-center text-[#dfaba0] mx-auto shadow-sm">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#dfaba0] uppercase bg-[#faf3f0] px-3 py-1 rounded-full border border-[#dfaba0]/20">
              Uso Particular Exclusivo • Não Acessível por Terceiros
            </span>
            <h2 className="font-serif text-2xl font-black text-[#2c2523] mt-2">Dra. Aline Franchi Modesto</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
              Sistema Privativo de Fisioterapia Dermatofuncional e Prontuário Clínico.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              Usuário / E-mail de Acesso
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="aline@fisio.com.br ou aline"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#dfaba0] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">
                Senha de Acesso
              </label>
              <button
                type="button"
                onClick={handleOpenChangePass}
                className="text-[10px] font-bold text-[#dfaba0] hover:underline"
              >
                Alterar Senha?
              </button>
            </div>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#dfaba0] focus:bg-white transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#dfaba0] hover:bg-[#d4998e] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-red-100 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>Entrar na Plataforma</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Initial Credentials Hint Banner for Dra. Aline */}
        <div className="p-3.5 bg-[#faf3f0] border border-[#dfaba0]/20 rounded-2xl text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-[#2c2523]">
            <ShieldCheck className="w-4 h-4 text-[#dfaba0]" />
            <span>Dados de Acesso Iniciais:</span>
          </div>
          <p className="text-[10px]">
            • <strong>Usuário:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-slate-700">aline@fisio.com.br</code> ou <code className="bg-white px-1.5 py-0.5 rounded text-slate-700">aline</code><br />
            • <strong>Senha Padrão:</strong> <code className="bg-white px-1.5 py-0.5 rounded text-slate-700 font-bold">1234</code>
          </p>
          <p className="text-[9px] text-slate-400 italic">
            Você pode alterar esta senha a qualquer momento clicando em "Alterar Senha?".
          </p>
        </div>

      </div>

      {/* Change Password Modal */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-[10000] bg-black/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleChangePasswordSubmit}
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-slate-800"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <KeyRound className="w-5 h-5 text-[#dfaba0]" />
              <h3 className="font-serif text-base font-bold text-slate-800">Alterar Senha e E-mail</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  E-mail / Nome de Usuário
                </label>
                <input
                  type="text"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Senha Atual *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Digite sua senha atual..."
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Nova senha segura..."
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Confirmar Nova Senha *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repita a nova senha..."
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#dfaba0]"
                />
              </div>
            </div>

            {changeError && (
              <p className="text-xs text-rose-500 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-100">
                {changeError}
              </p>
            )}

            {changeSuccess && (
              <p className="text-xs text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                Senha e e-mail atualizados com sucesso!
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowChangePassModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#dfaba0] hover:bg-[#d4998e] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Salvar Nova Senha
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
