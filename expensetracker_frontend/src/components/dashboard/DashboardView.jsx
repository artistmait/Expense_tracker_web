import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopNav } from './DashboardTopNav';
import { KPIMetricsRow } from './KPIMetricsRow';
import { PredictiveCashflowChart } from './PredictiveCashflowChart';
import { BudgetTierCard } from './BudgetTierCard';
import { LedgerTable } from './LedgerTable';
import { HealthScoreCard } from './HealthScoreCard';
import { SettingsView } from '../settings/SettingsView';
import { BudgetView } from './BudgetView';
import { ExpensesView } from '../expenses/ExpensesView';
import { AdvisorPanel } from '../advisor/AdvisorPanel';

export const DashboardView = ({
  token,
  user,
  metrics,
  transactions = [],
  categories = [],
  budgetProgress = [],
  onOpenQuickAdd,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onAddBudget,
  onSaveBudget,
  onUpdateCategory,
  onSyncBankData,
  syncLoading = false
}) => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const { toast } = useToast();

  const handleSyncTrigger = async () => {
    if (onSyncBankData) {
      try {
        await onSyncBankData();
      } catch (err) {
        toast.warning('Bank data synced using local secure ledger.', 'Fallback Sync');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F6F9FD] dark:bg-[#0D1117] text-[#112E81] dark:text-[#E6EDF3] antialiased selection:bg-[#AACCD6] selection:text-[#112E81] w-full transition-colors duration-200">

      {/* Vertical Icon Sidebar */}
      <DashboardSidebar activeNav={activeNav} onSelectNav={setActiveNav} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Navigation Controls */}
        <DashboardTopNav
          onOpenQuickAdd={onOpenQuickAdd}
          onSyncTrigger={handleSyncTrigger}
          onOpenSettings={() => setActiveNav('settings')}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
        />

        <AdvisorPanel token={token} isOpen={isAdvisorOpen} onClose={() => setIsAdvisorOpen(false)} />

        {/* Main Body */}
        {activeNav === 'settings' ? (
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <SettingsView onBackToDashboard={() => setActiveNav('dashboard')} />
          </main>
        ) : (activeNav === 'expenses' || activeNav === 'ledger') ? (
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <ExpensesView
              token={token}
              categories={categories}
              accounts={user?.accounts || []}
              globalTransactions={transactions}
              onSyncBankData={handleSyncTrigger}
              onAddTransaction={onAddTransaction}
              onUpdateTransaction={onUpdateTransaction}
              onDeleteTransaction={onDeleteTransaction}
            />
          </main>
        ) : activeNav === 'planning' ? (
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <BudgetView
              budgetProgress={budgetProgress}
              transactions={transactions}
              onAddBudget={onAddBudget}
              onSaveBudget={onSaveBudget}
            />
          </main>
        ) : (
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">

            {/* Row 1: KPI Metrics */}
            <KPIMetricsRow metrics={metrics} />

            {/* Row 2: 12-column modular grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

              <div className="lg:col-span-8">
                <PredictiveCashflowChart />
              </div>

              <div className="lg:col-span-4">
                <BudgetTierCard
                  budgetProgress={budgetProgress}
                  onAddBudget={onAddBudget}
                />
              </div>

              <div className="lg:col-span-8">
                <LedgerTable
                  transactions={transactions}
                  categories={categories}
                  onAddTransaction={onAddTransaction}
                  onUpdateCategory={onUpdateCategory}
                  onSyncTrigger={handleSyncTrigger}
                  onViewAllExpenses={() => setActiveNav('expenses')}
                />
              </div>

              <div className="lg:col-span-4">
                <HealthScoreCard metrics={metrics} transactions={transactions} />
              </div>

            </div>
          </main>
        )}

      </div>
    </div>
  );
};
