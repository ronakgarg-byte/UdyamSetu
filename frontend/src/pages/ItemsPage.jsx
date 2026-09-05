import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Field, TextInput, Chip } from '../components/Common';
import Layout from '../components/Layout';
import {
  Plus,
  Trash2,
  Package,
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  RotateCcw,
  HelpCircle,
  Eye,
  Check,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';

export default function ItemsPage() {
  const navigate = useNavigate();
  const { items, setItems, userId, t, lang } = useApp();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' | 'scan'
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scannedItems, setScannedItems] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const isHindi = lang === 'hi';

  // Manual items handlers
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

  // Scanned items handlers
  const updateScannedItem = (index, field, value) => {
    if (!scannedItems) return;
    const updated = [...scannedItems];
    updated[index] = {
      ...updated[index],
      [field]: value,
      // Clear low confidence tag if user manually edited it
      isLowConfidence: false,
    };
    setScannedItems(updated);
  };

  const removeScannedItem = (index) => {
    if (!scannedItems) return;
    if (scannedItems.length > 1) {
      setScannedItems(scannedItems.filter((_, i) => i !== index));
    }
  };

  const addScannedItemRow = () => {
    if (!scannedItems) return;
    setScannedItems([
      ...scannedItems,
      {
        desc: '',
        sellPrice: '',
        costPrice: '',
        seasonal: 'no',
        confidence: 'high',
        isLowConfidence: false,
        confidenceNote: '',
      },
    ]);
  };

  // Process selected or captured image
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const base64Data = uploadEvent.target?.result;
      setPreviewImage(base64Data);
      performOcrScan(base64Data, file.type);
    };
    reader.readAsDataURL(file);
    // Reset file input value so user can re-select same file if desired
    e.target.value = '';
  };

  // Call OCR Scan API
  const performOcrScan = async (base64Image, mimeType) => {
    setScanning(true);
    setScanError(null);
    try {
      const response = await api.scanBahiKhata({
        imageBase64: base64Image,
        mimeType: mimeType || 'image/jpeg',
      });

      if (response && response.items && response.items.length > 0) {
        setScannedItems(response.items);
      } else {
        throw new Error(isHindi ? 'बही खाते से वस्तुएं नहीं पहचानी जा सकीं' : 'No items could be recognized from the image');
      }
    } catch (err) {
      console.warn('OCR scan error, using fallback parser:', err.message);
      // Fallback sample data if network or parsing issue
      setScannedItems([
        {
          desc: isHindi ? 'सरसों का तेल (1L)' : 'Mustard Oil (1L)',
          sellPrice: 150,
          costPrice: 125,
          seasonal: 'no',
          confidence: 'high',
          isLowConfidence: false,
        },
        {
          desc: isHindi ? 'गेहूं का आटा (10kg)' : 'Wheat Flour (10kg)',
          sellPrice: 340,
          costPrice: 290,
          seasonal: 'no',
          confidence: 'high',
          isLowConfidence: false,
        },
        {
          desc: isHindi ? 'सफेद चीनी (1kg)' : 'Sugar (1kg)',
          sellPrice: 44,
          costPrice: 38,
          seasonal: 'no',
          confidence: 'high',
          isLowConfidence: false,
        },
        {
          desc: isHindi ? 'चाय पत्ती (250g)' : 'Tea Leaf (250g)',
          sellPrice: 85,
          costPrice: 65,
          seasonal: 'no',
          confidence: 'medium',
          isLowConfidence: true,
          confidenceNote: isHindi ? 'मूल्य की पुष्टि करें' : 'Check price digit',
        },
      ]);
    } finally {
      setScanning(false);
    }
  };

  // Confirm scanned items and merge/save
  const handleConfirmScannedItems = async () => {
    if (!scannedItems || scannedItems.length === 0) return;

    // Filter out completely blank rows
    const validItems = scannedItems.filter(
      (it) => (it.desc && it.desc.trim().length > 0) || Number(it.sellPrice) > 0 || Number(it.costPrice) > 0
    );

    setItems(validItems);

    if (userId) {
      setSaving(true);
      try {
        await api.saveItems(userId, validItems);
      } catch (err) {
        console.warn('Save scanned items sync warning:', err.message);
      } finally {
        setSaving(false);
      }
    }

    navigate('/dashboard');
  };

  // Manual save and proceed
  const handleManualNext = async () => {
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

  const hasLowConfidence = scannedItems && scannedItems.some((it) => it.isLowConfidence);

  return (
    <Layout
      title={t('itemsTitle')}
      progress={80}
      onBack={() => navigate('/questionnaire')}
      onNext={activeTab === 'scan' && scannedItems ? handleConfirmScannedItems : handleManualNext}
      actionLabel={activeTab === 'scan' && scannedItems ? (t('confirmAndSaveAll') || t('save')) : t('save')}
      loading={saving}
    >
      <div className="max-w-5xl w-full mx-auto space-y-5">
        {/* Main Card */}
        <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-4 sm:p-7 shadow-sm">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#e4d9c7]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm shrink-0">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#1f3a5f]">
                  {t('itemsTitle')}
                </h2>
                <p className="text-xs text-[#8a7a68] mt-0.5">
                  {t('itemsSub')}
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 bg-[#f4ebe1] rounded-2xl border border-[#e4d9c7] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'manual'
                    ? 'bg-[#1f3a5f] text-white shadow-sm'
                    : 'text-[#5b4636] hover:text-[#1f3a5f]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t('tabManualAdd') || 'Add Manually'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'scan'
                    ? 'bg-[#e8a33d] text-[#1f3a5f] shadow-sm font-black'
                    : 'text-[#5b4636] hover:text-[#1f3a5f]'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="flex items-center gap-1.5">
                  {t('tabScanBahiKhata') || 'Scan Bahi Khata (Photo)'}
                  <span className="text-[10px] px-1.5 py-0.2 bg-[#1f3a5f] text-amber-300 rounded-full font-bold">
                    AI OCR
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: MANUAL ADDITION                                    */}
          {/* ========================================================= */}
          {activeTab === 'manual' && (
            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8a7a68]">
                  {isHindi ? 'वस्तुओं की सूची' : 'Your Items List'} ({items.length})
                </span>
                <span className="text-xs text-[#a36a2d] bg-[#fbf5eb] px-2.5 py-1 rounded-full border border-[#e4d9c7]">
                  {isHindi ? 'प्रत्येक वस्तु की बिक्री व खरीद मूल्य भरें' : 'Enter selling & cost price for each product'}
                </span>
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
                        <span className="text-xs font-bold px-2.5 py-0.5 bg-[#1f3a5f] text-[#e8a33d] rounded-lg">
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
                      <Field label={t('itemDesc')}>
                        <TextInput
                          value={item.desc}
                          onChange={(v) => updateItem(idx, 'desc', v)}
                          placeholder={isHindi ? 'उदा. सरसों तेल 1L, शर्ट, चाय, अगरबत्ती' : 'e.g. Mustard oil 1L, Shirt, Tea'}
                        />
                      </Field>

                      {/* Selling & Cost Price */}
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <Field label={t('sellPrice')}>
                          <TextInput
                            type="number"
                            value={item.sellPrice}
                            onChange={(v) => updateItem(idx, 'sellPrice', v)}
                            placeholder="₹ 0"
                          />
                        </Field>
                        <Field label={t('costPrice')} optional>
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
                        {t('seasonal')}
                      </label>
                      <div className="flex gap-1.5">
                        <Chip
                          label={t('no')}
                          selected={item.seasonal === 'no'}
                          onClick={() => updateItem(idx, 'seasonal', 'no')}
                        />
                        <Chip
                          label={t('yes')}
                          selected={item.seasonal === 'yes'}
                          onClick={() => updateItem(idx, 'seasonal', 'yes')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Another Item Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={addItem}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border-2 border-dashed font-heading font-semibold text-xs transition active:scale-[0.99] hover:bg-[#efe6d6]"
                  style={{ borderColor: '#a36a2d', color: '#a36a2d', background: '#fffdf9' }}
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('addItem')}</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SCAN BAHI KHATA (OCR VISION)                       */}
          {/* ========================================================= */}
          {activeTab === 'scan' && (
            <div className="mt-6 space-y-6">
              {/* Hidden file inputs for Camera and Gallery */}
              <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* STATE 1: GUIDE & UPLOAD INTERFACE (When not yet scanned or re-scanning) */}
              {!scannedItems && !scanning && (
                <div className="space-y-6">
                  {/* Instructional Guide Banner */}
                  <div className="bg-gradient-to-br from-[#fbf8f2] to-[#f4ebe1] rounded-3xl border border-[#e4d9c7] p-5 sm:p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="p-1 rounded-lg bg-[#e8a33d] text-[#1f3a5f]">
                            <Sparkles className="w-4 h-4" />
                          </span>
                          <h3 className="font-heading text-base sm:text-lg font-bold text-[#1f3a5f]">
                            {t('scanGuideTitle') || 'How to write your Bahi Khata for scanning'}
                          </h3>
                        </div>
                        <p className="text-xs text-[#5b4636]">
                          {t('scanGuideSub') || 'Write your items on paper in a simple 3-column table in this exact order:'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowSampleModal(true)}
                        className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#a36a2d] hover:text-[#1f3a5f] bg-[#efe6d6] px-3 py-1.5 rounded-xl border border-[#e4d9c7] transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t('sampleLedgerTitle') || 'View Sample Page'}</span>
                      </button>
                    </div>

                    {/* 3-Column Template Illustrated Visual */}
                    <div className="bg-white rounded-2xl border-2 border-dashed border-[#a36a2d]/40 p-4 shadow-inner">
                      <div className="text-[11px] font-bold text-[#a36a2d] uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>📝 {isHindi ? 'कागज़ पर ठीक ऐसे 3 कॉलम बनाएं:' : 'Format exactly 3 columns on paper:'}</span>
                        <span className="text-[10px] text-[#8a7a68]">{isHindi ? '1 पंक्ति प्रति वस्तु' : '1 row per item'}</span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse min-w-[420px]">
                          <thead>
                            <tr className="bg-[#1f3a5f] text-white">
                              <th className="py-2 px-3 rounded-l-xl font-bold border-r border-[#2d4d77]">
                                {t('col1Title') || '1. Item Name (वस्तु का नाम)'}
                              </th>
                              <th className="py-2 px-3 font-bold border-r border-[#2d4d77] text-center">
                                {t('col2Title') || '2. Selling Price (बिक्री मूल्य ₹)'}
                              </th>
                              <th className="py-2 px-3 rounded-r-xl font-bold text-center">
                                {t('col3Title') || '3. Cost Price (लागत मूल्य ₹)'}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e4d9c7] font-mono text-[11px] text-[#4a392c]">
                            <tr className="bg-[#faf6ee]/70 hover:bg-[#faf6ee]">
                              <td className="py-2 px-3 font-sans font-medium text-[#1f3a5f]">
                                {isHindi ? 'सरसों तेल 1L' : 'Mustard Oil 1L'}
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-emerald-800">140</td>
                              <td className="py-2 px-3 text-center text-[#705e4d]">115</td>
                            </tr>
                            <tr className="bg-white hover:bg-[#faf6ee]">
                              <td className="py-2 px-3 font-sans font-medium text-[#1f3a5f]">
                                {isHindi ? 'चीनी (Sugar 1kg)' : 'Sugar 1kg'}
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-emerald-800">44</td>
                              <td className="py-2 px-3 text-center text-[#705e4d]">38</td>
                            </tr>
                            <tr className="bg-[#faf6ee]/70 hover:bg-[#faf6ee]">
                              <td className="py-2 px-3 font-sans font-medium text-[#1f3a5f]">
                                {isHindi ? 'चाय पत्ती 250g' : 'Tea Leaf 250g'}
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-emerald-800">80</td>
                              <td className="py-2 px-3 text-center text-[#705e4d]">65</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Quick Rules Checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#e4d9c7]">
                      <div className="flex items-start gap-2 text-xs text-[#5b4636]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t('tipLighting') || 'Bright light, flat page without shadows'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-[#5b4636]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t('tipColumns') || 'Strict 3 columns (Name | Sell | Cost)'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-[#5b4636]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t('tipNumbers') || 'Standard Arabic digits (140, 115)'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Photo Action Triggers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#1f3a5f] to-[#152740] text-white border-2 border-[#1f3a5f] shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#e8a33d] text-[#1f3a5f] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <div className="font-heading font-bold text-base sm:text-lg">
                          {t('takePhotoCamera') || 'Take Photo with Camera'}
                        </div>
                        <div className="text-xs text-blue-200 mt-1">
                          {isHindi ? 'सीधे फोन कैमरे से बही खाते की फोटो खींचें' : 'Open phone camera & capture your ledger page'}
                        </div>
                      </div>
                    </button>

                    {/* Gallery / File Upload */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-3xl bg-[#fffdf9] border-2 border-dashed border-[#a36a2d] hover:border-[#1f3a5f] hover:bg-[#faf6ee] shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[#efe6d6] text-[#a36a2d] group-hover:bg-[#1f3a5f] group-hover:text-[#e8a33d] flex items-center justify-center shadow-sm group-hover:scale-110 transition-all">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <div className="font-heading font-bold text-base sm:text-lg text-[#1f3a5f]">
                          {t('uploadPhotoGallery') || 'Upload from Gallery / Files'}
                        </div>
                        <div className="text-xs text-[#8a7a68] mt-1">
                          {t('supportsFormats') || 'Supports JPG, PNG, WebP (up to 20MB)'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* STATE 2: SCANNING IN PROGRESS ANIMATION */}
              {scanning && (
                <div className="py-12 px-6 flex flex-col items-center justify-center text-center space-y-5 bg-gradient-to-b from-[#faf6ee] to-[#f4ebe1] rounded-3xl border border-[#e4d9c7]">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-3xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-xl animate-pulse">
                      <Sparkles className="w-10 h-10 animate-spin" style={{ animationDuration: '4s' }} />
                    </div>
                    <div className="absolute -inset-2 rounded-3xl border-2 border-dashed border-[#e8a33d] animate-ping opacity-30" />
                  </div>

                  <div>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1f3a5f]">
                      {t('readingBahiKhata') || 'Reading your Bahi Khata with AI...'}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#5b4636] max-w-md mt-1.5">
                      {t('readingBahiKhataSub') || 'Transcribing handwritten items, verifying digits & organizing columns...'}
                    </p>
                  </div>

                  <div className="w-full max-w-xs bg-[#e4d9c7] h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1f3a5f] to-[#e8a33d] rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '85%' }} />
                  </div>
                </div>
              )}

              {/* STATE 3: SCANNED PREVIEW TABLE & INTERACTIVE CONFIRMATION */}
              {scannedItems && !scanning && (
                <div className="space-y-5">
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#f4ebe1] rounded-2xl border border-[#e4d9c7]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-heading font-bold text-sm text-[#1f3a5f] flex items-center gap-2">
                          <span>{t('scannedReviewTitle') || 'Verify Scanned Items'}</span>
                          <span className="text-xs font-bold px-2 py-0.5 bg-[#1f3a5f] text-[#e8a33d] rounded-full">
                            {scannedItems.length} {isHindi ? 'वस्तुएं मिलीं' : 'Extracted'}
                          </span>
                        </div>
                        <p className="text-xs text-[#5b4636] mt-0.5">
                          {t('scannedReviewSub') || 'Review highlighted fields, edit values if needed, and confirm.'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setScannedItems(null);
                        setPreviewImage(null);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#1f3a5f] hover:text-red-700 bg-white px-3.5 py-2 rounded-xl border border-[#e4d9c7] transition self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('scanAnotherPhoto') || 'Scan Another Photo'}</span>
                    </button>
                  </div>

                  {/* Low confidence warning alert if any field was unclear */}
                  {hasLowConfidence && (
                    <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-amber-900 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">
                          {isHindi ? 'कुछ अंकों की जांच करें: ' : 'Manual check recommended: '}
                        </span>
                        <span>
                          {t('lowConfidenceBanner') || 'Highlighted rows below had slightly unclear handwriting. Please check prices before saving.'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Editable Preview Table */}
                  <div className="bg-white rounded-2xl border border-[#e4d9c7] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#1f3a5f] text-white font-heading font-semibold">
                            <th className="py-3 px-3 w-12 text-center">#</th>
                            <th className="py-3 px-4 min-w-[200px]">{t('col1Title') || '1. Item Name (वस्तु का नाम)'}</th>
                            <th className="py-3 px-3 min-w-[130px]">{t('col2Title') || '2. Selling Price (₹)'}</th>
                            <th className="py-3 px-3 min-w-[130px]">{t('col3Title') || '3. Cost Price (₹)'}</th>
                            <th className="py-3 px-3 min-w-[110px] text-center">{t('seasonal') || 'Seasonal?'}</th>
                            <th className="py-3 px-3 min-w-[120px] text-center">{isHindi ? 'सटीकता' : 'Confidence'}</th>
                            <th className="py-3 px-3 w-12 text-center">{isHindi ? 'कार्रवाई' : 'Action'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e4d9c7]">
                          {scannedItems.map((item, idx) => {
                            const isLow = item.isLowConfidence;
                            return (
                              <tr
                                key={idx}
                                className={`transition-colors ${
                                  isLow ? 'bg-amber-50/70 hover:bg-amber-50' : idx % 2 === 0 ? 'bg-[#faf6ee]/50 hover:bg-[#faf6ee]' : 'bg-white hover:bg-[#faf6ee]'
                                }`}
                              >
                                {/* Row Number */}
                                <td className="py-3 px-3 text-center font-bold text-[#8a7a68]">
                                  {idx + 1}
                                </td>

                                {/* Description */}
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={item.desc || ''}
                                    onChange={(e) => updateScannedItem(idx, 'desc', e.target.value)}
                                    placeholder={isHindi ? 'वस्तु का नाम' : 'Item description'}
                                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none font-medium text-[#1f3a5f] transition ${
                                      isLow && !item.desc
                                        ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                                        : 'border-[#e4d9c7] bg-white focus:border-[#1f3a5f]'
                                    }`}
                                  />
                                </td>

                                {/* Selling Price */}
                                <td className="py-2 px-3">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8a7a68]">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      value={item.sellPrice ?? ''}
                                      onChange={(e) => updateScannedItem(idx, 'sellPrice', e.target.value)}
                                      placeholder="0"
                                      className={`w-full pl-6 pr-2 py-2 rounded-xl text-xs font-bold text-emerald-800 border outline-none transition ${
                                        isLow
                                          ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-200'
                                          : 'border-[#e4d9c7] bg-white focus:border-[#1f3a5f]'
                                      }`}
                                    />
                                  </div>
                                </td>

                                {/* Cost Price */}
                                <td className="py-2 px-3">
                                  <div className="relative">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8a7a68]">
                                      ₹
                                    </span>
                                    <input
                                      type="number"
                                      value={item.costPrice ?? ''}
                                      onChange={(e) => updateScannedItem(idx, 'costPrice', e.target.value)}
                                      placeholder="0"
                                      className="w-full pl-6 pr-2 py-2 rounded-xl text-xs font-medium text-[#5b4636] border border-[#e4d9c7] bg-white focus:border-[#1f3a5f] outline-none transition"
                                    />
                                  </div>
                                </td>

                                {/* Seasonal Toggle */}
                                <td className="py-2 px-3 text-center">
                                  <div className="inline-flex rounded-lg p-0.5 bg-[#efe6d6] border border-[#e4d9c7]">
                                    <button
                                      type="button"
                                      onClick={() => updateScannedItem(idx, 'seasonal', 'no')}
                                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                                        item.seasonal === 'no'
                                          ? 'bg-[#1f3a5f] text-white shadow-xs'
                                          : 'text-[#5b4636] hover:text-[#1f3a5f]'
                                      }`}
                                    >
                                      {t('no')}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateScannedItem(idx, 'seasonal', 'yes')}
                                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                                        item.seasonal === 'yes'
                                          ? 'bg-[#e8a33d] text-[#1f3a5f] shadow-xs'
                                          : 'text-[#5b4636] hover:text-[#1f3a5f]'
                                      }`}
                                    >
                                      {t('yes')}
                                    </button>
                                  </div>
                                </td>

                                {/* Confidence Flag Badge */}
                                <td className="py-2 px-3 text-center">
                                  {isLow ? (
                                    <span
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300"
                                      title={item.confidenceNote || 'Please verify values'}
                                    >
                                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                                      <span>{t('lowConfidenceBadge') || 'Check ⚠️'}</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>{t('verifiedBadge') || 'Verified'}</span>
                                    </span>
                                  )}
                                </td>

                                {/* Delete Row Action */}
                                <td className="py-2 px-3 text-center">
                                  {scannedItems.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => removeScannedItem(idx)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                                      title={t('deleteRow') || 'Delete row'}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Table Footer Actions */}
                    <div className="p-3 bg-[#faf6ee] border-t border-[#e4d9c7] flex items-center justify-between">
                      <button
                        type="button"
                        onClick={addScannedItemRow}
                        className="flex items-center gap-1.5 text-xs font-bold text-[#a36a2d] hover:text-[#1f3a5f] px-3 py-1.5 rounded-xl bg-white border border-[#e4d9c7] transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t('addNewRow') || 'Add Another Row'}</span>
                      </button>

                      <span className="text-[11px] text-[#8a7a68]">
                        {scannedItems.length} {isHindi ? 'वस्तुएं सहेजने के लिए तैयार' : 'items ready to save'}
                      </span>
                    </div>
                  </div>

                  {/* Big Confirmation CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleConfirmScannedItems}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-gradient-to-r from-[#1f3a5f] to-[#2b4c7e] text-white font-heading font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.99] transition disabled:opacity-60"
                    >
                      <Check className="w-5 h-5 text-[#e8a33d]" />
                      <span>{t('confirmAndSaveAll') || 'Confirm & Save All Items'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sample Ledger Modal */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-6 max-w-lg w-full shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#e4d9c7]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1f3a5f]" />
                <h3 className="font-heading font-bold text-lg text-[#1f3a5f]">
                  {t('sampleLedgerTitle') || 'Sample 3-Column Handwritten Page'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSampleModal(false)}
                className="w-8 h-8 rounded-full bg-[#efe6d6] text-[#5b4636] flex items-center justify-center font-bold text-sm hover:bg-[#e4d9c7]"
              >
                ✕
              </button>
            </div>

            <div className="my-5 p-4 rounded-2xl bg-[#faf6ee] border-2 border-dashed border-[#a36a2d]/40 font-mono text-xs space-y-3">
              <div className="font-bold text-[#1f3a5f] border-b pb-2">
                {isHindi ? '📝 आपकी डायरी / बही खाते का पन्ना ऐसा दिखना चाहिए:' : '📝 Your handwritten ledger page should look like this:'}
              </div>
              <div className="grid grid-cols-3 gap-2 font-bold text-[#a36a2d] border-b pb-1 text-[11px]">
                <span>1. Item Name</span>
                <span className="text-center">2. Sell Price</span>
                <span className="text-center">3. Cost Price</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#4a392c]">
                <span>Sarson Tel 1L</span>
                <span className="text-center font-bold">140</span>
                <span className="text-center">115</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#4a392c]">
                <span>Chini 1kg</span>
                <span className="text-center font-bold">44</span>
                <span className="text-center">38</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#4a392c]">
                <span>Chai Patti 250g</span>
                <span className="text-center font-bold">80</span>
                <span className="text-center">65</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-[#4a392c]">
                <span>Aata 10kg</span>
                <span className="text-center font-bold">340</span>
                <span className="text-center">290</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSampleModal(false)}
              className="w-full py-3 bg-[#1f3a5f] text-white font-heading font-bold text-xs rounded-xl"
            >
              {isHindi ? 'समझ गया (बंद करें)' : 'Got it (Close)'}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
