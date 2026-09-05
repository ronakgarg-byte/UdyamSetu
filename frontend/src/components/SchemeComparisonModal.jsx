import React from 'react';
import {
  X,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Clock,
  FileText,
  Coins,
  ShieldCheck,
  ArrowRightLeft,
  Loader2,
  Building2,
  Calendar,
  AlertCircle,
  Award
} from 'lucide-react';

export default function SchemeComparisonModal({
  isOpen,
  onClose,
  data,
  loading = false,
  lang = 'en',
  t = (k) => k,
}) {
  if (!isOpen) return null;

  const isHindi = lang === 'hi';
  const schemeA = data?.schemeA;
  const schemeB = data?.schemeB;
  const comparison = data?.comparison;

  const getDirectUrl = (scheme) => {
    if (!scheme) return 'https://pmsvanidhi.mohua.gov.in/';
    return scheme.portalUrl || (
      scheme.code === 'pm_vishwakarma' ? 'https://pmvishwakarma.gov.in/' :
      scheme.code === 'pmegp' ? 'https://www.kviconline.gov.in/pmegpeportal/' :
      scheme.code === 'stand_up_india' ? 'https://www.standupmitra.in/' :
      scheme.code === 'udyam_reg' ? 'https://udyamregistration.gov.in/' :
      scheme.code?.startsWith('mudra') ? 'https://www.mudra.org.in/' :
      'https://pmsvanidhi.mohua.gov.in/'
    );
  };

  const getComplexityBadge = (complexity) => {
    switch (complexity) {
      case 'simple':
        return {
          label: isHindi ? 'सरल (न्यूनतम कागजात)' : 'Simple (Minimal Paperwork)',
          className: 'bg-[#e3efe6] text-[#3f6b4f] border-[#3f6b4f]/30',
        };
      case 'moderate':
        return {
          label: isHindi ? 'मध्यम (बैंक सत्यापन)' : 'Moderate (Bank Verification)',
          className: 'bg-[#fef3c7] text-[#92400e] border-[#f59e0b]/30',
        };
      case 'complex':
        return {
          label: isHindi ? 'जटिल (विस्तृत DPR रिपोर्ट)' : 'Complex (Detailed DPR Report)',
          className: 'bg-[#ede9fe] text-[#5b21b6] border-[#8b5cf6]/30',
        };
      default:
        return {
          label: isHindi ? 'सामान्य' : 'Standard',
          className: 'bg-[#faf6ee] text-[#5b4636] border-[#e4d9c7]',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-[#f8f5ee] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#e4d9c7] animate-in slide-in-from-bottom duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e4d9c7] bg-[#fffdf9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1f3a5f] text-[#e8a33d] flex items-center justify-center shadow-md shrink-0">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-[#1f3a5f]">
                {t('comparisonModalTitle')}
              </h3>
              <p className="text-xs text-[#8a7a68]">
                {t('comparisonModalSub')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#e4d9c7] text-[#5b4636] transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-[#1f3a5f]">
              <Loader2 className="w-8 h-8 animate-spin text-[#e8a33d]" />
              <p className="text-sm font-semibold">{t('comparingSchemes')}</p>
            </div>
          ) : !schemeA || !schemeB || !comparison ? (
            <div className="py-16 text-center text-[#8a7a68]">
              <AlertCircle className="w-10 h-10 mx-auto text-[#b75b3d] mb-2" />
              <p className="text-sm font-semibold">{isHindi ? 'तुलना डेटा लोड नहीं हो सका' : 'Could not load scheme comparison data'}</p>
            </div>
          ) : (
            <>
              {/* Schemes Header Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scheme A Header Card */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#fffdf9] border-2 border-[#1f3a5f]/30 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1f3a5f] text-[#e8a33d]">
                      Option A
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e3efe6] text-[#3f6b4f] border border-[#3f6b4f]/30">
                      {comparison.eligibility?.schemeA?.matchPercentage || schemeA.matchPercentage || schemeA.match || 85}% {isHindi ? 'मैच' : 'Match'}
                    </span>
                  </div>
                  <h4 className="font-heading text-base sm:text-lg font-bold text-[#1f3a5f] leading-snug">
                    {isHindi ? (schemeA.name_hi || schemeA.name || schemeA.name_en) : (schemeA.name_en || schemeA.name)}
                  </h4>
                  <p className="text-xs text-[#a36a2d] font-medium mt-0.5">
                    {isHindi ? (schemeA.ministry_hi || schemeA.ministry || schemeA.ministry_en) : (schemeA.ministry_en || schemeA.ministry)}
                  </p>
                </div>

                {/* Scheme B Header Card */}
                <div className="p-4 sm:p-5 rounded-3xl bg-[#fffdf9] border-2 border-[#e8a33d]/70 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#a36a2d] text-white">
                      Option B
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#e3efe6] text-[#3f6b4f] border border-[#3f6b4f]/30">
                      {comparison.eligibility?.schemeB?.matchPercentage || schemeB.matchPercentage || schemeB.match || 85}% {isHindi ? 'मैच' : 'Match'}
                    </span>
                  </div>
                  <h4 className="font-heading text-base sm:text-lg font-bold text-[#1f3a5f] leading-snug">
                    {isHindi ? (schemeB.name_hi || schemeB.name || schemeB.name_en) : (schemeB.name_en || schemeB.name)}
                  </h4>
                  <p className="text-xs text-[#a36a2d] font-medium mt-0.5">
                    {isHindi ? (schemeB.ministry_hi || schemeB.ministry || schemeB.ministry_en) : (schemeB.ministry_en || schemeB.ministry)}
                  </p>
                </div>
              </div>

              {/* 5-POINT DETAILED COMPARISON BREAKDOWN */}
              <div className="space-y-4">

                {/* Point 1: Eligibility Match */}
                <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#e4d9c7]">
                    <Sparkles className="w-5 h-5 text-[#e8a33d]" />
                    <h4 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                      {isHindi ? comparison.eligibility?.title_hi : comparison.eligibility?.title_en}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7]/80">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-[#1f3a5f]">Option A Match:</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#1f3a5f] text-white">
                          {comparison.eligibility?.schemeA?.matchPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-[#5b4636] leading-relaxed">
                        {isHindi ? comparison.eligibility?.schemeA?.keyFit_hi : comparison.eligibility?.schemeA?.keyFit_en}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7]/80">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold text-[#1f3a5f]">Option B Match:</span>
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-[#a36a2d] text-white">
                          {comparison.eligibility?.schemeB?.matchPercentage}%
                        </span>
                      </div>
                      <p className="text-xs text-[#5b4636] leading-relaxed">
                        {isHindi ? comparison.eligibility?.schemeB?.keyFit_hi : comparison.eligibility?.schemeB?.keyFit_en}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Point 2: Financial Benefit & Subsidy */}
                <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#e4d9c7]">
                    <Coins className="w-5 h-5 text-[#3f6b4f]" />
                    <h4 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                      {isHindi ? comparison.financialBenefit?.title_hi : comparison.financialBenefit?.title_en}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#e3efe6]/40 border border-[#3f6b4f]/20">
                      <div className="text-xs font-semibold text-[#3f6b4f] mb-0.5">
                        {isHindi ? 'ऋण सीमा / अनुदान' : 'Funding Range'}
                      </div>
                      <div className="font-heading text-base sm:text-lg font-bold text-[#1f3a5f]">
                        {isHindi ? comparison.financialBenefit?.schemeA?.amountRange_hi : comparison.financialBenefit?.schemeA?.amountRange_en}
                      </div>
                      <div className="mt-2 text-xs text-[#5b4636] font-medium bg-white/80 p-2.5 rounded-xl border border-[#e4d9c7]">
                        <strong className="text-[#a36a2d] block mb-0.5">{isHindi ? 'ब्याज दर / सब्सिडी:' : 'Rate / Subsidy:'}</strong>
                        {isHindi ? comparison.financialBenefit?.schemeA?.rateOrSubsidy_hi : comparison.financialBenefit?.schemeA?.rateOrSubsidy_en}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#e3efe6]/40 border border-[#3f6b4f]/20">
                      <div className="text-xs font-semibold text-[#3f6b4f] mb-0.5">
                        {isHindi ? 'ऋण सीमा / अनुदान' : 'Funding Range'}
                      </div>
                      <div className="font-heading text-base sm:text-lg font-bold text-[#1f3a5f]">
                        {isHindi ? comparison.financialBenefit?.schemeB?.amountRange_hi : comparison.financialBenefit?.schemeB?.amountRange_en}
                      </div>
                      <div className="mt-2 text-xs text-[#5b4636] font-medium bg-white/80 p-2.5 rounded-xl border border-[#e4d9c7]">
                        <strong className="text-[#a36a2d] block mb-0.5">{isHindi ? 'ब्याज दर / सब्सिडी:' : 'Rate / Subsidy:'}</strong>
                        {isHindi ? comparison.financialBenefit?.schemeB?.rateOrSubsidy_hi : comparison.financialBenefit?.schemeB?.rateOrSubsidy_en}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 3: Process & Documentation */}
                <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#e4d9c7]">
                    <FileText className="w-5 h-5 text-[#1f3a5f]" />
                    <h4 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                      {isHindi ? comparison.processAndDocs?.title_hi : comparison.processAndDocs?.title_en}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Scheme A Docs */}
                    <div className="p-3.5 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7]/80">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={'text-[11px] font-bold px-2.5 py-0.5 rounded-full border ' + getComplexityBadge(comparison.processAndDocs?.schemeA?.complexity).className}>
                          {getComplexityBadge(comparison.processAndDocs?.schemeA?.complexity).label}
                        </span>
                        <span className="text-xs font-bold text-[#8a7a68]">
                          {comparison.processAndDocs?.schemeA?.docsCount} {isHindi ? 'दस्तावेज आवश्यक' : 'Docs Required'}
                        </span>
                      </div>
                      <ul className="space-y-1.5 mt-2">
                        {(isHindi ? comparison.processAndDocs?.schemeA?.docsList_hi : comparison.processAndDocs?.schemeA?.docsList_en || []).map((doc, dIdx) => (
                          <li key={dIdx} className="text-xs text-[#5b4636] flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3f6b4f] shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Scheme B Docs */}
                    <div className="p-3.5 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7]/80">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={'text-[11px] font-bold px-2.5 py-0.5 rounded-full border ' + getComplexityBadge(comparison.processAndDocs?.schemeB?.complexity).className}>
                          {getComplexityBadge(comparison.processAndDocs?.schemeB?.complexity).label}
                        </span>
                        <span className="text-xs font-bold text-[#8a7a68]">
                          {comparison.processAndDocs?.schemeB?.docsCount} {isHindi ? 'दस्तावेज आवश्यक' : 'Docs Required'}
                        </span>
                      </div>
                      <ul className="space-y-1.5 mt-2">
                        {(isHindi ? comparison.processAndDocs?.schemeB?.docsList_hi : comparison.processAndDocs?.schemeB?.docsList_en || []).map((doc, dIdx) => (
                          <li key={dIdx} className="text-xs text-[#5b4636] flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#3f6b4f] shrink-0 mt-0.5" />
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Point 4: Time to Benefit & Tenure */}
                <div className="bg-[#fffdf9] rounded-3xl border border-[#e4d9c7] p-5 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#e4d9c7]">
                    <Clock className="w-5 h-5 text-[#a36a2d]" />
                    <h4 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                      {isHindi ? comparison.timeToBenefit?.title_hi : comparison.timeToBenefit?.title_en}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7]/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8a7a68] font-medium">{t('processingTime')}:</span>
                        <span className="font-bold font-heading text-[#1f3a5f]">
                          {isHindi ? comparison.timeToBenefit?.schemeA?.processingTime_hi : comparison.timeToBenefit?.schemeA?.processingTime_en}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e4d9c7]/60">
                        <span className="text-[#8a7a68] font-medium">{t('tenure')}:</span>
                        <span className="font-bold font-heading text-[#1f3a5f]">
                          {isHindi ? comparison.timeToBenefit?.schemeA?.tenure_hi : comparison.timeToBenefit?.schemeA?.tenure_en}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#faf6ee] border border-[#e4d9c7]/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#8a7a68] font-medium">{t('processingTime')}:</span>
                        <span className="font-bold font-heading text-[#1f3a5f]">
                          {isHindi ? comparison.timeToBenefit?.schemeB?.processingTime_hi : comparison.timeToBenefit?.schemeB?.processingTime_en}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-[#e4d9c7]/60">
                        <span className="text-[#8a7a68] font-medium">{t('tenure')}:</span>
                        <span className="font-bold font-heading text-[#1f3a5f]">
                          {isHindi ? comparison.timeToBenefit?.schemeB?.tenure_hi : comparison.timeToBenefit?.schemeB?.tenure_en}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 5: Best Fit For Your Profile */}
                <div className="bg-[#fffdf9] rounded-3xl border-2 border-[#e8a33d]/60 p-5 shadow-md">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-[#e4d9c7]">
                    <Award className="w-5 h-5 text-[#e8a33d]" />
                    <h4 className="font-heading text-sm sm:text-base font-bold text-[#1f3a5f]">
                      {isHindi ? comparison.bestFitFor?.title_hi : comparison.bestFitFor?.title_en}
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-[#faf4e8] border border-[#e8a33d]/40">
                      <div className="text-xs font-bold text-[#a36a2d] mb-1">Option A Verdict:</div>
                      <p className="text-xs sm:text-sm text-[#1f3a5f] font-medium leading-relaxed">
                        {isHindi ? comparison.bestFitFor?.schemeA?.verdict_hi : comparison.bestFitFor?.schemeA?.verdict_en}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#faf4e8] border border-[#e8a33d]/40">
                      <div className="text-xs font-bold text-[#a36a2d] mb-1">Option B Verdict:</div>
                      <p className="text-xs sm:text-sm text-[#1f3a5f] font-medium leading-relaxed">
                        {isHindi ? comparison.bestFitFor?.schemeB?.verdict_hi : comparison.bestFitFor?.schemeB?.verdict_en}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>

        {/* Modal Footer with Direct Application Actions */}
        {schemeA && schemeB && !loading && (
          <div className="px-6 py-4 border-t border-[#e4d9c7] bg-[#fffdf9] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#e4d9c7] text-xs font-bold text-[#5b4636] hover:bg-[#faf6ee] transition"
            >
              {t('close')}
            </button>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              <a
                href={getDirectUrl(schemeA)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1f3a5f] text-white hover:bg-[#152742] transition shadow-sm"
              >
                <span>{isHindi ? 'Option A Portal पर जाएं ↗' : 'Apply Option A ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#e8a33d]" />
              </a>

              <a
                href={getDirectUrl(schemeB)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#e8a33d] text-[#1f3a5f] hover:bg-[#f3b759] transition shadow-sm"
              >
                <span>{isHindi ? 'Option B Portal पर जाएं ↗' : 'Apply Option B ↗'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
