import React from 'react';
import { ArrowLeft, Languages, Loader2, Volume2, VolumeX, Mic } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout({
  title,
  showBack = true,
  onBack,
  progress,
  children,
  actionLabel,
  onNext,
  loading = false,
}) {
  const { lang, setLang, t, voiceMode, toggleVoiceMode } = useApp();

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#f3ede0] flex flex-col justify-between shadow-2xl relative">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-20 px-4 py-3 bg-[#f3ede0]/95 backdrop-blur border-b border-[#e4d9c7]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {showBack && onBack && (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go Back"
                className="p-1.5 rounded-full hover:bg-[#e4d9c7] text-[#5b4636] transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <span className="font-heading font-bold text-sm tracking-tight text-[#1f3a5f]">
              {t("appName")}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Mode Accessibility Toggle */}
            <button
              type="button"
              onClick={toggleVoiceMode}
              title={voiceMode ? t("voiceModeOn") : t("voiceModeOff")}
              className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
                voiceMode
                  ? "bg-[#3f6b4f] text-white border-[#3f6b4f] shadow-sm animate-pulse"
                  : "bg-[#fffdf9] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]"
              }`}
            >
              {voiceMode ? (
                <>
                  <Volume2 className="w-3 h-3 text-white" />
                  <span>{t("voiceMode")}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3 h-3 text-[#8a7a68]" />
                  <span className="opacity-75">{t("voiceMode")}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center gap-1 text-xs font-semibold">
              <Languages className="w-3.5 h-3.5 text-[#a36a2d]" />
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 py-0.5 rounded transition ${
                  lang === "en"
                    ? "bg-[#1f3a5f] text-white"
                    : "bg-[#e4d9c7] text-[#5b4636]"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("hi")}
                className={`px-2 py-0.5 rounded transition ${
                  lang === "hi"
                    ? "bg-[#1f3a5f] text-white"
                    : "bg-[#e4d9c7] text-[#5b4636]"
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {typeof progress === "number" && (
          <div className="mt-2.5 h-1 w-full bg-[#e4d9c7] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1f3a5f] transition-all duration-300 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </header>

      {/* Main scrollable body */}
      <main className="flex-1 px-5 py-5 overflow-y-auto">{children}</main>

      {/* Bottom action bar */}
      {onNext && (
        <footer className="sticky bottom-0 z-20 px-5 py-4 bg-[#f3ede0]/95 backdrop-blur border-t border-[#e4d9c7]">
          <button
            type="button"
            onClick={onNext}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-heading font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
            style={{ background: "#1f3a5f", color: "#fffdf9" }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t("saving")}</span>
              </>
            ) : (
              <span>{actionLabel || t("next")}</span>
            )}
          </button>
        </footer>
      )}
    </div>
  );
}
