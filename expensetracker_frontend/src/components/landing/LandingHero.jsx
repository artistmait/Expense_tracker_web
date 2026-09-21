import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, ArrowRight, Play, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export const LandingHero = () => {
  const { openAuth, loginDemo } = useAuth();

  return (
    <section className="relative pt-12 pb-16 sm:pt-20 sm:pb-20 overflow-hidden">
      
      {/* Background radial glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-60">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#AACCD6]/30 rounded-full blur-3xl" />
        <div className="absolute -top-20 right-1/4 w-96 h-96 bg-[#4382DF]/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* SOC2 Certified / 256-bit Encrypted Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#AACCD6]/70 shadow-sm mb-6 hover:border-[#4382DF] transition-all cursor-default">
          <div className="w-4 h-4 rounded-full bg-[#112E81] flex items-center justify-center text-[#AACCD6]">
            <ShieldCheck className="w-3 h-3" />
          </div>
          <span className="text-xs font-semibold text-[#112E81] tracking-wide">
            SOC2 Certified / 256-bit Encrypted
          </span>
        </div>

        {/* Hero Title Matching the Reference Screen */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#112E81] tracking-tight leading-[1.12]">
          Intelligent Wealth & Expense Intelligence for Modern Professionals
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Bank-grade automated synchronization via Plaid/Open Banking, real-time audit trails, and automated tax-ready categorization for complete financial command.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-4">
          
          {/* Primary CTA: Get Started Free */}
          <button
            onClick={() => openAuth('signup')}
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF] hover:opacity-95 text-white font-bold text-sm sm:text-base shadow-lg shadow-[#4382DF]/25 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center space-x-2.5 cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Secondary CTA: Explore Features / Demo */}
          <button
            onClick={loginDemo}
            className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl bg-white hover:bg-slate-50 text-[#112E81] font-bold text-sm sm:text-base border border-[#AACCD6] hover:border-[#4382DF] shadow-sm transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#4382DF]" />
            <span>Explore Live Demo</span>
          </button>

        </div>

        {/* Micro highlights underneath */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Instant multi-currency support
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Zero-knowledge telemetry
          </span>
        </div>

      </div>

    </section>
  );
};
