import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Sparkles, ShieldCheck, ArrowRight, Languages, Volume2, VolumeX, Mic } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { lang, setLang, t, voiceMode, toggleVoiceMode } = useApp();

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#f3ede0] flex flex-col justify-between p-6 shadow-2xl">
      {/* Language Switcher & Accessibility at Top */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleVoiceMode}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
            voiceMode
              ? "bg-[#3f6b4f] text-white border-[#3f6b4f] shadow-md animate-pulse"
              : "bg-[#fffdf9] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]"
          }`}
        >
          {voiceMode ? (
            <>
              <Volume2 className="w-4 h-4 text-white" />
              <span>{t("voiceModeOn")}</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-[#a36a2d]" />
              <span>{t("voiceMode")}</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold bg-[#e4d9c7]/60 p-1 rounded-lg">
          <Languages className="w-3.5 h-3.5 text-[#a36a2d] ml-1" />
          <button
            type="button"
            onClick={() => setLang("en")}
            className={`px-2.5 py-1 rounded transition ${
              lang === "en"
                ? "bg-[#1f3a5f] text-white shadow-sm"
                : "text-[#5b4636]"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("hi")}
            className={`px-2.5 py-1 rounded transition ${
              lang === "hi"
                ? "bg-[#1f3a5f] text-white shadow-sm"
                : "text-[#5b4636]"
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5 shadow-lg transform rotate-2"
          style={{ background: "#1f3a5f", color: "#e8a33d" }}
        >
          <Sparkles className="w-10 h-10" />
        </div>

        <h1
          className="font-heading text-3xl font-extrabold tracking-tight mb-2"
          style={{ color: "#1f3a5f" }}
        >
          {t("appName")}
        </h1>

        <p className="text-sm font-medium px-4 mb-4" style={{ color: "#5b4636" }}>
          {t("tagline")}
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#efe6d6] text-[#a36a2d] border border-[#e4d9c7]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t("trustLine")}</span>
        </div>

        {/* Voice Assistant Callout Banner */}
        <div
          onClick={toggleVoiceMode}
          className={`mt-6 p-3.5 rounded-2xl border cursor-pointer text-left transition-all ${
            voiceMode
              ? "bg-[#e3efe6] border-[#3f6b4f] shadow-sm ring-2 ring-[#3f6b4f]/20"
              : "bg-[#fffdf9] border-[#e4d9c7] hover:border-[#a36a2d]"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 ${
                voiceMode ? "bg-[#3f6b4f] text-white" : "bg-[#efe6d6] text-[#a36a2d]"
              }`}
            >
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-xs text-[#1f3a5f]">
                  {t("voiceMode")}
                </span>
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.2 rounded font-bold ${
                    voiceMode ? "bg-[#3f6b4f] text-white" : "bg-[#efe6d6] text-[#5b4636]"
                  }`}
                >
                  {voiceMode ? "ACTIVE" : "OPTIONAL"}
                </span>
              </div>
              <p className="text-[11px] text-[#5b4636] mt-0.5 leading-snug">
                {t("voiceAssistantDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        <button
          type="button"
          onClick={() => navigate('/details')}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-heading font-semibold text-base shadow-lg transition-all active:scale-[0.98]"
          style={{ background: "#1f3a5f", color: "#fffdf9" }}
        >
          <span>{t("getStarted")}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
