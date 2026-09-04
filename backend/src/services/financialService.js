/**
 * Financial Structuring Engine
 * Ports the exact calculation logic from the Udyam Setu prototype.
 */

function calculateFinancialMetrics(sales = {}, expenses = {}, items = [], problems = []) {
  // 1. Revenue: monthly revenue || (daily sales * 30) || 0
  const monthlyRevenue = Number(sales.monthly_revenue ?? sales.monthlyRevenue) || 0;
  const dailySales = Number(sales.daily_sales ?? sales.dailySales) || 0;
  const revenue = monthlyRevenue || (dailySales * 30) || 0;

  // 2. Expenses (excluding EMI)
  const rent = Number(expenses.rent) || 0;
  const electricity = Number(expenses.electricity) || 0;
  const rawMaterials = Number(expenses.raw_materials ?? expenses.rawMaterials) || 0;
  const transport = Number(expenses.transport) || 0;
  const wages = Number(expenses.wages) || 0;
  const packaging = Number(expenses.packaging) || 0;
  const other = Number(expenses.other) || 0;

  const totalExpenses = rent + electricity + rawMaterials + transport + wages + packaging + other;

  // 3. EMI
  const emi = Number(expenses.emi) || 0;

  // 4. Net Profit & Cash Flow
  const netProfit = revenue - totalExpenses;
  const cashFlow = netProfit - emi;

  // 5. Break-Even Gap
  const breakEvenGap = totalExpenses + emi - revenue;

  // 6. Working Capital & Average Margin from Items
  const safeItems = Array.isArray(items) ? items : [];
  const workingCapital = safeItems.reduce(
    (acc, it) => acc + (Number(it.cost_price ?? it.costPrice) || 0),
    0
  );

  const avgMargin =
    safeItems.length > 0
      ? safeItems.reduce((acc, it) => {
          const sp = Number(it.sell_price ?? it.sellPrice) || 0;
          const cp = Number(it.cost_price ?? it.costPrice) || 0;
          return acc + (sp - cp);
        }, 0) / safeItems.length
      : 0;

  // 7. ROI Months: Math.max(1, Math.round(workingCapital / (avgMargin * 20))) if avgMargin > 0
  const roiMonths =
    avgMargin > 0
      ? Math.max(1, Math.round(workingCapital / (avgMargin * 20)))
      : null;

  // 8. Debt Burden Ratio
  const debtRatio = revenue > 0 ? (emi / revenue) * 100 : 0;

  // 9. Financial Risk Level
  let riskLevel = 'low';
  if (debtRatio > 50 || netProfit < 0) {
    riskLevel = 'high';
  } else if (debtRatio > 25 || cashFlow < revenue * 0.05) {
    riskLevel = 'medium';
  }

  // 10. Recommended Scheme with direct portal links and metadata
  let scheme = {
    code: 'mudra_shishu',
    name: 'Mudra Yojana (Shishu)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
    ministry: 'Ministry of Finance / MSME',
    portalUrl: 'https://www.mudra.org.in/',
    loanCeiling: 50000,
    interestSubsidyPct: 0.0,
    match: 74,
  };

  const safeProblems = Array.isArray(problems) ? problems : [];

  if (revenue > 0 && revenue < 15000) {
    scheme = {
      code: 'pm_svanidhi',
      name: 'PM-SVANidhi (Street Vendor Loan)',
      name_hi: 'पीएम स्वनिधि योजना',
      ministry: 'Ministry of Housing and Urban Affairs',
      portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
      loanCeiling: 50000,
      interestSubsidyPct: 7.0,
      match: 88,
    };
  } else if (
    safeProblems.includes('workingcap') ||
    safeProblems.includes('loanrepay')
  ) {
    scheme = {
      code: 'pmegp',
      name: "PMEGP (Prime Minister's Employment Generation Programme)",
      name_hi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
      ministry: 'Ministry of MSME / KVIC',
      portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
      loanCeiling: 5000000,
      interestSubsidyPct: 35.0,
      match: 81,
    };
  } else if (revenue >= 50000) {
    scheme = {
      code: 'mudra_tarun',
      name: 'Mudra Yojana (Tarun)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (तरुण)',
      ministry: 'Ministry of Finance / MSME',
      portalUrl: 'https://www.mudra.org.in/',
      loanCeiling: 1000000,
      interestSubsidyPct: 0.0,
      match: 79,
    };
  }

  return {
    revenue,
    totalExpenses,
    emi,
    netProfit,
    cashFlow,
    breakEvenGap,
    workingCapital,
    avgMargin,
    roiMonths,
    debtRatio: Number(debtRatio.toFixed(2)),
    riskLevel,
    scheme,
  };
}

module.exports = {
  calculateFinancialMetrics,
};
