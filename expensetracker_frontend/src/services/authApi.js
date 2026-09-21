const API_BASE_URL = 'http://localhost:5000/api';

export const authApi = {
  // Register a new user with initial account setup
  async register({ username, full_name, email, password, initialAccount }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, full_name, email, password, initialAccount }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || (data.errors ? data.errors.join(', ') : 'Registration failed'));
      }
      return data;
    } catch (err) {
      console.warn('[Backend Auth API] Register notice:', err.message);
      throw err;
    }
  },

  // Login existing user
  async login({ identifier, password }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }
      return data;
    } catch (err) {
      console.warn('[Backend Auth API] Login notice:', err.message);
      throw err;
    }
  },

  // Fetch current user profile with JWT
  async getMe(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Update profile details
  async updateProfile(token, profileData) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Change password
  async changePassword(token, { currentPassword, newPassword }) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to change password');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Fetch accounts
  async getAccounts(token) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch accounts');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Create account
  async createAccount(token, accountData) {
    try {
      const res = await fetch(`${API_BASE_URL}/accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create account');
      }
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Update theme preference
  async updateTheme(token, theme) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/theme`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update theme preference');
      }
      return data;
    } catch (err) {
      console.warn('[authApi] Update theme error:', err.message);
      throw err;
    }
  },
};
