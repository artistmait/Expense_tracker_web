import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const HealthScoreCard = ({ metrics, transactions = [] }) => {
  const hasData = transactions.length > 0;
  const score = hasData ? (metrics?.healthScore || 85) : null;
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score ? 'C' : 'Unrated';
  const runway = metrics?.runwayMonths ?? metrics?.smartRunway ?? 0;
  const savingsRate = metrics?.savingsRate ?? 0;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-[#30363D] flex flex-col justify-between h-full">

      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm sm:text-base font-bold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
            Financial Health Score
          </h3>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
            hasData
              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'text-slate-400 bg-slate-50 dark:bg-[#1C2333] border-slate-200 dark:border-[#30363D]'
          }`}>
            Grade: {grade}
          </span>
        </div>

        {/* Verified Feeds Pill */}
        <div className={`flex items-center space-x-2 py-2 px-3 rounded-xl border text-xs font-semibold mb-5 ${
          hasData
            ? 'bg-emerald-50/70 dark:bg-emerald-900/15 border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-400'
            : 'bg-slate-50 dark:bg-[#1C2333] border-slate-200 dark:border-[#30363D] text-slate-500 dark:text-slate-400'
        }`}>
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${hasData ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
          <span>{hasData ? `${transactions.length} verified ledger items active` : 'Awaiting initial ledger activity'}</span>
        </div>

        {/* Score Display */}
        <div className="flex items-baseline space-x-2 mb-3">
          <span className="text-4xl sm:text-5xl font-extrabold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
            {hasData ? score : '--'}
          </span>
          <span className="text-xl font-bold text-slate-400 dark:text-slate-500">/100</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 dark:bg-[#30363D] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#4382DF] via-[#4647AE] to-emerald-500 transition-all duration-700"
            style={{ width: hasData ? `${score}%` : '0%' }}
          />
        </div>
      </div>

      {/* Diagnostic Mini Metrics */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#30363D] grid grid-cols-2 gap-3 text-xs">
        <div className="bg-[#F6F9FD] dark:bg-[#1C2333] p-2.5 rounded-xl border border-slate-100 dark:border-[#30363D]">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Liquidity Runway</div>
          <div className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3] mt-0.5">
            {hasData && runway > 0 ? `${runway} Months` : 'No burn rate'}
          </div>
        </div>
        <div className="bg-[#F6F9FD] dark:bg-[#1C2333] p-2.5 rounded-xl border border-slate-100 dark:border-[#30363D]">
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Savings Allocation</div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
            {hasData ? `${savingsRate}%` : '0%'}
          </div>
        </div>
      </div>

    </div>
  );
};
