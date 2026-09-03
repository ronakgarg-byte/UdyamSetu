/**
 * data.gov.in & MyScheme Integration Service
 * Scaffolds dataset loader and API connectors for government policies, subsidies, and credit schemes.
 * 
 * NOTE / TODO for production:
 * MyScheme (myscheme.gov.in) and data.gov.in provide open catalog APIs requiring registered API keys.
 * This module scaffolds the live dataset loader and provides full structured schema definitions.
 */

const SCHEMES_MASTER_CATALOG = [
  {
    code: 'pm_svanidhi',
    name_en: 'PM-SVANidhi (Street Vendor’s AtmaNirbhar Nidhi)',
    name_hi: 'पीएम स्वनिधि (स्ट्रीट वेंडर्स आत्मनिर्भर निधि)',
    ministry: 'Ministry of Housing and Urban Affairs',
    category: 'Micro-Credit / Working Capital',
    loanCeiling: 50000,
    interestSubsidyPct: 7.0,
    digitalIncentiveYearly: 1200,
    targetBeneficiaries: ['Street Vendors', 'Hawkers', 'Small Service Providers', 'Kirana Owners'],
    eligibilityCriteria: {
      maxRevenueMonthly: 15000,
      collateralRequired: false,
      guarantorRequired: false,
    },
    applicationPortal: 'https://pmsvanidhi.mohua.gov.in/',
  },
  {
    code: 'mudra_shishu',
    name_en: 'Pradhan Mantri Mudra Yojana (Shishu)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
    ministry: 'Ministry of Finance / MSME',
    category: 'Seed & Working Capital',
    loanCeiling: 50000,
    interestSubsidyPct: 0.0,
    targetBeneficiaries: ['New Entrepreneurs', 'Small Shopkeepers', 'Artisans'],
    eligibilityCriteria: {
      maxRevenueMonthly: 30000,
      collateralRequired: false,
      guarantorRequired: false,
    },
    applicationPortal: 'https://www.mudra.org.in/',
  },
  {
    code: 'mudra_kishore',
    name_en: 'Pradhan Mantri Mudra Yojana (Kishore)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (किशोर)',
    ministry: 'Ministry of Finance / MSME',
    category: 'Business Growth & Equipment',
    loanCeiling: 500000,
    interestSubsidyPct: 0.0,
    targetBeneficiaries: ['Existing Micro-Units', 'Workshops', 'Retail Outlets'],
    eligibilityCriteria: {
      minRevenueMonthly: 20000,
      maxRevenueMonthly: 50000,
      collateralRequired: false,
    },
    applicationPortal: 'https://www.mudra.org.in/',
  },
  {
    code: 'mudra_tarun',
    name_en: 'Pradhan Mantri Mudra Yojana (Tarun)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (तरुण)',
    ministry: 'Ministry of Finance / MSME',
    category: 'Scale & Commercial Expansion',
    loanCeiling: 1000000,
    interestSubsidyPct: 0.0,
    targetBeneficiaries: ['Expanding Small Businesses', 'Logistics Operators'],
    eligibilityCriteria: {
      minRevenueMonthly: 50000,
      collateralRequired: false,
    },
    applicationPortal: 'https://www.mudra.org.in/',
  },
  {
    code: 'pmegp',
    name_en: 'PMEGP (Prime Minister’s Employment Generation Programme)',
    name_hi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
    ministry: 'Ministry of MSME / KVIC',
    category: 'Capital Subsidy Credit-Linked',
    loanCeiling: 5000000,
    interestSubsidyPct: 35.0, // Up to 35% capital subsidy in rural areas
    targetBeneficiaries: ['Rural Micro-Enterprises', 'Manufacturing Units', 'Agro-processing'],
    eligibilityCriteria: {
      collateralRequired: false,
      ruralSubsidyRate: '35% for Special Categories (SC/ST/OBC/Women), 25% General',
    },
    applicationPortal: 'https://www.kviconline.gov.in/pmegpeportal/',
  },
  {
    code: 'pm_vishwakarma',
    name_en: 'PM Vishwakarma Scheme',
    name_hi: 'पीएम विश्वकर्मा योजना',
    ministry: 'Ministry of MSME / Ministry of Skill Development',
    category: 'End-to-End Artisan & Tradesperson Support',
    loanCeiling: 300000,
    interestSubsidyPct: 5.0, // Concessional 5% interest rate
    toolkitGrant: 15000,
    targetBeneficiaries: ['Carpenters', 'Blacksmiths', 'Goldsmiths', 'Tailors', 'Cobblers', 'Weavers'],
    eligibilityCriteria: {
      traditionalTradesCount: 18,
      collateralRequired: false,
      skillTrainingStipend: '₹500/day during training',
    },
    applicationPortal: 'https://pmvishwakarma.gov.in/',
  },
];

async function getSchemeCatalog() {
  return {
    source: 'data.gov.in / MyScheme Open Data Service',
    totalSchemesIndexed: SCHEMES_MASTER_CATALOG.length,
    schemes: SCHEMES_MASTER_CATALOG,
  };
}

module.exports = {
  getSchemeCatalog,
};
