const axios = require('axios');
const { pool, inMemoryStore, isPostgres } = require('../config/db');
const { calculateFinancialMetrics } = require('./financialService');
const { matchSchemes } = require('./schemeMatchingService');
const { getAggregatedLocalContext } = require('./externalData/localContextAggregator');

async function getUserFullContext(userId) {
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

  // Calculate financial health metrics
  const financial = calculateFinancialMetrics(sales, expenses, items, problems);

  // Fetch local GIS & mandi context
  const localContext = await getAggregatedLocalContext(user.district || 'Varanasi');

  // Match government schemes
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

  return `You are "Udyam Setu AI Advisor" (उद्यम सेतु सलाहकार), an intelligent, empathetic, and hyper-practical business & financial assistant created for rural micro-entrepreneurs in India under the Ministry of Social Justice & Empowerment (Problem SIH26091).

YOUR AUDIENCE:
Micro-entrepreneurs (street vendors, kirana shopkeepers, tailors, artisans, small traders) with low financial and digital literacy.
Use plain, respectful, encouraging language with zero unnecessary financial jargon. If explaining numbers, break them down clearly using rupees (₹).

USER CONTEXT:
- Name: ${user.name || 'Entrepreneur'}
- Age: ${user.age || 'N/A'}, Gender: ${user.gender || 'N/A'}, Location: ${user.district || 'Varanasi'}, ${user.state || 'Uttar Pradesh'}
- Preferred Language: ${isHindi ? 'Hindi (हिन्दी)' : 'English'}
- Business: ${business.type || 'Small Business'} (Selling: ${business.what || 'General items'}, Workers: ${business.workers || 0}, Hours: ${business.hours || 'Regular'})
- Daily Sales: ₹${sales.daily_sales ?? sales.dailySales ?? 0}, Monthly Estimated Revenue: ₹${financial.revenue || 0}
- Operating Expenses: Total ₹${financial.totalExpenses} (Rent: ₹${expenses.rent || 0}, Raw Materials: ₹${expenses.raw_materials ?? expenses.rawMaterials ?? 0}, Wages: ₹${expenses.wages || 0}, Transport: ₹${expenses.transport || 0}, Electricity: ₹${expenses.electricity || 0}, Packaging: ₹${expenses.packaging || 0}, Other: ₹${expenses.other || 0})
- Existing Loan EMI: ₹${financial.emi} per month
- Financial Metrics:
  * Net Monthly Profit: ₹${financial.netProfit}
  * Cash in Hand (after EMI): ₹${financial.cashFlow}
  * Break-Even Status: ${financial.breakEvenGap > 0 ? `Shortfall of ₹${financial.breakEvenGap} per month` : 'Operating above break-even'}
  * Working Capital locked in inventory: ₹${financial.workingCapital}
  * Debt-to-Revenue Ratio: ${financial.debtRatio}% (Risk Level: ${financial.riskLevel.toUpperCase()})
- Main Business Problems Reported: ${problems.join(', ') || 'General growth'}
- Target Customers: ${customers.join(', ') || 'Local community'}
- Nearby Competition: ${competition.count || 0} competitors in ${competition.where_located ?? competition.where ?? 'area'}
- Key Inventory Items: ${items.map((it) => `${it.desc || it.description} (Sell: ₹${it.sell_price ?? it.sellPrice}, Cost: ₹${it.cost_price ?? it.costPrice})`).join('; ') || 'None listed'}
- Top Matching Government Schemes:
${schemes.slice(0, 3).map((s, idx) => `  ${idx + 1}. ${s.name_en} (${s.matchPercentage}% match) - Max Loan: ₹${s.loanCeiling}, Subsidy/Benefit: ${s.interestSubsidyPct}% subsidy. Details: ${s.portalUrl}`).join('\n')}
- Local Mandi/Census Context: ${localContext?.district || 'Local district'} APMC Mandi sentiment: ${localContext?.mandiEconomics?.sentiment || 'Stable'}.

GUIDELINES:
1. Always respond in the requested language: ${isHindi ? 'Hindi (in Devanagari script)' : 'English'}.
2. Keep answers direct, concise (2 to 4 short paragraphs or bullet points), highly actionable, and tailored to their specific numbers.
3. When answering about schemes, cite the best matching scheme (e.g. ${schemes[0]?.name_en || 'PM-SVANidhi'}), why they qualify, how much they can get, and actionable steps.
4. When answering about expenses or profit, reference their actual rent, raw materials, or items to give specific tips.`;
}

