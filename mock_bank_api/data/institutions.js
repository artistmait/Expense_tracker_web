export const MOCK_INSTITUTIONS = [
  {
    id: "inst_chase",
    name: "JPMorgan Chase Bank",
    code: "CHASE",
    logo_color: "#112E81",
    logo_letter: "C",
    type: "commercial_bank",
    supported_account_types: ["checking", "savings", "credit_card"],
    accounts: [
      {
        account_id: "bank_acc_chase_chk_8492",
        account_name: "Chase Sapphire Checking",
        account_type: "checking",
        mask: "8492",
        current_balance: 8420.00,
        available_balance: 8250.00,
        currency: "USD",
        status: "active"
      },
      {
        account_id: "bank_acc_chase_sav_1109",
        account_name: "Chase Premier Savings",
        account_type: "savings",
        mask: "1109",
        current_balance: 24500.00,
        available_balance: 24500.00,
        currency: "USD",
        status: "active"
      }
    ]
  },
  {
    id: "inst_amex",
    name: "American Express",
    code: "AMEX",
    logo_color: "#4382DF",
    logo_letter: "A",
    type: "credit_institution",
    supported_account_types: ["credit_card"],
    accounts: [
      {
        account_id: "bank_acc_amex_res_3124",
        account_name: "Amex Reserve Platinum",
        account_type: "credit_card",
        mask: "3124",
        current_balance: 3150.20,
        available_balance: 15000.00,
        currency: "USD",
        status: "active"
      }
    ]
  },
  {
    id: "inst_svb",
    name: "Silicon Valley Vault",
    code: "SVB",
    logo_color: "#4647AE",
    logo_letter: "S",
    type: "wealth_bank",
    supported_account_types: ["savings", "checking"],
    accounts: [
      {
        account_id: "bank_acc_svb_vault_9011",
        account_name: "Primary Wealth Vault",
        account_type: "savings",
        mask: "9011",
        current_balance: 45000.00,
        available_balance: 45000.00,
        currency: "USD",
        status: "active"
      }
    ]
  },
  {
    id: "inst_vanguard",
    name: "Vanguard Brokerage",
    code: "VANGUARD",
    logo_color: "#991B1B",
    logo_letter: "V",
    type: "brokerage",
    supported_account_types: ["investment"],
    accounts: [
      {
        account_id: "bank_acc_vg_brokerage_7741",
        account_name: "Vanguard Index ETF Portfolio",
        account_type: "investment",
        mask: "7741",
        current_balance: 68420.30,
        available_balance: 68420.30,
        currency: "USD",
        status: "active"
      }
    ]
  }
];
