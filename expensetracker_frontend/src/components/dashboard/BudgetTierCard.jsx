import React, { useState } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';

export const BudgetTierCard = ({ onAddBudget }) => {
  const [activeTab, setActiveTab] = useState('categories');

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
        <div className="space-y-4">

          {/* Housing */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Housing</span>
              <span className="font-mono font-bold text-[#112E81] dark:text-[#E6EDF3]">$8,420.00</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#30363D] rounded-full overflow-hidden">
              <div className="h-full bg-[#4382DF] rounded-full w-[75%]" />
            </div>
          </div>

          {/* Groceries */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Groceries</span>
              <span className="font-mono font-bold text-[#112E81] dark:text-[#E6EDF3]">$2,820.00</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-[#30363D] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full w-[55%]" />
            </div>
          </div>

          {/* Entertainment — Near Limit Alert */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/70 dark:from-amber-900/20 dark:to-orange-900/10 border border-amber-200/90 dark:border-amber-700/40 rounded-xl p-3 sm:p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Entertainment</span>
              </div>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-300">$3,150.00</span>
            </div>
            <div className="w-full h-2 bg-amber-200/70 dark:bg-amber-900/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-[90%]" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-medium">
              <span>Limit: $3,500.00</span>
              <span className="font-bold">90% spent (Near threshold)</span>
            </div>
          </div>

        </div>
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
