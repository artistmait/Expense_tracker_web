import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  Sparkles
} from 'lucide-react';

const ToastItem = ({ toast, onRemove }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const intervalTime = 40;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onRemove(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [toast, onRemove]);

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      iconBg: 'bg-emerald-500/15 dark:bg-emerald-500/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      barColor: 'bg-gradient-to-r from-[#4382DF] to-emerald-500',
      badgeBorder: 'border-emerald-200/60 dark:border-emerald-800/40',
    },
    error: {
      icon: AlertCircle,
      iconBg: 'bg-rose-500/15 dark:bg-rose-500/20',
      iconColor: 'text-rose-600 dark:text-rose-400',
      barColor: 'bg-gradient-to-r from-rose-500 to-red-600',
      badgeBorder: 'border-rose-200/60 dark:border-rose-800/40',
    },
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-amber-500/15 dark:bg-amber-500/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      barColor: 'bg-gradient-to-r from-amber-500 to-orange-500',
      badgeBorder: 'border-amber-200/60 dark:border-amber-800/40',
    },
    info: {
      icon: Sparkles,
      iconBg: 'bg-[#4382DF]/15 dark:bg-[#4382DF]/20',
      iconColor: 'text-[#4382DF] dark:text-[#AACCD6]',
      barColor: 'bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF]',
      badgeBorder: 'border-[#AACCD6]/60 dark:border-[#4382DF]/40',
    },
  };

  const config = typeConfig[toast.type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div className="relative w-full max-w-md bg-white/95 dark:bg-[#161B22]/95 backdrop-blur-xl border border-[#AACCD6]/80 dark:border-[#30363D] rounded-2xl shadow-2xl p-4 sm:p-5 overflow-hidden transition-all duration-300 animate-fadeIn select-none group">
      
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#112E81] via-[#4647AE] to-[#4382DF]" />

      <div className="flex items-start space-x-3.5">
        {/* Large Prominent Icon Badge */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${config.iconBg} ${config.badgeBorder}`}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-2 pt-0.5">
          {toast.title && (
            <h4 className="text-sm font-extrabold text-[#112E81] dark:text-[#E6EDF3] tracking-tight leading-snug">
              {toast.title}
            </h4>
          )}
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed break-words">
            {toast.message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={() => onRemove(toast.id)}
          className="p-1 rounded-lg text-slate-400 hover:text-[#112E81] dark:hover:text-[#E6EDF3] hover:bg-slate-100 dark:hover:bg-[#21262D] transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Countdown Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-[#0D1117]">
        <div
          className={`h-full ${config.barColor} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>

    </div>
  );
};

export const ToastContainer = ({ toasts = [], onRemove }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col space-y-3 pointer-events-auto max-w-sm sm:max-w-md w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
