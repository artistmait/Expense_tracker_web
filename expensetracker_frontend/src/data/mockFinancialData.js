export const financialData = {
  user: {
    name: "Alex Morgan",
    greeting: "Welcome back",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    accountNumber: "•••• 8492",
    tier: "Wealth Platinum Member",
    lastLogin: "Today at 9:42 AM",
    securityStatus: "Bank-Grade 256-Bit Encrypted"
  },
  metrics: {
    netWorth: 124850.75,
    netWorthChange: 4.82,
    totalIncome: 14250.00,
    incomeChange: 8.5,
    totalExpenses: 5820.40,
    expensesChange: -3.2,
    savingsRate: 59.1,
    investmentBalance: 68420.30,
    investmentChange: 6.45,
    budgetSpentPercent: 68.5,
    emergencyFundMonths: 6.5
  },
  cashflowHistory: [
    { month: "Jan", income: 12800, expense: 6200, savings: 6600 },
    { month: "Feb", income: 13100, expense: 5900, savings: 7200 },
    { month: "Mar", income: 12900, expense: 6400, savings: 6500 },
    { month: "Apr", income: 13800, expense: 5700, savings: 8100 },
    { month: "May", income: 14000, expense: 6100, savings: 7900 },
    { month: "Jun", income: 14250, expense: 5820, savings: 8430 }
  ],
  budgets: [
    {
      id: "b1",
      category: "Housing & Utilities",
      icon: "Home",
      allocated: 2400,
      spent: 2150,
      color: "#2C5EAD",
      status: "On Track"
    },
    {
      id: "b2",
      category: "Food & Fine Dining",
      icon: "Utensils",
      allocated: 1200,
      spent: 1040,
      color: "#1591DC",
      status: "On Track"
    },
    {
      id: "b3",
      category: "Tech, AI & Subscriptions",
      icon: "Cpu",
      allocated: 650,
      spent: 590,
      color: "#4BB8FA",
      status: "Near Limit"
    },
    {
      id: "b4",
      category: "Travel & Lifestyle",
      icon: "Plane",
      allocated: 1500,
      spent: 890,
      color: "#10B981",
      status: "Safe"
    },
    {
      id: "b5",
      category: "Wellness & Health",
      icon: "Activity",
      allocated: 500,
      spent: 310,
      color: "#F59E0B",
      status: "Safe"
    }
  ],
  stocks: [
    {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      shares: 45,
      avgPrice: 108.50,
      currentPrice: 138.25,
      changePercent: 3.42,
      isPositive: true,
      allocation: "32%",
      sparkline: [120, 122, 126, 124, 131, 135, 138]
    },
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 60,
      avgPrice: 192.10,
      currentPrice: 224.80,
      changePercent: 1.15,
      isPositive: true,
      allocation: "25%",
      sparkline: [215, 218, 216, 220, 222, 223, 224]
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      shares: 30,
      avgPrice: 380.00,
      currentPrice: 428.60,
      changePercent: -0.45,
      isPositive: false,
      allocation: "22%",
      sparkline: [435, 432, 430, 429, 431, 427, 428]
    },
    {
      symbol: "VOO",
      name: "Vanguard S&P 500",
      shares: 55,
      avgPrice: 450.20,
      currentPrice: 512.40,
      changePercent: 0.88,
      isPositive: true,
      allocation: "21%",
      sparkline: [500, 503, 505, 508, 510, 511, 512]
    }
  ],
  recentTransactions: [
    {
      id: "tx-01",
      title: "Apple Developer Subscription",
      category: "Tech & Services",
      date: "Today, 2:15 PM",
      amount: -99.00,
      type: "expense",
      account: "Main Checking ••8492",
      icon: "Code"
    },
    {
      id: "tx-02",
      title: "Global Tech Salary Deposit",
      category: "Income / Direct Deposit",
      date: "Yesterday",
      amount: 7125.00,
      type: "income",
      account: "Primary Vault",
      icon: "Briefcase"
    },
    {
      id: "tx-03",
      title: "Whole Foods Market",
      category: "Groceries",
      date: "Sep 18, 2026",
      amount: -142.80,
      type: "expense",
      account: "Sapphire Reserve ••3124",
      icon: "ShoppingBag"
    },
    {
      id: "tx-04",
      title: "NVIDIA Quarterly Dividend",
      category: "Investments",
      date: "Sep 17, 2026",
      amount: 184.50,
      type: "income",
      account: "Trading Account",
      icon: "TrendingUp"
    },
    {
      id: "tx-05",
      title: "Equinox Fitness Club",
      category: "Health & Fitness",
      date: "Sep 15, 2026",
      amount: -280.00,
      type: "expense",
      account: "Main Checking ••8492",
      icon: "Activity"
    },
    {
      id: "tx-06",
      title: "Delta Air Lines Flight",
      category: "Travel",
      date: "Sep 12, 2026",
      amount: -540.20,
      type: "expense",
      account: "Sapphire Reserve ••3124",
      icon: "Plane"
    }
  ],
  financialHealth: {
    score: 88,
    grade: "Excellent",
    liquidityStatus: "Optimized",
    debtToIncomeRatio: "8.2%",
    monthlyBurnMultiple: "0.41x",
    insights: [
      "Your emergency fund is fully funded for 6.5 months of typical expenses.",
      "Monthly savings rate (59.1%) is 2.4x higher than peer averages.",
      "Stock portfolio diversified across high-growth AI and broad index ETFs."
    ]
  },
  securityBadges: [
    { title: "256-Bit TLS", desc: "Military-grade end-to-end data encryption" },
    { title: "SOC-2 Type II", desc: "Certified compliance & audited safety" },
    { title: "Zero-Knowledge", desc: "Your credentials are never stored in plain text" },
    { title: "Real-time Fraud Shield", desc: "Instant anomaly & duplicate charge detection" }
  ]
};
