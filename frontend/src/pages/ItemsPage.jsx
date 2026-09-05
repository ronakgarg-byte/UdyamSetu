import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip } from '../components/Common';
import Layout from '../components/Layout';
import { Plus, Trash2, Package, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function ItemsPage() {
  const navigate = useNavigate();
  const { items, setItems, userId, t, lang } = useApp();
  const [saving, setSaving] = useState(false);
  const isHindi = lang === 'hi';

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
      progress={80}
      onBack={() => navigate('/questionnaire')}
      onNext={handleNext}
      actionLabel={t("save")}
      loading={saving}
    >
      <div className="max-w-5xl w-full mx-auto">
        <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-6 pb-4 border-b border-[#e4d9c7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1f3a5f]">
                  {t("itemsTitle")}
                </h2>
                <p className="text-xs text-[#8a7a68] mt-0.5">
                  {t("itemsSub")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 bg-[#efe6d6] text-[#a36a2d] rounded-full border border-[#e4d9c7]">
                {items.length} {isHindi ? 'वस्तुएं' : 'Items'}
              </span>
            </div>
          </div>

          {/* Items Grid in 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl border bg-[#faf6ee] border-[#e4d9c7] shadow-sm relative hover:border-[#1f3a5f]/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 bg-[#1f3a5f] text-[#e8a33d] rounded-lg">
                      #{idx + 1} {isHindi ? 'उत्पाद' : 'Product'}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Item Description */}
                  <Field label={t("itemDesc")}>
                    <TextInput
                      value={item.desc}
                      onChange={(v) => updateItem(idx, 'desc', v)}
                      placeholder={isHindi ? "उदा. सरसों तेल 1L, शर्ट, चाय, अगरबत्ती" : "e.g. Mustard oil 1L, Shirt, Tea"}
                    />
                  </Field>

                  {/* Selling & Cost Price */}
                  <div className="grid grid-cols-2 gap-3 mt-3">
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
                </div>

                {/* Seasonal */}
                <div className="mt-4 pt-3 border-t border-[#e4d9c7]/70 flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#5b4636]">
                    {t("seasonal")}
                  </label>
                  <div className="flex gap-1.5">
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
          <div className="mt-6 pt-4 border-t border-[#e4d9c7]">
            <button
              type="button"
              onClick={addItem}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border-2 border-dashed font-heading font-semibold text-xs transition active:scale-[0.99] hover:bg-[#efe6d6]"
              style={{ borderColor: "#a36a2d", color: "#a36a2d", background: "#fffdf9" }}
            >
              <Plus className="w-4 h-4" />
              <span>{t("addItem")}</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
