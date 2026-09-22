/**
 * ============================================================
 * BudgetMate — Deterministic Demo Data Seeder (`npm run seed:demo`)
 * ============================================================
 *
 * Generates realistic synthetic history for 3 demo personas so the
 * dashboard, budget alerts (Block 2.1c) and rule-based advisor
 * (Block 3.1) have real stories to react to. Reproducible: a fixed
 * PRNG seed produces identical data on every run.
 *
 * Personas:
 *   1. Saver        — under budget everywhere, healthy multi-month runway,
 *                     "Primary Wealth Vault" savings goal, stable recurring
 *                     bills, one gentle trend (groceries +15%) that stays
 *                     under budget — advisor shows only a mild LARGEST_INCREASE.
 *   2. Overspender  — Dining +40% this month vs last (triggers CATEGORY_SURGE
 *                     and live BUDGET_ALERT_80/100 on the next dining txn),
 *                     Entertainment +55%, subscriptions ≈10.7% of income
 *                     (triggers HIGH_SUBSCRIPTIONS), runway < 1.5 months
 *                     (triggers NO_EMERGENCY_FUND, critical), 3 categories
 *                     over budget (food, entertainment, tech).
 *   3. New user     — created this week, 3 transactions, no budgets —
 *                     proves empty states don't break.
 *
 * Schema reality (verified against config/schema.sql):
 *   - NO recurring_transactions table: recurrence is transactions.is_reccuring
 *     = true + same (merchant, amount, day-of-month) every month.
 *   - NO financial_goals table: advisorService infers an emergency-fund goal
 *     from account names containing vault/savings/emergency.
 *   - monthly_summaries IS seeded (dashboard historical months read it —
 *     previously a read-but-never-written audit gap).
 *   - budget_alert_log is seeded for the overspender's historical breaches so
 *     old news doesn't re-toast; the CURRENT month's breaches stay unlogged
 *     so adding one more dining/entertainment txn fires a fresh live alert.
 *
 * Run:  npm run seed:demo   (wipes the 3 demo personas, reseeds everything)
 * Guard: refuses to run when NODE_ENV=production.
 * Demo logins: saver@budgetmate.io / overspender@budgetmate.io /
 *              newbie@budgetmate.io — all with password `password123`.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDirectRun = process.argv[1] === __filename;

if (isDirectRun && process.env.NODE_ENV === 'production') {
  console.error('[Seeder] FATAL: refusing to seed demo data in production.');
  process.exit(1);
}

// ------------------------------------------------------------
// Deterministic PRNG (mulberry32) + seeded helpers (exported for tests)
// ------------------------------------------------------------
export const makeRng = (seed) => {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
let rng = makeRng(20260922);                      // fixed seed — reproducible
const rand = (min, max) => min + rng() * (max - min);
const randInt = (min, max) => Math.floor(rand(min, max + 1));
const pick = (arr) => arr[randInt(0, arr.length - 1)];
// Skewed amount distribution: mostly small transactions, occasionally large
// (~70% of draws land in the bottom third of the range) — like real spending.
const skewedAmount = (min, max) => Math.round((min + rng() * rng() * (max - min)) * 100) / 100;
const round2 = (n) => Math.round(n * 100) / 100;

// ------------------------------------------------------------
// Calendar helpers — history ends "today", extends back N months
// ------------------------------------------------------------
const MONTHS_OF_HISTORY = 8;
// Snapshot once at module load: a single seeding run must observe one
// consistent "today" (two microsecond-different Date.now() reads would
// otherwise change date boundaries mid-run and break determinism).
const today = new Date();
const TODAY_ISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const periodOf = (offset) => {
  const d = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const dateIn = (offset, day) => {
  const d = new Date(today.getFullYear(), today.getMonth() - offset, day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const daysInPeriod = (offset) => {
  const [y, m] = periodOf(offset).split('-').map(Number);
  const last = new Date(y, m, 0).getDate();
  return offset === 0 ? Math.min(last, today.getDate()) : last;
};

// ------------------------------------------------------------
// Category definitions (match config/seedSystem.sql system categories)
// base = average non-recurring txns/month at trend 1.0
// ------------------------------------------------------------
const CAT = {
  housing:  { name: 'Housing & Utilities',      min: 60,  max: 220, base: 2 },
  food:     { name: 'Food & Dining',            min: 9,   max: 95,  base: 12 },
  groceries:{ name: 'Groceries',                min: 14,  max: 160, base: 5 },
  transport:{ name: 'Transportation & Gas',     min: 12,  max: 90,  base: 6 },
  ent:      { name: 'Entertainment & Leisure',  min: 10,  max: 120, base: 5 },
  tech:     { name: 'Tech, AI & Subscriptions', min: 8,   max: 60,  base: 1 },
  health:   { name: 'Health & Wellness',        min: 15,  max: 140, base: 1 },
  salary:   { name: 'Salary & Direct Deposit',  min: 0,   max: 0,   base: 0 },
  invest:   { name: 'Investments & Dividends',  min: 120, max: 420, base: 0 },
};

// Recurring bills — same merchant, same amount, same day, every month.
const RECURRING_BILLS = {
  saver: [
    { cat: 'tech',    merchant: 'Netflix',                   amount: 22.99, day: 4 },
    { cat: 'tech',    merchant: 'Spotify Premium',           amount: 11.99, day: 7 },
    { cat: 'health',  merchant: 'Equinox Fitness Club',      amount: 210.0, day: 9 },
    { cat: 'housing', merchant: 'City Power & Water',        amount: 148.4, day: 12 },
  ],
  overspender: [
    { cat: 'tech',    merchant: 'Netflix',                   amount: 22.99, day: 4 },
    { cat: 'tech',    merchant: 'Adobe Creative Cloud',      amount: 82.99, day: 5 },
    { cat: 'tech',    merchant: 'ChatGPT Plus',              amount: 20.0,  day: 6 },
    { cat: 'tech',    merchant: 'Spotify Premium',           amount: 11.99, day: 7 },
    { cat: 'tech',    merchant: 'AWS Cloud Infrastructure',  amount: 520.0, day: 8 },
    { cat: 'tech',    merchant: 'iCloud Storage 2TB',        amount: 9.99,  day: 3 },
    { cat: 'tech',    merchant: 'NYTimes Digital',           amount: 17.0,  day: 18 },
    { cat: 'ent',     merchant: 'GamePass Ultimate',         amount: 19.99, day: 15 },
    { cat: 'health',  merchant: 'Equinox Fitness Club',      amount: 210.0, day: 9 },
    { cat: 'housing', merchant: 'WeWork Office Property',    amount: 3200.0, day: 1 },
  ],
};

// Non-recurring merchant pools per category
const MERCHANTS = {
  food:      ['Sweetgreen', 'Chipotle', 'Blue Bottle Coffee', 'Ramen Nagi', 'Joe & The Juice', 'Tacos El Gordo', 'Pret A Manger'],
  groceries: ['Whole Foods Market', 'Trader Joes', 'Safeway', 'Costco Wholesale'],
  transport: ['Shell Gas Station', 'Uber', 'Lyft', 'SF Municipal Transit'],
  ent:       ['AMC Theatres', 'Steam Games', 'Live Nation Concerts', 'Bowlmor Lanes'],
  health:    ['CVS Pharmacy', 'Planet Fitness Day Pass', 'Dr. Miller Dental'],
  housing:   ['Comcast Internet', 'Verizon Mobile'],
  tech:      ['App Store Purchase', 'Notion Plus', 'Figma Professional'],
};

// ------------------------------------------------------------
// Persona definitions — the trend story lives in `trend`
// (multiplier applied to the CURRENT month; month-1 stays at
// baseline so current-vs-prev deltas are sharp and readable)
// ------------------------------------------------------------
export const PERSONAS = {
  saver: {
    email: 'saver@budgetmate.io',
    username: 'saver_sam',
    fullName: 'Sam Solver',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    monthlyIncome: 7200,
    vault: { name: 'Primary Wealth Vault', balance: 30500.0 },
    accounts: [
      { name: 'Chase Sapphire Checking', type: 'checking',    balance: 9120.4 },
      { name: 'Amex Reserve Platinum',   type: 'credit_card', balance: 1240.15 },
    ],
    budgets: [
      ['Housing & Utilities', 2600], ['Food & Dining', 900], ['Groceries', 800],
      ['Transportation & Gas', 500], ['Entertainment & Leisure', 450],
      ['Tech, AI & Subscriptions', 350], ['Health & Wellness', 600],
    ],
    trend: { groceries: 1.15 },   // mild, stays under budget; below the 20% surge threshold
    volume: { food: 15, groceries: 6, transport: 6, ent: 4, tech: 1, health: 1, housing: 2 },
  },
  overspender: {
    email: 'overspender@budgetmate.io',
    username: 'overspender_ola',
    fullName: 'Ola Verdraft',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
    monthlyIncome: 6800,
    vault: { name: 'Tiny Rainy Day Fund', balance: 1450.0 },   // with thin checking → runway < 1.5
    accounts: [
      { name: 'Chase Sapphire Checking', type: 'checking',    balance: 640.2 },
      { name: 'Amex Reserve Platinum',   type: 'credit_card', balance: 3180.75 },
    ],
    budgets: [
      ['Housing & Utilities', 3800], ['Food & Dining', 450],   // will exceed
      ['Groceries', 700], ['Transportation & Gas', 350],
      ['Entertainment & Leisure', 250],                        // will exceed
      ['Tech, AI & Subscriptions', 700],                       // will exceed
      ['Health & Wellness', 550],                              // recurring gym keeps this near half
    ],
    // THE story: dining +40% this month vs last (the advisor's CATEGORY_SURGE
    // picks the max surge → food must outpace entertainment's bump).
    trend: { food: 1.4, ent: 1.3 },
    volume: { food: 18, groceries: 6, transport: 8, ent: 7, tech: 1, health: 2, housing: 2 },
  },
  newuser: {
    email: 'newbie@budgetmate.io',
    username: 'newbie_nia',
    fullName: 'Nia Newleaf',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    monthlyIncome: 0,
    vault: { name: 'Rainy Day Savings', balance: 500.0 },  // advisor sees a fund → no runway warning
    accounts: [{ name: 'Everyday Checking', type: 'checking', balance: 250.0 }],
    budgets: [],
    trend: {},
    volume: {},
    // All amounts small enough to stay under the advisor's insight floors
    // (surge needs a category ≥ $50, largest-increase needs +$40) so the
    // new user produces ZERO advisor insights and pure empty states.
    recentOnly: [
      { cat: 'groceries', merchant: 'Whole Foods Market', amount: 32.4, daysAgo: 4 },
      { cat: 'food',      merchant: 'Blue Bottle Coffee', amount: 6.75, daysAgo: 3 },
      { cat: 'food',      merchant: 'Chipotle',           amount: 13.5, daysAgo: 1 },
    ],
  },
};

const DEMO_PASSWORD_HASH = '$2b$10$RMU4itoLh.GcDEthpUIwP.VygtXLre8cc71p6KTw55UoWOWNtMG8i'; // password123

// ------------------------------------------------------------
// In-memory row buffers (reset per persona)
// ------------------------------------------------------------
let txRows = [];      // { categoryId, amount, type, desc, recurring, date }
let summaryRows = []; // { categoryId, period, totalSpent }
let alertRows = [];   // { categoryId, period, rule, live }

const categoryId = {}; // catKey -> uuid, filled from DB

const addTx = (catKey, { amount, date, type = 'expense', recurring = false, merchant, desc }) => {
  txRows.push({
    categoryId: categoryId[catKey] || null,
    amount: round2(amount),
    type,
    desc: String(desc || merchant).slice(0, 255),
    recurring,
    date,
  });
};

const buildPersona = (p) => {
  for (let m = MONTHS_OF_HISTORY - 1; m >= 0; m--) {
    const maxDay = daysInPeriod(m);
    // Trend model: month-1 is the baseline (1.0); ONLY the current month gets
    // the full multiplier — so current-vs-prev deltas are sharp. Older months
    // wander mildly around 1.0 (deterministic jitter) instead of being flat.
    const trendMul = (catKey) => {
      if (m === 0) return p.trend[catKey] ?? 1;
      if (m === 1) return 1;
      return p.trend[catKey] ? 1 + (rng() - 0.5) * 0.12 : 1;
    };

    // Income: salary near month start, dividends mid-month
    if (p.monthlyIncome > 0) {
      addTx('salary', {
        amount: p.monthlyIncome,
        date: dateIn(m, Math.min(2, maxDay)),
        type: 'income', recurring: true,
        merchant: 'Tech Global Inc.', desc: 'Tech Global Inc. synced from bank feed',
      });
      if (rng() < 0.7) {
        addTx('invest', {
          amount: skewedAmount(CAT.invest.min, CAT.invest.max),
          date: dateIn(m, randInt(10, 20)),
          type: 'income', merchant: 'NVIDIA Dividend Corp.',
        });
      }
    }

    // Recurring bills: identical (merchant, amount, day) every month
    const bills = p === PERSONAS.saver ? RECURRING_BILLS.saver : RECURRING_BILLS.overspender;
    for (const bill of bills) {
      if (bill.day <= maxDay) {
        addTx(bill.cat, { amount: bill.amount, date: dateIn(m, bill.day), recurring: true, merchant: bill.merchant });
      }
    }

    // Variable spending: skewed amounts, volume scaled by the trend
    for (const [catKey, def] of Object.entries(CAT)) {
      if (def.base === 0) continue;
      const vol = p.volume[catKey] || 0;
      const count = Math.max(0, Math.round(vol * trendMul(catKey) * rand(0.8, 1.2)));
      for (let i = 0; i < count; i++) {
        // Overspender's dining clusters late-month (paycheck socializing)
        const day = catKey === 'food' && p === PERSONAS.overspender
          ? randInt(Math.max(1, maxDay - 10), maxDay)
          : randInt(1, maxDay);
        addTx(catKey, {
          amount: skewedAmount(def.min, def.max),
          date: dateIn(m, Math.min(day, maxDay)),
          merchant: pick(MERCHANTS[catKey] || ['Misc Merchant']),
        });
      }
    }
  }
};

const buildNewUser = (p) => {
  for (const t of p.recentOnly) {
    const d = new Date(today.getTime() - t.daysAgo * 86400000);
    addTx(t.cat, {
      amount: t.amount,
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      merchant: t.merchant,
    });
  }
};

/**
 * Trend calibration — raw generation with skewed amounts has month-total
 * variance of ±25%, which drowns an intentional 15-40% story at low txn
 * counts. This pass re-anchors each trending category's CURRENT month to
 * `lastMonth × trend` (±2% jitter) by scaling that month's variable txns
 * (recurring bills untouched — they recur by definition). Month-over-month
 * deltas then land deterministically where the advisor reads them.
 */
