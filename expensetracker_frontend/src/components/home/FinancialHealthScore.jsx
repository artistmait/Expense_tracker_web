import { ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

export function FinancialHealthScore({ healthData }) {
  const { score, grade, debtToIncomeRatio, monthlyBurnMultiple, insights } = healthData;

  return (
    <Card
      title="Financial Resilience & Health Index"
      subtitle="Holistic wealth audit calculated from cashflow, emergency buffer, and market exposure"
      icon={ShieldCheck}
      variant="accent"
      action={
        <Badge variant="success" dot>
          Grade: {grade}
        </Badge>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Score Dial & Metrics */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-white border border-[#C4E2F5]/80 shadow-xs text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG circular score ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#EDF6FC"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="url(#scoreGradient)"
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2C5EAD" />
                  <stop offset="50%" stopColor="#1591DC" />
                  <stop offset="100%" stopColor="#4BB8FA" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-[#2C5EAD] tracking-tight">{score}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">out of 100</span>
            </div>
          </div>

          <div className="mt-3">
            <h4 className="text-sm font-bold text-slate-900">Institutional Standing</h4>
            <p className="text-xs text-emerald-600 font-semibold mt-0.5">Top 4% of Peer Wealth Brackets</p>
          </div>

          {/* Quick Sub-Stats */}
          <div className="grid grid-cols-2 gap-2 w-full mt-4 pt-4 border-t border-slate-100 text-left">
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block font-semibold">Debt-To-Income</span>
              <span className="text-xs font-bold text-slate-800">{debtToIncomeRatio}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50">
              <span className="text-[10px] text-slate-400 block font-semibold">Burn Multiple</span>
              <span className="text-xs font-bold text-slate-800">{monthlyBurnMultiple}</span>
            </div>
          </div>
        </div>

        {/* AI Financial Insights */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2C5EAD]">
            <Sparkles className="w-4 h-4 text-[#1591DC]" />
            <span>Automated AI Wealth Observations</span>
          </div>

          <div className="space-y-2.5">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/90 border border-[#C4E2F5]/60 text-xs text-slate-700 shadow-2xs"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1591DC] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{insight}</span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-[#EDF6FC] border border-[#C4E2F5] text-[11px] text-[#2C5EAD] flex items-center justify-between">
            <span className="font-semibold">Optimal Recommendation: Allocate surplus to high-yield cash index.</span>
            <span className="font-bold text-[#1591DC] hover:underline cursor-pointer">Learn More →</span>
          </div>
        </div>

      </div>
    </Card>
  );
}
