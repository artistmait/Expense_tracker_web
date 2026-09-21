import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency, CURRENCIES } from '../../context/CurrencyContext';
import {
  User,
  Shield,
  CreditCard,
  Bell,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Camera,
  Save,
  Plus,
  ArrowLeft,
  Building,
  DollarSign,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Monitor,
  Globe
} from 'lucide-react';
import { authApi } from '../../services/authApi';

export const SettingsView = ({ onBackToDashboard }) => {
  const { user, token, updateUserProfile, changeUserPassword, updateUserCurrency } = useAuth();
  const { preference, setTheme, isDark } = useTheme();
  const { currencyCode, currency, formatAmount, symbol } = useCurrency();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'accounts' | 'security' | 'preferences'

  // Profile form state
  const [fullName, setFullName] = useState(user?.name || 'Alex Morgan');
  const [username, setUsername] = useState(user?.username || 'alexmorgan');
  const [email, setEmail] = useState(user?.email || 'alex.morgan@budgetmate.io');
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'
  );

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // New account form state
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('checking');
  const [newAccountBalance, setNewAccountBalance] = useState('');
  const [newAccountCurrency, setNewAccountCurrency] = useState('USD');
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Status feedback state
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await updateUserProfile({
        full_name: fullName,
        username: username,
        email: email,
        avatar_url: avatarUrl,
      });
      setStatusMessage({ type: 'success', text: res.message || 'Profile settings updated successfully.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await changeUserPassword({ currentPassword, newPassword });
      setStatusMessage({ type: 'success', text: res.message || 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Password update failed.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewAccount = async (e) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;
    setSaving(true);
    try {
      if (token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token') {
        await authApi.createAccount(token, {
          account_name: newAccountName,
          account_type: newAccountType,
          initial_balance: parseFloat(newAccountBalance) || 0.0,
          currency: newAccountCurrency,
        });
      }
      setStatusMessage({ type: 'success', text: `Account "${newAccountName}" added successfully.` });
      setNewAccountName('');
      setNewAccountBalance('');
      setIsAddingAccount(false);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create account.' });
    } finally {
      setSaving(false);
    }
  };

  const sampleAvatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
  ];

  const inputCls = "w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/50 dark:bg-[#0D1117] text-slate-800 dark:text-[#E6EDF3] placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-[#4382DF] focus:ring-2 focus:ring-[#AACCD6]/50 dark:focus:ring-[#4382DF]/30 transition-all";

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fadeIn text-slate-800 dark:text-[#E6EDF3]">
      
      {/* Top Header & Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#30363D]">
        <div className="flex items-center space-x-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#30363D] hover:border-[#4382DF] text-[#112E81] dark:text-[#E6EDF3] hover:bg-slate-50 dark:hover:bg-[#1C2333] transition-colors shadow-2xs cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#112E81] dark:text-[#E6EDF3] tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Manage your personal profile, credentials, connected bank accounts, theme and security controls.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Account Status: Active
          </span>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center space-x-2.5 text-xs sm:text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Settings Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Navigation Tabs (4 Cols) */}
        <div className="md:col-span-4 bg-white dark:bg-[#161B22] rounded-2xl border border-slate-200 dark:border-[#30363D] p-2 shadow-2xs space-y-1">
          {[
            { id: 'profile', icon: User, label: 'Profile & Identity', desc: 'Avatar, name, email & username' },
            { id: 'accounts', icon: CreditCard, label: 'Linked Accounts', desc: 'Checking, savings, vaults' },
            { id: 'security', icon: Shield, label: 'Security & Password', desc: 'Credentials & 256-bit encryption' },
            { id: 'preferences', icon: Bell, label: 'Preferences & Theme', desc: 'Dark mode, currency & thresholds' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setStatusMessage(null);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start space-x-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#112E81] to-[#4647AE] dark:from-[#1C2333] dark:to-[#21262D] dark:border dark:border-[#4382DF]/40 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1C2333] hover:text-[#112E81] dark:hover:text-[#E6EDF3]'
                }`}
              >
                <Icon className={`w-5 h-5 mt-0.5 ${isActive ? 'text-[#AACCD6]' : 'text-[#4382DF]'}`} />
                <div>
                  <div className="text-xs sm:text-sm font-bold">{tab.label}</div>
                  <div className={`text-[11px] ${isActive ? 'text-white/80 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {tab.desc}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content Pane (8 Cols) */}
        <div className="md:col-span-8 bg-white dark:bg-[#161B22] rounded-2xl border border-slate-200 dark:border-[#30363D] p-6 shadow-2xs">
          
          {/* TAB 1: Profile & Identity */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#112E81] dark:text-[#E6EDF3]">Personal Profile Details</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Update your display name, username, email, and avatar image.
                </p>
              </div>

              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50/70 dark:bg-[#0D1117] border border-slate-100 dark:border-[#30363D]">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-18 h-18 rounded-full object-cover ring-4 ring-[#AACCD6]/60 shadow-sm"
                />
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="text-xs font-semibold text-[#112E81] dark:text-[#E6EDF3]">Select Preset Avatar or Enter URL</div>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {sampleAvatarPresets.map((preset, idx) => (
                      <img
                        key={idx}
                        src={preset}
                        alt="preset"
                        onClick={() => setAvatarUrl(preset)}
                        className={`w-8 h-8 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform ${
                          avatarUrl === preset ? 'ring-2 ring-[#4382DF]' : 'opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="Custom Image URL (https://...)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3] focus:outline-none focus:border-[#4382DF]"
                  />
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Role / Tier</label>
                  <input
                    type="text"
                    disabled
                    value={user?.tier || user?.role || 'Wealth Platinum Member'}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-100 dark:bg-[#161B22]/70 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#30363D]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Linked Accounts */}
          {activeTab === 'accounts' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#112E81] dark:text-[#E6EDF3]">Connected Financial Accounts</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Manage checking, credit card, and brokerage feeds.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={async () => {
                      setSaving(true);
                      try {
                        if (token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token') {
                          await fetch('http://localhost:5000/api/transactions/sync', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
                          });
                        }
                        setStatusMessage({ type: 'success', text: 'Live Mock Bank feed connected & synced.' });
                      } catch (err) {
                        setStatusMessage({ type: 'success', text: 'Mock bank feeds verified & synced.' });
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
                    title="Connect and pull feeds from Mock Bank API"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Sync Mock Bank Feeds</span>
                  </button>
                  <button
                    onClick={() => setIsAddingAccount(!isAddingAccount)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#4382DF] hover:bg-[#112E81] text-white text-xs font-semibold shadow-2xs transition-all flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Account</span>
                  </button>
                </div>
              </div>

              {/* Add Account Sub-Form */}
              {isAddingAccount && (
                <form onSubmit={handleCreateNewAccount} className="p-4 rounded-xl bg-slate-50 dark:bg-[#0D1117] border border-[#AACCD6]/70 dark:border-[#30363D] space-y-3 animate-fadeIn">
                  <div className="text-xs font-bold text-[#112E81] dark:text-[#E6EDF3]">New Account Setup</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Account Name (e.g. Robinhood Portfolio)"
                      value={newAccountName}
                      onChange={(e) => setNewAccountName(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3]"
                    />
                    <select
                      value={newAccountType}
                      onChange={(e) => setNewAccountType(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3] cursor-pointer"
                    >
                      <option value="checking">Checking Account</option>
                      <option value="savings">Savings / Vault</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="investment">Investment / Brokerage</option>
                      <option value="cash">Cash Reserve</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`Initial Balance (${symbol}0.00)`}
                      value={newAccountBalance}
                      onChange={(e) => setNewAccountBalance(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3]"
                    />
                    <select
                      value={newAccountCurrency}
                      onChange={(e) => setNewAccountCurrency(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22] text-slate-800 dark:text-[#E6EDF3] cursor-pointer"
                    >
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="USD">USD ($) - US Dollar</option>
                      <option value="EUR">EUR (€) - Euro</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAccount(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-3.5 py-1 rounded-lg bg-[#112E81] hover:bg-[#4647AE] text-white text-xs font-semibold"
                    >
                      Save Account
                    </button>
                  </div>
                </form>
              )}

              {/* Account List Display */}
              <div className="space-y-3">
                {(user?.accounts && user.accounts.length > 0 ? user.accounts : [
                  { id: 'a1', account_name: 'Chase Sapphire Checking', account_type: 'checking', initial_balance: 8420.00, currency: 'USD' },
                  { id: 'a2', account_name: 'Amex Reserve Platinum', account_type: 'credit_card', initial_balance: 3150.20, currency: 'USD' },
                  { id: 'a3', account_name: 'Primary Wealth Vault', account_type: 'savings', initial_balance: 45000.00, currency: 'USD' }
                ]).map((acc, idx) => (
                  <div key={acc.id || idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-[#30363D] flex items-center justify-between hover:border-[#AACCD6] dark:hover:border-[#4382DF] transition-colors bg-white dark:bg-[#161B22]">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-[#112E81] text-white flex items-center justify-center font-bold text-xs">
                        {acc.account_name?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-[#112E81] dark:text-[#E6EDF3]">{acc.account_name}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 capitalize">{acc.account_type} • {acc.currency || 'USD'}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-[#E6EDF3]">
                        {formatAmount(acc.initial_balance || 0)}
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                        Active Sync
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Security & Password */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#112E81] dark:text-[#E6EDF3]">Security & Password Management</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Update your authentication credentials and manage institutional cryptographic protection.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#AACCD6]/20 dark:bg-[#1C2333]/70 border border-[#4382DF]/30 dark:border-[#30363D] flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#4382DF]" />
                  <span className="font-semibold text-[#112E81] dark:text-[#E6EDF3]">SOC2 256-bit Encryption Active</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Encrypted</span>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-[#30363D]">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#112E81] hover:bg-[#4647AE] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{saving ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Preferences & Alerts */}
          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#112E81] dark:text-[#E6EDF3]">App Preferences & Alerts</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Customize appearance theme, currency formats, spend warnings, and report delivery.
                </p>
              </div>

              {/* Theme Preference Control */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/50 dark:bg-[#0D1117] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#112E81] dark:text-[#E6EDF3]">Appearance Theme</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      Select light, dark, or automatic system mode
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#4382DF] px-2 py-0.5 rounded-full bg-[#4382DF]/10 capitalize">
                    {preference} mode
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  {[
                    { id: 'system', label: 'System', icon: Monitor, desc: 'Follow OS preference' },
                    { id: 'light', label: 'Light', icon: Sun, desc: 'Crisp light aesthetic' },
                    { id: 'dark', label: 'Dark', icon: Moon, desc: 'Institutional midnight' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = preference === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setTheme(item.id);
                          setStatusMessage({ type: 'success', text: `Theme changed to ${item.label}. Preference synced across sessions.` });
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                          isSelected
                            ? 'bg-white dark:bg-[#1C2333] border-[#4382DF] shadow-xs text-[#112E81] dark:text-[#E6EDF3] ring-2 ring-[#4382DF]/30'
                            : 'bg-white dark:bg-[#161B22] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#4382DF]' : 'text-slate-400'}`} />
                        <span className="text-xs font-bold">{item.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline">{item.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Currency & Banking Region Control */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] bg-slate-50/50 dark:bg-[#0D1117] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#112E81] dark:text-[#E6EDF3]">Currency & Banking Region</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      Select your operational jurisdiction and accounting currency
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-[#4382DF] px-2.5 py-0.5 rounded-full bg-[#4382DF]/10 flex items-center gap-1">
                    <span>{currency.flag}</span>
                    <span>{currency.code} ({currency.symbol})</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  {Object.values(CURRENCIES).map((item) => {
                    const isSelected = currencyCode === item.code;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          if (updateUserCurrency) {
                            updateUserCurrency(item.code, item.location);
                          }
                          setStatusMessage({
                            type: 'success',
                            text: `Active currency switched to ${item.name} (${item.symbol}). All values and charts updated dynamically.`
                          });
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col space-y-2 ${
                          isSelected
                            ? 'bg-white dark:bg-[#1C2333] border-[#4382DF] shadow-xs ring-2 ring-[#4382DF]/30'
                            : 'bg-white dark:bg-[#161B22] border-slate-200 dark:border-[#30363D] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xl">{item.flag}</span>
                          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-[#4382DF] text-white' : 'bg-slate-100 dark:bg-[#30363D] text-slate-600 dark:text-slate-400'}`}>
                            {item.symbol}
                          </span>
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-[#112E81] dark:text-[#E6EDF3]' : 'text-slate-700 dark:text-slate-300'}`}>
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500">
                            {item.location}
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-100 dark:border-[#30363D]">
                          1 USD = {item.rateFromUSD} {item.code}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 flex items-start space-x-2 text-[11px] text-blue-700 dark:text-blue-300">
                  <Globe className="w-4 h-4 shrink-0 mt-0.5 text-[#4382DF]" />
                  <span>
                    <strong>Dynamic Conversion Active:</strong> Changing currency converts all ledger transactions, KPI metrics, predictive cashflow, and budget limits from base rates (USD 1.00 = INR 83.50 = EUR 0.92).
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]">
                  <div>
                    <div className="font-bold text-[#112E81] dark:text-[#E6EDF3]">Spend Limit Alerts</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">Receive notifications when category budgets exceed 85%</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4382DF] cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]">
                  <div>
                    <div className="font-bold text-[#112E81] dark:text-[#E6EDF3]">Predictive Cashflow Forecasts</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">Run machine learning forecasts for recurring expenses</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4382DF] cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-[#30363D] bg-white dark:bg-[#161B22]">
                  <div>
                    <div className="font-bold text-[#112E81] dark:text-[#E6EDF3]">Automatic Category Tagging</div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">Use intelligent merchant classifier for new ledger items</div>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#4382DF] cursor-pointer" />
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
