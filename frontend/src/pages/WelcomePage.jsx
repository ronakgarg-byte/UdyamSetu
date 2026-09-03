import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Chip } from '../components/Common';
import Layout from '../components/Layout';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useApp();

  return (
    <Layout
      showTopBar={false}
      onNext={() => navigate('/details')}
      nextLabel={t('getStarted')}
    >
      <div className="h-full flex flex-col items-center justify-center text-center py-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-md transition-transform hover:scale-105"
          style={{ backgroundColor: "#1f3a5f" }}
        >
          <Sprout size={38} color="#e8a33d" />
        </div>
        <h1 className="font-heading text-2xl font-bold mb-2" style={{ color: "#1f3a5f" }}>
          {t("appName")}
        </h1>
        <p className="text-sm max-w-[260px] mb-8" style={{ color: "#5b4636" }}>
          {t("tagline")}
        </p>

        <p className="text-xs uppercase tracking-wide mb-2 font-semibold" style={{ color: "#a36a2d" }}>
          {t("choosePref")}
        </p>
        <div className="flex gap-3 mb-10">
          <Chip active={lang === "en"} onClick={() => setLang("en")}>English</Chip>
          <Chip active={lang === "hi"} onClick={() => setLang("hi")}>हिंदी</Chip>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "#8a7a68" }}>
          <ShieldCheck size={16} color="#3f6b4f" />
          {t("trustLine")}
        </div>
      </div>
    </Layout>
  );
}
