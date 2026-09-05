import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { T } from '../i18n/translations';

const AppContext = createContext(null);

export function getStandardMatchedSchemes(user = {}, biz = {}, rev = 0, problems = [], isBeginner = false) {
  const userGender = (user?.gender || '').toLowerCase();
  const bizWhat = (biz?.what || biz?.interests || '').toLowerCase();
  const bizType = (biz?.type || '').toLowerCase();
  const safeProblems = Array.isArray(problems) ? problems : [];
  const isArtisan = /tailor|sew|cloth|carpenter|wood|iron|smith|potter|basket|weave|barber|artisan/i.test(bizWhat) || /tailor|boutique/i.test(bizType);

  const list = [
    {
      code: 'pm_svanidhi',
      name_en: 'PM-SVANidhi (Street Vendor Loan)',
      name_hi: 'पीएम स्वनिधि (स्ट्रीट वेंडर्स ऋण)',
      ministry_en: 'Ministry of Housing and Urban Affairs',
      ministry_hi: 'आवासन और शहरी कार्य मंत्रालय',
      description_en: 'Collateral-free working capital loan up to ₹50,000 with 7% interest subsidy and UPI cashback.',
      description_hi: 'डिजिटल लेनदेन पर 7% ब्याज सब्सिडी व कैशबैक के साथ ₹50,000 तक का संपार्श्विक-मुक्त कार्यशील ऋण।',
      loanCeiling: 50000,
      matchPercentage: rev > 0 && rev < 15000 ? 92 : rev <= 30000 ? 88 : 72,
      portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
      keyBenefits_en: ['No collateral or guarantor needed', '7% direct interest subsidy', 'Limit steps up to ₹50k on prompt repayment'],
      keyBenefits_hi: ['किसी बंधक या गारंटी की जरूरत नहीं', '7% सीधी ब्याज सब्सिडी', 'समय पर चुकाने पर ₹50,000 तक विस्तार'],
    },
    {
      code: 'pm_vishwakarma',
      name_en: 'PM Vishwakarma Scheme',
      name_hi: 'पीएम विश्वकर्मा योजना',
      ministry_en: 'Ministry of MSME / Skill Development',
      ministry_hi: 'एमएसएमई मंत्रालय / कौशल विकास',
      description_en: 'Up to ₹3 Lakh loan at 5% fixed interest + ₹15,000 free toolkit e-voucher for artisans and craftsmen.',
      description_hi: 'कारीगरों व हुनरमंदों के लिए 5% रियायती ब्याज पर ₹3 लाख तक का ऋण + ₹15,000 का टूलकिट वाउचर।',
      loanCeiling: 300000,
      matchPercentage: isArtisan ? 96 : 85,
      portalUrl: 'https://pmvishwakarma.gov.in/',
      keyBenefits_en: ['5% fixed low interest rate', '₹15,000 free modern toolkit grant', '₹500/day training stipend & official ID'],
      keyBenefits_hi: ['5% निश्चित रियायती ब्याज दर', '₹15,000 का आधुनिक टूलकिट अनुदान', '₹500/दिन वजीफा व आधिकारिक पहचान पत्र'],
    },
    {
      code: 'pmegp',
      name_en: 'PMEGP (Prime Minister Employment Generation)',
      name_hi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
      ministry_en: 'Ministry of MSME / KVIC',
      ministry_hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
      description_en: '25% to 35% non-repayable government capital subsidy grant on project costs up to ₹50 Lakhs.',
      description_hi: 'नई विनिर्माण व सेवा इकाइयों हेतु परियोजना लागत पर 25% से 35% तक सीधी सरकारी सब्सिडी।',
      loanCeiling: 5000000,
      matchPercentage: safeProblems.includes('workingcap') || safeProblems.includes('loanrepay') || rev >= 25000 ? 89 : 82,
      portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
      keyBenefits_en: ['Up to 35% capital grant (no repayment for subsidy)', 'Covers machinery, setup & working funds', 'EDP entrepreneurship training included'],
      keyBenefits_hi: ['35% तक पूंजीगत सब्सिडी (माफ अनुदान)', 'मशीनरी, सेटअप व कार्यशील पूंजी शामिल', 'ईडीपी उद्यमिता प्रशिक्षण सम्मिलित'],
    },
    {
      code: 'mudra_shishu',
      name_en: 'Pradhan Mantri Mudra Yojana (Shishu)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
      ministry_en: 'Ministry of Finance / MSME',
      ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
      description_en: 'Zero-collateral micro-credit loan up to ₹50,000 with nominal bank interest and quick disbursement.',
      description_hi: 'बिना किसी गारंटी के ₹50,000 तक का सूक्ष्म ऋण, त्वरित बैंक वितरण के साथ।',
      loanCeiling: 50000,
      matchPercentage: rev <= 30000 || isBeginner ? 90 : 80,
      portalUrl: 'https://www.mudra.org.in/',
      keyBenefits_en: ['No collateral or processing charges', 'Mudra debit card for instant withdrawal', 'Covers initial stock and daily cash needs'],
      keyBenefits_hi: ['कोई बंधक या प्रोसेसिंग शुल्क नहीं', 'मुद्रा कार्ड द्वारा तत्काल निकासी', 'शुरुआती स्टॉक व दैनिक खर्च हेतु उत्तम'],
    },
    {
      code: 'mudra_kishore',
      name_en: 'Pradhan Mantri Mudra Yojana (Kishore)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (किशोर)',
      ministry_en: 'Ministry of Finance / MSME',
      ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
      description_en: 'Working capital and equipment financing from ₹50,000 up to ₹5,00,000 for growing micro-enterprises.',
      description_hi: 'बढ़ते व्यवसायों के लिए ₹50,000 से ₹5,00,000 तक का उपकरण व कार्यशील पूंजी ऋण।',
      loanCeiling: 500000,
      matchPercentage: rev >= 20000 && rev <= 60000 ? 87 : 78,
      portalUrl: 'https://www.mudra.org.in/',
      keyBenefits_en: ['Loans up to ₹5 Lakh without third-party collateral', 'Flexible 5-year repayment tenure', 'Covers equipment purchase & inventory scale'],
      keyBenefits_hi: ['बिना किसी तीसरे पक्ष की गारंटी के ₹5 लाख तक ऋण', '5 वर्ष तक की आसान किश्तें', 'उपकरण व स्टॉक विस्तार दोनों हेतु'],
    },
    {
      code: 'mudra_tarun',
      name_en: 'Pradhan Mantri Mudra Yojana (Tarun)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (तरुण)',
      ministry_en: 'Ministry of Finance / MSME',
      ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
      description_en: 'Loans from ₹5,00,000 up to ₹10,00,000 for established enterprises scaling up operations.',
      description_hi: 'स्थापित व्यवसायों के बड़े पैमाने पर विस्तार के लिए ₹5,00,000 से ₹10,00,000 तक का ऋण।',
      loanCeiling: 1000000,
      matchPercentage: rev >= 50000 ? 86 : 74,
      portalUrl: 'https://www.mudra.org.in/',
      keyBenefits_en: ['Higher credit limit up to ₹10-20 Lakhs', 'Competitive banking interest rates', 'Supports expansion and technology upgrade'],
      keyBenefits_hi: ['₹10-20 लाख तक की उच्च ऋण सीमा', 'प्रतिस्पर्धी बैंक ब्याज दरें', 'शाखा विस्तार व आधुनिक तकनीक में सहायक'],
    },
    {
      code: 'stand_up_india',
      name_en: 'Stand-Up India Scheme',
      name_hi: 'स्टैंड-अप इंडिया योजना',
      ministry_en: 'Ministry of Finance / SIDBI',
      ministry_hi: 'वित्त मंत्रालय / सिडबी',
      description_en: 'Bank loans from ₹10 Lakh to ₹1 Crore for Women and SC/ST entrepreneurs setting up greenfield ventures.',
      description_hi: 'महिला व अनुसूचित जाति/जनजाति उद्यमियों के लिए ₹10 लाख से ₹1 करोड़ तक का व्यापार ऋण।',
      loanCeiling: 10000000,
      matchPercentage: userGender === 'female' ? 94 : 65,
      portalUrl: 'https://www.standupmitra.in/',
      keyBenefits_en: ['Significant funding range ₹10 Lakh to ₹1 Crore', 'Dedicated handholding support by SIDBI', 'Repayment tenure up to 7 years with 18m moratorium'],
      keyBenefits_hi: ['₹10 लाख से ₹1 करोड़ तक की पर्याप्त पूंजी', 'सिडबी द्वारा विशेष मार्गदर्शन व हैंडहोल्डिंग', '18 महीने की छूट के साथ 7 वर्षों में पुनर्भुगतान'],
    },
  ];

  return list.sort((a, b) => b.matchPercentage - a.matchPercentage);
}


