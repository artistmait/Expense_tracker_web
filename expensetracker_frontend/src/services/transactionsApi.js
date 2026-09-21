const API_BASE_URL = 'http://localhost:5000/api';

export const transactionsApi = {
  // Fetch transactions from backend with search, filtering & pagination
  async getTransactions(token, queryParams = {}) {
    try {
      const url = new URL(`${API_BASE_URL}/transactions`);
      Object.keys(queryParams).forEach(key => {
        const val = queryParams[key];
        if (val !== undefined && val !== null && val !== '') {
          if (Array.isArray(val)) {
            if (val.length > 0) url.searchParams.append(key, val.join(','));
          } else {
            url.searchParams.append(key, val);
          }
        }
      });

      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch transactions');
      return data;
    } catch (err) {
      console.warn('[TransactionsAPI] Fetch warning:', err.message);
      throw err;
    }
  },

  // Trigger bank sync
  async syncBank(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Bank synchronization failed');
      return data;
    } catch (err) {
      console.warn('[TransactionsAPI] Sync warning:', err.message);
      throw err;
    }
  },

  // Manual transaction creation
  async createTransaction(token, transactionData) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to record entry');
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Full transaction update (amount, desc, date, category, account)
  async updateTransaction(token, transactionId, transactionData) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update transaction');
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Delete transaction (soft delete)
  async deleteTransaction(token, transactionId) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete transaction');
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Update category manually
  async updateTransactionCategory(token, transactionId, categoryId) {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions/${transactionId}/category`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ category_id: categoryId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update category');
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Fetch categories
  async getCategories(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch categories');
      return data;
    } catch (err) {
      throw err;
    }
  }
};
