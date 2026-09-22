import { useState } from 'react';
import { X, Check, DollarSign, Shield } from 'lucide-react';
import { Button } from '../common/Button';
import { useCurrency } from '../../context/CurrencyContext';

// FIX #9 + #10 (audit): the old QuickAddModal hardcoded fake accounts
// ("Main Checking ••8492") and category names, sent display strings where the
// backend expects UUIDs, and emitted amounts in the display currency that were
// persisted raw. It now receives the user's REAL accounts and categories as
// props, sends account_id UUIDs (or nothing → backend resolves the default),
// keeps amounts in the display currency (App.jsx converts to USD base), and
// reports honest in-flight state instead of a fake "Saved Securely!" delay.
//
// FIX (lint): form state initializes on mount; the keyed <QuickAddForm/> is
// remounted whenever the modal opens instead of resetting state in an effect.
export function QuickAddModal({ isOpen, onClose, initialType = 'expense', onSave, accounts = [], categories = [] }) {
  if (!isOpen) return null;

  // Keying on isOpen remounts the form each time the modal opens, so all
  // input state initializes fresh without setState-in-effect patterns.
  return (
    <QuickAddForm
      key={String(isOpen)}
      onClose={onClose}
      initialType={initialType}
      onSave={onSave}
      accounts={accounts}
      categories={categories}
    />
  );
}

function QuickAddForm({ onClose, initialType, onSave, accounts, categories }) {
  const [activeType, setActiveType] = useState(initialType === 'income' ? 'income' : 'expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { symbol } = useCurrency();

  const type = activeType === 'income' ? 'income' : 'expense';
  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedAccount = accounts.find((a) => a.id === accountId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please enter a description.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave({
          type,
          transaction_type: type,
          title: title.trim(),
          t_desc: title.trim(),
          amount: numAmount, // display currency — converted in App.jsx
          category_id: categoryId || null,
          category_name: selectedCategory?.category_name || 'General',
          account_id: accountId || null,
          account_name: selectedAccount?.account_name || null,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save. Nothing was recorded.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /* Shared input class — dark aware */
  const inputCls = 'w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#1C2333] border border-slate-200 dark:border-[#30363D] rounded-xl text-sm font-semibold text-slate-900 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-[#252D40] focus:border-[#1591DC] focus:ring-2 focus:ring-[#C4E2F5] dark:focus:ring-[#4382DF]/20 outline-none transition-colors';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#161B22] rounded-3xl shadow-2xl border border-[#C4E2F5] dark:border-[#30363D] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#30363D] bg-[#F8FAFC] dark:bg-[#1C2333]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#112E81] via-[#4647AE] to-[#4382DF] flex items-center justify-center text-white">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-[#E6EDF3]">Record Financial Activity</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add a transaction to your ledger</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#30363D] hover:bg-slate-200 dark:hover:bg-[#3D4452] text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="flex bg-slate-100 dark:bg-[#1C2333] p-1 rounded-2xl gap-1">
            {[
              { id: 'expense', label: 'Log Expense' },
              { id: 'income', label: 'Add Income' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveType(tab.id)}
                className={`flex-1 text-xs py-2 font-bold rounded-xl transition-all cursor-pointer ${
                  activeType === tab.id
                    ? 'bg-white dark:bg-[#30363D] text-[#2C5EAD] dark:text-[#4382DF] shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {type === 'income' ? 'Income Description / Source' : 'Merchant or Payee'} *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'income' ? 'e.g. Freelance Consulting' : 'e.g. Apple Store, Whole Foods'}
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({symbol}) *
              </label>
              <input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={`${inputCls} cursor-pointer`}>
                {categories.length === 0 && <option value="">No categories loaded</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={`${inputCls} cursor-pointer`}>
              {accounts.length === 0 && <option value="">Default account (resolved on save)</option>}
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.account_name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#30363D]">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <Shield className="w-3.5 h-3.5 text-[#1591DC]" />
              <span>Saved to your ledger</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="gradient" size="sm" type="submit" disabled={isSubmitting} icon={isSubmitting ? undefined : Check}>
                {isSubmitting ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
