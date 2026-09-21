import React, { useState, useMemo } from 'react';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Target,
  BarChart3,
  Plus,
  Edit3,
  Save,
  X,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Zap
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

// ── Dummy 6-month budget history (USD base, converted on render) ──────────────
const DUMMY_BUDGET_HISTORY = [
  { month: 'Apr', budget: 6500, actual: 5820, categories: { Housing: 2400, Food: 980, Tech: 420, Travel: 890, Health: 310, Other: 820 } },
  { month: 'May', budget: 7000, actual: 6100, categories: { Housing: 2400, Food: 1100, Tech: 590, Travel: 650, Health: 280, Other: 1080 } },
  { month: 'Jun', budget: 6500, actual: 5700, categories: { Housing: 2400, Food: 920, Tech: 310, Travel: 580, Health: 210, Other: 1280 } },
  { month: 'Jul', budget: 7500, actual: 7800, categories: { Housing: 2400, Food: 1400, Tech: 890, Travel: 1600, Health: 510, Other: 1000 } },
  { month: 'Aug', budget: 7000, actual: 6400, categories: { Housing: 2400, Food: 1050, Tech: 480, Travel: 900, Health: 370, Other: 1200 } },
  { month: 'Sep', budget: 7000, actual: 4320, categories: { Housing: 2400, Food: 720, Tech: 310, Travel: 290, Health: 200, Other: 400 } },
];

const CATEGORY_COLORS = {
  Housing: '#112E81',
  Food: '#4382DF',
  Tech: '#8B5CF6',
  Travel: '#10B981',
  Health: '#F59E0B',
  Other: '#AACCD6',
};

