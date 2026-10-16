"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { CHAPTERS, HINT_DELAYS, chapterDone } from "@/lib/game";
import { CHECK, wrongLine } from "@/lib/answers";
import { buzz } from "@/lib/audio";
import { drivePhoto } from "@/data/memories";
import { confetti } from "@/lib/confetti";
import { sendAuto } from "@/lib/chat";

export function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="text-teal-300 underline decoration-dotted underline-offset-4 hover:text-teal-200">
      {children} ↗
    </a>
  );
}

export function Photo({ i, className = "", alt = "", w = 800 }: { i: number; className?: string; alt?: string; w?: number }) {
  return <img src={drivePhoto(i, w)} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={`object-cover bg-slate-800 ${className}`} />;
}

export function YouTube({ id, title }: { id: string; title: string }) {
  return (
    <div className="space-y-2">
      <div className="relative w-full overflow-hidden rounded-2xl border border-teal-400/30" style={{ paddingTop: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer" className="text-xs text-slate-400 underline">
        🎵 {title} — open on YouTube ↗
      </a>
    </div>
  );
}

/** A tiny, nearly invisible kiss hidden somewhere in the story text. */
export function HiddenKiss({ id }: { id: string }) {
  const { state, findKiss } = useGame();
  const found = state.kisses.includes(id);
  return (
    <button
      type="button"
      aria-label="?"
      onClick={() => findKiss(id)}
      className={`inline-block align-middle mx-0.5 text-[11px] transition ${found ? "opacity-90" : "opacity-[0.18] hover:opacity-40"}`}
    >
      💋
    </button>
  );
}

export function AnswerBox({
  lockId,
  placeholder,
  check,
  special,
  successMsg,
  button = "Unlock"
}: {
  lockId: string;
  placeholder: string;
  check?: (s: string) => boolean;
  special?: (s: string) => string | null;
  successMsg?: string;
  button?: string;
}) {
  const { solve, notify } = useGame();
  const [val, setVal] = useState("");
  const [shake, setShake] = useState(false);
  const submit = () => {
    if (!val.trim()) return;
    const ok = (check || CHECK[lockId])(val);
    if (ok) return solve(lockId, successMsg);
    buzz();
    setShake(true);
    setTimeout(() => setShake(false), 500);
    notify(special?.(val) || wrongLine(), "bad");
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className={`flex gap-2 ${shake ? "shake" : ""}`}
    >
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder={placeholder}
        autoCapitalize="none"
        autoComplete="off"
        className="flex-1 min-w-0 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-400 outline-none px-3 py-2.5 text-sm text-white font-mono"
      />
      <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950 font-bold text-sm shrink-0">{button}</button>
    </form>
  );
}

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [active]);
  return now;
}

