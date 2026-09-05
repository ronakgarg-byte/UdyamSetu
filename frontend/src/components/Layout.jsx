import React from 'react';
import { ArrowLeft, Languages, Loader2, Volume2, VolumeX, Mic, ShieldCheck } from 'lucide-react';
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
    <div className="w-full min-h-screen bg-[#f3ede0] flex flex-col justify-between relative">
      {/* Top sticky bar */}
      <header className="sticky top-0 z-30 w-full bg-[#f3ede0]/95 backdrop-blur border-b border-[#e4d9c7] shadow-sm">
        <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {showBack && onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  aria-label="Go Back"
                  className="p-2 rounded-xl hover:bg-[#e4d9c7] text-[#5b4636] transition border border-[#e4d9c7] bg-[#fffdf9]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <span className="font-heading font-extrabold text-base sm:text-lg tracking-tight text-[#1f3a5f]">
                  {t("appName")}
                </span>
                <span className="hidden md:inline-block ml-2 text-[11px] text-[#a36a2d] font-semibold bg-[#efe6d6] px-2 py-0.5 rounded-full border border-[#e4d9c7]">
                  SIH26091 • Govt of India
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Voice Mode Accessibility Toggle */}
              <button
                type="button"
                onClick={toggleVoiceMode}
                title={voiceMode ? t("voiceModeOn") : t("voiceModeOff")}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  voiceMode
                    ? "bg-[#3f6b4f] text-white border-[#3f6b4f] shadow-sm animate-pulse"
                    : "bg-[#fffdf9] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]"
                }`}
              >
                {voiceMode ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-white" />
                    <span>{t("voiceMode")}</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-[#8a7a68]" />
                    <span className="opacity-75">{t("voiceMode")}</span>
                  </>
                )}
              </button>

              {/* Language Switcher */}
              <div className="flex items-center gap-1 text-xs font-semibold bg-[#e4d9c7]/60 p-1 rounded-xl border border-[#e4d9c7]">
                <Languages className="w-3.5 h-3.5 text-[#a36a2d] ml-1" />
                <button
                  type="button"
                  onClick={() => setLang("en")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    lang === "en"
                      ? "bg-[#1f3a5f] text-white shadow-sm font-bold"
                      : "text-[#5b4636] hover:text-[#1f3a5f]"
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setLang("hi")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    lang === "hi"
                      ? "bg-[#1f3a5f] text-white shadow-sm font-bold"
                      : "text-[#5b4636] hover:text-[#1f3a5f]"
                  }`}
                >
                  हिन्दी
                </button>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {typeof progress === "number" && (
            <div className="mt-3 h-1.5 w-full bg-[#e4d9c7] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1f3a5f] transition-all duration-300 rounded-full"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main full-width responsive body */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</main>

      {/* Bottom action bar */}
      {onNext && (
        <footer className="sticky bottom-0 z-30 w-full bg-[#f3ede0]/95 backdrop-blur border-t border-[#e4d9c7] shadow-lg">
          <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-end">
            <button
              type="button"
              onClick={onNext}
              disabled={loading}
              className="w-full sm:w-auto sm:min-w-[280px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-heading font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
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
          </div>
        </footer>
      )}
    </div>
  );
}