const calibrateTrends = (p) => {
  const curPeriod = periodOf(0);
  const prevPeriod = periodOf(1);
  for (const [catKey, def] of Object.entries(CAT)) {
    if (def.base === 0 || !(p.volume[catKey] > 0)) continue;
    // Trending categories hit their story multiplier; all others get a ±5%
    // nudge so raw variance can't fabricate phantom surges (>20% triggers
    // the advisor) in categories that are supposed to be calm.
    const mul = p.trend[catKey] ?? rand(0.95, 1.05);
    const cid = categoryId[catKey];
    if (!cid) continue;
    const inPeriod = (period) => txRows.filter(
      (t) => t.type === 'expense' && t.categoryId === cid && t.date.startsWith(period)
    );
    const cur = inPeriod(curPeriod);
    const prev = inPeriod(prevPeriod);
    const prevTotal = prev.reduce((s, t) => s + t.amount, 0);
    const curTotal = cur.reduce((s, t) => s + t.amount, 0);
    if (prevTotal <= 0 || curTotal <= 0) continue;

    // Variable txns absorb the correction; fixed recurring bills keep their amount
    const adjustable = cur.filter((t) => !t.recurring);
    const adjustableTotal = adjustable.reduce((s, t) => s + t.amount, 0);
    if (!adjustable.length || adjustableTotal <= 0) continue;

    const target = prevTotal * mul * rand(0.98, 1.02);
    const factor = (target - (curTotal - adjustableTotal)) / adjustableTotal;
    for (const t of adjustable) {
      t.amount = round2(Math.max(CAT[catKey].min * 0.5, t.amount * factor));
    }
  }
};

