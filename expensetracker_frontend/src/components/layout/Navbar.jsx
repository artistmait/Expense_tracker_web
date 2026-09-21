import { useState } from 'react';
import { 
  WalletCards, 
  Search, 
  Bell, 
  Plus, 
  Menu, 
  X, 
  TrendingUp, 
  Wallet, 
  PieChart, 
  LayoutDashboard, 
  ShieldCheck
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { ThemeToggle } from '../common/ThemeToggle';

export function Navbar({ activeTab, onSelectTab, onOpenQuickAdd, user }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Wallet },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'stocks', label: 'Stocks & Wealth', icon: TrendingUp },
    { id: 'security', label: 'Vault & Security', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#161B22]/90 backdrop-blur-xl border-b border-[#C4E2F5]/80 dark:border-[#30363D] shadow-[0_2px_15px_-4px_rgba(44,94,173,0.06)] transition-colors">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand Logo & Live status */}
          <div className="flex items-center gap-8">
            <div 
              onClick={() => onSelectTab('overview')} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2C5EAD] via-[#1591DC] to-[#4BB8FA] flex items-center justify-center text-white shadow-md shadow-[#2C5EAD]/20 group-hover:scale-105 transition-transform">
                <WalletCards className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#2C5EAD] via-[#1591DC] to-[#2C5EAD] bg-clip-text text-transparent">
                  budget<span className="text-[#1591DC]">mate</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="System Live" />
              </div>
            </div>

            {/* Center Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/70 dark:bg-[#0D1117] p-1 rounded-2xl border border-slate-200/60 dark:border-[#30363D]">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-[#1C2333] text-[#2C5EAD] dark:text-[#4BB8FA] shadow-xs shadow-slate-200 dark:shadow-none'
                        : 'text-slate-600 dark:text-slate-400 hover:text-[#2C5EAD] dark:hover:text-[#4BB8FA] hover:bg-white/60 dark:hover:bg-[#161B22]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1591DC]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            
            {/* Sleek Search */}
            <div className="hidden md:flex items-center relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search stocks, transactions..."
                className="w-52 xl:w-64 pl-9 pr-8 py-1.5 bg-slate-50 dark:bg-[#0D1117] hover:bg-slate-100/80 dark:hover:bg-[#161B22] focus:bg-white dark:focus:bg-[#161B22] text-xs font-medium text-slate-800 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl border border-slate-200/80 dark:border-[#30363D] focus:border-[#1591DC] focus:ring-2 focus:ring-[#C4E2F5] dark:focus:ring-[#1591DC]/30 transition-all outline-none"
              />
              <kbd className="absolute right-2.5 text-[10px] text-slate-400 dark:text-slate-500 bg-white dark:bg-[#1C2333] px-1.5 py-0.5 rounded border border-slate-200 dark:border-[#30363D] shadow-2xs font-mono">
                ⌘K
              </kbd>
            </div>

            {/* Add Transaction Button */}
            <Button
              variant="gradient"
              size="sm"
              icon={Plus}
              onClick={onOpenQuickAdd}
              className="font-bold text-xs shadow-sm hover:shadow-[#1591DC]/30 py-2 px-3.5"
            >
              Add Entry
            </Button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-[#30363D] hover:border-[#1591DC]/50 bg-white dark:bg-[#1C2333] hover:bg-[#EDF6FC] dark:hover:bg-[#252D40] text-slate-600 dark:text-slate-300 hover:text-[#2C5EAD] dark:hover:text-[#4BB8FA] flex items-center justify-center transition-colors relative cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#1591DC] ring-2 ring-white dark:ring-[#161B22]" />
              </button>

              {/* Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#161B22] rounded-2xl shadow-xl border border-[#C4E2F5] dark:border-[#30363D] p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#30363D]">
                    <span className="text-xs font-bold text-slate-900 dark:text-[#E6EDF3]">Security & Budget Alerts</span>
                    <Badge variant="accent" size="xs">2 New</Badge>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-[#30363D] text-xs">
                    <div className="py-2.5">
                      <p className="font-semibold text-slate-800 dark:text-[#E6EDF3]">Monthly Envelope Budget</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">You've reached 68% of your September limit.</p>
                    </div>
                    <div className="py-2.5">
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">Dividend Credited</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">+$184.50 from NVIDIA Corp (NVDA).</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="w-full text-center text-xs font-semibold text-[#1591DC] hover:text-[#2C5EAD] dark:hover:text-[#4BB8FA] pt-2 mt-1 cursor-pointer block"
                  >
                    Dismiss all
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <ThemeToggle />

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#30363D]">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128"}
                alt={user?.name || "User"}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#4BB8FA]/60"
              />
              <div className="hidden xl:block text-left leading-none">
                <p className="text-xs font-bold text-slate-800">{user?.name || "Alex Morgan"}</p>
                <span className="text-[10px] text-[#1591DC] font-semibold">Pro Tier</span>
              </div>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#2C5EAD] hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#C4E2F5] px-4 pt-2 pb-5 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold ${
                  isActive ? 'bg-[#C4E2F5]/50 text-[#2C5EAD]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-[#1591DC]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
