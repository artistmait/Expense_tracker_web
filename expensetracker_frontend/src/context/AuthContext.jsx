import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { useTheme } from './ThemeContext';
import { useCurrency } from './CurrencyContext';

const AuthContext = createContext(null);

const DEFAULT_USER = {
  id: "usr_maitreyee_01",
  name: "Maitreyee Puranik",
  username: "maitreyee",
  email: "maitreyee.puranik@budgetmate.io",
  avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
  role: "Verified Member",
  accountsCount: 4,
  currency: "USD",
  location: "United States",
  tier: "Wealth Platinum Member",
  accounts: [
    { id: 'acc-1', account_name: 'Chase Sapphire Checking', account_type: 'checking', initial_balance: 8420.00, currency: 'USD' },
    { id: 'acc-2', account_name: 'Amex Reserve Platinum', account_type: 'credit_card', initial_balance: 3150.20, currency: 'USD' },
    { id: 'acc-3', account_name: 'Primary Wealth Vault', account_type: 'savings', initial_balance: 45000.00, currency: 'USD' }
  ]
};

export const AuthProvider = ({ children }) => {
  const { setTheme } = useTheme();
  const { updateCurrency } = useCurrency();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('budgetmate_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('budgetmate_token') || null;
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'signup'

  useEffect(() => {
    if (user) {
      localStorage.setItem('budgetmate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('budgetmate_user');
    }
    if (token) {
      localStorage.setItem('budgetmate_token', token);
    } else {
      localStorage.removeItem('budgetmate_token');
    }
  }, [user, token]);

  const login = async (emailOrUsername, password) => {
    // Attempt backend API call. Errors propagate so the UI shows the real
    // reason (invalid credentials, server down) — FIX #7 (audit).
    const res = await authApi.login({
      identifier: emailOrUsername,
      password: password,
    });

      if (res.success && res.user) {
        const userCurrency = res.user.accounts?.[0]?.currency || 'USD';
        const loggedInUser = {
          id: res.user.id,
          name: res.user.full_name || res.user.username,
          username: res.user.username,
          email: res.user.email,
          avatar: res.user.avatar_url || DEFAULT_USER.avatar,
          role: "Verified Member",
          accounts: res.user.accounts || [],
          accountsCount: res.user.accounts?.length || 1,
          currency: userCurrency,
          location: res.user.location || 'United States',
          theme_preference: res.user.theme_preference || null,
        };
        setUser(loggedInUser);
        setToken(res.token);
        updateCurrency(userCurrency);
        if (res.user.theme_preference) {
          setTheme(res.user.theme_preference, { syncServer: false });
        }
        setAuthModalOpen(false);
        return { success: true };
      }
      throw new Error(res.message || 'Login failed.');
  };

  const signup = async ({ name, username, email, password, initialAccount, sync_mock_bank, location }) => {
    const resolvedCurrency = initialAccount?.currency || 'USD';
    const resolvedLocation = location || 'United States';
    // FIX #7 (audit): removed the mock-user signup fallback. If the backend
    // registration fails, the error propagates and the user sees it — instead
    // of being silently logged in as a fake profile whose data vanishes on reload.
    const res = await authApi.register({
      username: username || (email ? email.split('@')[0] : 'user') + Math.floor(Math.random() * 100),
      full_name: name || "New Member",
      email: email,
      password: password,
      location: resolvedLocation,
      initialAccount: initialAccount,
      sync_mock_bank: !!sync_mock_bank,
    });

      if (res.success && res.user) {
        const newUser = {
          id: res.user.id,
          name: res.user.full_name,
          username: res.user.username,
          email: res.user.email,
          avatar: res.user.avatar_url || DEFAULT_USER.avatar,
          role: "Verified Member",
          accounts: res.user.accounts || [],
          accountsCount: res.user.accounts?.length || 1,
          currency: res.user.accounts?.[0]?.currency || resolvedCurrency,
          location: resolvedLocation,
        };
        setUser(newUser);
        setToken(res.token);
        updateCurrency(resolvedCurrency);
        setAuthModalOpen(false);
        return { success: true, bankSync: res.bankSync };
      }
      throw new Error(res.message || 'Registration failed.');
  };

  const updateUserProfile = async ({ full_name, username, email, avatar_url }) => {
    try {
      if (token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token') {
        const res = await authApi.updateProfile(token, { full_name, username, email, avatar_url });
        if (res.success && res.user) {
          setUser(prev => ({
            ...prev,
            name: res.user.full_name,
            username: res.user.username,
            email: res.user.email,
            avatar: res.user.avatar_url || prev.avatar,
          }));
          return { success: true, message: 'Profile updated on server.' };
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Online update failed, saving locally:', err.message);
    }
    // Local update
    setUser(prev => ({
      ...prev,
      name: full_name || prev.name,
      username: username || prev.username,
      email: email || prev.email,
      avatar: avatar_url || prev.avatar,
    }));
    return { success: true, message: 'Profile updated.' };
  };

  const changeUserPassword = async ({ currentPassword, newPassword }) => {
    if (token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token') {
      return await authApi.changePassword(token, { currentPassword, newPassword });
    }
    return { success: true, message: 'Password updated successfully.' };
  };

  const loginDemo = () => {
    setUser(DEFAULT_USER);
    setToken("mock_jwt_demo_token");
    setAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  const openAuth = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  const updateUserTheme = (theme) => {
    setTheme(theme, { syncServer: true });
    setUser((prev) => (prev ? { ...prev, theme_preference: theme } : null));
  };

  const updateUserCurrency = (currencyCode, location) => {
    updateCurrency(currencyCode);
    setUser((prev) => prev ? { ...prev, currency: currencyCode, location: location || prev.location } : null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        signup,
        updateUserProfile,
        changeUserPassword,
        updateUserTheme,
        updateUserCurrency,
        loginDemo,
        logout,
        authModalOpen,
        authModalTab,
        setAuthModalTab,
        openAuth,
        closeAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
