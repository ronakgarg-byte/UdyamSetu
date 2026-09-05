import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { VoiceRow } from '../components/Common';
import Layout from '../components/Layout';
import {
  Sparkles,
  Store,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Rocket,
  TrendingUp,
  Compass,
  Building2,
} from 'lucide-react';

export default function PortalSelectPage() {
  const navigate = useNavigate();
  const { portalType, setPortalType, t, lang } = useApp();
  const isHindi = lang === 'hi';

  const handleSelect = (type) => {
    setPortalType(type);
  };

  const handleProceed = () => {
    navigate('/details');
  };

  return (
    <Layout
      title={t('portalSelectTitle')}
      progress={10}
      showBack={true}
      onBack={() => navigate('/')}
      onNext={handleProceed}
    >
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-[#e4d9c7]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                  <Compass className="w-4 h-4" />
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1f3a5f]">
                  {t('portalSelectTitle')}
                </h2>
              </div>
              <p className="text-xs text-[#8a7a68]">
                {t('portalSelectSub')}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#efe6d6] text-[#a36a2d] border border-[#e4d9c7]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step 1 of 4</span>
            </div>
          </div>

          {/* Voice Guide */}
          <div className="mb-6">
            <VoiceRow
              textToRead={
                isHindi
                  ? 'कृपया अपनी स्थिति चुनें। यदि आप नया व्यवसाय शुरू करना चाहते हैं तो पोर्टल A शुरुआत चुनें। यदि आपकी दुकान पहले से चल रही है तो पोर्टल B विस्तार चुनें।'
                  : 'Please choose your business journey. Select Portal A Shuruaat if you are starting a new business, or Portal B Vistaar if you already run an existing business.'
              }
              helperText={
                isHindi
                  ? 'अपनी स्थिति के अनुसार उपयुक्त कार्ड पर टैप करें'
                  : 'Tap the card that best matches your situation'
              }
            />
          </div>

          {/* 2 Big Choice Cards in 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* PORTAL A: SHURUAAT (BEGINNER) */}
            <div
              onClick={() => handleSelect('beginner')}
              className={'p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between relative text-left ' + (
                portalType === 'beginner'
                  ? 'bg-[#faf4e8] border-[#e8a33d] shadow-lg ring-2 ring-[#e8a33d]/30 scale-[1.01]'
                  : 'bg-[#fffdf9] border-[#e4d9c7] hover:border-[#1f3a5f]/40 hover:shadow-md'
              )}
            >
              {portalType === 'beginner' && (
                <div className="absolute top-4 right-4 bg-[#e8a33d] text-[#1f3a5f] p-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-5 h-5 fill-current" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#3f6b4f] text-white flex items-center justify-center shadow-md">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#e3efe6] text-[#3f6b4f] border border-[#3f6b4f]/20">
                    {t('portalShuruaatBadge')}
                  </span>
                </div>

                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1f3a5f] mb-2">
                  {t('portalShuruaatTitle')}
                </h3>

                <p className="text-xs sm:text-sm text-[#5b4636] leading-relaxed mb-4">
                  {t('portalShuruaatDesc')}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e4d9c7]/70 space-y-2">
                <div className="text-[11px] font-semibold text-[#1f3a5f] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3f6b4f]"></span>
                  <span>{isHindi ? 'व्यापार विचार खोज (Idea Discovery)' : 'Tailored Business Idea Generator'}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#1f3a5f] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3f6b4f]"></span>
                  <span>{isHindi ? '5-चरणीय प्रारंभिक रोडमैप' : '5-Step Starter Launch Roadmap'}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#1f3a5f] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3f6b4f]"></span>
                  <span>{isHindi ? 'मुद्रा (शिशु) व पीएमईजीपी सब्सिडी' : 'Udyam, Mudra Shishu & PMEGP Schemes'}</span>
                </div>
              </div>
            </div>

            {/* PORTAL B: VISTAAR (EXISTING) */}
            <div
              onClick={() => handleSelect('existing')}
              className={'p-6 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between relative text-left ' + (
                portalType === 'existing'
                  ? 'bg-[#faf4e8] border-[#1f3a5f] shadow-lg ring-2 ring-[#1f3a5f]/20 scale-[1.01]'
                  : 'bg-[#fffdf9] border-[#e4d9c7] hover:border-[#1f3a5f]/40 hover:shadow-md'
              )}
            >
              {portalType === 'existing' && (
                <div className="absolute top-4 right-4 bg-[#1f3a5f] text-white p-1 rounded-full shadow-sm">
                  <CheckCircle2 className="w-5 h-5 fill-current text-[#e8a33d]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-md">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#efe6d6] text-[#1f3a5f] border border-[#1f3a5f]/20">
                    {t('portalVistaarBadge')}
                  </span>
                </div>

                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1f3a5f] mb-2">
                  {t('portalVistaarTitle')}
                </h3>

                <p className="text-xs sm:text-sm text-[#5b4636] leading-relaxed mb-4">
                  {t('portalVistaarDesc')}
                </p>
              </div>

              <div className="pt-4 border-t border-[#e4d9c7]/70 space-y-2">
                <div className="text-[11px] font-semibold text-[#1f3a5f] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1f3a5f]"></span>
                  <span>{isHindi ? 'मासिक लाभ-हानि व ब्रेक-इवन विश्लेषण' : 'Profit, Cash-Flow & Break-Even Metrics'}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#1f3a5f] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1f3a5f]"></span>
                  <span>{isHindi ? 'AGMARKNET थोक मंडी भाव से बचत' : 'AGMARKNET Wholesale Mandi Price Savings'}</span>
                </div>
                <div className="text-[11px] font-semibold text-[#1f3a5f] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1f3a5f]"></span>
                  <span>{isHindi ? 'ऋण जोखिम व विस्तार योजनाएं' : 'Financial Health Score & Expansion Credit'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e4d9c7]">
            <div className="text-xs text-[#8a7a68]">
              {isHindi
                ? `वर्तमान में चयनित: ${portalType === 'beginner' ? 'पोर्टल A (शुरुआत)' : 'पोर्टल B (विस्तार)'}`
                : `Active Selection: ${portalType === 'beginner' ? 'Portal A (Shuruaat)' : 'Portal B (Vistaar)'}`}
            </div>

            <button
              type="button"
              onClick={handleProceed}
              className="w-full sm:w-auto min-w-[220px] flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-heading font-bold text-sm bg-[#1f3a5f] text-white hover:bg-[#152742] transition shadow-md active:scale-98"
            >
              <span>{t('selectAndProceed')}</span>
              <ArrowRight className="w-4 h-4 text-[#e8a33d]" />
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
