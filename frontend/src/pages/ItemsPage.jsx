import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip } from '../components/Common';
import Layout from '../components/Layout';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function ItemsPage() {
  const navigate = useNavigate();
  const { items, setItems, userId, t } = useApp();
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { desc: '', sellPrice: '', costPrice: '', seasonal: 'no' },
    ]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

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
      progress={75}
      onBack={() => navigate('/questionnaire')}
      onNext={handleNext}
      actionLabel={t("save")}
      loading={saving}
    >
      <div>
        <h2 className="font-heading text-xl font-bold mb-1" style={{ color: "#1f3a5f" }}>
          {t("itemsTitle")}
        </h2>
        <p className="text-xs mb-6" style={{ color: "#8a7a68" }}>
          {t("itemsSub")}
        </p>

        <div className="space-y-6">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border relative"
              style={{ background: "#fffdf9", borderColor: "#e4d9c7" }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold" style={{ color: "#a36a2d" }}>
                  #{idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Item Description */}
              <Field label={t("itemDesc")}>
                <TextInput
                  value={item.desc}
                  onChange={(v) => updateItem(idx, 'desc', v)}
                  placeholder="e.g. Mustard oil 1L, Shirt, Chai"
                />
              </Field>

              {/* Selling & Cost Price */}
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("sellPrice")}>
                  <TextInput
                    type="number"
                    value={item.sellPrice}
                    onChange={(v) => updateItem(idx, 'sellPrice', v)}
                    placeholder="₹ 0"
                  />
                </Field>
                <Field label={t("costPrice")} optional>
                  <TextInput
                    type="number"
                    value={item.costPrice}
                    onChange={(v) => updateItem(idx, 'costPrice', v)}
                    placeholder="₹ 0"
                  />
                </Field>
              </div>

              {/* Seasonal */}
              <div className="mt-2">
                <label className="text-xs font-semibold block mb-1.5" style={{ color: "#5b4636" }}>
                  {t("seasonal")}
                </label>
                <div className="flex gap-2">
                  <Chip
                    label={t("no")}
                    selected={item.seasonal === 'no'}
                    onClick={() => updateItem(idx, 'seasonal', 'no')}
                  />
                  <Chip
                    label={t("yes")}
                    selected={item.seasonal === 'yes'}
                    onClick={() => updateItem(idx, 'seasonal', 'yes')}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Item Button */}
        <button
          type="button"
          onClick={addItem}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-dashed text-xs font-semibold transition"
          style={{ borderColor: "#a36a2d", color: "#a36a2d", background: "#efe6d6" }}
        >
          <Plus className="w-4 h-4" />
          <span>{t("addItem")}</span>
        </button>
      </div>
    </Layout>
  );
}
