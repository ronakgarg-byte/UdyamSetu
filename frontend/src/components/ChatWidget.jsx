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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  isSpeechRecognitionSupported,
  startListening,
} from '../utils/speechUtils';

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
    const userName = user?.name ? `${user.name} जी` : 'उद्यमी साथी';
    const userEnName = user?.name || 'Entrepreneur';
    const bizName = biz?.type || (isHindi ? 'दुकान/व्यवसाय' : 'business');
    const schemeName = fallbackCalc.scheme?.name || (isHindi ? 'पीएम स्वनिधि' : 'PM-SVANidhi');

    // 1. Greetings
    if (/^(hi|hello|hey|namaste|namaskar|pranam|नमस्ते|प्रणाम|हेलो|हाय|kya haal|kaise ho)/i.test(q) || q === 'hi' || q === 'hello') {
      if (isHindi) {
        return `नमस्ते ${userName}! 🙏\n\nमैं आपका **उद्यम सेतु एआई सलाहकार** हूँ। मैं आपके **${bizName}** के लिए वित्तीय सलाह, सरकारी लोन और बिक्री बढ़ाने में मदद कर सकता हूँ।\n\nआप मुझसे पूछ सकते हैं:\n1. 📈 *"बिजनेस को कैसे बढ़ाऊं?"*\n2. 🏛️ *"मेरे लिए कौन सी सरकारी लोन योजना बेस्ट है?"*\n3. 💰 *"खर्च कैसे कम करूं और मुनाफा कैसे बढ़ाऊं?"*\n4. 📱 *"उधार का पैसा कैसे वसूलें?"*`;
      }
      return `Hello ${userEnName}! 👋\n\nI am your **Udyam Setu AI Advisor**. I am here to guide your **${bizName}** with tailored financial strategies and schemes.\n\nAsk me:\n1. 📈 *"How to grow my business?"*\n2. 🏛️ *"Which loan scheme is best for me?"*\n3. 💰 *"How to cut expenses & increase profit?"*`;
    }

    // 2. Business Growth / Expansion ("Mei business ko badhau kaise")
    if (/badhau|badhana|badhaye|grow|growth|expand|bada karna|bada kare|tarakki|scale|aage badhe|bikri badhana|bikri kaise|sell more/i.test(q)) {
      if (isHindi) {
        return `नमस्ते ${userName}! अपने **${bizName}** को तेजी से आगे बढ़ाने के 4 सबसे व्यावहारिक तरीके:\n\n1. 🏷️ **ज्यादा मार्जिन वाले सामान पर फोकस करें:** जो सामान तेजी से बिकता है और 25-35% का मुनाफा देता है, उसे हमेशा सामने रखें।\n2. 📱 **डिजिटल पेमेंट (UPI QR) लगाएं:** GooglePay/PhonePe से पेमेंट लेने पर छुट्टे पैसे की समस्या खत्म होती है और बैंक से आसान लोन मिलता है।\n3. 🤝 **पुराने ग्राहकों को छोटे ऑफर्स दें:** नियमित ग्राहकों के लिए कॉम्बो पैक या त्यौहारों पर छोटी छूट रखें।\n4. 🏛️ **सरकारी लोन योजना से नई वैरायटी लाएं:** **${schemeName}** योजना से बिना गारंटी लोन लेकर अपनी दुकान में नया स्टॉक जोड़ें।`;
      }
      return `Here is a 4-step action plan to grow your **${bizName}**:\n\n1. 🏷️ **Focus on High-Margin Products:** Prioritize fast-selling goods with healthy profit margins (20-35%).\n2. 📱 **Adopt UPI QR Payments:** Eliminates cash change issues and builds a verified financial footprint for bank loans.\n3. 🤝 **Customer Loyalty Combos:** Package daily essential items into bundles with attractive pricing.\n4. 🏛️ **Leverage Working Capital:** Apply for **${schemeName}** to invest in bulk inventory at wholesale prices.`;
    }

    // 3. Customer Footfall
    if (/grahak|customer|footfall|log nahi|bikri kam|traffic/i.test(q)) {
      if (isHindi) {
        return `दुकान पर ग्राहकों की संख्या और बिक्री बढ़ाने के 3 उपाय:\n\n- 🏪 **दुकान की दृश्यता:** ज्यादा बिकने वाले और आकर्षक सामान को आगे काउंटर पर रखें।\n- ⏱️ **पीक समय पर दुकान खुली रखें:** सुबह 7–10 बजे और शाम 5–9 बजे जब ग्राहक ज्यादा होते हैं।\n- 🛵 **व्हाट्सएप ऑर्डर:** आस-पास के घरों से व्हाट्सएप पर लिस्ट मंगवाकर तुरंत पैक करके रखें।`;
      }
      return `3 ways to increase customer footfall:\n\n- 🏪 **Front Display:** Keep your most popular items clearly visible at the entrance.\n- ⏱️ **Target Peak Hours:** Maximize inventory during morning and evening rush hours.\n- 🛵 **Local WhatsApp Ordering:** Take quick orders from regular neighborhood buyers.`;
    }

    // 4. Udhaar / Credit
    if (/udhar|udhari|credit|khata|paisa fas/i.test(q)) {
      if (isHindi) {
        return `उधार प्रबंधन के 3 नियम:\n\n1. 🛑 **उधार की सीमा तय करें:** किसी भी ग्राहक को एक निश्चित रकम से ज्यादा उधार न दें।\n2. 📲 **तुरंत भुगतान पर छूट:** तुरंत UPI या नकद देने पर ₹5 की छोटी छूट दें।\n3. 🔔 **महीने की शुरुआत में याद दिलाएं:** 1 से 5 तारीख के बीच प्यार से बकाया राशि का व्हाट्सएप संदेश भेजें।`;
      }
      return `Credit management tips:\n\n1. 🛑 **Set a strict credit limit** for individual buyers.\n2. 💸 **Offer instant payment incentives** for UPI/cash settlement.\n3. 📲 **Send polite digital bill summaries** at the start of every month.`;
    }

    // 5. Schemes / Loans
    if (/scheme|yojana|योजना|loan|लोन|ऋण|subsidy|svanidhi|mudra|pmegp/i.test(q)) {
      if (isHindi) {
        return `नमस्ते ${userName}! आपके आंकड़ों के अनुसार, आपके लिए सबसे उपयुक्त योजना **${schemeName}** है।\n\n- **मुख्य लाभ:** बिना किसी संपत्ति गारंटी के आसान कार्यशील पूंजी ऋण।\n- **सरकारी सब्सिडी:** समय पर पुनर्भुगतान करने पर ब्याज सब्सिडी सीधे आपके बैंक खाते में।\n- **आवेदन कैसे करें:** अपने नजदीकी CSC सेंटर या बैंक शाखा में आधार कार्ड व पासबुक के साथ आवेदन करें।`;
      }
      return `Based on your profile, your primary recommended scheme is **${schemeName}**.\n\n- **Highlights:** Zero collateral required, direct interest subsidy.\n- **How to apply:** Visit your nearest Common Service Centre (CSC) or bank branch with your Aadhaar and bank passbook.`;
    }

    // 6. Expenses / Cost Cutting
    if (/expense|kharch|खर्च|cost|reduce|kam|bachat/i.test(q)) {
      if (isHindi) {
        return `खर्च कम करने के 3 व्यावहारिक उपाय:\n\n1. 🛒 **मंडी से सीधी थोक खरीद:** बिचौलियों के बजाय सीधे APMC थोक मंडी से नकद छूट पर माल खरीदें (3-5% बचत)।\n2. 🚚 **परिवहन फेरों को कम करें:** रोज़-रोज़ जाने के बजाय हफ्ते में 1-2 बार बड़ा स्टॉक लाएं।\n3. 📦 **सामान की बर्बादी रोकें:** जल्दी खराब होने वाली वस्तुओं की सीमित इन्वेंट्री रखें।`;
      }
      return `3 ways to cut operational costs:\n\n1. 🛒 **Direct APMC Wholesale Sourcing:** Source fast-moving items in bulk to save 3-5%.\n2. 🚚 **Consolidate Logistics:** Reduce transport trips by stocking goods weekly.\n3. 📦 **Prevent Perishable Spoilage:** Keep tight stock on perishable items.`;
    }

    // Default
    if (isHindi) {
      return `नमस्ते ${userName}! आपके **${bizName}** के लिए सर्वोत्तम योजना **${schemeName}** है।\n\nआप मुझसे व्यवसाय बढ़ाने, खर्च घटाने, लोन आवेदन या ग्राहक बढ़ाने के बारे में कोई भी प्रश्न पूछ सकते हैं!`;
    }
    return `Hello ${userEnName}! Based on your **${bizName}**, your primary recommended scheme is **${schemeName}**.\n\nFeel free to ask me anything about growing sales, cutting expenses, or applying for loans!`;
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
            ? `नमस्ते! मैं आपका **उद्यम सेतु एआई सलाहकार** हूँ। मैं आपके मुनाफे, खर्चों को कम करने और सरकारी योजनाओं (जैसे ${fallbackCalc.scheme?.name || 'पीएम स्वनिधि'}) के लिए आवेदन करने में मदद कर सकता हूँ। मुझसे कोई भी सवाल पूछें!`
            : `Hello! I am your **Udyam Setu AI Advisor**. I can help analyze your profits, find ways to cut expenses, and check your eligibility for government schemes like **${fallbackCalc.scheme?.name || 'PM-SVANidhi'}**. Ask me anything!`,
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

    try {
      const activeUserId = userId || 'demo-user';
      const res = await api.sendChatMessage(activeUserId, {
        message: text,
        lang,
        history: newHistory.map((m) => ({ role: m.role, content: m.content })),
        clientContext: {
          user,
          biz,
          sales,
          expenses,
          items,
          problems,
          customers,
          competition,
        },
      });

      if (res?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('Empty response from AI advisor');
      }
    } catch (err) {
      console.warn('[ChatWidget] Using intelligent client fallback:', err.message);
      // Smart contextual fallback response tailored to user's question
      const smartReply = getSmartClientReply(text);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: smartReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
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
    t('chatQuickPrompt1'),
    t('chatQuickPrompt2'),
    t('chatQuickPrompt3'),
    t('chatQuickPrompt4'),
  ];

  // Helper to render simple markdown formatting (**bold**, bullet points)
  const renderFormattedContent = (content) => {
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
            <span>{parsedParts}</span>
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
            <Bot className="w-5 h-5 text-[#e8a33d]" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8a33d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8a33d]"></span>
            </span>
          </div>
          <span className="hidden sm:inline">{t('talkAdvisor')}</span>
          <span className="sm:hidden">AI</span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div
            className="w-full max-w-md h-[88vh] sm:h-[620px] bg-[#f3ede0] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden border border-[#e4d9c7] animate-in slide-in-from-bottom duration-200"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#1f3a5f] text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#e8a33d]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-bold text-[#fffdf9] flex items-center gap-1.5">
                    {t('chatTitle')}
                    <span className="text-[10px] bg-[#e8a33d] text-[#1f3a5f] px-1.5 py-0.2 rounded font-bold uppercase">
                      Claude AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#efe6d6] truncate max-w-[220px]">
                    {t('chatSubtitle')}
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
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs shadow-sm ${
                        isUser
                          ? 'bg-[#1f3a5f] text-white rounded-tr-none'
                          : 'bg-[#fffdf9] text-[#5b4636] border border-[#e4d9c7] rounded-tl-none'
                      }`}
                    >
                      <div className="break-words">
                        {isUser ? msg.content : renderFormattedContent(msg.content)}
                      </div>
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
                <div className="flex items-center gap-2.5 text-xs text-[#1f3a5f] p-2.5 bg-[#faf4e8] rounded-2xl max-w-[85%] border border-[#e8a33d]/50 shadow-sm">
                  <div className="w-7 h-7 rounded-full bg-[#1f3a5f] flex items-center justify-center text-[#e8a33d] shrink-0">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[11px] text-[#1f3a5f] flex items-center gap-1">
                      <span>{isHindi ? "उद्यम सेतु एआई विचार प्रक्रिया..." : "AI Cognitive Reasoning & Strategy..."}</span>
                    </span>
                    <span className="text-[10px] text-[#8a7a68]">
                      {isHindi ? "दुकान के आंकड़ों और वित्तीय मॉडल्स का विश्लेषण हो रहा है" : "Analyzing shop figures, margins & scheme subsidies"}
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