/**
 * Post-generation pass: monthly_summaries for every (month, category) plus
 * budget_alert_log rows for every historical threshold crossing. Live
 * (`live: true`) rows are intentionally NOT inserted — the current month's
 * breaches stay unlogged so the next matching expense fires a fresh toast.
 */
const summarizeAndAlert = (personaKey, categoryBudgets) => {
  const spend = new Map(); // `${period}|${categoryId}` -> total
  for (const t of txRows) {
    if (t.type !== 'expense' || !t.categoryId) continue;
    const period = t.date.slice(0, 7);
    const key = `${period}|${t.categoryId}`;
    spend.set(key, round2((spend.get(key) || 0) + t.amount));
  }

  for (let m = MONTHS_OF_HISTORY - 1; m >= 0; m--) {
    const period = periodOf(m);
    for (const cid of Object.values(categoryId)) {
      const spent = spend.get(`${period}|${cid}`);
      if (spent > 0) summaryRows.push({ categoryId: cid, period, totalSpent: spent });
    }
  }

  const isCurrentPersonaOverspender = personaKey === 'overspender';
  for (const [catName, budgetAmount] of categoryBudgets) {
    const catKey = Object.keys(CAT).find((k) => CAT[k].name === catName);
    const cid = categoryId[catKey];
    if (!cid || !budgetAmount) continue;
    for (let m = MONTHS_OF_HISTORY - 1; m >= 0; m--) {
      const period = periodOf(m);
      const spent = spend.get(`${period}|${cid}`) || 0;
      const pct = (spent / budgetAmount) * 100;
      const live = m === 0 && isCurrentPersonaOverspender; // current-month breaches stay fresh
      if (pct >= 100) alertRows.push({ categoryId: cid, period, rule: 'BUDGET_ALERT_100', live });
      else if (pct >= 80) alertRows.push({ categoryId: cid, period, rule: 'BUDGET_ALERT_80', live });
    }
  }
};

