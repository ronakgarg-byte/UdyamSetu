import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip, VoiceRow } from '../components/Common';
import Layout from '../components/Layout';
import { api } from '../services/api';

export default function UserDetailsPage() {
  const navigate = useNavigate();
  const { t, lang, user, setUser, userId, setUserId } = useApp();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleNext = async () => {
    if (!user.name || user.name.trim().length === 0) {
      setErrorMsg(lang === 'en' ? 'Please enter your name' : 'कृपया अपना नाम दर्ज करें');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.createUser({
        name: user.name,
        age: user.age,
        gender: user.gender,
        phone: user.phone,
        preferred_language: lang,
        district: user.district || 'Varanasi',
      });

      if (res?.userId) {
        setUserId(res.userId);
        navigate('/questionnaire');
      }
    } catch (err) {
      console.error('Error saving user:', err);
      // Even if network fails locally, fallback to in-memory flow
      if (!userId) setUserId('local-user-' + Date.now());
      navigate('/questionnaire');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title={t("udTitle")}
      progress={20}
      onNext={handleNext}
      loading={loading}
    >
      <div>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm"
          style={{ backgroundColor: "#f3ede0" }}
        >
          <User size={24} color="#1f3a5f" />
        </div>
        <h2 className="font-heading text-xl font-bold mb-6" style={{ color: "#1f3a5f" }}>
          {t("udTitle")}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            {errorMsg}
          </div>
        )}

        <Field label={t("udName")}>
          <TextInput
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
            placeholder={lang === 'en' ? "e.g. Ramesh Kumar" : "उदा. रमेश कुमार"}
            autoFocus
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t("udAge")}>
            <TextInput
              type="number"
              value={user.age}
              onChange={(e) => setUser({ ...user, age: e.target.value })}
              placeholder="35"
            />
          </Field>
          <Field label={t("udPhone")}>
            <TextInput
              type="tel"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              placeholder="9876543210"
            />
          </Field>
        </div>

        <Field label={t("udGender")}>
          <div className="flex gap-2">
            {["male", "female", "other"].map((g) => (
              <Chip
                key={g}
                active={user.gender === g}
                onClick={() => setUser({ ...user, gender: g })}
              >
                {t(g)}
              </Chip>
            ))}
          </div>
        </Field>

        <VoiceRow label={t("speak")} />
      </div>
    </Layout>
  );
}
