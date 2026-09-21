/**
 * Reusable ProgressBar with dynamic colors, threshold states and animated width
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  valueLabel,
  color = '#1591DC',
  height = 'h-2.5',
  showPercentage = false,
  className = '',
  statusText
}) {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  // Auto color mapping if threshold exceeded
  let barColor = color;
  if (percentage >= 95) {
    barColor = '#EF4444'; // Rose / Danger
  } else if (percentage >= 80) {
    barColor = '#F59E0B'; // Amber / Warning
  }

  return (
    <div className={`w-full ${className}`}>
      {(label || valueLabel || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium mb-1.5 text-slate-700">
          <div className="flex items-center gap-2">
            <span>{label}</span>
            {statusText && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-normal">
                {statusText}
              </span>
            )}
          </div>
          <div className="text-right">
            {valueLabel ? (
              <span className="text-slate-900 font-semibold">{valueLabel}</span>
            ) : showPercentage ? (
              <span className="text-slate-900 font-semibold">{percentage}%</span>
            ) : null}
          </div>
        </div>
      )}
      
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${height}`}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor
          }}
        />
      </div>
    </div>
  );
}
