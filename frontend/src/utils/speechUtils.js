/**
 * Web Speech API Utilities & Spoken Input Parser
 * Supports bilingual Hindi (hi-IN) and English (en-IN) TTS & STT.
 */

export function isSpeechSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function isSpeechRecognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
}

export function speakText(text, lang = 'en', onEnd) {
  if (!isSpeechSynthesisSupported()) {
    if (onEnd) onEnd();
    return null;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any ongoing speech

    // Remove markdown symbols and extra symbols before speaking
    const cleanText = text
      .replace(/[*#_`~]/g, '')
      .replace(/₹/g, lang === 'hi' ? 'रुपये ' : 'rupees ')
      .trim();

    if (!cleanText) {
      if (onEnd) onEnd();
      return null;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95; // Slightly slower, highly clear for micro-entrepreneurs
    utterance.pitch = 1.0;

    // Pick best native voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const targetLang = lang === 'hi' ? 'hi' : 'en';
      const matchedVoice = voices.find(
        (v) => v.lang.startsWith(targetLang) || v.lang.replace('_', '-').startsWith(targetLang)
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('[SpeechSynthesis] Speech error:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('[SpeechSynthesis] Failed to speak text:', err);
    if (onEnd) onEnd();
    return null;
  }
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      // Ignore
    }
  }
}

export function startListening({ lang = 'en', onResult, onError, onEnd }) {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError('Speech recognition not supported on this browser');
    return null;
  }

  try {
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionClass();

    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || '';
      if (onResult) onResult(transcript.trim());
    };

    recognition.onerror = (event) => {
      console.warn('[SpeechRecognition] Error event:', event.error);
      if (onError) onError(event.error);
    };

    recognition.onend = () => {
      if (onEnd) onEnd();
    };

    recognition.start();
    return recognition;
  } catch (err) {
    console.warn('[SpeechRecognition] Start error:', err);
    if (onError) onError(err.message);
    return null;
  }
}

// -------------------------------------------------------------
// Spoken Input Parser (Hindi & English Numbers and Chip Options)
// -------------------------------------------------------------

const HINDI_NUMBERS = {
  'शून्य': 0, 'जीरो': 0, 'सिफर': 0,
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
  'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15,
  'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  'इक्कीस': 21, 'बाईस': 22, 'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25,
  'छब्बीस': 26, 'सत्ताईस': 27, 'अट्ठाईस': 28, 'उनतीस': 29, 'तीस': 30,
  'इकतीस': 31, 'बत्तीस': 32, 'तैंतीस': 33, 'चौंतीस': 34, 'पैंतीस': 35,
  'छत्तीस': 36, 'सैंतीस': 37, 'अड़तीस': 38, 'उनतालीस': 39, 'चालीस': 40,
  'इकतालीस': 41, 'बयालीस': 42, 'तैंतालीस': 43, 'चवालीस': 44, 'पैंतालीस': 45,
  'छियालीस': 46, 'सैंतालीस': 47, 'अड़तालीस': 48, 'उनचास': 49, 'पचास': 50,
  'प बचपन': 55, 'साठ': 60, 'पैंसठ': 65, 'सत्तर': 70, 'पचहत्तर': 75,
  'अस्सी': 80, 'पचासी': 85, 'नब्बे': 90, 'पंचानवे': 95,
  'सौ': 100, 'डेढ़ सौ': 150, 'ढाई सौ': 250,
  'हजार': 1000, 'हज़ार': 1000, 'लाख': 100000, 'करोड़': 10000000,
};

const ENGLISH_NUMBERS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  hundred: 100, thousand: 1000, lakh: 100000, million: 1000000, crore: 10000000,
};

export function parseSpokenNumber(spoken) {
  if (!spoken) return null;
  const str = String(spoken).toLowerCase().trim();

  // 1. Direct digit extraction (e.g. "₹2500" or "2500" or "45 years")
  const digitMatch = str.match(/\d+(\.\d+)?/);
  if (digitMatch) {
    let num = parseFloat(digitMatch[0]);
    // Check if followed by multiplier like thousand/हजार/k
    if (/k\b|thousand|हजार|हज़ार/i.test(str)) {
      num *= 1000;
    } else if (/lakh|लाख/i.test(str)) {
      num *= 100000;
    }
    return Math.round(num);
  }

  // 2. Hindi phrase combinations (e.g. "पचास हजार", "दो सौ", "पांच सौ", "तीन हजार")
  let total = 0;
  let current = 0;
  const words = str.split(/\s+/);

  for (const word of words) {
    if (HINDI_NUMBERS[word] !== undefined) {
      const val = HINDI_NUMBERS[word];
      if (val === 100 || val === 1000 || val === 100000) {
        current = (current === 0 ? 1 : current) * val;
        total += current;
        current = 0;
      } else {
        current += val;
      }
    } else if (ENGLISH_NUMBERS[word] !== undefined) {
      const val = ENGLISH_NUMBERS[word];
      if (val === 100 || val === 1000 || val === 100000 || val === 10000000) {
        current = (current === 0 ? 1 : current) * val;
        total += current;
        current = 0;
      } else {
        current += val;
      }
    }
  }
  total += current;

  return total > 0 ? total : null;
}

export function matchSpokenOption(spoken, options = []) {
  if (!spoken || !Array.isArray(options) || options.length === 0) return null;
  const s = String(spoken).toLowerCase().trim();

  // 1. Direct match with key or labels
  for (const opt of options) {
    const key = (opt.key || '').toLowerCase();
    const en = (opt.en || opt.name_en || '').toLowerCase();
    const hi = (opt.hi || opt.name_hi || '').toLowerCase();

    if (s === key || s === en || s === hi) {
      return opt.key;
    }
  }

  // 2. Substring match
  for (const opt of options) {
    const key = (opt.key || '').toLowerCase();
    const en = (opt.en || opt.name_en || '').toLowerCase();
    const hi = (opt.hi || opt.name_hi || '').toLowerCase();

    if (
      (en && (s.includes(en) || en.includes(s))) ||
      (hi && (s.includes(hi) || hi.includes(s))) ||
      (key && s.includes(key))
    ) {
      return opt.key;
    }
  }

  // 3. Gender specific synonyms
  if (/male|purush|aadmi|पुरुष|आदमी|लड़का/i.test(s)) return 'male';
  if (/female|mahila|aurat|महिला|औरत|लड़की/i.test(s)) return 'female';
  if (/other|anya|अन्य/i.test(s)) return 'other';

  // 4. Yes/No seasonal
  if (/yes|haan|ha|हाँ|हां|सही/i.test(s)) return 'yes';
  if (/no|nahi|na|नहीं|ना|गलत/i.test(s)) return 'no';

  return null;
}
