import { useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Code, 
  Briefcase, 
  ShoppingBag, 
  TrendingUp, 
  Activity, 
  Plane
} from 'lucide-react';
import { Card } from '../common/Card';

const iconMap = {
  Code: Code,
  Briefcase: Briefcase,
  ShoppingBag: ShoppingBag,
  TrendingUp: TrendingUp,
  Activity: Activity,
  Plane: Plane
};

export function RecentTransactions({ transactions, onViewAll }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === 'income' && tx.type !== 'income') return false;
    if (filter === 'expense' && tx.type !== 'expense') return false;
    if (searchQuery.trim() !== '') {
      const matchTitle = tx.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTitle || matchCat;
    }
    return true;
  });

  return (
    <Card
      title="Recent Verified Transactions"
      subtitle="Encrypted ledger entries with instant receipt reconciliation"
      icon={CreditCard}
      action={
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-[#1591DC] hover:text-[#2C5EAD] transition-colors cursor-pointer"
        >
          View Full Ledger →
        </button>
      }
    >
      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-xl w-full sm:w-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'expense', label: 'Expenses' },
            { id: 'income', label: 'Income' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-[#2C5EAD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by merchant or tag..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#4BB8FA] outline-none text-slate-700"
          />
        </div>
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-100 mt-2">
        {filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No transactions match the selected filter.
          </div>
        ) : (
          filteredTransactions.map((tx) => {
            const Icon = iconMap[tx.icon] || CreditCard;
            const isIncome = tx.type === 'income';

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#F8FAFC] px-2 rounded-xl transition-colors group"
              >
                {/* Left: Icon & Merchant */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isIncome 
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                      : 'bg-[#C4E2F5]/50 text-[#2C5EAD] border border-[#C4E2F5]'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {tx.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span className="text-slate-400">{tx.account}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Date & Amount */}
                <div className="text-right shrink-0">
                  <p className={`text-xs font-bold ${
                    isIncome ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {isIncome ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {tx.date}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
