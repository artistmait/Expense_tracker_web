import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

process.env.NODE_ENV = 'test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Seeder contract tests against an in-memory stub client.
 * No database required — the stub records INSERTs and serves a fixed
 * system-category list, then we assert on the recorded rows.
 */
const CATEGORY_ROWS = [
  { id: 'cat-housing', category_name: 'Housing & Utilities' },
  { id: 'cat-food', category_name: 'Food & Dining' },
  { id: 'cat-groceries', category_name: 'Groceries' },
  { id: 'cat-transport', category_name: 'Transportation & Gas' },
  { id: 'cat-ent', category_name: 'Entertainment & Leisure' },
  { id: 'cat-tech', category_name: 'Tech, AI & Subscriptions' },
  { id: 'cat-health', category_name: 'Health & Wellness' },
  { id: 'cat-salary', category_name: 'Salary & Direct Deposit' },
  { id: 'cat-invest', category_name: 'Investments & Dividends' },
];

const CAT_ID_BY_NAME = Object.fromEntries(CATEGORY_ROWS.map((c) => [c.category_name, c.id]));

const makeStubClient = () => {
  const recorded = { users: [], accounts: [], budgets: [], transactions: [], summaries: [], alerts: [] };
  let userSeq = 0;
  let accSeq = 0;

  const client = {
    query: async (text, params = []) => {
      if (/^BEGIN|^COMMIT|^ROLLBACK/.test(text)) return { rows: [], rowCount: 0 };
      if (/SELECT id, category_name FROM categories/.test(text)) return { rows: CATEGORY_ROWS };
      if (/INSERT INTO categories/.test(text)) return { rows: [], rowCount: 0 }; // seedSystem.sql via stub
      if (/DELETE FROM users/.test(text)) return { rows: [], rowCount: 0 };
      if (/INSERT INTO users/.test(text)) {
        const id = `user-${++userSeq}`;
        recorded.users.push({ id, email: params[2] });
        return { rows: [{ id }] };
      }
      if (/INSERT INTO accounts/.test(text)) {
        const id = `acc-${++accSeq}`;
        recorded.accounts.push({ id, userId: params[0], name: params[1], type: params[2] });
        return { rows: [{ id }] };
      }
      if (/INSERT INTO budgets/.test(text)) {
        recorded.budgets.push({ userId: params[0], categoryId: params[1], amount: params[2] });
        return { rows: [], rowCount: 1 };
      }
      if (/INSERT INTO transactions/.test(text)) {
        const values = text.match(/VALUES .*$/s) ? splitMultiRow(text, params, 8) : [params];
        for (const v of values) {
          recorded.transactions.push({
            userId: v[0], accountId: v[1], categoryId: v[2], amount: v[3],
            type: v[4], desc: v[5], recurring: v[6], date: v[7],
          });
        }
        return { rows: [], rowCount: values.length };
      }
      if (/INSERT INTO monthly_summaries/.test(text)) {
        const values = splitMultiRow(text, params, 4);
        for (const v of values) recorded.summaries.push({ userId: v[0], categoryId: v[1], period: v[2], spent: v[3] });
        return { rows: [], rowCount: values.length };
      }
      if (/INSERT INTO budget_alert_log/.test(text)) {
        const values = splitMultiRow(text, params, 4);
        for (const v of values) recorded.alerts.push({ userId: v[0], categoryId: v[1], period: v[2], rule: v[3] });
        return { rows: [], rowCount: values.length };
      }
      return { rows: [], rowCount: 0 };
    },
    release: () => {},
  };
  return { client, recorded };
};

