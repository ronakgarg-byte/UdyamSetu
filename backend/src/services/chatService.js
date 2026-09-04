const axios = require('axios');
const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { calculateFinancialMetrics } = require('./financialService');
const { matchSchemes } = require('./schemeMatchingService');
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

  // Merge client context if provided (for serverless environments)
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
  const localContext = await getAggregatedLocalContext(user.district || 'Varanasi');
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

  return `You are "Udyam Setu AI Business Strategist & Financial Advisor" (उद्यम सेतु मुख्य वित्तीय व व्यापार रणनीतिकार).
Your mission is to provide deep, analytical, yet simple and empowering business consulting to micro-entrepreneurs in India (under Ministry of Social Justice & Empowerment, Problem SIH26091).

=======================================================
🧠 YOUR COGNITIVE REASONING & THINKING FRAMEWORK:
=======================================================
When analyzing any query from the entrepreneur, follow these 4 mental reasoning steps before formulating your advice:

1. **FINANCIAL DIAGNOSIS & HEALTH CHECK**:
   - Evaluate their Profit Margin (${marginPct}%), Expense Drain Ratio (${expenseRatio}%), and Break-Even Gap.
   - Detect bottlenecks: Are they suffering from high raw material costs (₹${expenses.raw_materials ?? expenses.rawMaterials ?? 0}), excessive transport fees, or high informal debt?

2. **ROOT-CAUSE PROBLEM SOLVING**:
   - Connect the entrepreneur's question with their reported challenges: ${problems.join(', ') || 'General growth'}.
   - Consider their competitive pressure (${competition.count || 0} competitors nearby in ${competition.where || 'locality'}) and customer types (${customers.join(', ') || 'Local community'}).

3. **MATHEMATICAL PROJECTIONS & CONCRETE NUMBERS**:
   - Never give vague advice like "work hard" or "sell more".
   - Use concrete numbers: calculate how increasing daily sales from ₹${sales.daily_sales ?? sales.dailySales ?? 0} by 15-20% improves net monthly cash in hand.
   - Calculate exact government scheme loan benefits and interest subsidies.

4. **PHASED ACTIONABLE ROADMAP**:
   - Provide immediate quick wins (Next 48 Hours).
   - Provide structural improvements (Next 2-4 Weeks).
   - Link directly to the best matching government scheme (${schemes[0]?.name_en || 'PM-SVANidhi'}).

=======================================================
📊 LIVE ENTREPRENEUR CONTEXT:
=======================================================
- Name: ${user.name || 'Entrepreneur'} (Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'})
- Location: ${user.district || 'Varanasi'}, ${user.state || 'Uttar Pradesh'}
- Preferred Language: ${isHindi ? 'Hindi (हिन्दी)' : 'English'}
- Business Type: ${business.type || 'Micro-Enterprise'} (Selling: ${business.what || 'Essentials'}, Workers: ${business.workers || 0}, Hours: ${business.hours || 'Standard'})
- Daily Sales: ₹${sales.daily_sales ?? sales.dailySales ?? 0} (Monthly Revenue: ₹${financial.revenue || 0})
- Total Monthly Expenses: ₹${financial.totalExpenses}
  * Rent: ₹${expenses.rent || 0}
  * Raw Materials/Inventory: ₹${expenses.raw_materials ?? expenses.rawMaterials ?? 0}
  * Transport: ₹${expenses.transport || 0}
  * Wages: ₹${expenses.wages || 0}
  * Electricity: ₹${expenses.electricity || 0}
  * Other: ₹${expenses.other || 0}
- Financial Metrics:
  * Net Monthly Profit: ₹${financial.netProfit} (${marginPct}% Net Margin)
  * Cash In Hand: ₹${financial.cashFlow}
  * Daily Break-Even Target: ₹${dailyTargetBreakEven} per day
  * Working Capital Locked in Stock: ₹${financial.workingCapital}
  * Debt Burden Level: ${financial.riskLevel.toUpperCase()} (EMI: ₹${financial.emi}/month)
- Listed Inventory Items: ${items.map((it) => `${it.desc || it.description} (Sell: ₹${it.sell_price ?? it.sellPrice}, Cost: ₹${it.cost_price ?? it.costPrice})`).join('; ') || 'General essentials'}
- Target Customers: ${customers.join(', ') || 'Local neighborhood'}
- Competition: ${competition.count || 0} rivals in ${competition.where || 'same area'}
- Best Matching Government Schemes:
${schemes.slice(0, 3).map((s, idx) => `  ${idx + 1}. ${s.name_en} (${s.matchPercentage}% match) -> Loan: Up to ₹${s.loanCeiling}, Subsidy: ${s.interestSubsidyPct}%, Portal: ${s.portalUrl}`).join('\n')}
- Mandi / GIS Intelligence: ${localContext?.district || 'Varanasi'} Mandi Sentiment: ${localContext?.mandiEconomics?.sentiment || 'Steady'}.

=======================================================
🎯 RESPONSE GUIDELINES:
=======================================================
1. Language: ${isHindi ? 'Conversational Hindi in Devanagari script (सरल और सम्मानजनक हिन्दी)' : 'Clear, conversational English'}.
2. Tone: Respectful, encouraging, highly analytical yet accessible to someone without formal accounting background.
3. Structure:
   - 🔍 **स्थिति विश्लेषण (Quick Diagnosis)**: Brief 1-2 sentence assessment of their current metric.
   - 💡 **ठोस रणनीतिक कदम (Step-by-Step Action Plan)**: 3-4 bullet points with specific math and tactics.
   - 🏛️ **सरकारी सहायता व अगला कदम (Recommended Scheme & Next Action)**: Specific scheme recommendation with exact application instructions.`;
}

