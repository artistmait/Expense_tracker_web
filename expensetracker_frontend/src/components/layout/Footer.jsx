import { ShieldCheck, Lock, CheckCircle2, Globe, WalletCards } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
      <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-12">
        {/* Trust Badges Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-12 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C5EAD]/30 text-[#4BB8FA] flex items-center justify-center shrink-0 border border-[#4BB8FA]/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">256-Bit TLS Encryption</h4>
              <p className="text-xs text-slate-400">Institutional cryptographic standard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1591DC]/30 text-[#4BB8FA] flex items-center justify-center shrink-0 border border-[#1591DC]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">SOC-2 Type II Certified</h4>
              <p className="text-xs text-slate-400">Audited data integrity & privacy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Zero-Data Monetization</h4>
              <p className="text-xs text-slate-400">We never sell your financial records</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#2C5EAD]/30 text-[#4BB8FA] flex items-center justify-center shrink-0 border border-[#4BB8FA]/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Multi-Asset Synchrony</h4>
              <p className="text-xs text-slate-400">Real-time stock & expense intelligence</p>
            </div>
          </div>
        </div>

        {/* Links & Brand */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-10">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#2C5EAD] via-[#1591DC] to-[#4BB8FA] flex items-center justify-center text-white">
                <WalletCards className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">budgetmate</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Empowering individuals and smart investors to track expenses, automate monthly envelope budgets, and monitor wealth portfolios with bank-grade privacy.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#4BB8FA]">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>All Systems Operational • 99.99% Uptime</span>
            </div>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Capabilities</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#income" className="hover:text-white transition-colors">Income & Cashflow</a></li>
              <li><a href="#budgets" className="hover:text-white transition-colors">Category Budgets</a></li>
              <li><a href="#stocks" className="hover:text-white transition-colors">Stock Portfolio</a></li>
              <li><a href="#transactions" className="hover:text-white transition-colors">Expense Analytics</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Security & Trust</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#security" className="hover:text-white transition-colors">Security Architecture</a></li>
              <li><a href="#compliance" className="hover:text-white transition-colors">Privacy Charter</a></li>
              <li><a href="#audit" className="hover:text-white transition-colors">Third-party Audits</a></li>
              <li><a href="#recovery" className="hover:text-white transition-colors">Vault Backups</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Support</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><a href="#help" className="hover:text-white transition-colors">Knowledge Base</a></li>
              <li><a href="#api" className="hover:text-white transition-colors">Developer API</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Priority Help</a></li>
              <li><a href="#status" className="hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 BudgetMate Systems Inc. All rights reserved. Bank-grade security certified.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
