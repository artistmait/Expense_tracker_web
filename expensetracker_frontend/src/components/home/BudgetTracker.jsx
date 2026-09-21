import { 
  PieChart, 
  Home, 
  Utensils, 
  Cpu, 
  Plane, 
  Activity, 
  Plus, 
  Layers
} from 'lucide-react';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';

const iconMap = {
  Home: Home,
  Utensils: Utensils,
  Cpu: Cpu,
  Plane: Plane,
  Activity: Activity
};

export function BudgetTracker({ budgets, onAddBudget }) {
  const totalAllocated = budgets.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const overallPercentage = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <Card
      title="Active Category Budgets"
      subtitle="Monthly spending boundaries with automated pace alerts"
      icon={PieChart}
      action={
        <Button
          variant="soft"
          size="sm"
          icon={Plus}
          onClick={onAddBudget}
        >
          New Budget
        </Button>
      }
    >
      {/* Overall Budget Progress Highlight */}
      <div className="bg-[#F0F7FD] rounded-2xl p-4 border border-[#C4E2F5] mb-6">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-[#2C5EAD] flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#1591DC]" />
            Monthly Envelope Capacity
          </span>
          <span className="text-slate-800">
            ${totalSpent.toLocaleString()} / ${totalAllocated.toLocaleString()} ({overallPercentage}%)
          </span>
        </div>
        <ProgressBar
          value={totalSpent}
          max={totalAllocated}
          color="#1591DC"
          height="h-3"
        />
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
          <span>${(totalAllocated - totalSpent).toLocaleString()} Remaining buffer</span>
          <span className="text-emerald-600 font-semibold">11 days left in billing cycle</span>
        </div>
      </div>

      {/* Individual Budget Categories */}
      <div className="space-y-4">
        {budgets.map((b) => {
          const Icon = iconMap[b.icon] || PieChart;
          const percentage = Math.round((b.spent / b.allocated) * 100);
          const isNearLimit = percentage >= 85;

          return (
            <div
              key={b.id}
              className="p-3.5 rounded-xl border border-slate-100 hover:border-[#C4E2F5] hover:bg-[#F8FAFC]/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs shadow-2xs"
                    style={{ backgroundColor: b.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{b.category}</h4>
                    <p className="text-[10px] text-slate-500">
                      ${b.spent.toLocaleString()} spent of ${b.allocated.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`text-xs font-bold ${
                    isNearLimit ? 'text-amber-600' : 'text-slate-700'
                  }`}>
                    {percentage}%
                  </span>
                  {isNearLimit && (
                    <span className="block text-[10px] text-amber-600 font-semibold">
                      Near Limit
                    </span>
                  )}
                </div>
              </div>

              <ProgressBar
                value={b.spent}
                max={b.allocated}
                color={b.color}
                height="h-2"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
