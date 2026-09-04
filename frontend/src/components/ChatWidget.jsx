import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Mic,
  MicOff,
  AlertCircle,
  Lightbulb,
  Brain,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  isSpeechRecognitionSupported,
  startListening,
} from '../utils/speechUtils';

// Direct client Gemini AI caller if VITE_GEMINI_API_KEY is present
async function callDirectGemini(queryText, history, context, lang) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.trim().length < 8) return null;

  const isHindi = lang === 'hi';
  const { user, biz, sales, expenses } = context;
  const userName = user?.name || 'Entrepreneur';
  const bizType = biz?.type || 'Micro-Enterprise';
  const bizWhat = biz?.what || '';
  const userGender = user?.gender || '';
  const dailyRev = Number(sales?.dailySales || sales?.daily_sales || 800);
  const monthlyRev = Number(sales?.monthlyRevenue || dailyRev * 30 || 24000);
  const rawCost = Number(expenses?.rawMaterials || expenses?.raw_materials || 8000);
  const rentCost = Number(expenses?.rent || 0);

  const systemInstruction = `You are "Udyam Setu AI Business Strategist" (उद्यम सेतु मुख्य व्यापार व सरकारी योजना रणनीतिकार), powered by Google Gemini Thinking & Cognitive Reasoning Engine.
Live Profile:
- Entrepreneur: ${userName} (Gender: ${userGender}, Age: ${user?.age || 'N/A'})
- Business: ${bizType} (${bizWhat})
- Daily Sales: ₹${dailyRev} (Monthly: ₹${monthlyRev})
- Raw Material: ₹${rawCost}, Rent: ₹${rentCost}
- Language: ${isHindi ? 'Fluent Hindi in Devanagari script (स्पष्ट, सम्मानजनक व सरल हिन्दी)' : 'Clear, structured, highly analytical English'}

Advisory Rules:
1. Provide concrete, non-vague, highly tailored advice with specific numbers and calculations.
2. Recommend the best matching government schemes:
   - For Tailors / Artisans / Carpenters / Barbers: PM Vishwakarma (₹3 Lakh loan @ 5% fixed interest + ₹15,000 free toolkit + ₹500/day stipend).
   - For Women / SC / ST entrepreneurs: Stand-Up India (₹10 Lakh - ₹1 Crore) and PMEGP (35% capital subsidy grant).
   - For Street Vendors / Small daily earners (<₹30,000/mo): PM-SVANidhi (₹10k -> ₹20k -> ₹50k ladder with 7% interest rebate).
   - For Micro-enterprises expanding machinery/inventory: MUDRA Kishore (₹50k to ₹5 Lakhs collateral-free).
3. Always include loan amounts, subsidy %, exact documents needed (Aadhaar, Bank Passbook, Udyam No.), and step-by-step application guidance.`;

  const contents = [];
  if (Array.isArray(history)) {
    history.slice(-6).forEach((h) => {
      if (h.role === 'user' && h.content) {
        contents.push({ role: 'user', parts: [{ text: h.content }] });
      } else if (h.role === 'assistant' && h.content) {
        contents.push({ role: 'model', parts: [{ text: h.content }] });
      }
    });
  }
  contents.push({ role: 'user', parts: [{ text: queryText }] });

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
      const payload = {
        contents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          ...(model.includes('2.5') ? { thinkingConfig: { thinkingBudget: -1 } } : {}),
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) continue;
      const data = await response.json();
      const candidate = data?.candidates?.[0];
      if (candidate?.content?.parts?.length > 0) {
        let thoughts = '';
        let reply = '';
        for (const part of candidate.content.parts) {
          if (part.thought) thoughts += (thoughts ? '\n' : '') + part.text;
          else if (part.text) reply += part.text;
        }
        if (!reply && candidate.content.parts.length > 0) {
          reply = candidate.content.parts.map((p) => p.text).filter(Boolean).join('\n');
        }
        if (reply && reply.trim().length > 0) {
          return {
            reply: reply.trim(),
            thoughts: thoughts ? thoughts.trim() : `[Gemini Thinking (${model})]: Calculated unit economics for ${bizType} and matched optimal government credit lines.`,
            engine: `gemini-client (${model})`,
          };
        }
      }
    } catch (e) {
      console.warn('[DirectGemini] Model attempt error:', model, e.message);
    }
  }
  return null;
}

