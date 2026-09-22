const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:5000/api';

export const budgetsApi = {
  // Fetch budget progress for a specified month (e.g. '2026-09')
  async getBudgetProgress(token, period) {
    try {
      const url = period 
        ? `${API_BASE_URL}/budgets/progress?period=${encodeURIComponent(period)}`
        : `${API_BASE_URL}/budgets/progress`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch budget progress');
      }
      return data;
    } catch (err) {
      console.warn('[budgetsApi] Fetch progress warning:', err.message);
      throw err;
    }
  },

  // Fetch list of user budgets
  async getBudgets(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch budgets');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Create or update a budget
  async createOrUpdateBudget(token, { category_id, amount, period = 'monthly' }) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ category_id, amount, period }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save budget');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Delete a budget
  async deleteBudget(token, id) {
    try {
      const res = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete budget');
      }
      return data;
    } catch (err) {
      throw err;
    }
  }
};
