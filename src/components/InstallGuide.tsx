import { Share, PlusSquare, ArrowUpFromLine, Monitor, Smartphone, Check } from 'lucide-react';
import { motion } from 'motion/react';

interface InstallGuideProps {
  onClose: () => void;
}

export default function InstallGuide({ onClose }: InstallGuideProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-slate-200 rounded-full sm:hidden" />
        
        <div className="text-center mt-3 sm:mt-0 mb-6">
          <div className="inline-flex p-3 rounded-full bg-[#faf3f0] text-[#dfaba0] mb-3">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#2c2523]">Instalar Fisio Aline</h3>
          <p className="text-sm text-slate-500 mt-1">Tenha o app na tela inicial do seu celular, em tela cheia e sem barras de navegação do navegador!</p>
        </div>

        <div className="space-y-6">
          {/* iOS Instructions */}
          <div className="border-b border-slate-100 pb-5">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">1</span>
              No iPhone (Safari)
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 pl-7">
              <li className="flex items-center gap-2">
                <ArrowUpFromLine className="w-4 h-4 text-sky-500 shrink-0" />
                <span>Toque no botão de <strong>Compartilhar</strong> (ícone de seta pra cima).</span>
              </li>
              <li className="flex items-center gap-2">
                <PlusSquare className="w-4 h-4 text-[#dfaba0] shrink-0" />
                <span>Role a lista e selecione <strong>Adicionar à Tela de Início</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-emerald-500 text-xs">OK</span>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
              </li>
            </ul>
          </div>

          {/* Android Instructions */}
          <div>
            <h4 className="font-semibold text-slate-700 flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">2</span>
              No Android (Chrome)
            </h4>
            <ul className="space-y-3 text-sm text-slate-600 pl-7">
              <li className="flex items-center gap-2">
                <span className="font-bold text-slate-500">⋮</span>
                <span>Toque nos <strong>três pontinhos</strong> no canto superior direito.</span>
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#dfaba0] shrink-0" />
                <span>Selecione <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Confirme clicando em <strong>Adicionar/Instalar</strong>.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8">
          <button 
            onClick={onClose}
            className="w-full py-3.5 bg-[#dfaba0] hover:bg-[#d4998e] active:scale-95 transition-transform text-white font-semibold rounded-xl text-sm shadow-md shadow-red-200"
          >
            Entendi, vou instalar!
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
