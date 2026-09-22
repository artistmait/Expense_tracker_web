import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Save,
  Calendar,
  Building,
  Tag,
  Repeat,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const ExpenseModal = ({
  isOpen,
  onClose,
  onSave,
  categories = [],
  accounts = [],
  editTransaction = null, // if provided, modal operates in Edit Mode
}) => {
  const { symbol, convertFromUSD } = useCurrency();
  const isEditing = Boolean(editTransaction);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editTransaction) {
      setTitle(editTransaction.t_desc || editTransaction.title || '');
      // Amount is stored as positive USD; convert to active currency for display
      const rawAmt = Math.abs(parseFloat(editTransaction.amount || 0));
      const inActiveCurr = (rawAmt * (convertFromUSD(1))).toFixed(2);
      setAmount(String(inActiveCurr));
      setType(editTransaction.transaction_type || (parseFloat(editTransaction.amount) < 0 ? 'expense' : 'income'));
      setCategoryId(editTransaction.category_id || categories[0]?.id || '');
      setAccountId(editTransaction.account_id || accounts[0]?.id || '');
      setDate(editTransaction.t_date || editTransaction.date || new Date().toISOString().split('T')[0]);
      setIsRecurring(Boolean(editTransaction.is_reccuring || editTransaction.is_recurring));
    } else {
      setTitle('');
      setAmount('');
      setType('expense');
      setCategoryId(categories[0]?.id || '');
      setAccountId(accounts[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setIsRecurring(false);
    }
    setError('');
  }, [editTransaction, isOpen, categories, accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Description or merchant name is required.');
      return;
    }

    const numAmt = parseFloat(amount);
    if (isNaN(numAmt) || numAmt <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    // FIX #10 (audit): pass the DISPLAY-currency amount through unchanged.
    // App.jsx is the single conversion funnel (display → USD base) for every
    // entry source, so converting here too would double-convert.
    setSubmitting(true);
    try {
      const selectedCategory = categories.find(c => c.id === categoryId);
      const selectedAccount = accounts.find(a => a.id === accountId);

      await onSave({
        id: editTransaction?.id,
        title: title.trim(),
        t_desc: title.trim(),
        amount: numAmt,
        transaction_type: type,
        category_id: categoryId || null,
        category_name: selectedCategory?.category_name || 'General',
        account_id: accountId || null,
        account_name: selectedAccount?.account_name || 'Checking Account',
        t_date: date,
        is_reccuring: isRecurring,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = "w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#AACCD6]/40 transition-all";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 my-8 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#30363D] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#112E81] dark:text-[#E6EDF3]">
              {isEditing ? 'Edit Expense / Transaction' : 'Record New Expense'}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {isEditing ? 'Update transaction details and category categorization.' : 'Enter new manual transaction details into your ledger.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1C2333] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Type Selector (Expense / Income / Transfer) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'expense', label: 'Expense', icon: ArrowDownRight, color: 'text-rose-500' },
                { id: 'income', label: 'Income', icon: ArrowUpRight, color: 'text-emerald-500' },
                { id: 'transfer', label: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-500' },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#4382DF] bg-[#4382DF]/10 text-[#4382DF] ring-2 ring-[#4382DF]/20'
                        : 'border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description / Merchant */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Merchant Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Whole Foods Market, Apple Subscription, Uber"
              className={inputCls}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Amount ({symbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold font-mono text-slate-400">
                {symbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`pl-8 ${inputCls}`}
              />
            </div>
          </div>

          {/* Category & Account (2-column) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#4382DF]" />
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {categories.length === 0 && (
                  <option value="">Select category...</option>
                )}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#4382DF]" />
                Account / Payment Method
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className={`${inputCls} cursor-pointer`}
              >
                {(accounts.length > 0 ? accounts : [
                  { id: 'acc-chk', account_name: 'Main Checking Account' },
                  { id: 'acc-cc', account_name: 'Sapphire Reserve Card' }
                ]).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.account_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Recurring */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-center">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#4382DF]" />
                Transaction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="pt-5 sm:pt-4">
              <label className="flex items-center space-x-2.5 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D]">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 accent-[#4382DF] rounded cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Repeat className="w-3 h-3 text-[#4382DF]" />
                  Recurring expense
                </span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100 dark:border-[#30363D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-[#112E81] hover:bg-[#4647AE] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#112E81]/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Record Expense'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>,
    document.body
  );
};
