import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip, VoiceRow } from './Common';
import Layout from './Layout';
import GoogleLocationPicker from './GoogleLocationPicker';
import {
  BEGINNER_INTEREST_OPTIONS,
  CAPITAL_RANGE_OPTIONS,
  SPACE_TYPE_OPTIONS,
  TIME_COMMITMENT_OPTIONS,
  BEGINNER_BARRIER_OPTIONS,
} from '../i18n/translations';
import { api } from '../services/api';
import { stopSpeaking } from '../utils/speechUtils';
import {
  Lightbulb,
  Wrench,
  Wallet,
  Compass,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export default function BeginnerQuestionnaire() {
  const navigate = useNavigate();
  const [bStep, setBStep] = useState(0); // 0..3

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

  const stepTitles = [
    t('discoveryStep1'),
    t('discoveryStep2'),
    t('discoveryStep3'),
    t('discoveryStep4'),
  ];

  const stepIcons = [Lightbulb, Wrench, Wallet, Compass];

  const commonSkillChips = [
    { key: 'cooking', en: 'Cooking & Snacks', hi: 'खाना बनाना व नाश्ता' },
    { key: 'sewing', en: 'Sewing / Tailoring Machine', hi: 'सिलाई मशीन व अनुभव' },
    { key: 'smartphone', en: 'Smartphone / Digital Apps', hi: 'स्मार्टफोन व डिजिटल समझ' },
    { key: 'vehicle', en: 'Two-Wheeler / Bike', hi: 'दोपहिया वाहन / बाइक' },
    { key: 'tools', en: 'Basic Hand Tools', hi: 'साधारण औजार' },
    { key: 'space_avail', en: 'Spare Room / Space at Home', hi: 'घर में खाली कमरा / जगह' },
  ];

  const handleBack = () => {
    stopSpeaking();
    if (bStep > 0) {
      setBStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/details');
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
            interests: beginnerData.interests,
            skills: beginnerData.skills,
            capital_range: beginnerData.capitalRange,
            space_type: beginnerData.spaceType,
            time_commitment: beginnerData.timeCommitment,
            barriers: beginnerData.barriers,
            address: beginnerData.address,
            location: beginnerData.location,
            district: beginnerData.district,
            state: beginnerData.state,
            pincode: beginnerData.pincode,
            lat: beginnerData.lat,
            lng: beginnerData.lng,
          });
        } catch (err) {
          console.warn('[BeginnerQuestionnaire] Background sync note:', err.message);
        }
      })();
    }

    if (bStep < 3) {
      setBStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/dashboard');
    }
  };

  const progressPct = 25 + ((bStep + 1) / 4) * 50;
  const CurrentIcon = stepIcons[bStep] || Lightbulb;

  return (
    <Layout
      title={stepTitles[bStep]}
      progress={progressPct}
      onBack={handleBack}
      onNext={handleNext}
      loading={false}
    >
      <div className="max-w-4xl w-full mx-auto">
        <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 sm:p-8 shadow-sm">
          {/* Section Header */}
          <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-[#e4d9c7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                <CurrentIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#a36a2d] uppercase tracking-wider">
                  {t('secDiscovery')} • {t('sectionOf')} {bStep + 1} / 4
                </p>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1f3a5f]">
                  {stepTitles[bStep]}
                </h2>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#e3efe6] text-[#3f6b4f] border border-[#3f6b4f]/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Portal A: Shuruaat</span>
            </div>
          </div>

          {/* STEP 0: Interest & Business Area */}
          {bStep === 0 && (
            <div className="space-y-4">
              <VoiceRow
                textToRead={
                  isHindi
                    ? `${t('qBeginnerInterest')} किराना, चाय नाश्ता, सिलाई, रिपेयरिंग या डेयरी जैसे विकल्पों में से चुनें।`
                    : `${t('qBeginnerInterest')} Select grocery, food stall, tailoring, repair, dairy or suggest for me.`
                }
                helperText={
                  isHindi
                    ? 'अपनी रुचि के एक या अधिक क्षेत्रों को चुनें'
                    : 'Select one or more fields of interest'
                }
              />

              <Field label={t('qBeginnerInterest')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {BEGINNER_INTEREST_OPTIONS.map((item) => {
                    const isSelected = (beginnerData.interests || []).includes(item.key);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() =>
                          toggle(
                            beginnerData.interests || [],
                            item.key,
                            (newList) => setBeginnerData({ ...beginnerData, interests: newList })
                          )
                        }
                        className={'p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex items-center justify-between ' + (
                          isSelected
                            ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                            : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                        )}
                      >
                        <span>{opt(item)}</span>
                        {isSelected && <span className="text-[#e8a33d] font-bold ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="pt-2">
                <Field label={isHindi ? "अन्य विचार या विवरण (वैकल्पिक)" : "Other custom idea / details (optional)"} optional>
                  <TextInput
                    value={beginnerData.customIdea || ''}
                    onChange={(v) => setBeginnerData({ ...beginnerData, customIdea: v })}
                    placeholder={isHindi ? "उदा. अगरबत्ती बनाना, मुर्गी पालन, मोबाइल दुकान" : "e.g. Incense making, poultry, mobile shop"}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* STEP 1: Skills & Existing Assets */}
          {bStep === 1 && (
            <div className="space-y-4">
              <VoiceRow
                textToRead={
                  isHindi
                    ? `${t('qBeginnerSkills')} अपने अनुभव, औजार या मशीनरी के बारे में बताएं।`
                    : `${t('qBeginnerSkills')} Mention your existing experience, equipment, or machinery.`
                }
                helperText={
                  isHindi
                    ? 'माइक दबाकर बोलें या नीचे दिए गए चिप्स पर टैप करें'
                    : 'Tap mic to speak or select quick tool chips'
                }
              />

              <Field label={t('qBeginnerSkills')}>
                <TextInput
                  value={beginnerData.skills || ''}
                  onChange={(v) => setBeginnerData({ ...beginnerData, skills: v })}
                  placeholder={
                    isHindi
                      ? "उदा. 2 साल सिलाई का अनुभव, घर में सिलाई मशीन है, बाइक है"
                      : "e.g. 2 years tailoring experience, have sewing machine, two-wheeler"
                  }
                />
              </Field>

              <div>
                <label className="text-xs font-semibold text-[#5b4636] mb-2 block">
                  {isHindi ? "त्वरित विकल्प जोड़ें:" : "Quick add skills & resources:"}
                </label>
                <div className="flex flex-wrap gap-2">
                  {commonSkillChips.map((chip) => {
                    const currentSkills = beginnerData.skills || '';
                    const chipLabel = isHindi ? chip.hi : chip.en;
                    const isIncluded = currentSkills.includes(chipLabel);
                    return (
                      <Chip
                        key={chip.key}
                        label={chipLabel}
                        selected={isIncluded}
                        onClick={() => {
                          if (isIncluded) {
                            setBeginnerData({
                              ...beginnerData,
                              skills: currentSkills.replace(chipLabel, '').replace(/^,s*|,s*$/g, '').trim(),
                            });
                          } else {
                            setBeginnerData({
                              ...beginnerData,
                              skills: currentSkills ? `${currentSkills}, ${chipLabel}` : chipLabel,
                            });
                          }
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Capital, Space & Commitment */}
          {bStep === 2 && (
            <div className="space-y-5">
              <VoiceRow
                textToRead={
                  isHindi
                    ? `${t('qBeginnerCapital')}. ${t('qBeginnerSpace')}`
                    : `${t('qBeginnerCapital')}. ${t('qBeginnerSpace')}`
                }
                helperText={
                  isHindi
                    ? 'अपनी प्रारंभिक पूंजी, कार्यक्षेत्र और समय सीमा चुनें'
                    : 'Select your budget, space, and time commitment'
                }
              />

              {/* Capital Range */}
              <Field label={t('qBeginnerCapital')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {CAPITAL_RANGE_OPTIONS.map((c) => {
                    const isSelected = beginnerData.capitalRange === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setBeginnerData({ ...beginnerData, capitalRange: c.key })}
                        className={'p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex items-center justify-between ' + (
                          isSelected
                            ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                            : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                        )}
                      >
                        <span>{opt(c)}</span>
                        {isSelected && <span className="text-[#e8a33d] font-bold ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Space Type */}
              <Field label={t('qBeginnerSpace')}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {SPACE_TYPE_OPTIONS.map((s) => {
                    const isSelected = beginnerData.spaceType === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setBeginnerData({ ...beginnerData, spaceType: s.key })}
                        className={'p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex items-center justify-between ' + (
                          isSelected
                            ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                            : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                        )}
                      >
                        <span>{opt(s)}</span>
                        {isSelected && <span className="text-[#e8a33d] font-bold ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Time Commitment */}
              <Field label={t('qBeginnerTime')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TIME_COMMITMENT_OPTIONS.map((tc) => {
                    const isSelected = beginnerData.timeCommitment === tc.key;
                    return (
                      <button
                        key={tc.key}
                        type="button"
                        onClick={() => setBeginnerData({ ...beginnerData, timeCommitment: tc.key })}
                        className={'p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex items-center justify-between ' + (
                          isSelected
                            ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                            : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                        )}
                      >
                        <span>{opt(tc)}</span>
                        {isSelected && <span className="text-[#e8a33d] font-bold ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>
          )}

          {/* STEP 3: Barriers & Google Location Pin */}
          {bStep === 3 && (
            <div className="space-y-5">
              <VoiceRow
                textToRead={
                  isHindi
                    ? `${t('qBeginnerBarrier')} और नीचे दिए गए गूगल मैप पर अपनी जगह का चयन करें।`
                    : `${t('qBeginnerBarrier')} and pin your location on the Google Map below.`
                }
                helperText={
                  isHindi
                    ? 'अपनी मुख्य बाधाओं को चुनें और मैप पर स्थान सेट करें'
                    : 'Select your key barriers and pin your local area on map'
                }
              />

              <Field label={t('qBeginnerBarrier')}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {BEGINNER_BARRIER_OPTIONS.map((b) => {
                    const isSelected = (beginnerData.barriers || []).includes(b.key);
                    return (
                      <button
                        key={b.key}
                        type="button"
                        onClick={() =>
                          toggle(
                            beginnerData.barriers || [],
                            b.key,
                            (newList) => setBeginnerData({ ...beginnerData, barriers: newList })
                          )
                        }
                        className={'p-3.5 rounded-2xl border text-xs font-semibold transition text-left flex items-center justify-between ' + (
                          isSelected
                            ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                            : 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7] hover:bg-[#efe6d6]'
                        )}
                      >
                        <span>{opt(b)}</span>
                        {isSelected && <span className="text-[#e8a33d] font-bold ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Google Map Interactive Location Picker */}
              <div className="mt-6 pt-5 border-t border-[#e4d9c7]">
                <GoogleLocationPicker />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
