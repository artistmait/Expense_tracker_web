import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

/**
 * Reads the persisted preference from localStorage.
 * Returns 'light' | 'dark' | 'system'
 */
const getStoredTheme = () => {
  try {
    return localStorage.getItem('budgetmate_theme') || 'system';
  } catch {
    return 'system';
  }
};

/**
 * Returns true if the OS prefers dark.
 */
const osPrefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * Given a preference, resolves the actual 'dark' | 'light' value.
 */
const resolve = (pref) => {
  if (pref === 'dark')   return 'dark';
  if (pref === 'light')  return 'light';
  return osPrefersDark() ? 'dark' : 'light'; // 'system'
};

/**
 * Applies or removes the `dark` class on <html>.
 */
const applyTheme = (resolved) => {
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const ThemeProvider = ({ children }) => {
  // 'light' | 'dark' | 'system'
  const [preference, setPreference] = useState(getStoredTheme);

  // Resolved actual theme (never 'system')
  const isDark = resolve(preference) === 'dark';

  // Apply theme class on mount and whenever preference changes
  useEffect(() => {
    const resolved = resolve(preference);
    applyTheme(resolved);

    // Persist to localStorage
    if (preference === 'system') {
      localStorage.removeItem('budgetmate_theme');
    } else {
      localStorage.setItem('budgetmate_theme', preference);
    }
  }, [preference]);

  // Listen for OS-level dark mode changes (only matters when pref is 'system')
  useEffect(() => {
    if (preference !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => applyTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [preference]);

  // Optional background sync to backend for cross-device persistence
  const syncToServer = useCallback(async (pref) => {
    try {
      const token = localStorage.getItem('budgetmate_token');
      if (token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token') {
        await fetch('http://localhost:5000/api/auth/theme', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ theme: pref }),
        });
      }
    } catch (err) {
      // Non-blocking silent sync
    }
  }, []);

  /**
   * Toggle between light <-> dark directly (ignores 'system').
   * The toggle button calls this.
   */
  const toggleTheme = useCallback(() => {
    setPreference((prev) => {
      const current = resolve(prev);
      const next = current === 'dark' ? 'light' : 'dark';
      syncToServer(next);
      return next;
    });
  }, [syncToServer]);

  /**
   * Set an explicit preference: 'light' | 'dark' | 'system'
   * Used when loading a server-side theme_preference or selecting in Settings.
   */
  const setTheme = useCallback((pref, options = { syncServer: true }) => {
    if (['light', 'dark', 'system'].includes(pref)) {
      setPreference(pref);
      if (options?.syncServer) {
        syncToServer(pref);
      }
    }
  }, [syncToServer]);

  return (
    <ThemeContext.Provider value={{ preference, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
};
