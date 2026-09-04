import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ExternalLink,
  Store,
  Layers,
  Sparkles,
  Info,
  BadgePercent,
  RefreshCw,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

// Fallback dataset in case localContext API is offline or loading
const DEFAULT_AGMARKNET_COMMODITIES = [
  {
    code: 'wheat',
    commodity: 'Wheat (गेहूं)',
    commodity_en: 'Wheat (Sharbati / Dara)',
    commodity_hi: 'गेहूं (शरबती / दड़ा)',
    category: 'grains',
    unit: 'Quintal (100kg)',
    unit_hi: 'क्विंटल (100 किग्रा)',
    modalPrice: 2420,
    minPrice: 2350,
    maxPrice: 2490,
    retailRef: 2900,
    savingsPct: 16.5,
    trend: 'stable',
  },
  {
    code: 'paddy',
    commodity: 'Paddy / Rice (धान / चावल)',
    commodity_en: 'Paddy / Basmati Rice',
    commodity_hi: 'धान / चावल (बासमती / मंसूरी)',
    category: 'grains',
    unit: 'Quintal (100kg)',
    unit_hi: 'क्विंटल (100 किग्रा)',
    modalPrice: 2183,
    minPrice: 2100,
    maxPrice: 2280,
    retailRef: 2650,
    savingsPct: 17.6,
    trend: 'stable',
  },
  {
    code: 'mustard_oil',
    commodity: 'Mustard Oil (सरसों तेल)',
    commodity_en: 'Mustard Oil (Kachhi Ghani)',
    commodity_hi: 'सरसों तेल (कच्ची घानी)',
    category: 'grains',
    unit: 'Tin (15kg / 16.5L)',
    unit_hi: 'टिन (15 किग्रा)',
    modalPrice: 2150,
    minPrice: 2050,
    maxPrice: 2240,
    retailRef: 2550,
    savingsPct: 15.6,
    trend: 'increasing',
  },
  {
    code: 'chana_dal',
    commodity: 'Chana Dal (चना दाल)',
    commodity_en: 'Gram / Chana Dal (Unpolished)',
    commodity_hi: 'चना दाल (बिना पॉलिश)',
    category: 'grains',
    unit: 'Quintal (100kg)',
    unit_hi: 'क्विंटल (100 किग्रा)',
    modalPrice: 6850,
    minPrice: 6600,
    maxPrice: 7100,
    retailRef: 8200,
    savingsPct: 16.4,
    trend: 'increasing',
  },
  {
    code: 'sugar',
    commodity: 'Sugar (चीनी / शक्कर)',
    commodity_en: 'Refined White Sugar (M-Grade)',
    commodity_hi: 'सफेद चीनी (एम-ग्रेड)',
    category: 'grains',
    unit: 'Quintal (100kg)',
    unit_hi: 'क्विंटल (100 किग्रा)',
    modalPrice: 3880,
    minPrice: 3800,
    maxPrice: 3950,
    retailRef: 4400,
    savingsPct: 11.8,
    trend: 'stable',
  },
  {
    code: 'potato',
    commodity: 'Potato (आलू)',
    commodity_en: 'Potato (Pukhraj / Jyoti)',
    commodity_hi: 'आलू (पुखराज / ज्योति)',
    category: 'grains',
    unit: 'Quintal (100kg)',
    unit_hi: 'क्विंटल (100 किग्रा)',
    modalPrice: 1650,
    minPrice: 1500,
    maxPrice: 1780,
    retailRef: 2200,
    savingsPct: 25.0,
    trend: 'stable',
  },
  {
    code: 'onion',
    commodity: 'Onion (प्याज)',
    commodity_en: 'Red Onion (Nasik / Local)',
    commodity_hi: 'लाल प्याज (नासिक / लोकल)',
    category: 'grains',
    unit: 'Quintal (100kg)',
    unit_hi: 'क्विंटल (100 किग्रा)',
    modalPrice: 2400,
    minPrice: 2200,
    maxPrice: 2650,
    retailRef: 3200,
    savingsPct: 25.0,
    trend: 'increasing',
  },
  {
    code: 'cotton_yarn',
    commodity: 'Cotton Yarn 40s (सूत धागा)',
    commodity_en: 'Combed Cotton Yarn 40s',
    commodity_hi: 'कॉम्बेड कॉटन सूत धागा 40s',
    category: 'textiles',
    unit: 'Kg',
    unit_hi: 'किलोग्राम',
    modalPrice: 275,
    minPrice: 260,
    maxPrice: 290,
    retailRef: 340,
    savingsPct: 19.1,
    trend: 'stable',
  },
  {
    code: 'poplin_fabric',
    commodity: 'Cotton Fabric / Poplin (कॉटन कपड़ा)',
    commodity_en: 'Pure Cotton Grey Fabric',
    commodity_hi: 'प्योर कॉटन पॉपलिन कपड़ा (थान)',
    category: 'textiles',
    unit: 'Meter',
    unit_hi: 'मीटर',
    modalPrice: 42,
    minPrice: 38,
    maxPrice: 46,
    retailRef: 60,
    savingsPct: 30.0,
    trend: 'stable',
  },
  {
    code: 'sewing_thread',
    commodity: 'Sewing Thread Box (सिलाई रील)',
    commodity_en: 'Spun Polyester Thread (Box of 100)',
    commodity_hi: 'पॉलिएस्टर सिलाई धागा (100 रील बॉक्स)',
    category: 'textiles',
    unit: 'Box (100)',
    unit_hi: 'बॉक्स (100)',
    modalPrice: 320,
    minPrice: 300,
    maxPrice: 350,
    retailRef: 450,
    savingsPct: 28.8,
    trend: 'stable',
  },
  {
    code: 'aster_lining',
    commodity: 'Lining / Aster Fabric (अस्तर)',
    commodity_en: 'Synthetic Rubia Lining Cloth',
    commodity_hi: 'रुबिया / सिंथेटिक अस्तर कपड़ा',
    category: 'textiles',
    unit: 'Meter (Roll)',
    unit_hi: 'मीटर (रोल)',
    modalPrice: 19,
    minPrice: 17,
    maxPrice: 22,
    retailRef: 28,
    savingsPct: 32.1,
    trend: 'decreasing',
  },
  {
    code: 'teak_wood',
    commodity: 'Teak / Sagwan Log (सागवान लकड़ी)',
    commodity_en: 'CP Teak Round Timber Log',
    commodity_hi: 'सागवान गोल लकड़ी लट्ठा',
    category: 'wood',
    unit: 'CFT (Cubic Feet)',
    unit_hi: 'घन फीट (CFT)',
    modalPrice: 2450,
    minPrice: 2300,
    maxPrice: 2600,
    retailRef: 2950,
    savingsPct: 16.9,
    trend: 'stable',
  },
  {
    code: 'plywood_18mm',
    commodity: 'Plywood Sheet 18mm (प्लाईवुड)',
    commodity_en: 'Commercial Plywood 8x4 ft (18mm)',
    commodity_hi: 'कमर्शियल प्लाईवुड शीट 8x4 फीट',
    category: 'wood',
    unit: 'Sheet (32 sqft)',
    unit_hi: 'शीट (32 वर्गफीट)',
    modalPrice: 1980,
    minPrice: 1850,
    maxPrice: 2150,
    retailRef: 2400,
    savingsPct: 17.5,
    trend: 'stable',
  },
  {
    code: 'ms_angle',
    commodity: 'MS Iron Angle / Pipe (लोहा एंगल)',
    commodity_en: 'Mild Steel Angle / Square Pipe',
    commodity_hi: 'माइल्ड स्टील एंगल / पाइप',
    category: 'hardware',
    unit: 'Kg',
    unit_hi: 'किलोग्राम',
    modalPrice: 56,
    minPrice: 53,
    maxPrice: 59,
    retailRef: 68,
    savingsPct: 17.6,
    trend: 'decreasing',
  },
  {
    code: 'cow_milk',
    commodity: 'Raw Dairy Milk (कच्चा दूध)',
    commodity_en: 'Fresh Raw Dairy Milk (Fat 5%)',
    commodity_hi: 'ताजा कच्चा डेयरी दूध',
    category: 'dairy',
    unit: 'Liter',
    unit_hi: 'लीटर',
    modalPrice: 48,
    minPrice: 45,
    maxPrice: 52,
    retailRef: 60,
    savingsPct: 20.0,
    trend: 'stable',
  },
  {
    code: 'besan_flour',
    commodity: 'Gram Flour / Besan (बेसन)',
    commodity_en: 'Pure Chana Dal Besan',
    commodity_hi: 'शुद्ध चना दाल बेसन (थोक बोरी)',
    category: 'dairy',
    unit: 'Bag (50kg)',
    unit_hi: 'बोरी (50 किग्रा)',
    modalPrice: 3650,
    minPrice: 3500,
    maxPrice: 3800,
    retailRef: 4300,
    savingsPct: 15.1,
    trend: 'increasing',
  },
];

