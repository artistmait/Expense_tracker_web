/**
 * Reusable Card Component with consistent spacing, elevation and interactive options
 */
export function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  bodyClassName = '',
  hoverable = false,
  variant = 'default',
  footer,
  badgeText
}) {
  const variantStyles = {
    default: 'bg-white border border-[#C4E2F5]/70 shadow-sm',
    flat: 'bg-[#F8FAFC] border border-slate-200/80',
    glass: 'glass-panel shadow-sm',
    accent: 'bg-gradient-to-br from-white via-white to-[#EDF6FC] border border-[#1591DC]/30 shadow-md',
    dark: 'glass-panel-dark text-white shadow-lg'
  };

  return (
    <div
      className={`rounded-2xl transition-all duration-300 overflow-hidden ${variantStyles[variant] || variantStyles.default} ${hoverable ? 'card-hover cursor-pointer' : ''} ${className}`}
    >
      {(title || Icon || action || badgeText) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100/90 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-xl bg-[#C4E2F5]/50 text-[#2C5EAD] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 tracking-tight truncate">
                    {title}
                  </h3>
                  {badgeText && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#C4E2F5] text-[#2C5EAD]">
                      {badgeText}
                    </span>
                  )}
                </div>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 font-normal truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
}