// ------------------------------------------------------------
// Chunked multi-row INSERT (fast — one statement per 250 rows)
// ------------------------------------------------------------
const chunkedInsert = async (client, table, columns, rowFn, rows) => {
  const CHUNK = 250;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const values = [];
    const params = [];
    chunk.forEach((row, idx) => {
      const placeholders = rowFn(row).map((v) => `$${params.push(v)}`);
      values.push(`(${placeholders.join(', ')})`);
    });
    await client.query(
      `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values.join(', ')}`,
      params
    );
  }
};

// ------------------------------------------------------------
// Main
// ------------------------------------------------------------
const main = async ({ endPool = true } = {}) => {
  // Reset the PRNG at the start of EVERY run so repeated runs (tests, CLI)
  // produce identical output instead of continuing the same random stream.
  rng = makeRng(20260922);
  console.log('[Seeder] Deterministic demo seed (fixed seed 20260922)…');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Ensure system categories exist (canonical seed file, idempotent)
    await client.query(fs.readFileSync(path.join(__dirname, 'seedSystem.sql'), 'utf8'));
    const catRes = await client.query('SELECT id, category_name FROM categories WHERE is_system = true');
    for (const row of catRes.rows) {
      const key = Object.keys(CAT).find((k) => CAT[k].name === row.category_name);
      if (key) categoryId[key] = row.id;
    }
    const mapped = Object.keys(categoryId).length;
    if (mapped < 7) throw new Error(`Only ${mapped} system categories matched — check seedSystem.sql`);
    console.log(`[Seeder] ${mapped} system categories mapped.`);

    // 2. WIPE previous demo personas (FK cascades remove all their data)
    const emails = Object.values(PERSONAS).map((p) => p.email);
    const wiped = await client.query('DELETE FROM users WHERE email = ANY($1)', [emails]);
    console.log(`[Seeder] Wiped ${wiped.rowCount} previous demo user(s).`);

    for (const [personaKey, p] of Object.entries(PERSONAS)) {
      txRows = []; summaryRows = []; alertRows = [];

      const userRes = await client.query(
        `INSERT INTO users (username, full_name, email, password_hash, avatar_url, status)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING id`,
        [p.username, p.fullName, p.email, DEMO_PASSWORD_HASH, p.avatar]
      );
      const userId = userRes.rows[0].id;

      const accountIds = [];
      for (const a of p.accounts) {
        const res = await client.query(
          `INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
           VALUES ($1, $2, $3, $4, 'USD', true) RETURNING id`,
          [userId, a.name, a.type, a.balance]
        );
        accountIds.push(res.rows[0].id);
      }
      let vaultId = null;
      if (p.vault) {
        const res = await client.query(
          `INSERT INTO accounts (user_id, account_name, account_type, initial_balance, currency, is_active)
           VALUES ($1, $2, 'savings', $3, 'USD', true) RETURNING id`,
          [userId, p.vault.name, p.vault.balance]
        );
        vaultId = res.rows[0].id;
      }

      for (const [catName, amount] of p.budgets) {
        const catKey = Object.keys(CAT).find((k) => CAT[k].name === catName);
        await client.query(
          `INSERT INTO budgets (user_id, category_id, amount, period)
           VALUES ($1, $2, $3, 'monthly')
           ON CONFLICT (user_id, category_id, period) DO UPDATE SET amount = EXCLUDED.amount`,
          [userId, categoryId[catKey], amount]
        );
      }

      if (personaKey === 'newuser') buildNewUser(p); else { buildPersona(p); calibrateTrends(p); }

      // Alternate spend across spending accounts; income lands in the vault
      const txRowsForInsert = txRows.map((t, i) => ({
        ...t,
        accountId: t.type === 'income' && vaultId ? vaultId : accountIds[i % accountIds.length],
      }));
      await chunkedInsert(
        client, 'transactions',
        ['user_id', 'account_id', 'category_id', 'amount', 'transaction_type', 't_desc', 'is_reccuring', 't_date'],
        (t) => [userId, t.accountId, t.categoryId, t.amount, t.type, t.desc, t.recurring, t.date],
        txRowsForInsert
      );

      // New user has no history: no summaries, no alert log — empty states stay empty.
      if (personaKey !== 'newuser') summarizeAndAlert(personaKey, p.budgets);

      await chunkedInsert(
        client, 'monthly_summaries',
        ['user_id', 'category_id', 'month_period', 'total_spent'],
        (s) => [userId, s.categoryId, s.period, s.totalSpent],
        summaryRows
      );
      const loggedAlerts = alertRows.filter((a) => !a.live);
      await chunkedInsert(
        client, 'budget_alert_log',
        ['user_id', 'category_id', 'period', 'rule_code'],
        (a) => [userId, a.categoryId, a.period, a.rule],
        loggedAlerts
      );

      const liveCount = alertRows.length - loggedAlerts.length;
      console.log(
        `[Seeder] ${personaKey.padEnd(12)} ${String(txRows.length).padStart(5)} txns | ` +
        `${summaryRows.length} monthly summaries | ${loggedAlerts.length} historical alerts logged` +
        (liveCount > 0 ? ` | ${liveCount} LIVE breach(es) ready to toast on next spend` : '')
      );
    }

    await client.query('COMMIT');
    console.log('[Seeder] ✅ Done. Demo logins (password: password123):');
    for (const p of Object.values(PERSONAS)) console.log(`   - ${p.email.padEnd(30)} ${p.fullName}`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seeder] Failed, rolled back:', err.message);
    throw err;
  } finally {
    client.release();
    // Only the real CLI run owns the pool lifecycle — injected-client runs
    // (tests) leave the caller's pool untouched.
    if (endPool) await pool.end();
  }
};

// Self-execute only when run directly (`npm run seed:demo`), so tests can
// import the module without side effects.
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

// Testable surface: run the full seed against an injected client.
export const runSeed = async (injectedClient = null) => {
  if (injectedClient) {
    const origConnect = pool.connect.bind(pool);
    pool.connect = async () => injectedClient;
    try {
      return await main({ endPool: false });
    } finally {
      pool.connect = origConnect;
    }
  }
  return main();
};

export const DEMO_PASSWORD = 'password123';
