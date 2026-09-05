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

          if (analysisRes?.analysis) {
            setApiAnalysis(analysisRes.analysis);
            if (Array.isArray(analysisRes.analysis.schemes) && analysisRes.analysis.schemes.length > 0) {
              setSchemesList(analysisRes.analysis.schemes);
            }
          }
          if (Array.isArray(schemesRes?.schemes) && schemesRes.schemes.length > 0) {
            setSchemesList(schemesRes.schemes);
          }
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

  // Complete list of matched schemes (guaranteed 7 schemes with dynamic match scoring)
  const displayedSchemes = React.useMemo(() => {
    if (Array.isArray(schemesList) && schemesList.length > 0) return schemesList;
    if (Array.isArray(apiAnalysis?.schemes) && apiAnalysis.schemes.length > 0) return apiAnalysis.schemes;
    if (Array.isArray(apiAnalysis?.matchedSchemes) && apiAnalysis.matchedSchemes.length > 0) return apiAnalysis.matchedSchemes;
    if (Array.isArray(fallbackCalc?.schemes) && fallbackCalc.schemes.length > 0) return fallbackCalc.schemes;
    
    // Master fallback schemes
    const userGender = (user?.gender || '').toLowerCase();
    const bizWhat = (biz?.what || biz?.interests || '').toLowerCase();
    const isArtisan = /tailor|sew|cloth|carpenter|wood|iron|smith|potter|basket|weave|barber|artisan/i.test(bizWhat);
    const rev = Number(calc.revenue || calc.rev || 0);

    const fallbackList = [
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
        matchPercentage: rev >= 25000 ? 89 : 82,
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

    return fallbackList.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [schemesList, apiAnalysis, fallbackCalc, user, biz, calc, isBeginner]);

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

  // Master Scheme Specifications for instant zero-failure comparison rendering
  const MASTER_SCHEME_SPECS = {
    pm_svanidhi: {
      code: 'pm_svanidhi',
      name_en: 'PM-SVANidhi (Street Vendor Loan)',
      name_hi: 'पीएम स्वनिधि (स्ट्रीट वेंडर्स ऋण)',
      ministry_en: 'Ministry of Housing and Urban Affairs',
      ministry_hi: 'आवासन और शहरी कार्य मंत्रालय',
      portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
      amountRange_en: '₹10,000 – ₹50,000',
      amountRange_hi: '₹10,000 से ₹50,000',
      rateOrSubsidy_en: '7% Interest Subsidy (Direct DBT) + Up to ₹1,200/yr Digital Cashback',
      rateOrSubsidy_hi: '7% ब्याज सब्सिडी (डीबीटी) + ₹1,200/वर्ष तक डिजिटल कैशबैक',
      complexity: 'simple',
      docsCount: 2,
      docsList_en: ['Aadhaar Card Linked to Mobile', 'Vending Certificate / Urban LOR (Letter of Recommendation)'],
      docsList_hi: ['मोबाइल से लिंक आधार कार्ड', 'वेंडिंग पहचान पत्र / स्थानीय निकाय सिफ़ारिश पत्र (LOR)'],
      processingTime_en: '7–15 Days',
      processingTime_hi: '7–15 दिन',
      tenure_en: '1 Year (Escalates to 3 Years on prompt repayment)',
      tenure_hi: '1 वर्ष (समय पर चुकाने पर 3 वर्ष तक विस्तार)',
      keyFit_en: 'Urban or peri-urban street vendors and small roadside stalls with active vending proof.',
      keyFit_hi: 'शहरी व कस्बाई क्षेत्रों के सक्रिय रेहड़ी-पटरी विक्रेता व छोटे फेरीवाले।',
      verdict_en: 'Best for street vendors and small roadside stalls needing quick, collateral-free daily working capital.',
      verdict_hi: 'रेहड़ी-पटरी वालों और छोटे दुकानदारों के लिए सबसे उपयुक्त जिन्हें बिना किसी गारंटी के तत्काल दैनिक कार्यशील पूंजी चाहिए।',
    },
    pmegp: {
      code: 'pmegp',
      name_en: 'PMEGP (Prime Minister’s Employment Generation Programme)',
      name_hi: 'पीएमईजीपी (प्रधानमंत्री रोजगार सृजन कार्यक्रम)',
      ministry_en: 'Ministry of MSME / KVIC',
      ministry_hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
      portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
      amountRange_en: '₹1 Lakh – ₹50 Lakh',
      amountRange_hi: '₹1 लाख से ₹50 लाख',
      rateOrSubsidy_en: '25%–35% Capital Subsidy (Non-repayable Government Margin Money)',
      rateOrSubsidy_hi: '25%–35% पूंजीगत सब्सिडी (माफ होने वाला सरकारी अनुदान)',
      complexity: 'complex',
      docsCount: 5,
      docsList_en: ['Aadhaar & PAN Card', 'Detailed Project Report (DPR)', 'EDP Training Certificate', 'Caste/Category Certificate', 'Bank Statement'],
      docsList_hi: ['आधार व पैन कार्ड', 'विस्तृत प्रोजेक्ट रिपोर्ट (DPR)', 'ईडीपी प्रशिक्षण प्रमाण पत्र', 'जाति/श्रेणी प्रमाण पत्र', 'बैंक खाता विवरण'],
      processingTime_en: '30–60 Days',
      processingTime_hi: '30–60 दिन',
      tenure_en: '3 to 7 Years (3-6 months initial moratorium)',
      tenure_hi: '3 से 7 वर्ष (3-6 महीने का प्रारंभिक अवकाश)',
      keyFit_en: 'New manufacturing (up to ₹50L) or service units (up to ₹20L); 8th pass for large projects.',
      keyFit_hi: 'नई विनिर्माण (₹50L तक) या सेवा इकाई (₹20L तक); बड़े प्रोजेक्ट हेतु 8वीं पास।',
      verdict_en: 'Best for manufacturing setups, processing units, or service shops needing substantial government subsidy on machinery and setup.',
      verdict_hi: 'विनिर्माण सेटअप, प्रसंस्करण इकाइयों या सर्विस वर्कशॉप के लिए सबसे उपयुक्त जिन्हें मशीनरी व सेटअप पर भारी सरकारी सब्सिडी चाहिए।',
    },
    pm_vishwakarma: {
      code: 'pm_vishwakarma',
      name_en: 'PM Vishwakarma Scheme',
      name_hi: 'पीएम विश्वकर्मा योजना',
      ministry_en: 'Ministry of MSME / Skill Development',
      ministry_hi: 'एमएसएमई मंत्रालय / कौशल विकास मंत्रालय',
      portalUrl: 'https://pmvishwakarma.gov.in/',
      amountRange_en: '₹1 Lakh – ₹3 Lakh',
      amountRange_hi: '₹1 लाख से ₹3 लाख',
      rateOrSubsidy_en: '5% Fixed Concessional Interest + ₹15,000 Modern Toolkit Grant',
      rateOrSubsidy_hi: '5% रियायती ब्याज दर + ₹15,000 की आधुनिक टूलकिट ई-वाउचर सहायता',
      complexity: 'simple',
      docsCount: 2,
      docsList_en: ['Aadhaar Card Linked to Mobile', 'Ration Card / Family Proof', 'Artisan Trade Self-Declaration'],
      docsList_hi: ['मोबाइल से लिंक आधार कार्ड', 'राशन कार्ड / परिवार प्रमाण', 'कारीगर व्यवसाय स्व-घोषणा'],
      processingTime_en: '15–30 Days',
      processingTime_hi: '15–30 दिन',
      tenure_en: '18 Months (Tranche 1: ₹1L) & 30 Months (Tranche 2: ₹2L)',
      tenure_hi: '18 महीने (पहला चरण: ₹1L) व 30 महीने (दूसरा चरण: ₹2L)',
      keyFit_en: 'Traditional artisan working in one of 18 recognized family trades (tailor, carpenter, smith, potter, etc.).',
      keyFit_hi: '18 मान्यता प्राप्त पारंपरिक व्यवसायों (दर्जी, बढ़ई, लोहार, कुम्हार आदि) में हाथ से काम करने वाले कारीगर।',
      verdict_en: 'Best for traditional artisans, tailors, carpenters, and smiths needing modern tools and subsidized 5% interest working credit.',
      verdict_hi: 'पारंपरिक कारीगरों, दर्जी, बढ़ई और लोहारों के लिए सबसे उपयुक्त जिन्हें आधुनिक औजार और सस्ते 5% ब्याज पर पूंजी चाहिए।',
    },
    mudra_shishu: {
      code: 'mudra_shishu',
      name_en: 'Pradhan Mantri Mudra Yojana (Shishu)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (शिशु)',
      ministry_en: 'Ministry of Finance / MSME',
      ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
      portalUrl: 'https://www.mudra.org.in/',
      amountRange_en: '₹10,000 – ₹50,000',
      amountRange_hi: '₹10,000 से ₹50,000',
      rateOrSubsidy_en: '8.5%–12% per annum (Bank Base Rate, Zero Collateral / Processing Fee)',
      rateOrSubsidy_hi: '8.5%–12% वार्षिक बैंक दर (बिना किसी गारंटी या प्रोसेसिंग शुल्क)',
      complexity: 'simple',
      docsCount: 3,
      docsList_en: ['Aadhaar & Voter ID', 'Bank Account Passbook', 'Quotation / Business Activity Proof'],
      docsList_hi: ['आधार व मतदाता पहचान पत्र', 'बैंक पासबुक / खाता', 'सामान कोटेशन / व्यापार गतिविधि प्रमाण'],
      processingTime_en: '7–15 Days',
      processingTime_hi: '7–15 दिन',
      tenure_en: 'Up to 3 to 5 Years',
      tenure_hi: '3 से 5 वर्ष तक',
      keyFit_en: 'Any micro-entrepreneur, shopkeeper, or starter business owner needing initial stock capital.',
      keyFit_hi: 'कोई भी सूक्ष्म उद्यमी, छोटा दुकानदार या नया व्यापारी जिसे प्रारंभिक स्टॉक पूंजी चाहिए।',
      verdict_en: 'Best for starter micro-shops and small retailers needing fast initial inventory with minimal paperwork.',
      verdict_hi: 'शुरुआती छोटी दुकानों और खुदरा व्यापारियों के लिए सबसे उपयुक्त जिन्हें न्यूनतम कागजात में तेज स्टॉक लोन चाहिए।',
    },
    mudra_kishore: {
      code: 'mudra_kishore',
      name_en: 'Pradhan Mantri Mudra Yojana (Kishore)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (किशोर)',
      ministry_en: 'Ministry of Finance / MSME',
      ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
      portalUrl: 'https://www.mudra.org.in/',
      amountRange_en: '₹50,000 – ₹5,00,000',
      amountRange_hi: '₹50,000 से ₹5,00,000',
      rateOrSubsidy_en: '9%–12.5% per annum (No Collateral / CGTMSE Credit Guarantee)',
      rateOrSubsidy_hi: '9%–12.5% वार्षिक बैंक दर (बिना किसी गारंटी / क्रेडिट गारंटी कवर)',
      complexity: 'moderate',
      docsCount: 4,
      docsList_en: ['Aadhaar & PAN Card', '6 Months Bank Statement', 'Udyam Registration / Shop Proof', 'Machinery / Stock Quotation'],
      docsList_hi: ['आधार व पैन कार्ड', '6 महीने का बैंक स्टेटमेंट', 'उद्यम पंजीकरण / दुकान प्रमाण', 'मशीन या स्टॉक का अनुमानित कोटेशन'],
      processingTime_en: '15–25 Days',
      processingTime_hi: '15–25 दिन',
      tenure_en: 'Up to 5 Years',
      tenure_hi: '5 वर्ष तक',
      keyFit_en: 'Established micro-business operating with regular sales turnover needing funds for machinery or stock expansion.',
      keyFit_hi: 'चल रहा व्यवसाय जिसकी नियमित बिक्री हो और जो स्टॉक बढ़ाने या नई मशीन खरीदने के लिए पूंजी चाहता हो।',
      verdict_en: 'Best for growing micro-businesses looking to buy equipment, expand stock volume, or upgrade shop premises.',
      verdict_hi: 'बढ़ते सूक्ष्म व्यवसायों के लिए सबसे उपयुक्त जो उपकरण खरीदना, स्टॉक बढ़ाना या दुकान का विस्तार करना चाहते हैं।',
    },
    mudra_tarun: {
      code: 'mudra_tarun',
      name_en: 'Pradhan Mantri Mudra Yojana (Tarun)',
      name_hi: 'प्रधानमंत्री मुद्रा योजना (तरुण)',
      ministry_en: 'Ministry of Finance / MSME',
      ministry_hi: 'वित्त मंत्रालय / एमएसएमई',
      portalUrl: 'https://www.mudra.org.in/',
      amountRange_en: '₹5,00,000 – ₹10,00,000',
      amountRange_hi: '₹5,00,000 से ₹10,00,000',
      rateOrSubsidy_en: '9.5%–13% per annum (Competitive MSME Banking Rates)',
      rateOrSubsidy_hi: '9.5%–13% वार्षिक प्रतिस्पर्धी बैंक दर',
      complexity: 'moderate',
      docsCount: 5,
      docsList_en: ['Aadhaar, PAN & Udyam Certificate', '1 Year Bank Statement', 'ITR / Sales Turnover Records', 'Business Expansion Estimate'],
      docsList_hi: ['आधार, पैन व उद्यम प्रमाण पत्र', '1 वर्ष का बैंक स्टेटमेंट', 'आईटीआर / बिक्री व टर्नओवर रिकॉर्ड', 'व्यापार विस्तार अनुमान व कोटेशन'],
      processingTime_en: '20–30 Days',
      processingTime_hi: '20–30 दिन',
      tenure_en: 'Up to 5 to 7 Years',
      tenure_hi: '5 से 7 वर्ष तक',
      keyFit_en: 'Established enterprises with consistent monthly revenue (>₹50k) and clean financial repayment records.',
      keyFit_hi: 'स्थापित उद्यम जिनकी मासिक बिक्री ₹50,000+ हो और जिनका वित्तीय ट्रैक रिकॉर्ड साफ हो।',
      verdict_en: 'Best for mature businesses needing significant capital for wholesale expansion, extra branches, or heavy machinery.',
      verdict_hi: 'परिपक्व व्यवसायों के लिए सबसे उपयुक्त जिन्हें थोक विस्तार, दूसरी शाखा या भारी मशीनरी के लिए बड़ी पूंजी चाहिए।',
    },
    stand_up_india: {
      code: 'stand_up_india',
      name_en: 'Stand-Up India Scheme',
      name_hi: 'स्टैंड-अप इंडिया योजना',
      ministry_en: 'Ministry of Finance / SIDBI',
      ministry_hi: 'वित्त मंत्रालय / सिडबी',
      portalUrl: 'https://www.standupmitra.in/',
      amountRange_en: '₹10 Lakh – ₹1 Crore',
      amountRange_hi: '₹10 लाख से ₹1 करोड़',
      rateOrSubsidy_en: 'Lowest Applicable Bank Rate (MCLR + 3% + Tenor Premium)',
      rateOrSubsidy_hi: 'न्यूनतम लागू बैंक ब्याज दर (MCLR आधारित)',
      complexity: 'complex',
      docsCount: 6,
      docsList_en: ['Aadhaar & PAN', 'Caste Certificate (for SC/ST) or Women Promoter Proof', 'Detailed Project Report (DPR)', 'Municipal/Pollution Clearances', 'Financial Balance Sheet / Net Worth'],
      docsList_hi: ['आधार व पैन कार्ड', 'जाति प्रमाण पत्र (SC/ST) या महिला उद्यमी प्रमाण', 'विस्तृत प्रोजेक्ट रिपोर्ट (DPR)', 'आवश्यक अनापत्ति प्रमाण पत्र', 'वित्तीय बैलेंस शीट व नेटवर्थ'],
      processingTime_en: '30–60 Days',
      processingTime_hi: '30–60 दिन',
      tenure_en: 'Up to 7 Years (18 months moratorium)',
      tenure_hi: '7 वर्ष तक (18 महीने तक का अधिस्थगन)',
      keyFit_en: 'Greenfield enterprise in manufacturing/services led by SC, ST, or Woman promoter (min 51% shareholding).',
      keyFit_hi: 'महिला या SC/ST उद्यमी द्वारा पहली बार स्थापित की जा रही नई विनिर्माण/सेवा इकाई (न्यूनतम 51% शेयरधारिता)।',
      verdict_en: 'Best for ambitious Women and SC/ST entrepreneurs launching commercial greenfield ventures with substantial capital requirements.',
      verdict_hi: 'महिला व अनुसूचित जाति/जनजाति उद्यमियों के लिए सबसे उपयुक्त जो बड़े स्तर पर नया विनिर्माण या वाणिज्यिक उद्यम शुरू कर रहे हैं।',
    },
    udyam_reg: {
      code: 'udyam_reg',
      name_en: 'Udyam Registration Portal (Zero Cost MSME Certificate)',
      name_hi: 'उद्यम पंजीकरण पोर्टल (निःशुल्क एमएसएमई प्रमाण पत्र)',
      ministry_en: 'Ministry of MSME',
      ministry_hi: 'सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय',
      portalUrl: 'https://udyamregistration.gov.in/',
      amountRange_en: '100% Free Government Certification',
      amountRange_hi: '100% निःशुल्क सरकारी पंजीकरण',
      rateOrSubsidy_en: 'Unlocks Priority MSME Subsidies, Collateral Waivers & Tender Benefits',
      rateOrSubsidy_hi: 'प्राथमिकता बैंक ऋण व सरकारी सब्सिडी प्राप्त करने हेतु अनिवार्य',
      complexity: 'simple',
      docsCount: 1,
      docsList_en: ['Aadhaar Card Linked to Mobile Number'],
      docsList_hi: ['मोबाइल से लिंक आधार कार्ड'],
      processingTime_en: 'Instant / 10 Minutes',
      processingTime_hi: 'तुरंत / 10 मिनट',
      tenure_en: 'Lifetime Validity (No Renewal Fee)',
      tenure_hi: 'आजीवन वैधता (कोई नवीनीकरण शुल्क नहीं)',
      keyFit_en: 'Any micro or small business operating or starting in India with an Aadhaar card.',
      keyFit_hi: 'भारत में कार्यरत या शुरू होने वाला कोई भी सूक्ष्म उद्यम जिसके पास आधार कार्ड है।',
      verdict_en: 'Essential first step for every entrepreneur to get official government legal identity, priority bank loans, and subsidy access.',
      verdict_hi: 'प्रत्येक उद्यमी के लिए कानूनी पहचान, प्राथमिकता बैंक ऋण और सब्सिडी प्राप्त करने हेतु अनिवार्य प्रथम कदम।',
    },
    pmkvy: {
      code: 'pmkvy',
      name_en: 'PMKVY (Pradhan Mantri Kaushal Vikas Yojana)',
      name_hi: 'प्रधानमंत्री कौशल विकास योजना (पीएमकेवीवाई)',
      ministry_en: 'Ministry of Skill Development and Entrepreneurship',
      ministry_hi: 'कौशल विकास और उद्यमिता मंत्रालय',
      portalUrl: 'https://www.pmkvyofficial.org/',
      amountRange_en: '100% Free Practical Skill Training',
      amountRange_hi: '100% निःशुल्क व्यावहारिक कौशल प्रशिक्षण',
      rateOrSubsidy_en: '₹8,000 Completion Cash Reward + NSDC Industry Certification',
      rateOrSubsidy_hi: 'सफलतापूर्वक पूरा करने पर ₹8,000 नकद पुरस्कार + सरकारी प्रमाण पत्र',
      complexity: 'simple',
      docsCount: 2,
      docsList_en: ['Aadhaar Card', 'Bank Account Details', 'Age / Education Proof'],
      docsList_hi: ['आधार कार्ड', 'बैंक खाता विवरण', 'आयु / शिक्षा प्रमाण'],
      processingTime_en: '7–14 Days Enrollment',
      processingTime_hi: '7–14 दिन में कोर्स दाखिला',
      tenure_en: 'Short-term Course (1 to 3 Months)',
      tenure_hi: 'अल्पकालिक प्रशिक्षण (1 से 3 महीने)',
      keyFit_en: 'Indian youth and aspiring entrepreneurs seeking certified practical vocational training or skill upgrading.',
      keyFit_hi: 'व्यावहारिक व्यावसायिक प्रशिक्षण या कौशल अपग्रेड चाहने वाले कोई भी भारतीय नागरिक या युवा।',
      verdict_en: 'Best for aspiring entrepreneurs and youth seeking certified vocational training before starting their venture.',
      verdict_hi: 'उन इच्छुक उद्यमियों और युवाओं के लिए सबसे उपयुक्त जो व्यवसाय शुरू करने से पहले प्रमाणित प्रशिक्षण लेना चाहते हैं।',
    }
  };

  const buildLocalSchemeComparison = (codeA, codeB) => {
    const normalize = (val) => String(val || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    const findSpec = (inputCode) => {
      if (!inputCode) return MASTER_SCHEME_SPECS.mudra_shishu;
      const norm = normalize(inputCode);
      const displayed = (displayedSchemes || []).find(
        (s) => normalize(s.code) === norm || normalize(s.name_en) === norm || normalize(s.name_hi) === norm
      );

      let matchedSpecKey = Object.keys(MASTER_SCHEME_SPECS).find(
        (k) => normalize(k) === norm || normalize(MASTER_SCHEME_SPECS[k].name_en) === norm
      );

      if (!matchedSpecKey) {
        if (norm.includes('tarun')) matchedSpecKey = 'mudra_tarun';
        else if (norm.includes('kishore') || norm.includes('kishor')) matchedSpecKey = 'mudra_kishore';
        else if (norm.includes('shishu') || norm.includes('sisu')) matchedSpecKey = 'mudra_shishu';
        else if (norm.includes('svanidhi') || norm.includes('swanidhi') || norm.includes('vendor')) matchedSpecKey = 'pm_svanidhi';
        else if (norm.includes('vishwakarma') || norm.includes('viswakarma')) matchedSpecKey = 'pm_vishwakarma';
        else if (norm.includes('pmegp') || norm.includes('kvic')) matchedSpecKey = 'pmegp';
        else if (norm.includes('standup') || norm.includes('stand_up')) matchedSpecKey = 'stand_up_india';
        else if (norm.includes('udyam')) matchedSpecKey = 'udyam_reg';
        else if (norm.includes('pmkvy')) matchedSpecKey = 'pmkvy';
        else if (norm.includes('mudra')) matchedSpecKey = 'mudra_shishu';
      }

      const spec = matchedSpecKey ? MASTER_SCHEME_SPECS[matchedSpecKey] : null;

      if (spec) {
        return {
          ...spec,
          matchPercentage: displayed?.matchPercentage || displayed?.match || (norm.includes('tarun') ? 86 : norm.includes('svanidhi') ? 92 : 85),
        };
      }

      if (displayed) {
        return {
          code: displayed.code || inputCode,
          name_en: displayed.name_en || displayed.name || inputCode,
          name_hi: displayed.name_hi || displayed.name || inputCode,
          ministry_en: displayed.ministry_en || displayed.ministry || 'Government of India',
          ministry_hi: displayed.ministry_hi || displayed.ministry || 'भारत सरकार',
          portalUrl: displayed.portalUrl || 'https://www.mudra.org.in/',
          amountRange_en: `Up to ₹${(displayed.loanCeiling || 50000).toLocaleString('en-IN')}`,
          amountRange_hi: `₹${(displayed.loanCeiling || 50000).toLocaleString('en-IN')} तक`,
          rateOrSubsidy_en: 'Standard Concessional Priority Lending Rate',
          rateOrSubsidy_hi: 'मानक रियायती प्राथमिकता ऋण दर',
          complexity: 'simple',
          docsCount: 2,
          docsList_en: ['Aadhaar Card Linked to Mobile', 'Bank Account / Identity Proof'],
          docsList_hi: ['मोबाइल से लिंक आधार कार्ड', 'बैंक खाता / पहचान पत्र'],
          processingTime_en: '7–15 Days',
          processingTime_hi: '7–15 दिन',
          tenure_en: '3 to 5 Years',
          tenure_hi: '3 से 5 वर्ष',
          keyFit_en: 'Direct fit for small micro-enterprises and local shop operations.',
          keyFit_hi: 'छोटे व्यवसायों और स्थानीय दुकानदारों के लिए सीधा मेल।',
          verdict_en: 'Well-suited for business working capital and credit access.',
          verdict_hi: 'कार्यशील पूंजी और आसान ऋण पहुंच के लिए उपयुक्त।',
          matchPercentage: displayed.matchPercentage || displayed.match || 85,
        };
      }

      return MASTER_SCHEME_SPECS.mudra_shishu;
    };

    const schemeA = findSpec(codeA);
    const schemeB = findSpec(codeB);

    return {
      success: true,
      schemeA,
      schemeB,
      comparison: {
        eligibility: {
          title_en: '1. Eligibility Match',
          title_hi: '1. पात्रता और फिट',
          schemeA: {
            matchPercentage: schemeA.matchPercentage || 90,
            keyFit_en: schemeA.keyFit_en,
            keyFit_hi: schemeA.keyFit_hi,
          },
          schemeB: {
            matchPercentage: schemeB.matchPercentage || 85,
            keyFit_en: schemeB.keyFit_en,
            keyFit_hi: schemeB.keyFit_hi,
          },
        },
        financialBenefit: {
          title_en: '2. Financial Benefit & Subsidy',
          title_hi: '2. वित्तीय लाभ व सब्सिडी',
          schemeA: {
            amountRange_en: schemeA.amountRange_en,
            amountRange_hi: schemeA.amountRange_hi,
            rateOrSubsidy_en: schemeA.rateOrSubsidy_en,
            rateOrSubsidy_hi: schemeA.rateOrSubsidy_hi,
          },
          schemeB: {
            amountRange_en: schemeB.amountRange_en,
            amountRange_hi: schemeB.amountRange_hi,
            rateOrSubsidy_en: schemeB.rateOrSubsidy_en,
            rateOrSubsidy_hi: schemeB.rateOrSubsidy_hi,
          },
        },
        processAndDocs: {
          title_en: '3. Process & Documentation',
          title_hi: '3. प्रक्रिया और दस्तावेज',
          schemeA: {
            complexity: schemeA.complexity || 'simple',
            docsCount: schemeA.docsCount || 2,
            docsList_en: schemeA.docsList_en || ['Aadhaar Card Linked to Mobile'],
            docsList_hi: schemeA.docsList_hi || ['मोबाइल से लिंक आधार कार्ड'],
          },
          schemeB: {
            complexity: schemeB.complexity || 'simple',
            docsCount: schemeB.docsCount || 2,
            docsList_en: schemeB.docsList_en || ['Aadhaar Card Linked to Mobile'],
            docsList_hi: schemeB.docsList_hi || ['मोबाइल से लिंक आधार कार्ड'],
          },
        },
        timeToBenefit: {
          title_en: '4. Time to Benefit & Tenure',
          title_hi: '4. समय व पुनर्भुगतान अवधि',
          schemeA: {
            processingTime_en: schemeA.processingTime_en || '7–15 Days',
            processingTime_hi: schemeA.processingTime_hi || '7–15 दिन',
            tenure_en: schemeA.tenure_en || '3 to 5 Years',
            tenure_hi: schemeA.tenure_hi || '3 से 5 वर्ष',
          },
          schemeB: {
            processingTime_en: schemeB.processingTime_en || '7–15 Days',
            processingTime_hi: schemeB.processingTime_hi || '7–15 दिन',
            tenure_en: schemeB.tenure_en || '3 to 5 Years',
            tenure_hi: schemeB.tenure_hi || '3 से 5 वर्ष',
          },
        },
        bestFitFor: {
          title_en: '5. Best Fit For Your Profile',
          title_hi: '5. आपके व्यवसाय के लिए उपयुक्तता',
          schemeA: {
            verdict_en: schemeA.verdict_en,
            verdict_hi: schemeA.verdict_hi,
          },
          schemeB: {
            verdict_en: schemeB.verdict_en,
            verdict_hi: schemeB.verdict_hi,
          },
        },
      },
    };
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
    const initialLocalComparison = buildLocalSchemeComparison(selectedSchemes[0], selectedSchemes[1]);
    setComparisonData(initialLocalComparison);
    setShowCompareModal(true);
    setLoadingComparison(true);
    try {
      const clientContext = {
        user,
        business: biz,
        sales: { revenue: calc.revenue, dailySales: calc.dailySales },
        expenses: { totalExpenses: calc.totalExpenses },
        items: items || [],
        problems: problems || [],
        isBeginner,
      };
      const res = await api.compareSchemes(selectedSchemes[0], selectedSchemes[1], userId, portalType, clientContext);
      if (res?.success && res.schemeA && res.schemeB && res.comparison) {
        setComparisonData(res);
      }
    } catch (err) {
      console.warn('Using client-side generated scheme comparison:', err?.message || err);
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
                    <span>{t('viewSchemes')} ({displayedSchemes.length})</span>
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
                      {t('viewSchemes')} ({displayedSchemes.length})
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
                    {isHindi ? 'सभी देखें' : 'View All'} ({displayedSchemes.length})
                  </button>
                </div>

                <div className="space-y-3">
                  {displayedSchemes.slice(0, 4).map((s, idx) => {
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
                  const sc = displayedSchemes.find((s) => s.code === code) || { name_en: code };
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
              {displayedSchemes.map((s, idx) => {
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
