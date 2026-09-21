import { useState } from 'react';
import { X, Check, DollarSign, Shield } from 'lucide-react';
import { Button } from '../common/Button';

export function QuickAddModal({ isOpen, onClose, initialType = 'expense', onSave }) {
  const [activeType, setActiveType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Tech & Services');
  const [account, setAccount] = useState('Main Checking ••8492');
  const [shares, setShares] = useState('');
  const [ticker, setTicker] = useState('NVDA');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      if (onSave) {
        onSave({
          type: activeType,
          title: activeType === 'stock' ? `${ticker} Position` : title,
          amount: parseFloat(amount) || 0,
          category,
          account,
          date: 'Just now'
        });
      }
      setIsSuccess(false);
      onClose();
      setTitle('');
      setAmount('');
      setShares('');
    }, 800);
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
              <p className="text-xs text-slate-500 dark:text-slate-400">Encrypted instant ledger entry</p>
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
              { id: 'income', label: 'Add Income' },
              { id: 'stock', label: 'Buy Stock' },
              { id: 'budget', label: 'New Budget' }
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
          {activeType === 'stock' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Ticker Symbol</label>
                <input
                  type="text"
                  required
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value.toUpperCase())}
                  placeholder="e.g. NVDA, AAPL, VOO"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Shares</label>
                  <input type="number" step="any" required value={shares} onChange={(e) => setShares(e.target.value)} placeholder="10" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Price per Share ($)</label>
                  <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="145.00" className={inputCls} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {activeType === 'income' ? 'Income Description / Source' : activeType === 'budget' ? 'Budget Category Name' : 'Merchant or Payee'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={activeType === 'income' ? 'e.g. Freelance Consulting' : activeType === 'budget' ? 'e.g. Subscriptions & Tools' : 'e.g. Apple Store, Whole Foods'}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {activeType === 'budget' ? 'Monthly Limit ($)' : 'Amount ($)'}
                  </label>
                  <input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                    <option value="Tech & Services">Tech & Subscriptions</option>
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Housing & Utilities">Housing & Utilities</option>
                    <option value="Travel & Lifestyle">Travel & Lifestyle</option>
                    <option value="Health & Fitness">Health & Fitness</option>
                    <option value="Income / Salary">Income / Salary</option>
                    <option value="Investments">Investments</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Account</label>
                <select value={account} onChange={(e) => setAccount(e.target.value)} className={inputCls}>
                  <option value="Main Checking ••8492">Main Checking ••8492</option>
                  <option value="Sapphire Reserve ••3124">Sapphire Reserve ••3124</option>
                  <option value="Primary Vault">Primary Vault</option>
                  <option value="Trading Account">Trading Account</option>
                </select>
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-[#30363D]">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <Shield className="w-3.5 h-3.5 text-[#1591DC]" />
              <span>256-Bit Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
              <Button variant="gradient" size="sm" type="submit" icon={isSuccess ? Check : undefined}>
                {isSuccess ? 'Saved Securely!' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
