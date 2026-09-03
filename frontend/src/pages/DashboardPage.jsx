import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  IndianRupee,
  TrendingUp,
  Wallet,
  Scale,
  Boxes,
  Percent,
  CreditCard,
  Check,
  X,
  ExternalLink,
  Building,
  Award,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { QACard } from '../components/Common';
import Layout from '../components/Layout';
import { fmt, EXPENSE_FIELDS } from '../i18n/translations';
import { api } from '../services/api';

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    t,
    lang,
    userId,
    sales,
    expenses,
    items,
    problems,
    resetAll,
  } = useApp();

  const [apiAnalysis, setApiAnalysis] = useState(null);
  const [schemesList, setSchemesList] = useState([]);
  const [showSchemesModal, setShowSchemesModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch analysis and schemes from backend API
  useEffect(() => {
    let isMounted = true;
    if (userId) {
      setLoading(true);
      Promise.all([
        api.getAnalysis(userId).catch(() => null),
        api.getSchemes(userId).catch(() => null),
      ])
        .then(([analysisRes, schemesRes]) => {
          if (isMounted) {
            if (analysisRes?.success && analysisRes?.analysis) {
              setApiAnalysis(analysisRes.analysis);
            }
            if (schemesRes?.success && schemesRes?.schemes) {
              setSchemesList(schemesRes.schemes);
            }
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // 2. Client fallback calc
  const fallbackCalc = useMemo(() => {
    const revenue =
      Number(sales.monthlyRevenue) ||
      Number(sales.dailySales || 0) * 30 ||
      0;
    const expNums = EXPENSE_FIELDS.filter((f) => f.key !== "emi").map(
      (f) => Number(expenses[f.key]) || 0
    );
    const totalExpenses = expNums.reduce((a, b) => a + b, 0);
    const emi = Number(expenses.emi) || 0;
    const netProfit = revenue - totalExpenses;
    const cashFlow = netProfit - emi;
    const breakEvenGap = totalExpenses + emi - revenue;
    const workingCapital = items.reduce(
      (a, it) => a + (Number(it.costPrice) || 0),
      0
    );
    const avgMargin =
      items.length > 0
        ? items.reduce((a, it) => {
            const sp = Number(it.sellPrice) || 0;
            const cp = Number(it.costPrice) || 0;
            return a + (sp - cp);
          }, 0) / items.length
        : 0;
    const roiMonths =
      avgMargin > 0 ? Math.max(1, Math.round(workingCapital / (avgMargin * 20))) : null;
    const debtRatio = revenue > 0 ? (emi / revenue) * 100 : 0;

    let riskLevel = "low";
    if (debtRatio > 50 || netProfit < 0) riskLevel = "high";
    else if (debtRatio > 25 || cashFlow < revenue * 0.05) riskLevel = "medium";

    let scheme = { name: "Mudra Yojana (Shishu)", match: 74 };
    if (revenue > 0 && revenue < 15000) scheme = { name: "PM-SVANidhi", match: 88 };
    else if (
      problems.includes("workingcap") ||
      problems.includes("loanrepay")
    )
      scheme = { name: "PMEGP (Prime Minister's Employment Generation Programme)", match: 81 };
    else if (revenue >= 50000) scheme = { name: "Mudra Yojana (Tarun)", match: 79 };

    return {
      revenue,
      totalExpenses,
      emi,
      netProfit,
      cashFlow,
      breakEvenGap,
      workingCapital,
      roiMonths,
      debtRatio,
      riskLevel,
      scheme,
    };
  }, [sales, expenses, items, problems]);

  const calc = apiAnalysis || fallbackCalc;

  const riskColor = {
    low: "#3f6b4f",
    medium: "#c98a1f",
    high: "#b75b3d",
  }[calc.riskLevel || 'low'];

  const breakEvenText =
    calc.breakEvenGap > 0
      ? lang === "en"
        ? `You need about ${fmt(calc.breakEvenGap)} more in sales this month to cover your costs.`
        : `खर्च पूरा करने के लिए इस महीने लगभग ${fmt(calc.breakEvenGap)} और बिक्री चाहिए।`
      : lang === "en"
        ? "You're already covering your monthly costs."
        : "आप पहले से ही अपने मासिक खर्च पूरे कर रहे हैं।";

  const roiText =
    calc.roiMonths != null
      ? lang === "en"
        ? `A similar investment could recover its cost in about ${calc.roiMonths} month${calc.roiMonths > 1 ? "s" : ""}.`
        : `इस जैसा निवेश लगभग ${calc.roiMonths} महीनों में अपनी लागत वसूल सकता है।`
      : lang === "en"
        ? "Add a few items to estimate this."
        : "इसका अनुमान लगाने के लिए कुछ वस्तुएं जोड़ें।";

  const debtText =
    calc.emi > 0
      ? lang === "en"
        ? `A ${fmt(calc.emi)} monthly EMI looks ${calc.debtRatio > 50 ? "heavy" : calc.debtRatio > 25 ? "manageable but tight" : "manageable"} against your income.`
        : `${fmt(calc.emi)} मासिक ईएमआई आपकी आय के मुकाबले ${calc.debtRatio > 50 ? "भारी" : calc.debtRatio > 25 ? "संभालने योग्य पर कड़ी" : "संभालने योग्य"} लगती है।`
      : lang === "en"
        ? "You have no active loan EMI right now."
        : "अभी आपका कोई सक्रिय लोन ईएमआई नहीं है।";

  const handleStartOver = () => {
    resetAll();
    navigate('/');
  };

  const customBottom = (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => alert(lang === 'en' ? "Connecting with local MSME / Lead Bank officer..." : "स्थानीय एमएसएमई / लीड बैंक अधिकारी से संपर्क स्थापित किया जा रहा है...")}
        className="w-full rounded-2xl py-3 font-heading text-sm font-semibold shadow-sm transition-all hover:brightness-105 active:scale-[0.99]"
        style={{ backgroundColor: "#e8a33d", color: "#3a2a12" }}
      >
        {t("talkAdvisor")}
      </button>
      <button
        type="button"
        onClick={handleStartOver}
        className="w-full rounded-2xl py-2.5 text-sm font-medium hover:bg-stone-100 transition-colors"
        style={{ color: "#8a7a68" }}
      >
        {t("startOver")}
      </button>
    </div>
  );

  return (
    <Layout
      title={t("dashHi")}
      progress={100}
      onBack={() => navigate('/items')}
      showBottomBar={true}
      customBottom={customBottom}
    >
      <div>
        <h2 className="font-heading text-xl font-bold mb-5" style={{ color: "#1f3a5f" }}>
          {t("dashHi")}
        </h2>

        {/* Financial analysis / Recommended Scheme Card */}
        <div
          className="rounded-2xl p-4 mb-5 text-white shadow-lg transition-transform hover:scale-[1.01]"
          style={{ backgroundColor: "#1f3a5f" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} color="#e8a33d" />
            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#e8a33d" }}>
              {t("analysisTitle")}
            </span>
          </div>
          <p className="text-xs mb-1 opacity-80">{t("recommendedScheme")}</p>
          <p className="font-heading text-lg font-bold mb-1">{calc.scheme?.name || 'Mudra Yojana'}</p>
          <p className="text-xs opacity-80 mb-4">
            {calc.scheme?.match || 74}% {t("eligibilityMatch")}
          </p>
          <div
            className="flex items-center justify-between border-t pt-3"
            style={{ borderColor: "rgba(255,255,255,0.15)" }}
          >
            <span className="text-xs opacity-80">{t("riskScore")}</span>
            <span
              className="text-xs font-semibold rounded-full px-2.5 py-1 uppercase tracking-wider"
              style={{ backgroundColor: riskColor, color: "#fff" }}
            >
              {t(calc.riskLevel || 'low')}
            </span>
          </div>
        </div>

        {/* Question-Oriented Metric Cards */}
        <QACard
          icon={IndianRupee}
          accent="#1f3a5f"
          question={t("qRevenue")}
          answer={lang === "en" ? `You sold ${fmt(calc.revenue)} this month.` : `इस महीने आपने ${fmt(calc.revenue)} की बिक्री की।`}
        />

        <QACard
          icon={TrendingUp}
          accent="#3f6b4f"
          question={t("qNetProfit")}
          answer={lang === "en" ? `You kept about ${fmt(calc.netProfit)} after expenses.` : `खर्च के बाद आपके पास लगभग ${fmt(calc.netProfit)} बचे।`}
        />

        <QACard
          icon={Wallet}
          accent="#a36a2d"
          question={t("qCashFlow")}
          answer={lang === "en" ? `You have ${fmt(calc.cashFlow)} available after this month's payments.` : `इस महीने के भुगतान के बाद आपके पास ${fmt(calc.cashFlow)} उपलब्ध है।`}
        />

        <QACard
          icon={Scale}
          accent="#b75b3d"
          question={t("qBreakEven")}
          answer={breakEvenText}
        />

        <QACard
          icon={Boxes}
          accent="#1f3a5f"
          question={t("qWorkingCap")}
          answer={lang === "en" ? `${fmt(calc.workingCapital)} is currently tied up in stock.` : `${fmt(calc.workingCapital)} अभी स्टॉक में फंसा है।`}
        />

        <QACard
          icon={Percent}
          accent="#3f6b4f"
          question={t("qROI")}
          answer={roiText}
        />

        <QACard
          icon={CreditCard}
          accent="#c98a1f"
          question={t("qDebtBurden")}
          answer={debtText}
        />

        {/* View All Schemes Trigger */}
        <button
          type="button"
          onClick={() => setShowSchemesModal(true)}
          className="w-full mt-2 rounded-2xl border py-3 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#1f3a5f]/5 transition-colors shadow-sm"
          style={{ borderColor: "#1f3a5f", color: "#1f3a5f" }}
        >
          <Check size={16} /> {t("viewSchemes")}
        </button>

        {/* All Matching Schemes Modal */}
        {showSchemesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div
              className="relative w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden"
              style={{ backgroundColor: "#fffdf9", borderColor: "#e4d9c7" }}
            >
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: "#efe6d6", backgroundColor: "#1f3a5f" }}
              >
                <div className="flex items-center gap-2 text-white">
                  <Award size={20} color="#e8a33d" />
                  <h3 className="font-heading text-base font-bold">
                    {lang === "en" ? "Government Schemes" : "सरकारी योजनाएं"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchemesModal(false)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {(schemesList.length > 0 ? schemesList : [
                  {
                    code: 'pm_svanidhi',
                    name_en: 'PM-SVANidhi',
                    name_hi: 'पीएम स्वनिधि',
                    matchPercentage: 88,
                    loanCeiling: 50000,
                    interestSubsidyPct: 7,
                    description_en: 'Working capital micro-loan up to ₹50,000 with 7% interest subsidy.',
                    description_hi: '7% ब्याज सब्सिडी के साथ ₹50,000 तक का कार्यशील पूंजी ऋण।',
                    portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
                  },
                  {
                    code: 'pmegp',
                    name_en: "PMEGP",
                    name_hi: "पीएमईजीपी",
                    matchPercentage: 81,
                    loanCeiling: 5000000,
                    interestSubsidyPct: 35,
                    description_en: 'Up to 35% capital subsidy for rural micro-enterprises.',
                    description_hi: 'ग्रामीण सूक्ष्म उद्यमों के लिए 35% तक पूंजीगत सब्सिडी।',
                    portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
                  },
                ]).map((sch) => (
                  <div
                    key={sch.code}
                    className="rounded-2xl border p-4 shadow-sm"
                    style={{ borderColor: "#e4d9c7", backgroundColor: "#fff" }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h4 className="font-heading text-sm font-bold" style={{ color: "#1f3a5f" }}>
                        {lang === "en" ? sch.name_en : sch.name_hi}
                      </h4>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-bold shrink-0"
                        style={{ backgroundColor: "#1f3a5f", color: "#e8a33d" }}
                      >
                        {sch.matchPercentage}% {lang === "en" ? "Match" : "मेल"}
                      </span>
                    </div>

                    <p className="text-xs mb-3" style={{ color: "#5b4636" }}>
                      {lang === "en" ? sch.description_en : sch.description_hi}
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t" style={{ borderColor: "#efe6d6" }}>
                      <span className="font-medium" style={{ color: "#8a7a68" }}>
                        {lang === "en" ? `Max Loan: ${fmt(sch.loanCeiling)}` : `अधिकतम ऋण: ${fmt(sch.loanCeiling)}`}
                      </span>
                      {sch.portalUrl && (
                        <a
                          href={sch.portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 font-semibold hover:underline"
                          style={{ color: "#a36a2d" }}
                        >
                          {lang === "en" ? "Apply Portal" : "आवेदन पोर्टल"} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t" style={{ borderColor: "#efe6d6" }}>
                <button
                  type="button"
                  onClick={() => setShowSchemesModal(false)}
                  className="w-full rounded-xl py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: "#1f3a5f", color: "#fff" }}
                >
                  {lang === "en" ? "Close" : "बंद करें"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
