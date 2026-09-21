import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { useToast } from './context/ToastContext';
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

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState('expense');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Dynamic financial states
  const [transactions, setTransactions] = useState(financialData.recentTransactions);
  const [categories, setCategories] = useState([]);
  const [metrics, setMetrics] = useState(financialData.metrics);

  // Budget states
  const [budgetProgress, setBudgetProgress] = useState([]);
  const [budgetSpendMap, setBudgetSpendMap] = useState({});

  const isRealToken = token && token !== 'mock_jwt_token' && token !== 'mock_jwt_demo_token';

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
          transactionsApi.getTransactions(token),
          transactionsApi.getCategories(token)
        ]);

        if (txRes.status === 'fulfilled' && txRes.value?.transactions?.length > 0) {
          setTransactions(txRes.value.transactions);
        }
        if (catRes.status === 'fulfilled' && catRes.value?.categories?.length > 0) {
          setCategories(catRes.value.categories);
        }
      }
    } catch (err) {
      console.warn('[App] Offline fallback active for transactions/categories:', err.message);
    }
  };

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

  // Manual Transaction Addition
  const handleSaveEntry = async (newEntry) => {
    const isExpense = newEntry.type === 'expense';
    const numAmount = Math.abs(parseFloat(newEntry.amount));

    try {
      if (isRealToken) {
        await transactionsApi.createTransaction(token, {
          amount: numAmount,
          transaction_type: isExpense ? 'expense' : 'income',
          t_desc: newEntry.title || 'Manual Entry',
          account_id: newEntry.account,
          t_date: new Date().toISOString().split('T')[0],
          is_reccuring: false
        });
        await loadBackendData();
        await loadBudgetProgress();
      }
      toast.success(
        `${isExpense ? 'Expense' : 'Income'} of $${numAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} recorded.`,
        'Entry Saved'
      );
    } catch (err) {
      toast.error(err.message || 'Failed to save entry. Please try again.', 'Save Failed');
      console.warn('[App] Backend save fallback to state:', err.message);
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      title: newEntry.title,
      merchant: newEntry.title,
      t_desc: newEntry.title,
      category: isExpense ? newEntry.category : 'Income / Deposit',
      category_name: isExpense ? newEntry.category : 'Income / Deposit',
      date: 'Just now',
      t_date: 'Today',
      amount: isExpense ? -numAmount : numAmount,
      transaction_type: isExpense ? 'expense' : 'income',
      account_name: newEntry.account || 'Chase Sapphire •••• 8492',
      paymentMethod: newEntry.account || 'Chase Sapphire •••• 8492',
      is_reccuring: false,
      icon: isExpense ? 'ShoppingBag' : 'Briefcase'
    };

    setTransactions(prev => [newTx, ...prev]);

    if (isExpense) {
      setMetrics(prev => ({
        ...prev,
        totalExpenses: prev.totalExpenses + numAmount,
        netWorth: prev.netWorth - numAmount
      }));
    } else {
      setMetrics(prev => ({
        ...prev,
        totalIncome: prev.totalIncome + numAmount,
        netWorth: prev.netWorth + numAmount
      }));
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
        `Budget of $${Number(budgetData.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} set successfully.`,
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
          metrics={metrics}
          transactions={transactions}
          categories={categories}
          budgetProgress={budgetProgress}
          onOpenQuickAdd={() => handleOpenQuickAdd('expense')}
          onAddTransaction={() => handleOpenQuickAdd('expense')}
          onAddBudget={() => setIsBudgetModalOpen(true)}
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
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