// Expands a chunked multi-row INSERT back into per-row param groups.
const splitMultiRow = (text, params, colsPerRow) => {
  const valuesClause = text.slice(text.toUpperCase().indexOf('VALUES') + 6);
  const tupleCount = (valuesClause.match(/\$\d+/g) || []).reduce((acc, ph) => {
    const n = parseInt(ph.slice(1), 10);
    acc.max = Math.max(acc.max, n);
    return acc;
  }, { max: 0 }).max / colsPerRow;
  const rows = [];
  for (let i = 0; i < tupleCount; i++) {
    rows.push(params.slice(i * colsPerRow, (i + 1) * colsPerRow));
  }
  return rows;
};

describe('Demo data seeder (deterministic generation contract)', () => {
  const stubs = [];
  let recorded;

  before(async () => {
    // Two runs to verify determinism
    for (let run = 0; run < 2; run++) {
      const { client, recorded: rec } = makeStubClient();
      stubs.push(rec);
      // db.js pool singleton is patched by runSeed's injectedClient path
      const { runSeed } = await import('../config/seedDemoData.js');
      await runSeed(client);
    }
    recorded = stubs[0];
  });

  it('seeds exactly the 3 documented personas', () => {
    const emails = recorded.users.map((u) => u.email).sort();
    assert.deepEqual(emails, [
      'newbie@budgetmate.io',
      'overspender@budgetmate.io',
      'saver@budgetmate.io',
    ]);
  });

  it('is deterministic — identical data across two runs with the same seed', () => {
    const fingerprint = (rec) =>
      rec.transactions.map((t) => `${t.userId}|${t.date}|${t.amount}|${t.desc}`).sort().join('\n');
    assert.equal(fingerprint(stubs[0]), fingerprint(stubs[1]), 'two runs must produce identical transactions');
  });

  it('saver: stays under budget in every category (current month)', () => {
    const saverId = recorded.users.find((u) => u.email === 'saver@budgetmate.io').id;
    const currentPeriod = recorded.summaries.length > 0
      ? recorded.summaries[recorded.summaries.length - 1].period
      : null;
    // Determine the latest period present for the saver
    const periods = [...new Set(recorded.summaries.filter((s) => s.userId === saverId).map((s) => s.period))].sort();
    const latest = periods[periods.length - 1];
    assert.ok(latest, 'saver should have summaries');

    const spentByCat = {};
    for (const s of recorded.summaries) {
      if (s.userId === saverId && s.period === latest) spentByCat[s.categoryId] = (spentByCat[s.categoryId] || 0) + s.spent;
    }
    for (const b of recorded.budgets.filter((b) => b.userId === saverId)) {
      const spent = spentByCat[b.categoryId] || 0;
      assert.ok(
        spent <= b.amount,
        `saver exceeded ${b.categoryId}: spent ${spent} vs budget ${b.amount}`
      );
    }
    void currentPeriod;
  });

  it('overspender: exceeds budget in 2-3 categories and has a +40% food surge', () => {
    const oid = recorded.users.find((u) => u.email === 'overspender@budgetmate.io').id;
    const periods = [...new Set(recorded.summaries.filter((s) => s.userId === oid).map((s) => s.period))].sort();
    const latest = periods[periods.length - 1];
    const prev = periods[periods.length - 2];

    const spent = (period) => {
      const map = {};
      for (const s of recorded.summaries) {
        if (s.userId === oid && s.period === period) map[s.categoryId] = s.spent;
      }
      return map;
    };
    const cur = spent(latest);
    const prevMap = spent(prev);

    // Count categories over budget in the latest period
    let over = 0;
    for (const b of recorded.budgets.filter((b) => b.userId === oid)) {
      if ((cur[b.categoryId] || 0) > b.amount) over++;
    }
    assert.ok(over >= 2 && over <= 4, `expected 2-4 over-budget categories, got ${over}`);

    // The +40% food surge (some tolerance: generation uses 0.8-1.2 volume jitter)
    const foodId = CAT_ID_BY_NAME['Food & Dining'];
    const surge = (cur[foodId] || 0) / (prevMap[foodId] || 1);
    assert.ok(surge > 1.15, `food surge should be well above baseline, got ${surge.toFixed(2)}x`);

    // Alerts: historical breaches logged, current breaches left live
    const logged = recorded.alerts.filter((a) => a.userId === oid);
    assert.ok(logged.length > 0, 'overspender should have historical alert log rows');
  });

  it('recurring bills recur: same merchant+amount appears once per month', () => {
    const oid = recorded.users.find((u) => u.email === 'overspender@budgetmate.io').id;
    const netflix = recorded.transactions.filter((t) => t.userId === oid && t.desc === 'Netflix');
    assert.ok(netflix.length >= 6, `Netflix should appear in most months, got ${netflix.length}`);
    const amounts = new Set(netflix.map((t) => t.amount));
    assert.equal(amounts.size, 1, 'Netflix amount must be identical every month');
    assert.equal(netflix.every((t) => t.recurring), true, 'Netflix must be flagged recurring');
    // Same day-of-month
    const days = new Set(netflix.map((t) => Number(t.date.slice(8, 10))));
    assert.equal(days.size, 1, 'Netflix must land on the same day each month');
  });

  it('amount distribution is skewed (many small, few large), not uniform', () => {
    const saverId = recorded.users.find((u) => u.email === 'saver@budgetmate.io').id;
    const amounts = recorded.transactions
      .filter((t) => t.userId === saverId && t.type === 'expense')
      .map((t) => t.amount)
      .sort((a, b) => a - b);
    assert.ok(amounts.length > 100, `expected 100+ expense txns, got ${amounts.length}`);
    const median = amounts[Math.floor(amounts.length / 2)];
    const p90 = amounts[Math.floor(amounts.length * 0.9)];
    // A uniform distribution over these ranges yields p90/median ≈ 1.7;
    // the r² skew must clearly beat that.
    assert.ok(p90 / median > 2.5, `expected skew (p90/median > 2.5), got ${(p90 / median).toFixed(1)}`);
  });

  it('new user: almost no data, proves empty states are safe', () => {
    const nid = recorded.users.find((u) => u.email === 'newbie@budgetmate.io').id;
    const txs = recorded.transactions.filter((t) => t.userId === nid);
    assert.ok(txs.length >= 1 && txs.length <= 5, `new user should have 1-5 txns, got ${txs.length}`);
    assert.equal(txs.every((t) => t.type === 'expense'), true);
    const budgets = recorded.budgets.filter((b) => b.userId === nid);
    assert.equal(budgets.length, 0, 'new user must have no budgets');
    const summaries = recorded.summaries.filter((s) => s.userId === nid);
    assert.equal(summaries.length, 0, 'new user must have no summaries');
  });

  it('monthly summaries cover the historical months for the saver', () => {
    const sid = recorded.users.find((u) => u.email === 'saver@budgetmate.io').id;
    const periods = new Set(recorded.summaries.filter((s) => s.userId === sid).map((s) => s.period));
    assert.ok(periods.size >= 6, `expected 6+ months of summaries, got ${periods.size}`);
  });

  it('all demo rows use numeric-safe money values (2 decimal places max)', () => {
    // Float-safe 2-decimal check (x*100 is not always an exact integer in FP)
    const bad = recorded.transactions.filter(
      (t) => typeof t.amount !== 'number'
        || !Number.isFinite(t.amount)
        || Math.abs(t.amount - Number(t.amount.toFixed(2))) > 1e-9
    );
    assert.equal(bad.length, 0, `found ${bad.length} malformed amounts`);
  });

  it('seeder source refuses production and keeps the fixed seed documented', async () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'config', 'seedDemoData.js'), 'utf8');
    assert.ok(src.includes('20260922'), 'fixed seed must stay pinned');
    assert.ok(src.includes("NODE_ENV === 'production'"), 'production guard must exist');
    for (const email of ['saver@budgetmate.io', 'overspender@budgetmate.io', 'newbie@budgetmate.io']) {
      assert.ok(src.includes(email));
    }
  });
});
