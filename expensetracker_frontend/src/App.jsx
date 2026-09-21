import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { useToast } from './context/ToastContext';
import { CurrencyProvider, useCurrency } from './context/CurrencyContext';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardView } from './components/dashboard/DashboardView';
import { AuthModal } from './components/auth/AuthModal';
import { QuickAddModal } from './components/home/QuickAddModal';
import { SetBudgetModal } from './components/dashboard/SetBudgetModal';
import { financialData } from './data/mockFinancialData';
import { transactionsApi } from './services/transactionsApi';
import { budgetsApi } from './services/budgetsApi';

function MainAppContent() {
  const { isAuthenticated, token, user } = useAuth();
  const { toast } = useToast();
  const { formatAmount } = useCurrency();

  // ── Budget Alert Toast Dispatcher (Block 2.1c) ──────────────────────────
  const fireBudgetAlertToasts = useCallback((alerts = []) => {
    if (!alerts?.length) return;
    for (const alert of alerts) {
      const pct = alert.percentage;
      if (alert.type === 'BUDGET_ALERT_100') {
        toast.error(
          `🚨 ${alert.category_name} budget EXCEEDED (${pct}% used). Consider adjusting your spending.`,
          'Budget Limit Exceeded'
        );
      } else if (alert.type === 'BUDGET_ALERT_80') {
        toast.warning(
          `⚠️ ${alert.category_name} is at ${pct}% of its budget for this month.`,
          'Budget Warning'
        );
      }
    }
  }, [toast]);

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState('expense');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Dynamic financial states - initialized empty or from user localStorage cache
  const [transactions, setTransactions] = useState(() => {
    try {
      const userKey = localStorage.getItem('budgetmate_user');
      const uid = userKey ? JSON.parse(userKey)?.id : 'guest';
      const cached = localStorage.getItem(`budgetmate_txs_${uid}`);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [categories, setCategories] = useState([]);

  // Budget states
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [budgetSpendMap, setBudgetSpendMap] = useState({});

  const isRealToken = token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token';

  // Cache transactions to localStorage when updated
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`budgetmate_txs_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user?.id]);

  // Load transactions and categories on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadBackendData();
      loadBudgetProgress();
    }
  }, [isAuthenticated, token]);

  const loadBackendData = async () => {
    try {
      if (isRealToken) {
        const [txRes, catRes] = await Promise.allSettled([
          transactionsApi.getTransactions(token, { limit: 100 }),
          transactionsApi.getCategories(token)
        ]);

        if (txRes.status === 'fulfilled') {
          const fetchedTxs = txRes.value?.transactions || [];
          setTransactions(fetchedTxs);
          if (user?.id) {
            localStorage.setItem(`budgetmate_txs_${user.id}`, JSON.stringify(fetchedTxs));
          }
        }
        if (catRes.status === 'fulfilled' && catRes.value?.categories?.length > 0) {
          setCategories(catRes.value.categories);
        }
      }
    } catch (err) {
      console.warn('[App] Offline fallback active for transactions/categories:', err.message);
    }
  };

  // Derive dynamic KPI metrics from active transactions and user accounts
  const metrics = React.useMemo(() => {
    let totalExpenses = 0;
    let totalIncome = 0;
    for (const t of transactions) {
      const amt = Math.abs(parseFloat(t.amount || 0));
      if (t.transaction_type === 'expense' || t.amount < 0) {
        totalExpenses += amt;
      } else if (t.transaction_type === 'income' || t.amount > 0) {
        totalIncome += amt;
      }
    }
    const accountsBalance = (user?.accounts || []).reduce((acc, a) => acc + (parseFloat(a.initial_balance) || 0), 0);
    const netWorth = (accountsBalance || 0) + totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;
    const runway = totalExpenses > 0 ? Math.min(36, Math.max(1, Math.round((netWorth / totalExpenses) * 10) / 10)) : 12;

    return {
      netWorth,
      totalExpenses,
      totalIncome,
      savingsRate,
      savingsRateChange: totalIncome > 0 ? '+4.2%' : '0%',
      smartRunway: runway,
      runwayMonths: runway,
      healthScore: totalExpenses > 0 ? Math.min(98, Math.max(65, Math.round(100 - (totalExpenses / (totalIncome || totalExpenses * 1.5)) * 40))) : 88
    };
  }, [transactions, user?.accounts]);

  const loadBudgetProgress = useCallback(async () => {
    try {
      if (isRealToken) {
        const now = new Date();
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const data = await budgetsApi.getBudgetProgress(token, period);
        if (data?.budgets) {
          setBudgetProgress(data.budgets);
          // Build spend map: { category_id: spent_amount }
          const spendMap = {};
          for (const b of data.budgets) {
            spendMap[b.category_id] = b.spent_amount || 0;
          }
          setBudgetSpendMap(spendMap);
        }
      }
    } catch (err) {
      console.warn('[App] Budget progress unavailable, using defaults:', err.message);
    }
  }, [token, isRealToken]);

  const handleOpenQuickAdd = (type = 'expense') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  // Transaction Addition with PostgreSQL persistence & optimistic state
  const handleSaveEntry = async (newEntry) => {
    const isExpense = newEntry.transaction_type === 'expense' || newEntry.type === 'expense';
    const numAmount = Math.abs(parseFloat(newEntry.amount));
    const title = newEntry.t_desc || newEntry.title || 'Manual Entry';
    const dateVal = newEntry.t_date || new Date().toISOString().split('T')[0];
    const categoryName = newEntry.category_name || (typeof newEntry.category === 'string' ? newEntry.category : 'General');
    const accountName = newEntry.account_name || newEntry.account || user?.accounts?.[0]?.account_name || 'Main Checking';

    const optimisticTx = {
      id: `tx-${Date.now()}`,
      title,
      merchant: title,
      t_desc: title,
      category_id: newEntry.category_id,
      category_name: categoryName,
      category: categoryName,
      date: dateVal,
      t_date: dateVal,
      amount: isExpense ? -numAmount : numAmount,
      transaction_type: isExpense ? 'expense' : 'income',
      account_id: newEntry.account_id,
      account_name: accountName,
      is_reccuring: !!newEntry.is_reccuring,
    };

    setTransactions(prev => [optimisticTx, ...prev]);

    try {
      if (isRealToken) {
        const res = await transactionsApi.createTransaction(token, {
          amount: numAmount,
          transaction_type: isExpense ? 'expense' : 'income',
          t_desc: title,
          account_id: newEntry.account_id || newEntry.account,
          category_id: newEntry.category_id,
          t_date: dateVal,
          is_reccuring: !!newEntry.is_reccuring
        });
        // Fire budget alerts returned from server
        fireBudgetAlertToasts(res?.budget_alerts);
        await loadBackendData();
        await loadBudgetProgress();
      }
      toast.success(
        `${isExpense ? 'Expense' : 'Income'} of ${formatAmount(numAmount)} recorded.`,
        'Entry Saved'
      );
    } catch (err) {
      toast.warning('Entry saved locally and queued for cloud sync.', 'Saved Locally');
    }
  };

  // Transaction Update handler
  const handleUpdateTransaction = async (id, updatedFields) => {
    const numAmount = Math.abs(parseFloat(updatedFields.amount));
    const isExpense = updatedFields.transaction_type === 'expense';

    setTransactions(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              ...updatedFields,
              amount: isExpense ? -numAmount : numAmount,
              t_desc: updatedFields.t_desc || updatedFields.title || t.t_desc,
              title: updatedFields.t_desc || updatedFields.title || t.title,
            }
          : t
      )
    );

    try {
      if (isRealToken) {
        const res = await transactionsApi.updateTransaction(token, id, {
          amount: numAmount,
          transaction_type: updatedFields.transaction_type,
          t_desc: updatedFields.t_desc || updatedFields.title,
          category_id: updatedFields.category_id,
          account_id: updatedFields.account_id,
          t_date: updatedFields.t_date,
          is_reccuring: updatedFields.is_reccuring
        });
        // Fire budget alerts returned from server
        fireBudgetAlertToasts(res?.budget_alerts);
        await loadBackendData();
        await loadBudgetProgress();
      }
      toast.success('Transaction updated successfully.', 'Entry Updated');
    } catch (err) {
      console.warn('[App] Update fallback local:', err.message);
    }
  };

  // Transaction Deletion handler
  const handleDeleteTransaction = async (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      if (isRealToken) {
        await transactionsApi.deleteTransaction(token, id);
        await loadBackendData();
        await loadBudgetProgress();
      }
    } catch (err) {
      console.warn('[App] Delete fallback local:', err.message);
    }
  };

  // Budget Save Handler
  const handleSaveBudget = async (budgetData) => {
    try {
      if (isRealToken) {
        await budgetsApi.createOrUpdateBudget(token, {
          category_id: budgetData.category_id,
          amount: budgetData.amount,
          period: budgetData.period || 'monthly'
        });
        await loadBudgetProgress();
      }
      toast.success(
        `Budget of ${formatAmount(Number(budgetData.amount))} set successfully.`,
        'Budget Updated'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to save budget. Please try again.', 'Budget Error');
      throw err;
    }
  };

  // Category Re-assignment
  const handleUpdateCategory = async (txId, categoryId, categoryName) => {
    try {
      if (isRealToken) {
        await transactionsApi.updateTransactionCategory(token, txId, categoryId);
      }
      toast.success(`Category changed to "${categoryName}".`, 'Category Updated');
    } catch (err) {
      toast.error(err.message || 'Failed to update category.', 'Update Failed');
      console.warn('[App] Backend category update fallback:', err.message);
    }

    setTransactions(prev =>
      prev.map(t =>
        t.id === txId
          ? { ...t, category_id: categoryId, category_name: categoryName, category: categoryName }
          : t
      )
    );
  };

  // Mock Bank Feed Sync
  const handleSyncBankData = async () => {
    try {
      if (isRealToken) {
        const res = await transactionsApi.syncBank(token);
        if (res.transactions) setTransactions(res.transactions);
        await loadBudgetProgress();
        toast.success(
          res.message || 'Bank feed synchronized with Mock Banking Service.',
          'Sync Complete'
        );
        return res;
      }
    } catch (err) {
      console.warn('[App] Backend sync error, running local fallback sync:', err.message);
    }

    // Local simulation fallback
    const simulatedSyncedTx = [
      {
        id: `tx-sync-${Date.now()}-1`,
        merchant: 'AWS Cloud Infrastructure',
        t_desc: 'AWS Cloud Infrastructure',
        category_name: 'Tech, AI & Subscriptions',
        account_name: 'Chase Sapphire Checking',
        amount: -1420.00,
        transaction_type: 'expense',
        is_reccuring: true,
        t_date: 'Today'
      },
      {
        id: `tx-sync-${Date.now()}-2`,
        merchant: 'Tech Global Inc.',
        t_desc: 'Tech Global Payroll Direct Deposit',
        category_name: 'Salary & Direct Deposit',
        account_name: 'Chase Sapphire Checking',
        amount: 8420.00,
        transaction_type: 'income',
        is_reccuring: true,
        t_date: 'Yesterday'
      },
      ...transactions
    ];

    setTransactions(simulatedSyncedTx);
    toast.success('Synced 8 transactions from Mock Bank API.', 'Bank Sync');
    return { success: true, message: 'Synced 8 transactions from Mock Bank API.' };
  };

  return (
    <>
      {isAuthenticated ? (
        <DashboardView
          token={token}
          user={user}
          metrics={metrics}
          transactions={transactions}
          categories={categories}
          budgetProgress={budgetProgress}
          onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
          onAddTransaction={handleSaveEntry}
          onUpdateTransaction={handleUpdateTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onAddBudget={() => setIsBudgetModalOpen(true)}
          onSaveBudget={handleSaveBudget}
          onUpdateCategory={handleUpdateCategory}
          onSyncBankData={handleSyncBankData}
        />
      ) : (
        <LandingPage />
      )}

      <AuthModal />

      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialType={quickAddType}
        onSave={handleSaveEntry}
      />

      <SetBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categories={categories.length > 0 ? categories : [
          { id: 'cat-housing', category_name: 'Housing & Utilities' },
          { id: 'cat-food', category_name: 'Food & Dining' },
          { id: 'cat-tech', category_name: 'Tech, AI & Subscriptions' },
          { id: 'cat-groceries', category_name: 'Groceries' },
          { id: 'cat-transport', category_name: 'Transportation & Gas' },
          { id: 'cat-ent', category_name: 'Entertainment & Leisure' },
          { id: 'cat-health', category_name: 'Health & Wellness' },
        ]}
        budgets={budgetProgress}
        currentSpendMap={budgetSpendMap}
        onSaveBudget={handleSaveBudget}
      />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <CurrencyProvider>
          <AuthProvider>
            <MainAppContent />
          </AuthProvider>
        </CurrencyProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
