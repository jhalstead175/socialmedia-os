import React, { useEffect, useMemo, useRef, useState } from "react";

const SAMPLE_STEPS = [
  { role: "Ava", text: "Tell me about a time you led a difficult project." },
  { role: "You", text: "At my previous role, I managed a cross‑functional team to rebuild our billing system..." },
  { role: "Ava", text: "Great example. Can you quantify the impact? Think revenue, cost, time, or risk." },
  { role: "You", text: "We cut payment failures by 37% and reduced reconciliation time from days to hours." },
  { role: "Ava", text: "Strong. Now frame it with STAR: Situation, Task, Action, Result — then stop." },
];

const Bubble = ({ role, text }) => {
  const isAva = role === "Ava";
  return (
    <div className={`flex items-start gap-3 ${isAva ? "" : "flex-row-reverse"}`} aria-live="polite">
      <div className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-6 shadow/20 shadow-black/30 ${isAva ? "bg-zinc-800/70 text-zinc-100 border border-zinc-700" : "bg-indigo-600/90 text-white"}`}>
        <span className="block font-medium mb-1 opacity-80">{role}</span>
        <span className="block">{text}</span>
      </div>
    </div>
  );
};

export function InterviewCoachWidget({ avatarUrl = "/img/ava-bridge.png", className = "" }) {
  const [visibleSteps, setVisibleSteps] = useState(SAMPLE_STEPS.slice(0, 2));
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisibleSteps((prev) => {
        if (prev.length === SAMPLE_STEPS.length) return SAMPLE_STEPS.slice(0, 2);
        return SAMPLE_STEPS.slice(0, prev.length + 1);
      });
    }, 2400);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  const progress = useMemo(() => visibleSteps.length / SAMPLE_STEPS.length, [visibleSteps.length]);

  return (
    <div className={`w-full max-w-xl rounded-3xl border border-zinc-800/70 bg-zinc-950/40 p-5 md:p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.6)] backdrop-blur ${className}`}
      role="region" aria-label="Ava Interview Coach" tabIndex={0}>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 md:h-11 md:w-11 rounded-full object-cover ring-2 ring-indigo-500/40 bg-gradient-to-br from-indigo-400 to-purple-400" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-zinc-100 text-base md:text-lg font-semibold tracking-tight">Ava Bridge</h3>
              <span className="inline-flex items-center rounded-full bg-indigo-600/20 px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-500/30">Interview Coach</span>
            </div>
            <p className="text-xs md:text-sm text-zinc-400">Mock panels • STAR prompts • Instant feedback</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"/>Live</div>
      </div>
      <div className="space-y-3 md:space-y-3.5">
        {visibleSteps.map((s, i) => <Bubble key={`${s.role}-${i}`} role={s.role} text={s.text} />)}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex-1">
          <div className="h-1.5 w-full rounded-full bg-zinc-800/70 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.max(0.2, progress) * 100}%` }} />
          </div>
          <p className="mt-2 text-[11px] md:text-xs text-zinc-400">Tip: Quantify results (%, $, time) and finish with a concise STAR-style close.</p>
        </div>
        <button className="shrink-0 inline-flex items-center justify-center rounded-xl px-3.5 py-2 text-sm font-semibold text-zinc-100 bg-zinc-800 hover:bg-zinc-700" onClick={() => setVisibleSteps(SAMPLE_STEPS.slice(0, 2))}>Reset</button>
      </div>
    </div>
  );
}

export default InterviewCoachWidget;