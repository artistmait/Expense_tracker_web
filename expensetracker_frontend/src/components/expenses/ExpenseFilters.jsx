import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  X,
  ChevronDown,
  Check,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export const ExpenseFilters = ({
  categories = [],
  accounts = [],
  filters,
  onFilterChange,
  onResetFilters,
  totalResults = 0
}) => {
  const { symbol } = useCurrency();
  const [isExpanded, setIsExpanded] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);

  // Search local state for debouncing
  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    setSearchInput(filters.search || '');
  }, [filters.search]);

  // Debounce search input by 350ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== (filters.search || '')) {
        onFilterChange({ search: searchInput, page: 1 });
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, filters.search, onFilterChange]);

  const handleCategoryToggle = (catId) => {
    const current = filters.categories || [];
    const updated = current.includes(catId)
      ? current.filter(id => id !== catId)
      : [...current, catId];
    onFilterChange({ categories: updated, page: 1 });
  };

  const handleAccountToggle = (accId) => {
    const current = filters.accounts || [];
    const updated = current.includes(accId)
      ? current.filter(id => id !== accId)
      : [...current, accId];
    onFilterChange({ accounts: updated, page: 1 });
  };

  const setDatePreset = (preset) => {
    const now = new Date();
    let start = '';
    let end = now.toISOString().split('T')[0];

    if (preset === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    } else if (preset === 'last_30_days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = d.toISOString().split('T')[0];
    } else if (preset === 'this_year') {
      start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    } else if (preset === 'all') {
      start = '';
      end = '';
    }

    onFilterChange({ start_date: start, end_date: end, page: 1 });
  };

  // Count active filters (excluding defaults)
  const activeFilterCount = [
    Boolean(filters.search),
    Boolean(filters.type && filters.type !== 'all'),
    Boolean(filters.start_date || filters.end_date),
    Boolean(filters.categories && filters.categories.length > 0),
    Boolean(filters.accounts && filters.accounts.length > 0),
    Boolean(filters.min_amount !== '' && filters.min_amount !== undefined),
    Boolean(filters.max_amount !== '' && filters.max_amount !== undefined),
  ].filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4 transition-colors">
      
      {/* Top Search & Primary Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        
        {/* Full-Text Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by description, merchant, or notes..."
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/70 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#AACCD6]/40 transition-all"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onFilterChange({ search: '', page: 1 });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Transaction Type Pills */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#0D1117] border border-slate-200/80 dark:border-[#30363D] text-xs font-semibold shrink-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'expense', label: 'Expenses' },
            { id: 'income', label: 'Income' },
            { id: 'transfer', label: 'Transfers' },
          ].map((item) => {
            const isSelected = (filters.type || 'all') === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onFilterChange({ type: item.id, page: 1 })}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#1C2333] text-[#112E81] dark:text-[#E6EDF3] shadow-xs font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Expand / Collapse Advanced Filters */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 ${
            isExpanded || activeFilterCount > 0
              ? 'bg-[#4382DF]/10 border-[#4382DF] text-[#4382DF]'
              : 'bg-slate-50 dark:bg-[#0D1117] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-slate-300 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#4382DF] text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Reset Filters CTA */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shrink-0"
            title="Clear all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}

      </div>

      {/* Advanced Filter Drawer */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 dark:border-[#30363D] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          
          {/* 1. Multi-Select Categories */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Categories ({filters.categories?.length || 'All'})
            </label>
            <button
              type="button"
              onClick={() => {
                setCategoryDropdownOpen(!categoryDropdownOpen);
                setAccountDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-700 dark:text-slate-300 hover:border-slate-300 cursor-pointer"
            >
              <span className="truncate">
                {filters.categories?.length > 0
                  ? `${filters.categories.length} selected`
                  : 'All Categories'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-60 max-h-56 overflow-y-auto bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#30363D] rounded-xl shadow-xl p-1.5 z-50 animate-fadeIn">
                <div className="text-[10px] text-slate-400 uppercase font-bold px-2 py-1">Select Categories</div>
                {categories.map((cat) => {
                  const isChecked = (filters.categories || []).includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-[#252D40] text-left cursor-pointer"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.cat_colour || '#4382DF' }}
                        />
                        <span className="truncate text-slate-700 dark:text-slate-300">{cat.category_name}</span>
                      </span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#4382DF] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Multi-Select Accounts */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Accounts ({filters.accounts?.length || 'All'})
            </label>
            <button
              type="button"
              onClick={() => {
                setAccountDropdownOpen(!accountDropdownOpen);
                setCategoryDropdownOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-700 dark:text-slate-300 hover:border-slate-300 cursor-pointer"
            >
              <span className="truncate">
                {filters.accounts?.length > 0
                  ? `${filters.accounts.length} selected`
                  : 'All Accounts'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {accountDropdownOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-64 max-h-56 overflow-y-auto bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#30363D] rounded-xl shadow-xl p-1.5 z-50 animate-fadeIn">
                <div className="text-[10px] text-slate-400 uppercase font-bold px-2 py-1">Select Accounts</div>
                {accounts.map((acc) => {
                  const isChecked = (filters.accounts || []).includes(acc.id);
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleAccountToggle(acc.id)}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-[#252D40] text-left cursor-pointer"
                    >
                      <span className="truncate text-slate-700 dark:text-slate-300">
                        {acc.account_name}
                      </span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#4382DF] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 3. Date Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Date Range
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={filters.start_date || ''}
                onChange={(e) => onFilterChange({ start_date: e.target.value, page: 1 })}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-700 dark:text-slate-300 focus:outline-none"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={filters.end_date || ''}
                onChange={(e) => onFilterChange({ end_date: e.target.value, page: 1 })}
                className="w-1/2 px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-700 dark:text-slate-300 focus:outline-none"
              />
            </div>
            {/* Quick date presets */}
            <div className="flex gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => setDatePreset('this_month')}
                className="text-[10px] text-[#4382DF] hover:underline cursor-pointer"
              >
                This Month
              </button>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setDatePreset('last_30_days')}
                className="text-[10px] text-[#4382DF] hover:underline cursor-pointer"
              >
                Last 30D
              </button>
              <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
              <button
                type="button"
                onClick={() => setDatePreset('this_year')}
                className="text-[10px] text-[#4382DF] hover:underline cursor-pointer"
              >
                This Year
              </button>
            </div>
          </div>

          {/* 4. Amount Range */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Amount Range ({symbol})
            </label>
            <div className="flex items-center gap-1.5">
              <div className="relative w-1/2">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                  {symbol}
                </span>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_amount || ''}
                  onChange={(e) => onFilterChange({ min_amount: e.target.value, page: 1 })}
                  className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>
              <span className="text-slate-400 text-xs">-</span>
              <div className="relative w-1/2">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                  {symbol}
                </span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_amount || ''}
                  onChange={(e) => onFilterChange({ max_amount: e.target.value, page: 1 })}
                  className="w-full pl-6 pr-2 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50 dark:bg-[#0D1117] text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Active Filter Chips Bar */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Active:</span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#4382DF]/10 text-[#4382DF] border border-[#4382DF]/30">
              Query: "{filters.search}"
              <X
                className="w-3 h-3 cursor-pointer hover:text-rose-500"
                onClick={() => {
                  setSearchInput('');
                  onFilterChange({ search: '', page: 1 });
                }}
              />
            </span>
          )}

          {filters.type && filters.type !== 'all' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#4382DF]/10 text-[#4382DF] border border-[#4382DF]/30 capitalize">
              Type: {filters.type}
              <X
                className="w-3 h-3 cursor-pointer hover:text-rose-500"
                onClick={() => onFilterChange({ type: 'all', page: 1 })}
              />
            </span>
          )}

          {(filters.start_date || filters.end_date) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#4382DF]/10 text-[#4382DF] border border-[#4382DF]/30">
              {filters.start_date || '...'} → {filters.end_date || '...'}
              <X
                className="w-3 h-3 cursor-pointer hover:text-rose-500"
                onClick={() => onFilterChange({ start_date: '', end_date: '', page: 1 })}
              />
            </span>
          )}

          {filters.categories?.map((catId) => {
            const cat = categories.find(c => c.id === catId);
            return (
              <span
                key={catId}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C2333] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363D]"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat?.cat_colour || '#4382DF' }}
                />
                {cat?.category_name || 'Category'}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-500"
                  onClick={() => handleCategoryToggle(catId)}
                />
              </span>
            );
          })}

          {filters.accounts?.map((accId) => {
            const acc = accounts.find(a => a.id === accId);
            return (
              <span
                key={accId}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1C2333] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#30363D]"
              >
                {acc?.account_name || 'Account'}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-500"
                  onClick={() => handleAccountToggle(accId)}
                />
              </span>
            );
          })}

          {(filters.min_amount || filters.max_amount) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#4382DF]/10 text-[#4382DF] border border-[#4382DF]/30">
              Amount: {symbol}{filters.min_amount || '0'} - {symbol}{filters.max_amount || '∞'}
              <X
                className="w-3 h-3 cursor-pointer hover:text-rose-500"
                onClick={() => onFilterChange({ min_amount: '', max_amount: '', page: 1 })}
              />
            </span>
          )}

          <span className="text-[11px] text-slate-400 ml-auto">
            {totalResults} {totalResults === 1 ? 'record' : 'records'} found
          </span>
        </div>
      )}

    </div>
  );
};