// Simple inline mini-bar chart
function MiniBarChart({ data, formatAmount }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.budget, d.actual)));
  return (
    <div className="flex items-end gap-1.5 h-28 w-full">
      {data.map((d, i) => {
        const budgetH = maxVal > 0 ? (d.budget / maxVal) * 100 : 0;
        const actualH = maxVal > 0 ? (d.actual / maxVal) * 100 : 0;
        const isOver = d.actual > d.budget;
        return (
          <div key={d.month} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="w-full flex items-end gap-0.5 h-24">
              {/* Budget bar */}
              <div
                className="flex-1 bg-[#AACCD6]/40 dark:bg-[#30363D] rounded-t-sm transition-all"
                style={{ height: `${budgetH}%` }}
              />
              {/* Actual bar */}
              <div
                className={`flex-1 rounded-t-sm transition-all ${isOver ? 'bg-rose-500' : 'bg-[#4382DF]'}`}
                style={{ height: `${actualH}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${i === data.length - 1 ? 'text-[#4382DF]' : 'text-slate-400 dark:text-slate-500'}`}>
              {d.month}
            </span>
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#112E81] dark:bg-[#1C2333] text-white text-[10px] font-semibold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-lg">
              Budget: {formatAmount(d.budget)}<br />
              Actual: {formatAmount(d.actual)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Progress ring component
function ProgressRing({ pct, size = 96, strokeWidth = 8, color = '#4382DF' }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(pct, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} className="dark:stroke-[#30363D]" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={pct > 100 ? '#F43F5E' : pct >= 80 ? '#F59E0B' : color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

export const BudgetView = ({
  budgetProgress = [],
  transactions = [],
  onAddBudget,
  onSaveBudget,
}) => {
  const { formatAmount, convertFromUSD, symbol } = useCurrency();

  // Monthly budget (manual, stored in USD)
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [monthlyBudgetInput, setMonthlyBudgetInput] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState(7000); // USD base

  const handleSaveBudget = () => {
    const val = parseFloat(monthlyBudgetInput);
    if (val > 0) {
      // Convert user input back to USD base for storage
      const usdVal = val / (convertFromUSD(1));
      setMonthlyBudget(usdVal);
    }
    setIsEditingBudget(false);
    setMonthlyBudgetInput('');
  };

  // Current month expenses from transactions
  const currentMonthExpenses = useMemo(() => {
    return transactions
      .filter(t => Number(t.amount) < 0 || t.transaction_type === 'expense')
      .reduce((sum, t) => sum + Math.abs(Number(t.amount || 0)), 0);
  }, [transactions]);

  // Use dummy data for history (merge last month with live data if available)
  const budgetHistory = useMemo(() => {
    const hist = [...DUMMY_BUDGET_HISTORY];
    // Update last entry with live expenses
    hist[hist.length - 1] = {
      ...hist[hist.length - 1],
      budget: monthlyBudget,
      actual: currentMonthExpenses > 0 ? currentMonthExpenses : hist[hist.length - 1].actual
    };
    return hist;
  }, [monthlyBudget, currentMonthExpenses]);

  // Analytics
  const avgBudget = useMemo(() => budgetHistory.reduce((s, d) => s + d.budget, 0) / budgetHistory.length, [budgetHistory]);
  const avgActual = useMemo(() => budgetHistory.reduce((s, d) => s + d.actual, 0) / budgetHistory.length, [budgetHistory]);
  const bestMonth = useMemo(() => [...budgetHistory].sort((a, b) => a.actual - b.actual)[0], [budgetHistory]);
  const worstMonth = useMemo(() => [...budgetHistory].sort((a, b) => b.actual - a.actual)[0], [budgetHistory]);
  const savingsEfficiency = useMemo(() => {
    const savedMonths = budgetHistory.filter(d => d.actual <= d.budget).length;
    return Math.round((savedMonths / budgetHistory.length) * 100);
  }, [budgetHistory]);

  // Current month spend vs budget
  const currentSpend = currentMonthExpenses > 0 ? currentMonthExpenses : DUMMY_BUDGET_HISTORY[DUMMY_BUDGET_HISTORY.length - 1].actual;
  const spendPct = monthlyBudget > 0 ? Math.round((currentSpend / monthlyBudget) * 100) : 0;
  const isOver = spendPct > 100;
  const isNear = !isOver && spendPct >= 80;

  // Category breakdown for current month
  const lastMonthCats = DUMMY_BUDGET_HISTORY[DUMMY_BUDGET_HISTORY.length - 1].categories;

  // Merge with budgetProgress from backend
  const categoryBudgets = useMemo(() => {
    if (budgetProgress.length > 0) return budgetProgress;
    // Use dummy categories
    return Object.entries(lastMonthCats).map(([name, spent]) => ({
      id: name.toLowerCase(),
      category_name: name,
      allocated_amount: Math.round(spent * 1.25),
      spent_amount: spent,
    }));
  }, [budgetProgress, lastMonthCats]);

  const presets = [
    { label: `${symbol}50K`, usd: 50000 / convertFromUSD(1) },
    { label: `${symbol}1L`, usd: 100000 / convertFromUSD(1) },
    { label: `${symbol}2L`, usd: 200000 / convertFromUSD(1) },
  ];

  const selectablePresets = [
    { label: formatAmount(3000), usd: 3000 },
    { label: formatAmount(5000), usd: 5000 },
    { label: formatAmount(7500), usd: 7500 },
    { label: formatAmount(10000), usd: 10000 },
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 animate-fadeIn">

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#112E81] dark:text-[#E6EDF3] tracking-tight flex items-center gap-2">
            <PieChart className="w-6 h-6 text-[#4382DF]" />
            Budget Planner
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Track spending, set limits, and analyse trends — all in {symbol}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#AACCD6]/20 dark:bg-[#1C2333] border border-[#AACCD6]/40 dark:border-[#30363D] text-[#112E81] dark:text-[#E6EDF3]">
            <Calendar className="w-3.5 h-3.5 text-[#4382DF]" />
            Sep 2026
          </span>
          <button
            onClick={onAddBudget}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#112E81] to-[#4382DF] text-white text-xs font-semibold shadow-md transition-all hover:opacity-90 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Category Budget
          </button>
        </div>
      </div>

      {/* ── Row 1: Hero Summary + Set Budget ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Monthly Budget Progress Hero */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-[#30363D] flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <ProgressRing pct={spendPct} size={120} strokeWidth={10} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-extrabold ${isOver ? 'text-rose-500' : isNear ? 'text-amber-500' : 'text-[#112E81] dark:text-[#E6EDF3]'}`}>
                {spendPct}%
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">of budget</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Budget</div>
            <div className="text-xl font-extrabold text-[#112E81] dark:text-[#E6EDF3] font-mono">{formatAmount(monthlyBudget)}</div>
            <div className="flex items-center justify-center gap-3 text-xs font-mono mt-1">
              <span className="text-rose-500 font-bold">Spent: {formatAmount(currentSpend)}</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className={`font-bold ${isOver ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isOver ? `Over: ${formatAmount(currentSpend - monthlyBudget)}` : `Left: ${formatAmount(monthlyBudget - currentSpend)}`}
              </span>
            </div>
          </div>

          {isOver && (
            <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Over-budget! Review expenses.
            </div>
          )}
          {isNear && !isOver && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Approaching limit — {spendPct}% spent
            </div>
          )}
          {!isOver && !isNear && monthlyBudget > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              On track — within safe limits
            </div>
          )}
        </div>

        {/* Set Monthly Budget Panel */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-[#30363D] lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-[#112E81] dark:text-[#E6EDF3]">Set Monthly Budget</h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Define your total monthly spending cap</p>
            </div>
            <button
              onClick={() => {
                setIsEditingBudget(!isEditingBudget);
                setMonthlyBudgetInput(Math.round(convertFromUSD(monthlyBudget)).toString());
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#4382DF] hover:bg-[#AACCD6]/20 dark:hover:bg-[#1C2333] transition-colors cursor-pointer border border-[#AACCD6]/40 dark:border-[#30363D]"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditingBudget ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditingBudget ? (
            <div className="space-y-4">
              {/* Quick preset buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Quick Presets</label>
                <div className="grid grid-cols-4 gap-2">
                  {selectablePresets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => { setMonthlyBudget(p.usd); setIsEditingBudget(false); }}
                      className="py-2 px-2 rounded-xl border border-[#AACCD6]/50 dark:border-[#30363D] hover:border-[#4382DF] bg-slate-50 dark:bg-[#0D1117] text-xs font-bold text-[#112E81] dark:text-[#E6EDF3] transition-all cursor-pointer hover:bg-[#AACCD6]/10 text-center"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Custom Amount ({symbol})</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4382DF] font-bold text-sm">{symbol}</span>
                    <input
                      type="number"
                      value={monthlyBudgetInput}
                      onChange={(e) => setMonthlyBudgetInput(e.target.value)}
                      placeholder={Math.round(convertFromUSD(7000)).toString()}
                      className="w-full pl-8 pr-3 py-2.5 text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/70 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] focus:outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#AACCD6]/50 dark:focus:ring-[#4382DF]/30 transition-all"
                    />
                  </div>
                  <button
                    onClick={handleSaveBudget}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#112E81] to-[#4382DF] text-white text-xs font-bold shadow-md hover:opacity-90 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current budget display */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-[#112E81]/5 to-[#4382DF]/5 dark:from-[#1C2333] dark:to-[#21262D] border border-[#AACCD6]/30 dark:border-[#30363D]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#112E81] to-[#4382DF] flex items-center justify-center text-white shadow-md">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Monthly Cap</div>
                  <div className="text-2xl font-extrabold text-[#112E81] dark:text-[#E6EDF3] font-mono">{formatAmount(monthlyBudget)}</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Monthly Spend Progress</span>
                  <span className={`${isOver ? 'text-rose-500' : isNear ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'}`}>{spendPct}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-[#30363D] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isOver ? 'bg-gradient-to-r from-rose-500 to-red-600'
                      : isNear ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-[#4382DF] to-[#112E81]'
                    }`}
                    style={{ width: `${Math.min(100, spendPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{formatAmount(0)}</span>
                  <span>{formatAmount(monthlyBudget)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Budget Trend Chart + Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Past Budget Trends Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-[#30363D] lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="text-sm font-bold text-[#112E81] dark:text-[#E6EDF3]">
                Past Budgeting Trends
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Budget vs Actual spend — last 6 months</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#AACCD6]/60 dark:bg-[#30363D] inline-block" />
                <span className="text-slate-400">Budget</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-[#4382DF] inline-block" />
                <span className="text-slate-400">Actual</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
                <span className="text-slate-400">Over Budget</span>
              </span>
            </div>
          </div>

          <MiniBarChart data={budgetHistory} formatAmount={formatAmount} />

          {/* Average line annotation */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#30363D] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 border-t-2 border-dashed border-[#4382DF]/60" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Avg Budget: <strong className="text-[#112E81] dark:text-[#E6EDF3] font-mono">{formatAmount(avgBudget)}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 border-t-2 border-dashed border-rose-400/60" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Avg Actual: <strong className="text-rose-500 font-mono">{formatAmount(avgActual)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Budget Analytics Cards */}
        <div className="space-y-4">

          {/* Savings Efficiency */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-[#30363D]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Budget Efficiency</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{savingsEfficiency}%</div>
            <p className="text-[11px] text-slate-400 mt-1">Months you stayed within budget</p>
            <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-[#30363D] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${savingsEfficiency}%` }} />
            </div>
          </div>

          {/* Best month */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-[#30363D]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-[#AACCD6]/30 dark:bg-[#1C2333] flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-[#4382DF]" />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Best Month</span>
            </div>
            <div className="text-lg font-extrabold text-[#112E81] dark:text-[#E6EDF3]">{bestMonth?.month}</div>
            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formatAmount(bestMonth?.actual)}</div>
            <div className="text-[11px] text-slate-400">Lowest actual spend</div>
          </div>

          {/* Worst month */}
          <div className="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-[#30363D]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-rose-500" />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Highest Spend Month</span>
            </div>
            <div className="text-lg font-extrabold text-[#112E81] dark:text-[#E6EDF3]">{worstMonth?.month}</div>
            <div className="text-xs font-mono text-rose-500 font-bold">{formatAmount(worstMonth?.actual)}</div>
            <div className="text-[11px] text-slate-400">Peak monthly expenses</div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Category Budget Breakdown ── */}
      <div className="glass-card rounded-2xl p-6 border border-slate-200/80 dark:border-[#30363D]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-bold text-[#112E81] dark:text-[#E6EDF3]">Category Budget Breakdown</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Per-category tracking — click "+ Add Category Budget" to set custom limits
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-[#4382DF]" />
            Auto-categorized from bank feeds
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map((b, idx) => {
            const allocated = b.allocated_amount || 1000;
            const spent = b.spent_amount || 0;
            const pct = Math.min(100, Math.round((spent / allocated) * 100));
            const isOver = spent > allocated;
            const isNear = !isOver && pct >= 80;
            const name = b.category_name || 'Category';
            const color = CATEGORY_COLORS[name] || '#4382DF';

            return (
              <div
                key={b.id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  isOver
                    ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/10'
                    : isNear
                    ? 'border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10'
                    : 'border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{name}</span>
                  </div>
                  {isOver ? (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">Over</span>
                  ) : isNear ? (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">Near</span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">OK</span>
                  )}
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-base font-extrabold font-mono text-[#112E81] dark:text-[#E6EDF3]">{formatAmount(spent)}</span>
                  <span className="text-[11px] text-slate-400 font-mono">/ {formatAmount(allocated)}</span>
                </div>

                <div className="w-full h-2 bg-slate-100 dark:bg-[#30363D] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-gradient-to-r from-rose-500 to-red-600'
                      : isNear ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-[#4382DF]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-1.5 text-[10px] font-mono">
                  <span className="text-slate-400">{pct}% used</span>
                  <span className={`font-bold ${isOver ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
                    {isOver ? `+${formatAmount(spent - allocated)} over` : `${formatAmount(allocated - spent)} left`}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Add Category CTA */}
          <button
            onClick={onAddBudget}
            className="p-4 rounded-xl border-2 border-dashed border-[#AACCD6]/50 dark:border-[#30363D] hover:border-[#4382DF] dark:hover:border-[#4382DF]/60 text-[#4382DF] hover:bg-[#AACCD6]/10 dark:hover:bg-[#1C2333] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[120px]"
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs font-bold">Add Category Budget</span>
          </button>
        </div>
      </div>

    </div>
  );
};
