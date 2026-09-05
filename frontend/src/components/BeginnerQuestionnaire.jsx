import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip, VoiceRow } from './Common';
import Layout from './Layout';
import GoogleLocationPicker from './GoogleLocationPicker';
import {
  BEGINNER_CATEGORY_OPTIONS,
  BEGINNER_ENJOY_OPTIONS,
  BEGINNER_TOOLS_OPTIONS,
  BEGINNER_SPACE_OPTIONS,
  BEGINNER_CAPITAL_OPTIONS,
  BEGINNER_CAPITAL_SOURCE_OPTIONS,
  BEGINNER_TIME_OPTIONS,
  BEGINNER_BARRIER_OPTIONS,
  BEGINNER_FAMILY_SUPPORT_OPTIONS,
} from '../i18n/translations';
import { api } from '../services/api';
import { stopSpeaking } from '../utils/speechUtils';
import {
  Compass,
  Wrench,
  Wallet,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Plus,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

const DEFAULT_NEARBY_SUGGESTIONS = [
  { key: 'kirana', en: 'Daily Kirana / General Store', hi: 'किराना / जनरल स्टोर' },
  { key: 'tea_stall', en: 'Tea & Snacks Stall', hi: 'चाय व नाश्ता स्टॉल' },
  { key: 'tailor', en: 'Tailoring Shop', hi: 'सिलाई की दुकान' },
  { key: 'chakki', en: 'Flour Mill (Atta Chakki)', hi: 'आटा चक्की' },
  { key: 'mobile_shop', en: 'Mobile Recharge & Repair', hi: 'मोबाइल रिचार्ज व रिपेयर' },
  { key: 'fertilizer', en: 'Agro Seeds & Fertilizer', hi: 'खाद-बीज की दुकान' },
  { key: 'cycle_repair', en: 'Cycle / Bike Repair', hi: 'साइकिल / बाइक मरम्मत' },
  { key: 'medical', en: 'Chemist / Medical Store', hi: 'दवा / मेडिकल स्टोर' },
];

export default function BeginnerQuestionnaire() {
  const navigate = useNavigate();
  const [bStep, setBStep] = useState(0); // 0..4 (5 Sections: A1, A2, A3, A4, A5)
  const [customNearbyInput, setCustomNearbyInput] = useState('');

  const {
    t,
    opt,
    userId,
    beginnerData,
    setBeginnerData,
    toggle,
    lang,
  } = useApp();

  const isHindi = lang === 'hi';

  const sectionTitles = [
    t('secA1'), // Interest & Direction
    t('secA2'), // Resources & Skills
    t('secA3'), // Capital & Time
    t('secA4'), // Local Context & Demand
    t('secA5'), // Barriers & Support
  ];

  const sectionIcons = [Compass, Wrench, Wallet, MapPin, ShieldCheck];

  // Set default nearby suggestions on first load if empty
  useEffect(() => {
    if (!beginnerData.nearbyBusinesses || beginnerData.nearbyBusinesses.length === 0) {
      setBeginnerData((prev) => ({
        ...prev,
        nearbyBusinesses: ['kirana', 'tea_stall', 'tailor'],
      }));
    }
  }, []);

  const handleBack = () => {
    stopSpeaking();
    if (bStep > 0) {
      setBStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/portal-select');
    }
  };

  const handleNext = () => {
    stopSpeaking();

    // Background sync to backend
    if (userId) {
      (async () => {
        try {
          await api.saveBusiness(userId, {
            portal_type: 'beginner',
            knows_idea: beginnerData.knowsIdea || 'no',
            idea_category: beginnerData.ideaCategory || '',
            what: beginnerData.customIdea || beginnerData.ideaCategory || '',
            enjoy_doing: beginnerData.enjoyDoing || [],
            trade_training: beginnerData.tradeTraining === 'yes' ? (beginnerData.tradeTrainingDetails || 'yes') : 'no',
            tools_owned: beginnerData.toolsOwned || [],
            space_available: beginnerData.spaceAvailable || 'home',
            capital_range: beginnerData.capitalRange || '5k_25k',
            capital_source: beginnerData.capitalSource || 'savings',
            time_commitment: beginnerData.timeCommitment || 'full_time',
            nearby_businesses: beginnerData.nearbyBusinesses || [],
            unmet_need: beginnerData.unmetNeed || '',
            barriers: beginnerData.barriers || [],
            family_support: beginnerData.familySupport || 'yes',
            address: beginnerData.address || '',
            location: beginnerData.location || '',
            district: beginnerData.district || 'Varanasi',
            state: beginnerData.state || 'Uttar Pradesh',
            pincode: beginnerData.pincode || '',
            lat: beginnerData.lat,
            lng: beginnerData.lng,
          });
        } catch (err) {
          console.warn('[BeginnerQuestionnaire] Background sync note:', err.message);
        }
      })();
    }

    if (bStep < 4) {
      setBStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/dashboard');
    }
  };

  const handleAddCustomNearby = () => {
    const val = customNearbyInput.trim();
    if (!val) return;
    const current = beginnerData.nearbyBusinesses || [];
    if (!current.includes(val)) {
      setBeginnerData({
        ...beginnerData,
        nearbyBusinesses: [...current, val],
      });
    }
    setCustomNearbyInput('');
  };

  const progressPct = 20 + ((bStep + 1) / 5) * 60;
  const CurrentIcon = sectionIcons[bStep] || Compass;

  return (
    <Layout
      title={sectionTitles[bStep]}
      progress={progressPct}
      onBack={handleBack}
      onNext={handleNext}
      loading={false}
    >
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 sm:p-8 shadow-sm">
          {/* Section Header */}
          <div className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-[#e4d9c7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                <CurrentIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#a36a2d] uppercase tracking-wider">
                  {t('sectionOf')} {bStep + 1} / 5 • Portal A: Shuruaat
                </p>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1f3a5f]">
                  {sectionTitles[bStep]}
                </h2>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e3efe6] text-[#2d5a3c] border border-[#c3dfcc]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discovery Mode</span>
            </div>
          </div>

          {/* ==================================================== */}
          {/* SECTION A1 — Interest & Direction                   */}
          {/* ==================================================== */}
          {bStep === 0 && (
            <div className="space-y-6">
              <VoiceRow
                textToRead={`${t('secA1')}. ${t('qKnowsIdea')}`}
                helperText={
                  isHindi
                    ? "यदि आपके मन में कोई विचार है तो 'हाँ' चुनें, अन्यथा 'नहीं, मुझे सुझाव दें' चुनें"
                    : "Choose Yes if you have an idea in mind, or No if you want AI to suggest one"
                }
              />

              {/* Q1: Do you know which business you want to start? */}
              <Field label={t('qKnowsIdea')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBeginnerData({ ...beginnerData, knowsIdea: 'yes' })}
                    className={`p-4 rounded-2xl border text-sm font-semibold transition text-left flex items-center justify-between ${
                      beginnerData.knowsIdea === 'yes'
                        ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                        : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">💡</span>
                      <div>
                        <p className="font-bold">{t('optKnowsYes')}</p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {isHindi ? "मेरे पास श्रेणी या उत्पाद का विचार है" : "I have a category or product in mind"}
                        </p>
                      </div>
                    </div>
                    {beginnerData.knowsIdea === 'yes' && <CheckCircle2 className="w-5 h-5 text-[#e8a33d]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setBeginnerData({ ...beginnerData, knowsIdea: 'no' })}
                    className={`p-4 rounded-2xl border text-sm font-semibold transition text-left flex items-center justify-between ${
                      beginnerData.knowsIdea === 'no'
                        ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                        : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🧭</span>
                      <div>
                        <p className="font-bold">{t('optKnowsNo')}</p>
                        <p className="text-[11px] opacity-80 mt-0.5">
                          {isHindi ? "मेरे हुनर व बजट अनुसार सुझाव दें" : "Suggest based on my skills & budget"}
                        </p>
                      </div>
                    </div>
                    {beginnerData.knowsIdea === 'no' && <CheckCircle2 className="w-5 h-5 text-[#e8a33d]" />}
                  </button>
                </div>
              </Field>

              {/* Q2: If Yes -> What category? */}
              {beginnerData.knowsIdea === 'yes' && (
                <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7] space-y-4 animate-fadeIn">
                  <Field label={t('qIdeaCategory')}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {BEGINNER_CATEGORY_OPTIONS.map((cat) => {
                        const isSelected = beginnerData.ideaCategory === cat.key;
                        return (
                          <button
                            key={cat.key}
                            type="button"
                            onClick={() => setBeginnerData({ ...beginnerData, ideaCategory: cat.key })}
                            className={`p-3 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                                : 'bg-[#fffdf9] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                            }`}
                          >
                            <span>{opt(cat)}</span>
                            {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </Field>

                  <Field label={isHindi ? "विशिष्ट उत्पाद या विचार (वैकल्पिक)" : "Specify exact item or detail (Optional)"} optional>
                    <TextInput
                      value={beginnerData.customIdea || ''}
                      onChange={(v) => setBeginnerData({ ...beginnerData, customIdea: v })}
                      placeholder={isHindi ? "उदा. चाय व समोसा स्टॉल, रेडीमेड कुर्ती, मोबाइल बैक कवर..." : "e.g. Tea & snacks stall, kurti stitching, mobile covers..."}
                    />
                  </Field>
                </div>
              )}

              {/* Q3: If "suggest me" -> What are you good at / enjoy doing? */}
              {(beginnerData.knowsIdea === 'no' || !beginnerData.knowsIdea) && (
                <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7] space-y-4 animate-fadeIn">
                  <Field label={t('qEnjoyDoing')}>
                    <p className="text-xs text-[#8a7a68] mb-3">
                      {isHindi
                        ? "लागू होने वाले सभी हुनर या रुचियों को चुनें:"
                        : "Select all hobbies, skills, or tasks you enjoy doing:"}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {BEGINNER_ENJOY_OPTIONS.map((item) => {
                        const isSelected = (beginnerData.enjoyDoing || []).includes(item.key);
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() =>
                              toggle(
                                beginnerData.enjoyDoing || [],
                                item.key,
                                (newList) => setBeginnerData({ ...beginnerData, enjoyDoing: newList })
                              )
                            }
                            className={`p-3 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                              isSelected
                                ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                                : 'bg-[#fffdf9] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                            }`}
                          >
                            <span>{opt(item)}</span>
                            {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION A2 — Resources & Skills                      */}
          {/* ==================================================== */}
          {bStep === 1 && (
            <div className="space-y-6">
              <VoiceRow
                textToRead={`${t('secA2')}. ${t('qTradeTraining')}. ${t('qToolsOwned')}`}
                helperText={
                  isHindi
                    ? "अपने पास पहले से मौजूद हुनर, मशीनरी या दुकान स्थान के बारे में बताएं"
                    : "Tell us about any training, tools, machinery, or space you currently have"
                }
              />

              {/* Q4: Skill / Training certificate */}
              <Field label={t('qTradeTraining')}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setBeginnerData({ ...beginnerData, tradeTraining: 'yes' })}
                    className={`p-3.5 rounded-xl border text-xs font-semibold transition text-center ${
                      beginnerData.tradeTraining === 'yes'
                        ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                        : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                    }`}
                  >
                    {t('yes')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBeginnerData({ ...beginnerData, tradeTraining: 'no', tradeTrainingDetails: '' })}
                    className={`p-3.5 rounded-xl border text-xs font-semibold transition text-center ${
                      beginnerData.tradeTraining === 'no'
                        ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                        : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                    }`}
                  >
                    {t('no')}
                  </button>
                </div>

                {beginnerData.tradeTraining === 'yes' && (
                  <TextInput
                    value={beginnerData.tradeTrainingDetails || ''}
                    onChange={(v) => setBeginnerData({ ...beginnerData, tradeTrainingDetails: v })}
                    placeholder={t('qTradeTrainingSpecify')}
                  />
                )}
              </Field>

              {/* Q5: Tools / Equipment / Vehicle usable for business */}
              <div className="pt-4 border-t border-[#e4d9c7]">
                <Field label={t('qToolsOwned')}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {BEGINNER_TOOLS_OPTIONS.map((tool) => {
                      const isSelected = (beginnerData.toolsOwned || []).includes(tool.key);
                      return (
                        <button
                          key={tool.key}
                          type="button"
                          onClick={() => {
                            if (tool.key === 'none') {
                              setBeginnerData({ ...beginnerData, toolsOwned: ['none'] });
                            } else {
                              const filtered = (beginnerData.toolsOwned || []).filter((x) => x !== 'none');
                              toggle(filtered, tool.key, (newList) =>
                                setBeginnerData({ ...beginnerData, toolsOwned: newList })
                              );
                            }
                          }}
                          className={`p-3 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                              : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                          }`}
                        >
                          <span>{opt(tool)}</span>
                          {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              {/* Q6: Land / Space available */}
              <div className="pt-4 border-t border-[#e4d9c7]">
                <Field label={t('qSpaceAvailable')}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {BEGINNER_SPACE_OPTIONS.map((sp) => {
                      const isSelected = beginnerData.spaceAvailable === sp.key;
                      return (
                        <button
                          key={sp.key}
                          type="button"
                          onClick={() => setBeginnerData({ ...beginnerData, spaceAvailable: sp.key })}
                          className={`p-3.5 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                              : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                          }`}
                        >
                          <span>{opt(sp)}</span>
                          {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION A3 — Capital & Time                          */}
          {/* ==================================================== */}
          {bStep === 2 && (
            <div className="space-y-6">
              <VoiceRow
                textToRead={`${t('secA3')}. ${t('qCapitalRange')}. ${t('qCapitalSource')}`}
                helperText={
                  isHindi
                    ? "उपलब्ध या व्यवस्थित की जा सकने वाली पूंजी और दैनिक समय चुनें"
                    : "Select your starting capital range and daily hours commitment"
                }
              />

              {/* Q7: Capital range */}
              <Field label={t('qCapitalRange')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BEGINNER_CAPITAL_OPTIONS.map((cap) => {
                    const isSelected = beginnerData.capitalRange === cap.key;
                    return (
                      <button
                        key={cap.key}
                        type="button"
                        onClick={() => setBeginnerData({ ...beginnerData, capitalRange: cap.key })}
                        className={`p-3.5 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                            : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Wallet className="w-4 h-4 text-[#a36a2d]" />
                          <span>{opt(cap)}</span>
                        </div>
                        {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Q8: Where would capital come from? */}
              <div className="pt-4 border-t border-[#e4d9c7]">
                <Field label={t('qCapitalSource')}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {BEGINNER_CAPITAL_SOURCE_OPTIONS.map((src) => {
                      const isSelected = beginnerData.capitalSource === src.key;
                      return (
                        <button
                          key={src.key}
                          type="button"
                          onClick={() => setBeginnerData({ ...beginnerData, capitalSource: src.key })}
                          className={`p-3.5 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                              : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                          }`}
                        >
                          <span>{opt(src)}</span>
                          {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              {/* Q9: Daily time commitment */}
              <div className="pt-4 border-t border-[#e4d9c7]">
                <Field label={t('qDailyTime')}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {BEGINNER_TIME_OPTIONS.map((tm) => {
                      const isSelected = beginnerData.timeCommitment === tm.key;
                      return (
                        <button
                          key={tm.key}
                          type="button"
                          onClick={() => setBeginnerData({ ...beginnerData, timeCommitment: tm.key })}
                          className={`p-3.5 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                              : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                          }`}
                        >
                          <span>{opt(tm)}</span>
                          {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION A4 — Local Context & Demand                  */}
          {/* ==================================================== */}
          {bStep === 3 && (
            <div className="space-y-6">
              <VoiceRow
                textToRead={`${t('secA4')}. ${t('qLocation')}. ${t('qNearbyBusinesses')}`}
                helperText={
                  isHindi
                    ? "Google Maps द्वारा अपना स्थान पिन करें और आस-पास के मौजूदा व्यवसाय सत्यापित करें"
                    : "Pin your location on the map and verify businesses operating nearby"
                }
              />

              {/* Q10: Location via Google Maps */}
              <div className="space-y-3">
                <Field label={t('qLocation')}>
                  <GoogleLocationPicker />
                </Field>
              </div>

              {/* Q11: What businesses already exist nearby? */}
              <div className="pt-4 border-t border-[#e4d9c7]">
                <Field label={t('qNearbyBusinesses')}>
                  <p className="text-xs text-[#8a7a68] mb-2.5">
                    {t('qNearbyAutoFetched')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {DEFAULT_NEARBY_SUGGESTIONS.map((item) => {
                      const isSelected = (beginnerData.nearbyBusinesses || []).includes(item.key);
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            toggle(
                              beginnerData.nearbyBusinesses || [],
                              item.key,
                              (newList) => setBeginnerData({ ...beginnerData, nearbyBusinesses: newList })
                            )
                          }
                          className={`p-2.5 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                              : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                          }`}
                        >
                          <span className="truncate">{opt(item)}</span>
                          {isSelected && <span className="text-[#e8a33d] font-bold ml-1">✓</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom nearby shop */}
                  <div className="flex items-center gap-2 mt-2">
                    <TextInput
                      value={customNearbyInput}
                      onChange={setCustomNearbyInput}
                      placeholder={isHindi ? "अन्य आस-पास की दुकान जोड़ें..." : "Add other nearby business..."}
                      voice={false}
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomNearby}
                      className="px-3.5 py-2.5 rounded-lg bg-[#1f3a5f] text-white text-xs font-semibold hover:bg-[#152740] shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isHindi ? "जोड़ें" : "Add"}</span>
                    </button>
                  </div>
                </Field>
              </div>

              {/* Q12: Unmet local need */}
              <div className="pt-4 border-t border-[#e4d9c7]">
                <Field label={t('qUnmetNeed')} optional>
                  <TextInput
                    value={beginnerData.unmetNeed || ''}
                    onChange={(v) => setBeginnerData({ ...beginnerData, unmetNeed: v })}
                    placeholder={t('qUnmetNeedPlaceholder')}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* SECTION A5 — Barriers & Support                      */}
          {/* ==================================================== */}
          {bStep === 4 && (
            <div className="space-y-6">
              <VoiceRow
                textToRead={`${t('secA5')}. ${t('qBarriers')}. ${t('qFamilySupport')}`}
                helperText={
                  isHindi
                    ? "अपनी सबसे मुख्य बाधा और पारिवारिक समर्थन चुनें ताकि हम सही योजना व लोन मिला सकें"
                    : "Select your main barriers and family support to match the right schemes & handholding"
                }
              />

              {/* Q13: Biggest barrier stopping from starting */}
              <Field label={t('qBarriers')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BEGINNER_BARRIER_OPTIONS.map((bar) => {
                    const isSelected = (beginnerData.barriers || []).includes(bar.key);
                    return (
                      <button
                        key={bar.key}
                        type="button"
                        onClick={() =>
                          toggle(
                            beginnerData.barriers || [],
                            bar.key,
                            (newList) => setBeginnerData({ ...beginnerData, barriers: newList })
                          )
                        }
                        className={`p-3.5 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                            : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                        }`}
                      >
                        <span>{opt(bar)}</span>
                        {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Q14: Family support */}
              <div className="pt-4 border-t border-[#e4d9c7]">
                <Field label={t('qFamilySupport')}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {BEGINNER_FAMILY_SUPPORT_OPTIONS.map((fs) => {
                      const isSelected = beginnerData.familySupport === fs.key;
                      return (
                        <button
                          key={fs.key}
                          type="button"
                          onClick={() => setBeginnerData({ ...beginnerData, familySupport: fs.key })}
                          className={`p-3.5 rounded-xl border text-xs font-semibold transition text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                              : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                          }`}
                        >
                          <span>{opt(fs)}</span>
                          {isSelected && <span className="text-[#e8a33d] font-bold">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>

              {/* Completion Banner */}
              <div className="p-4 rounded-2xl bg-[#e3efe6] border border-[#c3dfcc] flex items-center gap-3 text-xs text-[#2d5a3c]">
                <Sparkles className="w-5 h-5 shrink-0 text-[#2d5a3c]" />
                <p className="font-semibold">
                  {isHindi
                    ? "बधाई! आपके उत्तरों के आधार पर एआई उपयुक्त व्यापार विचार, 5-चरणीय प्रारंभिक रोडमैप और सरकारी योजनाओं की सूची तैयार करेगा।"
                    : "Great! Based on your responses, AI will generate a tailored business idea, 5-step starter roadmap, and government starter schemes."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
