"use client";

import React, { useEffect, useState } from "react";
import { GameProvider, useGame } from "@/components/GameProvider";
import { CHAPTER_COMPONENTS } from "@/components/chapters";
import { HiddenKiss } from "@/components/ui";
import { CHAPTERS, HIDDEN_KISSES, chapterDone, chapterUnlocked, formatDuration, kissesOwed } from "@/lib/game";
import { isChutyymiii, isHerPasscode, isPiccalito } from "@/lib/answers";
import { confetti } from "@/lib/confetti";
import { ChatDock } from "@/components/Chat";
import { buzz, chime } from "@/lib/audio";
import { INITIAL_MEMORIES, MemoryPhoto } from "@/data/memories";
import { driveImage } from "@/lib/drive";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export default function Page() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}

function Game() {
  const { state, loaded } = useGame();
  if (!loaded)
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-teal-300 text-sm">
        <span className="blink">decrypting classified dossier…</span>
      </div>
    );
  return state.booted ? <Mission /> : <Boot />;
}

/* ---------------- Boot / identity check ---------------- */
const BOOT_LINES = [
  "> INCOMING TRANSMISSION…",
  "> ENCRYPTION: LOVE-256",
  "> CLASSIFICATION: TOP SECRET · ANNIVERSARY",
  "> OPERATION: NO MATTER WHAT",
  "> 8 chapters. 25 locks. 1 stolen ring.",
  "> Some locks cannot be opened alone.",
  "> Agent identity verification required."
];

const STEPS = [
  { label: "Enter your agent codename", button: "VERIFY IDENTITY" },
  { label: "Enter your handler's codename", button: "CONFIRM HANDLER" },
  { label: "Enter the secret passcode Piccalito texted you", button: "🔐 LOG IN & BEGIN MISSION" }
];

function Boot() {
  const { update, notify } = useGame();
  const [shown, setShown] = useState(0);
  const [step, setStep] = useState(0);
  const [v, setV] = useState("");
  const [handler, setHandler] = useState(false);
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (shown >= BOOT_LINES.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 650);
    return () => clearTimeout(t);
  }, [shown]);
  const fail = (msg: string) => {
    buzz();
    setShake(true);
    setTimeout(() => setShake(false), 500);
    notify(msg, "bad");
  };
  const next = () => {
    chime();
    setStep((s) => s + 1);
    setV("");
  };
  const submit = () => {
    if (step === 0) {
      if (isChutyymiii(v)) return next();
      if (isPiccalito(v)) return setHandler(true);
      return fail("🚨 That is not my girlfriend. Intruder alert.");
    }
    if (step === 1) return isPiccalito(v) ? next() : fail("🤨 You don't even know your own handler's codename?");
    if (isHerPasscode(v)) {
      chime();
      confetti(1800, ["🩵", "✨", "🔓"], 50);
      update({ booted: true, startedAt: Date.now() });
      return;
    }
    fail("🔐 Wrong passcode. Check Piccalito's text… or text him and ask 🥺");
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className={`w-full max-w-xl rounded-3xl bg-black/70 backdrop-blur-md scanlines relative border border-teal-500/30 p-6 sm:p-8 font-mono space-y-5 shadow-[0_0_80px_-20px_rgba(45,212,191,0.6)] ${shake ? "shake" : ""}`}>
        <h1 className="glitch text-center text-2xl sm:text-3xl font-black tracking-[0.2em] text-teal-300">NO MATTER WHAT</h1>
        <div className="space-y-1.5 text-sm text-emerald-300 min-h-[190px]">
          {BOOT_LINES.slice(0, shown).map((l) => (
            <div key={l} className="fade-in">
              {l}
            </div>
          ))}
          {shown < BOOT_LINES.length && <span className="blink">▌</span>}
        </div>
        {handler ? (
          <div className="space-y-3 fade-in text-sm text-cyan-100">
            <p>😏 Handler Piccalito detected. This door is for the agent. Your control room is elsewhere.</p>
            <a href="/piccalito-hq" className="block text-center w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950 font-black">
              → Go to Handler HQ
            </a>
            <button onClick={() => setHandler(false)} className="text-xs text-slate-400 underline">I&apos;m actually Chutyymiii</button>
          </div>
        ) : (
          shown >= BOOT_LINES.length && (
            <form
              key={step}
              className="space-y-3 fade-in"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
            >
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <span key={i} className={`h-1 flex-1 rounded-full transition-all ${i < step ? "bg-teal-400" : i === step ? "bg-teal-400/50 pulse-ring" : "bg-slate-800"}`} />
                ))}
              </div>
              <label className="block text-xs uppercase tracking-widest text-teal-300">
                {STEPS[step].label} {step === 0 && <HiddenKiss id="k-boot" />}
              </label>
              <input
                autoFocus
                type={step === 2 ? "password" : "text"}
                value={v}
                onChange={(e) => setV(e.target.value)}
                autoCapitalize="none"
                autoComplete="off"
                className="w-full rounded-xl bg-slate-950 border border-teal-500/40 px-4 py-3 text-white text-lg outline-none focus:border-teal-300 focus:shadow-[0_0_20px_-4px_rgba(45,212,191,0.7)] transition"
              />
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950 font-black">{STEPS[step].button}</button>
            </form>
          )
        )}
      </div>
    </div>
  );
}

