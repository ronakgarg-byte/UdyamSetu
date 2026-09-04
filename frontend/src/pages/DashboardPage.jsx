import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { QACard } from '../components/Common';
import Layout from '../components/Layout';
import ChatWidget from '../components/ChatWidget';
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
} from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, userId, fallbackCalc, resetAll, t, lang } = useApp();
  const [apiAnalysis, setApiAnalysis] = useState(null);
  const [schemesList, setSchemesList] = useState([]);
  const [localContext, setLocalContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (userId) {
        try {
          const [analysisRes, schemesRes, contextRes] = await Promise.all([
            api.getAnalysis(userId).catch(() => null),
            api.getSchemes(userId).catch(() => null),
            api.getLocalContext(userId).catch(() => null),
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
  }, [userId]);

  // Use API calculation or local fallback
  const calc = apiAnalysis || fallbackCalc;

  const riskColor = {
    low: "#3f6b4f",
    medium: "#c98a1f",
    high: "#b75b3d",
  }[calc.riskLevel || 'low'];

  const riskLabel = {
    low: t("low"),
    medium: t("medium"),
    high: t("high"),
  }[calc.riskLevel || 'low'];

  const handleStartOver = () => {
    resetAll();
    navigate('/');
  };

  return (
    <Layout
      title={t("dashHi")}
      showBack={true}
      onBack={() => navigate('/items')}
      progress={100}
    >
      <div className="pb-16">
        {/* Welcome Greeting */}
        <div className="mb-6">
          <p className="text-xs font-semibold" style={{ color: "#a36a2d" }}>
            {user.name ? `${user.name},` : ""}
          </p>
          <h2 className="font-heading text-2xl font-bold" style={{ color: "#1f3a5f" }}>
            {t("dashHi")}
          </h2>
          {localContext && (
            <div className="flex items-center gap-1.5 text-xs text-[#8a7a68] mt-1">
              <MapPin className="w-3.5 h-3.5 text-[#a36a2d]" />
              <span>
                {localContext.district}, {localContext.state} • Mandi: {localContext.mandiEconomics?.reportingMandi}
              </span>
            </div>
          )}
        </div>

        {/* Recommended Scheme Banner */}
        <div
          className="p-4 rounded-2xl mb-5 shadow-sm border"
          style={{ background: "#1f3a5f", borderColor: "#1f3a5f", color: "#fffdf9" }}
        >
          <div className="flex items-center justify-between text-xs font-semibold mb-1 opacity-90">
            <span className="flex items-center gap-1.5" style={{ color: "#e8a33d" }}>
              <Sparkles className="w-4 h-4" />
              {t("recommendedScheme")}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold">
              {calc.scheme?.match || 80}% {t("eligibilityMatch")}
            </span>
          </div>
          <div className="font-heading text-lg font-bold mt-1">
            {calc.scheme?.name || "PM-SVANidhi Scheme"}
          </div>
          <p className="text-xs mt-1.5 text-[#efe6d6] leading-relaxed">
            {calc.scheme?.code === 'pm_svanidhi'
              ? (lang === 'hi' ? '₹50,000 तक का संपार्श्विक-मुक्त कार्यशील पूंजी ऋण, 7% ब्याज सब्सिडी के साथ।' : 'Collateral-free working capital loan up to ₹50,000 with 7% interest subsidy.')
              : (lang === 'hi' ? 'सूक्ष्म उद्यमों के लिए पूंजीगत सब्सिडी और कम ब्याज वाला ऋण।' : 'Capital subsidy and micro-credit financing for rural entrepreneurs.')}
          </p>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowSchemesModal(true)}
              className="text-xs font-semibold underline text-[#e8a33d] flex items-center gap-1 hover:opacity-80"
            >
              <Building2 className="w-3.5 h-3.5" />
              {t("viewSchemes")} ({schemesList.length || 7})
            </button>
            <span className="text-[11px] opacity-75">SIH26091 Verified</span>
          </div>
        </div>

        {/* Ask AI Advisor Quick Action Banner */}
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
                <span>{t("talkAdvisor")}</span>
                <span className="text-[9px] uppercase px-1.5 py-0.2 bg-[#e8a33d] text-[#1f3a5f] rounded font-bold">
                  24x7
                </span>
              </div>
              <p className="text-[11px] text-[#5b4636]">
                {lang === 'hi'
                  ? 'मुनाफा बढ़ाने या खर्च घटाने के लिए एआई से बात करें'
                  : 'Ask how to cut costs or apply for schemes'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#a36a2d] px-2.5 py-1 rounded-lg bg-[#efe6d6]">
            Chat →
          </span>
        </div>

        {/* Financial Health / Risk Score */}
        <div
          className="p-4 rounded-xl border mb-5 flex items-center justify-between"
          style={{ background: "#fffdf9", borderColor: "#e4d9c7" }}
        >
          <div>
            <div className="text-xs font-semibold" style={{ color: "#8a7a68" }}>
              {t("riskScore")}
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
            <div className="text-xs font-semibold" style={{ color: "#8a7a68" }}>
              {t("qDebtBurden")}
            </div>
            <div className="font-heading text-base font-bold" style={{ color: "#1f3a5f" }}>
              {Math.round(calc.debtRatio || 0)}%
            </div>
          </div>
        </div>

        {/* Key Question Answer Cards (Financial Structuring) */}
        <div className="space-y-3">
          {/* Revenue */}
          <QACard
            q={t("qRevenue")}
            a={fmt(calc.revenue || calc.rev)}
            note={
              lang === 'hi'
                ? `कुल मासिक अनुमानित बिक्री`
                : `Total estimated monthly sales`
            }
          />

          {/* Net Profit */}
          <QACard
            q={t("qNetProfit")}
            a={fmt(calc.netProfit)}
            highlight={calc.netProfit > 0}
            note={
              calc.netProfit >= 0
                ? (lang === 'hi' ? `मासिक खर्चों के बाद बचा हुआ लाभ` : `Profit retained after business operating expenses`)
                : (lang === 'hi' ? `सावधानी: खर्च बिक्री से अधिक है` : `Warning: Operating expenses exceed revenue`)
            }
          />

          {/* Cash Flow */}
          <QACard
            q={t("qCashFlow")}
            a={fmt(calc.cashFlow)}
            note={
              lang === 'hi'
                ? `ईएमआई (लोन किश्त) चुकाने के बाद हाथ में नकदी`
                : `Actual in-hand cash after loan EMI payment`
            }
          />

          {/* Break-Even Gap */}
          <QACard
            q={t("qBreakEven")}
            a={
              calc.breakEvenGap > 0
                ? fmt(calc.breakEvenGap) + ` ${lang === 'hi' ? 'कम पड़ रहे हैं' : 'shortfall'}`
                : lang === 'hi' ? `लागत पूरी हो रही है ✓` : `Costs covered ✓`
            }
            note={
              calc.breakEvenGap > 0
                ? (lang === 'hi' ? `खर्च और ईएमआई पूरे करने के लिए इतनी अतिरिक्त बिक्री आवश्यक है` : `Additional sales needed to reach zero loss`)
                : (lang === 'hi' ? `आपका व्यवसाय लागत से अधिक कमा रहा है` : `Business is safely operating above break-even point`)
            }
          />

          {/* Working Capital */}
          <QACard
            q={t("qWorkingCap")}
            a={fmt(calc.workingCapital ?? calc.workingCap)}
            note={
              lang === 'hi'
                ? `इन्वेंट्री और स्टॉक में फंसा हुआ कुल पैसा`
                : `Total capital locked in inventory items`
            }
          />

          {/* ROI Months */}
          <QACard
            q={t("qROI")}
            a={
              calc.roiMonths
                ? `${calc.roiMonths} ${lang === 'hi' ? 'महीने' : 'months'}`
                : lang === 'hi' ? 'विवरण उपलब्ध नहीं' : 'N/A'
            }
            note={
              calc.roiMonths
                ? (lang === 'hi' ? `मौजूदा मार्जिन से कार्यशील पूंजी वापस पाने का अनुमानित समय` : `Estimated recovery time based on unit margins`)
                : (lang === 'hi' ? `वस्तुओं का बिक्री व लागत मूल्य जोड़ें` : `Add item cost & sell prices to calculate`)
            }
          />
        </div>

        {/* Start Over Button */}
        <div className="mt-8 pt-4 border-t border-[#e4d9c7]">
          <button
            type="button"
            onClick={handleStartOver}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-xs font-semibold transition"
            style={{
              borderColor: "#e4d9c7",
              color: "#5b4636",
              background: "#fffdf9",
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t("startOver")}</span>
          </button>
        </div>
      </div>

      {/* Floating AI Chatbot Widget */}
      <ChatWidget
        isOpenExternal={isChatOpen}
        onCloseExternal={() => setIsChatOpen(false)}
      />

      {/* Matching Schemes Modal */}
      {showSchemesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#f3ede0] rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#e4d9c7]">
            <div className="px-5 py-4 border-b border-[#e4d9c7] flex items-center justify-between bg-[#fffdf9]">
              <div>
                <h3 className="font-heading text-base font-bold text-[#1f3a5f]">
                  {t("viewSchemes")}
                </h3>
                <p className="text-[11px] text-[#8a7a68]">
                  Govt of India & State Schemes matched to your profile
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
              {(schemesList.length > 0 ? schemesList : [calc.scheme]).map((s, idx) => (
                <div
                  key={s.code || idx}
                  className="p-4 rounded-xl border bg-[#fffdf9] border-[#e4d9c7] shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading text-sm font-bold text-[#1f3a5f]">
                      {lang === 'hi' ? s.name_hi || s.name : s.name_en || s.name}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1f3a5f] text-white shrink-0">
                      {s.matchPercentage || s.match || 75}% Match
                    </span>
                  </div>

                  <p className="text-[11px] text-[#a36a2d] font-medium mt-0.5">
                    {lang === 'hi' ? s.ministry_hi || s.ministry : s.ministry_en || s.ministry}
                  </p>

                  <p className="text-xs text-[#5b4636] mt-2 leading-relaxed">
                    {lang === 'hi' ? s.description_hi || s.description : s.description_en || s.description}
                  </p>

                  {s.portalUrl && (
                    <div className="mt-3 pt-2.5 border-t border-[#efe6d6] flex items-center justify-between">
                      <span className="text-[11px] text-[#8a7a68]">
                        Max Loan: ₹{(s.loanCeiling || 50000).toLocaleString('en-IN')}
                      </span>
                      <a
                        href={s.portalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1f3a5f] hover:underline"
                      >
                        Official Portal <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
