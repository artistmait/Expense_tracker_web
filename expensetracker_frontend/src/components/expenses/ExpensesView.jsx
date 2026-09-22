import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Receipt,
  Plus,
  RotateCw,
  Edit3,
  Trash2,
  Calendar,
  Building,
  Tag,
  ChevronLeft,
  ChevronRight,
  Layers,
  List,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { transactionsApi } from '../../services/transactionsApi';
import { useToast } from '../../context/ToastContext';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseModal } from './ExpenseModal';
import { DEFAULT_CATEGORIES } from '../../data/defaultCategories';

const DEFAULT_ACCOUNTS = [
  { id: 'acc-chk', account_name: 'Main Checking Account' },
  { id: 'acc-cc',  account_name: 'Sapphire Reserve Card' },
];

const parseFiltersFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const categoriesParam = params.get('categories');
  const accountsParam = params.get('accounts');
  return {
    search: params.get('search') || '',
    type: params.get('type') || 'all',
    start_date: params.get('start_date') || '',
    end_date: params.get('end_date') || '',
    categories: categoriesParam ? categoriesParam.split(',').filter(Boolean) : [],
    accounts: accountsParam ? accountsParam.split(',').filter(Boolean) : [],
    min_amount: params.get('min_amount') || '',
    max_amount: params.get('max_amount') || '',
    page: parseInt(params.get('page'), 10) || 1,
    limit: parseInt(params.get('limit'), 10) || 15,
  };
};

