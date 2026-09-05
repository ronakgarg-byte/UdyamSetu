import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { T } from '../i18n/translations';

const AppContext = createContext(null);

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
    };
  }, [portalType, beginnerData, sales, expenses, items, problems]);

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
