import React from 'react';
import { Shield, Lock, Award, CheckCircle, Database, CreditCard } from 'lucide-react';

export const TrustLogos = () => {
  return (
    <div className="w-full py-8 border-y border-slate-200/70 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Trust Header text */}
        <div className="text-center mb-6">
          <p className="text-xs sm:text-sm font-semibold tracking-wide text-slate-500">
            Bank-grade <span className="text-[#112E81] font-bold">256-bit AES encryption</span> • Trusted by <span className="text-[#4382DF] font-bold">50,000+ users & wealth managers</span>
          </p>
        </div>

        {/* Logos Bar */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all duration-300">
          
          {/* Plaid */}
          <div className="flex items-center space-x-2 font-black text-lg tracking-widest text-[#112E81]">
            <div className="w-6 h-6 rounded bg-[#112E81] flex items-center justify-center text-white text-xs font-serif font-black">
              ::
            </div>
            <span>PLAID</span>
          </div>

          {/* Visa */}
          <div className="flex items-center space-x-1.5 font-black italic text-xl tracking-wider text-[#4382DF]">
            <CreditCard className="w-5 h-5 not-italic" />
            <span>VISA</span>
          </div>

          {/* Mastercard */}
          <div className="flex items-center space-x-1 font-bold text-sm text-[#112E81]">
            <div className="flex -space-x-2">
              <div className="w-5 h-5 rounded-full bg-[#4647AE]/80" />
              <div className="w-5 h-5 rounded-full bg-[#4382DF]/80" />
            </div>
            <span className="font-semibold text-xs tracking-tight">mastercard</span>
          </div>

          {/* AWS */}
          <div className="flex items-center space-x-1.5 font-bold text-base text-slate-700">
            <Database className="w-4 h-4 text-[#4647AE]" />
            <span>aws</span>
          </div>

          {/* Security Audit ds1 */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Security Audit ds1</span>
          </div>

          {/* ISO 27001 */}
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#112E81] bg-[#AACCD6]/20 px-2.5 py-1 rounded-md border border-[#AACCD6]/60">
            <Award className="w-3.5 h-3.5 text-[#4382DF]" />
            <span>ISO 27001</span>
          </div>

        </div>
      </div>
    </div>
  );
};
