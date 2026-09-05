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
    isBeginner: false,
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

/**
 * Beginner Business Idea & Starter Roadmap Engine
 * For aspiring entrepreneurs who have not started a business yet.
 */
function calculateBeginnerPlan(user = {}, business = {}, problems = [], localContext = {}) {
  const interests = (Array.isArray(business.interests) ? business.interests.join(' ') : String(business.interests || business.what || '')).toLowerCase();
  const skills = (Array.isArray(business.skills) ? business.skills.join(' ') : String(business.skills || '')).toLowerCase();
  const barriers = (Array.isArray(business.barriers) ? business.barriers.join(' ') : String(business.barriers || '')).toLowerCase();
  const capitalRange = business.capital_range || business.capitalRange || '10k_50k';
  const spaceType = business.space_type || business.spaceType || 'home';
  const timeCommitment = business.time_commitment || business.timeCommitment || 'full_time';
  const userGender = (user.gender || '').toLowerCase();
  const district = user.district || business.district || 'Varanasi';

  // 1. Business Idea Recommendation Matrix
  let ideaKey = 'kirana';
  let ideaTitle_en = 'Regional Daily Essentials & Kirana Store';
  let ideaTitle_hi = 'क्षेत्रीय दैनिक सामान व मिनी किराना दुकान';
  let ideaDesc_en = 'Fast-moving daily grocery and household items with consistent local repeat footfall and quick daily cash turnover.';
  let ideaDesc_hi = 'स्थानीय नियमित ग्राहकों के लिए दैनिक किराना और घरेलू सामान, जिसमें दैनिक नकद आमदनी और सुरक्षित मांग रहती है।';
  let initialStockCost = 25000;
  let equipmentCost = 10000;
  let estimatedMonthlyProfit = '₹15,000 – ₹25,000';
  let breakEvenTimeline_en = '2 to 3 Months';
  let breakEvenTimeline_hi = '2 से 3 महीने';

  if (interests.includes('food') || interests.includes('tea') || interests.includes('snack') || skills.includes('cook')) {
    ideaKey = 'food';
    ideaTitle_en = 'Street Food & Beverage Stall';
    ideaTitle_hi = 'चाय, नाश्ता व फ़ास्ट फ़ूड कॉर्नर';
    ideaDesc_en = 'High-margin fresh tea, morning snacks, and evening street foods targeting daily commuters, workers, and students.';
    ideaDesc_hi = 'दैनिक यात्रियों, मजदूरों और छात्रों के लिए उच्च-मार्जिन वाली ताज़ा चाय, सुबह का नाश्ता और शाम के स्नैक्स।';
    initialStockCost = 8000;
    equipmentCost = 12000;
    estimatedMonthlyProfit = '₹18,000 – ₹30,000';
    breakEvenTimeline_en = '1 to 2 Months';
    breakEvenTimeline_hi = '1 से 2 महीने';
  } else if (interests.includes('tailor') || interests.includes('garment') || interests.includes('cloth') || skills.includes('sew')) {
    ideaKey = 'tailoring';
    ideaTitle_en = 'Custom Tailoring, Alterations & Boutique Studio';
    ideaTitle_hi = 'कस्टम सिलाई, ऑल्टरेशन व लेडीज बुटीक';
    ideaDesc_en = 'Low overhead home-based or market tailoring unit providing blouse, suit, uniform stitching and seasonal alterations.';
    ideaDesc_hi = 'कम लागत में घर से या दुकान से सिलाई, सूट-ब्लाउज और स्कूल यूनिफॉर्म सिलाई केंद्र, जिसमें सीधा श्रम मुनाफा मिलता है।';
    initialStockCost = 10000;
    equipmentCost = 18000;
    estimatedMonthlyProfit = '₹16,000 – ₹28,000';
    breakEvenTimeline_en = '2 Months';
    breakEvenTimeline_hi = '2 महीने';
  } else if (interests.includes('repair') || interests.includes('mobile') || interests.includes('electric') || skills.includes('tech')) {
    ideaKey = 'repair';
    ideaTitle_en = 'Mobile Accessories & Electronics Quick Repair Center';
    ideaTitle_hi = 'मोबाइल एक्सेसरीज़ व इलेक्ट्रॉनिक मरम्मत केंद्र';
    ideaDesc_en = 'Fast-turnaround screen guard, charging cables, battery replacement and small home appliance servicing.';
    ideaDesc_hi = 'स्क्रीन गार्ड, चार्जर, केबल बिक्री और मोबाइल व छोटे घरेलू उपकरणों की त्वरित मरम्मत सेवा।';
    initialStockCost = 20000;
    equipmentCost = 15000;
    estimatedMonthlyProfit = '₹20,000 – ₹35,000';
    breakEvenTimeline_en = '2 to 3 Months';
    breakEvenTimeline_hi = '2 से 3 महीने';
  } else if (interests.includes('dairy') || interests.includes('milk') || interests.includes('animal') || skills.includes('farm')) {
    ideaKey = 'dairy';
    ideaTitle_en = 'Dairy Value-Addition & Pure Milk Products Hub';
    ideaTitle_hi = 'शुद्ध डेयरी उत्पाद, पनीर व दुग्ध केंद्र';
    ideaDesc_en = 'Processing fresh milk into high-margin paneer, curd, ghee, and sweets with direct village-to-market supply.';
    ideaDesc_hi = 'ताजे दूध से उच्च मुनाफे वाले पनीर, दही, छाछ और शुद्ध घी तैयार कर सीधे स्थानीय बाजार में आपूर्ति।';
    initialStockCost = 15000;
    equipmentCost = 20000;
    estimatedMonthlyProfit = '₹22,000 – ₹38,000';
    breakEvenTimeline_en = '2 Months';
    breakEvenTimeline_hi = '2 महीने';
  } else if (interests.includes('craft') || interests.includes('handicraft') || interests.includes('wood') || interests.includes('artisan') || interests.includes('smith')) {
    ideaKey = 'artisan';
    ideaTitle_en = 'Handmade Crafts & Stitching Boutique';
    ideaTitle_hi = 'पारंपरिक हस्तशिल्प व काष्ठ कला कार्यशाला';
    ideaDesc_en = 'Handcrafted home decor, wooden utensils, and cultural crafts eligible for PM Vishwakarma 5% credit and toolkit grants.';
    ideaDesc_hi = 'पीएम विश्वकर्मा योजना के तहत ₹15,000 की टूलकिट और 5% सस्ते ऋण के साथ पारंपरिक हस्तशिल्प और उत्पाद निर्माण।';
    initialStockCost = 12000;
    equipmentCost = 25000;
    estimatedMonthlyProfit = '₹18,000 – ₹32,000';
    breakEvenTimeline_en = '2 to 4 Months';
    breakEvenTimeline_hi = '2 से 4 महीने';
  }

  // Adjust budget according to chosen capital range
  if (capitalRange === 'under_10k') {
    initialStockCost = Math.min(initialStockCost, 6000);
    equipmentCost = Math.min(equipmentCost, 4000);
  } else if (capitalRange === '50k_2lakh') {
    initialStockCost = Math.round(initialStockCost * 1.8);
    equipmentCost = Math.round(equipmentCost * 1.5);
  } else if (capitalRange === '2lakh_5lakh') {
    initialStockCost = Math.round(initialStockCost * 3.5);
    equipmentCost = Math.round(equipmentCost * 3.0);
  }

  const totalStartupBudget = initialStockCost + equipmentCost;

  // 2. 5-Step Action Roadmap
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
      desc: 'Check today\'s modal wholesale rates to purchase initial inventory directly from the mandi yard, saving 15-30% middleman margins.',
      desc_en: 'Check today\'s modal wholesale rates to purchase initial inventory directly from the mandi yard, saving 15-30% middleman margins.',
      desc_hi: 'दैनिक थोक मंडी भाव देखकर सीधे मुख्य मंडी या थोक मंडी से नकद में सामान खरीदें, जिससे 15-30% की सीधी बचत होगी।',
      linkText: 'Check Live Mandi Prices',
      action: 'view_mandi',
      badge: '15-30% Savings',
    },
    {
      step: 3,
      title: 'Apply for Govt Capital Subsidy or Mudra Loan',
      title_en: 'Apply for Govt Capital Subsidy or Mudra Loan',
      title_hi: 'सरकारी पूंजीगत सब्सिडी या मुद्रा ऋण हेतु आवेदन',
      desc: capitalRange === 'under_10k' || capitalRange === '10k_50k' || capitalRange === 'loan_needed'
        ? 'Apply for PM Mudra Yojana (Shishu) for up to ₹50,000 micro-credit with no collateral and nominal bank interest.'
        : 'Apply on PMEGP portal for 25% to 35% capital subsidy grant on project costs up to ₹50 Lakhs.',
      desc_en: capitalRange === 'under_10k' || capitalRange === '10k_50k' || capitalRange === 'loan_needed'
        ? 'Apply for PM Mudra Yojana (Shishu) for up to ₹50,000 micro-credit with no collateral and nominal bank interest.'
        : 'Apply on PMEGP portal for 25% to 35% capital subsidy grant on project costs up to ₹50 Lakhs.',
      desc_hi: capitalRange === 'under_10k' || capitalRange === '10k_50k' || capitalRange === 'loan_needed'
        ? 'बिना किसी गारंटी के ₹50,000 तक के सूक्ष्म ऋण के लिए प्रधानमंत्री मुद्रा (शिशु) में आवेदन करें।'
        : 'परियोजना लागत पर 25-35% सरकारी सब्सिडी (माफ होने वाली पूंजी) के लिए पीएमईजीपी पोर्टल पर आवेदन करें।',
      linkText: 'Apply on Portal ↗',
      url: capitalRange === 'under_10k' || capitalRange === '10k_50k' || capitalRange === 'loan_needed'
        ? 'https://www.mudra.org.in/'
        : 'https://www.kviconline.gov.in/pmegpeportal/',
      badge: 'Govt Backed',
    },
    {
      step: 4,
      title: spaceType === 'home' ? 'Set Up Low-Cost Home / Stall Space' : 'Lock Affordable Commercial / Market Location',
      title_en: spaceType === 'home' ? 'Set Up Low-Cost Home / Stall Space' : 'Lock Affordable Commercial / Market Location',
      title_hi: spaceType === 'home' ? 'कम लागत में घरेलू कार्यक्षेत्र या स्टॉल की तैयारी' : 'उचित स्थान पर दुकान व रैक की व्यवस्था',
      desc: spaceType === 'home'
        ? 'Keep fixed overheads at ₹0 during the initial 60 days by utilizing home space or portable display counters.'
        : 'Ensure high footfall near bus stands, school gates, or crossroads while negotiating minimum advance security deposit.',
      desc_en: spaceType === 'home'
        ? 'Keep fixed overheads at ₹0 during the initial 60 days by utilizing home space or portable display counters.'
        : 'Ensure high footfall near bus stands, school gates, or crossroads while negotiating minimum advance security deposit.',
      desc_hi: spaceType === 'home'
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

  // 3. Recommended Starter Scheme
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

  if (capitalRange === 'under_10k') {
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
  } else if (ideaKey === 'artisan' || skills.includes('artisan') || skills.includes('wood') || skills.includes('craft') || interests.includes('craft') || interests.includes('tailor') || skills.includes('stitch') || skills.includes('sew')) {
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
  } else if (capitalRange === '50k_2lakh' || capitalRange === '2lakh_5lakh') {
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
  } else if (userGender === 'female' && (capitalRange === '50k_2lakh' || capitalRange === '2lakh_5lakh')) {
    starterScheme = {
      code: 'stand_up_india',
      name: 'Stand-Up India Scheme',
      name_en: 'Stand-Up India Scheme',
      name_hi: 'स्टैंड-अप इंडिया योजना',
      ministry: 'Ministry of Finance / SIDBI',
      ministry_en: 'Ministry of Finance / SIDBI',
      ministry_hi: 'वित्त मंत्रालय / सिडबी',
      portalUrl: 'https://www.standupmitra.in/',
      loanCeiling: 10000000,
      interestSubsidyPct: 0.0,
      match: 90,
      keyBenefit: 'Greenfield enterprise loans from ₹10 Lakhs to ₹1 Crore for women entrepreneurs with handholding by SIDBI.',
      keyBenefit_en: 'Greenfield enterprise loans from ₹10 Lakhs to ₹1 Crore for women entrepreneurs with handholding by SIDBI.',
      keyBenefit_hi: 'महिला उद्यमियों द्वारा नए उद्यम की स्थापना के लिए ₹10 लाख से ₹1 करोड़ तक का बैंक ऋण व पूर्ण मार्गदर्शन।',
    };
  }

  const recommendedIdea = {
    key: ideaKey,
    title: ideaTitle_en,
    title_en: ideaTitle_en,
    title_hi: ideaTitle_hi,
    desc: ideaDesc_en,
    desc_en: ideaDesc_en,
    desc_hi: ideaDesc_hi,
    estimatedMonthlyProfit,
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
  };

  return {
    isBeginner: true,
    recommendedIdea,
    budget,
    starterSteps,
    steps: starterSteps,
    starterScheme,
    recommendedScheme: starterScheme,
    estimatedStartupCost: totalStartupBudget,
    projectedMonthlyProfit: estimatedMonthlyProfit,
    localDistrict: district,
  };
}

module.exports = {
  calculateFinancialMetrics,
  calculateBeginnerPlan,
};
