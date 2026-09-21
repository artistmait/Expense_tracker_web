import { 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Sparkles
} from 'lucide-react';

export function StatCardGrid({ metrics }) {
  const stats = [
    {
      id: 'income',
      title: 'Monthly Income',
      value: `$${metrics?.totalIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `+${metrics?.incomeChange}%`,
      isPositive: true,
      subtext: 'vs last month ($13,100)',
      icon: DollarSign,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
      sparkline: [20, 30, 25, 45, 50, 65, 80],
      sparklineColor: '#10B981'
    },
    {
      id: 'expenses',
      title: 'Total Expenses',
      value: `$${metrics?.totalExpenses?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `${metrics?.expensesChange}%`,
      isPositive: true, // Lower expense is good
      subtext: '3.2% lower than budget limit',
      icon: CreditCard,
      iconBg: 'bg-[#C4E2F5]/50 text-[#2C5EAD] border border-[#1591DC]/30',
      sparkline: [60, 55, 58, 52, 48, 44, 40],
      sparklineColor: '#2C5EAD'
    },
    {
      id: 'investments',
      title: 'Investments & Stocks',
      value: `$${metrics?.investmentBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      change: `+${metrics?.investmentChange}%`,
      isPositive: true,
      subtext: '4 active holdings & ETFs',
      icon: TrendingUp,
      iconBg: 'bg-[#1591DC]/10 text-[#1591DC] border border-[#4BB8FA]/40',
      sparkline: [40, 48, 45, 60, 62, 75, 85],
      sparklineColor: '#1591DC'
    },
    {
      id: 'savings',
      title: 'Net Savings Rate',
      value: `${metrics?.savingsRate}%`,
      change: '+4.2%',
      isPositive: true,
      subtext: `$${(metrics?.totalIncome - metrics?.totalExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })} surplus retained`,
      icon: Sparkles,
      iconBg: 'bg-amber-50 text-amber-600 border border-amber-200',
      sparkline: [35, 40, 45, 50, 52, 56, 59],
      sparklineColor: '#F59E0B'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.id}
            className="group relative bg-white rounded-2xl p-5 border border-[#C4E2F5]/80 shadow-xs hover:shadow-lg hover:shadow-[#2C5EAD]/08 transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Top Row: Title & Icon */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle Row: Value & Mini Sparkline */}
            <div className="mt-3 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </h2>
                
                {/* Trend Delta */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${
                    stat.isPositive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {stat.isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                    {stat.change}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {stat.subtext}
                  </span>
                </div>
              </div>

              {/* Sparkline Graphic */}
              <div className="w-16 h-8 flex items-end justify-between gap-1 pb-1">
                {stat.sparkline.map((val, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{
                      height: `${(val / 90) * 100}%`,
                      backgroundColor: stat.sparklineColor,
                      opacity: 0.35 + (idx * 0.1)
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
