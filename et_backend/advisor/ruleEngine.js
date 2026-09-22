/**
 * Block 3.1: Rule-Based Spending Advisor - Core Rule Engine
 * 
 * Each rule is a pure function: (userSpendingData) => Insight | null
 * Pluggable architecture: add any new rule function to ADVISOR_RULES.
 * No external LLM calls — deterministic, testable, and reliable.
 */

/**
 * Rule 1: Category spend increased > X% vs previous period (default X = 20%)
 */
export const ruleCategorySpendSurge = (data) => {
  const { currentSpendByCategory = {}, previousSpendByCategory = {} } = data;
  const surgeThresholdPct = data.surgeThresholdPct || 20;
  const minSpendThreshold = data.minSpendThreshold || 50; // Ignore tiny amounts like $5 vs $7

  let maxSurge = null;

  for (const [catName, currentSpend] of Object.entries(currentSpendByCategory)) {
    const prevSpend = previousSpendByCategory[catName] || 0;
    if (currentSpend >= minSpendThreshold && prevSpend > 0) {
      const pctIncrease = Math.round(((currentSpend - prevSpend) / prevSpend) * 100);
      if (pctIncrease >= surgeThresholdPct) {
        if (!maxSurge || pctIncrease > maxSurge.pctIncrease) {
          maxSurge = { catName, currentSpend, prevSpend, pctIncrease };
        }
      }
    }
  }

  if (!maxSurge) return null;

  const { catName, currentSpend, prevSpend, pctIncrease } = maxSurge;
  return {
    rule_code: 'CATEGORY_SURGE',
    title: `Unusual Spending Spike in ${catName}`,
    message: `Your spending in ${catName} surged by ${pctIncrease}% this period ($${currentSpend.toFixed(2)} vs $${prevSpend.toFixed(2)} previously).`,
    severity: pctIncrease >= 50 ? 'critical' : 'warning',
    category_name: catName,
    condition_key: `${catName}:${currentSpend.toFixed(0)}:${prevSpend.toFixed(0)}`,
    metadata: {
      category: catName,
      pctIncrease,
      currentSpend,
      previousSpend: prevSpend
    }
  };
};

/**
 * Rule 2: Spending on categories exceeds 50/30/20-style benchmark
 * (Needs > 50% of income, or single category > 35% of income)
 */
export const ruleBenchmark503020 = (data) => {
  const { monthlyIncome = 0, currentSpendByCategory = {} } = data;
  if (monthlyIncome <= 0) return null;

  // Typical "Needs" keywords
  const needsKeywords = ['housing', 'rent', 'utilities', 'groceries', 'transport', 'gas', 'health', 'wellness'];
  
  let totalNeeds = 0;
  let singleDominantCat = null;

  for (const [catName, spend] of Object.entries(currentSpendByCategory)) {
    const lower = catName.toLowerCase();
    if (needsKeywords.some(k => lower.includes(k))) {
      totalNeeds += spend;
    }
    const catRatio = Math.round((spend / monthlyIncome) * 100);
    if (catRatio >= 35) {
      if (!singleDominantCat || catRatio > singleDominantCat.ratio) {
        singleDominantCat = { catName, spend, ratio: catRatio };
      }
    }
  }

  const needsRatio = Math.round((totalNeeds / monthlyIncome) * 100);

  if (needsRatio > 50) {
    return {
      rule_code: 'BENCHMARK_503020',
      title: 'Essential Outflow Exceeds 50/30/20 Target',
      message: `Essential living expenses (housing, utilities, groceries) consume ${needsRatio}% of your net income (recommended target: 50% max).`,
      severity: needsRatio > 65 ? 'critical' : 'warning',
      condition_key: `needs:${needsRatio}`,
      metadata: {
        needsRatio,
        totalNeeds,
        monthlyIncome,
        benchmark: 50
      }
    };
  }

  if (singleDominantCat) {
    return {
      rule_code: 'BENCHMARK_503020',
      title: `Heavy Allocation to ${singleDominantCat.catName}`,
      message: `${singleDominantCat.catName} represents ${singleDominantCat.ratio}% of your entire monthly income ($${singleDominantCat.spend.toFixed(2)}).`,
      severity: 'warning',
      category_name: singleDominantCat.catName,
      condition_key: `${singleDominantCat.catName}:${singleDominantCat.ratio}`,
      metadata: {
        category: singleDominantCat.catName,
        spend: singleDominantCat.spend,
        ratio: singleDominantCat.ratio
      }
    };
  }

  return null;
};

/**
 * Rule 3: No emergency fund goal or liquid reserves < 3 months of expenses
 */
