/**
 * Government Schemes Matching Engine
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
    description_en: 'Higher tier credit from ₹5,00,000 up to ₹10,00,000 for established enterprises looking for scale.',
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
  {
    code: 'udyam_reg',
    name_en: 'Udyam Registration Portal (Zero Cost MSME Certificate)',
    name_hi: 'उद्यम पंजीकरण पोर्टल (निःशुल्क एमएसएमई प्रमाण पत्र)',
    ministry_en: 'Ministry of MSME',
    ministry_hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
    description_en: 'Official government registration granting priority lending, collateral exemptions, and subsidy eligibility.',
    description_hi: 'प्राथमिकता बैंक ऋण और सरकारी सब्सिडी हेतु आधिकारिक निःशुल्क एमएसएमई पंजीकरण।',
    loanCeiling: 0,
    interestSubsidyPct: 100.0,
    baseScore: 92,
    targetProblems: ['unknown', 'workingcap', 'marketing'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://udyamregistration.gov.in/',
    keyBenefits_en: ['100% Free & paperless registration with Aadhaar', 'Mandatory for government subsidies & collateral waivers', 'Protection against delayed payments under MSME Act'],
    keyBenefits_hi: ['आधार द्वारा 100% निःशुल्क व कागज-रहित पंजीकरण', 'सरकारी सब्सिडी व बिना गारंटी बैंक लोन हेतु अनिवार्य', 'एमएसएमई कानून के तहत भुगतान सुरक्षा'],
  },
  {
    code: 'pmkvy',
    name_en: 'PMKVY (Pradhan Mantri Kaushal Vikas Yojana)',
    name_hi: 'प्रधानमंत्री कौशल विकास योजना (पीएमकेवीवाई)',
    ministry_en: 'Ministry of Skill Development and Entrepreneurship',
    ministry_hi: 'कौशल विकास और उद्यमिता मंत्रालय',
    description_en: 'Free government skill training and entrepreneurship certification with cash rewards for beginners.',
    description_hi: 'शुरुआती उद्यमियों के लिए निःशुल्क सरकारी कौशल प्रशिक्षण, प्रमाण पत्र व मार्गदर्शन।',
    loanCeiling: 0,
    interestSubsidyPct: 100.0,
    baseScore: 86,
    targetProblems: ['unknown', 'employees'],
    targetGenders: ['male', 'female', 'other'],
    portalUrl: 'https://www.pmkvyofficial.org/',
    keyBenefits_en: ['Free hands-on industry skill training', 'Government-recognized skill certification', 'Monetary rewards up to ₹8,000 upon successful completion'],
    keyBenefits_hi: ['निःशुल्क व्यावहारिक कौशल व व्यापार प्रशिक्षण', 'मान्यता प्राप्त सरकारी कौशल प्रमाण पत्र', 'सफलतापूर्वक पूरा करने पर ₹8,000 तक का नकद पुरस्कार'],
  },
];

function matchSchemes(user = {}, business = {}, financial = {}, problems = [], localContext = {}) {
  const isBeginner =
    user.portal_type === 'beginner' ||
    business.portal_type === 'beginner' ||
    financial.isBeginner === true;

  const revenue = financial.revenue || 0;
  const userGender = (user.gender || '').toLowerCase();
  const safeProblems = Array.isArray(problems) ? problems : [];
  const capitalRange = business.capital_range || business.capitalRange || '';
  const skills = (business.skills || '').toLowerCase();
  const bizWhat = (business.what || business.interests || '').toLowerCase();
  const isArtisan = /tailor|sew|cloth|carpenter|wood|iron|smith|potter|basket|weave|barber|artisan/i.test(bizWhat) ||
    /tailor|sew|carpenter|wood|iron|smith|artisan/i.test(skills);

  const evaluatedSchemes = SCHEMES_MASTER.map((scheme) => {
    let score = scheme.baseScore;

    if (isBeginner) {
      // Beginner specific matching rules
      if (scheme.code === 'udyam_reg') {
        score = 96;
      } else if (scheme.code === 'mudra_shishu') {
        if (capitalRange === 'under_10k' || capitalRange === '10k_50k' || capitalRange === 'loan_needed') {
          score = 92;
        } else {
          score = 80;
        }
      } else if (scheme.code === 'pm_vishwakarma') {
        if (isArtisan) {
          score = 95;
        } else {
          score = 65;
        }
      } else if (scheme.code === 'pmegp') {
        if (capitalRange === '50k_2lakh' || capitalRange === '2lakh_5lakh') {
          score = 90;
        } else {
          score = 82;
        }
      } else if (scheme.code === 'pmkvy') {
        if (safeProblems.includes('unknown') || skills.length === 0) {
          score = 91;
        } else {
          score = 84;
        }
      } else if (scheme.code === 'stand_up_india') {
        if (userGender === 'female' || userGender === 'other') {
          score = (capitalRange === '2lakh_5lakh' || capitalRange === '50k_2lakh') ? 88 : 78;
        } else {
          score = 45;
        }
      } else if (scheme.code === 'pm_svanidhi') {
        if (capitalRange === 'under_10k' || bizWhat.includes('food') || bizWhat.includes('stall') || bizWhat.includes('tea')) {
          score = 85;
        } else {
          score = 60;
        }
      } else if (scheme.code === 'mudra_tarun' || scheme.code === 'mudra_kishore') {
        score -= 20; // beginners rarely qualify for tarun/kishore initially
      }
    } else {
      // Existing business matching rules (existing flow)
      if (scheme.code === 'pm_svanidhi') {
        if (revenue > 0 && revenue < 15000) {
          score = 88;
        } else if (revenue >= 15000 && revenue <= 30000) {
          score += 5;
        } else if (revenue > 50000) {
          score -= 25;
        }
      } else if (scheme.code === 'pmegp') {
        if (safeProblems.includes('workingcap') || safeProblems.includes('loanrepay')) {
          score = 81;
        } else if (revenue >= 15000) {
          score += 8;
        }
      } else if (scheme.code === 'mudra_tarun') {
        if (revenue >= 50000) {
          score = 79;
        } else if (revenue < 25000) {
          score -= 20;
        }
      } else if (scheme.code === 'mudra_shishu') {
        if (revenue <= 30000) {
          score = Math.max(score, 74);
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
        if (isArtisan || safeProblems.includes('rawcost') || safeProblems.includes('suppliers')) {
          score += 13;
        }
      } else if (scheme.code === 'udyam_reg') {
        score = 85;
      } else if (scheme.code === 'pmkvy') {
        score = 70;
      }

      // Problem Alignment Modifiers
      const matchedProblems = scheme.targetProblems.filter((p) => safeProblems.includes(p));
      score += matchedProblems.length * 2;
    }

    // Local Context Alignment
    if (localContext?.demographics?.ruralRatio && scheme.code === 'pmegp') {
      score += 2;
    }

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

  evaluatedSchemes.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return evaluatedSchemes;
}

/**
 * Lightweight Beginner Idea Recommendation & Starter Roadmap Engine
 * Dedicated for Portal A ("Shuruaat" - Aspiring Entrepreneurs)
 */
