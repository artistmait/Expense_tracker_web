import React from 'react';
import { LandingNav } from './LandingNav';
import { LandingHero } from './LandingHero';
import { TrustLogos } from './TrustLogos';
import { FeatureCards } from './FeatureCards';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, CheckCircle, ArrowRight, Zap, RefreshCw, BarChart3, Database } from 'lucide-react';

export const LandingPage = () => {
  const { openAuth, loginDemo } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-hero selection:bg-[#AACCD6] selection:text-[#112E81]">
      
      {/* Top Navigation */}
      <LandingNav />

      {/* Main Landing Sections */}
      <main className="flex-1">
        {/* Hero Section */}
        <LandingHero />

        {/* Bank & Trust Logos */}
        <TrustLogos />

        {/* 3 Interactive Reference Feature Cards */}
        <FeatureCards />

        {/* Security & Architecture Deep-dive Section */}
        <section id="security" className="w-full py-16 bg-white dark:bg-[#0D1117] border-t border-slate-200/80 dark:border-[#30363D] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-[#112E81]/5 dark:bg-[#1C2333] text-[#112E81] dark:text-[#E6EDF3] text-xs font-bold mb-4">
                  <Lock className="w-3.5 h-3.5 text-[#4382DF]" />
                  <span>Institutional Defense</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
                  Engineered with Institutional-Grade Safeguards
                </h2>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  BudgetMate adheres to strict banking guidelines. All financial data is client-side encrypted before storage, ensuring zero-knowledge privacy for your investments and transaction histories.
                </p>

                <div className="mt-6 space-y-3.5">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3]">Read-only Account Sync</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">We cannot execute trades or initiate wire transfers on your behalf.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3]">AES-256 GCM Cryptographic Vault</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Industry standard cryptographic envelope encryption for every record.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3]">Continuous Anomaly Auditing</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Real-time alerts for unexpected subscription charges or double billings.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => openAuth('signup')}
                    className="px-5 py-2.5 rounded-xl bg-[#112E81] hover:bg-[#4647AE] text-white text-xs sm:text-sm font-semibold shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer"
                  >
                    <span>Read Full Security Whitepaper</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Interactive preview box */}
              <div className="bg-[#F6F9FD] dark:bg-[#161B22] border border-[#AACCD6]/70 dark:border-[#30363D] rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-[#4382DF]" />
                    <span className="text-sm font-bold text-[#112E81] dark:text-[#E6EDF3]">Security Compliance Matrix</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                    ALL PASSING
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-white dark:bg-[#1C2333] rounded-xl border border-slate-200/70 dark:border-[#30363D] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-[#E6EDF3]">SOC 2 Type II Certified</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">Independent auditor certification</div>
                    </div>
                    <span className="text-xs font-bold text-[#4382DF]">Verified</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#1C2333] rounded-xl border border-slate-200/70 dark:border-[#30363D] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-[#E6EDF3]">GDPR & CCPA Compliant</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">Data deletion & export controls</div>
                    </div>
                    <span className="text-xs font-bold text-[#4382DF]">Active</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-[#1C2333] rounded-xl border border-slate-200/70 dark:border-[#30363D] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 dark:text-[#E6EDF3]">Open Banking Protocol 2.1</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">Plaid, MX & Yodlee connectors</div>
                    </div>
                    <span className="text-xs font-bold text-[#4382DF]">Connected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="w-full py-16 bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF] text-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Gain Complete Command of Your Wealth?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
              Join thousands of professionals who replaced cluttered spreadsheets with BudgetMate.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => openAuth('signup')}
                className="px-7 py-3.5 rounded-xl bg-white text-[#112E81] hover:bg-slate-100 font-bold text-sm sm:text-base shadow-lg transition-all flex items-center space-x-2 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4 text-[#4382DF]" />
              </button>
              <button
                onClick={loginDemo}
                className="px-7 py-3.5 rounded-xl bg-transparent hover:bg-white/10 text-white font-semibold text-sm sm:text-base border border-white/30 transition-all cursor-pointer"
              >
                Launch Instant Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#0D2260] text-slate-400 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-white">
            <ShieldCheck className="w-4 h-4 text-[#AACCD6]" />
            <span className="font-bold">BudgetMate</span>
            <span className="text-slate-400 text-[11px]">© 2026 BudgetMate Intelligence Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-300">
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#security" className="hover:text-white transition-colors">Security Disclosure</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
