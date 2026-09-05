import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Languages,
  Volume2,
  VolumeX,
  Mic,
  Building2,
  Store,
  MapPin,
  Brain,
  CheckCircle2,
} from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { lang, setLang, t, voiceMode, toggleVoiceMode } = useApp();
  const isHindi = lang === 'hi';

  const featureCards = [
    {
      icon: Building2,
      title: isHindi ? '7+ राष्ट्रीय सरकारी योजनाएं' : '7+ Matched National Schemes',
      desc: isHindi
        ? 'पीएम विश्वकर्मा (₹3 लाख @ 5%), पीएमईजीपी (35% सब्सिडी), मुद्रा व स्वनिधि ऋण।'
        : 'PM Vishwakarma (₹3L @ 5%), PMEGP (35% grant), MUDRA & SVANidhi.',
      color: '#1f3a5f',
      accent: '#e8a33d',
    },
    {
      icon: Store,
      title: isHindi ? 'AGMARKNET लाइव थोक मंडी भाव' : 'AGMARKNET Live Mandi Rates',
      desc: isHindi
        ? 'कच्चे माल व जींस के दैनिक APMC थोक भाव देखकर 15-30% की सीधी बचत करें।'
        : 'Daily APMC modal commodity rates with 15-30% wholesale cost savings.',
      color: '#3f6b4f',
      accent: '#6ee7b7',
    },
    {
      icon: MapPin,
      title: isHindi ? 'गूगल मैप्स दुकान पिनपॉइंट' : 'Google Maps Shop Pinpoint',
      desc: isHindi
        ? 'GPS से अपनी दुकान को मैप पर सेट करें और स्थानीय मंडी व ग्राहक मांग समझें।'
        : 'Pinpoint shop location via GPS for hyper-local footfall & mandi context.',
      color: '#a36a2d',
      accent: '#fde68a',
    },
    {
      icon: Brain,
      title: isHindi ? 'जेमिनी एआई व्यापार सलाहकार' : 'Gemini Cognitive AI Advisor',
      desc: isHindi
        ? 'बिक्री बढ़ाने, खर्च घटाने व फंसे उधार की वसूली हेतु 24x7 तार्किक परामर्श।'
        : '24x7 strategic advisory on scaling margins, cutting costs & credit control.',
      color: '#1f3a5f',
      accent: '#93c5fd',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f3ede0] flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="w-full bg-[#f3ede0]/95 backdrop-blur border-b border-[#e4d9c7] sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-[#1f3a5f]">
                {t('appName')}
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] text-[#a36a2d] font-semibold bg-[#efe6d6] px-2 py-0.5 rounded-full border border-[#e4d9c7]">
                SIH 2026 • SIH26091
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Voice Mode Accessibility Toggle */}
            <button
              type="button"
              onClick={toggleVoiceMode}
              title={voiceMode ? t('voiceModeOn') : t('voiceModeOff')}
              className={'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ' + (
                voiceMode
                  ? 'bg-[#3f6b4f] text-white border-[#3f6b4f] shadow-md animate-pulse'
                  : 'bg-[#fffdf9] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
              )}
            >
              {voiceMode ? (
                <>
                  <Volume2 className="w-4 h-4 text-white" />
                  <span>{t('voiceModeOn')}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#a36a2d]" />
                  <span>{t('voiceMode')}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-xs font-semibold bg-[#e4d9c7]/60 p-1 rounded-xl border border-[#e4d9c7]">
              <Languages className="w-3.5 h-3.5 text-[#a36a2d] ml-1" />
              <button
                type="button"
                onClick={() => setLang('en')}
                className={'px-2.5 py-1 rounded-lg transition ' + (
                  lang === 'en'
                    ? 'bg-[#1f3a5f] text-white shadow-sm font-bold'
                    : 'text-[#5b4636] hover:text-[#1f3a5f]'
                )}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={'px-2.5 py-1 rounded-lg transition ' + (
                  lang === 'hi'
                    ? 'bg-[#1f3a5f] text-white shadow-sm font-bold'
                    : 'text-[#5b4636] hover:text-[#1f3a5f]'
                )}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Full-Width Hero Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Hero Call to Action */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#efe6d6] text-[#a36a2d] border border-[#e4d9c7] mb-4 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>{t('trustLine')}</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#1f3a5f] leading-tight mb-3">
              {t('appName')}
            </h1>

            <p className="text-base sm:text-lg font-medium text-[#5b4636] mb-6 leading-relaxed">
              {t('tagline')}
            </p>

            {/* Voice Assistant Callout Card */}
            <div
              onClick={toggleVoiceMode}
              className={'w-full p-4 rounded-2xl border cursor-pointer text-left transition-all mb-6 ' + (
                voiceMode
                  ? 'bg-[#e3efe6] border-[#3f6b4f] shadow-md ring-2 ring-[#3f6b4f]/20'
                  : 'bg-[#fffdf9] border-[#e4d9c7] hover:border-[#a36a2d] shadow-sm'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={'p-2.5 rounded-xl shrink-0 ' + (
                    voiceMode ? 'bg-[#3f6b4f] text-white' : 'bg-[#efe6d6] text-[#a36a2d]'
                  )}
                >
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-[#1f3a5f]">
                      {t('voiceMode')}
                    </span>
                    <span
                      className={'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ' + (
                        voiceMode ? 'bg-[#3f6b4f] text-white' : 'bg-[#efe6d6] text-[#5b4636]'
                      )}
                    >
                      {voiceMode ? 'ACTIVE' : 'OPTIONAL'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5b4636] mt-1 leading-relaxed">
                    {t('voiceAssistantDesc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={() => navigate('/details')}
              className="w-full sm:w-auto sm:min-w-[280px] flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-heading font-bold text-base shadow-xl transition-all active:scale-[0.98] hover:shadow-2xl hover:bg-[#152742]"
              style={{ background: '#1f3a5f', color: '#fffdf9' }}
            >
              <span>{t('getStarted')}</span>
              <ArrowRight className="w-5 h-5 text-[#e8a33d]" />
            </button>
          </div>

          {/* Right Column: Platform Features Grid */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-[#e4d9c7] bg-[#fffdf9] shadow-sm hover:shadow-md hover:border-[#1f3a5f]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                      style={{ background: '#1f3a5f', color: card.accent }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-heading text-sm font-bold text-[#1f3a5f] mb-1.5 leading-snug">
                      {card.title}
                    </h3>
                    <p className="text-xs text-[#5b4636] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-[#efe6d6] flex items-center gap-1 text-[11px] font-semibold text-[#a36a2d]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isHindi ? 'सत्यापित मॉड्यूल' : 'Verified Module'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="w-full border-t border-[#e4d9c7] bg-[#f3ede0] py-4">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#8a7a68]">
          <p>© 2026 Udyam Setu • Smart India Hackathon (Problem SIH26091)</p>
          <p>Ministry of Social Justice & Empowerment, Govt of India</p>
        </div>
      </footer>
    </div>
  );
}
