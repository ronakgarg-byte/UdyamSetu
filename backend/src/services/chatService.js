const axios = require('axios');
const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { calculateFinancialMetrics } = require('./financialService');
const { matchSchemes, SCHEMES_MASTER } = require('./schemeMatchingService');
const { getAggregatedLocalContext } = require('./externalData/localContextAggregator');

async function getUserFullContext(userId, clientContext = {}) {
  let user = {};
  let business = {};
  let sales = {};
  let expenses = {};
  let items = [];
  let problems = [];
  let customers = [];
  let competition = {};

  if (isPostgres()) {
    try {
      const [userRes, bizRes, salesRes, expRes, itemsRes, probRes, custRes, compRes] = await Promise.all([
        pool.query('SELECT * FROM users WHERE id = $1', [userId]),
        pool.query('SELECT * FROM businesses WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM sales WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM expenses WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM items WHERE user_id = $1', [userId]),
        pool.query('SELECT problem_key FROM user_problems WHERE user_id = $1', [userId]),
        pool.query('SELECT customer_type_key FROM user_customer_types WHERE user_id = $1', [userId]),
        pool.query('SELECT * FROM competition WHERE user_id = $1', [userId]),
      ]);

      user = userRes.rows[0] || {};
      business = bizRes.rows[0] || {};
      sales = salesRes.rows[0] || {};
      expenses = expRes.rows[0] || {};
      items = itemsRes.rows || [];
      problems = probRes.rows.map((r) => r.problem_key);
      customers = custRes.rows.map((r) => r.customer_type_key);
      competition = compRes.rows[0] || {};
    } catch (err) {
      console.warn('[ChatService] PostgreSQL context query error:', err.message);
    }
  } else {
    user = inMemoryStore.users.get(userId) || {};
    business = inMemoryStore.businesses.get(userId) || {};
    sales = inMemoryStore.sales.get(userId) || {};
    expenses = inMemoryStore.expenses.get(userId) || {};
    items = inMemoryStore.items.get(userId) || [];
    problems = inMemoryStore.user_problems.filter((r) => r.userId === userId).map((r) => r.key);
    customers = inMemoryStore.user_customer_types.filter((r) => r.userId === userId).map((r) => r.key);
    competition = inMemoryStore.competition.get(userId) || {};
  }

  // Merge client context if provided (for serverless / state preservation)
  if (clientContext && typeof clientContext === 'object') {
    if (clientContext.user) user = { ...user, ...clientContext.user };
    if (clientContext.biz || clientContext.business) business = { ...business, ...(clientContext.biz || clientContext.business) };
    if (clientContext.sales) sales = { ...sales, ...clientContext.sales };
    if (clientContext.expenses) expenses = { ...expenses, ...clientContext.expenses };
    if (Array.isArray(clientContext.items) && clientContext.items.length > 0) items = clientContext.items;
    if (Array.isArray(clientContext.problems) && clientContext.problems.length > 0) problems = clientContext.problems;
    if (Array.isArray(clientContext.customers) && clientContext.customers.length > 0) customers = clientContext.customers;
    if (clientContext.competition) competition = { ...competition, ...clientContext.competition };
  }

  const financial = calculateFinancialMetrics(sales, expenses, items, problems);
  const localContext = await getAggregatedLocalContext(user.district || business.district || 'Varanasi');
  const schemes = matchSchemes(user, business, financial, problems, localContext);

  return {
    user,
    business,
    sales,
    expenses,
    items,
    problems,
    customers,
    competition,
    financial,
    schemes,
    localContext,
  };
}

