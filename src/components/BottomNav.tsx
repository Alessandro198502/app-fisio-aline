import { Home, Users, Calendar, Briefcase, TrendingUp, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'procedimentos', label: 'Procedimentos', icon: Briefcase },
    { id: 'fisioai', label: 'FisioAI', icon: Sparkles },
    { id: 'relatorios', label: 'Relatórios', icon: TrendingUp },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md border-t border-slate-100 px-2 py-1.5 flex justify-between items-center pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center py-0.5 flex-1 relative transition-all active:scale-95 ${
              isActive ? 'text-[#dfaba0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {/* Active indicator dot */}
            {isActive && (
              <span className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-[#dfaba0]" />
            )}
            
            <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
            <span className="text-[9px] font-bold mt-0.5 tracking-wider">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
