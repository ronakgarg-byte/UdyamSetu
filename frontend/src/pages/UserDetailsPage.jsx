import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip, VoiceRow } from '../components/Common';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { User, ShieldCheck } from 'lucide-react';

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { user, setUser, setUserId, portalType, t, lang } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const genderOptions = [
    { key: "male", en: "Male", hi: "पुरुष" },
    { key: "female", en: "Female", hi: "महिला" },
    { key: "other", en: "Other", hi: "अन्य" },
  ];

  const handleNext = async () => {
    if (!user.name || user.name.trim().length === 0) {
      setError(lang === 'hi' ? 'कृपया अपना नाम दर्ज करें या बोलें' : 'Please enter or speak your name');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.createUser({
        name: user.name.trim(),
        age: user.age ? parseInt(user.age, 10) : null,
        gender: user.gender || null,
        phone: user.phone || '',
        preferred_language: lang,
        district: 'Varanasi',
        state: 'Uttar Pradesh',
        portal_type: portalType,
      });

      if (res?.userId) {
        setUserId(res.userId);
      }
      navigate('/questionnaire');
    } catch (err) {
      console.warn('API error during user registration, continuing with local session:', err.message);
      navigate('/questionnaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title={t("udTitle")}
      progress={20}
      onBack={() => navigate('/portal-select')}
      onNext={handleNext}
      loading={loading}
    >
      <div className="max-w-3xl w-full mx-auto">
        <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-[#e4d9c7]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                  <User className="w-4 h-4" />
                </div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1f3a5f]">
                  {t("udTitle")}
                </h2>
              </div>
              <p className="text-xs text-[#8a7a68]">
                {t("trustLine")}
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#efe6d6] text-[#a36a2d] border border-[#e4d9c7]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Step 1 of 4</span>
            </div>
          </div>

          {error && (
            <div className="p-3 mb-5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          {/* Section Audio Voice Guide */}
          <div className="mb-6">
            <VoiceRow
              textToRead={
                lang === 'hi'
                  ? `${t("udTitle")}। कृपया अपना नाम, उम्र और लिंग बताएं। आप किसी भी बॉक्स के माइक बटन को दबाकर बोल सकते हैं।`
                  : `${t("udTitle")}. Please provide your name, age, and details. You can tap the mic icon in each box to speak.`
              }
              helperText={
                lang === 'hi'
                  ? "प्रत्येक बॉक्स में माइक दबाकर अलग-अलग बोलें"
                  : "Tap the mic icon in each input box to speak"
              }
            />
          </div>

          {/* Form Fields in 2-Column Responsive Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Name - Full Width */}
            <div className="md:col-span-2">
              <Field label={t("udName")}>
                <TextInput
                  value={user.name}
                  onChange={(v) => {
                    setError('');
                    setUser({ ...user, name: v });
                  }}
                  placeholder={lang === 'hi' ? "उदा. रमेश कुमार" : "e.g. Ramesh Kumar"}
                />
              </Field>
            </div>

            {/* Age */}
            <div>
              <Field label={t("udAge")} optional>
                <TextInput
                  type="number"
                  value={user.age}
                  onChange={(v) => setUser({ ...user, age: v })}
                  placeholder={lang === 'hi' ? "उदा. 35" : "e.g. 35"}
                />
              </Field>
            </div>

            {/* Phone */}
            <div>
              <Field label={t("udPhone")} optional>
                <TextInput
                  type="tel"
                  value={user.phone}
                  onChange={(v) => setUser({ ...user, phone: v })}
                  placeholder={lang === 'hi' ? "10 अंकों का मोबाइल नंबर" : "10-digit mobile number"}
                />
              </Field>
            </div>

            {/* Gender - Full Width */}
            <div className="md:col-span-2">
              <Field label={t("udGender")} optional>
                <div className="flex flex-wrap items-center gap-2">
                  {genderOptions.map((g) => (
                    <Chip
                      key={g.key}
                      label={lang === 'hi' ? g.hi : g.en}
                      selected={user.gender === g.key}
                      onClick={() => setUser({ ...user, gender: g.key })}
                    />
                  ))}
                </div>
              </Field>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
