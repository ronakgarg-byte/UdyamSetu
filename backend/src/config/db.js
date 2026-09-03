const { Pool } = require('pg');
require('dotenv').config();

// In-memory data store for fallback when local PostgreSQL instance is offline
class InMemoryStore {
  constructor() {
    this.users = new Map();
    this.businesses = new Map();
    this.sales = new Map();
    this.expenses = new Map();
    this.user_customer_types = [];
    this.competition = new Map();
    this.user_problems = [];
    this.items = new Map(); // userId -> array of items
    this.schemes = [];
    this.local_context_cache = new Map();

    this.initMasterData();
  }

  initMasterData() {
    this.customer_types = [
      { key: 'students', name_en: 'Students', name_hi: 'छात्र' },
      { key: 'farmers', name_en: 'Farmers', name_hi: 'किसान' },
      { key: 'workers', name_en: 'Workers', name_hi: 'मजदूर' },
      { key: 'insurance', name_en: 'Insurance holders', name_hi: 'बीमाधारक' },
      { key: 'nearby', name_en: 'Nearby businesses', name_hi: 'आस-पास के व्यवसाय' },
      { key: 'everyone', name_en: 'Everyone', name_hi: 'सभी' },
    ];

    this.problems = [
      { key: 'customers', name_en: 'Not enough customers', name_hi: 'पर्याप्त ग्राहक नहीं', category: 'market' },
      { key: 'rawcost', name_en: 'High raw material cost', name_hi: 'कच्चे माल की ऊंची कीमत', category: 'financial' },
      { key: 'competition', name_en: 'Competition', name_hi: 'प्रतिस्पर्धा', category: 'market' },
      { key: 'transport', name_en: 'Transportation issues', name_hi: 'परिवहन समस्याएं', category: 'operational' },
      { key: 'suppliers', name_en: 'Finding suppliers', name_hi: 'आपूर्तिकर्ता ढूंढना', category: 'operational' },
      { key: 'pricing', name_en: 'Pricing', name_hi: 'मूल्य निर्धारण', category: 'market' },
      { key: 'workingcap', name_en: 'Lack of working capital', name_hi: 'कार्यशील पूंजी की कमी', category: 'financial' },
      { key: 'loanrepay', name_en: 'Loan repayment', name_hi: 'ऋण चुकौती', category: 'financial' },
      { key: 'seasonal', name_en: 'Seasonal demand', name_hi: 'मौसमी मांग', category: 'market' },
      { key: 'employees', name_en: 'Finding employees', name_hi: 'कर्मचारी ढूंढना', category: 'operational' },
      { key: 'marketing', name_en: 'Marketing', name_hi: 'विपणन', category: 'market' },
      { key: 'stock', name_en: 'Stock management', name_hi: 'स्टॉक प्रबंधन', category: 'operational' },
      { key: 'unknown', name_en: "Don't know which products to sell", name_hi: 'पता नहीं कौन से उत्पाद बेचें', category: 'operational' },
    ];

    this.schemes = [
      {
        id: '1',
        code: 'pm_svanidhi',
        name_en: 'PM-SVANidhi (Street Vendor’s AtmaNirbhar Nidhi)',
        name_hi: 'पीएम स्वनिधि (स्ट्रीट वेंडर्स आत्मनिर्भर निधि)',
        ministry_en: 'Ministry of Housing and Urban Affairs',
        ministry_hi: 'आवासन और शहरी कार्य मंत्रालय',
        description_en: 'Collateral-free working capital loan for micro-entrepreneurs up to ₹50,000 with interest subsidy.',
        description_hi: 'सूक्ष्म उद्यमियों के लिए ₹50,000 तक का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण।',
        min_loan_amount: 10000,
        max_loan_amount: 50000,
        subsidy_pct: 7.0,
        min_revenue_threshold: 0,
        max_revenue_threshold: 15000,
        target_problems: ['workingcap', 'customers', 'loanrepay'],
        target_genders: ['male', 'female', 'other'],
        base_eligibility_score: 88,
        details_url: 'https://pmsvanidhi.mohua.gov.in/',
      },
      {
        id: '2',
        code: 'mudra_shishu',
        name_en: 'Pradhan Mantri Mudra Yojana (Shishu)',
        name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
        ministry_en: 'Ministry of Finance / MSME',
        ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
        description_en: 'Micro-credit loan up to ₹50,000 for starting or stabilizing small micro-enterprises.',
        description_hi: 'छोटे व्यवसायों को शुरू या स्थिर करने के लिए ₹50,000 तक का सूक्ष्म ऋण।',
        min_loan_amount: 10000,
        max_loan_amount: 50000,
        subsidy_pct: 0,
        min_revenue_threshold: 0,
        max_revenue_threshold: 30000,
        target_problems: ['workingcap', 'stock', 'unknown'],
        target_genders: ['male', 'female', 'other'],
        base_eligibility_score: 74,
        details_url: 'https://www.mudra.org.in/',
      },
      {
        id: '3',
        code: 'mudra_kishore',
        name_en: 'Pradhan Mantri Mudra Yojana (Kishore)',
        name_hi: 'प्रधानमंत्री मुद्रा योजना (किशोर)',
        ministry_en: 'Ministry of Finance / MSME',
        ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
        description_en: 'Loans from ₹50,000 up to ₹5,00,000 for purchasing equipment or working capital.',
        description_hi: 'उपकरण या कार्यशील पूंजी के लिए ₹50,000 से ₹5,00,000 तक का ऋण।',
        min_loan_amount: 50000,
        max_loan_amount: 500000,
        subsidy_pct: 0,
        min_revenue_threshold: 20000,
        max_revenue_threshold: 50000,
        target_problems: ['workingcap', 'rawcost', 'suppliers'],
        target_genders: ['male', 'female', 'other'],
        base_eligibility_score: 76,
        details_url: 'https://www.mudra.org.in/',
      },
      {
        id: '4',
        code: 'mudra_tarun',
        name_en: 'Pradhan Mantri Mudra Yojana (Tarun)',
        name_hi: 'प्रधानमंत्री मुद्रा योजना (तरुण)',
        ministry_en: 'Ministry of Finance / MSME',
        ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
        description_en: 'Higher tier credit from ₹5,00,000 up to ₹10,00,000 for established enterprises.',
        description_hi: 'स्थापित व्यवसायों के विस्तार के लिए ₹5,00,000 से ₹10,00,000 तक का उच्च श्रेणी का ऋण।',
        min_loan_amount: 500000,
        max_loan_amount: 1000000,
        subsidy_pct: 0,
        min_revenue_threshold: 50000,
        max_revenue_threshold: null,
        target_problems: ['workingcap', 'transport', 'marketing'],
        target_genders: ['male', 'female', 'other'],
        base_eligibility_score: 79,
        details_url: 'https://www.mudra.org.in/',
      },
      {
        id: '5',
        code: 'pmegp',
        name_en: 'PMEGP (Prime Minister’s Employment Generation Programme)',
        name_hi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
        ministry_en: 'Ministry of MSME',
        ministry_hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
        description_en: 'Credit-linked subsidy program offering up to 25-35% subsidy for micro-enterprises.',
        description_hi: 'नई सूक्ष्म इकाइयों की स्थापना के लिए 25-35% तक पूंजीगत सब्सिडी।',
        min_loan_amount: 100000,
        max_loan_amount: 5000000,
        subsidy_pct: 35.0,
        min_revenue_threshold: 0,
        max_revenue_threshold: null,
        target_problems: ['workingcap', 'loanrepay', 'rawcost', 'marketing'],
        target_genders: ['male', 'female', 'other'],
        base_eligibility_score: 81,
        details_url: 'https://www.kviconline.gov.in/pmegpeportal/',
      },
      {
        id: '6',
        code: 'stand_up_india',
        name_en: 'Stand-Up India Scheme',
        name_hi: 'स्टैंड-अप इंडिया योजना',
        ministry_en: 'Ministry of Finance / SIDBI',
        ministry_hi: 'वित्त मंत्रालय / सिडबी',
        description_en: 'Bank loans between ₹10 lakh and ₹1 Crore for enterprises by Women and SC/ST.',
        description_hi: 'महिला एवं एससी/एसटी उद्यमियों के लिए ₹10 लाख से ₹1 करोड़ तक का ऋण।',
        min_loan_amount: 1000000,
        max_loan_amount: 10000000,
        subsidy_pct: 0,
        min_revenue_threshold: 20000,
        max_revenue_threshold: null,
        target_problems: ['workingcap', 'marketing', 'suppliers'],
        target_genders: ['female', 'other'],
        base_eligibility_score: 72,
        details_url: 'https://www.standupmitra.in/',
      },
      {
        id: '7',
        code: 'pm_vishwakarma',
        name_en: 'PM Vishwakarma Scheme',
        name_hi: 'पीएम विश्वकर्मा योजना',
        ministry_en: 'Ministry of MSME',
        ministry_hi: 'एमएसएमई मंत्रालय',
        description_en: 'Holistic support for artisans with collateral-free loans up to ₹3 lakh at 5% interest.',
        description_hi: 'कारीगरों के लिए ₹3 लाख तक का संपार्श्विक-मुक्त 5% ब्याज ऋण।',
        min_loan_amount: 100000,
        max_loan_amount: 300000,
        subsidy_pct: 5.0,
        min_revenue_threshold: 0,
        max_revenue_threshold: null,
        target_problems: ['workingcap', 'rawcost', 'suppliers', 'marketing'],
        target_genders: ['male', 'female', 'other'],
        base_eligibility_score: 85,
        details_url: 'https://pmvishwakarma.gov.in/',
      },
    ];
  }
}

const inMemoryStore = new InMemoryStore();
let isPostgresAvailable = false;
let pool = null;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/udyam_setu';

try {
  pool = new Pool({
    connectionString,
    connectionTimeoutMillis: 3000,
  });

  pool.on('error', (err) => {
    // Non-fatal warning when pool connection drops or reconnects
    isPostgresAvailable = false;
  });

  pool.query('SELECT NOW()', (err) => {
    if (err) {
      console.log('ℹ️  [DB] PostgreSQL offline/unreachable. Active storage mode: InMemoryStore (Local Development)');
      isPostgresAvailable = false;
    } else {
      console.log('✅ [DB] Connected to PostgreSQL successfully.');
      isPostgresAvailable = true;
    }
  });
} catch (e) {
  console.log('ℹ️  [DB] Active storage mode: InMemoryStore (Local Development)');
}

module.exports = {
  pool,
  inMemoryStore,
  isPostgres: () => isPostgresAvailable,
};
