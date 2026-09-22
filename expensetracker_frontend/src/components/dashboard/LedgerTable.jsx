import React, { useState } from 'react';
import {
  RefreshCw,
  ArrowUpDown,
  Plus,
  ChevronDown,
  Tag,
  Building,
  Sparkles,
  Check,
  ArrowRight,
  Receipt
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { DEFAULT_CATEGORIES } from '../../data/defaultCategories';

export const LedgerTable = ({
  transactions = [],
  categories = [],
  onAddTransaction,
  onUpdateCategory,
  onSyncTrigger,
  onViewAllExpenses
}) => {
  const [editingTxId, setEditingTxId] = useState(null);
  const { formatAmount } = useCurrency();

  const availableCategories = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const handleCategorySelect = (txId, category) => {
    if (onUpdateCategory) {
      onUpdateCategory(txId, category.id || category.category_name, category.category_name);
    }
    setEditingTxId(null);
  };

  const avatarColors = ['bg-[#112E81]', 'bg-[#4382DF]', 'bg-[#4647AE]'];

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 transition-all border border-slate-200/80 dark:border-[#30363D] relative">

      {/* Table Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm sm:text-base font-bold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
              Recent Expenses Overview
            </h3>
            <span className="text-[10px] font-semibold text-[#4382DF] bg-[#AACCD6]/25 dark:bg-[#4382DF]/10 px-2 py-0.5 rounded-full border border-[#4382DF]/20 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Live Ledger
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Latest transaction activity • Manage full search, filters, edits and additions in the Expenses tab
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onViewAllExpenses && (
            <button
              onClick={onViewAllExpenses}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#4382DF]/10 hover:bg-[#4382DF]/20 text-xs font-bold text-[#4382DF] transition-all cursor-pointer"
            >
              <span>View All in Expenses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table or Empty State */}
      {transactions.length === 0 ? (
        <div className="py-10 text-center space-y-2.5 border border-dashed border-slate-200 dark:border-[#30363D] rounded-xl">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-[#1C2333] flex items-center justify-center mx-auto text-slate-400">
            <Receipt className="w-5 h-5" />
          </div>
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">No transactions recorded yet</div>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
            Your expense ledger is empty. Go to the Expenses tab to record a new expense or sync your bank account.
          </p>
          {onViewAllExpenses && (
            <button
              onClick={onViewAllExpenses}
              className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-[#4382DF] hover:underline cursor-pointer"
            >
              <span>Go to Expenses Tab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[#30363D] text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="pb-3 font-semibold">
                  <span className="inline-flex items-center gap-1">Merchant / Source <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600" /></span>
                </th>
                <th className="pb-3 font-semibold">
                  <span className="inline-flex items-center gap-1">Category (Editable) <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600" /></span>
                </th>
                <th className="pb-3 font-semibold">
                  <span className="inline-flex items-center gap-1">Payment Method / Feed <ArrowUpDown className="w-3 h-3 text-slate-300 dark:text-slate-600" /></span>
                </th>
                <th className="pb-3 font-semibold">Bill Status</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#30363D] text-xs">
              {transactions.slice(0, 5).map((item, idx) => {
              const isExpense = Number(item.amount) < 0 || item.transaction_type === 'expense';
              const displayAmount = Math.abs(Number(item.amount || 0));
              const merchantName = item.merchant || item.title || item.t_desc || 'Transaction';
              const firstLetter = merchantName.charAt(0).toUpperCase();

              return (
                <tr key={item.id || idx} className="hover:bg-slate-50/70 dark:hover:bg-[#1C2333]/60 transition-colors group">

                  {/* Merchant */}
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs text-white ${avatarColors[idx % 3]}`}>
                        {firstLetter}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-[#E6EDF3] whitespace-nowrap block">
                          {merchantName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-mono">
                          {item.t_date || item.date || 'Today'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category Pill */}
                  <td className="py-3.5 pr-4 relative">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setEditingTxId(editingTxId === (item.id || idx) ? null : (item.id || idx))}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#AACCD6]/25 dark:bg-[#4382DF]/10 hover:bg-[#AACCD6]/50 dark:hover:bg-[#4382DF]/20 text-[#112E81] dark:text-[#AACCD6] border border-[#AACCD6]/60 dark:border-[#4382DF]/30 transition-all cursor-pointer group-hover:border-[#4382DF]"
                      >
                        <Tag className="w-2.5 h-2.5 text-[#4382DF]" />
                        <span>{item.category_name || item.category || 'General'}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      </button>

                      {/* Category Dropdown */}
                      {editingTxId === (item.id || idx) && (
                        <div className="absolute left-0 top-full mt-1 w-56 bg-white dark:bg-[#1C2333] rounded-xl shadow-xl border border-slate-200 dark:border-[#30363D] py-1.5 z-50 animate-fadeIn">
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-[#30363D]">
                            Reassign Category
                          </div>
                          <div className="max-h-48 overflow-y-auto">
                            {availableCategories.map((cat) => (
                              <button
                                key={cat.id || cat.category_name}
                                onClick={() => handleCategorySelect(item.id, cat)}
                                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-[#AACCD6]/20 dark:hover:bg-[#4382DF]/10 hover:text-[#112E81] dark:hover:text-[#E6EDF3] flex items-center justify-between cursor-pointer"
                              >
                                <span className="flex items-center space-x-2">
                                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: cat.cat_colour || '#4382DF' }} />
                                  <span>{cat.category_name}</span>
                                </span>
                                {(item.category_name || item.category) === cat.category_name && (
                                  <Check className="w-3.5 h-3.5 text-[#4382DF]" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Payment Method */}
                  <td className="py-3.5 pr-4 text-slate-500 dark:text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{item.account_name || item.paymentMethod || item.account || 'Chase Sapphire •••• 8492'}</span>
                    </span>
                  </td>

                  {/* Recurring Status */}
                  <td className="py-3.5 pr-4">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1C2333] text-slate-600 dark:text-slate-400 text-[11px] font-medium border border-transparent dark:border-[#30363D]">
                      <RefreshCw className="w-2.5 h-2.5 text-[#4382DF]" />
                      <span>{item.is_reccuring || item.status === 'Recurring' ? 'Recurring' : 'Settled'}</span>
                    </span>
                  </td>

                  {/* Amount */}
                  <td className="py-3.5 text-right font-mono font-bold whitespace-nowrap">
                    {isExpense ? (
                      <span className="text-slate-800 dark:text-[#E6EDF3]">
                        -{formatAmount(displayAmount)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        +{formatAmount(displayAmount)}
                      </span>
                    )}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

    </div>
  );
};