export function Lock({
  id,
  index,
  title,
  twoPlayer,
  hints,
  children,
  solvedNote
}: {
  id: string;
  index: number;
  title: string;
  twoPlayer?: boolean;
  hints: string[];
  children: React.ReactNode;
  solvedNote?: React.ReactNode;
}) {
  const { state, isSolved, markOpened, revealHint } = useGame();
  const solved = isSolved(id);
  useEffect(() => {
    if (!solved) markOpened(id);
  }, [id, solved, markOpened]);
  const shown = state.hints[id] || 0;
  const opened = state.openedAt[id] || Date.now();
  const now = useNow(!solved && shown < hints.length);
  const nextAt = opened + (HINT_DELAYS[shown] ?? 0) * 60000;
  const wait = Math.max(0, nextAt - now);
  // Animate only when the lock opens while she is watching, not on page load.
  const wasSolved = useRef(solved);
  const [justOpened, setJustOpened] = useState(false);
  useEffect(() => {
    if (solved && !wasSolved.current) setJustOpened(true);
    wasSolved.current = solved;
  }, [solved]);

  return (
    <div
      className={`rounded-3xl border p-5 sm:p-6 space-y-4 fade-in ${justOpened ? "unlock-pop" : ""} ${
        solved ? "bg-emerald-950/20 border-emerald-500/30" : "bg-slate-900/60 backdrop-blur-md border-teal-500/25 shadow-[0_0_40px_-20px_rgba(45,212,191,0.5)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-teal-400">
            Lock {index + 1} {twoPlayer && <span className="ml-1 text-cyan-300">· 🤝 two-player lock</span>}
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        <span className={`text-2xl ${justOpened ? "padlock" : ""}`}>{solved ? "🔓" : "🔒"}</span>
      </div>

      {solved ? (
        <div className="text-sm text-emerald-200">{solvedNote || "Solved. On to the next one, agent."}</div>
      ) : (
        <>
          {children}
          {hints.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {hints.slice(0, shown).map((h, i) => (
                <p key={i} className="text-xs text-sky-200 bg-sky-950/40 border border-sky-500/20 rounded-xl px-3 py-2">
                  🔦 Hint {i + 1}: {h}
                </p>
              ))}
              {shown < hints.length && (
                <button
                  disabled={wait > 0}
                  onClick={() => revealHint(id)}
                  className="text-xs text-slate-400 disabled:opacity-60 hover:text-teal-300 underline decoration-dotted"
                >
                  {wait > 0
                    ? `🔦 Hint ${shown + 1} unlocks in ${Math.floor(wait / 60000)}:${String(Math.floor((wait % 60000) / 1000)).padStart(2, "0")}`
                    : `🔦 Reveal hint ${shown + 1} (costs 1 real kiss to Piccalito 💋)`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Renders a chapter's locks one at a time, then the chapter reward. */
export function ChapterShell({
  n,
  intro,
  children,
  reward,
  onNext
}: {
  n: number;
  intro: React.ReactNode;
  children: React.ReactNode[];
  reward: React.ReactNode;
  onNext: () => void;
}) {
  const { state } = useGame();
  const ch = CHAPTERS[n - 1];
  const done = chapterDone(state, n);
  const visible = ch.locks.findIndex((l) => !state.solved.includes(l));
  const upto = visible === -1 ? ch.locks.length - 1 : visible;
  const [celebrated, setCelebrated] = useState(done);
  useEffect(() => {
    if (done && !celebrated) {
      confetti();
      sendAuto(n);
      setCelebrated(true);
    }
  }, [done, celebrated]);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl overflow-hidden border border-teal-500/25 bg-slate-900/60 backdrop-blur-md">
        <div className="relative overflow-hidden">
          <Photo i={ch.photo} className="w-full h-56 sm:h-72 kenburns" alt={ch.title} w={1000} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.3em] text-cyan-300">Chapter {n} · {ch.place}</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">{ch.title}</h2>
          </div>
        </div>
        <div className="p-5 sm:p-6 text-sm text-slate-300 leading-relaxed space-y-3">{intro}</div>
      </div>

      {React.Children.toArray(children).slice(0, upto + 1)}

      {done && (
        <div className="rounded-3xl border-2 border-cyan-400/50 bg-gradient-to-br from-teal-950/70 to-sky-950/70 p-5 sm:p-6 space-y-4 fade-in">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-xl font-bold text-white">🏅 Chapter {n} cleared</h3>
            {ch.fragment && (
              <div className="stamp px-4 py-2 rounded-lg border-2 border-cyan-300 text-cyan-200 font-mono font-black text-lg tracking-[0.3em]">
                🧳 {ch.fragment}
              </div>
            )}
          </div>
          {ch.fragment && (
            <p className="text-xs text-cyan-200/80">
              You earned a luggage tag: <strong className="font-mono">{ch.fragment}</strong>. Keep it safe — you will need every tag at the very end.
            </p>
          )}
          {reward}
          <YouTube id={ch.song.id} title={ch.song.title} />
          {n < CHAPTERS.length && (
            <button onClick={onNext} className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950 font-bold">
              Open Chapter {n + 1}: {CHAPTERS[n].title} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