/* ---------------- Mission ---------------- */
function Mission() {
  const { state, notify } = useGame();
  const firstOpen = CHAPTERS.findIndex((c) => !chapterDone(state, c.n));
  const [active, setActive] = useState(firstOpen === -1 ? 8 : firstOpen + 1);
  const [vault, setVault] = useState(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  const Chapter = CHAPTER_COMPONENTS[active - 1];
  const done = CHAPTERS.filter((c) => chapterDone(state, c.n)).length;
  const go = (n: number) => {
    setActive(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="sticky top-0 z-40 border-b border-teal-500/20 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-teal-400">Operation: No Matter What</div>
            <div className="text-sm font-bold text-white truncate">Agent Chutyymiii · Handler Piccalito</div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700">📂 {done}/8</span>
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700" title="Kisses owed to Piccalito for hints">💋 owed {kissesOwed(state)}</span>
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700" title="Hidden kisses found">🔍 {state.kisses.length}/{HIDDEN_KISSES.length}</span>
            <span className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700">⏱ {state.startedAt ? formatDuration((state.finishedAt || now) - state.startedAt) : "0m"}</span>
            <button onClick={() => setVault(true)} className="px-2 py-1 rounded-lg bg-teal-500/20 border border-teal-400/40 text-teal-200">
              📸 Vault
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-5 space-y-5">
        <nav className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
          {CHAPTERS.map((c) => {
            const unlocked = chapterUnlocked(state, c.n);
            const isDone = chapterDone(state, c.n);
            return (
              <button
                key={c.n}
                onClick={() => (unlocked ? go(c.n) : notify("🔒 Classified. Finish the previous chapter first.", "bad"))}
                className={`rounded-xl border px-2 py-2 text-left transition ${
                  active === c.n
                    ? "bg-teal-500/25 border-teal-400 pulse-ring"
                    : isDone
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : unlocked
                    ? "bg-slate-900/60 backdrop-blur-md border-cyan-400/40"
                    : "bg-slate-900/40 border-slate-800 opacity-60"
                }`}
              >
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>CH {c.n}</span>
                  <span>{isDone ? "✅" : unlocked ? "🔓" : "🔒"}</span>
                </div>
                <div className="text-[11px] font-semibold text-white leading-tight line-clamp-2">{unlocked ? c.title : "▓▓▓▓ ▓▓▓"}</div>
              </button>
            );
          })}
        </nav>

        <div key={active} className="chapter-in">
          <Chapter onNext={() => go(Math.min(8, active + 1))} />
        </div>
      </main>

      {vault && <Vault onClose={() => setVault(false)} />}
      <ChatDock me="Chutyymiii" chapter={active} />
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3" onClick={onClose}>
      <div className="bg-slate-900 border border-teal-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 gap-3">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-800 text-xs shrink-0">
            ✕ Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------------- Memory vault ---------------- */
function Vault({ onClose }: { onClose: () => void }) {
  const { state, notify } = useGame();
  const [extra, setExtra] = useState<MemoryPhoto[]>([]);
  const [url, setUrl] = useState("");
  const [cap, setCap] = useState("");
  const [zoom, setZoom] = useState<MemoryPhoto | null>(null);
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("memory_photos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setExtra(data.map((p: any) => ({ id: p.id, src: driveImage(p.image_url, 600), caption: p.caption, tag: p.chapter_tag || "Added memory", unlockAfter: 0 })));
      });
  }, []);
  const visible = (p: MemoryPhoto) => p.unlockAfter === 0 || chapterDone(state, p.unlockAfter);
  const all = [...extra, ...INITIAL_MEMORIES];
  const open = all.filter(visible).length;
  const add = async () => {
    if (!url.trim()) return;
    const item: MemoryPhoto = { id: "new-" + Date.now(), src: driveImage(url, 600), caption: cap.trim() || "New memory ❤️", tag: "Added memory", unlockAfter: 0 };
    setExtra([item, ...extra]);
    setUrl("");
    setCap("");
    notify("📸 Added to the vault!", "good");
    if (supabase) await supabase.from("memory_photos").insert({ image_url: url.trim(), caption: item.caption, chapter_tag: item.tag });
  };
  return (
    <Modal title={`📸 Memory Vault · ${open}/${all.length} declassified`} onClose={onClose}>
      <p className="text-xs text-slate-400">Each chapter you finish declassifies more photos. Add new ones with a Google Drive share link (set to &quot;Anyone with the link&quot;).</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Google Drive share link" className="rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white" />
        <input value={cap} onChange={(e) => setCap(e.target.value)} placeholder="Caption…" className="rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white" />
        <button onClick={add} className="rounded-xl bg-teal-500 text-slate-950 font-bold text-xs py-2.5">+ Add photo</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {all.map((p) =>
          visible(p) ? (
            <button key={p.id} onClick={() => setZoom(p)} className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 text-left">
              <img src={p.src} alt={p.caption} loading="lazy" referrerPolicy="no-referrer" className="w-full aspect-square object-cover" />
              <div className="p-2 text-[10px] text-slate-300 line-clamp-2">{p.caption}</div>
            </button>
          ) : (
            <div key={p.id} className="rounded-xl bg-slate-950 border border-slate-800 aspect-square flex flex-col items-center justify-center text-center p-2">
              <span className="text-2xl">🔒</span>
              <span className="text-[10px] font-mono text-slate-500">finish chapter {p.unlockAfter}</span>
            </div>
          )
        )}
      </div>
      {zoom && (
        <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col items-center justify-center p-4" onClick={() => setZoom(null)}>
          <img src={zoom.src.replace(/sz=w\d+/, "sz=w1600")} alt={zoom.caption} referrerPolicy="no-referrer" className="max-h-[80vh] max-w-full rounded-2xl" />
          <p className="mt-3 text-sm text-slate-200 text-center">{zoom.caption}</p>
        </div>
      )}
    </Modal>
  );
}
