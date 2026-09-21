/**
 * Reusable Badge Component with status colors and subtle borders
 */
export function Badge({
  children,
  variant = 'primary',
  size = 'sm',
  dot = false,
  className = '',
  icon: Icon
}) {
  const variants = {
    primary: 'bg-[#C4E2F5]/60 text-[#2C5EAD] border-[#1591DC]/30',
    secondary: 'bg-[#1591DC]/10 text-[#1591DC] border-[#1591DC]/30',
    accent: 'bg-[#4BB8FA]/15 text-[#1B3B6F] border-[#4BB8FA]/40',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    dark: 'bg-slate-900 text-white border-slate-700'
  };

  const dotColors = {
    primary: 'bg-[#2C5EAD]',
    secondary: 'bg-[#1591DC]',
    accent: 'bg-[#4BB8FA]',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
    warning: 'bg-amber-500',
    neutral: 'bg-slate-400',
    dark: 'bg-[#4BB8FA]'
  };

  const sizes = {
    xs: 'text-[11px] px-2 py-0.5 font-medium',
    sm: 'text-xs px-2.5 py-1 font-semibold',
    md: 'text-sm px-3 py-1.5 font-semibold'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${variants[variant] || variants.primary} ${sizes[size] || sizes.sm} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[variant] || dotColors.primary}`} />
      )}
      {Icon && <Icon className="w-3.5 h-3.5" />}
      <span>{children}</span>
    </span>
  );
}
