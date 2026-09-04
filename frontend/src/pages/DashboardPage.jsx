import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QACard } from '../components/Common';
import Layout from '../components/Layout';
import ChatWidget from '../components/ChatWidget';
import AgmarknetPricingWidget from '../components/AgmarknetPricingWidget';
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
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, userId, fallbackCalc, resetAll, t, lang, biz } = useApp();
  const [apiAnalysis, setApiAnalysis] = useState(null);
  const [schemesList, setSchemesList] = useState([]);
  const [localContext, setLocalContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isHindi = lang === 'hi';

  useEffect(() => {
    async function loadData() {
      if (userId) {
        try {
          const [analysisRes, schemesRes, contextRes] = await Promise.all([
            api.getAnalysis(userId).catch(() => null),
            api.getSchemes(userId).catch(() => null),
            api.getLocalContext(userId, biz?.district || user?.district).catch(() => null),
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
  }, [userId, biz?.district, user?.district]);

  // Use API calculation or local fallback
  const calc = apiAnalysis || fallbackCalc;

  // Derive active recommended scheme with guaranteed portalUrl
  const recommendedScheme = calc.scheme || {
    name: isHindi ? 'पीएम स्वनिधि योजना' : 'PM-SVANidhi Scheme',
    code: 'pm_svanidhi',
    match: 88,
    portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
    loanCeiling: 50000,
    interestSubsidyPct: 7.0,
  };

  const schemeUrl = recommendedScheme.portalUrl || (
    recommendedScheme.code === 'pm_vishwakarma' ? 'https://pmvishwakarma.gov.in/' :
    recommendedScheme.code === 'pmegp' ? 'https://www.kviconline.gov.in/pmegpeportal/' :
    recommendedScheme.code === 'stand_up_india' ? 'https://www.standupmitra.in/' :
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

  const handleOpenSchemePortal = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Layout
      title={t('dashHi')}
      showBack={true}
      onBack={() => navigate('/items')}
      progress={100}
    >
      <div className="pb-16">
        {/* Welcome Greeting */}
        <div className="mb-6">
          <p className="text-xs font-semibold" style={{ color: '#a36a2d' }}>
            {user.name ? user.name + (isHindi ? ' जी,' : ',') : ''}
          </p>
          <h2 className="font-heading text-2xl font-bold" style={{ color: '#1f3a5f' }}>
            {t('dashHi')}
          </h2>
          {localContext && (
            <div className="flex items-center gap-1.5 text-xs text-[#8a7a68] mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#a36a2d]" />
              <span>
                {localContext.district || 'Varanasi'}, {localContext.state || 'Uttar Pradesh'} • {localContext.mandiEconomics?.reportingMandi || 'Main APMC Mandi'}
              </span>
            </div>
          )}
        </div>

        {/* 1. Recommended Scheme Highlight Banner with Direct Application Link */}
        <div
          className="p-4 sm:p-5 rounded-3xl mb-5 shadow-lg border text-[#fffdf9] relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1f3a5f 0%, #152742 100%)', borderColor: '#1f3a5f' }}
        >
          {/* Top Row: Eligibility Badge & Ministry */}
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5" style={{ color: '#e8a33d' }}>
              <Sparkles className="w-4 h-4" />
              {t('recommendedScheme')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 text-xs font-bold text-[#e8a33d] border border-white/10">
              {recommendedScheme.match || recommendedScheme.matchPercentage || 88}% {t('eligibilityMatch')}
            </span>
          </div>

          {/* Scheme Title */}
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white leading-tight">
            {isHindi ? (recommendedScheme.name_hi || recommendedScheme.name) : (recommendedScheme.name_en || recommendedScheme.name)}
          </h3>

          <p className="text-xs mt-1.5 text-[#efe6d6] leading-relaxed max-w-xl">
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

          {/* Action Row: Direct Apply Button */}
          <div className="mt-4 pt-3.5 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <a
              href={schemeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs bg-[#e8a33d] text-[#1f3a5f] hover:bg-[#f3b759] active:scale-95 transition shadow-md"
            >
              <span>{t('applyOnPortal')}</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

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
          className="p-3.5 rounded-2xl border mb-5 cursor-pointer bg-[#faf4e8] border-[#e8a33d]/60 hover:border-[#1f3a5f] shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="font-heading font-bold text-xs text-[#1f3a5f] flex items-center gap-1.5">
                <span>{t('talkAdvisor')}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#e8a33d] text-[#1f3a5f] rounded font-bold">
                  Gemini Thinking
                </span>
              </div>
              <p className="text-[11px] text-[#5b4636]">
                {isHindi
                  ? 'मुनाफा बढ़ाने, खर्च घटाने या योजनाओं पर चर्चा हेतु बात करें'
                  : 'Ask how to cut wholesale costs or apply for schemes'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#a36a2d] px-2.5 py-1 rounded-lg bg-[#efe6d6]">
            Chat →
          </span>
        </div>

        {/* 3. Financial Health / Risk Score */}
        <div
          className="p-4 rounded-xl border mb-5 flex items-center justify-between"
          style={{ background: '#fffdf9', borderColor: '#e4d9c7' }}
        >
          <div>
            <div className="text-xs font-semibold" style={{ color: '#8a7a68' }}>
              {t('riskScore')}
            </div>
            <div className="font-heading text-base font-bold flex items-center gap-1.5 mt-0.5" style={{ color: riskColor }}>
              {calc.riskLevel === 'high' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{riskLabel}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold" style={{ color: '#8a7a68' }}>
              {t('qDebtBurden')}
            </div>
            <div className="font-heading text-base font-bold" style={{ color: '#1f3a5f' }}>
              {Math.round(calc.debtRatio || 0)}%
            </div>
          </div>
        </div>

        {/* 4. Key Financial Structuring Cards */}
        <div className="space-y-3 mb-6">
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

        {/* 5. AGMARKNET Live Mandi Raw Material Prices Widget */}
        <AgmarknetPricingWidget localContext={localContext} />

        {/* 6. Matched Government Schemes Direct Directory */}
        <div className="bg-[#fffdf9] rounded-2xl border border-[#e4d9c7] p-4 sm:p-5 shadow-sm mb-6">
          <div className="flex items-center justify-between border-b border-[#e4d9c7] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                  {isHindi ? 'राष्ट्रीय सरकारी ऋण व सब्सिडी योजनाएं' : 'National Government Schemes & Direct Access'}
                </h3>
                <p className="text-[11px] text-[#8a7a68]">
                  {isHindi ? 'सीधे आधिकारिक पोर्टल पर जाकर आवेदन करें' : 'Click on any scheme to access official portal'}
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
                s.code?.startsWith('mudra') ? 'https://www.mudra.org.in/' :
                'https://pmsvanidhi.mohua.gov.in/'
              );

              return (
                <div
                  key={s.code || idx}
                  className="p-3.5 rounded-xl border border-[#e4d9c7] bg-[#faf6ee] hover:bg-[#fffdf9] hover:border-[#1f3a5f]/40 transition shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
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
                    <a
                      href={directUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#1f3a5f] text-white hover:bg-[#152742] transition shadow-sm"
                    >
                      <span>{t('applyOnPortal')}</span>
                      <ExternalLink className="w-3 h-3 text-[#e8a33d]" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Start Over Button */}
        <div className="pt-4 border-t border-[#e4d9c7]">
          <button
            type="button"
            onClick={handleStartOver}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition hover:bg-[#faf6ee]"
            style={{
              borderColor: '#e4d9c7',
              color: '#5b4636',
              background: '#fffdf9',
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('startOver')}</span>
          </button>
        </div>
      </div>

      {/* Floating AI Chatbot Widget */}
      <ChatWidget
        isOpenExternal={isChatOpen}
        onCloseExternal={() => setIsChatOpen(false)}
      />

      {/* Full Matching Schemes Modal */}
      {showSchemesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-lg bg-[#f3ede0] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#e4d9c7] animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 border-b border-[#e4d9c7] flex items-center justify-between bg-[#fffdf9]">
              <div>
                <h3 className="font-heading text-base font-bold text-[#1f3a5f]">
                  {t('viewSchemes')}
                </h3>
                <p className="text-[11px] text-[#8a7a68]">
                  Govt of India Official Portals & Application Links
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSchemesModal(false)}
                className="p-1.5 rounded-full hover:bg-[#e4d9c7] text-[#5b4636]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
              {(schemesList.length > 0 ? schemesList : [recommendedScheme]).map((s, idx) => {
                const directUrl = s.portalUrl || (
                  s.code === 'pm_vishwakarma' ? 'https://pmvishwakarma.gov.in/' :
                  s.code === 'pmegp' ? 'https://www.kviconline.gov.in/pmegpeportal/' :
                  s.code === 'stand_up_india' ? 'https://www.standupmitra.in/' :
                  s.code?.startsWith('mudra') ? 'https://www.mudra.org.in/' :
                  'https://pmsvanidhi.mohua.gov.in/'
                );

                return (
                  <div
                    key={s.code || idx}
                    className="p-4 rounded-2xl border bg-[#fffdf9] border-[#e4d9c7] shadow-sm hover:border-[#1f3a5f]/40 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-heading text-sm font-bold text-[#1f3a5f]">
                        {isHindi ? s.name_hi || s.name : s.name_en || s.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1f3a5f] text-white shrink-0">
                        {s.matchPercentage || s.match || 75}% Match
                      </span>
                    </div>

                    <p className="text-[11px] text-[#a36a2d] font-medium mt-0.5">
                      {isHindi ? s.ministry_hi || s.ministry : s.ministry_en || s.ministry}
                    </p>

                    <p className="text-xs text-[#5b4636] mt-2 leading-relaxed">
                      {isHindi ? s.description_hi || s.description : s.description_en || s.description}
                    </p>

                    {/* Benefit bullets if available */}
                    {Array.isArray(s.keyBenefits_en) && s.keyBenefits_en.length > 0 && (
                      <div className="mt-2.5 space-y-1 bg-[#faf6ee] p-2 rounded-xl border border-[#e4d9c7]/60">
                        {(isHindi && Array.isArray(s.keyBenefits_hi) && s.keyBenefits_hi.length > 0
                          ? s.keyBenefits_hi
                          : s.keyBenefits_en
                        ).map((ben, bIdx) => (
                          <div key={bIdx} className="text-[10.5px] text-[#5b4636] flex items-center gap-1.5">
                            <span className="text-[#a36a2d] font-bold">•</span>
                            <span>{ben}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3.5 pt-2.5 border-t border-[#efe6d6] flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1f3a5f]">
                        Max Loan: ₹{(s.loanCeiling || 50000).toLocaleString('en-IN')}
                      </span>
                      <a
                        href={directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1f3a5f] text-white hover:bg-[#152742] transition shadow-sm"
                      >
                        <span>{t('applyOnPortal')}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#e8a33d]" />
                      </a>
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