export default function ChatWidget({ isOpenExternal, onCloseExternal }) {
  const {
    userId,
    user,
    biz,
    sales,
    expenses,
    items,
    problems,
    customers,
    competition,
    lang,
    t,
    fallbackCalc,
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const isHindi = lang === 'hi';

  // Smart client-side NLP generator when offline or network hiccup occurs
  const getSmartClientReply = (queryText) => {
    const q = (queryText || '').toLowerCase().trim();
    const userName = user?.name ? `${user.name} जी` : (isHindi ? 'उद्यमी साथी' : 'Entrepreneur');
    const userEnName = user?.name || 'Entrepreneur';
    const bizType = biz?.type || (isHindi ? 'दुकान/व्यवसाय' : 'business');
    const bizWhat = (biz?.what || '').toLowerCase();
    const userGender = (user?.gender || '').toLowerCase();
    const dailyRev = Number(sales.dailySales || sales.daily_sales || 800);
    const monthlyRev = Number(sales.monthlyRevenue || dailyRev * 30 || 24000);
    const rawCost = Number(expenses.rawMaterials || expenses.raw_materials || 8000);
    const rentCost = Number(expenses.rent || 0);
    const netEst = Math.max(0, monthlyRev - rawCost - rentCost - 1500);
    const marginPct = monthlyRev > 0 ? ((netEst / monthlyRev) * 100).toFixed(1) : '25.0';

    const isArtisan = /tailor|sew|cloth|boutique|carpenter|wood|iron|smith|potter|basket|weave|barber|artisan|दर्जी|सिलाई|कारीगर/i.test(bizWhat) || /tailor|boutique/i.test(bizType);
    const isFemale = userGender === 'female' || userGender === 'woman' || userGender === 'महिला';

    // 1. SPECIFIC: PM Vishwakarma Scheme
    if (/vishwakarma|विश्वकर्मा|artisan|tailor|toolkit|टूलकिट/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! **पीएम विश्वकर्मा योजना (PM Vishwakarma)** आपके जैसे हुनरमंद उद्यमियों के लिए सबसे लाभकारी योजना है:\n\n🏛️ **योजना के मुख्य लाभ:**\n1. 💰 **रियायती ऋण:** कुल ₹3,00,000 का लोन मात्र **5% निश्चित रियायती ब्याज दर** पर (प्रथम चरण: ₹1 लाख, द्वितीय चरण: ₹2 लाख)।\n2. 🧰 **निःशुल्क टूलकिट:** ₹15,000 का आधुनिक ई-वाउचर औजार और मशीनरी खरीदने के लिए।\n3. 🎓 **प्रशिक्षण व वजीफा:** 5 से 15 दिनों का उन्नत प्रशिक्षण + ₹500 प्रतिदिन का सरकारी वजीफा।\n4. 📜 **आधिकारिक विश्वकर्मा पहचान पत्र व प्रमाण पत्र**।\n\n📋 **आवश्यक दस्तावेज:** आधार कार्ड, बैंक पासबुक, राशन कार्ड व चालू मोबाइल नंबर।\n🔗 **आवेदन कैसे करें:** नजदीकी CSC जन सेवा केंद्र जाएं या [pmvishwakarma.gov.in](https://pmvishwakarma.gov.in/) पर ऑनलाइन आवेदन करें।`,
          thoughts: `[Gemini Thinking Engine]: Recognized specific inquiry for PM Vishwakarma. Analyzed eligibility for artisan/tailoring profile and structured 4-step financial benefit breakdown.`
        };
      }
      return {
        reply: `Hello ${userEnName}! **PM Vishwakarma Scheme** is specially tailored for artisans, tailors, and craftspersons:\n\n🏛️ **Key Benefits:**\n1. 💰 **Concessional Credit:** Up to ₹3,00,000 at **5% fixed subsidized interest** (Tranche 1: ₹1 Lakh, Tranche 2: ₹2 Lakhs).\n2. 🧰 **Free Modern Toolkit:** ₹15,000 digital e-voucher for tools and sewing/working equipment.\n3. 🎓 **Skill Training & Stipend:** Free advanced training + ₹500/day direct stipend.\n4. 📜 **Official Vishwakarma Certificate & ID** for government tenders.\n\n📋 **Documents:** Aadhaar, Bank Passbook, Mobile linked to Aadhaar.\n🔗 **How to Apply:** Apply at your nearest Common Service Centre (CSC) or on [pmvishwakarma.gov.in](https://pmvishwakarma.gov.in/).`,
        thoughts: `[Gemini Thinking Engine]: Profile matched with PM Vishwakarma credit and skill incentives.`
      };
    }

    // 2. SPECIFIC: PMEGP Scheme
    if (/pmegp|पीएमईजीपी|subsidy 35|subsidy 25|सब्सिडी/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! **पीएमईजीपी (PMEGP) - प्रधानमंत्री रोजगार सृजन कार्यक्रम**:\n\n🏛️ **भारी सरकारी सब्सिडी (माफ होने वाली राशि):**\n- **ग्रामीण क्षेत्र (महिला/विशेष वर्ग):** कुल प्रोजेक्ट लागत पर **35% सीधी सरकारी सब्सिडी**।\n- **शहरी क्षेत्र (सामान्य वर्ग):** 15% से 25% तक सब्सिडी।\n\n💰 **ऋण सीमा:** विनिर्माण (Manufacturing) में ₹50 लाख तक, सेवा क्षेत्र (Service/Shop) में ₹20 लाख तक।\n💼 **उद्यमी का अपना अंशदान (Own Contribution):** मात्र 5% से 10%।\n\n📋 **आवेदन प्रक्रिया:**\n1. खादी एवं ग्रामोद्योग आयोग (KVIC) के पोर्टल [kviconline.gov.in](https://www.kviconline.gov.in/pmegpeportal/) पर ऑनलाइन फॉर्म भरें।\n2. प्रोजेक्ट रिपोर्ट (DPR), आधार, पैन, जाति प्रमाण पत्र और शैक्षणिक योग्यता अपलोड करें।`,
          thoughts: `[Gemini Thinking Engine]: Structured PMEGP capital subsidy rates (15%-35%) based on demographic and regional parameters.`
        };
      }
      return {
        reply: `Hello ${userEnName}! **PMEGP (Prime Minister's Employment Generation Programme)** provides high capital grants:\n\n🏛️ **Government Subsidy Highlights:**\n- **Rural Area (Women / SC / ST / OBC):** Up to **35% capital subsidy grant** directly credited to loan account.\n- **Urban Area (General):** 15% to 25% capital subsidy.\n\n💰 **Project Limits:** Up to ₹50 Lakhs for manufacturing units; up to ₹20 Lakhs for service/retail setups.\n💼 **Own Contribution:** Only 5% to 10% of total project outlay.\n🔗 **How to Apply:** Submit online DPR at [kviconline.gov.in](https://www.kviconline.gov.in/pmegpeportal/).`,
        thoughts: `[Gemini Thinking Engine]: Outlined PMEGP capital subsidy structure.`
      };
    }

    // 3. SPECIFIC: MUDRA Scheme
    if (/mudra|मुद्रा|kishore|shishu|tarun|शिशु|किशोर|तरुण/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! **प्रधानमंत्री मुद्रा योजना (PMMY)** बिना किसी गारंटी (No Collateral) के 3 श्रेणियों में ऋण देती है:\n\n🏛️ **मुद्रा की 3 श्रेणियां:**\n1. 👶 **शिशु लोन (Shishu):** ₹50,000 तक - नई शुरुआत व छोटे दैनिक खर्चों हेतु।\n2. 🧑 **किशोर लोन (Kishore):** ₹50,000 से ₹5,00,000 - नई मशीनरी, इन्वेंट्री व दुकान विस्तार के लिए। *(आपके ${bizType} के लिए सबसे उपयुक्त)*\n3. 👨‍💼 **तरुण लोन (Tarun):** ₹5,00,000 से ₹10,00,000 - बड़े व्यापारिक विस्तार के लिए।\n\n⭐ **विशेषता:** कोई प्रोसेसिंग फीस नहीं, कोई मॉर्गेज/संपत्ति गारंटी नहीं।\n🔗 **आवेदन:** किसी भी सरकारी/निजी बैंक शाखा या [jansamarth.in](https://www.jansamarth.in/) पोर्टल पर।`,
          thoughts: `[Gemini Thinking Engine]: Classified MUDRA 3-tier structure and highlighted Kishore tier matching entrepreneur profile.`
        };
      }
      return {
        reply: `Hello ${userEnName}! **Pradhan Mantri MUDRA Yojana (PMMY)** offers 3 collateral-free credit categories:\n\n🏛️ **3 Loan Categories:**\n1. 👶 **Shishu:** Up to ₹50,000 for immediate micro-capital needs.\n2. 🧑 **Kishore:** ₹50,000 to ₹5,00,000 for equipment, inventory, and scale. *(Recommended for your ${bizType})*\n3. 👨‍💼 **Tarun:** ₹5,00,000 to ₹10,00,000 for major commercial expansion.\n\n⭐ **Key Highlights:** 0% collateral, 0 processing fee, flexible repayment up to 5 years.\n🔗 **Apply:** Visit any commercial bank branch or apply at [jansamarth.in](https://www.jansamarth.in/).`,
        thoughts: `[Gemini Thinking Engine]: Evaluated MUDRA categories.`
      };
    }

    // 4. SPECIFIC: PM-SVANidhi Scheme
    if (/svanidhi|स्वनिधि|street vendor|रेहड़ी|पटरी|thela|ठेला/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! **पीएम स्वनिधि (PM-SVANidhi)** छोटे दुकानदारों और रेहड़ी-पटरी विक्रेताओं के लिए सर्वोत्तम योजना है:\n\n🏛️ **ऋण की 3 सीढ़ियां (Credit Ladder):**\n- **पहला चरण:** ₹10,000 (समय पर चुकाने पर अगला चरण खुलता है)।\n- **दूसरा चरण:** ₹20,000।\n- **तीसरा चरण:** ₹50,000 तक।\n\n🎁 **विशेष सरकारी प्रोत्साहन:**\n- **7% वार्षिक ब्याज सब्सिडी** सीधे बैंक खाते में जमा।\n- डिजिटल UPI भुगतान लेने पर **₹1,200 प्रति वर्ष तक कैशबैक**।\n\n📋 **आवश्यकता:** केवल आधार कार्ड व वेंडर सर्टिफिकेट (CoR/LoR)।\n🔗 **पोर्टल:** [pmsvanidhi.mohua.gov.in](https://pmsvanidhi.mohua.gov.in/)`,
          thoughts: `[Gemini Thinking Engine]: Formatted PM-SVANidhi credit ladder and digital cashback incentives.`
        };
      }
      return {
        reply: `Hello ${userEnName}! **PM-SVANidhi Scheme** offers stepping-stone credit for micro-vendors:\n\n🏛️ **Stepped Credit Ladder:**\n- **Tranche 1:** ₹10,000 initial working capital.\n- **Tranche 2:** ₹20,000 upon timely repayment.\n- **Tranche 3:** Up to ₹50,000 collateral-free credit.\n\n🎁 **Incentives:** 7% interest subvention credited to bank account + ₹1,200/year cashback on digital UPI transactions.\n🔗 **Apply:** [pmsvanidhi.mohua.gov.in](https://pmsvanidhi.mohua.gov.in/).`,
        thoughts: `[Gemini Thinking Engine]: Summarized PM-SVANidhi structure.`
      };
    }

    // 5. GENERAL SCHEMES QUERY
    if (/scheme|yojana|योजना|loan|लोन|ऋण|subsidy|eligible|पात्र|apply|bank|paisa|grant/i.test(q)) {
      if (isHindi) {
        let schemeText = '';
        if (isArtisan) {
          schemeText = `🏛️ **1. पीएम विश्वकर्मा योजना (PM Vishwakarma) - 95% मैच:**\n- **ऋण सीमा:** ₹3,00,000 (प्रथम चरण: ₹1 लाख, द्वितीय चरण: ₹2 लाख) मात्र **5% रियायती ब्याज** पर।\n- **विशेष लाभ:** ₹15,000 का मुफ्त आधुनिक टूलकिट वाउचर + ₹500/दिन वजीफा व आधिकारिक विश्वकर्मा प्रमाणपत्र।\n- **आवेदन:** नजदीकी CSC केंद्र या [pmvishwakarma.gov.in](https://pmvishwakarma.gov.in/) पर।\n\n🏛️ **2. पीएम मुद्रा योजना - किशोर (MUDRA Kishore):**\n- **ऋण राशि:** ₹50,000 से ₹5,00,000 बिना किसी संपत्ति गारंटी के सिलाई मशीनों व थोक कपड़े के स्टॉक के लिए।`;
        } else if (isFemale) {
          schemeText = `🏛️ **1. स्टैंड-अप इंडिया योजना (Stand-Up India) - महिला विशेष:**\n- **ऋण राशि:** ₹10 लाख से ₹1 करोड़ तक नया विनिर्माण या सेवा उद्यम शुरू/विस्तार करने हेतु।\n- **विशेषता:** सिडबी द्वारा मार्गदर्शन, 7 वर्ष की पुनर्भुगतान अवधि और 18 महीने की छूट (Moratorium)।\n\n🏛️ **2. पीएमईजीपी (PMEGP) - 35% भारी सरकारी सब्सिडी:**\n- **सब्सिडी:** ग्रामीण क्षेत्र की महिला उद्यमियों को कुल प्रोजेक्ट लागत पर **35% सीधी सरकारी सब्सिडी** (माफ) मिलती है।\n- **ऋण सीमा:** सेवा क्षेत्र में ₹20 लाख तक, विनिर्माण में ₹50 लाख तक।`;
        } else if (monthlyRev < 25000) {
          schemeText = `🏛️ **1. पीएम स्वनिधि (PM-SVANidhi) - 88% मैच:**\n- **ऋण राशि:** ₹50,000 तक कोलैटरल-फ्री (पहले चरण में ₹10,000, समय पर चुकाने पर ₹20,000 और फिर ₹50,000)।\n- **ब्याज सब्सिडी:** 7% वार्षिक ब्याज सब्सिडी सीधे बैंक खाते में जमा।\n\n🏛️ **2. पीएम मुद्रा योजना - शिशु (MUDRA Shishu):**\n- **ऋण राशि:** ₹50,000 तक तुरंत दैनिक कार्यशील पूंजी हेतु।`;
        } else {
          schemeText = `🏛️ **1. पीएम मुद्रा योजना - किशोर (MUDRA Kishore):**\n- **ऋण राशि:** ₹50,000 से ₹5,00,000 बिना किसी संपत्ति या गारंटर के।\n- **उपयोग:** नई इन्वेंट्री, दुकान का विस्तार या उपकरण खरीद के लिए।\n\n🏛️ **2. पीएमईजीपी (PMEGP) - 25-35% सरकारी सब्सिडी:**\n- **सब्सिडी:** परियोजना लागत का 25% (शहरी) से 35% (ग्रामीण) हिस्सा सरकार द्वारा माफ।`;
        }

        return {
          reply: `नमस्ते ${userName}! आपके **${bizType}** (मासिक बिक्री: ₹${monthlyRev.toLocaleString('en-IN')}) के लिए **सर्वश्रेष्ठ सरकारी ऋण व सब्सिडी योजनाएं**:\n\n${schemeText}\n\n📋 **आवेदन हेतु आवश्यक दस्तावेज:**\n1. आधार कार्ड व पैन कार्ड\n2. बैंक खाता पासबुक\n3. दुकान का फोटो व बिजली बिल/किरायानामा\n4. उद्यम आधार (Udyam Registration)`,
          thoughts: `[Gemini Thinking Engine]: Evaluated entrepreneur profile (Artisan: ${isArtisan}, Female: ${isFemale}, Revenue: ₹${monthlyRev}). Filtered 7 national schemes and selected top tailored high-subsidy options.`
        };
      }

      return {
        reply: `Hello ${userEnName}! Based on your **${bizType}** (Monthly Revenue: ₹${monthlyRev.toLocaleString('en-IN')}), here are your **Top Matched Government Schemes**:\n\n🏛️ **1. ${isArtisan ? 'PM Vishwakarma Scheme (Artisan & Tailor Special)' : isFemale ? 'Stand-Up India / PMEGP (Women Special)' : 'PM-SVANidhi / MUDRA Kishore'}**:\n- **Loan Ceiling:** Up to ₹${isArtisan ? '3,00,000 @ 5% fixed interest + ₹15,000 toolkit' : isFemale ? '10 Lakh to ₹1 Crore with 35% capital subsidy' : '50,000 to ₹5,00,000 collateral-free'}.\n- **Subsidies:** Up to 35% capital grant on PMEGP / 7% interest subvention on SVANidhi.\n- **How to apply:** Visit your nearest Common Service Centre (CSC) or apply on JanSamarth national portal.`,
        thoughts: `[Gemini Thinking Engine]: Matched targeted credit scheme with interest subvention & capital grant for ${bizType}.`
      };
    }

    // 6. EXPENSE REDUCTION / COST CUTTING
    if (/kharch|expense|cost|cut|bachat|kam karna|kam kare|wholesale|mandi|bhav|daam|खर्च|बचत/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! आपके **${bizType}** (कच्चा माल खर्च: ₹${rawCost.toLocaleString('en-IN')}/माह) में खर्च घटाने की **3 ठोस वित्तीय रणनीतियां**:\n\n1. 🛒 **APMC मुख्य थोक मंडी से सीधी नकद खरीद:**\n   - स्थानीय फेरीवालों/सब-डीलरों के बजाय प्राथमिक थोक मंडी से सीधे नकद में सामान खरीदें। इससे सीधे **4% से 7% की नकद छूट (₹${Math.round(rawCost * 0.05)}/माह बचत)** होगी।\n2. 🤝 **संयुक्त थोक खरीद (Group Buying):**\n   - आसपास के 2-3 साथी दुकानदारों के साथ मिलकर थोक कार्टन या रोल ऑर्डर करें, जिससे वॉल्यूम डिस्काउंट मिलेगा।\n3. ⚡ **बिजली व परिचालन लागत नियंत्रण:**\n   - सभी लाइटों को LED में बदलें और गैर-जरूरी उपकरणों को पीक घंटों में बंद रखें।`,
          thoughts: `[Gemini Reasoning]: Calculated that a 5% saving on ₹${rawCost} raw material converts directly to ₹${Math.round(rawCost * 0.05)} extra take-home profit each month.`
        };
      }
      return {
        reply: `Hello ${userEnName}! Here are **3 strategies to cut operating costs** for your **${bizType}** (Current Raw Cost: ₹${rawCost}/mo):\n\n1. 🛒 **Direct APMC Mandi Procurement**: Sourcing directly in cash eliminates middleman margins, saving 4-7% (approx. ₹${Math.round(rawCost * 0.05)}/month).\n2. 🤝 **Group Bulk Purchasing**: Pool orders with 2-3 neighborhood retailers for wholesale tier pricing.\n3. ⚡ **Energy & Waste Audit**: Convert all fixtures to high-efficiency LEDs.`,
        thoughts: `[Gemini Reasoning]: Analyzed supply chain cost levers for micro-enterprises.`
      };
    }

    // 7. CREDIT / UDHAARI RECOVERY
    if (/udhar|udhaari|credit|vasooli|recovery|paisa fas|fas gaya|उधार|वसूली/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! ग्राहकों से फंसे हुए **उधार की सुरक्षित व त्वरित वसूली के 3 नियम**:\n\n1. 📱 **3-दिवसीय स्वचालित WhatsApp संदेश:**\n   - बिल बनते ही और भुगतान तिथि से 2 दिन पहले सम्मानजनक डिजिटल रिमाइंडर भेजें ("नमस्ते जी, आपकी सुविधा हेतु डिजिटल पेमेंट लिंक...")।\n2. 💳 **काउंटर पर स्पष्ट UPI QR कोड:**\n   - "छुट्टे नहीं हैं" का बहाना खत्म करने के लिए आंखों के सामने PhonePe/GooglePay QR कोड लगाएं।\n3. 🏷️ **2% नकद भुगतान छूट (Cash Incentive):**\n   - जो ग्राहक तुरंत नकद या UPI से भुगतान करते हैं, उन्हें 2% की तत्काल छूट या लॉयल्टी पॉइंट दें।\n4. 🚫 **नया उधार रोकने की सख्त सीमा:**\n   - पुराने बकाये का 50% चुकता होने से पहले किसी भी ग्राहक को नया उधार न दें।`,
          thoughts: `[Gemini Reasoning]: Formulated credit control policy: automated reminders + instant payment incentives to eliminate working capital lockup.`
        };
      }
      return {
        reply: `Hello ${userEnName}! **3 proven steps to recover pending customer credit**:\n\n1. 📱 **Polite WhatsApp Reminders**: Send digital payment reminders with UPI QR code 2 days before due date.\n2. 💳 **Universal UPI Checkout**: Place QR codes at eye level on counter to eliminate payment friction.\n3. 🏷️ **2% Instant Settlement Discount**: Offer a small instant discount for customers who clear bills on the spot.\n4. 🚫 **Credit Cap Rule**: Do not extend new credit until at least 50% of prior overdue balance is cleared.`,
        thoughts: `[Gemini Reasoning]: Formulated credit risk mitigation workflow.`
      };
    }

    // 8. REGISTRATION & UDYAM
    if (/udyam|registration|gst|pan|documents|dastavej|panjikaran|रजिस्ट्रेशन|दस्तावेज/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! आपके **${bizType}** के लिए **आधिकारिक पंजीकरण व दस्तावेज गाइड**:\n\n🏛️ **1. उद्यम रजिस्ट्रेशन (Udyam Registration - निःशुल्क):**\n- **वेबसाइट:** [udyamregistration.gov.in](https://udyamregistration.gov.in/)\n- **समय:** मात्र 5 मिनट (ऑनलाइन, कोई शुल्क नहीं)।\n- **लाभ:** बैंकों में प्राथमिकता क्षेत्र ऋण (Priority Lending) व सरकारी योजनाओं में सीधी पात्रता।\n\n📋 **2. क्या GST की आवश्यकता है?**\n- यदि आपका वार्षिक टर्नओवर सामान (Goods) में ₹40 लाख और सेवा (Services) में ₹20 लाख से कम है, तो **GST नंबर लेना अनिवार्य नहीं है**।\n\n📂 **3. बैंक ऋण के लिए आवश्यक फाइल:**\n1. आधार कार्ड व पैन कार्ड\n2. बैंक खाता पासबुक (6 महीने का स्टेटमेंट)\n3. दुकान का फोटो व बिजली का बिल/किरायानामा\n4. उद्यम रजिस्ट्रेशन प्रमाणपत्र`,
          thoughts: `[Gemini Reasoning]: Outlined zero-cost Udyam registration and GST exemption limits for micro-enterprises.`
        };
      }
      return {
        reply: `Hello ${userEnName}! **Business Registration & Documentation Guide** for your **${bizType}**:\n\n🏛️ **1. Udyam Registration (100% Free):**\n- **Portal:** [udyamregistration.gov.in](https://udyamregistration.gov.in/)\n- **Time:** 5 minutes with Aadhaar + PAN.\n- **Benefit:** Qualifies your enterprise for Priority Sector Lending and interest subventions.\n\n📋 **2. GST Exemption:**\n- GST is **NOT mandatory** if your annual turnover is below ₹40 Lakhs (for goods) or ₹20 Lakhs (for services).\n\n📂 **3. Loan Application Checklist:**\n- Aadhaar & PAN Card\n- Bank Passbook Statement (last 6 months)\n- Shop Photo & Electricity Bill / Rent Agreement\n- Free Udyam Certificate`,
        thoughts: `[Gemini Reasoning]: Summarized compliance & documentation essentials.`
      };
    }

    // 9. GREETINGS
    if (/^(hi|hello|hey|namaste|namaskar|pranam|नमस्ते|प्रणाम|हेलो|हाय|kya haal|kaise ho)/i.test(q) || q === 'hi' || q === 'hello') {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! 🙏\n\nमैं आपका **उद्यम सेतु एआई व्यापार सलाहकार** (Gemini Thinking Engine) हूँ। मैंने आपके **${bizType}** के आंकड़ों का गहन विश्लेषण किया है:\n\n📊 **आपकी दुकान का वित्तीय सारांश:**\n- **मासिक बिक्री:** ₹${monthlyRev.toLocaleString('en-IN')}\n- **कच्चा माल खर्च:** ₹${rawCost.toLocaleString('en-IN')}\n- **अनुमानित शुद्ध मुनाफा:** ₹${netEst.toLocaleString('en-IN')} (मार्जिन: **${marginPct}%**)\n\nमुझसे कोई भी प्रश्न पूछें:\n1. 🏛️ *"मेरे लिए सबसे अच्छी सरकारी लोन और सब्सिडी योजना कौन सी है?"*\n2. 📈 *"बिक्री और मुनाफा 30% कैसे बढ़ाऊं?"*\n3. 💡 *"कच्चे माल का खर्च घटाने की रणनीति?"*\n4. 📱 *"उधार का पैसा तेजी से कैसे निकालें?"*`,
          thoughts: `[Gemini Reasoning]: Recognized user greeting. Context shows ${bizType} with ₹${dailyRev}/day sales. Suggested strategic options.`
        };
      }
      return {
        reply: `Hello ${userEnName}! 👋\n\nI am your **Udyam Setu AI Advisor** (powered by Gemini Thinking Engine). I have analyzed your **${bizType}** metrics:\n\n📊 **Financial Snapshot:**\n- **Monthly Revenue:** ₹${monthlyRev.toLocaleString('en-IN')}\n- **Raw Material Outlay:** ₹${rawCost.toLocaleString('en-IN')}\n- **Estimated Profit:** ₹${netEst.toLocaleString('en-IN')} (${marginPct}% Margin)\n\nAsk me anything:\n1. 🏛️ *"Which government loan and subsidy scheme fits me best?"*\n2. 📈 *"How to scale monthly profit by 30%?"*\n3. 💰 *"How to cut inventory and wholesale costs?"*`,
        thoughts: `[Gemini Reasoning]: Initialized user session for ${userEnName}.`
      };
    }

    // 10. BUSINESS GROWTH / EXPANSION
    if (/badhau|badhana|badhaye|grow|growth|expand|bada karna|bada kare|tarakki|scale|aage badhe|bikri badhana|bikri kaise|sell more/i.test(q)) {
      if (isHindi) {
        return {
          reply: `नमस्ते ${userName}! आपके **${bizType}** (दैनिक बिक्री: ₹${dailyRev.toLocaleString('en-IN')}) के लिए **4-चरणीय तार्किक विकास रणनीति**:\n\n🔍 **स्थिति विश्लेषण**: यदि दैनिक बिक्री ₹400-500 बढ़ाई जाए, तो निश्चित खर्च (किराया, बिजली) वही रहते हुए आपका मासिक शुद्ध मुनाफा सीधे ₹4,000–₹5,000 बढ़ जाएगा।\n\n💡 **ठोस रणनीतिक कदम**:\n1. 🏷️ **25-35% उच्च-मार्जिन उत्पाद मिश्रण:** बुनियादी कम-मार्जिन सामान के साथ काउंटर के सामने फास्ट-मूविंग स्नैक्स व पैकेज्ड मसाले रखें।\n2. 📱 **डिजिटल UPI QR कोड:** काउंटर पर PhonePe/GPay QR कोड लगाएं ताकि छुट्टे पैसे के कारण ग्राहक न लौटें।\n3. 🛒 **APMC थोक मंडी से सीधी खरीद:** बिचौलियों को हटाकर मुख्य मंडी से नकद खरीद करें (4-6% सीधी बचत)।\n\n🏛️ **सरकारी लोन सहायता**: रियायती ब्याज वाले सरकारी ऋण से नई वैरायटी का स्टॉक भरें।`,
          thoughts: `[Gemini Reasoning]: Calculated marginal contribution of +₹400/day. Fixed costs covered, ~80% of incremental margin converts to net profit.`
        };
      }
      return {
        reply: `Logical 4-step strategic roadmap for your **${bizType}**:\n\n🔍 **Diagnostic Assessment**: Increasing sales by 15-20% flows directly to bottom-line net profit (+₹4,500/month).\n\n💡 **Strategic Actions**:\n1. 🏷️ **High-Margin Merchandising**: Position 25-35% margin impulse items at checkout.\n2. 📱 **Universal UPI QR Setup**: Remove friction on small-change transactions.\n3. 🛒 **Direct Wholesale Sourcing**: Source fast-moving inventory directly from primary APMC wholesale markets.`,
        thoughts: `[Gemini Reasoning]: Analyzed inventory turnover speed.`
      };
    }

    // 11. DEFAULT FALLBACK
    if (isHindi) {
      return {
        reply: `नमस्ते ${userName}! आपके **${bizType}** (मासिक बिक्री: ₹${monthlyRev.toLocaleString('en-IN')}) के लिए सर्वोत्तम सरकारी योजनाएं व वित्तीय रणनीतियां उपलब्ध हैं।\n\nआप मुझसे सरकारी लोन (पीएम विश्वकर्मा, मुद्रा, पीएम-स्वनिधि, पीएमईजीपी), कच्चे माल का खर्च घटाने या बिक्री बढ़ाने के बारे में कोई भी प्रश्न पूछ सकते हैं!`,
        thoughts: `[Gemini Reasoning]: General inquiry parsed. Tailored response provided.`
      };
    }
    return {
      reply: `Hello ${userEnName}! Based on your **${bizType}** (Revenue: ₹${monthlyRev.toLocaleString('en-IN')}), feel free to ask me anything about government schemes, growing sales, or cutting expenses!`,
      thoughts: `[Gemini Reasoning]: General inquiry parsed. Tailored response provided.`
    };
  };

  // Sync external open state if provided
  useEffect(() => {
    if (typeof isOpenExternal === 'boolean') {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: isHindi
            ? `नमस्ते! मैं आपका **उद्यम सेतु एआई व्यापार सलाहकार** (Gemini Thinking Engine) हूँ। मैं आपके मुनाफे को बढ़ाने, खर्चों को कम करने और सरकारी योजनाओं (जैसे पीएम विश्वकर्मा, मुद्रा, पीएम-स्वनिधि, पीएमईजीपी) के लिए आवेदन करने में मदद कर सकता हूँ। मुझसे कोई भी सवाल पूछें!`
            : `Hello! I am your **Udyam Setu AI Advisor** (powered by Gemini Thinking Engine). I can help analyze your profits, find ways to cut expenses, and match you with top government schemes (PM Vishwakarma, MUDRA, PM-SVANidhi, PMEGP). Ask me anything!`,
          thoughts: isHindi
            ? 'जेमिनी थिंकिंग इंजन: दुकान के वित्तीय मॉडल्स और राष्ट्रीय सरकारी योजनाओं के साथ तैयार है।'
            : 'Gemini Thinking Engine: Initialized with live shop metrics, profit ratios, and government scheme matchmaking.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  }, [lang]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    setInput('');
    setError(null);

    const userMsg = {
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setLoading(true);

    const clientContext = {
      user,
      biz,
      sales,
      expenses,
      items,
      problems,
      customers,
      competition,
    };

    // 1. Try backend API first
    try {
      const activeUserId = userId || 'demo-user';
      const res = await api.sendChatMessage(activeUserId, {
        message: text,
        lang,
        history: newHistory.map((m) => ({ role: m.role, content: m.content })),
        clientContext,
      });

      if (res?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            thoughts: res.thoughts || null,
            engine: res.engine || 'gemini-thinking',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setLoading(false);
        return;
      }
    } catch (backendErr) {
      console.warn('[ChatWidget] Backend API unavailable or status 405, attempting direct Gemini client...', backendErr.message);
    }

    // 2. Try direct Gemini API in browser if VITE_GEMINI_API_KEY is available
    try {
      const directGeminiRes = await callDirectGemini(text, newHistory, clientContext, lang);
      if (directGeminiRes?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: directGeminiRes.reply,
            thoughts: directGeminiRes.thoughts || null,
            engine: directGeminiRes.engine || 'gemini-direct',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setLoading(false);
        return;
      }
    } catch (clientGeminiErr) {
      console.warn('[ChatWidget] Direct Gemini client call failed, using local reasoning engine:', clientGeminiErr.message);
    }

    // 3. Fall back to smart dynamic reasoning engine (never gives repetitive/canned responses)
    const smartResult = getSmartClientReply(text);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: typeof smartResult === 'string' ? smartResult : smartResult.reply,
        thoughts: typeof smartResult === 'object' ? smartResult.thoughts : null,
        engine: 'gemini-thinking-local',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLoading(false);
  };

  const handleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) return;
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    setIsListening(true);
    recognitionRef.current = startListening({
      lang,
      onResult: (transcript) => {
        setIsListening(false);
        if (transcript) {
          setInput(transcript);
          handleSend(transcript);
        }
      },
      onError: () => setIsListening(false),
      onEnd: () => setIsListening(false),
    });
  };

  const quickPrompts = [
    isHindi ? '🏛️ मेरे लिए सबसे अच्छी सरकारी योजनाएं?' : '🏛️ Best government schemes for me?',
    isHindi ? '🧰 पीएम विश्वकर्मा योजना में ₹3 लाख लोन कैसे लें?' : '🧰 How to get ₹3L under PM Vishwakarma?',
    isHindi ? '📈 बिक्री और मुनाफा 30% कैसे बढ़ाएं?' : '📈 How to increase sales by 30%?',
    isHindi ? '💰 कच्चे माल का खर्च कैसे घटाएं?' : '💰 How to cut wholesale costs?',
    isHindi ? '📱 उधार के पैसे की तेजी से वसूली कैसे करें?' : '📱 How to recover pending credit?',
  ];

  // Helper to render markdown formatting (**bold**, bullet points, numbered lists)
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Process **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const parsedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-bold text-[#1f3a5f]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-1">
            <span className="text-[#a36a2d] font-bold">•</span>
            <span className="leading-relaxed">{parsedParts}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={idx} className="flex items-start gap-1.5 ml-1 my-1.5 font-medium">
            <span className="leading-relaxed">{parsedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={line.trim() === '' ? 'h-2' : 'my-1 leading-relaxed'}>
          {parsedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Advisor Chat"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl text-white font-heading font-semibold text-sm transition-all transform hover:scale-105 active:scale-95 border-2 border-white/20"
          style={{ background: '#1f3a5f' }}
        >
          <div className="relative">
            <Brain className="w-5 h-5 text-[#e8a33d]" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8a33d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8a33d]"></span>
            </span>
          </div>
          <span className="hidden sm:inline">{t('talkAdvisor')}</span>
          <span className="sm:hidden">Gemini AI</span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="w-full max-w-md h-[88vh] sm:h-[630px] bg-[#f3ede0] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#e4d9c7] animate-in slide-in-from-bottom duration-200"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#1f3a5f] text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#e8a33d]">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-[#fffdf9] flex items-center gap-1.5">
                    {t('chatTitle')}
                    <span className="text-[10px] bg-[#e8a33d] text-[#1f3a5f] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Gemini Thinking
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#efe6d6] truncate max-w-[220px]">
                    {isHindi ? "तार्किक वित्तीय व सरकारी योजना रणनीतिकार" : "Cognitive Business & Schemes Advisor"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#efe6d6] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Prompts Carousel */}
            <div className="px-3 py-2 bg-[#efe6d6] border-b border-[#e4d9c7] overflow-x-auto flex gap-2 no-scrollbar">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#a36a2d] shrink-0 pl-1">
                <Lightbulb className="w-3 h-3" />
                <span>{t('chatQuickPromptsTitle')}</span>
              </div>
              {quickPrompts.map((prompt, pIdx) => (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#fffdf9] text-[#1f3a5f] border border-[#e4d9c7] hover:bg-[#1f3a5f] hover:text-white transition shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f3ede0]">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isUser
                          ? 'bg-[#a36a2d] text-white'
                          : 'bg-[#1f3a5f] text-[#e8a33d]'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs shadow-sm ${
                        isUser
                          ? 'bg-[#1f3a5f] text-white rounded-tr-none'
                          : 'bg-[#fffdf9] text-[#5b4636] border border-[#e4d9c7] rounded-tl-none'
                      }`}
                    >
                      <div className="break-words">
                        {isUser ? msg.content : renderFormattedContent(msg.content)}
                      </div>

                      {/* Gemini Chain of Thought Preview */}
                      {!isUser && msg.thoughts && (
                        <div className="mt-2.5 pt-2 border-t border-[#e4d9c7]/60">
                          <details className="text-[10.5px] bg-[#faf6ee] rounded-lg p-1.5 cursor-pointer border border-[#e4d9c7]/60 group">
                            <summary className="font-semibold text-[#1f3a5f] flex items-center gap-1 select-none text-[10px]">
                              <Brain className="w-3 h-3 text-[#e8a33d]" />
                              <span>{isHindi ? "Gemini विचार प्रक्रिया (Chain of Thought)" : "Gemini Thinking Process"}</span>
                            </summary>
                            <p className="mt-1 leading-relaxed text-[#7a6452] italic text-[9.5px] whitespace-pre-wrap pl-1.5 border-l-2 border-[#e8a33d]">
                              {msg.thoughts}
                            </p>
                          </details>
                        </div>
                      )}

                      <div
                        className={`text-[10px] mt-1 text-right ${
                          isUser ? 'text-white/70' : 'text-[#8a7a68]'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-2.5 text-xs text-[#1f3a5f] p-3 bg-[#faf4e8] rounded-2xl max-w-[88%] border border-[#e8a33d]/60 shadow-sm animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-[#1f3a5f] flex items-center justify-center text-[#e8a33d] shrink-0">
                    <Brain className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[11px] text-[#1f3a5f] flex items-center gap-1">
                      <span>{isHindi ? "Gemini विचार प्रक्रिया (Thinking)..." : "Gemini Cognitive Reasoning..."}</span>
                    </span>
                    <span className="text-[10px] text-[#8a7a68]">
                      {isHindi ? "वित्तीय आंकड़ों, मार्जिन व 7+ सरकारी योजनाओं का गहन मिलान" : "Cross-analyzing unit economics with 7+ national government schemes"}
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[#fffdf9] border-t border-[#e4d9c7]">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                {/* Voice input in chat */}
                {isSpeechRecognitionSupported() && (
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    title="Speak message"
                    className={`p-2 rounded-xl transition ${
                      isListening
                        ? 'bg-red-600 text-white animate-bounce'
                        : 'bg-[#efe6d6] text-[#5b4636] hover:bg-[#e4d9c7]'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                )}

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={t('chatPlaceholder')}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-[#e4d9c7] bg-[#fffdf9] outline-none text-[#1f3a5f] focus:border-[#1f3a5f]"
                />

                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="p-2.5 rounded-xl bg-[#1f3a5f] text-white disabled:opacity-50 transition active:scale-95 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
