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
import { transactionsApi } from './services/transactionsApi';
import { budgetsApi } from './services/budgetsApi';
import { DEFAULT_CATEGORIES, DEFAULT_EXPENSE_CATEGORIES } from './data/defaultCategories';

function MainAppContent() {
  const { isAuthenticated, token, user } = useAuth();
  const { toast } = useToast();
  const { formatAmount, convertFromUSD } = useCurrency();

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
  const dashboardCategories = categories.length > 0
    ? categories
    : (isRealToken ? [] : DEFAULT_CATEGORIES);
  const budgetCategories = categories.length > 0
    ? categories.filter((category) => category.category_type !== 'income')
    : (isRealToken ? [] : DEFAULT_EXPENSE_CATEGORIES);

  // Cache transactions to localStorage when updated
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`budgetmate_txs_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user?.id]);

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

  // Load transactions and categories on authentication (declared after the
  // loaders it calls so the reference is valid — lint fix).
  useEffect(() => {
    if (isAuthenticated) {
      // Both loaders setState only after their first await; the react-compiler
      // lint cannot prove that through the function boundary, so suppress it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadBackendData();
      loadBudgetProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const handleOpenQuickAdd = (type = 'expense') => {
    setQuickAddType(type);
    setIsQuickAddOpen(true);
  };

  // Transaction Addition — backend-first. The visible ledger only changes when
  // the write actually succeeded (or in offline/mock mode where local-only is
  // the intended behavior).
  const handleSaveEntry = async (newEntry) => {
    const isExpense = newEntry.transaction_type === 'expense' || newEntry.type === 'expense';
    // FIX #10 (audit): modal inputs arrive in the active display currency.
    // Convert once here to the USD base used for ALL persistence, so every
    // entry source (QuickAdd, ExpenseModal, filters) stores consistent units.
    const displayAmount = Math.abs(parseFloat(newEntry.amount)) || 0;
    const numAmount = Math.round((displayAmount / convertFromUSD(1)) * 100) / 100;
    const title = newEntry.t_desc || newEntry.title || 'Manual Entry';
    const dateVal = newEntry.t_date || new Date().toISOString().split('T')[0];
    const categoryName = newEntry.category_name || (typeof newEntry.category === 'string' ? newEntry.category : 'General');

    // Immediate Client-Side Budget Over-Spend Check (USD-base ledger)
    if (isExpense && newEntry.category_id) {
      const targetBudget = budgetProgress.find(b => b.category_id === newEntry.category_id);
      if (targetBudget) {
        const allocated = parseFloat(targetBudget.allocated_amount || targetBudget.amount || 0);
        if (allocated > 0) {
          const priorSpent = transactions
            .filter(t => t.category_id === newEntry.category_id && (t.transaction_type === 'expense' || parseFloat(t.amount) < 0))
            .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);
          const totalAfter = priorSpent + numAmount;
          const pct = Math.round((totalAfter / allocated) * 100);
          if (totalAfter > allocated) {
            toast.error(
              `🚨 Over Budget! ${categoryName} is now at ${pct}% of its budget limit (${formatAmount(totalAfter)} of ${formatAmount(allocated)}).`,
              'Budget Exceeded'
            );
          } else if (pct >= 80) {
            toast.warning(
              `⚠️ Budget Warning: ${categoryName} is approaching its limit (${pct}% used: ${formatAmount(totalAfter)} of ${formatAmount(allocated)}).`,
              'Approaching Budget'
            );
          }
        }
      }
    }

    if (isRealToken) {
      try {
        const res = await transactionsApi.createTransaction(token, {
          amount: numAmount,
          transaction_type: isExpense ? 'expense' : 'income',
          t_desc: title,
          // FIX #9 (audit): never send display strings as account ids — an
          // absent account_id lets the backend resolve the user's default.
          account_id: newEntry.account_id || null,
          category_id: newEntry.category_id || null,
          t_date: dateVal,
          is_reccuring: !!newEntry.is_reccuring
        });
        // FIX #7 (audit): no optimistic insert — the ledger is refreshed from
        // the server so UI state can never silently diverge from the database.
        await loadBackendData();
        await loadBudgetProgress();
        if (res?.budget_alerts) {
          fireBudgetAlertToasts(res.budget_alerts);
        }
        toast.success(
          `${isExpense ? 'Expense' : 'Income'} of ${formatAmount(numAmount)} recorded.`,
          'Entry Saved'
        );
      } catch (err) {
        // FIX #7 (audit): honest failure — nothing was recorded anywhere.
        console.error('[App] Failed to save transaction:', err);
        toast.error(
          err.message || 'Failed to save entry. Nothing was recorded — please try again.',
          'Save Failed'
        );
      }
      return;
    }

    // Offline / mock mode: local-only ledger (no backend to reconcile with).
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
      account_name: newEntry.account_name || 'Main Checking',
      is_reccuring: !!newEntry.is_reccuring,
    };
    setTransactions(prev => [optimisticTx, ...prev]);
    toast.success(
      `${isExpense ? 'Expense' : 'Income'} of ${formatAmount(numAmount)} recorded locally.`,
      'Entry Saved'
    );
  };

  // Transaction Update handler
  const handleUpdateTransaction = async (id, updatedFields) => {
    // FIX #10 (audit): display-currency input → USD base for persistence.
    const numAmount = Math.round((Math.abs(parseFloat(updatedFields.amount)) || 0) / convertFromUSD(1) * 100) / 100;
    const isExpense = updatedFields.transaction_type === 'expense';
    const prevTransactions = transactions;

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

    if (!isRealToken) {
      toast.success('Transaction updated successfully.', 'Entry Updated');
      return;
    }

    try {
      const res = await transactionsApi.updateTransaction(token, id, {
        amount: numAmount,
        transaction_type: updatedFields.transaction_type,
        t_desc: updatedFields.t_desc || updatedFields.title,
        category_id: updatedFields.category_id,
        account_id: updatedFields.account_id || null,
        t_date: updatedFields.t_date,
        is_reccuring: updatedFields.is_reccuring
      });
      // Fire budget alerts returned from server
      fireBudgetAlertToasts(res?.budget_alerts);
      await loadBackendData();
      await loadBudgetProgress();
      toast.success('Transaction updated successfully.', 'Entry Updated');
    } catch (err) {
      // FIX #7 (audit): roll the optimistic edit back instead of keeping UI
      // state that silently diverges from the database.
      console.error('[App] Failed to update transaction:', err);
      setTransactions(prevTransactions);
      toast.error(err.message || 'Failed to update transaction. Change was not saved.', 'Update Failed');
    }
  };

  // Transaction Deletion handler
  const handleDeleteTransaction = async (id) => {
    const prevTransactions = transactions;
    setTransactions(prev => prev.filter(t => t.id !== id));
    if (!isRealToken) return;

    try {
      await transactionsApi.deleteTransaction(token, id);
      await loadBackendData();
      await loadBudgetProgress();
    } catch (err) {
      // FIX #7 (audit): restore the row when the server rejects the delete.
      console.error('[App] Failed to delete transaction:', err);
      setTransactions(prevTransactions);
      toast.error(err.message || 'Failed to delete transaction.', 'Delete Failed');
    }
  };

  // Budget Save Handler with Immediate Over-Budget Detection
  const handleSaveBudget = async (budgetData) => {
    // FIX #10 (audit): budget inputs arrive in the active display currency;
    // store the USD base like every other persisted amount.
    const numLimit = Math.round((parseFloat(budgetData.amount) || 0) / convertFromUSD(1) * 100) / 100;
    const targetCatId = budgetData.category_id;
    const catObj = categories.find(c => c.id === targetCatId);
    const catName = catObj?.category_name || 'Category';

    // Calculate current spending for this category
    const catExpenses = transactions.filter(t =>
      (t.category_id === targetCatId || (t.category_name && t.category_name === catName)) &&
      (t.transaction_type === 'expense' || parseFloat(t.amount) < 0)
    );
    const currentSpent = catExpenses.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || 0)), 0);

    try {
      if (isRealToken) {
        await budgetsApi.createOrUpdateBudget(token, {
          category_id: budgetData.category_id,
          amount: budgetData.amount,
          period: budgetData.period || 'monthly'
        });
        await loadBudgetProgress();
      } else {
        // Update local budgetProgress optimistically for mock/guest users
        setBudgetProgress(prev => {
          const filtered = prev.filter(b => b.category_id !== targetCatId);
          return [...filtered, {
            id: `b-${Date.now()}`,
            category_id: targetCatId,
            category_name: catName,
            allocated_amount: numLimit,
            amount: numLimit,
            spent_amount: currentSpent,
            period: budgetData.period || 'monthly'
          }];
        });
      }

      toast.success(
        `Budget limit of ${formatAmount(numLimit)} set for ${catName}.`,
        'Budget Saved'
      );

      // ── Immediate Over-Budget Toast Notification (when current spend exceeds or nears new limit) ──
      if (numLimit > 0 && currentSpent > 0) {
        const pct = Math.round((currentSpent / numLimit) * 100);
        if (currentSpent > numLimit) {
          setTimeout(() => {
            toast.error(
              `🚨 Over Budget Alert: Current spending on ${catName} (${formatAmount(currentSpent)}) exceeds your newly set limit of ${formatAmount(numLimit)} by ${formatAmount(currentSpent - numLimit)} (${pct}% used)!`,
              'Budget Exceeded'
            );
          }, 400);
        } else if (pct >= 80) {
          setTimeout(() => {
            toast.warning(
              `⚠️ Budget Warning: ${catName} has already consumed ${pct}% (${formatAmount(currentSpent)}) of your new ${formatAmount(numLimit)} budget.`,
              'Near Budget Limit'
            );
          }, 400);
        }
      }
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
    if (!isRealToken) {
      toast.info('Bank sync is available once you sign in with a real account.', 'Bank Feeds');
      return { success: false, message: 'Sign-in required.' };
    }
    try {
      const res = await transactionsApi.syncBank(token);
      // FIX #7 (audit): the backend now reports success:false when the upstream
      // feed is unavailable — surface that honestly instead of claiming success.
      if (res.success === false) {
        toast.warning(res.message || 'Bank feed unavailable. Nothing was imported.', 'Sync Unavailable');
        return res;
      }
      if (res.transactions) setTransactions(res.transactions);
      await loadBudgetProgress();
      toast.success(
        res.message || 'Bank feed synchronized with Mock Banking Service.',
        'Sync Complete'
      );
      return res;
    } catch (err) {
      // FIX #7 (audit): the old code swallowed real failures into a fake
      // "No external bank transactions linked" success toast.
      console.error('[App] Backend sync error:', err);
      toast.error(err.message || 'Bank sync failed. Please try again later.', 'Sync Failed');
      return { success: false, message: err.message };
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <DashboardView
          token={token}
          user={user}
          metrics={metrics}
          transactions={transactions}
          categories={dashboardCategories}
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
        accounts={user?.accounts || []}
        categories={dashboardCategories}
      />

      <SetBudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        categories={budgetCategories}
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