export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('udyam_lang') || 'en');
  const [userId, setUserId] = useState(() => localStorage.getItem('udyam_user_id') || null);
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem('udyam_voice_mode') === 'true');
  const [portalType, setPortalType] = useState(() => localStorage.getItem('udyam_portal_type') || 'existing');

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('udyam_user');
    return saved ? JSON.parse(saved) : { name: '', age: '', gender: '', phone: '', portal_type: 'existing' };
  });

  const [biz, setBiz] = useState(() => {
    const saved = localStorage.getItem('udyam_biz');
    return saved ? JSON.parse(saved) : { type: '', what: '', workers: '', hours: '', address: '', district: 'Varanasi', state: 'Uttar Pradesh' };
  });

  const [beginnerData, setBeginnerData] = useState(() => {
    const saved = localStorage.getItem('udyam_beginner_data');
    return saved ? JSON.parse(saved) : {
      interests: [],
      skills: '',
      capitalRange: '10k_50k',
      spaceType: 'home',
      timeCommitment: 'full_time',
      barriers: [],
      address: '',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
    };
  });

  const [growthData, setGrowthData] = useState(() => {
    const saved = localStorage.getItem('udyam_growth_data');
    return saved ? JSON.parse(saved) : {
      aspiration: 'scale',
      barriers: [],
      creditHistory: 'none',
    };
  });

  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem('udyam_sales');
    return saved ? JSON.parse(saved) : { customersPerDay: '', dailySales: '', monthlyRevenue: '' };
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('udyam_expenses');
    return saved ? JSON.parse(saved) : {};
  });

  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('udyam_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [competition, setCompetition] = useState(() => {
    const saved = localStorage.getItem('udyam_competition');
    return saved ? JSON.parse(saved) : { count: '', where: '' };
  });

  const [problems, setProblems] = useState(() => {
    const saved = localStorage.getItem('udyam_problems');
    return saved ? JSON.parse(saved) : [];
  });

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('udyam_items');
    return saved
      ? JSON.parse(saved)
      : [
          { desc: '', sellPrice: '', costPrice: '', seasonal: 'no' },
          { desc: '', sellPrice: '', costPrice: '', seasonal: 'no' },
        ];
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('udyam_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('udyam_portal_type', portalType);
  }, [portalType]);

  useEffect(() => {
    localStorage.setItem('udyam_beginner_data', JSON.stringify(beginnerData));
  }, [beginnerData]);

  useEffect(() => {
    localStorage.setItem('udyam_growth_data', JSON.stringify(growthData));
  }, [growthData]);

  useEffect(() => {
    localStorage.setItem('udyam_voice_mode', String(voiceMode));
  }, [voiceMode]);

  useEffect(() => {
    if (userId) localStorage.setItem('udyam_user_id', userId);
    else localStorage.removeItem('udyam_user_id');
  }, [userId]);

  useEffect(() => {
    localStorage.setItem('udyam_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('udyam_biz', JSON.stringify(biz));
  }, [biz]);

  useEffect(() => {
    localStorage.setItem('udyam_sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('udyam_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('udyam_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('udyam_competition', JSON.stringify(competition));
  }, [competition]);

  useEffect(() => {
    localStorage.setItem('udyam_problems', JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    localStorage.setItem('udyam_items', JSON.stringify(items));
  }, [items]);

  // Translation helper
  const t = (k) => T[k]?.[lang] || T[k]?.en || k;

  // Option translation helper
  const opt = (o) => o[lang] || o.en || o.key;

  // Multi-select toggle helper
  const toggle = (list, val, setFn) => {
    setFn(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);
  };

  const toggleVoiceMode = () => {
    setVoiceMode((prev) => !prev);
  };

  // Local fallback calculations
  const fallbackCalc = useMemo(() => {
    if (portalType === 'beginner') {
      const interestsStr = (beginnerData.interests || []).join(', ').toLowerCase();
      const skillsStr = (beginnerData.skills || '').toLowerCase();
      const cap = beginnerData.capitalRange || '10k_50k';

      let idea = {
        title_en: 'Regional Daily Essentials & Kirana Store',
        title_hi: 'क्षेत्रीय दैनिक सामान व मिनी किराना दुकान',
        desc_en: 'Fast-moving daily grocery and household essentials with steady local repeat footfall.',
        desc_hi: 'दैनिक उपयोग की आवश्यक वस्तुएं और किराना सामान, जिसमें नियमित स्थानीय ग्राहक और सुरक्षित दैनिक नकद आमदनी होती है।',
        estimatedMonthlyProfit: '₹15,000 – ₹25,000',
        breakEvenTimeline_en: '2 to 3 Months',
        breakEvenTimeline_hi: '2 से 3 महीने',
        matchPercentage: 94,
      };

      if (interestsStr.includes('food') || skillsStr.includes('cook')) {
        idea = {
          title_en: 'Tea, Snacks & Breakfast Fast Food Corner',
          title_hi: 'चाय, नाश्ता व फ़ास्ट फ़ूड कॉर्नर',
          desc_en: 'High-margin morning breakfast and evening street food corner with instant daily cash returns.',
          desc_hi: 'उच्च-मार्जिन वाली ताज़ा चाय, सुबह का नाश्ता और शाम के स्नैक्स का स्टॉल।',
          estimatedMonthlyProfit: '₹18,000 – ₹30,000',
          breakEvenTimeline_en: '1 to 2 Months',
          breakEvenTimeline_hi: '1 से 2 महीने',
          matchPercentage: 95,
        };
      } else if (interestsStr.includes('tailoring') || skillsStr.includes('sew')) {
        idea = {
          title_en: 'Custom Tailoring & Ladies Boutique Studio',
          title_hi: 'कस्टम सिलाई, ऑल्टरेशन व लेडीज बुटीक',
          desc_en: 'Low overhead stitching and alterations studio eligible for PM Vishwakarma toolkit & loans.',
          desc_hi: 'कम लागत में सिलाई और लेडीज बुटीक सेंटर, जिसमें सीधा श्रम मुनाफा मिलता है।',
          estimatedMonthlyProfit: '₹16,000 – ₹28,000',
          breakEvenTimeline_en: '2 Months',
          breakEvenTimeline_hi: '2 महीने',
          matchPercentage: 96,
        };
      } else if (interestsStr.includes('repair') || skillsStr.includes('tech')) {
        idea = {
          title_en: 'Mobile Accessories & Quick Repair Center',
          title_hi: 'मोबाइल एक्सेसरीज़ व त्वरित मरम्मत केंद्र',
          desc_en: 'High demand smartphone accessories and small electronic device repair services.',
          desc_hi: 'मोबाइल एक्सेसरीज़ बिक्री और त्वरित रिपेयरिंग सेवा केंद्र।',
          estimatedMonthlyProfit: '₹20,000 – ₹35,000',
          breakEvenTimeline_en: '2 to 3 Months',
          breakEvenTimeline_hi: '2 से 3 महीने',
          matchPercentage: 92,
        };
      }

      let stock = 20000;
      let eq = 10000;
      if (cap === 'under_10k') { stock = 6000; eq = 3000; }
      else if (cap === '50k_2lakh') { stock = 40000; eq = 25000; }
      else if (cap === '2lakh_5lakh') { stock = 90000; eq = 60000; }

      return {
        isBeginner: true,
        recommendedIdea: idea,
        budget: {
          initialStockCost: stock,
          equipmentCost: eq,
          totalStartupBudget: stock + eq,
          capitalRange: cap,
        },
        starterSteps: [
          {
            step: 1,
            title_en: 'Zero-Cost MSME Registration (Udyam)',
            title_hi: 'निःशुल्क सरकारी उद्यम पंजीकरण',
            desc_en: 'Obtain your official 12-digit Udyam certificate online in 10 minutes.',
            desc_hi: 'आधार कार्ड द्वारा 10 मिनट में आधिकारिक 12-अंकों का उद्यम नंबर प्राप्त करें।',
            url: 'https://udyamregistration.gov.in/',
            badge: 'Mandatory • 100% Free',
          },
          {
            step: 2,
            title_en: 'Direct Wholesale Sourcing via AGMARKNET',
            title_hi: 'AGMARKNET थोक APMC मंडी से सस्ता कच्चा माल',
            desc_en: 'Check daily modal prices to buy directly from wholesale mandis at 15-30% discount.',
            desc_hi: 'दैनिक थोक मंडी भाव देखकर सीधे मुख्य मंडी से नकद में सामान खरीदें।',
            badge: '15-30% Savings',
          },
          {
            step: 3,
            title_en: 'Apply for Govt Subsidy or Mudra Shishu Loan',
            title_hi: 'सरकारी पूंजीगत सब्सिडी या मुद्रा ऋण हेतु आवेदन',
            desc_en: 'Apply for up to ₹50,000 Mudra loan or 25-35% PMEGP subsidy grant.',
            desc_hi: 'बिना किसी गारंटी के ₹50,000 तक के मुद्रा ऋण या 35% तक PMEGP सब्सिडी के लिए आवेदन करें।',
            url: 'https://www.mudra.org.in/',
            badge: 'Govt Backed',
          },
          {
            step: 4,
            title_en: 'Set Up Low-Cost Workspace / Stall',
            title_hi: 'कम लागत में कार्यक्षेत्र या स्टॉल की तैयारी',
            desc_en: 'Keep fixed overheads low during initial 60 days.',
            desc_hi: 'शुरुआती 60 दिनों में दुकान खर्च न्यूनतम रखें।',
            badge: 'Low Overhead',
          },
          {
            step: 5,
            title_en: 'Acquire First 25 Core Customers',
            title_hi: 'पहले 25 पक्के स्थानीय ग्राहक जोड़ें',
            desc_en: 'Launch introductory offers to build a loyal neighborhood customer base.',
            desc_hi: 'शुरुआती छूट देकर पड़ोसियों और परिचितों को जोड़ें।',
            badge: 'Growth Launch',
          },
        ],
        starterScheme: {
          code: 'mudra_shishu',
          name_en: 'Pradhan Mantri Mudra Yojana (Shishu)',
          name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
          portalUrl: 'https://www.mudra.org.in/',
          loanCeiling: 50000,
          match: 92,
        },
        schemes: getStandardMatchedSchemes(user, { ...biz, ...beginnerData }, 0, beginnerData.barriers || [], true),
      };
    }

    const rev =
      Number(sales.monthlyRevenue) ||
      (Number(sales.dailySales) ? Number(sales.dailySales) * 30 : 0);

    const expExEmi =
      (Number(expenses.rent) || 0) +
      (Number(expenses.electricity) || 0) +
      (Number(expenses.rawMaterials) || 0) +
      (Number(expenses.transport) || 0) +
      (Number(expenses.wages) || 0) +
      (Number(expenses.packaging) || 0) +
      (Number(expenses.other) || 0);

    const emi = Number(expenses.emi) || 0;
    const netProfit = rev - expExEmi;
    const cashFlow = netProfit - emi;
    const breakEvenGap = expExEmi + emi - rev;

    const workingCap = items.reduce(
      (a, b) => a + (Number(b.costPrice) || 0),
      0
    );

    const avgMargin =
      items.length > 0
        ? items.reduce(
            (a, b) =>
              a + ((Number(b.sellPrice) || 0) - (Number(b.costPrice) || 0)),
            0
          ) / items.length
        : 0;

    const roiMonths =
      avgMargin > 0
        ? Math.max(1, Math.round(workingCap / (avgMargin * 20)))
        : null;

    const debtRatio = rev > 0 ? (emi / rev) * 100 : 0;

    let riskLevel = 'low';
    if (debtRatio > 50 || netProfit < 0) riskLevel = 'high';
    else if (debtRatio > 25 || cashFlow < rev * 0.05) riskLevel = 'medium';

    let scheme = {
      code: 'mudra_shishu',
      name: 'Mudra Yojana (Shishu)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
      portalUrl: 'https://www.mudra.org.in/',
      loanCeiling: 50000,
      match: 74,
    };
    if (rev > 0 && rev < 15000) {
      scheme = {
        code: 'pm_svanidhi',
        name: 'PM-SVANidhi (Street Vendor Loan)',
        name_hi: 'पीएम स्वनिधि योजना',
        portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
        loanCeiling: 50000,
        match: 88,
      };
    } else if (problems.includes('workingcap') || problems.includes('loanrepay')) {
      scheme = {
        code: 'pmegp',
        name: "PMEGP (Prime Minister's Employment Generation)",
        name_hi: 'पीएमईजीपी योजना',
        portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
        loanCeiling: 5000000,
        match: 81,
      };
    } else if (rev >= 50000) {
      scheme = {
        code: 'mudra_tarun',
        name: 'Mudra Yojana (Tarun)',
        name_hi: 'प्रधानमंत्री मुद्रा योजना (तरुण)',
        portalUrl: 'https://www.mudra.org.in/',
        loanCeiling: 1000000,
        match: 79,
      };
    }

    return {
      isBeginner: false,
      rev,
      expExEmi,
      emi,
      netProfit,
      cashFlow,
      breakEvenGap,
      workingCap,
      avgMargin,
      roiMonths,
      debtRatio,
      riskLevel,
      scheme,
      schemes: getStandardMatchedSchemes(user, biz, rev, problems, false),
    };
  }, [portalType, user, biz, beginnerData, beginnerData, sales, expenses, items, problems]);

  const resetAll = () => {
    localStorage.clear();
    setUserId(null);
    setVoiceMode(false);
    setPortalType('existing');
    setUser({ name: '', age: '', gender: '', phone: '', portal_type: 'existing' });
    setBiz({ type: '', what: '', workers: '', hours: '', address: '', district: 'Varanasi', state: 'Uttar Pradesh' });
    setBeginnerData({
      interests: [],
      skills: '',
      capitalRange: '10k_50k',
      spaceType: 'home',
      timeCommitment: 'full_time',
      barriers: [],
      address: '',
      district: 'Varanasi',
      state: 'Uttar Pradesh',
    });
    setGrowthData({
      aspiration: 'scale',
      barriers: [],
      creditHistory: 'none',
    });
    setSales({ customersPerDay: '', dailySales: '', monthlyRevenue: '' });
    setExpenses({});
    setCustomers([]);
    setCompetition({ count: '', where: '' });
    setProblems([]);
    setItems([
      { desc: '', sellPrice: '', costPrice: '', seasonal: 'no' },
      { desc: '', sellPrice: '', costPrice: '', seasonal: 'no' },
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        userId,
        setUserId,
        voiceMode,
        setVoiceMode,
        toggleVoiceMode,
        portalType,
        setPortalType,
        user,
        setUser,
        biz,
        setBiz,
        beginnerData,
        setBeginnerData,
        growthData,
        setGrowthData,
        sales,
        setSales,
        expenses,
        setExpenses,
        customers,
        setCustomers,
        competition,
        setCompetition,
        problems,
        setProblems,
        items,
        setItems,
        t,
        opt,
        toggle,
        fallbackCalc,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
