import React, { useState, useEffect } from 'react';
import {
  X,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Sliders,
  Wallet
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const SetBudgetModal = ({
  isOpen,
  onClose,
  categories = [],
  budgets = [],
  currentSpendMap = {},
  onSaveBudget,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [cashSource, setCashSource] = useState('all');
  const [saving, setSaving] = useState(false);
  const { symbol, formatAmount, formatRaw } = useCurrency();

  // Initialize selected category when modal opens
  useEffect(() => {
    if (isOpen) {
      const firstCat = categories[0];
      if (firstCat) {
        setSelectedCategoryId(firstCat.id);
        const existingBudget = budgets.find((b) => b.category_id === firstCat.id);
        setAmount(existingBudget ? existingBudget.allocated_amount || existingBudget.amount : '1000');
      }
    }
  }, [isOpen, categories, budgets]);

  // Update amount when category changes if an existing budget is found
  const handleCategoryChange = (catId) => {
    setSelectedCategoryId(catId);
    const existing = budgets.find((b) => b.category_id === catId);
    if (existing) {
      setAmount(existing.allocated_amount || existing.amount);
    }
  };

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);
  const currentSpent = currentCategory ? (currentSpendMap[currentCategory.id] || 0) : 0;
  const numericLimit = parseFloat(amount) || 0;
  const percentage = numericLimit > 0 ? Math.round((currentSpent / numericLimit) * 100) : 0;
  const isOver = currentSpent > numericLimit;
  const isWarning = !isOver && percentage >= 80;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId || numericLimit <= 0) return;

    setSaving(true);
    try {
      await onSaveBudget({
        category_id: selectedCategoryId,
        amount: numericLimit,
        period,
        cash_source: cashSource,
      });
      onClose();
    } catch (err) {
      // Error handled by parent / toast
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112E81]/50 dark:bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-[#161B22] rounded-2xl shadow-2xl border border-[#AACCD6]/70 dark:border-[#30363D] overflow-hidden z-10 transition-all">
        {/* Top brand accent bar */}
        <div className="h-2 bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF]" />

        {/* Modal Header */}
        <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-slate-100 dark:border-[#30363D]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#112E81] to-[#4382DF] flex items-center justify-center text-white shadow-sm">
              <Sliders className="w-5 h-5 text-[#AACCD6]" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
                Set Spending Budget
              </h3>
              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                You decide your category limits & track over-budget thresholds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#112E81] dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#21262D] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-300 mb-1.5">
              Category to Budget
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/70 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] focus:outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#AACCD6]/50 dark:focus:ring-[#4382DF]/30 transition-all cursor-pointer font-medium"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Budget Limit Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-300 mb-1.5">
                Monthly Spending Limit ({symbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4382DF] text-sm font-bold">{symbol}</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 1500.00"
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/70 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] focus:outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#AACCD6]/50 dark:focus:ring-[#4382DF]/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-300 mb-1.5">
                Evaluation Period
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/70 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] focus:outline-none focus:border-[#4382DF] cursor-pointer"
              >
                <option value="monthly">Monthly Budget</option>
                <option value="weekly">Weekly Budget</option>
              </select>
            </div>
          </div>

          {/* Applied Cash Source */}
          <div>
            <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-300 mb-1.5">
              Primary Cash Source / Connected Account
            </label>
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-[#4382DF] shrink-0" />
              <select
                value={cashSource}
                onChange={(e) => setCashSource(e.target.value)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/70 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] focus:outline-none focus:border-[#4382DF] cursor-pointer"
              >
                <option value="all">All Cash Sources & Connected Feeds</option>
                <option value="chase">Chase Sapphire Checking (••8492)</option>
                <option value="amex">Amex Reserve Platinum (••3124)</option>
                <option value="vault">Primary Wealth Vault (••9011)</option>
              </select>
            </div>
          </div>

          {/* Dynamic Real-time Progress Preview Card */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/60 dark:bg-[#0D1117] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Live Spend vs. Proposed Limit
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isOver
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : isWarning
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                }`}
              >
                {percentage}% used
              </span>
            </div>

            <div className="flex items-baseline justify-between text-xs sm:text-sm">
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Current Spend: <strong className="font-mono text-slate-900 dark:text-[#E6EDF3]">{formatRaw(currentSpent)}</strong>
              </span>
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Limit: <strong className="font-mono text-[#112E81] dark:text-[#4382DF]">{formatRaw(numericLimit)}</strong>
              </span>
            </div>

            {/* Visual Over-Budget Progress Bar */}
            <div className="w-full h-2.5 bg-slate-200 dark:bg-[#21262D] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isOver
                    ? 'bg-gradient-to-r from-rose-500 to-red-600'
                    : isWarning
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                    : 'bg-gradient-to-r from-[#4382DF] to-[#112E81]'
                }`}
                style={{ width: `${Math.min(100, percentage)}%` }}
              />
            </div>

            {/* Status Alert description */}
            {isOver && (
              <div className="flex items-center space-x-1.5 text-xs text-rose-600 dark:text-rose-400 font-semibold pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Exceeds limit by {formatRaw(currentSpent - numericLimit)}! Over-budget threshold active.</span>
              </div>
            )}
            {isWarning && (
              <div className="flex items-center space-x-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium pt-1">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>Near limit (over 80% consumed). Review recent transactions.</span>
              </div>
            )}
            {!isOver && !isWarning && numericLimit > 0 && (
              <div className="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Within safe allocation limits. {formatRaw(numericLimit - currentSpent)} remaining.</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || numericLimit <= 0}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Save Budget Allocation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
