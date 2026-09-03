import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip, VoiceRow } from '../components/Common';
import Layout from '../components/Layout';
import { EXPENSE_FIELDS, CUSTOMER_OPTIONS, PROBLEM_OPTIONS } from '../i18n/translations';
import { api } from '../services/api';

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [qStep, setQStep] = useState(0); // 0..5
  const [saving, setSaving] = useState(false);

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
    if (qStep > 0) {
      setQStep(qStep - 1);
    } else {
      navigate('/details');
    }
  };

  const handleNext = async () => {
    if (userId) {
      setSaving(true);
      try {
        if (qStep === 0) {
          await api.saveBusiness(userId, biz);
        } else if (qStep === 1) {
          await api.saveSales(userId, sales);
        } else if (qStep === 2) {
          await api.saveExpenses(userId, expenses);
        } else if (qStep === 5) {
          await api.saveProfile(userId, {
            customers,
            competition,
            problems,
          });
        }
      } catch (err) {
        console.warn('API sync warning (proceeding):', err.message);
      } finally {
        setSaving(false);
      }
    }

    if (qStep < 5) {
      setQStep(qStep + 1);
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
      loading={saving}
    >
      <div>
        <p className="text-xs font-semibold mb-1" style={{ color: "#a36a2d" }}>
          {t("sectionOf")} {qStep + 1} / 6
        </p>
        <h2 className="font-heading text-xl font-bold mb-6" style={{ color: "#1f3a5f" }}>
          {sectionTitles[qStep]}
        </h2>

        {/* Section A: Your business */}
        {qStep === 0 && (
          <>
            <Field label={t("qBizType")}>
              <TextInput
                value={biz.type}
                onChange={(e) => setBiz({ ...biz, type: e.target.value })}
                placeholder="e.g. Grocery / Kirana"
              />
            </Field>
            <Field label={t("qBizWhat")}>
              <TextInput
                value={biz.what}
                onChange={(e) => setBiz({ ...biz, what: e.target.value })}
                placeholder="e.g. Grains, spices, packaged snacks"
              />
            </Field>
            <Field label={t("qWorkers")}>
              <TextInput
                type="number"
                value={biz.workers}
                onChange={(e) => setBiz({ ...biz, workers: e.target.value })}
                placeholder="1"
              />
            </Field>
            <Field label={t("qHours")}>
              <TextInput
                value={biz.hours}
                onChange={(e) => setBiz({ ...biz, hours: e.target.value })}
                placeholder="e.g. 8:00 AM - 8:00 PM"
              />
            </Field>
          </>
        )}

        {/* Section B: Sales & revenue */}
        {qStep === 1 && (
          <>
            <Field label={t("qCustomersPerDay")}>
              <TextInput
                type="number"
                value={sales.customersPerDay}
                onChange={(e) => setSales({ ...sales, customersPerDay: e.target.value })}
                placeholder="40"
              />
            </Field>
            <Field label={t("qDailySales")}>
              <TextInput
                type="number"
                value={sales.dailySales}
                onChange={(e) => setSales({ ...sales, dailySales: e.target.value })}
                placeholder="2000"
              />
            </Field>
            <Field label={t("qMonthlyRevenue")} hint={t("optional")}>
              <TextInput
                type="number"
                value={sales.monthlyRevenue}
                onChange={(e) => setSales({ ...sales, monthlyRevenue: e.target.value })}
                placeholder="60000"
              />
            </Field>
          </>
        )}

        {/* Section C: Monthly expenses */}
        {qStep === 2 && (
          <>
            {EXPENSE_FIELDS.map((f) => (
              <Field key={f.key} label={opt(f)} hint={f.key === "emi" ? t("optional") : undefined}>
                <TextInput
                  type="number"
                  value={expenses[f.key] || ""}
                  onChange={(e) => setExpenses({ ...expenses, [f.key]: e.target.value })}
                  placeholder="0"
                />
              </Field>
            ))}
          </>
        )}

        {/* Section D: Your customers */}
        {qStep === 3 && (
          <Field label={t("qCustomersWho")} hint={t("optional")}>
            <div className="flex flex-wrap gap-2 pt-1">
              {CUSTOMER_OPTIONS.map((c) => (
                <Chip
                  key={c.key}
                  active={customers.includes(c.key)}
                  onClick={() => toggle(customers, setCustomers, c.key)}
                >
                  {opt(c)}
                </Chip>
              ))}
            </div>
          </Field>
        )}

        {/* Section E: Competition nearby */}
        {qStep === 4 && (
          <>
            <Field label={t("qCompetitionCount")}>
              <TextInput
                type="number"
                value={competition.count}
                onChange={(e) => setCompetition({ ...competition, count: e.target.value })}
                placeholder="2"
              />
            </Field>
            <Field label={t("qCompetitionWhere")}>
              <TextInput
                value={competition.where}
                onChange={(e) => setCompetition({ ...competition, where: e.target.value })}
                placeholder="e.g. Near main village square"
              />
            </Field>
          </>
        )}

        {/* Section F: Biggest problem */}
        {qStep === 5 && (
          <Field label={t("qProblem")} hint={t("optional")}>
            <div className="flex flex-wrap gap-2 pt-1">
              {PROBLEM_OPTIONS.map((p) => (
                <Chip
                  key={p.key}
                  active={problems.includes(p.key)}
                  onClick={() => toggle(problems, setProblems, p.key)}
                >
                  {opt(p)}
                </Chip>
              ))}
            </div>
          </Field>
        )}

        <VoiceRow label={t("speak")} />
      </div>
    </Layout>
  );
}
