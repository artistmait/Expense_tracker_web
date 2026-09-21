import { useState } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import { Card } from '../common/Card';

export function CashflowOverview({ history }) {
  const [activeRange, setActiveRange] = useState('6M');
  const [hoveredMonth, setHoveredMonth] = useState(null);

  const maxVal = Math.max(...history.map(item => Math.max(item.income, item.expense)));

  return (
    <Card
      title="Cash Flow & Savings Trajectory"
      subtitle="Income vs expenditure comparison over the last 6 months"
      icon={BarChart3}
      variant="default"
      action={
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {['3M', '6M', 'YTD', '1Y'].map((range) => (
            <button
              key={range}
              onClick={() => setActiveRange(range)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeRange === range
                  ? 'bg-white text-[#2C5EAD] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      }
    >
      {/* Legend & Stats banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-6 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-[#2C5EAD]" />
            <span className="text-slate-700">Total Income</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-[#1591DC]" />
            <span className="text-slate-700">Expenditure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-md bg-[#C4E2F5]" />
            <span className="text-slate-700">Net Retained</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Avg. Monthly Surplus: +$7,455.00</span>
        </div>
      </div>

      {/* Chart Bars Visualization */}
      <div className="pt-6">
        <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-6 pb-2 px-2">
          {history.map((item) => {
            const incomeHeight = (item.income / (maxVal * 1.15)) * 100;
            const expenseHeight = (item.expense / (maxVal * 1.15)) * 100;
            const isHovered = hoveredMonth === item.month;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={() => setHoveredMonth(item.month)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Floating Tooltip */}
                <div className={`mb-2 transition-all duration-200 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  <div className="bg-slate-900 text-white text-[11px] py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap z-20">
                    <p className="font-bold text-[#4BB8FA]">{item.month} Breakdown</p>
                    <p>Income: ${item.income.toLocaleString()}</p>
                    <p>Expense: ${item.expense.toLocaleString()}</p>
                    <p className="text-emerald-400 font-semibold">Net: +${item.savings.toLocaleString()}</p>
                  </div>
                </div>

                {/* Bars group */}
                <div className="w-full max-w-[64px] flex items-end justify-center gap-1.5 sm:gap-2 h-48">
                  {/* Income bar */}
                  <div
                    className="w-1/2 rounded-t-lg bg-gradient-to-t from-[#2C5EAD] to-[#1591DC] transition-all duration-300 group-hover:brightness-110 shadow-xs"
                    style={{ height: `${incomeHeight}%` }}
                  />

                  {/* Expense bar */}
                  <div
                    className="w-1/2 rounded-t-lg bg-gradient-to-t from-[#1591DC]/80 to-[#4BB8FA] transition-all duration-300 group-hover:brightness-110 shadow-xs"
                    style={{ height: `${expenseHeight}%` }}
                  />
                </div>

                {/* Month label */}
                <div className="mt-3 text-center">
                  <span className={`text-xs font-bold transition-colors ${
                    isHovered ? 'text-[#2C5EAD]' : 'text-slate-600'
                  }`}>
                    {item.month}
                  </span>
                  <p className="text-[10px] text-emerald-600 font-semibold hidden sm:block">
                    +${(item.savings / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
