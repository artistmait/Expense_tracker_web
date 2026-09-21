import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

export const KPIMetricsRow = ({ metrics }) => {
  const [tooltipText, setTooltipText] = useState(null);

  const kpis = [
    {
      id: 'netCashflow',
      label: 'Total Net Cashflow',
      value: '$8,420.00',
    },
    {
      id: 'monthlyInflow',
      label: 'Total Monthly Inflow',
      value: '$8,420.00',
      badge: { icon: ArrowUpRight, color: 'text-emerald-500' },
    },
    {
      id: 'totalExpenses',
      label: 'Total Expenses',
      value: '$3,150.20',
      badge: { icon: ArrowDownRight, color: 'text-rose-500' },
    },
    {
      id: 'savingsRate',
      label: 'Net Savings Rate',
      value: '+62.5%',
      isGreenValue: true,
      info: 'Percentage of monthly gross inflow allocated to liquid savings and portfolio assets.'
    },
    {
      id: 'smartRunway',
      label: 'Smart Runway',
      value: '14.2 Months',
      info: 'Estimated runway based on average 6-month burn rate and current liquid reserves.'
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          KPI metrics
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="glass-card rounded-xl p-4 hover:shadow-md hover:border-[#AACCD6] dark:hover:border-[#4382DF]/50 flex flex-col justify-between relative group"
          >
            {/* Label & Info */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                {kpi.label}
              </span>
              {kpi.info && (
                <div className="relative">
                  <button
                    onMouseEnter={() => setTooltipText(kpi.info)}
                    onMouseLeave={() => setTooltipText(null)}
                    className="text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-0.5"
                    title={kpi.info}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Value & Badge */}
            <div className="flex items-baseline space-x-1.5 mt-1">
              <span
                className={`text-lg sm:text-xl font-extrabold tracking-tight ${
                  kpi.isGreenValue
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-[#112E81] dark:text-[#E6EDF3]'
                }`}
              >
                {kpi.value}
              </span>
              {kpi.badge && (
                <kpi.badge.icon className={`w-4 h-4 ${kpi.badge.color} inline-block font-bold stroke-[2.5]`} />
              )}
            </div>

            {/* Accent bar */}
            <div className="w-full h-1 bg-slate-100 dark:bg-[#30363D] rounded-full mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: kpi.id === 'savingsRate' ? '62.5%' : kpi.id === 'smartRunway' ? '85%' : '100%',
                  backgroundColor: kpi.id === 'totalExpenses' ? '#F43F5E' : '#4382DF'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
