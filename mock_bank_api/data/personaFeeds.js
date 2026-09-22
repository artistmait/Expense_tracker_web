// -------------------------------------------------------------
// Persona-scoped demo feeds (x-demo-user header → feed)
// -------------------------------------------------------------
// The seeder (et_backend/config/seedDemoData.js) gives each demo persona a
// coherent 8-month story. When that persona hits "Sync bank" in the app, the
// backend forwards the account email via the `x-demo-user` header and this
// module serves a feed CONSISTENT with that story:
//   - saver:       ordinary small purchases, nothing dramatic
//   - overspender: more dining (deepens the live Food & Dining breach) plus
//                  another subscription (reinforces the subscription audit rule)
//   - everyone else: untouched → the generic mock feed keeps flowing
//
// Rows land in recent days of the CURRENT month so they interact with live
// budgets/alerts. Re-syncing is idempotent: the backend's natural-key unique
// index dedups identical rows, so the second sync imports 0.
// -------------------------------------------------------------

const isoDay = (daysAgo) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString().split('T')[0];

const row = (id, { bankAccount, accountName, merchant, clean, amount, type = 'expense', daysAgo, recurring = false, raw, category }) => ({
  transaction_id: `tx_demo_${id}`,
  bank_account_id: bankAccount,
  account_name: accountName,
  bank_name: 'Chase Bank',
  merchant,
  clean_merchant: clean,
  raw_description: raw,
  amount,
  transaction_type: type,
  currency: 'USD',
  date: isoDay(daysAgo),
  is_recurring: recurring,
  // Exact system-category name (et_backend matches on it before keywords)
  suggested_category: category || 'Food & Dining',
  category_hint: category || 'Food & Dining',
  status: 'settled',
  icon: 'CreditCard',
});

// Account names below intentionally match the accounts the seeder creates
// (et_backend bankSyncService matches feed rows to user accounts by name).
const CHASE = { bankAccount: 'bank_acc_chase_chk_8492', accountName: 'Chase Sapphire Checking' };

export const PERSONA_FEEDS = {
  'saver@budgetmate.io': () => [
    row('saver_groceries', {
      category: 'Groceries',
      ...CHASE,
      merchant: 'Whole Foods Market',
      clean: 'Whole Foods Market',
      raw: 'WHOLE FOODS MKT #1012 SAN FRANCISCO CA',
      amount: 58.2,
      daysAgo: 1,
    }),
    row('saver_dining', {
      category: 'Food & Dining',
      ...CHASE,
      merchant: 'Tacos El Gordo Restaurant',
      clean: 'Tacos El Gordo',
      raw: 'POS DEBIT TACOS EL GORDO RESTAURANT',
      amount: 14.75,
      daysAgo: 3,
    }),
  ],

  'overspender@budgetmate.io': () => [
    // Dining continues to surge — next manual spend in Food & Dining fires the
    // LIVE 100% budget toast seeded by the seeder.
    row('ola_chipotle', {
      category: 'Food & Dining',
      ...CHASE,
      merchant: 'Chipotle Restaurant',
      clean: 'Chipotle',
      raw: 'POS DEBIT CHIPOTLE RESTAURANT #2231',
      amount: 24.5,
      daysAgo: 1,
    }),
    row('ola_sweetgreen', {
      category: 'Food & Dining',
      ...CHASE,
      merchant: 'Sweetgreen Restaurant',
      clean: 'Sweetgreen',
      raw: 'POS DEBIT SWEETGREEN RESTAURANT',
      amount: 18.75,
      daysAgo: 2,
    }),
    // One more subscription — feeds the SUBSCRIPTION_LOAD insight.
    row('ola_youtube', {
      category: 'Tech, AI & Subscriptions',
      ...CHASE,
      merchant: 'YouTube Premium Subscription',
      clean: 'YouTube',
      raw: 'RECURRING YOUTUBE PREMIUM SUBSCRIPTION',
      amount: 13.99,
      daysAgo: 4,
      recurring: true,
    }),
  ],
};

/** Returns the persona feed for an email, or null for unknown users. */
export const getPersonaFeed = (email) => {
  const build = PERSONA_FEEDS[email];
  return build ? build() : null;
};
