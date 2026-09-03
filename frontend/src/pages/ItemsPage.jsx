import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip } from '../components/Common';
import Layout from '../components/Layout';
import { api } from '../services/api';

export default function ItemsPage() {
  const navigate = useNavigate();
  const { t, userId, items, setItems } = useApp();
  const [saving, setSaving] = useState(false);

  const addItem = () =>
    setItems([...items, { desc: "", sellPrice: "", costPrice: "", seasonal: "no" }]);

  const removeItem = (i) =>
    setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, key, val) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));

  const handleNext = async () => {
    if (userId) {
      setSaving(true);
      try {
        await api.saveItems(userId, items);
      } catch (err) {
        console.warn('Items sync warning (proceeding):', err.message);
      } finally {
        setSaving(false);
      }
    }
    navigate('/dashboard');
  };

  return (
    <Layout
      title={t("itemsTitle")}
      progress={80}
      onBack={() => navigate('/questionnaire')}
      onNext={handleNext}
      nextLabel={t("save")}
      loading={saving}
    >
      <div>
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: "#1f3a5f" }}>
          {t("itemsTitle")}
        </h2>
        <p className="text-sm mb-6" style={{ color: "#8a7a68" }}>
          {t("itemsSub")}
        </p>

        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-2xl border p-4 mb-4 relative shadow-sm"
            style={{ borderColor: "#e4d9c7", backgroundColor: "#fffdf9" }}
          >
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="absolute top-3.5 right-3.5 p-1 rounded-full hover:bg-red-50 text-red-600 transition-colors"
                aria-label="remove"
              >
                <Trash2 size={16} />
              </button>
            )}
            <Field label={t("itemDesc")}>
              <TextInput
                value={it.desc || ''}
                onChange={(e) => updateItem(i, "desc", e.target.value)}
                placeholder="e.g. Wheat Flour (10kg)"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("sellPrice")}>
                <TextInput
                  type="number"
                  value={it.sellPrice || ''}
                  onChange={(e) => updateItem(i, "sellPrice", e.target.value)}
                  placeholder="340"
                />
              </Field>
              <Field label={t("costPrice")}>
                <TextInput
                  type="number"
                  value={it.costPrice || ''}
                  onChange={(e) => updateItem(i, "costPrice", e.target.value)}
                  placeholder="290"
                />
              </Field>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-sm font-medium" style={{ color: "#33261a" }}>
                {t("seasonal")}
              </span>
              <div className="flex gap-2">
                <Chip
                  active={it.seasonal === "yes"}
                  onClick={() => updateItem(i, "seasonal", "yes")}
                >
                  {t("yes")}
                </Chip>
                <Chip
                  active={it.seasonal === "no"}
                  onClick={() => updateItem(i, "seasonal", "no")}
                >
                  {t("no")}
                </Chip>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed py-3.5 text-sm font-semibold transition-all hover:bg-[#e8a33d]/10 active:scale-[0.99]"
          style={{ borderColor: "#e8a33d", color: "#a36a2d" }}
        >
          <Plus size={16} /> {t("addItem")}
        </button>
      </div>
    </Layout>
  );
}
