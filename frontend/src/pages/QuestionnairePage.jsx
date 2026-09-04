import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip, VoiceRow } from '../components/Common';
import Layout from '../components/Layout';
import GoogleLocationPicker from '../components/GoogleLocationPicker';
import { EXPENSE_FIELDS, CUSTOMER_OPTIONS, PROBLEM_OPTIONS } from '../i18n/translations';
import { api } from '../services/api';
import { stopSpeaking } from '../utils/speechUtils';

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [qStep, setQStep] = useState(0); // 0..5

  const {
    t,
    opt,
    userId,
    biz,
    setBiz,
    sales,
    setSales,
    expenses,
    setExpenses,
    customers,
    setCustomers,
    competition,
    setCompetition,
    problems,
    setProblems,
    toggle,
    lang,
  } = useApp();

  const sectionTitles = [
    t("secA"),
    t("secB"),
    t("secC"),
    t("secD"),
    t("secE"),
    t("secF"),
  ];

  const handleBack = () => {
    stopSpeaking();
    if (qStep > 0) {
      setQStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/details');
    }
  };

  const handleNext = () => {
    // 1. Immediately stop any active TTS reading
    stopSpeaking();

    // 2. Perform background async sync to backend (non-blocking)
    if (userId) {
      const stepToSave = qStep;
      (async () => {
        try {
          if (stepToSave === 0) {
            await api.saveBusiness(userId, biz);
          } else if (stepToSave === 1) {
            await api.saveSales(userId, sales);
          } else if (stepToSave === 2) {
            await api.saveExpenses(userId, expenses);
          } else if (stepToSave === 5) {
            await api.saveProfile(userId, {
              customers,
              competition,
              problems,
            });
          }
        } catch (err) {
          console.warn('[QuestionnairePage] Background sync note:', err.message);
        }
      })();
    }

    // 3. Immediately transition to next slide
    if (qStep < 5) {
      setQStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/items');
    }
  };

  // Progress: 20% to 60%
  const progressPct = 20 + ((qStep + 1) / 6) * 40;

  return (
    <Layout
      title={sectionTitles[qStep]}
      progress={progressPct}
      onBack={handleBack}
      onNext={handleNext}
      loading={false}
    >
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: "#a36a2d" }}>
          {t("sectionOf")} {qStep + 1} / 6
        </p>
        <h2 className="font-heading text-xl font-bold mb-4" style={{ color: "#1f3a5f" }}>
          {sectionTitles[qStep]}
        </h2>

        {/* Section A: Your business */}
        {qStep === 0 && (
          <div>
            <VoiceRow
              textToRead={`${t("secA")}. ${t("qBizType")}. ${t("qBizWhat")}`}
              helperText={
                lang === 'hi'
                  ? "प्रत्येक इनपुट बॉक्स के माइक बटन को दबाकर बोलें"
                  : "Tap the mic icon in any box to speak your answer"
              }
            />

            <Field label={t("qBizType")}>
              <TextInput
                value={biz.type}
                onChange={(v) => setBiz({ ...biz, type: v })}
                placeholder={lang === 'hi' ? "उदा. किराना दुकान, चाय की दुकान, सिलाई" : "e.g. Kirana store, tea stall, tailoring"}
              />
            </Field>
            <Field label={t("qBizWhat")}>
              <TextInput
                value={biz.what}
                onChange={(v) => setBiz({ ...biz, what: v })}
                placeholder={lang === 'hi' ? "उदा. मसाले, नमकीन, दैनिक सामान" : "e.g. Spices, snacks, daily essentials"}
              />
            </Field>
            <Field label={t("qWorkers")} optional>
              <TextInput
                type="number"
                value={biz.workers}
                onChange={(v) => setBiz({ ...biz, workers: v })}
                placeholder="e.g. 2"
              />
            </Field>
            <Field label={t("qHours")} optional>
              <TextInput
                value={biz.hours}
                onChange={(v) => setBiz({ ...biz, hours: v })}
                placeholder="e.g. 7 AM - 9 PM"
              />
            </Field>

            {/* Google Map Interactive Location Picker */}
            <div className="mt-5 pt-3 border-t border-[#e4d9c7]">
              <GoogleLocationPicker />
            </div>
          </div>
        )}

        {/* Section B: Sales & revenue */}
        {qStep === 1 && (
          <div>
            <VoiceRow
              textToRead={`${t("secB")}. ${t("qDailySales")}. ${t("qMonthlyRevenue")}`}
              helperText={
                lang === 'hi'
                  ? "दैनिक बिक्री या मासिक आय बोलने के लिए माइक दबाएं"
                  : "Tap mic on any box to speak your sales numbers"
              }
            />

            <Field label={t("qCustomersPerDay")} optional>
              <TextInput
                type="number"
                value={sales.customersPerDay}
                onChange={(v) => setSales({ ...sales, customersPerDay: v })}
                placeholder="e.g. 40"
              />
            </Field>
            <Field label={t("qDailySales")}>
              <TextInput
                type="number"
                value={sales.dailySales}
                onChange={(v) => {
                  const ds = v;
                  const mr = ds ? String(Number(ds) * 30) : sales.monthlyRevenue;
                  setSales({ ...sales, dailySales: ds, monthlyRevenue: mr });
                }}
                placeholder="e.g. 2000"
              />
            </Field>
            <Field label={t("qMonthlyRevenue")} optional>
              <TextInput
                type="number"
                value={sales.monthlyRevenue}
                onChange={(v) => setSales({ ...sales, monthlyRevenue: v })}
                placeholder="e.g. 60000"
              />
            </Field>
          </div>
        )}

        {/* Section C: Monthly expenses */}
        {qStep === 2 && (
          <div>
            <VoiceRow
              textToRead={`${t("secC")}. ${lang === 'hi' ? "किराया, कच्चा माल, बिजली और अन्य मासिक खर्च बताएं।" : "Please enter your monthly expenses like rent, raw materials, and electricity."}`}
              helperText={
                lang === 'hi'
                  ? "प्रत्येक खर्च के सामने माइक दबाकर रकम बोलें (उदा. 'पांच हजार')"
                  : "Tap mic on any expense box to speak the amount (e.g. '5000')"
              }
            />

            {EXPENSE_FIELDS.map((f) => (
              <Field key={f.key} label={opt(f)} optional>
                <TextInput
                  type="number"
                  value={expenses[f.key] || ""}
                  onChange={(v) => setExpenses({ ...expenses, [f.key]: v })}
                  placeholder="₹ 0"
                />
              </Field>
            ))}
          </div>
        )}

        {/* Section D: Your customers */}
        {qStep === 3 && (
          <div>
            <VoiceRow
              textToRead={`${t("secD")}. ${t("qCustomersWho")}`}
              onVoiceInput={(val) => {
                if (val && typeof val === 'string') {
                  toggle(customers, val, setCustomers);
                }
              }}
              fieldType="chips"
              options={CUSTOMER_OPTIONS}
            />

            <label className="text-xs font-semibold block mb-2" style={{ color: "#5b4636" }}>
              {t("qCustomersWho")}
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {CUSTOMER_OPTIONS.map((c) => (
                <Chip
                  key={c.key}
                  label={opt(c)}
                  selected={customers.includes(c.key)}
                  onClick={() => toggle(customers, c.key, setCustomers)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section E: Competition nearby */}
        {qStep === 4 && (
          <div>
            <VoiceRow
              textToRead={`${t("secE")}. ${t("qCompetitionCount")}. ${t("qCompetitionWhere")}`}
              helperText={
                lang === 'hi'
                  ? "प्रतियोगियों की संख्या या स्थान बोलने के लिए माइक दबाएं"
                  : "Tap mic on any box to speak"
              }
            />

            <Field label={t("qCompetitionCount")}>
              <TextInput
                type="number"
                value={competition.count}
                onChange={(v) => setCompetition({ ...competition, count: v })}
                placeholder="e.g. 3"
              />
            </Field>
            <Field label={t("qCompetitionWhere")} optional>
              <TextInput
                value={competition.where}
                onChange={(v) => setCompetition({ ...competition, where: v })}
                placeholder="e.g. Same street, across the market"
              />
            </Field>
          </div>
        )}

        {/* Section F: Biggest problem */}
        {qStep === 5 && (
          <div>
            <VoiceRow
              textToRead={`${t("secF")}. ${t("qProblem")}`}
              onVoiceInput={(val) => {
                if (val && typeof val === 'string') {
                  toggle(problems, val, setProblems);
                }
              }}
              fieldType="chips"
              options={PROBLEM_OPTIONS}
            />

            <label className="text-xs font-semibold block mb-2" style={{ color: "#5b4636" }}>
              {t("qProblem")}
            </label>
            <div className="flex flex-col gap-2 mb-4">
              {PROBLEM_OPTIONS.map((p) => {
                const selected = problems.includes(p.key);
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => toggle(problems, p.key, setProblems)}
                    className="text-xs font-medium p-3 rounded-xl border transition-all text-left flex items-center justify-between"
                    style={{
                      background: selected ? "#1f3a5f" : "#fffdf9",
                      color: selected ? "#fffdf9" : "#5b4636",
                      borderColor: selected ? "#1f3a5f" : "#e4d9c7",
                    }}
                  >
                    <span>{opt(p)}</span>
                    {selected && <span className="font-bold text-xs ml-2">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
