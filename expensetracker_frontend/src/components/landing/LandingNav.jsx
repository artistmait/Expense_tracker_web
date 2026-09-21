import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { ShieldCheck, ChevronDown, ArrowRight, Sparkles, LogIn } from 'lucide-react';

export const LandingNav = () => {
  const { openAuth, isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#161B22]/85 backdrop-blur-md border-b border-[#AACCD6]/40 dark:border-[#30363D] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#112E81] via-[#4647AE] to-[#4382DF] flex items-center justify-center text-white shadow-md shadow-[#4382DF]/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-[#AACCD6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[#112E81] dark:text-[#E6EDF3] flex items-center gap-1">
                BudgetMate
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#4382DF]" />
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 -mt-1 uppercase tracking-wider">Enterprise Wealth</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button className="flex items-center space-x-1 hover:text-[#4382DF] transition-colors cursor-pointer">
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>
            <a href="#security" className="hover:text-[#4382DF] transition-colors">
              Security & Compliance
            </a>
            <a href="#pricing" className="hover:text-[#4382DF] transition-colors">
              Pricing
            </a>
            <a href="#features" className="hover:text-[#4382DF] transition-colors">
              Platform Features
            </a>
          </nav>
        </div>

        {/* Right CTA Actions & Theme Toggle */}
        <div className="flex items-center space-x-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <button
              onClick={() => {}}
              className="px-4 py-2 rounded-xl bg-[#4382DF] hover:bg-[#112E81] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#4382DF]/20 transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={() => openAuth('login')}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#112E81] dark:text-[#E6EDF3] hover:text-[#4382DF] hover:bg-[#AACCD6]/20 dark:hover:bg-[#1C2333] transition-all items-center space-x-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
              
              <button
                onClick={() => openAuth('signup')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-[#4382DF] hover:bg-[#112E81] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#4382DF]/25 hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