function buildSystemPrompt(context, lang = 'en') {
  const { user, business, sales, expenses, items, problems, customers, competition, financial, schemes, localContext } = context;
  const isHindi = lang === 'hi';
  const marginPct = financial.revenue > 0 ? ((financial.netProfit / financial.revenue) * 100).toFixed(1) : '0';
  const expenseRatio = financial.revenue > 0 ? ((financial.totalExpenses / financial.revenue) * 100).toFixed(1) : '0';
  const dailyTargetBreakEven = Math.round((financial.totalExpenses || 0) / 26);

  // Build full detailed scheme profiles for Gemini
  const schemeDirectoryText = (schemes || SCHEMES_MASTER).map((s, idx) => {
    return `[${idx + 1}] ${s.name_en} (${s.name_hi || ''})
- Match Score: ${s.matchPercentage || 80}%
- Ministry: ${s.ministry_en || 'Govt of India'}
- Max Loan Ceiling: Up to ₹${(s.loanCeiling || 50000).toLocaleString('en-IN')}
- Government Subsidy: ${s.interestSubsidyPct > 0 ? `${s.interestSubsidyPct}% (Capital/Interest Subsidy)` : 'Collateral-free low banking interest'}
- Key Highlights: ${(s.keyBenefits_en || []).join('; ') || s.description_en}
- Official Portal: ${s.portalUrl}`;
  }).join('\n\n');

  return `You are "Udyam Setu AI Business Strategist & Financial Advisor" (उद्यम सेतु मुख्य वित्तीय व व्यापार रणनीतिकार), powered by Google Gemini Thinking & Cognitive Reasoning Engine.
Your mission is to provide deep, analytical, mathematically grounded, yet simple and empowering business consulting and government scheme guidance to micro-entrepreneurs across India (under Ministry of Social Justice & Empowerment, Problem SIH26091).

=======================================================
🧠 GEMINI COGNITIVE REASONING & ADVISORY PROTOCOL:
=======================================================
When answering the entrepreneur, follow these core principles:

1. **NO REPETITIVE OR VAGUE ANSWERS**:
   - Never output generic copy-paste text.
   - Always reference the entrepreneur's exact business type, daily sales (₹${sales.daily_sales ?? sales.dailySales ?? 0}), net profit (₹${financial.netProfit}), and expenses.

2. **DIVERSE & TAILORED GOVERNMENT SCHEMES**:
   - Compare and recommend the BEST matching schemes from the scheme directory below.
   - If they are a **Tailor, Artisan, Carpenter, Barber, Potter, or Handloom worker**: Highlight **PM Vishwakarma Scheme** (₹15,000 free toolkit + up to ₹3 Lakh loan at 5% fixed concessional interest).
   - If they are a **Woman entrepreneur or SC/ST**: Highlight **Stand-Up India** (₹10 Lakh to ₹1 Crore) and **PMEGP** (up to 35% margin subsidy).
   - If they are a **Street vendor or small micro-shop** (<₹30,000 monthly revenue): Highlight **PM-SVANidhi** (₹10k -> ₹20k -> ₹50k collateral-free with 7% interest subsidy & UPI cashback).
   - If they need **machinery, inventory bulk purchase, or shop expansion** (₹50k to ₹5 Lakhs): Highlight **Pradhan Mantri MUDRA Yojana (Kishore)**.
   - If they are setting up a **rural or manufacturing unit**: Highlight **PMEGP** (25-35% government capital grant).
   - Always state: Loan Amount, Subsidy/Interest %, Required Documents (Aadhaar, Bank Passbook, Udyam No.), and Application Steps.

3. **CONCRETE MATHEMATICAL CALCULATIONS**:
   - Show how a 15-20% uplift in daily sales drops directly to their take-home profit.
   - Show how buying from wholesale APMC Mandis cuts raw material cost by 4-7%.

=======================================================
📊 LIVE ENTREPRENEUR PROFILE & NUMBERS:
=======================================================
- Name: ${user.name || 'Entrepreneur'} (Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'})
- Location: ${user.district || business.district || 'Varanasi'}, ${user.state || business.state || 'Uttar Pradesh'}
- Business Type: ${business.type || 'Micro-Enterprise'} (Selling: ${business.what || 'Essentials'}, Workers: ${business.workers || 0}, Hours: ${business.hours || 'Standard'})
- Daily Sales: ₹${sales.daily_sales ?? sales.dailySales ?? 0} (Monthly Revenue: ₹${financial.revenue || 0})
- Operating Expenses: ₹${financial.totalExpenses}/month
  * Raw Materials/Stock: ₹${expenses.raw_materials ?? expenses.rawMaterials ?? 0}
  * Shop Rent: ₹${expenses.rent || 0}
  * Transport: ₹${expenses.transport || 0}
  * Wages: ₹${expenses.wages || 0}
  * Electricity: ₹${expenses.electricity || 0}
  * Loan Repayment / EMI: ₹${financial.emi || 0}
- Financial Ratios:
  * Net Monthly Profit: ₹${financial.netProfit} (${marginPct}% Margin)
  * Daily Break-Even Target: ₹${dailyTargetBreakEven}/day
  * Debt Risk: ${financial.riskLevel.toUpperCase()}
- Reported Challenges: ${problems.join(', ') || 'General business growth'}
- Target Customers: ${customers.join(', ') || 'Local community'}
- Competition: ${competition.count || 0} rivals in ${competition.where || 'locality'}

=======================================================
🏛️ MATCHED GOVERNMENT SCHEMES DIRECTORY:
=======================================================
${schemeDirectoryText}

=======================================================
🎯 RESPONSE GUIDELINES:
=======================================================
1. Language: ${isHindi ? 'Fluent, conversational Hindi in Devanagari script (सरल, स्पष्ट और सम्मानजनक हिन्दी)' : 'Clear, structured, highly analytical English'}.
2. Response Structure:
   - 🔍 **स्थिति विश्लेषण (Quick Diagnostic)**: 1-2 lines on their specific numbers.
   - 💡 **ठोस रणनीतिक कदम (Strategic Action Plan)**: Actionable tactics with math.
   - 🏛️ **सर्वोत्तम सरकारी योजनाएं (Top Matched Government Schemes)**: Detailed scheme recommendations with loan limits, subsidies, and exact application roadmap.
   - 📋 **आवश्यक दस्तावेज व आवेदन (Checklist & Application)**: Aadhaar, Bank Passbook, Udyam Aadhaar, and portal link.`;
}

