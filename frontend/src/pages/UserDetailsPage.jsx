import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip, VoiceRow } from '../components/Common';
import Layout from '../components/Layout';
import { api } from '../services/api';

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { user, setUser, setUserId, t, lang } = useApp();
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
      progress={15}
      onBack={() => navigate('/')}
      onNext={handleNext}
      loading={loading}
    >
      <div>
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: "#1f3a5f" }}>
          {t("udTitle")}
        </h2>
        <p className="text-xs mb-4" style={{ color: "#8a7a68" }}>
          {t("trustLine")}
        </p>

        {error && (
          <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Section Audio Voice Row */}
        <VoiceRow
          textToRead={`${t("udTitle")}. ${t("udName")}`}
          onVoiceInput={(val) => {
            setError('');
            setUser((prev) => ({ ...prev, name: String(val) }));
          }}
          fieldType="text"
          currentValue={user.name}
        />

        {/* Name */}
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

        {/* Age */}
        <Field label={t("udAge")} optional>
          <TextInput
            type="number"
            value={user.age}
            onChange={(v) => setUser({ ...user, age: v })}
            placeholder="e.g. 35"
          />
        </Field>

        {/* Gender */}
        <Field label={t("udGender")} optional>
          <div className="flex gap-2">
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

        {/* Phone */}
        <Field label={t("udPhone")} optional>
          <TextInput
            type="tel"
            value={user.phone}
            onChange={(v) => setUser({ ...user, phone: v })}
            placeholder="10-digit mobile number"
          />
        </Field>
      </div>
    </Layout>
  );
}
