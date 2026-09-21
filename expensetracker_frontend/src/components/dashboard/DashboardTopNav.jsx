import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import {
  Building2,
  Coins,
  Calendar,
  RotateCw,
  ChevronDown,
  Plus,
  Check,
  LogOut
} from 'lucide-react';

export const DashboardTopNav = ({ onOpenQuickAdd, onSyncTrigger, onOpenSettings }) => {
  const { user, logout } = useAuth();

  const [selectedAccount, setSelectedAccount] = useState('All Accounts (4 Connected)');
  const [selectedCurrency, setSelectedCurrency] = useState('USD ($)');
  const [selectedPeriod, setSelectedPeriod] = useState('02 2024');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncText, setLastSyncText] = useState('Updated 2m ago');

  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setLastSyncText('Syncing feeds...');
    setTimeout(() => {
      setIsSyncing(false);
      setLastSyncText('Updated just now');
      if (onSyncTrigger) onSyncTrigger();
    }, 1200);
  };

  return (
    <header className="w-full bg-white dark:bg-[#161B22] border-b border-slate-200/80 dark:border-[#30363D] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20 transition-colors duration-200">

      {/* Left: Account Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
          className="flex items-center space-x-2.5 px-3.5 py-2 rounded-xl bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#30363D] hover:border-[#4382DF] text-xs sm:text-sm font-semibold text-[#112E81] dark:text-[#E6EDF3] shadow-2xs transition-all cursor-pointer"
        >
          <Building2 className="w-4 h-4 text-[#4382DF]" />
          <span>{selectedAccount}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        </button>

        {accountDropdownOpen && (
          <div className="absolute left-0 mt-1.5 w-64 bg-white dark:bg-[#1C2333] rounded-xl shadow-xl border border-slate-200 dark:border-[#30363D] py-1.5 z-50 animate-fadeIn">
            {[
              'All Accounts (4 Connected)',
              'Chase Sapphire Checking ••8492',
              'Amex Reserve Platinum ••3124',
              'Silicon Valley Wealth Vault ••9011',
              'Vanguard Brokerage Portfolio'
            ].map((acc) => (
              <button
                key={acc}
                onClick={() => { setSelectedAccount(acc); setAccountDropdownOpen(false); }}
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252D40] hover:text-[#4382DF] flex items-center justify-between cursor-pointer"
              >
                <span className="truncate">{acc}</span>
                {selectedAccount === acc && <Check className="w-3.5 h-3.5 text-[#4382DF]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 ml-auto">

        {/* Currency Dropdown */}
        <div className="relative">
          <button
            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#30363D] hover:border-slate-300 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 font-bold text-[10px]">$</div>
            <span>Currency</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {currencyDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#1C2333] rounded-xl shadow-lg border border-slate-200 dark:border-[#30363D] py-1 z-50">
              {['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => { setSelectedCurrency(curr); setCurrencyDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252D40] hover:text-[#4382DF] cursor-pointer"
                >
                  {curr}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Selector */}
        <div className="relative">
          <button
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1C2333] border border-slate-200 dark:border-[#30363D] hover:border-slate-300 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{selectedPeriod}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {periodDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-white dark:bg-[#1C2333] rounded-xl shadow-lg border border-slate-200 dark:border-[#30363D] py-1 z-50">
              {['02 2024', '01 2024', '12 2023', 'Custom Range...'].map((p) => (
                <button
                  key={p}
                  onClick={() => { setSelectedPeriod(p); setPeriodDropdownOpen(false); }}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252D40] hover:text-[#4382DF] cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-[#4382DF] hover:bg-[#112E81] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-98 disabled:opacity-70"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>Sync New ({lastSyncText})</span>
        </button>

        {/* Quick Add */}
        {onOpenQuickAdd && (
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#112E81] hover:bg-[#4647AE] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Entry</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <ThemeToggle />

        {/* User Avatar → Settings */}
        <div
          onClick={onOpenSettings}
          className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 dark:border-[#30363D] space-x-2 cursor-pointer hover:opacity-85 transition-opacity"
          title="Click to view Profile & Settings"
        >
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
            alt={user?.name || 'User'}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-[#AACCD6]"
          />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3] leading-tight">{user?.name || 'Alex Morgan'}</span>
            <span className="text-[10px] text-[#4382DF] font-medium flex items-center gap-1">
              <span>Settings</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-400 dark:text-slate-500">{user?.role || 'Pro Member'}</span>
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer"
          title="Log out"
        >
          <LogOut className="w-4 h-4" />
        </button>

      </div>
    </header>
  );
};
