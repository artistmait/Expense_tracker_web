import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  User,
  Sparkles,
  CheckCircle2,
  AtSign,
  Wallet,
  Check
} from 'lucide-react';

export const AuthModal = () => {
  const { authModalOpen, authModalTab, setAuthModalTab, closeAuth, login, signup } = useAuth();
  
  // User profile fields pre-filled for easy testing with Maitreyee Puranik
  const [email, setEmail] = useState('maitreyee.puranik@budgetmate.io');
  const [username, setUsername] = useState('maitreyee');
  const [password, setPassword] = useState('Maitreyee123@');
  const [name, setName] = useState('Maitreyee Puranik');

  // Bank Sync Option during registration
  const [syncMockBank, setSyncMockBank] = useState(true);

  // Manual Initial Account Setup fields (if bank sync not chosen)
  const [accountName, setAccountName] = useState('Chase Sapphire Checking');
  const [accountType, setAccountType] = useState('checking');
  const [initialBalance, setInitialBalance] = useState('8420.00');

  // Location & Currency selection (always shown on signup)
  const [location, setLocation] = useState('India');

  const locationCurrencyMap = {
    'India': { currency: 'INR', symbol: '₹', flag: '🇮🇳', label: 'INR — Indian Rupee (₹)' },
    'United States': { currency: 'USD', symbol: '$', flag: '🇺🇸', label: 'USD — US Dollar ($)' },
    'European Union': { currency: 'EUR', symbol: '€', flag: '🇪🇺', label: 'EUR — Euro (€)' },
  };

  const selectedLocale = locationCurrencyMap[location] || locationCurrencyMap['India'];

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await signup({
          name,
          username,
          email,
          password,
          location,
          sync_mock_bank: syncMockBank,
          initialAccount: {
            account_name: syncMockBank ? 'Chase Sapphire Checking' : accountName,
            account_type: syncMockBank ? 'checking' : accountType,
            initial_balance: syncMockBank ? '8420.00' : initialBalance,
            currency: selectedLocale.currency,
          },
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMaitreyee = () => {
    setEmail('maitreyee.puranik@budgetmate.io');
    setPassword('Maitreyee123@');
    setLoading(true);
    setTimeout(() => {
      login('maitreyee.puranik@budgetmate.io', 'Maitreyee123@');
      setLoading(false);
    }, 200);
  };

  const handleDemoAlex = () => {
    setEmail('alex.morgan@budgetmate.io');
    setPassword('password123');
    setLoading(true);
    setTimeout(() => {
      login('alex.morgan@budgetmate.io', 'password123');
      setLoading(false);
    }, 200);
  };

  const inputClasses = "w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-[#30363D] focus:outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#AACCD6]/50 dark:focus:ring-[#4382DF]/30 transition-all text-slate-800 dark:text-[#E6EDF3] bg-slate-50/50 dark:bg-[#0D1117] placeholder:text-slate-400 dark:placeholder:text-slate-600";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#112E81]/40 dark:bg-black/70 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="fixed inset-0" onClick={closeAuth} />

      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-[#161B22] rounded-2xl shadow-2xl border border-[#AACCD6]/60 dark:border-[#30363D] overflow-hidden z-10 transition-all">
        <div className="h-2 bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF]" />

        <div className="px-6 pt-5 pb-3.5 flex items-center justify-between border-b border-slate-100 dark:border-[#30363D]">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#112E81] flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#AACCD6]" />
            </div>
            <div>
              <span className="font-bold text-lg text-[#112E81] dark:text-[#E6EDF3] tracking-tight">BudgetMate</span>
              <span className="text-[11px] block font-medium text-slate-400 dark:text-slate-500">Secure Client Portal</span>
            </div>
          </div>
          <button onClick={closeAuth} className="p-1.5 rounded-lg text-slate-400 hover:text-[#112E81] dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#21262D] transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Demo Access */}
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-[#AACCD6]/20 via-[#4382DF]/10 to-[#4647AE]/15 dark:from-[#1C2333] dark:via-[#161B22] dark:to-[#1C2333] border border-[#4382DF]/30 dark:border-[#30363D]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#4382DF]" />
                <span className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3]">Instant Demo Logins</span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">1-click test users</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={handleDemoMaitreyee} disabled={loading} className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#112E81] hover:bg-[#4647AE] text-white text-[11px] font-semibold shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer">
                <span>Maitreyee Puranik</span>
                <ArrowRight className="w-3 h-3" />
              </button>
              <button type="button" onClick={handleDemoAlex} disabled={loading} className="flex-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-[#1C2333] hover:bg-slate-100 dark:hover:bg-[#252D40] text-[#112E81] dark:text-[#E6EDF3] border border-slate-200 dark:border-[#30363D] text-[11px] font-semibold shadow-xs transition-all flex items-center justify-center space-x-1 cursor-pointer">
                <span>Alex Morgan</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-slate-100 dark:bg-[#0D1117] p-1 rounded-xl mb-4 border border-transparent dark:border-[#30363D]">
            <button type="button" onClick={() => { setAuthModalTab('login'); setErrorMessage(''); }} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${authModalTab === 'login' ? 'bg-white dark:bg-[#21262D] text-[#112E81] dark:text-[#E6EDF3] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              Sign In
            </button>
            <button type="button" onClick={() => { setAuthModalTab('signup'); setErrorMessage(''); }} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${authModalTab === 'signup' ? 'bg-white dark:bg-[#21262D] text-[#112E81] dark:text-[#E6EDF3] shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
              Create Account
            </button>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalTab === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-200 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Maitreyee Puranik" className={inputClasses} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-200 mb-1">Username</label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="maitreyee" className={inputClasses} />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-200 mb-1">
                {authModalTab === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type={authModalTab === 'login' ? 'text' : 'email'} required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={authModalTab === 'login' ? 'maitreyee or email' : 'maitreyee.puranik@budgetmate.io'} className={inputClasses} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-200">Password</label>
                {authModalTab === 'login' && <span className="text-[11px] text-[#4382DF] hover:underline cursor-pointer">Forgot password?</span>}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••••••" className={inputClasses} />
              </div>
            </div>

            {/* ── Location & Currency + Bank Setup (signup only) ── */}
            {authModalTab === 'signup' && (
              <div className="pt-3 pb-1 border-t border-slate-100 dark:border-[#30363D] space-y-3">

                {/* Location selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#112E81] dark:text-slate-200 mb-1.5">
                    📍 Your Location &amp; Bank Region
                  </label>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2 leading-relaxed">
                    This sets your default currency — your bank is assumed to reside in this region.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(locationCurrencyMap).map(([loc, info]) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setLocation(loc)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col items-center gap-1 text-center ${
                          location === loc
                            ? 'bg-gradient-to-br from-[#112E81] to-[#4647AE] border-[#4382DF] text-white shadow-md'
                            : 'bg-slate-50 dark:bg-[#0D1117] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-slate-400 hover:border-[#4382DF]/60'
                        }`}
                      >
                        <span className="text-xl leading-none">{info.flag}</span>
                        <span className="text-[10px] font-bold leading-tight">{loc === 'European Union' ? 'EU' : loc}</span>
                        <span className={`text-[10px] font-mono font-bold ${location === loc ? 'text-[#AACCD6]' : 'text-[#4382DF]'}`}>
                          {info.symbol} {info.currency}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Active currency badge */}
                  <div className="mt-2.5 flex items-center gap-2 p-2 rounded-lg bg-[#AACCD6]/15 dark:bg-[#1C2333] border border-[#AACCD6]/40 dark:border-[#30363D]">
                    <span className="text-base">{selectedLocale.flag}</span>
                    <span className="flex-1 text-[11px] font-semibold text-[#112E81] dark:text-[#E6EDF3]">
                      Active Currency: {selectedLocale.label}
                    </span>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </div>

                {/* Bank Connection */}
                <div className="flex items-center space-x-2">
                  <Wallet className="w-4 h-4 text-[#4382DF]" />
                  <span className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3]">Bank Connection &amp; Account Setup</span>
                </div>

                {/* Mock Bank Sync toggle */}
                <div
                  onClick={() => setSyncMockBank(!syncMockBank)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    syncMockBank
                      ? 'bg-gradient-to-r from-[#AACCD6]/20 to-[#4382DF]/10 dark:from-[#1C2333] dark:to-[#21262D] border-[#4382DF] dark:border-[#4382DF]/80 shadow-xs'
                      : 'bg-slate-50 dark:bg-[#0D1117] border-slate-200 dark:border-[#30363D]'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center mt-0.5 ${syncMockBank ? 'bg-[#4382DF] text-white' : 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#161B22]'}`}>
                    {syncMockBank && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3] flex items-center gap-1.5">
                      <span>Sync with Mock Bank API (Recommended)</span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-1.5 rounded font-semibold">Instant Feeds</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Auto-link Chase, Amex and Vanguard feeds with categorized dummy transactions.
                    </p>
                  </div>
                </div>

                {/* Manual account form */}
                {!syncMockBank && (
                  <div className="p-3 bg-slate-50 dark:bg-[#0D1117] rounded-xl border border-slate-200 dark:border-[#30363D] space-y-2.5 animate-fadeIn">
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Manual Starting Account:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Account Name</label>
                        <input type="text" required value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Primary Checking" className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Account Type</label>
                        <select value={accountType} onChange={(e) => setAccountType(e.target.value)} className="w-full px-2 py-1 text-xs rounded border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3]">
                          <option value="checking">Checking</option>
                          <option value="savings">Savings / Vault</option>
                          <option value="credit_card">Credit Card</option>
                          <option value="investment">Investment</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Initial Balance ({selectedLocale.symbol})</label>
                        <input type="number" step="0.01" required value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Currency (auto-set)</label>
                        <div className="w-full px-2.5 py-1 text-xs rounded border border-[#4382DF]/50 bg-[#AACCD6]/10 dark:bg-[#1C2333] text-[#112E81] dark:text-[#E6EDF3] font-semibold">
                          {selectedLocale.flag} {selectedLocale.currency} — {selectedLocale.symbol}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF] hover:opacity-95 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{authModalTab === 'login' ? 'Sign In to Dashboard' : 'Complete Setup & Open Dashboard'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#30363D] flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-bit TLS encrypted session • Open Banking Simulator</span>
          </div>
        </div>
      </div>
    </div>
  );
};
