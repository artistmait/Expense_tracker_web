import { useState } from 'react';
import { AlertTriangle, Sparkles, PlusCircle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const BudgetTierCard = ({ budgetProgress = [], onAddBudget }) => {
  const [activeTab, setActiveTab] = useState('categories');
  const { formatAmount } = useCurrency();

  const displayBudgets = budgetProgress.slice(0, 4);

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-[#30363D] flex flex-col justify-between h-full">

      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <h3 className="text-sm sm:text-base font-bold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
            Multi-tier Budget Categories
          </h3>

          <div className="flex bg-slate-100 dark:bg-[#1C2333] p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-[#30363D] text-[#112E81] dark:text-[#E6EDF3] shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('limits')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                activeTab === 'limits'
                  ? 'bg-white dark:bg-[#30363D] text-[#112E81] dark:text-[#E6EDF3] shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Limits
            </button>
          </div>
        </div>

        {/* Budget Items */}
        {displayBudgets.length === 0 ? (
          <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 dark:border-[#30363D] rounded-xl px-4">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No category budgets set</div>
            <p className="text-[11px] text-slate-400">
              Set spending thresholds per category to track limits and receive over-budget alerts.
            </p>
            <button
              onClick={onAddBudget}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4382DF] hover:underline cursor-pointer pt-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Set First Budget</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {displayBudgets.map((b, idx) => {
              const allocated = Number(b.allocated_amount ?? b.allocated ?? b.amount ?? 0);
              const spent = b.spent_amount || b.spent || 0;
              const pct = Math.min(100, Math.round((spent / allocated) * 100));
              const isOver = spent > allocated;
              const isNear = !isOver && pct >= 80;
              const name = b.category_name || b.category || 'Category';

              const barColor = isOver
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : isNear
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-[#4382DF]';

              if (isNear || isOver) {
                return (
                  <div key={b.id || idx} className="bg-gradient-to-r from-amber-50 to-orange-50/70 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200/90 dark:border-amber-700/40 rounded-xl p-3 sm:p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <div className="flex items-center space-x-1.5 font-bold text-amber-900 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>{name}</span>
                      </div>
                      <span className="font-mono font-bold text-amber-900 dark:text-amber-300">{formatAmount(spent)}</span>
                    </div>
                    <div className="w-full h-2 bg-amber-200/70 dark:bg-amber-900/30 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                      <span>Limit: {formatAmount(allocated)}</span>
                      <span className="font-bold">{pct}% spent {isOver ? '— Over Budget!' : '(Near threshold)'}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={b.id || idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{name}</span>
                    <span className="font-mono font-bold text-[#112E81] dark:text-[#E6EDF3]">{formatAmount(spent)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-[#30363D] rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  {activeTab === 'limits' && (
                    <div className="text-[10px] text-slate-400 font-mono">Limit: {formatAmount(allocated)} • {pct}% used</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-[#30363D] flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-[#4382DF]" />
          Automated category tagging
        </span>
        <button
          onClick={onAddBudget}
          className="text-[#4382DF] hover:text-[#112E81] dark:hover:text-[#AACCD6] font-semibold text-xs cursor-pointer hover:underline"
        >
          + Add Category
        </button>
      </div>

    </div>
  );
};
