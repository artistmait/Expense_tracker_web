import { useState } from 'react';
import { 
  ArrowUpRight, 
  PlusCircle, 
  TrendingUp, 
  Wallet, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export function WelcomeBanner({ user, metrics, onOpenQuickAdd }) {
  const [showBalance, setShowBalance] = useState(true);

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="w-full relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1B3B6F] via-[#2C5EAD] to-[#1591DC] text-white p-5 sm:p-7 shadow-xl shadow-[#2C5EAD]/15 border border-[#4BB8FA]/30">
      
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-[#4BB8FA]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 rounded-full bg-[#C4E2F5]/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left: Greeting & Net Worth Summary */}
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-white border border-white/20">
              <Sparkles className="w-3 h-3 text-[#4BB8FA]" />
              {user?.tier || 'Pro Member'}
            </span>
            <span className="text-xs text-[#C4E2F5] flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-[#4BB8FA]" />
              {user?.securityStatus || 'Bank-Grade 256-Bit Encrypted'}
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{getGreetingTime()}, {user?.name || 'Alex'}</span>
              <span className="inline-block animate-bounce text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#C4E2F5]/90 mt-0.5">
              Your financial cashflow is optimal. You retained <span className="font-bold text-white">59.1%</span> of total earnings this billing cycle.
            </p>
          </div>
        </div>

        {/* Center: Consolidated Net Worth Pill */}
        <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/20 flex items-center gap-5 shadow-xs">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#C4E2F5] font-semibold">
              <span>Net Worth</span>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="hover:text-white transition-colors cursor-pointer"
                aria-label={showBalance ? "Hide balance" : "Show balance"}
              >
                {showBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
              {showBalance ? (
                `$${metrics?.netWorth?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              ) : (
                '$ ••••••••'
              )}
            </div>
          </div>

          <div className="pl-4 border-l border-white/20 text-right">
            <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/40">
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
              +{metrics?.netWorthChange}%
            </span>
            <span className="block text-[10px] text-[#C4E2F5] mt-0.5">This Month</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#2C5EAD] font-bold text-xs shadow-sm hover:bg-[#EDF6FC] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#1591DC]" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('income')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer backdrop-blur-sm"
          >
            <Wallet className="w-4 h-4 text-[#4BB8FA]" />
            <span>Add Income</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('stock')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A192F]/60 hover:bg-[#0A192F]/80 text-[#C4E2F5] hover:text-white font-bold text-xs border border-white/15 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-[#4BB8FA]" />
            <span>Log Trade</span>
          </button>
        </div>

      </div>
    </div>
  );
}
