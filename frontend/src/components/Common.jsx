import React from 'react';
import { Mic } from 'lucide-react';

export function Field({ label, children, hint }) {
  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-sm font-medium" style={{ color: "#33261a" }}>
          {label}
        </label>
        {hint && <span className="text-xs text-stone-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border px-4 py-3 text-base outline-none transition-colors focus:ring-2 focus:ring-[#1f3a5f]/20"
      style={{
        borderColor: "#e4d9c7",
        backgroundColor: "#fffdf9",
        color: "#33261a",
      }}
    />
  );
}

export function Chip({ active, onClick, children, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="rounded-full border px-3.5 py-2 text-sm font-medium transition-all shadow-sm active:scale-95"
      style={
        active
          ? { backgroundColor: "#1f3a5f", borderColor: "#1f3a5f", color: "#fff" }
          : { backgroundColor: "#fffdf9", borderColor: "#e4d9c7", color: "#5b4636" }
      }
    >
      {children}
    </button>
  );
}

export function VoiceRow({ label }) {
  return (
    <button
      type="button"
      onClick={() => alert("Speech recognition active — speak in Hindi or English")}
      className="mt-1 flex items-center gap-2 text-xs font-medium hover:opacity-80 transition-opacity"
      style={{ color: "#a36a2d" }}
    >
      <Mic size={14} /> {label}
    </button>
  );
}

export function QACard({ icon: Icon, question, answer, accent }) {
  return (
    <div
      className="rounded-2xl border p-4 mb-3 flex gap-3 shadow-sm transition-shadow hover:shadow-md"
      style={{ borderColor: "#e4d9c7", backgroundColor: "#fffdf9" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: accent + "22" }}
      >
        <Icon size={18} color={accent} />
      </div>
      <div>
        <p className="text-xs mb-1 font-medium" style={{ color: "#8a7a68" }}>{question}</p>
        <p className="text-sm font-semibold" style={{ color: "#1f3a5f" }}>{answer}</p>
      </div>
    </div>
  );
}
