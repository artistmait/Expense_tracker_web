import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Receipt,
  PieChart,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';

export const DashboardSidebar = ({ activeNav, onSelectNav }) => {
  const { logout } = useAuth();

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'accounts', icon: CreditCard, label: 'Accounts' },
    { id: 'ledger', icon: Receipt, label: 'Ledger' },
    { id: 'planning', icon: PieChart, label: 'Budgets' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-16 lg:w-18 bg-white dark:bg-[#161B22] border-r border-slate-200/80 dark:border-[#30363D] flex flex-col items-center py-5 shrink-0 select-none z-30 min-h-screen transition-colors duration-200">

      {/* BudgetMate Shield Logo */}
      <div
        onClick={() => onSelectNav('dashboard')}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#112E81] via-[#4647AE] to-[#4382DF] flex items-center justify-center text-white shadow-md shadow-[#4382DF]/20 cursor-pointer hover:scale-105 transition-transform mb-8"
        title="BudgetMate Command Center"
      >
        <ShieldCheck className="w-5 h-5 text-[#AACCD6]" />
      </div>

      {/* Main Nav Icon List */}
      <nav className="flex-1 flex flex-col items-center space-y-3.5 w-full px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectNav(item.id)}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                isActive
                  ? 'bg-[#4382DF] text-white shadow-md shadow-[#4382DF]/30'
                  : 'text-slate-400 dark:text-slate-500 hover:text-[#112E81] dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#1C2333]'
              }`}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              {/* Tooltip */}
              <span className="absolute left-14 bg-[#112E81] dark:bg-[#1C2333] dark:border dark:border-[#30363D] text-white text-[11px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Help & Logout */}
      <div className="flex flex-col items-center space-y-3 pt-4 border-t border-slate-100 dark:border-[#30363D] w-full px-2">
        <button
          onClick={() => alert('BudgetMate 24/7 Priority Support is active. Help desk online.')}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-[#112E81] dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#1C2333] transition-colors cursor-pointer group relative"
          title="Support & Documentation"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="absolute left-14 bg-[#112E81] dark:bg-[#1C2333] text-white text-[11px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
            Support
          </span>
        </button>

        <button
          onClick={logout}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors cursor-pointer group relative"
          title="Log Out"
        >
          <LogOut className="w-5 h-5" />
          <span className="absolute left-14 bg-rose-600 text-white text-[11px] font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md z-50">
            Log Out
          </span>
        </button>
      </div>

    </aside>
  );
};
