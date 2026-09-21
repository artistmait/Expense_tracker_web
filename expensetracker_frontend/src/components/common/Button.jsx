/**
 * Reusable Button Component
 * Supports multiple variants styled with brand colors: #2C5EAD, #1591DC, #4BB8FA, #C4E2F5
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  disabled = false,
  isLoading = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer';

  const variants = {
    primary: 'bg-[#2C5EAD] hover:bg-[#234b8c] text-white shadow-md shadow-[#2C5EAD]/20 hover:shadow-lg hover:shadow-[#2C5EAD]/30 focus:ring-[#2C5EAD]/50',
    secondary: 'bg-[#1591DC] hover:bg-[#117bc0] text-white shadow-sm hover:shadow-[#1591DC]/30 focus:ring-[#1591DC]/50',
    accent: 'bg-[#4BB8FA] hover:bg-[#32a9f5] text-slate-900 font-semibold shadow-sm focus:ring-[#4BB8FA]/50',
    gradient: 'gradient-brand hover:opacity-95 text-white shadow-md shadow-[#1591DC]/25 hover:shadow-lg focus:ring-[#1591DC]/50',
    soft: 'bg-[#C4E2F5]/40 hover:bg-[#C4E2F5]/70 text-[#2C5EAD] font-semibold focus:ring-[#4BB8FA]/50 border border-[#C4E2F5]',
    outline: 'border border-[#C4E2F5] hover:border-[#1591DC] bg-white text-slate-700 hover:text-[#2C5EAD] hover:bg-[#EDF6FC]/60 focus:ring-[#1591DC]/30',
    ghost: 'text-slate-600 hover:text-[#2C5EAD] hover:bg-[#C4E2F5]/30 focus:ring-[#2C5EAD]/20',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm focus:ring-rose-400'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-5 py-3 gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}
