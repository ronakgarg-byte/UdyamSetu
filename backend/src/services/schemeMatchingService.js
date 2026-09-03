/**
 * Government Schemes Matching Engine
 * SIH 2026 Problem Statement SIH26091
 * 
 * Modular rule-based matcher designed to accept:
 * - User Demographics (gender, age, district)
 * - Business Info (type, what)
 * - Financial Metrics (revenue, net profit, working capital, debt ratio)
 * - Selected Business Problems (working capital, loan repayment, raw cost, etc.)
 * - Aggregated Hyper-Local Context (demographics, mandi prices, banking density)
 * 
 * Contract is designed so this rule engine can be swapped seamlessly with a trained ML model.
 */

const SCHEMES_MASTER = [
  {
    code: 'pm_svanidhi',
    name_en: 'PM-SVANidhi (Street Vendor’s AtmaNirbhar Nidhi)',
    name_hi: 'पीएम स्वनिधि (स्ट्रीट वेंडर्स आत्मनिर्भर निधि)',
    ministry_en: 'Ministry of Housing and Urban Affairs',
    ministry_hi: 'आवासन और शहरी कार्य मंत्रालय',
    description_en: 'Collateral-free working capital micro-loan up to ₹50,000 with 7% interest subsidy and cashback on digital transactions.',
    description_hi: 'डिजिटल लेनदेन पर 7% ब्याज सब्सिडी और कैशबैक के साथ ₹50,000 तक का संपार्श्विक-मुक्त कार्यशील पूंजी सूक्ष्म ऋण।',
    loanCeiling: 50000,
    interestSubsidyPct: 7.0,
    baseScore: 70,
    targetProblems: ['workingcap', 'customers', 'loanrepay'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
    keyBenefits_en: ['No collateral or guarantor required', '7% interest subsidy credited directly to bank', 'Step-up credit limit up to ₹50,000 on prompt repayment'],
    keyBenefits_hi: ['किसी गारंटी या बंधक की आवश्यकता नहीं', '7% ब्याज सब्सिडी सीधे बैंक खाते में जमा', 'समय पर भुगतान करने पर ₹50,000 तक की ऋण सीमा'],
  },
  {
    code: 'pmegp',
    name_en: 'PMEGP (Prime Minister’s Employment Generation Programme)',
    name_hi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
    ministry_en: 'Ministry of MSME / KVIC',
    ministry_hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
    description_en: 'Credit-linked capital subsidy scheme providing 25% to 35% government subsidy for setting up or expanding rural micro-enterprises.',
    description_hi: 'ग्रामीण सूक्ष्म उद्यमों की स्थापना या विस्तार के लिए 25% से 35% सरकारी सब्सिडी प्रदान करने वाली क्रेडिट-लिंक्ड योजना।',
    loanCeiling: 5000000,
    interestSubsidyPct: 35.0,
    baseScore: 68,
    targetProblems: ['workingcap', 'loanrepay', 'rawcost', 'marketing', 'transport'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    keyBenefits_en: ['Up to 35% margin money subsidy in rural areas', 'Bank finance covering 90-95% of project cost', 'Includes skill entrepreneurship development support'],
    keyBenefits_hi: ['ग्रामीण क्षेत्रों में 35% तक मार्जिन मनी सब्सिडी', 'परियोजना लागत का 90-95% बैंक वित्तपोषण', 'कौशल उद्यमिता विकास प्रशिक्षण शामिल'],
  },
  {
    code: 'pm_vishwakarma',
    name_en: 'PM Vishwakarma Scheme',
    name_hi: 'पीएम विश्वकर्मा योजना',
    ministry_en: 'Ministry of MSME / Skill Development',
    ministry_hi: 'एमएसएमई मंत्रालय / कौशल विकास मंत्रालय',
    description_en: 'Holistic support for traditional artisans and craftspersons with collateral-free credit up to ₹3 lakh at 5% concessional interest.',
    description_hi: 'पारंपरिक कारीगरों और शिल्पकारों के लिए 5% रियायती ब्याज पर ₹3 लाख तक का संपार्श्विक-मुक्त ऋण और टूलकिट सहायता।',
    loanCeiling: 300000,
    interestSubsidyPct: 5.0,
    baseScore: 72,
    targetProblems: ['workingcap', 'rawcost', 'suppliers', 'marketing', 'stock'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://pmvishwakarma.gov.in/',
    keyBenefits_en: ['Collateral-free loan at 5% fixed interest', '₹15,000 modern toolkit incentive', 'Skill training with ₹500/day stipend + PM Vishwakarma ID'],
    keyBenefits_hi: ['5% निश्चित ब्याज पर संपार्श्विक-मुक्त ऋण', '₹15,000 का आधुनिक टूलकिट प्रोत्साहन', '₹500/दिन वजीफे के साथ कौशल प्रशिक्षण + आधिकारिक पहचान पत्र'],
  },
  {
    code: 'mudra_shishu',
    name_en: 'Pradhan Mantri Mudra Yojana (Shishu)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
    ministry_en: 'Ministry of Finance / MSME',
    ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
    description_en: 'Micro-credit loan up to ₹50,000 for starting or stabilizing small micro-enterprises with minimal paperwork and zero collateral.',
    description_hi: 'बिना किसी गारंटी और न्यूनतम कागजी कार्रवाई के छोटे व्यवसायों को शुरू या स्थिर करने के लिए ₹50,000 तक का सूक्ष्म ऋण।',
    loanCeiling: 50000,
    interestSubsidyPct: 0.0,
    baseScore: 74,
    targetProblems: ['workingcap', 'stock', 'unknown', 'customers'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://www.mudra.org.in/',
    keyBenefits_en: ['No collateral or processing fee', 'Quick disbursement via Mudra Debit Card', 'Ideal for initial inventory and daily working capital'],
    keyBenefits_hi: ['कोई बंधक या प्रोसेसिंग शुल्क नहीं', 'मुद्रा डेबिट कार्ड के माध्यम से त्वरित वितरण', 'प्रारंभिक स्टॉक और दैनिक कार्यशील पूंजी के लिए उपयुक्त'],
  },
  {
    code: 'mudra_kishore',
    name_en: 'Pradhan Mantri Mudra Yojana (Kishore)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (किशोर)',
    ministry_en: 'Ministry of Finance / MSME',
    ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
    description_en: 'Loans from ₹50,000 up to ₹5,00,000 for growing micro-enterprises to purchase equipment, raw materials, or expand shop premises.',
    description_hi: 'व्यवसाय विस्तार, उपकरण या कच्चा माल खरीदने के लिए ₹50,000 से ₹5,00,000 तक का ऋण।',
    loanCeiling: 500000,
    interestSubsidyPct: 0.0,
    baseScore: 70,
    targetProblems: ['workingcap', 'rawcost', 'suppliers', 'pricing'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://www.mudra.org.in/',
    keyBenefits_en: ['Loans up to ₹5 lakh without third-party collateral', 'Flexible repayment tenure up to 5 years', 'Covers both machinery purchase and working funds'],
    keyBenefits_hi: ['बिना किसी तीसरे पक्ष की गारंटी के ₹5 लाख तक का ऋण', '5 वर्ष तक की लचीली पुनर्भुगतान अवधि', 'मशीनरी खरीद और कार्यशील पूंजी दोनों के लिए'],
  },
  {
    code: 'mudra_tarun',
    name_en: 'Pradhan Mantri Mudra Yojana (Tarun)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (तरुण)',
    ministry_en: 'Ministry of Finance / MSME',
    ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
    description_en: 'Higher tier credit from ₹5,00,000 up to ₹10,00,000 (and up to ₹20 lakh under updated limits) for established enterprises looking for scale.',
    description_hi: 'स्थापित व्यवसायों के बड़े पैमाने पर विस्तार के लिए ₹5,00,000 से ₹10,00,000 तक का उच्च श्रेणी का ऋण।',
    loanCeiling: 1000000,
    interestSubsidyPct: 0.0,
    baseScore: 65,
    targetProblems: ['workingcap', 'transport', 'marketing', 'employees'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://www.mudra.org.in/',
    keyBenefits_en: ['High credit limit up to ₹10-20 Lakhs', 'Competitive banking interest rates', 'Supports multi-location expansion and modern technology'],
    keyBenefits_hi: ['₹10-20 लाख तक की उच्च ऋण सीमा', 'प्रतिस्पर्धी बैंक ब्याज दरें', 'व्यापार विस्तार और आधुनिक तकनीक में सहायक'],
  },
  {
    code: 'stand_up_india',
    name_en: 'Stand-Up India Scheme',
    name_hi: 'स्टैंड-अप इंडिया योजना',
    ministry_en: 'Ministry of Finance / SIDBI',
    ministry_hi: 'वित्त मंत्रालय / सिडबी',
    description_en: 'Bank loans between ₹10 lakh and ₹1 Crore for greenfield manufacturing and service enterprises set up by SC, ST, and Women entrepreneurs.',
    description_hi: 'अनुसूचित जाति, अनुसूचित जनजाति और महिला उद्यमियों द्वारा स्थापित नए उद्यमों के लिए ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण।',
    loanCeiling: 10000000,
    interestSubsidyPct: 0.0,
    baseScore: 60,
    targetProblems: ['workingcap', 'marketing', 'suppliers'],
    targetGenders: ['female', 'other'],
    portalUrl: 'https://www.standupmitra.in/',
    keyBenefits_en: ['Substantial credit range ₹10 Lakh to ₹1 Crore', 'Dedicated handholding by SIDBI & Lead District Managers', 'Repayable in 7 years with up to 18 months moratorium'],
    keyBenefits_hi: ['₹10 लाख से ₹1 करोड़ तक का पर्याप्त ऋण', 'सिडबी और जिला प्रबंधकों द्वारा पूर्ण मार्गदर्शन', '18 महीने के अधिस्थगन के साथ 7 वर्षों में पुनर्भुगतान'],
  },
];

/**
 * Matches government schemes against user profile, financial metrics, and local context.
 */
function matchSchemes(user = {}, business = {}, financial = {}, problems = [], localContext = {}) {
  const revenue = financial.revenue || 0;
  const userGender = (user.gender || '').toLowerCase();
  const safeProblems = Array.isArray(problems) ? problems : [];

  const evaluatedSchemes = SCHEMES_MASTER.map((scheme) => {
    let score = scheme.baseScore;

    // 1. Revenue Matcher Rules
    if (scheme.code === 'pm_svanidhi') {
      if (revenue > 0 && revenue < 15000) {
        score = 88; // Exact prototype match
      } else if (revenue >= 15000 && revenue <= 30000) {
        score += 5;
      } else if (revenue > 50000) {
        score -= 25;
      }
    } else if (scheme.code === 'pmegp') {
      if (safeProblems.includes('workingcap') || safeProblems.includes('loanrepay')) {
        score = 81; // Exact prototype match
      } else if (revenue >= 15000) {
        score += 8;
      }
    } else if (scheme.code === 'mudra_tarun') {
      if (revenue >= 50000) {
        score = 79; // Exact prototype match
      } else if (revenue < 25000) {
        score -= 20;
      }
    } else if (scheme.code === 'mudra_shishu') {
      if (revenue <= 30000) {
        score = Math.max(score, 74); // Exact prototype match baseline
      }
    } else if (scheme.code === 'mudra_kishore') {
      if (revenue >= 20000 && revenue <= 60000) {
        score += 8;
      }
    } else if (scheme.code === 'stand_up_india') {
      if (userGender === 'female' || userGender === 'other') {
        score += 20;
      } else {
        score -= 15;
      }
    } else if (scheme.code === 'pm_vishwakarma') {
      const bizWhat = (business.what || '').toLowerCase();
      const isArtisan = /tailor|sew|cloth|carpenter|wood|iron|smith|potter|basket|weave|barber|artisan/i.test(bizWhat);
      if (isArtisan || safeProblems.includes('rawcost') || safeProblems.includes('suppliers')) {
        score += 13;
      }
    }

    // 2. Problem Alignment Modifiers
    const matchedProblems = scheme.targetProblems.filter((p) => safeProblems.includes(p));
    score += matchedProblems.length * 2;

    // 3. Local Context Alignment (Rural demographic modifier)
    if (localContext?.demographics?.ruralRatio && scheme.code === 'pmegp') {
      score += 2; // Rural subsidy boost
    }

    // Clamp score between 40 and 96
    const finalMatch = Math.min(96, Math.max(40, Math.round(score)));

    return {
      code: scheme.code,
      name_en: scheme.name_en,
      name_hi: scheme.name_hi,
      ministry_en: scheme.ministry_en,
      ministry_hi: scheme.ministry_hi,
      description_en: scheme.description_en,
      description_hi: scheme.description_hi,
      matchPercentage: finalMatch,
      loanCeiling: scheme.loanCeiling,
      interestSubsidyPct: scheme.interestSubsidyPct,
      portalUrl: scheme.portalUrl,
      keyBenefits_en: scheme.keyBenefits_en,
      keyBenefits_hi: scheme.keyBenefits_hi,
    };
  });

  // Sort descending by match percentage
  evaluatedSchemes.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return evaluatedSchemes;
}

module.exports = {
  matchSchemes,
  SCHEMES_MASTER,
};
