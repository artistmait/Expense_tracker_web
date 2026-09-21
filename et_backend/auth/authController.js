import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { validateRegistration, validateLogin, validateProfileUpdate } from './authValidation.js';
import { syncBankFeedForUser } from '../services/bankSyncService.js';

// JWT generator helper
const generateToken = (userId, email) => {
  const secret = process.env.JWT_SECRET || 'budgetmate_super_secure_jwt_secret_key_2026_x89a';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, email }, secret, { expiresIn });
};

// -------------------------------------------------------------
// POST /api/auth/register
// -------------------------------------------------------------
export const register = async (req, res) => {
  try {
    const { username, full_name, email, password, initialAccount, sync_mock_bank } = req.body;

    // 1. Validate inputs
    const validation = validateRegistration({ username, full_name, email, password, initialAccount });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanFullName = full_name.trim();

    // 2. Check if email or username is already registered (case-insensitive)
    const existingUser = await query(
      'SELECT id, email, username FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
      [cleanEmail, cleanUsername]
    );

    if (existingUser.rows.length > 0) {
      const match = existingUser.rows[0];
      if (match.email.toLowerCase() === cleanEmail) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please log in instead.',
        });
      }
      if (match.username.toLowerCase() === cleanUsername) {
        return res.status(409).json({
          success: false,
          message: 'This username is already taken. Please choose another username.',
        });
      }
    }

    // 3. Hash password using bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 4. Insert new user into `users` table
    const defaultAvatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256';
    const insertUserSql = `
      INSERT INTO users (username, full_name, email, password_hash, avatar_url, status)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, username, full_name, email, avatar_url, theme_preference, status, created_at
    `;
    const userResult = await query(insertUserSql, [
      cleanUsername,
      cleanFullName,
      cleanEmail,
      passwordHash,
      defaultAvatar,
    ]);

    const newUser = userResult.rows[0];

    // 5. Create initial account chosen during setup
    const accountName = (initialAccount?.account_name || 'Chase Sapphire Checking').trim();
    const accountType = (initialAccount?.account_type || 'checking').trim().toLowerCase();
    const initialBalance = parseFloat(initialAccount?.initial_balance) || 8420.00;
    const currency = (initialAccount?.currency || 'USD').trim().toUpperCase();

    const insertAccountSql = `
      INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING id, account_name, account_type, initial_balance, currency
    `;
    const accountResult = await query(insertAccountSql, [
      newUser.id,
      accountName,
      accountType,
      initialBalance,
      currency,
    ]);

    // 6. Optionally sync Mock Bank feed immediately
    let syncStatus = null;
    if (sync_mock_bank) {
      try {
        syncStatus = await syncBankFeedForUser(newUser.id);
      } catch (err) {
        console.warn('[Register] Optional bank sync notice:', err.message);
      }
    }

    // 7. Generate JWT token
    const token = generateToken(newUser.id, newUser.email);

    return res.status(201).json({
      success: true,
      message: sync_mock_bank
        ? 'Account created and synced with live Mock Bank feed.'
        : 'Account created successfully with initial setup.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.full_name,
        email: newUser.email,
        avatar_url: newUser.avatar_url,
        status: newUser.status,
        created_at: newUser.created_at,
        accounts: [accountResult.rows[0]],
      },
      bankSync: syncStatus,
    });
  } catch (err) {
    console.error('[Register Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// -------------------------------------------------------------
// POST /api/auth/login
// -------------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;

    // 1. Validate inputs
    const validation = validateLogin({ identifier, email, username, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    const searchIdentifier = validation.identifier.trim().toLowerCase();

    // 2. Find user by email or username (case-insensitive)
    const findUserSql = `
      SELECT id, username, full_name, email, password_hash, avatar_url, theme_preference, status, created_at
      FROM users
      WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)
    `;
    const result = await query(findUserSql, [searchIdentifier]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No user found matching the provided email or username. If you are new, please register or use 1-Click Demo.',
      });
    }

    const user = result.rows[0];

    // 3. Verify active status
    if (user.status === false) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently disabled. Please contact support.',
      });
    }

    // 4. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password entered.',
      });
    }

    // 5. Fetch linked accounts
    const accountsResult = await query(
      'SELECT id, account_name, account_type, initial_balance, currency FROM accounts WHERE user_id = $1 AND is_active = true ORDER BY created_at ASC',
      [user.id]
    );

    // 6. Generate JWT token
    const token = generateToken(user.id, user.email);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        theme_preference: user.theme_preference || null,
        status: user.status,
        created_at: user.created_at,
        accounts: accountsResult.rows,
      },
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

// -------------------------------------------------------------
// GET /api/auth/me (Protected Profile Route)
// -------------------------------------------------------------
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user details & active accounts
    const userResult = await query(
      'SELECT id, username, full_name, email, avatar_url, theme_preference, status, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const accountsResult = await query(
      'SELECT id, account_name, account_type, initial_balance, currency, is_active, created_at FROM accounts WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );

    return res.status(200).json({
      success: true,
      user: {
        ...userResult.rows[0],
        accounts: accountsResult.rows,
      },
    });
  } catch (err) {
    console.error('[GetMe Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching profile.',
    });
  }
};

// -------------------------------------------------------------
// PUT /api/auth/profile (Update Profile)
// -------------------------------------------------------------
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, username, email, avatar_url } = req.body;

    const validation = validateProfileUpdate({ full_name, username, email, avatar_url });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
    }

    // Check username/email conflicts if modified
    if (email || username) {
      const conflictCheck = await query(
        'SELECT id, email, username FROM users WHERE (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)) AND id != $3',
        [email || '', username || '', userId]
      );
      if (conflictCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'The updated email or username is already taken by another account.',
        });
      }
    }

    const updateSql = `
      UPDATE users
      SET 
        full_name = COALESCE($1, full_name),
        username = COALESCE($2, username),
        email = COALESCE($3, email),
        avatar_url = COALESCE($4, avatar_url),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, username, full_name, email, avatar_url, status, created_at, updated_at
    `;

    const result = await query(updateSql, [
      full_name?.trim() || null,
      username?.trim()?.toLowerCase() || null,
      email?.trim()?.toLowerCase() || null,
      avatar_url || null,
      userId,
    ]);

    const updatedUser = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (err) {
    console.error('[UpdateProfile Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating profile.',
    });
  }
};

// -------------------------------------------------------------
// PUT /api/auth/change-password
// -------------------------------------------------------------
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Current password and a new password (min 6 characters) are required.',
      });
    }

    const userRes = await query('SELECT password_hash FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, userRes.rows[0].password_hash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password entered is incorrect.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [
      newHash,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (err) {
    console.error('[ChangePassword Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error changing password.',
    });
  }
};

// -------------------------------------------------------------
// PUT /api/auth/theme (Update Theme Preference)
// -------------------------------------------------------------
export const updateTheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;

    const validThemes = ['light', 'dark', 'system', null];
    if (theme !== undefined && !validThemes.includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme preference. Must be "light", "dark", "system", or null.',
      });
    }

    const themeValue = theme === 'system' ? null : theme;

    const result = await query(
      'UPDATE users SET theme_preference = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, username, email, theme_preference',
      [themeValue, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Theme preference saved.',
      theme_preference: result.rows[0].theme_preference,
    });
  } catch (err) {
    console.error('[UpdateTheme Error]:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating theme preference.',
    });
  }
};
