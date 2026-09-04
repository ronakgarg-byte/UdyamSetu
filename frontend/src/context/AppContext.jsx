import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { T } from '../i18n/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('udyam_lang') || 'en');
  const [userId, setUserId] = useState(() => localStorage.getItem('udyam_user_id') || null);
  const [voiceMode, setVoiceMode] = useState(() => localStorage.getItem('udyam_voice_mode') === 'true');

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('udyam_user');
    return saved ? JSON.parse(saved) : { name: '', age: '', gender: '', phone: '' };
  });

  const [biz, setBiz] = useState(() => {
    const saved = localStorage.getItem('udyam_biz');
    return saved ? JSON.parse(saved) : { type: '', what: '', workers: '', hours: '' };
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

    let scheme = { name: 'Mudra Yojana (Shishu)', match: 74 };
    if (rev > 0 && rev < 15000) scheme = { name: 'PM-SVANidhi', match: 88 };
    else if (problems.includes('workingcap') || problems.includes('loanrepay'))
      scheme = { name: 'PMEGP (Prime Minister Employment Generation)', match: 81 };
    else if (rev >= 50000) scheme = { name: 'Mudra Yojana (Tarun)', match: 79 };

    return {
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
  }, [sales, expenses, items, problems]);

  const resetAll = () => {
    localStorage.clear();
    setUserId(null);
    setVoiceMode(false);
    setUser({ name: '', age: '', gender: '', phone: '' });
    setBiz({ type: '', what: '', workers: '', hours: '' });
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
        user,
        setUser,
        biz,
        setBiz,
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