function generateOfflineFallbackResponse(message, context, lang = 'en') {
  const isHindi = lang === 'hi';
  const query = (message || '').toLowerCase();
  const { financial, schemes, business, expenses } = context;
  const topScheme = schemes[0] || { name_en: 'PM-SVANidhi', name_hi: 'पीएम स्वनिधि', matchPercentage: 88, loanCeiling: 50000, portalUrl: 'https://pmsvanidhi.mohua.gov.in/' };

  if (query.includes('scheme') || query.includes('योजना') || query.includes('loan') || query.includes('लोन') || query.includes('ऋण') || query.includes('eligible') || query.includes('पात्र')) {
    if (isHindi) {
      return `नमस्ते! आपके व्यवसाय के आंकड़ों के अनुसार, आपके लिए सबसे उपयुक्त योजना **${topScheme.name_hi || topScheme.name_en}** है (${topScheme.matchPercentage}% पात्रता मेल)।\n\n- **अधिकतम ऋण राशि:** ₹${(topScheme.loanCeiling || 50000).toLocaleString('en-IN')}\n- **मुख्य लाभ:** कम ब्याज और डिजिटल लेनदेन पर सरकारी सब्सिडी।\n- **आवेदन कैसे करें:** आप अपने नजदीकी कॉमन सर्विस सेंटर (CSC) या आधिकारिक पोर्टल (${topScheme.portalUrl}) पर जाकर आधार कार्ड और बैंक खाते के साथ आवेदन कर सकते हैं।`;
    }
    return `Hello! Based on your current revenue of ₹${(financial.revenue || 0).toLocaleString('en-IN')}, your best-fit government scheme is **${topScheme.name_en}** (${topScheme.matchPercentage}% eligibility match).\n\n- **Maximum Loan Limit:** ₹${(topScheme.loanCeiling || 50000).toLocaleString('en-IN')}\n- **Key Benefit:** Collateral-free working capital with interest subsidies directly in your bank account.\n- **Next Step:** You can apply at your nearest Common Service Centre (CSC) or bank branch with your Aadhaar and bank passbook.`;
  }

  if (query.includes('expense') || query.includes('खर्च') || query.includes('cost') || query.includes('लागत') || query.includes('reduce') || query.includes('कम')) {
    if (isHindi) {
      return `आपके कुल मासिक खर्च **₹${(financial.totalExpenses || 0).toLocaleString('en-IN')}** हैं।\n\nखर्च कम करने के 3 व्यावहारिक उपाय:\n1. **कच्चे माल की थोक खरीदारी:** स्थानीय मंडी से सीधे नकद छूट पर माल खरीदें।\n2. **परिवहन खर्च में बचत:** साप्ताहिक आधार पर एक साथ माल मंगवाएं।\n3. **लोन ईएमआई प्रबंधन:** यदि संभव हो तो पीएम स्वनिधि जैसी सब्सिडी वाली योजना से महंगे पुराने कर्ज का पुनर्भुगतान करें।`;
    }
    return `Your total monthly business expenses are **₹${(financial.totalExpenses || 0).toLocaleString('en-IN')}**.\n\nHere are 3 practical ways to optimize:\n1. **Bulk Sourcing:** Purchase fast-moving goods directly from wholesale APMC mandis to improve margins by 3-5%.\n2. **Consolidate Trips:** Reduce daily transport costs (currently ₹${expenses.transport || 0}) by stocking inventory weekly.\n3. **Refinance High-Interest Debt:** Replace informal debt with low-cost credit schemes like ${topScheme.name_en}.`;
  }

  if (query.includes('profit') || query.includes('मुनाफा') || query.includes('बिक्री') || query.includes('sales') || query.includes('revenue') || query.includes('income')) {
    if (isHindi) {
      return `वर्तमान में आपकी मासिक बिक्री **₹${(financial.revenue || 0).toLocaleString('en-IN')}** और शुद्ध मुनाफा **₹${(financial.netProfit || 0).toLocaleString('en-IN')}** है।\n\nमुनाफा बढ़ाने के सुझाव:\n- अधिक मार्जिन वाली वस्तुओं पर ध्यान दें।\n- नियमित ग्राहकों को डिजिटल भुगतान (UPI) की सुविधा देकर डिजिटल कैशबैक प्राप्त करें।\n- पीक ऑवर्स में स्टॉक की कमी न होने दें।`;
    }
    return `Your estimated monthly sales are **₹${(financial.revenue || 0).toLocaleString('en-IN')}** with a net monthly profit of **₹${(financial.netProfit || 0).toLocaleString('en-IN')}**.\n\nKey growth recommendations:\n- Prioritize higher-margin inventory items.\n- Offer UPI QR payments to unlock digital transaction cashback benefits.\n- Ensure fast-selling essentials are always in stock during peak trading hours.`;
  }

  if (isHindi) {
    return `नमस्ते! मैं आपका **उद्यम सेतु एआई सलाहकार** हूँ। मैं आपके व्यवसाय (${business.type || 'दुकान'}), खर्चों, मुनाफे और सरकारी योजनाओं के बारे में किसी भी प्रश्न में आपकी सहायता कर सकता हूँ। आप पूछ सकते हैं: "मेरे लिए कौन सी योजना सही है?" या "खर्च कैसे कम करें?"।`;
  }

  return `Hello! I am your **Udyam Setu AI Advisor**. I am here to assist with questions about your ${business.type || 'business'}, reducing expenses, improving profits, and applying for government schemes like ${topScheme.name_en}. Feel free to ask any question!`;
}

async function generateAdvisoryResponse(userId, message, lang = 'en', history = []) {
  const context = await getUserFullContext(userId);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === 'your_anthropic_api_key_here' || apiKey.trim().length === 0) {
    return generateOfflineFallbackResponse(message, context, lang);
  }

  try {
    const systemPrompt = buildSystemPrompt(context, lang);

    const formattedMessages = [];
    if (Array.isArray(history)) {
      history.slice(-6).forEach((h) => {
        if (h.role === 'user' || h.role === 'assistant') {
          formattedMessages.push({
            role: h.role,
            content: h.content,
          });
        }
      });
    }

    formattedMessages.push({
      role: 'user',
      content: message,
    });

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
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: 12000,
      }
    );

    const replyContent = response.data?.content?.[0]?.text;
    if (replyContent) {
      return replyContent;
    }
    return generateOfflineFallbackResponse(message, context, lang);
  } catch (err) {
    console.warn('[ChatService] Claude API call failed, using personalized fallback:', err.response?.data || err.message);
    return generateOfflineFallbackResponse(message, context, lang);
  }
}

module.exports = {
  getUserFullContext,
  generateAdvisoryResponse,
  buildSystemPrompt,
  generateOfflineFallbackResponse,
};
