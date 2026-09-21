import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Animated dark/light mode toggle button.
 * Placed in the dashboard top nav.
 */
export const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative w-9 h-9 rounded-xl border transition-all duration-200 cursor-pointer
        flex items-center justify-center overflow-hidden
        ${isDark
          ? 'bg-[#1C2333] border-[#30363D] text-amber-300 hover:bg-[#252D40] hover:border-amber-400/40'
          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-[#EDF6FC] hover:border-[#4382DF]/50 hover:text-[#2C5EAD]'
        }
        ${className}
      `}
    >
      {/* Icon wrapper — key forces re-mount on switch, triggering the CSS animation */}
      <span key={isDark ? 'sun' : 'moon'} className="theme-icon-enter">
        {isDark
          ? <Sun  className="w-4 h-4 text-amber-300" />
          : <Moon className="w-4 h-4 text-[#112E81]" />
        }
      </span>
    </button>
  );
};
