import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ─── Currency Configuration ───────────────────────────────────────────────────
export const CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    name: 'Indian Rupee',
    flag: '🇮🇳',
    location: 'India',
    rateFromUSD: 83.5, // 1 USD = 83.5 INR (fixed approximate)
  },
  USD: {
    code: 'USD',
    symbol: '$',
    locale: 'en-US',
    name: 'US Dollar',
    flag: '🇺🇸',
    location: 'United States',
    rateFromUSD: 1.0, // base currency
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    name: 'Euro',
    flag: '🇪🇺',
    location: 'European Union',
    rateFromUSD: 0.92, // 1 USD = 0.92 EUR (fixed approximate)
  },
};

// Location → Currency mapping used during signup
export const LOCATION_CURRENCY_MAP = {
  India: 'INR',
  'United States': 'USD',
  'European Union': 'EUR',
};

export const SUPPORTED_LOCATIONS = Object.keys(LOCATION_CURRENCY_MAP);

const CurrencyContext = createContext(null);

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem('budgetmate_currency') || 'USD';
  });

  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;

  useEffect(() => {
    localStorage.setItem('budgetmate_currency', currencyCode);
  }, [currencyCode]);

  /**
   * Format a number as a currency string using the active currency.
   * All values are assumed to be stored in USD (base).
   * @param {number} value - Amount in USD base
   * @param {object} opts  - Intl options override
   */
  const formatAmount = useCallback(
    (value, opts = {}) => {
      const converted = Number(value) * currency.rateFromUSD;
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          ...opts,
        }).format(converted);
      } catch {
        // Fallback for environments where Intl is unavailable
        return `${currency.symbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      }
    },
    [currency]
  );

  /**
   * Convert a raw USD amount to the active currency value (number only, no formatting).
   */
  const convertFromUSD = useCallback(
    (usdValue) => Number(usdValue) * currency.rateFromUSD,
    [currency]
  );

  /**
   * Format a number that is ALREADY in the active currency (no conversion applied).
   */
  const formatRaw = useCallback(
    (value) => {
      try {
        return new Intl.NumberFormat(currency.locale, {
          style: 'currency',
          currency: currency.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(value));
      } catch {
        return `${currency.symbol}${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
      }
    },
    [currency]
  );

  const updateCurrency = useCallback((code) => {
    if (CURRENCIES[code]) setCurrencyCode(code);
  }, []);

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        currencyCode,
        symbol: currency.symbol,
        formatAmount,
        formatRaw,
        convertFromUSD,
        updateCurrency,
        allCurrencies: CURRENCIES,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider');
  return ctx;
};
