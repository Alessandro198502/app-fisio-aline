import { TrendingUp, Award, Calendar, DollarSign, Users, Briefcase, Sparkles } from 'lucide-react';
import { Appointment, Patient, Procedure } from '../types';

interface AnalyticsTabProps {
  appointments: Appointment[];
  patients: Patient[];
  procedures: Procedure[];
}

export default function AnalyticsTab({ appointments, patients, procedures }: AnalyticsTabProps) {
  
  // 1. Calculations: General Metrics
  const completed = appointments.filter(a => a.status === 'completed');
  const totalRevenue = completed.reduce((acc, cur) => acc + cur.price, 0);
  
  // Average ticket
  const averageTicket = completed.length > 0 ? totalRevenue / completed.length : 0;

  // 2. Procedures Popularity
  const procedurePopularityMap: Record<string, { count: number; revenue: number; color: string; name: string }> = {};
  
  procedures.forEach(p => {
    procedurePopularityMap[p.id] = { count: 0, revenue: 0, color: p.color, name: p.name };
  });

  completed.forEach(app => {
    if (procedurePopularityMap[app.procedureId]) {
      procedurePopularityMap[app.procedureId].count += 1;
      procedurePopularityMap[app.procedureId].revenue += app.price;
    } else {
      // Procedimento deletado ou genérico
      procedurePopularityMap[app.procedureId] = {
        count: 1,
        revenue: app.price,
        color: '#ccc',
        name: 'Procedimento Geral'
      };
    }
  });

  const popularProcedures = Object.values(procedurePopularityMap)
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const maxCount = popularProcedures.length > 0 ? popularProcedures[0].count : 1;

  // 3. Category distribution
  const categoryRevenue = {
    facial: 0,
    corporal: 0,
    outros: 0
  };

  completed.forEach(app => {
    const proc = procedures.find(p => p.id === app.procedureId);
    const cat = proc ? proc.category : 'outros';
    categoryRevenue[cat] += app.price;
  });

  const totalCatRevenue = categoryRevenue.facial + categoryRevenue.corporal + categoryRevenue.outros || 1;

  // 4. Monthly Trend (Derived dynamically from actual completed appointments to support real-world use)
  const getLast6Months = () => {
    const months = [];
    const locale = 'pt-BR';
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      // Capitalize first letter
      let name = d.toLocaleDateString(locale, { month: 'short' });
      name = name.charAt(0).toUpperCase() + name.slice(1);
      const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push({
        name: name.replace('.', ''),
        yearMonth,
        revenue: 0,
        count: 0
      });
    }
    return months;
  };

  const dynamicMonths = getLast6Months();

  completed.forEach(app => {
    if (app.date) {
      const appYearMonth = app.date.substring(0, 7); // "YYYY-MM"
      const monthObj = dynamicMonths.find(m => m.yearMonth === appYearMonth);
      if (monthObj) {
        monthObj.revenue += app.price;
        monthObj.count += 1;
      }
    }
  });

  const maxMonthRevenue = Math.max(...dynamicMonths.map(m => m.revenue)) || 100;

  // Growth calculation between the last two months
  const lastMonthVal = dynamicMonths[4].revenue;
  const currentMonthVal = dynamicMonths[5].revenue;
  let growthText = 'Faturamento Estável';
  let growthColor = 'text-slate-400';
  if (lastMonthVal > 0) {
    const change = ((currentMonthVal - lastMonthVal) / lastMonthVal) * 100;
    if (change > 0) {
      growthText = `+${change.toFixed(0)}% Crescimento`;
      growthColor = 'text-emerald-400';
    } else if (change < 0) {
      growthText = `${change.toFixed(0)}% Redução`;
      growthColor = 'text-rose-400';
    }
  } else if (currentMonthVal > 0) {
    growthText = 'Faturamento Iniciado';
    growthColor = 'text-emerald-400';
  }

  // SVG Chart Coordinates Calculation for the Area Chart
  const svgW = 320;
  const svgH = 120;
  const paddingX = 25;
  const paddingY = 15;

  const getPoints = () => {
    return dynamicMonths.map((m, i) => {
      const x = paddingX + (i * (svgW - 2 * paddingX)) / (dynamicMonths.length - 1);
      // Inverse height coordinates for SVG
      const y = svgH - paddingY - ((m.revenue / maxMonthRevenue) * (svgH - 2 * paddingY));
      return { x, y, ...m };
    });
  };

  const points = getPoints();
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${svgH - paddingY} L ${points[0].x} ${svgH - paddingY} Z`;

  return (
    <div className="space-y-5 max-h-[calc(100vh-160px)] overflow-y-auto no-scrollbar pb-16">
      
      {/* Title */}
      <div>
        <h2 className="font-serif text-xl font-bold text-slate-800">Relatórios & Insights</h2>
        <p className="text-xs text-slate-400 mt-1">Visão geral do desempenho e faturamento da clínica</p>
      </div>

      {/* Grid of micro-cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Faturamento</span>
            <p className="text-sm font-extrabold text-slate-800 mt-0.5">
              {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-950 text-sky-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Ticket Médio</span>
            <p className="text-sm font-extrabold text-slate-100 mt-0.5">
              {averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>
      </div>

      {/* 6-Month Revenue Trend Area Chart */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-md space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-sky-400 flex items-center gap-1">
              <Sparkles className="w-4 h-4" /> Desempenho de Vendas (Semestre)
            </h3>
            <p className="text-[10px] text-slate-400">Faturamento mensal acumulado (R$)</p>
          </div>
          <span className={`text-xs font-bold ${growthColor}`}>{growthText}</span>
        </div>

        {/* Elegant Custom SVG Chart */}
        <div className="relative">
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-auto">
            {/* Grid Lines */}
            <line x1={paddingX} y1={paddingY} x2={svgW - paddingX} y2={paddingY} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
            <line x1={paddingX} y1={svgH / 2} x2={svgW - paddingX} y2={svgH / 2} stroke="#1e293b" strokeWidth="1" strokeDasharray="3" />
            <line x1={paddingX} y1={svgH - paddingY} x2={svgW - paddingX} y2={svgH - paddingY} stroke="#1e293b" strokeWidth="1" />

            {/* Gradient Area */}
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#areaGradient)" />

            {/* Area Stroke Line */}
            <path d={linePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* Interactive Nodes and Data Labels */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3.5" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
                
                {/* Labels only on alternate or start/end to avoid clutter */}
                <text x={p.x} y={p.y - 8} fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">
                  {p.revenue >= 1000 ? `${(p.revenue / 1000).toFixed(1)}k` : p.revenue}
                </text>

                {/* X Axis Labels */}
                <text x={p.x} y={svgH - 2} fill="#64748b" fontSize="8" fontWeight="semibold" textAnchor="middle">
                  {p.name}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Popular Procedures Ranking */}
      <div className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm space-y-4">
        <div>
          <h3 className="font-serif text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Award className="w-4.5 h-4.5 text-[#dfaba0]" /> Ranking de Procedimentos
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Ordenado por volume de sessões realizadas</p>
        </div>

        {popularProcedures.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Realize e conclua agendamentos para ver o ranking!</p>
        ) : (
          <div className="space-y-3.5">
            {popularProcedures.slice(0, 4).map((proc, index) => {
              const percent = (proc.count / maxCount) * 100;
              return (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700 truncate max-w-[200px]">
                      {index + 1}. {proc.name}
                    </span>
                    <span className="text-slate-500 font-bold">
                      {proc.count} {proc.count === 1 ? 'sessão' : 'sessões'}
                    </span>
                  </div>
                  
                  {/* Progress track */}
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percent}%`, 
                        backgroundColor: proc.color 
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                    <span>Faturamento do procedimento:</span>
                    <span className="text-slate-600 font-bold">
                      {proc.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Category breakdown (Donut / Progress chart) */}
      <div className="bg-white p-4 rounded-3xl border border-slate-50 shadow-sm space-y-4">
        <div>
          <h3 className="font-serif text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Briefcase className="w-4.5 h-4.5 text-[#dfaba0]" /> Distribuição por Categoria
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Análise de receitas divididas por tipo de área corporal</p>
        </div>

        <div className="space-y-3">
          {/* Facial */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Tratamentos Faciais</span>
              <span className="text-slate-500">
                {((categoryRevenue.facial / totalCatRevenue) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-brand-rose rounded-full" style={{ width: `${(categoryRevenue.facial / totalCatRevenue) * 100}%` }} />
            </div>
          </div>

          {/* Corporal */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Tratamentos Corporais</span>
              <span className="text-slate-500">
                {((categoryRevenue.corporal / totalCatRevenue) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${(categoryRevenue.corporal / totalCatRevenue) * 100}%` }} />
            </div>
          </div>

          {/* Outros */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-700">Outras Atividades</span>
              <span className="text-slate-500">
                {((categoryRevenue.outros / totalCatRevenue) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(categoryRevenue.outros / totalCatRevenue) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
