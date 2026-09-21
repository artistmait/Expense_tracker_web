import React, { useState } from 'react';
import { RefreshCw, TrendingUp, AlertTriangle, CheckCircle2, Shield, Layers, ArrowUpRight, Lock } from 'lucide-react';

export const FeatureCards = () => {
  const [activeCard, setActiveCard] = useState(1);

  return (
    <section id="features" className="w-full py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Subtitle */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112E81] tracking-tight">
          Next-Generation Architecture for Wealth Clarity
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Engineered to give you instant intelligence, proactive spend limits, and automated cashflow forecasts.
        </p>
      </div>

      {/* 3 Reference Preview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Card 1: Real-time Multi-account Sync */}
        <div 
          onClick={() => setActiveCard(0)}
          className={`glass-card rounded-2xl p-6 transition-all duration-300 cursor-pointer border ${
            activeCard === 0 
              ? 'border-[#4382DF] shadow-lg ring-2 ring-[#4382DF]/20 -translate-y-1' 
              : 'border-slate-200/80 hover:border-[#AACCD6] hover:-translate-y-1'
          }`}
        >
          {/* Card Mockup Illustration */}
          <div className="bg-[#F6F9FD] rounded-xl p-4 mb-5 border border-slate-100 relative overflow-hidden h-44 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-[10px] font-mono text-slate-400">SYNC STATUS: LIVE</span>
            </div>

            {/* Mini connected banks mockup */}
            <div className="space-y-2 my-auto">
              <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-[#112E81] text-white flex items-center justify-center text-[10px] font-bold">
                    C
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#112E81]">Chase Platinum</div>
                    <div className="text-[10px] text-slate-400">•••• 8492</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800">$48,290.00</span>
              </div>

              <div className="bg-white p-2.5 rounded-lg border border-slate-100 flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded bg-[#4382DF] text-white flex items-center justify-center text-[10px] font-bold">
                    A
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#112E81]">Amex Reserve</div>
                    <div className="text-[10px] text-slate-400">•••• 3124</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-800">$12,450.00</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                4 Feeds Synced
              </span>
              <span className="text-slate-400">Zero-lag webhook</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#112E81] flex items-center justify-between">
            <span>Real-time Multi-account Sync</span>
            <ArrowUpRight className="w-4 h-4 text-[#4382DF]" />
          </h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Consolidate your high-yield checking, brokerage, and corporate credit cards into one unified encrypted ledger.
          </p>
        </div>

        {/* Card 2: Predictive Cash Flow Forecasting */}
        <div 
          onClick={() => setActiveCard(1)}
          className={`glass-card rounded-2xl p-6 transition-all duration-300 cursor-pointer border ${
            activeCard === 1 
              ? 'border-[#4382DF] shadow-lg ring-2 ring-[#4382DF]/20 -translate-y-1' 
              : 'border-slate-200/80 hover:border-[#AACCD6] hover:-translate-y-1'
          }`}
        >
          {/* Card Mockup Illustration */}
          <div className="bg-[#F6F9FD] rounded-xl p-4 mb-5 border border-slate-100 relative overflow-hidden h-44 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#112E81]">Predictive Cash-flow</span>
              <span className="text-[10px] bg-[#4382DF]/10 text-[#4382DF] px-2 py-0.5 rounded-full font-semibold">
                AI Forecast
              </span>
            </div>

            {/* Mini wave chart graphic */}
            <div className="relative h-20 w-full my-auto flex items-end">
              <svg viewBox="0 0 100 45" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="miniAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4382DF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#AACCD6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 35 Q 25 15, 50 22 T 100 8 L 100 45 L 0 45 Z"
                  fill="url(#miniAreaGrad)"
                />
                <path
                  d="M 0 35 Q 25 15, 50 22 T 100 8"
                  fill="none"
                  stroke="#4382DF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 40 Q 30 25, 60 30 T 100 18"
                  fill="none"
                  stroke="#AACCD6"
                  strokeWidth="2"
                  strokeDasharray="3 3"
                />
                {/* Floating tooltip */}
                <circle cx="65" cy="18" r="3.5" fill="#4382DF" stroke="#ffffff" strokeWidth="1.5" />
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>Expected Q4: <strong className="text-[#112E81]">+$14,250</strong></span>
              <span className="text-emerald-600 font-bold">+18.4% YoY</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#112E81] flex items-center justify-between">
            <span>Predictive Cash Flow Forecasting</span>
            <ArrowUpRight className="w-4 h-4 text-[#4382DF]" />
          </h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Machine learning projections evaluate your recurring expenses and revenue streams to anticipate liquidity 6 months ahead.
          </p>
        </div>

        {/* Card 3: Granular Budget Guardrails */}
        <div 
          onClick={() => setActiveCard(2)}
          className={`glass-card rounded-2xl p-6 transition-all duration-300 cursor-pointer border ${
            activeCard === 2 
              ? 'border-[#4382DF] shadow-lg ring-2 ring-[#4382DF]/20 -translate-y-1' 
              : 'border-slate-200/80 hover:border-[#AACCD6] hover:-translate-y-1'
          }`}
        >
          {/* Card Mockup Illustration */}
          <div className="bg-[#F6F9FD] rounded-xl p-4 mb-5 border border-slate-100 relative overflow-hidden h-44 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#112E81]">Spend Limit Alerts</span>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 border border-amber-200">
                <AlertTriangle className="w-2.5 h-2.5" />
                Active Alert
              </span>
            </div>

            {/* Alert banner inside card */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 p-3 rounded-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Entertainment limit</span>
                </div>
                <span>$3,150.00</span>
              </div>
              <div className="w-full h-2 bg-amber-200/60 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full w-[88%]" />
              </div>
              <div className="flex justify-between text-[10px] text-amber-700 font-medium mt-1.5">
                <span>Cap: $3,500.00</span>
                <span>88% Reached</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between">
              <span>Automatic notification sent</span>
              <span className="font-semibold text-[#112E81]">Rule #12</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-[#112E81] flex items-center justify-between">
            <span>Granular Budget Guardrails</span>
            <ArrowUpRight className="w-4 h-4 text-[#4382DF]" />
          </h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Multi-tier categorical caps prevent lifestyle inflation with proactive push alerts and customizable thresholds.
          </p>
        </div>

      </div>

    </section>
  );
};