function generateOfflineFallbackResponse(message, context, lang = 'en') {
  const isHindi = lang === 'hi';
  const query = (message || '').toLowerCase().trim();
  const { user, financial, schemes, business, expenses } = context;
  const userName = user?.name ? `${user.name} जी` : (isHindi ? 'उद्यमी साथी' : 'Entrepreneur');
  const userEnName = user?.name || 'Entrepreneur';
  const bizType = business?.type || (isHindi ? 'दुकान/व्यवसाय' : 'business');
  const revenue = financial.revenue || 0;
  const totalExp = financial.totalExpenses || 0;
  const netProfit = financial.netProfit || 0;
  const marginPct = revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0';
  const dailyTarget = Math.round(totalExp / 26);
  const topScheme = schemes[0] || {
    name_en: 'PM-SVANidhi',
    name_hi: 'पीएम स्वनिधि',
    matchPercentage: 88,
    loanCeiling: 50000,
    portalUrl: 'https://pmsvanidhi.mohua.gov.in/',
  };

  // 1. GREETINGS
  if (/^(hi|hello|hey|namaste|namaskar|pranam|नमस्ते|प्रणाम|हेलो|हाय|kya haal|kaise ho)/i.test(query) || query === 'hi' || query === 'hello') {
    if (isHindi) {
      return `नमस्ते ${userName}! 🙏\n\nमैं आपका **उद्यम सेतु एआई व्यापार विश्लेषक** हूँ। मैंने आपके **${bizType}** के सभी आंकड़ों का विश्लेषण किया है:\n\n📊 **आपकी दुकान की वर्तमान वित्तीय स्थिति:**\n- **मासिक बिक्री:** ₹${revenue.toLocaleString('en-IN')}\n- **मासिक खर्च:** ₹${totalExp.toLocaleString('en-IN')}\n- **शुद्ध मुनाफा:** ₹${netProfit.toLocaleString('en-IN')} (${marginPct}% मार्जिन)\n- **सर्वश्रेष्ठ योजना:** **${topScheme.name_hi || topScheme.name_en}** (${topScheme.matchPercentage}% मैच)\n\nमुझसे कोई भी प्रश्न पूछें, जैसे:\n1. 📈 *"बिक्री और मुनाफा 30% कैसे बढ़ाएं?"*\n2. 🏛️ *"पीएम स्वनिधि / मुद्रा लोन के लिए आवेदन कैसे करें?"*\n3. 💡 *"कच्चे माल का खर्च कैसे घटाएं?"*\n4. 📱 *"उधार के पैसे की तेजी से वसूली कैसे करें?"*`;
    }
    return `Hello ${userEnName}! 👋\n\nI am your **Udyam Setu AI Business Strategist**. Here is the live diagnostic snapshot of your **${bizType}**:\n\n📊 **Financial Health Snapshot:**\n- **Monthly Revenue:** ₹${revenue.toLocaleString('en-IN')}\n- **Monthly Operating Expenses:** ₹${totalExp.toLocaleString('en-IN')}\n- **Net Profit:** ₹${netProfit.toLocaleString('en-IN')} (${marginPct}% Net Margin)\n- **Top Matched Scheme:** **${topScheme.name_en}** (${topScheme.matchPercentage}% eligibility)\n\nAsk me anything:\n1. 📈 *"How to increase sales and profit by 30%?"*\n2. 🏛️ *"How to apply for government working capital loans?"*\n3. 💰 *"How to cut inventory & wholesale costs?"*`;
  }

  // 2. BUSINESS GROWTH / EXPANSION ("Mei business ko badhau kaise")
  if (
    /badhau|badhana|badhaye|grow|growth|expand|bada karna|bada kare|tarakki|scale|aage badhe|bikri badhana|bikri kaise|sell more|galla/i.test(query)
  ) {
    if (isHindi) {
      return `नमस्ते ${userName}! आपके **${bizType}** की वित्तीय स्थिति (वर्तमान बिक्री: ₹${revenue.toLocaleString('en-IN')}/माह, मुनाफा: ₹${netProfit.toLocaleString('en-IN')}) के आधार पर **व्यापार वृद्धि की 4-चरणीय रणनीति**:\n\n1. 🏷️ **उच्च-मार्जिन (High-Margin) उत्पाद मिश्रण:**\n   - कम मार्जिन वाले बुनियादी सामान के साथ 25-35% मार्जिन वाले पैकेज्ड मसाले, ड्राई स्नैक्स और आवश्यक सप्लीमेंट्स को आगे काउंटर पर रखें।\n   - इससे बिना अतिरिक्त दुकान खर्च के आपका मुनाफा सीधे 5-8% बढ़ जाएगा।\n\n2. 📱 **डिजिटल भुगतान (UPI QR) + त्वरित नकद छूट:**\n   - दुकान पर GooglePay/PhonePe QR कोड को आंखों के सामने लगाएं।\n   - तुरंत डिजिटल भुगतान पर ग्राहकों को छुट्टे पैसे की परेशानी से बचाएं और बैंक में डिजिटल टर्नओवर रिकॉर्ड बनाएं जिससे आगे बड़े लोन आसानी से मिलें।\n\n3. 🛒 **थोक मंडी से सीधी खरीद (APMC Mandi Sourcing):**\n   - अपने मासिक कच्चे माल खर्च (₹${(expenses.raw_materials ?? expenses.rawMaterials ?? 0).toLocaleString('en-IN')}) में से बिचौलियों को हटाकर सीधे मुख्य APMC मंडी से हफ्ते में 1 बार नकद खरीद करें। इससे सीधे ₹1,500–₹3,000 की मासिक बचत होगी।\n\n4. 🏛️ **${topScheme.name_hi || topScheme.name_en} से कार्यशील पूंजी का विस्तार:**\n   - इस योजना से ₹${(topScheme.loanCeiling || 50000).toLocaleString('en-IN')} तक की पूंजी लेकर नई वैरायटी का स्टॉक लाएं। 7% ब्याज सब्सिडी के साथ यह लगभग मुफ्त पूंजी के समान है।`;
    }
    return `Here is a structured 4-step strategic growth roadmap for your **${bizType}** (Current Revenue: ₹${revenue.toLocaleString('en-IN')}, Net Margin: ${marginPct}%):\n\n1. 🏷️ **Optimize High-Margin Product Mix:**\n   - Shift inventory weight towards 25–35% margin products (packaged goods, premium staples, fast-moving consumer items).\n   - This lifts net monthly profits without increasing shop rent or overhead.\n\n2. 📱 **Implement Digital QR Footprint:**\n   - Prominently display UPI QR codes to eliminate loose change friction and create a digital transaction ledger that unlocks faster bank credit.\n\n3. 🛒 **Direct APMC Wholesale Sourcing:**\n   - Streamline raw material purchases (currently ₹${(expenses.raw_materials ?? expenses.rawMaterials ?? 0).toLocaleString('en-IN')}/month) by buying in bulk directly from wholesale APMC mandis on cash discounts (saving 4–6% on COGS).\n\n4. 🏛️ **Leverage ${topScheme.name_en} Working Capital:**\n   - Inject up to ₹${(topScheme.loanCeiling || 50000).toLocaleString('en-IN')} into fast-turnover inventory with a 7% interest subsidy directly credited to your bank account.`;
  }

  // 3. CUSTOMERS & FOOTFALL ("Grahak kaise laye", "footfall", "bikri kam")
  if (/grahak|customer|footfall|log nahi|bikri kam|traffic|bheed/i.test(query)) {
    if (isHindi) {
      return `दुकान पर ग्राहकों की संख्या और दैनिक बिक्री बढ़ाने के 4 अचूक तरीके:\n\n1. 🏪 **काउंटर विजिबिलिटी (Front Display):** सबसे ज्यादा बिकने वाले रंग-बिरंगे और जरूरी सामान को दुकान के प्रवेश द्वार पर रखें ताकि सड़क से आते-जाते लोगों का ध्यान आकर्षित हो।\n2. ⏱️ **पीक ऑवर्स में पूरी उपलब्धता:** सुबह 7:30–10:30 और शाम 5:30–9:30 बजे के बीच दुकान में कभी स्टॉक की कमी न होने दें।\n3. 📲 **स्थानीय व्हाट्सएप ऑर्डरिंग (500m दायरा):** आस-पास के 50-100 परिवारों का व्हाट्सएप ग्रुप या ब्रॉडकास्ट बनाएं जहां वे घर बैठे ऑर्डर भेज सकें।\n4. 🤝 **लॉयल्टी छूट (Loyalty Incentive):** नियमित ग्राहकों को ₹500 की खरीदारी पर ₹15-20 की तत्काल छूट या छोटा उपयोगी गिफ्ट दें।`;
    }
    return `4 targeted tactics to boost customer footfall for your **${bizType}**:\n\n1. 🏪 **Front Counter Merchandising:** Place high-demand visual goods at eye level near the entrance to capture pedestrian foot traffic.\n2. ⏱️ **Peak-Hour Stock Readiness:** Maximize inventory availability during the 7:30–10:30 AM and 5:30–9:30 PM peak retail windows.\n3. 📲 **Hyperlocal WhatsApp Delivery (500m):** Enable nearby households to send shopping lists via WhatsApp for rapid curbside pickup or delivery.\n4. 🤝 **Repeat Customer Loyalty:** Offer a modest instant reward (e.g. 3% off on bills over ₹500) to incentivize regular weekly visits.`;
  }

  // 4. UDHAAR / CREDIT MANAGEMENT & RECOVERY ("Udhar fas gaya", "credit recovery")
  if (/udhar|udhari|credit|khata|bahi|paisa fas|recovery/i.test(query)) {
    if (isHindi) {
      return `उधार का पैसा निकालने और भविष्य में नुकसान से बचने की 3 ठोस रणनीतियां:\n\n1. 🛑 **सख्त क्रेडिट सीमा (Hard Credit Cap):** किसी भी ग्राहक को उसकी पिछली बकाया राशि चुकता होने तक ₹500 से अधिक का नया उधार कतई न दें।\n2. 💸 **नकद/UPI पर त्वरित छूट:** ग्राहकों को प्रेरित करें: *"तुरंत नकद या UPI देने पर ₹5 की सीधी छूट"*, जिससे 70% ग्राहक तुरंत भुगतान करेंगे।\n3. 📲 **महीने की 1-5 तारीख को डिजिटल बिल सारांश:** वेतन के दिनों में ग्राहकों को व्हाट्सएप पर सम्मानपूर्वक बकाया राशि का विवरण भेजें।`;
    }
    return `3 rules to recover pending credit & protect your cash flow:\n\n1. 🛑 **Hard Credit Ceiling:** Set a strict ₹500–₹1,000 cap per customer with a rule that no new credit is issued until previous balances are cleared.\n2. 💸 **Instant Cash/UPI Discount:** Offer a 1–2% instant billing discount for immediate payments to encourage prompt settlement.\n3. 📲 **Scheduled Month-Start Reminders:** Send polite WhatsApp account summaries between the 1st and 5th of every month when salaries are credited.`;
  }

  // 5. GOVERNMENT SCHEMES & LOANS ("scheme", "loan", "yojana", "subsidy", "svanidhi", "mudra", "pmegp")
  if (/scheme|yojana|योजना|loan|लोन|ऋण|subsidy|svanidhi|mudra|pmegp|vishwakarma|eligible|पात्र|apply|bank/i.test(query)) {
    if (isHindi) {
      return `नमस्ते ${userName}! आपके व्यवसाय के लिए **सर्वश्रेष्ठ सरकारी वित्तीय योजनाएं**:\n\n🏛️ **1. ${topScheme.name_hi || topScheme.name_en} (${topScheme.matchPercentage}% पात्रता मैच)**:\n- **ऋण राशि:** ₹${(topScheme.loanCeiling || 50000).toLocaleString('en-IN')} (प्रथम चरण में ₹10,000, समय पर चुकाने पर ₹20,000 और फिर ₹50,000)\n- **ब्याज सब्सिडी:** 7% वार्षिक ब्याज सब्सिडी सीधे बैंक खाते में।\n- **गारंटी:** शून्य (किसी संपत्ति या गारंटर की आवश्यकता नहीं)।\n- **आवश्यक दस्तावेज:** आधार कार्ड, बैंक खाता पासबुक और दुकान/विक्रेता पहचान पत्र।\n- **आवेदन प्रक्रिया:** नजदीकी जन सेवा केंद्र (CSC) या [आधिकारिक पोर्टल](${topScheme.portalUrl}) पर जाएं।\n\n🏛️ **2. पीएम मुद्रा योजना (शिशु/किशोर):** ₹50,000 से ₹5 लाख तक का उपकरण व स्टॉक ऋण।`;
    }
    return `Based on your profile, here are your top matched **Government Financial Schemes**:\n\n🏛️ **1. ${topScheme.name_en} (${topScheme.matchPercentage}% Match)**:\n- **Loan Ceiling:** Up to ₹${(topScheme.loanCeiling || 50000).toLocaleString('en-IN')} (Collateral-free working capital in progressive tranches of ₹10k, ₹20k, and ₹50k).\n- **Interest Subsidy:** 7% annual interest subsidy directly credited to your savings bank account.\n- **Required KYC:** Aadhaar card, bank passbook, and basic vendor/shop proof.\n- **Application Method:** Visit any local public sector bank branch or Common Service Centre (CSC).\n\n🏛️ **2. Pradhan Mantri MUDRA Yojana (Shishu/Kishore):** For expanding business assets and equipment up to ₹5,00,000.`;
  }

  // 6. EXPENSES & COST CUTTING ("kharch", "expense", "cost", "wholesale", "mandi")
  if (/expense|kharch|खर्च|cost|लागत|reduce|kam|bachat|save|rent|kiraya|wholesale|kaccha maal|mandi/i.test(query)) {
    if (isHindi) {
      return `आपके व्यवसाय का कुल मासिक खर्च **₹${totalExp.toLocaleString('en-IN')}** है।\n\nखर्च में 15% की कमी लाने के 3 प्रमुख उपाय:\n\n1. 🛒 **थोक APMC मंडी से सीधी साझेदारी:**\n   - कच्चे माल का वर्तमान खर्च ₹${(expenses.raw_materials ?? expenses.rawMaterials ?? 0).toLocaleString('en-IN')} है। स्थानीय बिचौलियों के बजाय सीधे मुख्य मंडी से नकद में माल लेने पर 4-7% की बचत होगी।\n2. 🚚 **लॉजिस्टिक्स और परिवहन का पुनर्गठन:**\n   - दैनिक परिवहन खर्च (₹${(expenses.transport || 0).toLocaleString('en-IN')}) को कम करने के लिए हफ्ते में सिर्फ 1-2 बार बड़ा स्टॉक लाएं।\n3. 📦 **इन्वेंट्री डैमेज व लीकेज रोकथाम:**\n   - खराब होने वाली वस्तुओं को ठंडी, सूखी जगह पर रखें और 'पहले आया, पहले बिका' (FIFO) नियम का पालन करें।`;
    }
    return `Your total monthly business expenses stand at **₹${totalExp.toLocaleString('en-IN')}**.\n\n3 high-impact cost reduction measures:\n\n1. 🛒 **Direct APMC Wholesale Procurement:**\n   - Your current raw material expense is ₹${(expenses.raw_materials ?? expenses.rawMaterials ?? 0).toLocaleString('en-IN')}. Bypassing intermediaries and purchasing in bulk with cash discounts reduces input costs by 4–7%.\n2. 🚚 **Logistics Consolidation:**\n   - Reduce transport trips from daily to bi-weekly, saving recurring freight and fuel expenses.\n3. 📦 **Inventory Spoilage Prevention:**\n   - Enforce First-In-First-Out (FIFO) shelf stocking for perishable goods to prevent dead inventory write-offs.`;
  }

  // 7. PROFIT & MARGINS ("profit", "munafa", "margin", "income")
  if (/profit|munafa|मुनाफा|margin|fayda|kamai|income|net profit/i.test(query)) {
    if (isHindi) {
      return `📊 **आपकी दुकान का लाभ विश्लेषण (Profit & Margin Breakdown):**\n- **मासिक कुल बिक्री:** ₹${revenue.toLocaleString('en-IN')}\n- **कुल परिचालन खर्च:** ₹${totalExp.toLocaleString('en-IN')}\n- **शुद्ध मुनाफा:** ₹${netProfit.toLocaleString('en-IN')} (शुद्ध मार्जिन: **${marginPct}%**)\n- **दैनिक ब्रेक-ईवन लक्ष्य:** ₹${dailyTarget.toLocaleString('en-IN')} प्रति दिन\n\n🎯 **मुनाफा दोगुना करने का फॉर्मूला:**\n- यदि आप दैनिक बिक्री को ₹${Math.round(revenue / 30)} से बढ़ाकर ₹${Math.round((revenue / 30) * 1.25)} कर लेते हैं, तो आपका मासिक शुद्ध मुनाफा ₹${Math.round(netProfit * 1.5).toLocaleString('en-IN')} हो जाएगा।\n- उच्च-मार्जिन वाले नए उत्पाद जोड़ें और आपूर्तिकर्ताओं से 2% नकद छूट मांगें।`;
    }
    return `📊 **Profit & Margin Performance:**\n- **Monthly Revenue:** ₹${revenue.toLocaleString('en-IN')}\n- **Total Operating Costs:** ₹${totalExp.toLocaleString('en-IN')}\n- **Net Monthly Profit:** ₹${netProfit.toLocaleString('en-IN')} (Net Margin: **${marginPct}%**)\n- **Daily Break-Even Target:** ₹${dailyTarget.toLocaleString('en-IN')}/day\n\n🎯 **Margin Expansion Formula:**\n- Increasing average daily sales from ₹${Math.round(revenue / 30)} to ₹${Math.round((revenue / 30) * 1.25)} will scale your monthly take-home profit to ₹${Math.round(netProfit * 1.5).toLocaleString('en-IN')}.\n- Prioritize higher margin items and negotiate 1–2% early cash settlement discounts with wholesalers.`;
  }

  // 8. DEFAULT REASONING SUMMARY
  if (isHindi) {
    return `नमस्ते ${userName}! आपके **${bizType}** के वित्तीय विश्लेषण के अनुसार:\n- **मासिक आय:** ₹${revenue.toLocaleString('en-IN')}\n- **मासिक खर्च:** ₹${totalExp.toLocaleString('en-IN')}\n- **शुद्ध मुनाफा:** ₹${netProfit.toLocaleString('en-IN')} (${marginPct}% मार्जिन)\n- **सर्वोत्तम योजना:** ${topScheme.name_hi || topScheme.name_en}\n\nआप मुझसे व्यवसाय बढ़ाने, खर्च घटाने, लोन आवेदन, उधार वसूली या ग्राहक बढ़ाने के बारे में कोई भी प्रश्न पूछ सकते हैं!`;
  }

  return `Hello ${userEnName}! Based on the diagnostic analysis of your **${bizType}**:\n- **Monthly Revenue:** ₹${revenue.toLocaleString('en-IN')}\n- **Monthly Operating Expenses:** ₹${totalExp.toLocaleString('en-IN')}\n- **Net Profit:** ₹${netProfit.toLocaleString('en-IN')} (${marginPct}% Net Margin)\n- **Recommended Scheme:** ${topScheme.name_en}\n\nAsk me any question about growing sales, cutting costs, applying for loans, or managing customer credit!`;
}

async function generateAdvisoryResponse(userId, message, lang = 'en', history = [], clientContext = {}) {
  const context = await getUserFullContext(userId, clientContext);
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

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
          max_tokens: 1000,
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
      if (replyContent) return replyContent;
    } catch (err) {
      console.warn('[ChatService] Claude API call failed:', err.response?.data || err.message);
    }
  }

  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      const systemPrompt = buildSystemPrompt(context, lang);
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const contents = [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }],
        },
      ];

      const gRes = await axios.post(geminiUrl, { contents }, { timeout: 10000 });
      const gText = gRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (gText) return gText;
    } catch (gErr) {
      console.warn('[ChatService] Gemini API call failed:', gErr.response?.data || gErr.message);
    }
  }

  return generateOfflineFallbackResponse(message, context, lang);
}

module.exports = {
  getUserFullContext,
  generateAdvisoryResponse,
  buildSystemPrompt,
  generateOfflineFallbackResponse,
};
