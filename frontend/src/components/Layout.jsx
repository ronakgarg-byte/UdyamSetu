import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Layout({
  children,
  title,
  progress = 0,
  showTopBar = true,
  onBack,
  onNext,
  nextLabel,
  loading = false,
  showBottomBar = true,
  customBottom,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useApp();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 selection:bg-[#e8a33d]/30"
      style={{
        background: "linear-gradient(180deg,#f3ede0 0%,#ece2cf 100%)",
        fontFamily: "'Inter', 'Noto Sans Devanagari', sans-serif",
      }}
    >
      <div
        className="relative w-full flex flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all"
        style={{
          maxWidth: 420,
          height: 800,
          borderColor: "#e4d9c7",
          backgroundColor: "#fffdf9",
        }}
      >
        {/* ---------------- Top Bar ---------------- */}
        {showTopBar && (
          <div
            className="flex items-center justify-between px-5 pt-5 pb-3 border-b"
            style={{ borderColor: "#efe6d6" }}
          >
            <button
              onClick={handleBack}
              className="p-1.5 -ml-1 rounded-full hover:bg-stone-200/50 transition-colors"
              aria-label={t("back")}
            >
              <ChevronLeft size={22} color="#5b4636" />
            </button>
            <span
              className="font-heading text-sm font-semibold truncate max-w-[220px]"
              style={{ color: "#1f3a5f" }}
            >
              {title}
            </span>
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="rounded-full border px-2.5 py-1 text-xs font-semibold hover:bg-[#e8a33d]/10 transition-colors"
              style={{ borderColor: "#e4d9c7", color: "#a36a2d" }}
            >
              {lang === "en" ? "हिं" : "EN"}
            </button>
          </div>
        )}

        {/* ---------------- Progress Bar ---------------- */}
        {showTopBar && (
          <div className="h-1 w-full" style={{ backgroundColor: "#efe6d6" }}>
            <div
              className="h-1 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%`, backgroundColor: "#e8a33d" }}
            />
          </div>
        )}

        {/* ---------------- Scrollable Content ---------------- */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* ---------------- Bottom Action Bar ---------------- */}
        {showBottomBar && (
          <div
            className="px-6 pb-6 pt-3 border-t"
            style={{ borderColor: "#efe6d6", backgroundColor: "#fffdf9" }}
          >
            {customBottom ? (
              customBottom
            ) : (
              <button
                onClick={onNext}
                disabled={loading}
                className="w-full rounded-2xl py-3.5 font-heading text-base font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ backgroundColor: "#1f3a5f", color: "#fff" }}
              >
                {loading ? t("saving") : nextLabel || t("next")}
                {!loading && <ChevronRight size={18} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
