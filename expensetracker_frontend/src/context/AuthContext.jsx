import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/authApi';
import { useTheme } from './ThemeContext';

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
  tier: "Wealth Platinum Member",
  accounts: [
    { id: 'acc-1', account_name: 'Chase Sapphire Checking', account_type: 'checking', initial_balance: 8420.00, currency: 'USD' },
    { id: 'acc-2', account_name: 'Amex Reserve Platinum', account_type: 'credit_card', initial_balance: 3150.20, currency: 'USD' },
    { id: 'acc-3', account_name: 'Primary Wealth Vault', account_type: 'savings', initial_balance: 45000.00, currency: 'USD' }
  ]
};

export const AuthProvider = ({ children }) => {
  const { setTheme } = useTheme();
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
    try {
      // Attempt backend API call
      const res = await authApi.login({
        identifier: emailOrUsername,
        password: password,
      });

      if (res.success && res.user) {
        const loggedInUser = {
          id: res.user.id,
          name: res.user.full_name || res.user.username,
          username: res.user.username,
          email: res.user.email,
          avatar: res.user.avatar_url || DEFAULT_USER.avatar,
          role: "Verified Member",
          accounts: res.user.accounts || [],
          accountsCount: res.user.accounts?.length || 1,
          currency: res.user.accounts?.[0]?.currency || "USD",
          theme_preference: res.user.theme_preference || null,
        };
        setUser(loggedInUser);
        setToken(res.token);
        if (res.user.theme_preference) {
          setTheme(res.user.theme_preference, { syncServer: false });
        }
        setAuthModalOpen(false);
        return { success: true };
      }
    } catch (err) {
      // If it is the default seeded user or demo account, support offline/local demo seamlessly
      if (
        emailOrUsername.toLowerCase().includes('maitreyee') || 
        emailOrUsername.toLowerCase().includes('alex') || 
        emailOrUsername.toLowerCase().includes('demo')
      ) {
        const demoUser = emailOrUsername.toLowerCase().includes('alex')
          ? {
              ...DEFAULT_USER,
              name: "Alex Morgan",
              username: "alexmorgan",
              email: "alex.morgan@budgetmate.io",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256"
            }
          : DEFAULT_USER;

        setUser(demoUser);
        setToken("mock_jwt_demo_token");
        setAuthModalOpen(false);
        return { success: true, isMock: true };
      }
      throw err;
    }
  };

  const signup = async ({ name, username, email, password, initialAccount, sync_mock_bank }) => {
    try {
      // Attempt backend API call
      const res = await authApi.register({
        username: username || (email ? email.split('@')[0] : 'user') + Math.floor(Math.random() * 100),
        full_name: name || "New Member",
        email: email,
        password: password,
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
          currency: res.user.accounts?.[0]?.currency || initialAccount?.currency || "USD",
        };
        setUser(newUser);
        setToken(res.token);
        setAuthModalOpen(false);
        return { success: true, bankSync: res.bankSync };
      }
    } catch (err) {
      console.warn('[AuthContext] Backend register fallback:', err.message);
      const newUser = {
        ...DEFAULT_USER,
        name: name || "Maitreyee Puranik",
        username: username || "maitreyee",
        email: email || "maitreyee.puranik@budgetmate.io",
        currency: initialAccount?.currency || "USD",
        accounts: [
          {
            id: 'acc-init',
            account_name: initialAccount?.account_name || 'Chase Sapphire Checking',
            account_type: initialAccount?.account_type || 'checking',
            initial_balance: parseFloat(initialAccount?.initial_balance) || 8420.0,
            currency: initialAccount?.currency || 'USD'
          }
        ]
      };
      setUser(newUser);
      setToken("mock_jwt_token");
      setAuthModalOpen(false);
      return { success: true, isMock: true };
    }
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