export const ExpensesView = ({
  token,
  categories: propCategories = [],
  accounts: propAccounts = [],
  globalTransactions = [],
  onSyncBankData,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
}) => {
  const { formatAmount } = useCurrency();
  const { toast } = useToast();

  const isRealToken = token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token';
  const categories = propCategories.length > 0 ? propCategories : (isRealToken ? [] : DEFAULT_CATEGORIES);
  const accounts   = propAccounts.length   > 0 ? propAccounts   : DEFAULT_ACCOUNTS;

  const [filters, setFilters]           = useState(parseFiltersFromUrl);
  const [serverTxs, setServerTxs]       = useState([]);
  const [serverTotal, setServerTotal]   = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [loading, setLoading]           = useState(false);
  const [viewMode, setViewMode]         = useState('table');
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deleteConfirmTx, setDeleteConfirmTx] = useState(null);
  const [isSyncing, setIsSyncing]             = useState(false);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.type && filters.type !== 'all') params.set('type', filters.type);
    if (filters.start_date) params.set('start_date', filters.start_date);
    if (filters.end_date) params.set('end_date', filters.end_date);
    if (filters.categories?.length > 0) params.set('categories', filters.categories.join(','));
    if (filters.accounts?.length > 0) params.set('accounts', filters.accounts.join(','));
    if (filters.min_amount) params.set('min_amount', filters.min_amount);
    if (filters.max_amount) params.set('max_amount', filters.max_amount);
    if (filters.page > 1) params.set('page', filters.page.toString());
    if (filters.limit !== 15) params.set('limit', filters.limit.toString());
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [filters]);

  // Server-side fetch (real token only)
  const fetchServerExpenses = useCallback(async () => {
    if (!isRealToken) return;
    setLoading(true);
    try {
      const res = await transactionsApi.getTransactions(token, {
        search: filters.search,
        type: filters.type !== 'all' ? filters.type : undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
        category_id: filters.categories?.length > 0 ? filters.categories.join(',') : undefined,
        account_id: filters.accounts?.length > 0 ? filters.accounts.join(',') : undefined,
        min_amount: filters.min_amount || undefined,
        max_amount: filters.max_amount || undefined,
        page: filters.page,
        limit: filters.limit,
      });
      if (res?.transactions) {
        setServerTxs(res.transactions);
        setServerTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.warn('[ExpensesView] Server fetch:', err.message);
    } finally {
      setLoading(false);
    }
  }, [token, isRealToken, filters]);

  useEffect(() => {
    if (isRealToken) fetchServerExpenses();
  }, [fetchServerExpenses, isRealToken]);

  // Client-side filtering for guest/mock mode
  const clientFilteredTxs = useMemo(() => {
    if (isRealToken) return [];
    let list = [...globalTransactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(t =>
        (t.t_desc || t.title || '').toLowerCase().includes(q) ||
        (t.category_name || '').toLowerCase().includes(q) ||
        (t.account_name || '').toLowerCase().includes(q)
      );
    }
    if (filters.type && filters.type !== 'all') {
      list = list.filter(t => (t.transaction_type || '').toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.categories?.length > 0) {
      list = list.filter(t => filters.categories.includes(t.category_id));
    }
    if (filters.min_amount) {
      list = list.filter(t => Math.abs(parseFloat(t.amount || 0)) >= parseFloat(filters.min_amount));
    }
    if (filters.max_amount) {
      list = list.filter(t => Math.abs(parseFloat(t.amount || 0)) <= parseFloat(filters.max_amount));
    }
    if (filters.start_date) {
      list = list.filter(t => (t.t_date || t.date || '') >= filters.start_date);
    }
    if (filters.end_date) {
      list = list.filter(t => (t.t_date || t.date || '') <= filters.end_date);
    }
    return list;
  }, [isRealToken, globalTransactions, filters]);

  const transactions = isRealToken
    ? serverTxs
    : clientFilteredTxs.slice((filters.page - 1) * filters.limit, filters.page * filters.limit);
  const total = isRealToken ? serverTotal : clientFilteredTxs.length;
  const activeTotalPages = isRealToken ? totalPages : Math.max(1, Math.ceil(clientFilteredTxs.length / filters.limit));

  const handleFilterChange = (delta) => setFilters(prev => ({ ...prev, ...delta, page: delta.page ?? 1 }));
  const handleResetFilters = () => setFilters({
    search: '', type: 'all', start_date: '', end_date: '',
    categories: [], accounts: [], min_amount: '', max_amount: '', page: 1, limit: 15,
  });

  const handleModalSave = async (txData) => {
    try {
      if (editingTransaction) {
        if (onUpdateTransaction) await onUpdateTransaction(txData.id, txData);
        toast.success('Transaction updated successfully.', 'Updated');
      } else {
        if (onAddTransaction) await onAddTransaction(txData);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save.', 'Save Error');
    }
    setEditingTransaction(null);
    setIsModalOpen(false);
    if (isRealToken) await fetchServerExpenses();
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmTx) return;
    try {
      if (onDeleteTransaction) {
        await onDeleteTransaction(deleteConfirmTx.id);
      } else if (isRealToken) {
        await transactionsApi.deleteTransaction(token, deleteConfirmTx.id);
      }
      toast.success(`Deleted successfully.`, 'Deleted');
      setDeleteConfirmTx(null);
      if (isRealToken) await fetchServerExpenses();
    } catch (err) {
      toast.error(err.message || 'Failed to delete.', 'Delete Error');
    }
  };

  const handleSyncFeed = async () => {
    setIsSyncing(true);
    try {
      if (onSyncBankData) await onSyncBankData();
      toast.success('Bank feed synchronized.', 'Bank Feeds');
      if (isRealToken) await fetchServerExpenses();
    } catch {
      toast.error('Bank sync temporarily unavailable.', 'Sync Notice');
    } finally {
      setIsSyncing(false);
    }
  };

  const totalFilteredExpense = transactions
    .filter(t => t.transaction_type === 'expense' || parseFloat(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

  const categorizedGroups = categories.map(cat => {
    const items = transactions.filter(t => t.category_id === cat.id || t.category_name === cat.category_name);
    const sum = items.reduce((s, t) => s + Math.abs(parseFloat(t.amount || 0)), 0);
    return { ...cat, items, totalSpent: sum };
  }).filter(g => g.items.length > 0);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-[#30363D]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#112E81] to-[#4382DF] flex items-center justify-center text-white shadow-md shadow-[#4382DF]/20">
            <Receipt className="w-5 h-5 text-[#AACCD6]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">Expenses &amp; Ledger</h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Manage, audit, filter, and categorize all your expenses.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={handleSyncFeed} disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-[#4382DF] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50">
            <RotateCw className={`w-3.5 h-3.5 text-[#4382DF] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Bank Feed'}</span>
          </button>
          <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-[#112E81] hover:bg-[#4647AE] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#112E81]/25 transition-all flex items-center space-x-2 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-[#30363D]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtered Outflow</div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{formatAmount(totalFilteredExpense)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across displayed transactions</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-[#30363D]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Records</div>
          <div className="text-xl sm:text-2xl font-black text-[#112E81] dark:text-[#E6EDF3] mt-1">{total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Matching current filter criteria</div>
        </div>
        <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-[#30363D]">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Expense</div>
          <div className="text-xl sm:text-2xl font-black text-[#4382DF] mt-1">
            {formatAmount(transactions.length > 0 ? totalFilteredExpense / transactions.length : 0)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Per recorded transaction</div>
        </div>
      </div>

      <ExpenseFilters categories={categories} accounts={accounts} filters={filters}
        onFilterChange={handleFilterChange} onResetFilters={handleResetFilters} totalResults={total} />

      <div className="flex items-center justify-between pt-1">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Showing <strong className="text-slate-800 dark:text-[#E6EDF3]">{transactions.length}</strong> of{' '}
          <strong className="text-slate-800 dark:text-[#E6EDF3]">{total}</strong> transactions
        </div>
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] text-xs font-semibold">
          {[{ id: 'table', label: 'Table View', Icon: List }, { id: 'categorized', label: 'Categorized', Icon: Layers }].map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setViewMode(id)}
              className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer ${viewMode === id ? 'bg-white dark:bg-[#1C2333] text-[#112E81] dark:text-[#E6EDF3] shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
              <Icon className="w-3.5 h-3.5" /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'table' && (
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl shadow-2xs overflow-hidden transition-colors">
          {loading ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <RotateCw className="w-6 h-6 animate-spin mx-auto text-[#4382DF]" />
              <div className="text-xs font-semibold">Filtering transactions...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-[#0D1117] border border-slate-200 dark:border-[#30363D] flex items-center justify-center mx-auto text-slate-400">
                <Receipt className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#112E81] dark:text-[#E6EDF3]">
                {filters.search || filters.type !== 'all' || filters.categories.length > 0 ? 'No matching expenses found' : 'Your Expense Ledger is Empty'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {filters.search || filters.categories.length > 0
                  ? 'Try clearing active search terms or filters.'
                  : 'No transactions yet. Record your first expense or sync your bank account.'}
              </p>
              <div className="pt-2 flex justify-center gap-3">
                {filters.search || filters.categories.length > 0 ? (
                  <button onClick={handleResetFilters} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#1C2333] hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Reset Filters</button>
                ) : (
                  <button onClick={() => { setEditingTransaction(null); setIsModalOpen(true); }}
                    className="px-4 py-2 rounded-xl bg-[#112E81] hover:bg-[#4647AE] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5">
                    <Plus className="w-4 h-4" /><span>Record First Expense</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 dark:bg-[#0D1117]/80 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-[#30363D]">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Description / Merchant</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Account / Source</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#30363D]">
                  {transactions.map((tx, idx) => {
                    const isExpense = tx.transaction_type === 'expense' || parseFloat(tx.amount) < 0;
                    const numAmt = Math.abs(parseFloat(tx.amount || 0));
                    const desc = tx.t_desc || tx.title || 'Expense';
                    const categoryName = tx.category_name || 'General';
                    const catColour = tx.cat_colour || '#4382DF';
                    const accountName = tx.account_name || 'Checking Account';
                    const dateStr = tx.t_date || tx.date || 'Recent';
                    return (
                      <tr key={tx.id || idx} className="hover:bg-slate-50/60 dark:hover:bg-[#1C2333]/50 transition-colors group">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs" style={{ backgroundColor: isExpense ? '#112E81' : '#059669' }}>
                              {desc.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 dark:text-[#E6EDF3]">{desc}</div>
                              {tx.is_reccuring && (<div className="text-[10px] text-[#4382DF] font-semibold flex items-center gap-1"><Sparkles className="w-2.5 h-2.5" /> Recurring</div>)}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                            style={{ backgroundColor: `${catColour}15`, borderColor: `${catColour}40`, color: catColour }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: catColour }} />
                            {categoryName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                            <Building className="w-3.5 h-3.5 text-slate-400" />{accountName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">{dateStr}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-mono font-bold text-xs sm:text-sm ${isExpense ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isExpense ? `-${formatAmount(numAmt)}` : `+${formatAmount(numAmt)}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button onClick={() => { setEditingTransaction(tx); setIsModalOpen(true); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#4382DF] hover:bg-slate-100 dark:hover:bg-[#1C2333] transition-colors cursor-pointer" title="Edit">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteConfirmTx(tx)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {total > 0 && activeTotalPages > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-[#30363D] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">Page <strong className="text-slate-700 dark:text-slate-300">{filters.page}</strong> of <strong className="text-slate-700 dark:text-slate-300">{activeTotalPages}</strong></div>
              <div className="flex items-center space-x-2">
                <button disabled={filters.page <= 1 || loading} onClick={() => handleFilterChange({ page: filters.page - 1 })}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#1C2333] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer flex items-center space-x-1">
                  <ChevronLeft className="w-3.5 h-3.5" /><span>Previous</span>
                </button>
                <button disabled={filters.page >= activeTotalPages || loading} onClick={() => handleFilterChange({ page: filters.page + 1 })}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#1C2333] text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer flex items-center space-x-1">
                  <span>Next</span><ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'categorized' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categorizedGroups.length === 0 ? (
            <div className="md:col-span-2 text-center py-12 text-slate-400 text-xs font-semibold">No categorized data for current filters.</div>
          ) : categorizedGroups.map((group) => (
            <div key={group.id} className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#30363D]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: group.cat_colour || '#4382DF' }} />
                  <h3 className="text-sm font-bold text-[#112E81] dark:text-[#E6EDF3]">{group.category_name}</h3>
                  <span className="text-[11px] text-slate-400">({group.items.length})</span>
                </div>
                <div className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">{formatAmount(group.totalSpent)}</div>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0D1117] hover:bg-slate-100 dark:hover:bg-[#1C2333] transition-colors">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-[#E6EDF3]">{item.t_desc || item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.t_date || item.date}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">{formatAmount(Math.abs(parseFloat(item.amount || 0)))}</span>
                      <button onClick={() => { setEditingTransaction(item); setIsModalOpen(true); }} className="text-slate-400 hover:text-[#4382DF] cursor-pointer" title="Edit">
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ExpenseModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTransaction(null); }}
        onSave={handleModalSave} categories={categories} accounts={accounts} editTransaction={editingTransaction} />

      {deleteConfirmTx && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="fixed inset-0" onClick={() => setDeleteConfirmTx(null)} />
          <div
            className="relative bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 z-10 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-2 text-rose-600">
              <AlertCircle className="w-5 h-5" /><h4 className="text-base font-bold">Delete Expense</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">"{deleteConfirmTx.t_desc || deleteConfirmTx.title}"</strong>?
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setDeleteConfirmTx(null)} className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer">Confirm Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
