import React, { createContext, useContext, useState, useEffect } from 'react';
import { T } from '../i18n/translations';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [userId, setUserId] = useState(() => localStorage.getItem('udyam_user_id') || null);
  
  const [user, setUser] = useState({ name: '', age: '', gender: '', phone: '', district: 'Varanasi' });
  const [biz, setBiz] = useState({ type: '', what: '', workers: '', hours: '' });
  const [sales, setSales] = useState({ customersPerDay: '', dailySales: '', monthlyRevenue: '' });
  const [expenses, setExpenses] = useState({});
  const [customers, setCustomers] = useState([]);
  const [competition, setCompetition] = useState({ count: '', where: '' });
  const [problems, setProblems] = useState([]);
  const [items, setItems] = useState([
    { desc: '', sellPrice: '', costPrice: '', seasonal: 'no' },
  ]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Translation helper
  const t = (key) => T[key]?.[lang] ?? key;
  const opt = (o) => o?.[lang] ?? o?.en ?? '';

  const toggle = (arr, setArr, key) =>
    setArr(arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key]);

  // Load existing data if userId is found in storage
  useEffect(() => {
    if (userId) {
      localStorage.setItem('udyam_user_id', userId);
      api.getSummary(userId)
        .then((res) => {
          if (res?.success && res?.data) {
            const d = res.data;
            if (d.user) setUser(d.user);
            if (d.business) setBiz(d.business);
            if (d.sales) {
              setSales({
                customersPerDay: d.sales.customers_per_day || '',
                dailySales: d.sales.daily_sales || '',
                monthlyRevenue: d.sales.monthly_revenue || '',
              });
            }
            if (d.expenses) setExpenses(d.expenses);
            if (d.profile) {
              setCustomers(d.profile.customers || []);
              setCompetition(d.profile.competition || { count: '', where: '' });
              setProblems(d.profile.problems || []);
            }
            if (d.items && d.items.length > 0) setItems(d.items);
          }
        })
        .catch((err) => console.log('Summary sync error (safe to ignore):', err.message));
    }
  }, [userId]);

  const resetAll = () => {
    localStorage.removeItem('udyam_user_id');
    setUserId(null);
    setUser({ name: '', age: '', gender: '', phone: '', district: 'Varanasi' });
    setBiz({ type: '', what: '', workers: '', hours: '' });
    setSales({ customersPerDay: '', dailySales: '', monthlyRevenue: '' });
    setExpenses({});
    setCustomers([]);
    setCompetition({ count: '', where: '' });
    setProblems([]);
    setItems([{ desc: '', sellPrice: '', costPrice: '', seasonal: 'no' }]);
    setAnalysis(null);
    setError(null);
  };

  const value = {
    lang,
    setLang,
    userId,
    setUserId,
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
    analysis,
    setAnalysis,
    loading,
    setLoading,
    error,
    setError,
    t,
    opt,
    toggle,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