export const ruleNoEmergencyFund = (data) => {
  const { runwayMonths = 0, totalExpenses = 0, liquidReserves = 0, hasEmergencyFundGoal = false } = data;
  
  // If no expenses, user is either new or has no activity
  if (totalExpenses <= 0) return null;

  const targetReserve = totalExpenses * 3;

  if (!hasEmergencyFundGoal || runwayMonths < 3.0) {
    const isCritical = runwayMonths < 1.5;
    return {
      rule_code: 'NO_EMERGENCY_FUND',
      title: isCritical ? 'Critical Emergency Reserve Deficit' : 'Build Your 3-Month Safety Cushion',
      message: `Your liquid reserves cover approximately ${runwayMonths.toFixed(1)} months of living expenses. Establishing a dedicated 3-month safety fund of $${targetReserve.toFixed(2)} protects against sudden income disruption.`,
      severity: isCritical ? 'critical' : 'warning',
      condition_key: `runway:${runwayMonths.toFixed(1)}:${hasEmergencyFundGoal}`,
      metadata: {
        currentRunwayMonths: runwayMonths,
        targetReserveMonths: 3,
        targetReserveAmount: targetReserve,
        liquidReserves
      }
    };
  }

  return null;
};

/**
 * Rule 4: Recurring subscriptions total > Y% of income (default Y = 10%)
 */
export const ruleHighSubscriptionRatio = (data) => {
  const { monthlyIncome = 0, recurringSubscriptionsTotal = 0, subscriptionItems = [] } = data;
  if (monthlyIncome <= 0 || recurringSubscriptionsTotal <= 0) return null;

  const subThresholdPct = data.subThresholdPct ?? 10;
  const subRatio = Math.round((recurringSubscriptionsTotal / monthlyIncome) * 100);

  if (subRatio > subThresholdPct) {
    const count = subscriptionItems.length || 'multiple';
    return {
      rule_code: 'HIGH_SUBSCRIPTIONS',
      title: 'High Subscription Overhead Ratio',
      message: `Recurring subscriptions total $${recurringSubscriptionsTotal.toFixed(2)} (${subRatio}% of your monthly income across ${count} services). An audit may uncover unused or duplicative memberships.`,
      severity: subRatio >= 15 ? 'critical' : 'info',
      condition_key: `subs:${recurringSubscriptionsTotal.toFixed(0)}:${subRatio}`,
      metadata: {
        recurringSubscriptionsTotal,
        subRatio,
        monthlyIncome,
        threshold: subThresholdPct
      }
    };
  }

  return null;
};

/**
 * Rule 5: Category with largest month-over-month increase in absolute terms
 */
export const ruleLargestAbsoluteIncrease = (data) => {
  const { currentSpendByCategory = {}, previousSpendByCategory = {} } = data;
  let topIncrease = null;

  for (const [catName, currentSpend] of Object.entries(currentSpendByCategory)) {
    const prevSpend = previousSpendByCategory[catName] || 0;
    const diff = currentSpend - prevSpend;
    if (diff > 40) { // Minimum $40 absolute growth
      if (!topIncrease || diff > topIncrease.diff) {
        topIncrease = { catName, currentSpend, prevSpend, diff };
      }
    }
  }

  if (!topIncrease) return null;

  const { catName, currentSpend, prevSpend, diff } = topIncrease;
  return {
    rule_code: 'LARGEST_INCREASE',
    title: `Highest Spending Acceleration: ${catName}`,
    message: `${catName} had the greatest raw increase this period, expanding by +$${diff.toFixed(2)} ($${currentSpend.toFixed(2)} compared to $${prevSpend.toFixed(2)} last period).`,
    severity: diff > 500 ? 'warning' : 'info',
    category_name: catName,
    condition_key: `${catName}:diff:${diff.toFixed(0)}`,
    metadata: {
      category: catName,
      increaseAmount: diff,
      currentSpend,
      previousSpend: prevSpend
    }
  };
};

/**
 * Registry of pluggable rules
 */
export const ADVISOR_RULES = [
  ruleCategorySpendSurge,
  ruleBenchmark503020,
  ruleNoEmergencyFund,
  ruleHighSubscriptionRatio,
  ruleLargestAbsoluteIncrease
];

/**
 * Executes all rules against user spending data and returns valid insights.
 * @param {Object} userSpendingData
 * @param {Array<Function>} rulesList
 * @returns {Array<Object>}
 */
export const runAdvisorRules = (userSpendingData, rulesList = ADVISOR_RULES) => {
  if (!userSpendingData) return [];
  const insights = [];

  for (const ruleFn of rulesList) {
    try {
      const insight = ruleFn(userSpendingData);
      if (insight && insight.rule_code && insight.title && insight.message) {
        insights.push(insight);
      }
    } catch (err) {
      console.warn(`[RuleEngine] Rule execution error in ${ruleFn.name}:`, err.message);
    }
  }

  return insights;
};