function generateOfflineFallbackResponse(message, context, lang = 'en') {
  const isHindi = lang === 'hi';
  const query = (message || '').toLowerCase().trim();
  const { user, financial, schemes, business, expenses, sales } = context;
  const userName = user?.name ? `${user.name} जी` : (isHindi ? 'उद्यमी साथी' : 'Entrepreneur');
  const userEnName = user?.name || 'Entrepreneur';
  const bizType = business?.type || (isHindi ? 'दुकान/व्यवसाय' : 'business');
  const bizWhat = (business?.what || '').toLowerCase();
  const userGender = (user?.gender || '').toLowerCase();
  const revenue = financial.revenue || 0;
  const totalExp = financial.totalExpenses || 0;
  const netProfit = financial.netProfit || 0;
  const marginPct = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';
  const rawCost = expenses.raw_materials ?? expenses.rawMaterials ?? 0;

  // Pick top tailored schemes
  const isArtisan = /tailor|sew|cloth|boutique|carpenter|wood|iron|smith|potter|basket|weave|barber|artisan/i.test(bizWhat) || /tailor|boutique/i.test(bizType);
  const isFemale = userGender === 'female' || userGender === 'woman';

  // 1. SCHEMES & LOANS QUERY
  if (/scheme|yojana|योजना|loan|लोन|ऋण|subsidy|svanidhi|mudra|pmegp|vishwakarma|standup|cgtmse|eligible|पात्र|apply|bank|paisa/i.test(query)) {
    if (isHindi) {
      let schemeRecommendations = '';

      if (isArtisan) {
        schemeRecommendations = `🏛️ **1. पीएम विश्वकर्मा योजना (PM Vishwakarma) - 95% सर्वश्रेष्ठ मैच:**
- **किसके लिए:** सिलाई (Tailoring), कारीगर, दस्तकार और पारंपरिक हुनरमंदों के लिए।
- **ऋण राशि:** ₹3,00,000 (प्रथम चरण में ₹1 लाख, द्वितीय चरण में ₹2 लाख) मात्र **5% रियायती ब्याज दर** पर।
- **अतिरिक्त लाभ:** ₹15,000 का मुफ्त आधुनिक टूलकिट वाउचर + ₹500/दिन वजीफा और आधिकारिक विश्वकर्मा प्रमाणपत्र।
- **आवेदन:** नजदीकी CSC जन सेवा केंद्र या [pmvishwakarma.gov.in](https://pmvishwakarma.gov.in/) पर आधार व पासबुक से आवेदन करें।

🏛️ **2. पीएम मुद्रा योजना - किशोर (MUDRA Kishore):**
- **ऋण राशि:** ₹50,000 से ₹5,00,000 बिना किसी संपत्ति गारंटी के नई सिलाई मशीनों व कपड़े के थोक स्टॉक के लिए।`;
      } else if (isFemale) {
        schemeRecommendations = `🏛️ **1. स्टैंड-अप इंडिया योजना (Stand-Up India) - महिला विशेष:**
- **ऋण राशि:** ₹10 लाख से ₹1 करोड़ तक नया विनिर्माण या सेवा उद्यम शुरू/विस्तार करने के लिए।
- **विशेषता:** सिडबी (SIDBI) द्वारा विशेष मार्गदर्शन, 7 वर्ष की पुनर्भुगतान अवधि और 18 महीने की छूट (Moratorium)।
- **आवेदन:** [standupmitra.in](https://www.standupmitra.in/) या किसी भी सरकारी बैंक शाखा में।

🏛️ **2. पीएमईजीपी (PMEGP) - 35% भारी सरकारी सब्सिडी:**
- **सब्सिडी:** महिला उद्यमियों को ग्रामीण क्षेत्र में कुल प्रोजेक्ट लागत पर **35% सीधी सरकारी सब्सिडी** (माफ) मिलती है।
- **ऋण सीमा:** सेवा क्षेत्र में ₹20 लाख तक, विनिर्माण में ₹50 लाख तक।`;
      } else if (revenue < 25000) {
        schemeRecommendations = `🏛️ **1. पीएम स्वनिधि (PM-SVANidhi) - 88% मैच:**
- **ऋण राशि:** ₹50,000 तक कोलैटरल-फ्री (पहले चरण में ₹10,000, समय पर चुकाने पर ₹20,000 और फिर ₹50,000)।
- **ब्याज सब्सिडी:** 7% वार्षिक ब्याज सब्सिडी सीधे बैंक खाते में + डिजिटल लेनदेन पर ₹1,200/वर्ष कैशबैक।
- **दस्तावेज:** केवल आधार कार्ड, बैंक खाता पासबुक और वेंडर पहचान पत्र।

🏛️ **2. पीएम मुद्रा योजना - शिशु (MUDRA Shishu):**
- **ऋण राशि:** ₹50,000 तक तुरंत कार्यशील पूंजी।`;
      } else {
        schemeRecommendations = `🏛️ **1. पीएम मुद्रा योजना - किशोर (MUDRA Kishore):**
- **ऋण राशि:** ₹50,000 से ₹5,00,000 बिना किसी संपत्ति या गारंटर के।
- **उपयोग:** नई इन्वेंट्री, दुकान का विस्तार या उपकरण खरीद के लिए।

🏛️ **2. पीएमईजीपी (PMEGP) - 25-35% सरकारी सब्सिडी:**
- **सब्सिडी:** परियोजना लागत का 25% (शहरी) से 35% (ग्रामीण) हिस्सा सरकार द्वारा माफ।
- **आवेदन:** [kviconline.gov.in](https://www.kviconline.gov.in/pmegpeportal/)`;
      }

      return `नमस्ते ${userName}! आपके **${bizType}** (मासिक आय: ₹${revenue.toLocaleString('en-IN')}) के लिए **सर्वोत्तम सरकारी ऋण व सब्सिडी योजनाएं**:\n\n${schemeRecommendations}\n\n📋 **आवेदन हेतु आवश्यक दस्तावेज:**\n1. आधार कार्ड और पैन कार्ड\n2. बैंक खाता पासबुक (पिछले 6 महीने का विवरण)\n3. दुकान का फोटो और बिजली बिल/किरायानामा\n4. उद्यम आधार (Udyam Registration - निःशुल्क ऑनलाइन बनता है)`;
    }

    return `Hello ${userEnName}! Based on your **${bizType}** (Monthly Revenue: ₹${revenue.toLocaleString('en-IN')}), here are your **Top Matched Government Schemes**:\n\n🏛️ **1. ${isArtisan ? 'PM Vishwakarma Scheme (Artisan & Tailor Special)' : isFemale ? 'Stand-Up India / PMEGP (Women Special)' : 'PM-SVANidhi / MUDRA Yojana'}**:\n- **Loan Ceiling:** Up to ₹${isArtisan ? '3,00,000 @ 5% fixed interest + ₹15,000 toolkit' : isFemale ? '10 Lakh to ₹1 Crore with 35% capital subsidy' : '50,000 to ₹5,00,000 collateral-free'}.\n- **Subsidies:** Up to 35% capital grant on PMEGP / 7% interest subvention on SVANidhi.\n- **Eligibility:** Verified for micro-enterprises with minimal KYC.\n- **How to apply:** Visit your nearest Common Service Centre (CSC) or apply on the JanSamarth national credit portal.`;
  }

  // 2. GREETINGS
  if (/^(hi|hello|hey|namaste|namaskar|pranam|नमस्ते|प्रणाम|हेलो|हाय|kya haal|kaise ho)/i.test(query) || query === 'hi' || query === 'hello') {
    if (isHindi) {
      return `नमस्ते ${userName}! 🙏\n\nमैं आपका **उद्यम सेतु एआई व्यापार सलाहकार** हूँ। मैंने आपके **${bizType}** के आंकड़ों का विश्लेषण किया है:\n\n📊 **आपकी दुकान का वित्तीय रिपोर्ट कार्ड:**\n- **मासिक बिक्री:** ₹${revenue.toLocaleString('en-IN')}\n- **मासिक खर्च:** ₹${totalExp.toLocaleString('en-IN')}\n- **शुद्ध मुनाफा:** ₹${netProfit.toLocaleString('en-IN')} (शुद्ध मार्जिन: **${marginPct}%**)\n\nमुझसे कोई भी प्रश्न पूछें:\n1. 🏛️ *"मेरे लिए सबसे अच्छी सरकारी लोन और सब्सिडी योजना कौन सी है?"*\n2. 📈 *"बिक्री और मुनाफा 30% कैसे बढ़ाएं?"*\n3. 💡 *"कच्चे माल का खर्च घटाने की रणनीति?"*\n4. 📱 *"उधार का पैसा तेजी से कैसे निकालें?"*`;
    }
    return `Hello ${userEnName}! 👋\n\nI am your **Udyam Setu AI Business Strategist**. Financial snapshot for your **${bizType}**:\n- **Monthly Revenue:** ₹${revenue.toLocaleString('en-IN')}\n- **Total Expenses:** ₹${totalExp.toLocaleString('en-IN')}\n- **Net Profit:** ₹${netProfit.toLocaleString('en-IN')} (${marginPct}% Net Margin)\n\nAsk me about government loans, subsidies, cost cutting, or sales growth!`;
  }

  // 3. BUSINESS GROWTH
  if (/badhau|badhana|badhaye|grow|growth|expand|bada karna|bada kare|tarakki|scale|aage badhe|bikri badhana|bikri kaise|sell more|galla/i.test(query)) {
    if (isHindi) {
      return `नमस्ते ${userName}! आपके **${bizType}** (दैनिक बिक्री: ₹${(sales.daily_sales ?? sales.dailySales ?? 800).toLocaleString('en-IN')}) के लिए **4-चरणीय विकास रोडमैप**:\n\n1. 🏷️ **25-35% उच्च-मार्जिन उत्पाद मिश्रण:**\n   - बुनियादी कम-मार्जिन सामान के साथ काउंटर के सामने फास्ट-मूविंग स्नैक्स व पैकेज्ड मसाले रखें।\n2. 📱 **डिजिटल UPI QR कोड:**\n   - काउंटर पर GooglePay/PhonePe QR कोड लगाएं ताकि छुट्टे पैसे के अभाव में कोई ग्राहक न लौटे।\n3. 🛒 **APMC थोक मंडी से सीधी खरीद:**\n   - कच्चे माल के मासिक खर्च (₹${rawCost.toLocaleString('en-IN')}) में से बिचौलियों को हटाकर मुख्य मंडी से नकद खरीद करें (4-6% बचत)।\n4. 🏛️ **सरकारी कार्यशील पूंजी का उपयोग:**\n   - रियायती ब्याज वाले सरकारी ऋण से नई वैरायटी का स्टॉक जोड़ें।`;
    }
    return `4-step growth plan for your **${bizType}**:\n1. 🏷️ Prioritize 25-35% high-margin products.\n2. 📱 Deploy visible UPI QR codes to eliminate payment friction.\n3. 🛒 Buy direct from wholesale APMC mandis to save 4-6%.\n4. 🏛️ Leverage low-interest government working capital loans.`;
  }

  // 4. DEFAULT
  if (isHindi) {
    return `नमस्ते ${userName}! आपके **${bizType}** के लिए:\n- **मासिक आय:** ₹${revenue.toLocaleString('en-IN')}\n- **मासिक मुनाफा:** ₹${netProfit.toLocaleString('en-IN')} (${marginPct}% मार्जिन)\n\nआप मुझसे सरकारी लोन योजनाओं (पीएम स्वनिधि, मुद्रा, विश्वकर्मा, पीएमईजीपी), खर्च घटाने या बिक्री बढ़ाने के बारे में कोई भी प्रश्न पूछ सकते हैं!`;
  }
  return `Hello ${userEnName}! Based on your **${bizType}** (Revenue: ₹${revenue.toLocaleString('en-IN')}, Margin: ${marginPct}%), ask me anything about government schemes, cutting expenses, or scaling profits!`;
}

