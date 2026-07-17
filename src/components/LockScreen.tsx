import React, { useState } from 'react';
import { Lock, ShieldAlert, Key, HelpCircle, ArrowRight } from 'lucide-react';
import { getAppPin } from '../utils/storage';

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const correctPin = getAppPin() || '';

  const handleKeyPress = (num: string) => {
    if (error) setError(false);
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      
      // Auto-validate when 4 digits are reached
      if (nextPin === correctPin) {
        setTimeout(() => {
          onUnlock();
        }, 200);
      } else if (nextPin.length === 4) {
        setTimeout(() => {
          setError(true);
          setPin('');
        }, 250);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPin('');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#fcf6f4] flex flex-col items-center justify-between p-6 select-none">
      
      {/* Top Security Banner */}
      <div className="w-full flex flex-col items-center text-center mt-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#dfaba0]/10 border border-[#dfaba0]/20 flex items-center justify-center text-[#dfaba0] shadow-sm animate-pulse">
          <Lock className="w-6 h-6" />
        </div>
        
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#dfaba0] uppercase">Segurança de Dados LGPD</span>
          <h2 className="font-serif text-2xl font-extrabold text-[#2c2523] mt-1">Fisio Aline</h2>
          <p className="text-xs text-slate-500 max-w-xs mt-2 leading-relaxed">
            Para garantir o sigilo médico de suas pacientes e conformidade legal, digite seu código PIN clínico.
          </p>
        </div>
      </div>

      {/* PIN Dots display */}
      <div className="flex flex-col items-center space-y-4 my-auto">
        <div className="flex gap-4">
          {[0, 1, 2, 3].map((index) => {
            const hasDigit = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4.5 h-4.5 rounded-full transition-all duration-150 ${
                  error
                    ? 'bg-rose-500 border-2 border-rose-200 animate-bounce'
                    : hasDigit
                    ? 'bg-[#dfaba0] scale-110 shadow-sm'
                    : 'bg-slate-200 border border-slate-300'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <p className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            PIN incorreto. Tente novamente.
          </p>
        )}
      </div>

      {/* Dynamic Keypad */}
      <div className="w-full max-w-[280px] mx-auto mb-8 space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num)}
              className="h-14 rounded-2xl bg-white active:bg-slate-100 hover:bg-slate-50/80 border border-slate-100 font-serif text-lg font-bold text-[#2c2523] transition-all flex items-center justify-center active:scale-95 shadow-sm"
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 font-bold text-[10px] text-slate-400 uppercase tracking-widest transition-all flex items-center justify-center active:scale-95"
          >
            Limpar
          </button>
          
          <button
            onClick={() => handleKeyPress('0')}
            className="h-14 rounded-2xl bg-white active:bg-slate-100 hover:bg-slate-50/80 border border-slate-100 font-serif text-lg font-bold text-[#2c2523] transition-all flex items-center justify-center active:scale-95 shadow-sm"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 font-bold text-[10px] text-slate-400 uppercase tracking-widest transition-all flex items-center justify-center active:scale-95"
          >
            Voltar
          </button>
        </div>
        
        <p className="text-center text-[10px] text-slate-400 leading-normal pt-2">
          Os dados clínicos das pacientes e fotos de evolução estão criptografados localmente.
        </p>
      </div>

    </div>
  );
}
