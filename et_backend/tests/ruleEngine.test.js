import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ruleCategorySpendSurge,
  ruleBenchmark503020,
  ruleNoEmergencyFund,
  ruleHighSubscriptionRatio,
  ruleLargestAbsoluteIncrease,
  runAdvisorRules
} from '../advisor/ruleEngine.js';

describe('Block 3.1: Rule-Based Spending Advisor Engine', () => {
  // Seeded realistic dataset
  const demoSpendingData = {
    monthlyIncome: 6500,
    totalExpenses: 4800,
    liquidReserves: 7000,
    runwayMonths: 1.45,
    hasEmergencyFundGoal: false,
    recurringSubscriptionsTotal: 720, // ~11.1% of income
    subscriptionItems: ['AWS', 'Adobe Creative Cloud', 'Gym Club', 'Streaming Pack'],
    currentSpendByCategory: {
      'Food & Dining': 1250,      // Surged from 800 (+56%)
      'Housing & Utilities': 2400, // Essential need
      'Groceries': 950,           // Essential need (Total needs: 2400+950 = 3350 -> 51.5% of income)
      'Tech, AI & Subscriptions': 620,
      'Entertainment & Leisure': 450
    },
    previousSpendByCategory: {
      'Food & Dining': 800,
      'Housing & Utilities': 2400,
      'Groceries': 850,
      'Tech, AI & Subscriptions': 590,
      'Entertainment & Leisure': 200
    }
  };

  it('Rule 1: Detects category spend surge > 20%', () => {
    const insight = ruleCategorySpendSurge(demoSpendingData);
    assert.ok(insight, 'Should generate surge insight');
    assert.equal(insight.rule_code, 'CATEGORY_SURGE');
    assert.ok(insight.metadata.pctIncrease >= 20);
    assert.ok(insight.message.includes('Food & Dining') || insight.message.includes('Entertainment & Leisure'));
  });

  it('Rule 2: Detects 50/30/20 benchmark imbalance (Needs > 50%)', () => {
    const insight = ruleBenchmark503020(demoSpendingData);
    assert.ok(insight, 'Should generate 50/30/20 benchmark insight');
    assert.equal(insight.rule_code, 'BENCHMARK_503020');
    assert.ok(insight.metadata.needsRatio > 50);
  });

  it('Rule 3: Detects emergency reserve vulnerability (< 3 months)', () => {
    const insight = ruleNoEmergencyFund(demoSpendingData);
    assert.ok(insight, 'Should generate emergency fund insight');
    assert.equal(insight.rule_code, 'NO_EMERGENCY_FUND');
    assert.equal(insight.severity, 'critical');
  });

  it('Rule 4: Detects high subscription ratio (> 10% of income)', () => {
    const insight = ruleHighSubscriptionRatio(demoSpendingData);
    assert.ok(insight, 'Should generate subscription insight');
    assert.equal(insight.rule_code, 'HIGH_SUBSCRIPTIONS');
    assert.ok(insight.metadata.subRatio >= 8);
  });

  it('Rule 5: Identifies category with largest absolute dollar increase', () => {
    const insight = ruleLargestAbsoluteIncrease(demoSpendingData);
    assert.ok(insight, 'Should generate largest increase insight');
    assert.equal(insight.rule_code, 'LARGEST_INCREASE');
    assert.equal(insight.category_name, 'Food & Dining'); // +450 increase
    assert.equal(insight.metadata.increaseAmount, 450);
  });

  it('Acceptance Criteria: Produces at least 4 distinct, plausible-sounding insights against seeded demo dataset', () => {
    const insights = runAdvisorRules(demoSpendingData);
    assert.ok(insights.length >= 4, `Expected at least 4 insights, got ${insights.length}`);
    const ruleCodes = new Set(insights.map(i => i.rule_code));
    assert.ok(ruleCodes.size >= 4, `Expected at least 4 distinct rule codes, got ${ruleCodes.size}`);
  });
});