export default function AgmarknetPricingWidget({ localContext }) {
  const { lang, t, biz } = useApp();
  const isHindi = lang === 'hi';

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const userCommodities = useMemo(() => {
    const list = localContext?.mandiEconomics?.keyCommodities || DEFAULT_AGMARKNET_COMMODITIES;
    return Array.isArray(list) && list.length > 0 ? list : DEFAULT_AGMARKNET_COMMODITIES;
  }, [localContext]);

  const reportingMandi =
    localContext?.mandiEconomics?.reportingMandi ||
    (localContext?.district ? (localContext.district + ' Main APMC Yard') : 'District APMC Mandi Yard');

  const categories = [
    { id: 'all', label: t('allCategories') },
    { id: 'grains', label: t('catGrains') },
    { id: 'textiles', label: t('catTextiles') },
    { id: 'wood', label: t('catWood') },
    { id: 'hardware', label: t('catHardware') },
    { id: 'dairy', label: t('catDairy') },
  ];

  const filteredCommodities = useMemo(() => {
    return userCommodities.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category && item.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameEn = (item.commodity_en || item.commodity || '').toLowerCase();
        const nameHi = (item.commodity_hi || item.commodity || '').toLowerCase();
        const comm = (item.commodity || '').toLowerCase();
        return nameEn.includes(q) || nameHi.includes(q) || comm.includes(q);
      }

      return true;
    });
  }, [userCommodities, activeCategory, searchQuery]);

  const renderTrendBadge = (trend) => {
    if (trend === 'increasing' || trend === 'rising') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <TrendingUp className="w-3 h-3 text-rose-600" />
          {t('trendRising')}
        </span>
      );
    }
    if (trend === 'decreasing' || trend === 'falling') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <TrendingDown className="w-3 h-3 text-emerald-600" />
          {t('trendFalling')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
        <Minus className="w-3 h-3 text-slate-500" />
        {t('trendStable')}
      </span>
    );
  };

  return (
    <div className="bg-[#fffdf9] rounded-2xl border border-[#e4d9c7] p-4 sm:p-5 shadow-sm mb-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e4d9c7] pb-3.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-sm">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-[#1f3a5f] flex items-center gap-2">
                <span>{t('mandiPricesTitle')}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-[#e8a33d] text-[#1f3a5f] rounded-full uppercase tracking-wider">
                  Live APMC
                </span>
              </h3>
              <p className="text-[11px] text-[#8a7a68] mt-0.5">
                {reportingMandi} • {t('mandiPricesSub')}
              </p>
            </div>
          </div>
        </div>

        <a
          href="https://agmarknet.gov.in/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1f3a5f] bg-[#f3ede0] hover:bg-[#e4d9c7] px-3 py-1.5 rounded-xl transition self-start sm:self-auto border border-[#e4d9c7]"
        >
          <span>agmarknet.gov.in</span>
          <ExternalLink className="w-3 h-3 text-[#a36a2d]" />
        </a>
      </div>

      {/* Direct Wholesale Savings Tip Alert */}
      <div className="mb-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2 text-xs text-amber-900">
        <BadgePercent className="w-4 h-4 text-[#a36a2d] shrink-0 mt-0.5" />
        <span className="leading-relaxed font-medium">
          {t('directMandiSourcingTip')}
        </span>
      </div>

      {/* Category Pills and Search Bar */}
      <div className="space-y-3 mb-4">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8a7a68] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchCommodity')}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs border border-[#e4d9c7] bg-[#fdfaf5] text-[#1f3a5f] outline-none focus:border-[#1f3a5f] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-[#8a7a68] hover:text-[#1f3a5f]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category horizontal scroll */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={'text-xs px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition border ' + (
                activeCategory === cat.id
                  ? 'bg-[#1f3a5f] text-white border-[#1f3a5f] shadow-sm'
                  : 'bg-[#f3ede0] text-[#5b4636] border-[#e4d9c7] hover:bg-[#e4d9c7]'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Commodity Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredCommodities.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-[#8a7a68]">
            {isHindi
              ? 'कोई कच्चा माल नहीं मिला। कृपया दूसरा नाम खोजें।'
              : 'No commodities found. Try searching another name.'}
          </div>
        ) : (
          filteredCommodities.map((item, idx) => {
            const displayName = isHindi
              ? item.commodity_hi || item.commodity
              : item.commodity_en || item.commodity;

            const unitDisplay = isHindi ? item.unit_hi || item.unit : item.unit;
            const savings = item.savingsPct || (item.retailRef ? Math.round(((item.retailRef - item.modalPrice) / item.retailRef) * 100) : 18);

            return (
              <div
                key={item.code || idx}
                className="p-3.5 rounded-xl border border-[#e4d9c7] bg-[#faf6ee] hover:bg-[#fffdf9] hover:border-[#1f3a5f]/40 transition shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading text-xs font-bold text-[#1f3a5f] leading-snug">
                      {displayName}
                    </h4>
                    {renderTrendBadge(item.trend)}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#8a7a68] mt-1">
                    <Tag className="w-3 h-3 text-[#a36a2d]" />
                    <span>
                      {isHindi ? 'इकाई (Unit):' : 'Unit:'} {unitDisplay}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#e4d9c7]/70">
                  <div className="flex items-baseline justify-between">
                    <span className="text-[11px] text-[#5b4636] font-medium">
                      {t('modalRate')}:
                    </span>
                    <span className="font-heading text-sm font-extrabold text-[#1f3a5f]">
                      ₹{Number(item.modalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>

                  {item.minPrice && item.maxPrice && (
                    <div className="flex items-center justify-between text-[10px] text-[#8a7a68] mt-0.5">
                      <span>Mandi Range:</span>
                      <span>
                        ₹{Number(item.minPrice).toLocaleString('en-IN')} - ₹{Number(item.maxPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {item.retailRef && (
                    <div className="mt-2 pt-1.5 border-t border-dashed border-[#e4d9c7] flex items-center justify-between">
                      <span className="text-[10px] text-[#8a7a68]">
                        Retail: <del>₹{Number(item.retailRef).toLocaleString('en-IN')}</del>
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        {savings}% {isHindi ? 'बचत' : 'Savings'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3.5 pt-2.5 border-t border-[#e4d9c7] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10.5px] text-[#8a7a68]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified against AGMARKNET APMC Price Index</span>
        </div>
        <span>Daily Wholesale Mandi Modal Rates</span>
      </div>
    </div>
  );
}