function getBeginnerRecommendation(user = {}, business = {}, problems = [], localContext = {}) {
  const knowsIdea = String(business.knows_idea || business.knowsIdea || '').toLowerCase();
  const category = (business.idea_category || business.ideaCategory || '').toLowerCase();
  const enjoyDoing = (Array.isArray(business.enjoy_doing || business.enjoyDoing)
    ? (business.enjoy_doing || business.enjoyDoing).join(' ')
    : String(business.enjoy_doing || business.enjoyDoing || business.skills || '')).toLowerCase();
  const toolsOwned = (Array.isArray(business.tools_owned || business.toolsOwned)
    ? (business.tools_owned || business.toolsOwned).join(' ')
    : String(business.tools_owned || business.toolsOwned || '')).toLowerCase();
  const spaceAvailable = business.space_available || business.spaceAvailable || business.space_type || business.spaceType || 'home';
  const capitalRange = business.capital_range || business.capitalRange || '5k_25k';
  const capitalSource = business.capital_source || business.capitalSource || 'savings';
  const timeCommitment = business.time_commitment || business.timeCommitment || 'full_time';
  const unmetNeed = business.unmet_need || business.unmetNeed || '';
  const userGender = (user.gender || '').toLowerCase();
  const district = user.district || business.district || 'Varanasi';

  // 1. Determine Recommended Business Idea
  let ideaKey = 'retail';
  let ideaTitle_en = 'Regional Daily Essentials & Kirana Store';
  let ideaTitle_hi = 'क्षेत्रीय दैनिक सामान व मिनी किराना दुकान';
  let ideaCategory_en = 'Retail & Daily Kirana';
  let ideaCategory_hi = 'खुदरा व दैनिक किराना';
  let ideaDesc_en = 'Fast-moving daily grocery, spices, and packaged foods with consistent local footfall and daily cash turnaround.';
  let ideaDesc_hi = 'स्थानीय ग्राहकों के लिए रोजमर्रा का राशन, मसाले और घरेलू सामान, जिसमें नियमित दैनिक नकद आय और स्थिर मांग रहती है।';
  let initialStockCost = 15000;
  let equipmentCost = 8000;
  let estimatedMonthlyProfit = '₹16,000 – ₹26,000';
  let breakEvenTimeline_en = '2 to 3 Months';
  let breakEvenTimeline_hi = '2 से 3 महीने';

  if (category.includes('food') || enjoyDoing.includes('cook') || toolsOwned.includes('kitchen') || category.includes('snack')) {
    ideaKey = 'food';
    ideaTitle_en = 'Street Food & Beverage Stall';
    ideaTitle_hi = 'चाय, नाश्ता व फ़ास्ट फ़ूड कॉर्नर';
    ideaCategory_en = 'Food & Refreshments';
    ideaCategory_hi = 'खानपान व जलपान';
    ideaDesc_en = 'Fresh tea, breakfast snacks, and evening street food catering to daily commuters, local markets, and workers.';
    ideaDesc_hi = 'दैनिक यात्रियों, बाजार के ग्राहकों और मजदूरों के लिए ताज़ा चाय, सुबह का नाश्ता और शाम के स्नैक्स का केंद्र।';
    initialStockCost = 6000;
    equipmentCost = 9000;
    estimatedMonthlyProfit = '₹18,000 – ₹30,000';
    breakEvenTimeline_en = '1 to 2 Months';
    breakEvenTimeline_hi = '1 से 2 महीने';
  } else if (category.includes('cloth') || category.includes('tailor') || enjoyDoing.includes('stitch') || toolsOwned.includes('sewing')) {
    ideaKey = 'tailoring';
    ideaTitle_en = 'Custom Tailoring, Alterations & Boutique Studio';
    ideaTitle_hi = 'कस्टम सिलाई, ऑल्टरेशन व लेडीज बुटीक';
    ideaCategory_en = 'Clothing & Tailoring';
    ideaCategory_hi = 'वस्त्र व सिलाई';
    ideaDesc_en = 'Direct-labor tailoring and garment alterations for suits, uniforms, and blouses with zero inventory wastage.';
    ideaDesc_hi = 'सूट, ब्लाउज, यूनिफॉर्म सिलाई और कपड़ों की मरम्मत सेवा, जिसमें बिना किसी माल बर्बादी के सीधा श्रम मुनाफा मिलता है।';
    initialStockCost = 7000;
    equipmentCost = 12000;
    estimatedMonthlyProfit = '₹15,000 – ₹28,000';
    breakEvenTimeline_en = '2 Months';
    breakEvenTimeline_hi = '2 महीने';
  } else if (category.includes('handicraft') || category.includes('artisan') || enjoyDoing.includes('craft') || enjoyDoing.includes('art')) {
    ideaKey = 'artisan';
    ideaTitle_en = 'Handmade Crafts & Traditional Artisan Workshop';
    ideaTitle_hi = 'पारंपरिक हस्तशिल्प व काष्ठ कला कार्यशाला';
    ideaCategory_en = 'Handicrafts & Art';
    ideaCategory_hi = 'हस्तशिल्प व कारीगरी';
    ideaDesc_en = 'Artisan-crafted home decor, embroidery, and cultural goods eligible for PM Vishwakarma 5% credit and toolkit grants.';
    ideaDesc_hi = 'पीएम विश्वकर्मा योजना के तहत ₹15,000 की टूलकिट और 5% सस्ते ऋण के साथ पारंपरिक हस्तशिल्प और उत्पाद निर्माण।';
    initialStockCost = 10000;
    equipmentCost = 15000;
    estimatedMonthlyProfit = '₹17,000 – ₹32,000';
    breakEvenTimeline_en = '2 to 3 Months';
    breakEvenTimeline_hi = '2 से 3 महीने';
  } else if (category.includes('service') || category.includes('repair') || enjoyDoing.includes('repair') || enjoyDoing.includes('drive')) {
    ideaKey = 'repair';
    ideaTitle_en = 'Mobile Accessories & Electronics Quick Repair Center';
    ideaTitle_hi = 'मोबाइल एक्सेसरीज़ व इलेक्ट्रॉनिक मरम्मत केंद्र';
    ideaCategory_en = 'Services & Repairs';
    ideaCategory_hi = 'सेवाएं व मरम्मत';
    ideaDesc_en = 'Fast-turnaround screen guard application, charger sales, and small electronic/appliance servicing.';
    ideaDesc_hi = 'स्क्रीन गार्ड, चार्जर बिक्री और मोबाइल व छोटे घरेलू उपकरणों की त्वरित मरम्मत सेवा।';
    initialStockCost = 12000;
    equipmentCost = 14000;
    estimatedMonthlyProfit = '₹20,000 – ₹35,000';
    breakEvenTimeline_en = '2 Months';
    breakEvenTimeline_hi = '2 महीने';
  } else if (category.includes('farm') || category.includes('dairy') || enjoyDoing.includes('farm')) {
    ideaKey = 'dairy';
    ideaTitle_en = 'Dairy Value-Addition & Pure Milk Products Hub';
    ideaTitle_hi = 'शुद्ध डेयरी उत्पाद, पनीर व दुग्ध केंद्र';
    ideaCategory_en = 'Farming & Dairy';
    ideaCategory_hi = 'कृषि व डेयरी';
    ideaDesc_en = 'Processing milk into high-margin paneer, curd, and sweets with direct local supply.';
    ideaDesc_hi = 'ताजे दूध से उच्च मुनाफे वाले पनीर, दही, छाछ और शुद्ध घी तैयार कर सीधे स्थानीय बाजार में आपूर्ति।';
    initialStockCost = 12000;
    equipmentCost = 16000;
    estimatedMonthlyProfit = '₹22,000 – ₹38,000';
    breakEvenTimeline_en = '2 Months';
    breakEvenTimeline_hi = '2 महीने';
  }

  // Adjust budget by capital range
  if (capitalRange === 'under_5k' || capitalRange === 'under_10k') {
    initialStockCost = Math.min(initialStockCost, 4000);
    equipmentCost = Math.min(equipmentCost, 3000);
  } else if (capitalRange === '5k_25k') {
    initialStockCost = Math.min(initialStockCost, 12000);
    equipmentCost = Math.min(equipmentCost, 8000);
  } else if (capitalRange === '25k_1lakh' || capitalRange === '50k_2lakh') {
    initialStockCost = Math.round(initialStockCost * 2.0);
    equipmentCost = Math.round(equipmentCost * 1.6);
  } else if (capitalRange === '1lakh_plus' || capitalRange === '2lakh_5lakh') {
    initialStockCost = Math.round(initialStockCost * 4.0);
    equipmentCost = Math.round(equipmentCost * 3.0);
  }

  const totalStartupBudget = initialStockCost + equipmentCost;

  // 2. 5-Step Starter Plan Steps
  const starterSteps = [
    {
      step: 1,
      title: 'Zero-Cost MSME Registration (Udyam)',
      title_en: 'Zero-Cost MSME Registration (Udyam)',
      title_hi: 'निःशुल्क सरकारी उद्यम पंजीकरण',
      desc: 'Obtain your official 12-digit Udyam number in 10 minutes using Aadhaar for collateral-free bank loans & subsidies.',
      desc_en: 'Obtain your official 12-digit Udyam number in 10 minutes using Aadhaar for collateral-free bank loans & subsidies.',
      desc_hi: 'आधार कार्ड द्वारा 10 मिनट में आधिकारिक 12-अंकों का उद्यम नंबर प्राप्त करें, जिससे बिना गारंटी बैंक लोन व सब्सिडी मिलती है।',
      linkText: 'Udyam Registration Portal ↗',
      url: 'https://udyamregistration.gov.in/',
      badge: 'Mandatory • 100% Free',
    },
    {
      step: 2,
      title: 'Direct Wholesale Sourcing via AGMARKNET',
      title_en: 'Direct Wholesale Sourcing via AGMARKNET',
      title_hi: 'AGMARKNET थोक APMC मंडी से सस्ता कच्चा माल',
      desc: 'Check daily wholesale modal rates to purchase initial inventory directly from the mandi yard, saving 15-30% middleman margins.',
      desc_en: 'Check daily wholesale modal rates to purchase initial inventory directly from the mandi yard, saving 15-30% middleman margins.',
      desc_hi: 'दैनिक थोक मंडी भाव देखकर सीधे मुख्य मंडी या थोक मंडी से नकद में सामान खरीदें, जिससे 15-30% की सीधी बचत होगी।',
      linkText: 'Check Live Mandi Prices',
      action: 'view_mandi',
      badge: '15-30% Savings',
    },
    {
      step: 3,
      title: 'Apply for Starter Capital Subsidy or Mudra Loan',
      title_en: 'Apply for Starter Capital Subsidy or Mudra Loan',
      title_hi: 'सरकारी पूंजीगत सब्सिडी या मुद्रा ऋण हेतु आवेदन',
      desc: capitalRange === 'under_5k' || capitalRange === '5k_25k' || capitalSource === 'loan'
        ? 'Apply for PM Mudra Yojana (Shishu) for up to ₹50,000 micro-credit with no collateral and nominal bank interest.'
        : 'Apply on PMEGP portal for 25% to 35% capital subsidy grant on project costs up to ₹50 Lakhs.',
      desc_en: capitalRange === 'under_5k' || capitalRange === '5k_25k' || capitalSource === 'loan'
        ? 'Apply for PM Mudra Yojana (Shishu) for up to ₹50,000 micro-credit with no collateral and nominal bank interest.'
        : 'Apply on PMEGP portal for 25% to 35% capital subsidy grant on project costs up to ₹50 Lakhs.',
      desc_hi: capitalRange === 'under_5k' || capitalRange === '5k_25k' || capitalSource === 'loan'
        ? 'बिना किसी गारंटी के ₹50,000 तक के सूक्ष्म ऋण के लिए प्रधानमंत्री मुद्रा (शिशु) में आवेदन करें।'
        : 'परियोजना लागत पर 25-35% सरकारी सब्सिडी (माफ होने वाली पूंजी) के लिए पीएमईजीपी पोर्टल पर आवेदन करें।',
      linkText: 'Apply on Portal ↗',
      url: capitalRange === 'under_5k' || capitalRange === '5k_25k' || capitalSource === 'loan'
        ? 'https://www.mudra.org.in/'
        : 'https://www.kviconline.gov.in/pmegpeportal/',
      badge: 'Govt Backed',
    },
    {
      step: 4,
      title: spaceAvailable === 'home' ? 'Set Up Low-Cost Home / Stall Space' : 'Lock Affordable Commercial / Market Location',
      title_en: spaceAvailable === 'home' ? 'Set Up Low-Cost Home / Stall Space' : 'Lock Affordable Commercial / Market Location',
      title_hi: spaceAvailable === 'home' ? 'कम लागत में घरेलू कार्यक्षेत्र या स्टॉल की तैयारी' : 'उचित स्थान पर दुकान व रैक की व्यवस्था',
      desc: spaceAvailable === 'home'
        ? 'Keep fixed overheads at ₹0 during the initial 60 days by utilizing home space or portable display counters.'
        : 'Ensure high footfall near bus stands, school gates, or crossroads while negotiating minimum advance security deposit.',
      desc_en: spaceAvailable === 'home'
        ? 'Keep fixed overheads at ₹0 during the initial 60 days by utilizing home space or portable display counters.'
        : 'Ensure high footfall near bus stands, school gates, or crossroads while negotiating minimum advance security deposit.',
      desc_hi: spaceAvailable === 'home'
        ? 'शुरुआती 60 दिनों में दुकान किराए का खर्च शून्य रखें और घर के कमरे या पोर्टेबल काउंटर से शुरुआत करें।'
        : 'बस स्टैंड, स्कूल या मुख्य चौराहे के पास अधिक आवाजाही वाली जगह चुनें और कम से कम एडवांस देकर शुरुआत करें।',
      badge: 'Low Overhead',
    },
    {
      step: 5,
      title: 'Acquire First 25 Core Customers',
      title_en: 'Acquire First 25 Core Customers',
      title_hi: 'पहले 25 पक्के स्थानीय ग्राहक जोड़ें',
      desc: 'Offer opening introductory discounts to neighbors, family friends, and local shopkeepers with a simple WhatsApp broadcast list.',
      desc_en: 'Offer opening introductory discounts to neighbors, family friends, and local shopkeepers with a simple WhatsApp broadcast list.',
      desc_hi: 'शुरुआती छूट देकर पड़ोसियों, परिचितों और स्थानीय दुकानदारों को जोड़ें और एक साधारण व्हाट्सएप ब्रॉडकास्ट सूची बनाएं।',
      badge: 'Growth Launch',
    },
  ];

  // 3. Match Starter Schemes
  let starterScheme = {
    code: 'mudra_shishu',
    name: 'Pradhan Mantri Mudra Yojana (Shishu)',
    name_en: 'Pradhan Mantri Mudra Yojana (Shishu)',
    name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
    ministry: 'Ministry of Finance / MSME',
    ministry_en: 'Ministry of Finance / MSME',
    ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
    portalUrl: 'https://www.mudra.org.in/',
    loanCeiling: 50000,
    interestSubsidyPct: 0.0,
    match: 92,
    keyBenefit: 'Collateral-free micro-credit up to ₹50,000 with quick bank disbursement for raw materials and starter setup.',
    keyBenefit_en: 'Collateral-free micro-credit up to ₹50,000 with quick bank disbursement for raw materials and starter setup.',
    keyBenefit_hi: 'कच्चा माल व शुरुआती सेटअप के लिए बिना गारंटी ₹50,000 तक का आसान बैंक ऋण।',
  };

  if (capitalRange === 'under_5k' || capitalRange === 'under_10k') {
    starterScheme = {
      code: 'pm_svanidhi',
      name: 'PM SVANidhi Scheme',
      name_en: 'PM SVANidhi Scheme',
      name_hi: 'पीएम स्वनिधि योजना',
      ministry: 'Ministry of Housing and Urban Affairs',
      ministry_en: 'Ministry of Housing and Urban Affairs',
      ministry_hi: 'आवासन और शहरी कार्य मंत्रालय',
      portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
      loanCeiling: 10000,
      interestSubsidyPct: 7.0,
      match: 96,
      keyBenefit: 'Collateral-free working capital starter micro-loan of ₹10,000 with 7% interest subsidy and cashback on digital transactions.',
      keyBenefit_en: 'Collateral-free working capital starter micro-loan of ₹10,000 with 7% interest subsidy and cashback on digital transactions.',
      keyBenefit_hi: 'बिना किसी गारंटी के ₹10,000 का प्रारंभिक कार्यशील ऋण, 7% ब्याज सब्सिडी और डिजिटल भुगतान पर कैशबैक।',
    };
  } else if (ideaKey === 'artisan' || toolsOwned.includes('sewing') || enjoyDoing.includes('craft') || enjoyDoing.includes('stitch')) {
    starterScheme = {
      code: 'pm_vishwakarma',
      name: 'PM Vishwakarma Scheme',
      name_en: 'PM Vishwakarma Scheme',
      name_hi: 'पीएम विश्वकर्मा योजना',
      ministry: 'Ministry of MSME / Skill Development',
      ministry_en: 'Ministry of MSME / Skill Development',
      ministry_hi: 'एमएसएमई मंत्रालय / कौशल विकास मंत्रालय',
      portalUrl: 'https://pmvishwakarma.gov.in/',
      loanCeiling: 300000,
      interestSubsidyPct: 5.0,
      match: 95,
      keyBenefit: '5% concessional credit up to ₹3 Lakhs + ₹15,000 modern toolkit e-voucher + skill training with ₹500/day stipend.',
      keyBenefit_en: '5% concessional credit up to ₹3 Lakhs + ₹15,000 modern toolkit e-voucher + skill training with ₹500/day stipend.',
      keyBenefit_hi: '5% ब्याज पर ₹3 लाख तक का ऋण + ₹15,000 की निःशुल्क आधुनिक टूलकिट + ₹500/दिन वजीफे के साथ प्रशिक्षण।',
    };
  } else if (capitalRange === '25k_1lakh' || capitalRange === '1lakh_plus' || capitalRange === '50k_2lakh' || capitalRange === '2lakh_5lakh') {
    starterScheme = {
      code: 'pmegp',
      name: "PMEGP (Prime Minister's Employment Generation Programme)",
      name_en: "PMEGP (Prime Minister's Employment Generation Programme)",
      name_hi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
      ministry: 'Ministry of MSME / KVIC',
      ministry_en: 'Ministry of MSME / KVIC',
      ministry_hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
      portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
      loanCeiling: 5000000,
      interestSubsidyPct: 35.0,
      match: 89,
      keyBenefit: 'Up to 35% capital subsidy grant (non-repayable margin money) for setting up new rural micro-enterprises.',
      keyBenefit_en: 'Up to 35% capital subsidy grant (non-repayable margin money) for setting up new rural micro-enterprises.',
      keyBenefit_hi: 'ग्रामीण क्षेत्रों में नई इकाइयों की स्थापना हेतु 25% से 35% तक सरकारी पूंजीगत सब्सिडी (माफ होने वाला अनुदान)।',
    };
  }

  const matchedSchemes = matchSchemes(user, { ...business, portal_type: 'beginner', isBeginner: true }, problems, localContext);

  const recommendedIdea = {
    key: ideaKey,
    title: ideaTitle_en,
    title_en: ideaTitle_en,
    title_hi: ideaTitle_hi,
    category: ideaCategory_en,
    category_en: ideaCategory_en,
    category_hi: ideaCategory_hi,
    desc: ideaDesc_en,
    desc_en: ideaDesc_en,
    desc_hi: ideaDesc_hi,
    estimatedMonthlyProfit,
    estimatedStartupCost: totalStartupBudget,
    breakEvenTimeline: breakEvenTimeline_en,
    breakEvenTimeline_en: breakEvenTimeline_en,
    breakEvenTimeline_hi: breakEvenTimeline_hi,
    matchPercentage: 94,
  };

  const budget = {
    initialStockCost,
    equipmentCost,
    totalStartupBudget,
    capitalRange,
    capitalSource,
  };

  return {
    isBeginner: true,
    recommendedIdea,
    budget,
    starterSteps,
    steps: starterSteps,
    starterScheme,
    recommendedScheme: starterScheme,
    matchedSchemes,
    estimatedStartupCost: totalStartupBudget,
    projectedMonthlyProfit: estimatedMonthlyProfit,
    unmetOpportunityNote: unmetNeed || null,
    localDistrict: district,
  };
}

module.exports = {
  matchSchemes,
  getBeginnerRecommendation,
  SCHEMES_MASTER,
};