async function generateAdvisoryResponse(userId, message, lang = 'en', history = [], clientContext = {}) {
  const context = await getUserFullContext(userId, clientContext);
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // ==========================================
  // 1. PRIMARY ENGINE: GOOGLE GEMINI (Multi-Model Hierarchy)
  // ==========================================
  if (geminiKey && typeof geminiKey === 'string' && geminiKey.trim().length > 8 && geminiKey !== 'YOUR_GEMINI_API_KEY') {
    const systemPrompt = buildSystemPrompt(context, lang);

    // Format conversation history for Gemini multi-turn format
    const formattedContents = [];
    if (Array.isArray(history) && history.length > 0) {
      history.slice(-8).forEach((h) => {
        if (h.role === 'user' && h.content) {
          formattedContents.push({ role: 'user', parts: [{ text: h.content }] });
        } else if ((h.role === 'assistant' || h.role === 'model') && h.content) {
          formattedContents.push({ role: 'model', parts: [{ text: h.content }] });
        }
      });
    }
    formattedContents.push({ role: 'user', parts: [{ text: message }] });

    // Model configurations to try in sequence
    const modelConfigs = [
      // 1. Gemini 2.5 Flash with thinking
      {
        model: 'gemini-2.5-flash',
        payload: {
          contents: formattedContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { thinkingConfig: { thinkingBudget: -1 }, temperature: 0.7, maxOutputTokens: 2048 },
        },
      },
      // 2. Gemini 2.0 Flash
      {
        model: 'gemini-2.0-flash',
        payload: {
          contents: formattedContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        },
      },
      // 3. Gemini 1.5 Flash (Universal reliability)
      {
        model: 'gemini-1.5-flash',
        payload: {
          contents: formattedContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        },
      },
      // 4. Gemini 1.5 Pro
      {
        model: 'gemini-1.5-pro',
        payload: {
          contents: formattedContents,
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        },
      },
      // 5. Fallback payload with prepended system prompt for older endpoint versions
      {
        model: 'gemini-1.5-flash',
        payload: {
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n--- USER QUESTION ---\n${message}` }],
            },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        },
      },
    ];

    for (const cfg of modelConfigs) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${geminiKey.trim()}`;
        
        const gRes = await axios.post(geminiUrl, cfg.payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 12000,
        });

        const candidate = gRes.data?.candidates?.[0];
        if (candidate?.content?.parts && candidate.content.parts.length > 0) {
          let thoughts = '';
          let reply = '';

          for (const part of candidate.content.parts) {
            if (part.thought) {
              thoughts += (thoughts ? '\n' : '') + part.text;
            } else if (part.text) {
              reply += part.text;
            }
          }

          if (!reply && candidate.content.parts.length > 0) {
            reply = candidate.content.parts.map((p) => p.text).filter(Boolean).join('\n');
          }

          if (reply && reply.trim().length > 0) {
            return {
              reply: reply.trim(),
              thoughts: thoughts ? thoughts.trim() : null,
              engine: `gemini-thinking (${cfg.model})`,
            };
          }
        }
      } catch (gErr) {
        console.warn(`[ChatService] Gemini model ${cfg.model} note:`, gErr.response?.data?.error?.message || gErr.message);
      }
    }
  }

  // ==========================================
  // 2. SECONDARY ENGINE: ANTHROPIC CLAUDE
  // ==========================================
  if (anthropicKey && anthropicKey !== 'your_anthropic_api_key_here' && anthropicKey.trim().length > 10) {
    try {
      const systemPrompt = buildSystemPrompt(context, lang);
      const formattedMessages = [];
      if (Array.isArray(history)) {
        history.slice(-6).forEach((h) => {
          if (h.role === 'user' || h.role === 'assistant') {
            formattedMessages.push({ role: h.role, content: h.content });
          }
        });
      }
      formattedMessages.push({ role: 'user', content: message });

      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-sonnet-4-6',
          max_tokens: 1200,
          system: systemPrompt,
          messages: formattedMessages,
          temperature: 0.7,
        },
        {
          headers: {
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          timeout: 12000,
        }
      );

      const replyContent = response.data?.content?.[0]?.text;
      if (replyContent) {
        return {
          reply: replyContent,
          engine: 'claude-sonnet',
        };
      }
    } catch (err) {
      console.warn('[ChatService] Claude API call failed:', err.response?.data || err.message);
    }
  }

  // ==========================================
  // 3. TERTIARY ENGINE: INTELLIGENT ADAPTIVE REASONING ENGINE
  // ==========================================
  const fallbackText = generateOfflineFallbackResponse(message, context, lang);
  return {
    reply: fallbackText,
    engine: 'local-cognitive-engine',
  };
}

module.exports = {
  getUserFullContext,
  generateAdvisoryResponse,
  buildSystemPrompt,
  generateOfflineFallbackResponse,
};
