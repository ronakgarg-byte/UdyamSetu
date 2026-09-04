import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported,
  speakText,
  stopSpeaking,
  startListening,
  parseSpokenNumber,
  matchSpokenOption,
} from '../utils/speechUtils';

export function VoiceRow({
  textToRead,
  onVoiceInput,
  fieldType = 'text',
  options = [],
  currentValue,
  helperText,
}) {
  const { t, lang, voiceMode } = useApp();
  const [isReading, setIsReading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [feedbackVal, setFeedbackVal] = useState(null);
  const recognitionRef = useRef(null);

  const ttsSupported = isSpeechSynthesisSupported();
  const sttSupported = isSpeechRecognitionSupported();

  // Auto-play TTS on mount or question change if voiceMode is enabled
  useEffect(() => {
    if (voiceMode && textToRead && ttsSupported) {
      handleReadAloud();
    }
    return () => {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [textToRead, voiceMode]);

  const handleReadAloud = () => {
    if (!textToRead || !ttsSupported) return;
    setIsReading(true);
    speakText(textToRead, lang, () => {
      setIsReading(false);
      // If voice mode is on and we have an input handler, auto-start mic after TTS
      if (voiceMode && onVoiceInput && sttSupported && !isListening) {
        handleStartListening();
      }
    });
  };

  const handleStopReading = () => {
    stopSpeaking();
    setIsReading(false);
  };

  const handleStartListening = () => {
    if (!sttSupported || isListening) return;
    stopSpeaking();
    setIsReading(false);
    setIsListening(true);
    setRecognizedText('');

    recognitionRef.current = startListening({
      lang,
      onResult: (transcript) => {
        setIsListening(false);
        setRecognizedText(transcript);

        let parsed = transcript;
        if (fieldType === 'number') {
          parsed = parseSpokenNumber(transcript);
        } else if (fieldType === 'option' || fieldType === 'chips') {
          parsed = matchSpokenOption(transcript, options);
        }

        if (parsed !== null && parsed !== undefined) {
          setFeedbackVal(parsed);
          if (onVoiceInput) {
            onVoiceInput(parsed);
          }
        }
      },
      onError: (err) => {
        setIsListening(false);
        console.warn('[VoiceRow] Speech error:', err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // ignore
      }
    }
    setIsListening(false);
  };

  // If no speech API available, render simple fallback badge
  if (!ttsSupported && !sttSupported) {
    return (
      <div className="flex items-center justify-between text-xs py-1" style={{ color: "#a36a2d" }}>
        <span className="flex items-center gap-1.5 font-medium opacity-80">
          <Mic className="w-3.5 h-3.5" />
          {t("speak")}
        </span>
        <span
          className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold"
          style={{ background: "#efe6d6", color: "#5b4636" }}
        >
          AI
        </span>
      </div>
    );
  }

  return (
    <div className="my-2 p-2.5 rounded-xl border bg-[#faf4e8]/80 border-[#e4d9c7] text-xs">
      <div className="flex items-center justify-between gap-2">
        {/* Left: Speaker Read Aloud */}
        <div className="flex items-center gap-2">
          {textToRead && ttsSupported && (
            <button
              type="button"
              onClick={isReading ? handleStopReading : handleReadAloud}
              title={isReading ? "Stop audio" : t("replayAudio")}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                isReading
                  ? "bg-[#1f3a5f] text-white shadow-sm animate-pulse"
                  : "bg-[#fffdf9] text-[#1f3a5f] border border-[#e4d9c7] hover:bg-[#efe6d6]"
              }`}
            >
              {isReading ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#a36a2d]" />
                  <span>{t("replayAudio")}</span>
                </>
              )}
            </button>
          )}

          {/* Voice Mode Badge if active */}
          {voiceMode && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#3f6b4f] bg-[#e3efe6] px-2 py-0.5 rounded-full">
              <Sparkles className="w-2.5 h-2.5" />
              {t("voiceMode")}
            </span>
          )}
        </div>

        {/* Right: Mic Voice Input */}
        {onVoiceInput && sttSupported && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={isListening ? handleStopListening : handleStartListening}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
                isListening
                  ? "bg-red-600 text-white animate-bounce shadow-md"
                  : "bg-[#1f3a5f] text-white hover:bg-[#152740] shadow-sm"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span className="animate-pulse">{t("listening")}</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-[#e8a33d]" />
                  <span>{t("tapToSpeak")}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Voice Recognition Preview Feedback */}
      {recognizedText && (
        <div className="mt-2 pt-2 border-t border-[#e4d9c7]/70 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1 text-[#3f6b4f] font-medium">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span className="truncate max-w-[200px]">
              "{recognizedText}" {feedbackVal !== null ? `→ ${feedbackVal}` : ""}
            </span>
          </div>
          {onVoiceInput && sttSupported && (
            <button
              type="button"
              onClick={handleStartListening}
              className="text-[#a36a2d] hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              {t("reRecord")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function Field({ label, optional, children, helper }) {
  const { t } = useApp();
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-semibold" style={{ color: "#5b4636" }}>
          {label}
        </label>
        {optional && (
          <span className="text-[11px] italic" style={{ color: "#8a7a68" }}>
            ({t("optional")})
          </span>
        )}
      </div>
      {children}
      {helper && (
        <p className="text-[11px] mt-1" style={{ color: "#8a7a68" }}>
          {helper}
        </p>
      )}
    </div>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text", icon: Icon }) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm px-3.5 py-2.5 rounded-lg border outline-none transition"
        style={{
          background: "#fffdf9",
          borderColor: "#e4d9c7",
          color: "#1f3a5f",
        }}
      />
      {Icon && (
        <Icon
          className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "#8a7a68" }}
        />
      )}
    </div>
  );
}

export function Chip({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs font-medium px-3 py-2 rounded-full border transition-all text-left"
      style={{
        background: selected ? "#1f3a5f" : "#fffdf9",
        color: selected ? "#fffdf9" : "#5b4636",
        borderColor: selected ? "#1f3a5f" : "#e4d9c7",
      }}
    >
      {label}
    </button>
  );
}

export function QACard({ q, a, note, highlight }) {
  return (
    <div
      className="p-3.5 rounded-xl border mb-3"
      style={{
        background: highlight ? "#faf4e8" : "#fffdf9",
        borderColor: highlight ? "#e8a33d" : "#e4d9c7",
      }}
    >
      <div className="text-[11px] font-semibold mb-1" style={{ color: "#8a7a68" }}>
        {q}
      </div>
      <div className="font-heading text-lg font-bold" style={{ color: "#1f3a5f" }}>
        {a}
      </div>
      {note && (
        <div className="text-xs mt-1" style={{ color: "#5b4636" }}>
          {note}
        </div>
      )}
    </div>
  );
}
