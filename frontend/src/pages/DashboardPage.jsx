import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QACard } from '../components/Common';
import Layout from '../components/Layout';
import ChatWidget from '../components/ChatWidget';
import AgmarknetPricingWidget from '../components/AgmarknetPricingWidget';
import SchemeComparisonModal from '../components/SchemeComparisonModal';
import { fmt } from '../i18n/translations';
import { api } from '../services/api';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Building2,
  MapPin,
  X,
  Bot,
  Loader2,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Store,
  PieChart,
  Lightbulb,
  Rocket,
  Wallet,
  CheckSquare,
  Compass,
  ArrowRightLeft,
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, userId, portalType, fallbackCalc, resetAll, t, lang, biz, beginnerData } = useApp();
  const [apiAnalysis, setApiAnalysis] = useState(null);
  const [schemesList, setSchemesList] = useState([]);
  const [localContext, setLocalContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Scheme Comparison State
  const [selectedSchemes, setSelectedSchemes] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const isHindi = lang === 'hi';
  const isBeginner = portalType === 'beginner' || apiAnalysis?.isBeginner === true;

  useEffect(() => {
    async function loadData() {
      if (userId) {
        try {
          const district = biz?.district || user?.district || beginnerData?.district || 'Varanasi';
          const [analysisRes, schemesRes, contextRes] = await Promise.all([
            api.getAnalysis(userId).catch(() => null),
            api.getSchemes(userId).catch(() => null),
            api.getLocalContext(userId, district).catch(() => null),
          ]);

          if (analysisRes?.analysis) setApiAnalysis(analysisRes.analysis);
          if (schemesRes?.schemes) setSchemesList(schemesRes.schemes);
          if (contextRes?.localContext) setLocalContext(contextRes.localContext);
        } catch (err) {
          console.warn('Dashboard data fetch warning:', err.message);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [userId, biz?.district, user?.district, beginnerData?.district]);

  // Use API calculation or local fallback
  const calc = apiAnalysis || fallbackCalc;

  // Derive active recommended scheme with guaranteed portalUrl
  const recommendedScheme = calc.starterScheme || calc.scheme || {
    name_en: isBeginner ? 'Pradhan Mantri Mudra Yojana (Shishu)' : 'PM-SVANidhi (Street Vendor Loan)',
    name_hi: isBeginner ? 'प्रधानमंत्री मुद्रा योजना (शिशु)' : 'पीएम स्वनिधि योजना',
    name: isBeginner ? (isHindi ? 'प्रधानमंत्री मुद्रा योजना (शिशु)' : 'Pradhan Mantri Mudra Yojana (Shishu)') : (isHindi ? 'पीएम स्वनिधि योजना' : 'PM-SVANidhi Scheme'),
    code: isBeginner ? 'mudra_shishu' : 'pm_svanidhi',
    match: isBeginner ? 94 : 88,
    matchPercentage: isBeginner ? 94 : 88,
    portalUrl: isBeginner ? 'https://www.mudra.org.in/' : 'https://pmsvanidhi.mohua.gov.in/',
    loanCeiling: 50000,
    interestSubsidyPct: 0.0,
  };

  const schemeUrl = recommendedScheme.portalUrl || (
    recommendedScheme.code === 'pm_vishwakarma' ? 'https://pmvishwakarma.gov.in/' :
    recommendedScheme.code === 'pmegp' ? 'https://www.kviconline.gov.in/pmegpeportal/' :
    recommendedScheme.code === 'stand_up_india' ? 'https://www.standupmitra.in/' :
    recommendedScheme.code === 'udyam_reg' ? 'https://udyamregistration.gov.in/' :
    recommendedScheme.code?.startsWith('mudra') ? 'https://www.mudra.org.in/' :
    'https://pmsvanidhi.mohua.gov.in/'
  );

  const riskColor = {
    low: '#3f6b4f',
    medium: '#c98a1f',
    high: '#b75b3d',
  }[calc.riskLevel || 'low'];

  const riskLabel = {
    low: t('low'),
    medium: t('medium'),
    high: t('high'),
  }[calc.riskLevel || 'low'];

  const handleStartOver = () => {
    resetAll();
    navigate('/');
  };

  const handleBack = () => {
    if (isBeginner) {
      navigate('/questionnaire');
    } else {
      navigate('/items');
    }
  };

  // Scheme Comparison Handler
  const handleToggleSchemeSelection = (schemeCode) => {
    if (!schemeCode) return;
    if (selectedSchemes.includes(schemeCode)) {
      setSelectedSchemes(selectedSchemes.filter((c) => c !== schemeCode));
    } else {
      if (selectedSchemes.length >= 2) {
        setSelectedSchemes([selectedSchemes[1], schemeCode]);
      } else {
        setSelectedSchemes([...selectedSchemes, schemeCode]);
      }
    }
  };

  const handleOpenComparison = async () => {
    if (selectedSchemes.length < 2) return;
    setShowCompareModal(true);
    setLoadingComparison(true);
    try {
      const res = await api.compareSchemes(selectedSchemes[0], selectedSchemes[1], userId, portalType);
      if (res?.success) {
        setComparisonData(res);
      }
    } catch (err) {
      console.error('Failed to fetch scheme comparison:', err);
    } finally {
      setLoadingComparison(false);
    }
  };

  return (
    <Layout
      title={isBeginner ? t('dashBeginnerHi') : t('dashHi')}
      showBack={true}
      onBack={handleBack}
      progress={100}
    >
      <div className="pb-24 w-full">
        {/* Top Greeting & Location Context Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#e4d9c7]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1f3a5f] text-white">
                {isBeginner ? 'Portal A: Shuruaat' : 'Portal B: Vistaar'}
              </span>
              <p className="text-xs font-semibold text-[#a36a2d]">
                {user.name ? user.name + (isHindi ? ' जी' : '') : ''}
              </p>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1f3a5f]">
              {isBeginner ? t('dashBeginnerHi') : t('dashHi')}
            </h2>
          </div>
          {localContext && (
            <div className="flex items-center gap-2 text-xs text-[#8a7a68] bg-[#fffdf9] px-3.5 py-2 rounded-2xl border border-[#e4d9c7] shadow-sm">
              <MapPin className="w-4 h-4 text-[#a36a2d] shrink-0" />
              <span>
                <strong className="text-[#1f3a5f]">{localContext.district || 'Varanasi'}, {localContext.state || 'UP'}</strong> • {localContext.mandiEconomics?.reportingMandi || 'Main APMC Mandi'}
              </span>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: PORTAL A - BEGINNER ("SHURUAAT") STARTUP LAUNCHPAD DASHBOARD */}
        {/* ========================================================================= */}
        {isBeginner ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
            {/* Left Column (5 cols): Recommended Business Idea & Budget Card */}
            <div className="lg:col-span-5 space-y-5">
              {/* Recommended Idea Card */}
              <div className="bg-[#fffdf9] rounded-3xl border-2 border-[#e8a33d] p-6 shadow-md relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-[#a36a2d] uppercase tracking-wider">
                      {isHindi ? 'सुझाई गई व्यापार योजना' : 'Recommended Business Idea'}
                    </span>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#e3efe6] text-[#3f6b4f] border border-[#3f6b4f]/20">
                    {calc.recommendedIdea?.matchPercentage || 94}% Fit
                  </span>
                </div>

                <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#1f3a5f] mb-2 leading-tight">
                  {isHindi
                    ? (calc.recommendedIdea?.title_hi || 'क्षेत्रीय दैनिक सामान व मिनी किराना दुकान')
                    : (calc.recommendedIdea?.title_en || 'Regional Daily Essentials & Kirana Store')}
                </h3>

                <p className="text-xs sm:text-sm text-[#5b4636] leading-relaxed mb-4">
                  {isHindi
                    ? (calc.recommendedIdea?.desc_hi || 'स्थानीय नियमित मांग और कम जोखिम वाला व्यवसाय।')
                    : (calc.recommendedIdea?.desc_en || 'Consistent local demand with low risk and steady daily cash returns.')}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#e4d9c7]">
                  <div className="bg-[#faf6ee] p-3 rounded-2xl border border-[#e4d9c7]">
                    <span className="text-[11px] font-semibold text-[#8a7a68] block mb-0.5">
                      {t('projectedEarnings')}
                    </span>
                    <span className="font-heading text-sm sm:text-base font-bold text-[#3f6b4f]">
                      {calc.recommendedIdea?.estimatedMonthlyProfit || '₹18,000 – ₹28,000'}
                    </span>
                  </div>
                  <div className="bg-[#faf6ee] p-3 rounded-2xl border border-[#e4d9c7]">
                    <span className="text-[11px] font-semibold text-[#8a7a68] block mb-0.5">
                      {t('breakEvenEstimate')}
                    </span>
                    <span className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                      {isHindi
                        ? (calc.recommendedIdea?.breakEvenTimeline_hi || '2 से 3 महीने')
                        : (calc.recommendedIdea?.breakEvenTimeline_en || '2 to 3 Months')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Startup Budget Breakdown Card */}
              <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#e4d9c7]">
                  <div className="w-8 h-8 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading text-base font-bold text-[#1f3a5f]">
                    {t('budgetTitle')}
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf6ee] border border-[#e4d9c7]/70">
                    <span className="font-medium text-[#5b4636]">{t('stockCapital')}</span>
                    <span className="font-bold font-heading text-sm text-[#1f3a5f]">
                      {fmt(calc.budget?.initialStockCost || 15000)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf6ee] border border-[#e4d9c7]/70">
                    <span className="font-medium text-[#5b4636]">{t('equipmentCapital')}</span>
                    <span className="font-bold font-heading text-sm text-[#1f3a5f]">
                      {fmt(calc.budget?.equipmentCost || 10000)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#e3efe6] border border-[#3f6b4f]/30">
                    <span className="font-bold text-[#3f6b4f]">{t('totalBudget')}</span>
                    <span className="font-extrabold font-heading text-base text-[#3f6b4f]">
                      {fmt(calc.budget?.totalStartupBudget || 25000)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Start Over Button */}
              <div>
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-semibold transition hover:bg-[#faf6ee] shadow-sm"
                  style={{
                    borderColor: '#e4d9c7',
                    color: '#5b4636',
                    background: '#fffdf9',
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('startOver')}</span>
                </button>
              </div>
            </div>

            {/* Right Column (7 cols): 5-Step Action Roadmap, Recommended Scheme, Schemes Directory & AI Mentor */}
            <div className="lg:col-span-7 space-y-5">
              {/* Recommended Starter Scheme Highlight */}
              <div
                className="p-5 sm:p-6 rounded-3xl shadow-lg border text-[#fffdf9] relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1f3a5f 0%, #152742 100%)', borderColor: '#1f3a5f' }}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-[#e8a33d]">
                    <Sparkles className="w-4 h-4" />
                    <span>{t('recommendedScheme')}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-bold text-[#e8a33d] border border-white/10">
                    {recommendedScheme.matchPercentage || recommendedScheme.match || 92}% Match
                  </span>
                </div>

                <h3 className="font-heading text-lg sm:text-2xl font-bold text-white leading-tight">
                  {isHindi
                    ? (recommendedScheme.name_hi || recommendedScheme.name)
                    : (recommendedScheme.name_en || recommendedScheme.name)}
                </h3>

                <p className="text-xs sm:text-sm mt-2 text-[#efe6d6] leading-relaxed">
                  {isHindi
                    ? (recommendedScheme.keyBenefit_hi || recommendedScheme.description_hi || 'शुरुआती उद्यमियों के लिए बिना किसी संपत्ति गारंटी के आसान सरकारी ऋण व सब्सिडी।')
                    : (recommendedScheme.keyBenefit_en || recommendedScheme.description_en || 'Collateral-free government startup micro-credit with minimum paperwork.')}
                </p>

                <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={schemeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm bg-[#e8a33d] text-[#1f3a5f] hover:bg-[#f3b759] active:scale-95 transition shadow-md"
                    >
                      <span>{t('applyOnPortal')}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleToggleSchemeSelection(recommendedScheme.code)}
                      className={'px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ' + (
                        selectedSchemes.includes(recommendedScheme.code)
                          ? 'bg-white text-[#1f3a5f] border-white'
                          : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                      )}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{selectedSchemes.includes(recommendedScheme.code) ? (isHindi ? 'चयनित ✓' : 'Selected ✓') : (isHindi ? '+ तुलना करें' : '+ Compare')}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSchemesModal(true)}
                    className="text-xs font-semibold text-[#efe6d6] hover:text-white underline flex items-center gap-1 justify-center sm:justify-start"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#e8a33d]" />
                    <span>{t('viewSchemes')} ({schemesList.length || 7})</span>
                  </button>
                </div>
              </div>

              {/* 5-Step Starter Action Roadmap */}
              <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-[#e4d9c7]">
                  <div className="w-8 h-8 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#1f3a5f]">
                      {t('actionPlanTitle')}
                    </h3>
                    <p className="text-[11px] text-[#8a7a68]">
                      {isHindi ? 'व्यवसाय शुरू करने के लिए 5 आसान कदम' : 'Clear roadmap to launch your micro-venture safely'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {(calc.starterSteps || []).map((stepItem, sIdx) => {
                    return (
                      <div
                        key={sIdx}
                        className="p-4 rounded-2xl border border-[#e4d9c7] bg-[#faf6ee] hover:bg-[#fffdf9] hover:border-[#1f3a5f]/40 transition shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-xl bg-[#1f3a5f] text-white flex items-center justify-center font-heading font-bold text-xs shrink-0 mt-0.5 shadow-sm">
                            {stepItem.step || sIdx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-heading text-xs sm:text-sm font-bold text-[#1f3a5f]">
                                {isHindi ? (stepItem.title_hi || stepItem.title_en) : stepItem.title_en}
                              </h4>
                              {stepItem.badge && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e3efe6] text-[#3f6b4f] border border-[#3f6b4f]/20 shrink-0">
                                  {stepItem.badge}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#5b4636] mt-1 leading-relaxed">
                              {isHindi ? (stepItem.desc_hi || stepItem.desc_en) : stepItem.desc_en}
                            </p>

                            {stepItem.url && (
                              <div className="mt-2.5">
                                <a
                                  href={stepItem.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#a36a2d] hover:underline"
                                >
                                  <span>{stepItem.linkText || 'Open Official Portal ↗'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ask AI Startup Mentor Card */}
              <div
                onClick={() => setIsChatOpen(true)}
                className="p-4 rounded-2xl border cursor-pointer bg-[#faf4e8] border-[#e8a33d]/60 hover:border-[#1f3a5f] shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-md shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xs sm:text-sm text-[#1f3a5f] flex items-center gap-1.5">
                      <span>{isHindi ? 'एआई स्टार्ट-अप सलाहकार से बात करें' : 'Talk to AI Startup Mentor'}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#e8a33d] text-[#1f3a5f] rounded font-bold">
                        Gemini Thinking
                      </span>
                    </div>
                    <p className="text-xs text-[#5b4636] mt-0.5">
                      {isHindi
                        ? 'बिज़नेस आइडिया, दुकान का सेटअप या सरकारी ग्रांट पर चर्चा करें'
                        : 'Get advice on finding customers, setting up space, or applying for grants'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#a36a2d] px-3 py-1.5 rounded-xl bg-[#efe6d6] shrink-0">
                  Chat →
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: PORTAL B - EXISTING BUSINESS ("VISTAAR") FINANCIAL HEALTH DASHBOARD */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
            {/* Left Column (5 cols): Financial Health & Q&A Metric Cards */}
            <div className="lg:col-span-5 space-y-4">
              {/* Financial Health / Risk Score Card */}
              <div
                className="p-5 rounded-2xl border flex items-center justify-between shadow-sm"
                style={{ background: '#fffdf9', borderColor: '#e4d9c7' }}
              >
                <div>
                  <div className="text-xs font-semibold text-[#8a7a68]">
                    {t('riskScore')}
                  </div>
                  <div className="font-heading text-lg font-bold flex items-center gap-1.5 mt-0.5" style={{ color: riskColor }}>
                    {calc.riskLevel === 'high' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5" />
                    )}
                    <span>{riskLabel}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#8a7a68]">
                    {t('qDebtBurden')}
                  </div>
                  <div className="font-heading text-lg font-bold text-[#1f3a5f]">
                    {Math.round(calc.debtRatio || 0)}%
                  </div>
                </div>
              </div>

              {/* Financial Q&A Structuring Cards */}
              <div className="space-y-3">
                {/* Revenue */}
                <QACard
                  q={t('qRevenue')}
                  a={fmt(calc.revenue || calc.rev)}
                  note={
                    isHindi
                      ? 'कुल मासिक अनुमानित बिक्री'
                      : 'Total estimated monthly sales'
                  }
                />

                {/* Net Profit */}
                <QACard
                  q={t('qNetProfit')}
                  a={fmt(calc.netProfit)}
                  highlight={calc.netProfit > 0}
                  note={
                    calc.netProfit >= 0
                      ? (isHindi ? 'मासिक खर्चों के बाद बचा हुआ शुद्ध लाभ' : 'Profit retained after business operating expenses')
                      : (isHindi ? 'सावधानी: खर्च बिक्री से अधिक है' : 'Warning: Operating expenses exceed revenue')
                  }
                />

                {/* Cash Flow */}
                <QACard
                  q={t('qCashFlow')}
                  a={fmt(calc.cashFlow)}
                  note={
                    isHindi
                      ? 'ईएमआई (लोन किश्त) चुकाने के बाद हाथ में नकदी'
                      : 'Actual in-hand cash after loan EMI payment'
                  }
                />

                {/* Break-Even Gap */}
                <QACard
                  q={t('qBreakEven')}
                  a={
                    calc.breakEvenGap > 0
                      ? fmt(calc.breakEvenGap) + (isHindi ? ' कम पड़ रहे हैं' : ' shortfall')
                      : (isHindi ? 'लागत पूरी हो रही है ✓' : 'Costs covered ✓')
                  }
                  note={
                    calc.breakEvenGap > 0
                      ? (isHindi ? 'खर्च और ईएमआई पूरे करने के लिए इतनी अतिरिक्त बिक्री आवश्यक है' : 'Additional sales needed to reach zero loss')
                      : (isHindi ? 'आपका व्यवसाय लागत से अधिक कमा रहा है' : 'Business is safely operating above break-even point')
                  }
                />

                {/* Working Capital */}
                <QACard
                  q={t('qWorkingCap')}
                  a={fmt(calc.workingCapital ?? calc.workingCap)}
                  note={
                    isHindi
                      ? 'इन्वेंट्री और स्टॉक में फंसा हुआ कुल पैसा'
                      : 'Total capital locked in inventory items'
                  }
                />

                {/* ROI Months */}
                <QACard
                  q={t('qROI')}
                  a={
                    calc.roiMonths
                      ? calc.roiMonths + (isHindi ? ' महीने' : ' months')
                      : (isHindi ? 'विवरण उपलब्ध नहीं' : 'N/A')
                  }
                  note={
                    calc.roiMonths
                      ? (isHindi ? 'मौजूदा मार्जिन से कार्यशील पूंजी वापस पाने का अनुमानित समय' : 'Estimated recovery time based on unit margins')
                      : (isHindi ? 'वस्तुओं का बिक्री व लागत मूल्य जोड़ें' : 'Add item cost & sell prices to calculate')
                  }
                />
              </div>

              {/* Start Over Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs font-semibold transition hover:bg-[#faf6ee] shadow-sm"
                  style={{
                    borderColor: '#e4d9c7',
                    color: '#5b4636',
                    background: '#fffdf9',
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('startOver')}</span>
                </button>
              </div>
            </div>

            {/* Right Column (7 cols): Recommended Scheme, AI Advisor & Matched Schemes Directory */}
            <div className="lg:col-span-7 space-y-5">
              {/* 1. Recommended Scheme Highlight Banner */}
              <div
                className="p-5 sm:p-6 rounded-3xl shadow-lg border text-[#fffdf9] relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #1f3a5f 0%, #152742 100%)', borderColor: '#1f3a5f' }}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5" style={{ color: '#e8a33d' }}>
                    <Sparkles className="w-4 h-4" />
                    {t('recommendedScheme')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-bold text-[#e8a33d] border border-white/10">
                    {recommendedScheme.match || recommendedScheme.matchPercentage || 88}% {t('eligibilityMatch')}
                  </span>
                </div>

                <h3 className="font-heading text-lg sm:text-2xl font-bold text-white leading-tight">
                  {isHindi ? (recommendedScheme.name_hi || recommendedScheme.name) : (recommendedScheme.name_en || recommendedScheme.name)}
                </h3>

                <p className="text-xs sm:text-sm mt-2 text-[#efe6d6] leading-relaxed">
                  {recommendedScheme.code === 'pm_vishwakarma'
                    ? (isHindi ? '₹3 लाख तक का 5% रियायती ऋण + ₹15,000 का मुफ्त आधुनिक टूलकिट वाउचर व ₹500/दिन वजीफा।' : 'Collateral-free credit up to ₹3 Lakhs at 5% interest + ₹15,000 modern toolkit e-voucher & skill stipend.')
                    : recommendedScheme.code === 'pmegp'
                    ? (isHindi ? 'परियोजना लागत पर 25% से 35% भारी सरकारी सब्सिडी (माफ होने वाली पूंजी)।' : 'Up to 35% capital subsidy grant on project cost with bank credit up to ₹50 Lakhs.')
                    : recommendedScheme.code === 'stand_up_india'
                    ? (isHindi ? 'महिला व एससी/एसटी उद्यमियों के लिए ₹10 लाख से ₹1 करोड़ तक का व्यापार विस्तार ऋण।' : 'Greenfield enterprise loan from ₹10 Lakhs to ₹1 Crore for women & SC/ST entrepreneurs.')
                    : recommendedScheme.code === 'pm_svanidhi'
                    ? (isHindi ? '₹50,000 तक का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण, 7% ब्याज सब्सिडी व डिजिटल कैशबैक के साथ।' : 'Collateral-free working capital loan up to ₹50,000 with 7% interest subvention and cashback.')
                    : (isHindi ? 'बिना किसी संपत्ति गारंटी के रियायती दर पर आसान सरकारी व्यापार ऋण।' : 'Collateral-free micro-credit financing for inventory and business scale.')}
                </p>

                <div className="mt-5 pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <a
                      href={schemeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-heading font-bold text-xs sm:text-sm bg-[#e8a33d] text-[#1f3a5f] hover:bg-[#f3b759] active:scale-95 transition shadow-md"
                    >
                      <span>{t('applyOnPortal')}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleToggleSchemeSelection(recommendedScheme.code)}
                      className={'px-3.5 py-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ' + (
                        selectedSchemes.includes(recommendedScheme.code)
                          ? 'bg-white text-[#1f3a5f] border-white'
                          : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                      )}
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      <span>{selectedSchemes.includes(recommendedScheme.code) ? (isHindi ? 'चयनित ✓' : 'Selected ✓') : (isHindi ? '+ तुलना करें' : '+ Compare')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowSchemesModal(true)}
                      className="text-xs font-semibold text-[#efe6d6] hover:text-white underline flex items-center gap-1"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#e8a33d]" />
                      {t('viewSchemes')} ({schemesList.length || 7})
                    </button>
                    <span className="text-[10.5px] opacity-75 hidden sm:inline">SIH26091 Verified</span>
                  </div>
                </div>
              </div>

              {/* 2. Ask AI Advisor Quick Action Banner */}
              <div
                onClick={() => setIsChatOpen(true)}
                className="p-4 rounded-2xl border cursor-pointer bg-[#faf4e8] border-[#e8a33d]/60 hover:border-[#1f3a5f] shadow-sm transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-md shrink-0">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xs sm:text-sm text-[#1f3a5f] flex items-center gap-1.5">
                      <span>{t('talkAdvisor')}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#e8a33d] text-[#1f3a5f] rounded font-bold">
                        Gemini Thinking
                      </span>
                    </div>
                    <p className="text-xs text-[#5b4636] mt-0.5">
                      {isHindi
                        ? 'मुनाफा बढ़ाने, खर्च घटाने या योजनाओं पर चर्चा हेतु बात करें'
                        : 'Ask how to cut wholesale costs or apply for schemes'}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#a36a2d] px-3 py-1.5 rounded-xl bg-[#efe6d6] shrink-0">
                  Chat →
                </span>
              </div>

              {/* 3. Matched Government Schemes Direct Directory */}
              <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-[#e4d9c7] pb-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                        {isHindi ? 'राष्ट्रीय सरकारी ऋण व सब्सिडी योजनाएं' : 'National Government Schemes Directory'}
                      </h3>
                      <p className="text-[11px] text-[#8a7a68]">
                        {isHindi ? 'सीधे आधिकारिक पोर्टल पर जाएं या 2 योजनाओं की तुलना करें' : 'Direct ministry portals • Compare any 2 schemes'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowSchemesModal(true)}
                    className="text-xs font-semibold text-[#1f3a5f] bg-[#f3ede0] hover:bg-[#e4d9c7] px-3 py-1.5 rounded-xl transition border border-[#e4d9c7]"
                  >
                    {isHindi ? 'सभी देखें' : 'View All'} ({schemesList.length || 7})
                  </button>
                </div>

                <div className="space-y-3">
                  {(schemesList.length > 0 ? schemesList.slice(0, 4) : [recommendedScheme]).map((s, idx) => {
                    const directUrl = s.portalUrl || (
                      s.code === 'pm_vishwakarma' ? 'https://pmvishwakarma.gov.in/' :
                      s.code === 'pmegp' ? 'https://www.kviconline.gov.in/pmegpeportal/' :
                      s.code === 'stand_up_india' ? 'https://www.standupmitra.in/' :
                      s.code === 'udyam_reg' ? 'https://udyamregistration.gov.in/' :
                      s.code?.startsWith('mudra') ? 'https://www.mudra.org.in/' :
                      'https://pmsvanidhi.mohua.gov.in/'
                    );

                    const isSelected = selectedSchemes.includes(s.code);

                    return (
                      <div
                        key={s.code || idx}
                        className={'p-3.5 sm:p-4 rounded-2xl border transition shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 ' + (
                          isSelected
                            ? 'bg-[#faf4e8] border-[#e8a33d]'
                            : 'bg-[#faf6ee] border-[#e4d9c7] hover:bg-[#fffdf9] hover:border-[#1f3a5f]/40'
                        )}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading text-xs sm:text-sm font-bold text-[#1f3a5f]">
                              {isHindi ? s.name_hi || s.name : s.name_en || s.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1f3a5f] text-white shrink-0">
                              {s.matchPercentage || s.match || 80}% Match
                            </span>
                          </div>

                          <p className="text-[11px] text-[#a36a2d] font-medium mt-0.5">
                            {isHindi ? s.ministry_hi || s.ministry : s.ministry_en || s.ministry}
                          </p>

                          <p className="text-xs text-[#5b4636] mt-1 line-clamp-2 leading-relaxed">
                            {isHindi ? s.description_hi || s.description : s.description_en || s.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#e4d9c7]">
                          <span className="text-[11px] font-bold text-[#1f3a5f]">
                            Max: ₹{(s.loanCeiling || 50000).toLocaleString('en-IN')}
                          </span>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSchemeSelection(s.code)}
                              className={'px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition border shadow-xs ' + (
                                isSelected
                                  ? 'bg-[#1f3a5f] text-[#e8a33d] border-[#1f3a5f]'
                                  : 'bg-white text-[#5b4636] border-[#e4d9c7] hover:border-[#1f3a5f]'
                              )}
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>{isSelected ? (isHindi ? 'चयनित ✓' : 'Selected ✓') : (isHindi ? 'तुलना' : 'Compare')}</span>
                            </button>

                            <a
                              href={directUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1f3a5f] text-white hover:bg-[#152742] transition shadow-sm"
                            >
                              <span>{t('applyOnPortal')}</span>
                              <ExternalLink className="w-3 h-3 text-[#e8a33d]" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Full-Width AGMARKNET Live Mandi Raw Material Prices Widget (Common to both portals) */}
        <AgmarknetPricingWidget localContext={localContext} />
      </div>

      {/* Floating Scheme Comparison Action Banner */}
      {selectedSchemes.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-2xl bg-[#1f3a5f] text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-[#e8a33d] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-2xl bg-[#e8a33d] text-[#1f3a5f] flex items-center justify-center font-heading font-extrabold text-xs shrink-0 shadow-md">
              {selectedSchemes.length}/2
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>{selectedSchemes.length === 2 ? t('twoSchemesSelected') : t('selectOneMore')}</span>
              </div>
              <p className="text-[11px] text-[#efe6d6] truncate">
                {selectedSchemes.map((code) => {
                  const sc = schemesList.find((s) => s.code === code) || { name_en: code };
                  return isHindi ? (sc.name_hi || sc.name_en || code) : (sc.name_en || code);
                }).join(' vs ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSelectedSchemes([])}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#efe6d6] hover:text-white underline transition"
            >
              {t('clearSelection')}
            </button>
            <button
              type="button"
              disabled={selectedSchemes.length < 2}
              onClick={handleOpenComparison}
              className={'px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center gap-1.5 transition shadow-lg ' + (
                selectedSchemes.length === 2
                  ? 'bg-[#e8a33d] text-[#1f3a5f] hover:bg-[#f3b759] active:scale-95 animate-pulse'
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
              )}
            >
              <span>{t('compareTwoSelected')}</span>
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Side-by-Side Scheme Comparison Modal */}
      <SchemeComparisonModal
        isOpen={showCompareModal}
        onClose={() => setShowCompareModal(false)}
        data={comparisonData}
        loading={loadingComparison}
        lang={lang}
        t={t}
      />

      {/* Floating AI Chatbot Widget */}
      <ChatWidget
        isOpenExternal={isChatOpen}
        onCloseExternal={() => setIsChatOpen(false)}
      />

      {/* Full Matching Schemes Modal */}
      {showSchemesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-2xl bg-[#f3ede0] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#e4d9c7] animate-in slide-in-from-bottom duration-200">
            <div className="px-6 py-4 border-b border-[#e4d9c7] flex items-center justify-between bg-[#fffdf9]">
              <div>
                <h3 className="font-heading text-base sm:text-lg font-bold text-[#1f3a5f]">
                  {t('viewSchemes')}
                </h3>
                <p className="text-xs text-[#8a7a68]">
                  {isHindi ? 'आधिकारिक पोर्टल लिंक व आमने-सामने तुलना' : 'Govt of India Official Portals & Scheme Comparison'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemesModal(false)}
                className="p-2 rounded-full hover:bg-[#e4d9c7] text-[#5b4636] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {(schemesList.length > 0 ? schemesList : [recommendedScheme]).map((s, idx) => {
                const directUrl = s.portalUrl || (
                  s.code === 'pm_vishwakarma' ? 'https://pmvishwakarma.gov.in/' :
                  s.code === 'pmegp' ? 'https://www.kviconline.gov.in/pmegpeportal/' :
                  s.code === 'stand_up_india' ? 'https://www.standupmitra.in/' :
                  s.code === 'udyam_reg' ? 'https://udyamregistration.gov.in/' :
                  s.code?.startsWith('mudra') ? 'https://www.mudra.org.in/' :
                  'https://pmsvanidhi.mohua.gov.in/'
                );

                const isSelected = selectedSchemes.includes(s.code);

                return (
                  <div
                    key={s.code || idx}
                    className={'p-5 rounded-2xl border transition shadow-sm ' + (
                      isSelected
                        ? 'bg-[#faf4e8] border-[#e8a33d]'
                        : 'bg-[#fffdf9] border-[#e4d9c7] hover:border-[#1f3a5f]/40'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                        {isHindi ? s.name_hi || s.name : s.name_en || s.name}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#1f3a5f] text-white shrink-0">
                        {s.matchPercentage || s.match || 75}% Match
                      </span>
                    </div>

                    <p className="text-xs text-[#a36a2d] font-medium mt-0.5">
                      {isHindi ? s.ministry_hi || s.ministry : s.ministry_en || s.ministry}
                    </p>

                    <p className="text-xs sm:text-sm text-[#5b4636] mt-2 leading-relaxed">
                      {isHindi ? s.description_hi || s.description : s.description_en || s.description}
                    </p>

                    {Array.isArray(s.keyBenefits_en) && s.keyBenefits_en.length > 0 && (
                      <div className="mt-3 space-y-1 bg-[#faf6ee] p-3 rounded-xl border border-[#e4d9c7]/60">
                        {(isHindi && Array.isArray(s.keyBenefits_hi) && s.keyBenefits_hi.length > 0
                          ? s.keyBenefits_hi
                          : s.keyBenefits_en
                        ).map((ben, bIdx) => (
                          <div key={bIdx} className="text-xs text-[#5b4636] flex items-center gap-1.5">
                            <span className="text-[#a36a2d] font-bold">•</span>
                            <span>{ben}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-[#efe6d6] flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold text-[#1f3a5f]">
                        Max: ₹{(s.loanCeiling || 50000).toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleSchemeSelection(s.code)}
                          className={'px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition border shadow-xs ' + (
                            isSelected
                              ? 'bg-[#1f3a5f] text-[#e8a33d] border-[#1f3a5f]'
                              : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:border-[#1f3a5f]'
                          )}
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          <span>{isSelected ? (isHindi ? 'चयनित ✓' : 'Selected ✓') : (isHindi ? 'तुलना में जोड़ें' : 'Compare')}</span>
                        </button>

                        <a
                          href={directUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#1f3a5f] text-white hover:bg-[#152742] transition shadow-sm"
                        >
                          <span>{t('applyOnPortal')}</span>
                          <ExternalLink className="w-4 h-4 text-[#e8a33d]" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
