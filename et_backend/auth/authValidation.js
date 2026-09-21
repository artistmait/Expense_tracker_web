// Input validation helpers for Authentication

export const validateRegistration = ({ username, full_name, email, password, initialAccount }) => {
  const errors = [];

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    errors.push('Username is required and must be at least 3 characters long.');
  }

  if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters long.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (initialAccount) {
    if (initialAccount.account_name && initialAccount.account_name.trim().length === 0) {
      errors.push('Account name cannot be empty.');
    }
    if (initialAccount.initial_balance !== undefined && isNaN(Number(initialAccount.initial_balance))) {
      errors.push('Initial balance must be a valid numeric amount.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateLogin = ({ identifier, email, username, password }) => {
  const errors = [];
  const userIdentifier = identifier || email || username;

  if (!userIdentifier || typeof userIdentifier !== 'string' || userIdentifier.trim().length === 0) {
    errors.push('Email or username is required to sign in.');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    identifier: userIdentifier ? userIdentifier.trim() : '',
  };
};

export const validateProfileUpdate = ({ full_name, username, email, avatar_url }) => {
  const errors = [];

  if (full_name !== undefined && (typeof full_name !== 'string' || full_name.trim().length < 2)) {
    errors.push('Full name must be at least 2 characters.');
  }

  if (username !== undefined && (typeof username !== 'string' || username.trim().length < 3)) {
    errors.push('Username must be at least 3 characters.');
  }

  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('A valid email address is required.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
