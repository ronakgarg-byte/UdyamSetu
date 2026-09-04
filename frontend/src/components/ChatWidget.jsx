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
  const { userId, lang, t, fallbackCalc } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const isHindi = lang === 'hi';

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
      console.warn('[ChatWidget] Error sending message:', err);
      setError(t('chatError'));
      // Friendly fallback message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isHindi
            ? `आपके व्यवसाय के वर्तमान आंकड़ों के अनुसार, आपके लिए सबसे उपयुक्त योजना **${fallbackCalc.scheme?.name || 'पीएम स्वनिधि'}** है। आप मासिक खर्चों में कच्चे माल की सीधी मंडी खरीद से 3-5% तक बचत कर सकते हैं।`
            : `Based on your business figures, your primary recommended scheme is **${fallbackCalc.scheme?.name || 'PM-SVANidhi'}**. Consider direct APMC wholesale sourcing to improve profit margins.`,
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
                <div className="flex items-center gap-2 text-xs text-[#8a7a68] p-2 bg-white/60 rounded-xl max-w-[80%] border border-[#e4d9c7]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1f3a5f]" />
                  <span>{t('chatThinking')}</span>
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
