"use client";

import React, { useEffect, useState } from "react";
import { CHAPTERS, GameState, HIDDEN_KISSES, PLAYER, TWO_PLAYER_LOCKS, chapterDone, formatDuration, gmCode, kissesOwed } from "@/lib/game";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ChatPanel } from "@/components/Chat";

const GM_PIN = process.env.NEXT_PUBLIC_GM_PIN || "ring-thief-1130";

const ANSWER_KEY: Record<string, string> = {
  "c1-alarm": "Keep chasing/tapping the SNOOZE button — after 9 escapes it gives up",
  "c1-clock": "11:30",
  "c1-dream": "sleep",
  "c2-gifts": "Decoder shift 3 → 'What did I bring you on our first date' → flowers and chocolates",
  "c2-seats": "Daham, Sewmini, Chutyymiii, Piccalito, Hasitha",
  "c2-map": "Dehiwala",
  "c3-lockers": "Random locker each try; follow the hot/cold emojis",
  "c3-safe": "Random 4-digit code (Mastermind)",
  "c3-confess": "TWO-PLAYER",
  "c4-dress": "FORMAL",
  "c4-shy": "Timing game — 5 hits (misses don't reset)",
  "c4-morse": "BLUSH",
  "c5-shelf": "Sort by call number → DOMINO",
  "c5-maze": "Collect 5 kisses at dead ends, then reach the farthest point (🏠)",
  "c5-shout": "Shout into the mic for 2 seconds — or TWO-PLAYER fallback",
  "c6-recon": "Lingo (Retexia Lingo)",
  "c6-terminal": "ls -a → cat .env → deploy aixeter",
  "c6-contract": "Sign the pad",
  "c7-match": "Memory card game",
  "c7-timeline": "Zoo sign → camcorder hug → mall mirror (pink dress) → library → hands on face",
  "c7-slide": "3×3 sliding puzzle",
  "c7-toll": "TWO-PLAYER",
  "c8-tags": "NO MA TT ER W HA T",
  "c8-flight": "YYZ",
  "c8-final": "TWO-PLAYER"
};

const card = "rounded-3xl bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 space-y-3";

export default function HQ() {
  const [ok, setOk] = useState(false);
  const [pin, setPin] = useState("");
  useEffect(() => {
    try {
      if (sessionStorage.getItem("gm-ok") === "1") setOk(true);
    } catch {}
  }, []);
  if (!ok)
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (pin === GM_PIN) {
              setOk(true);
              try {
                sessionStorage.setItem("gm-ok", "1");
              } catch {}
            }
          }}
          className="w-full max-w-sm rounded-3xl bg-black/70 backdrop-blur-md scanlines relative border border-cyan-400/30 p-6 space-y-3 font-mono"
        >
          <div className="glitch text-xs text-teal-300 uppercase tracking-widest">🔐 Handler login · restricted</div>
          <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="handler PIN" className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-white" />
          <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950 font-bold">Log in as Piccalito</button>
        </form>
      </div>
    );
  return <Dashboard />;
}

function Dashboard() {
  const [state, setState] = useState<GameState | null>(null);
  const [updated, setUpdated] = useState<string | null>(null);
  const [notes, setNotes] = useState<{ sender: string; message: string; created_at: string }[]>([]);
    const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const { data } = await supabase!.from("quest_state").select("*").eq("player", PLAYER).maybeSingle();
      if (data) {
        setState(data.state);
        setUpdated(data.updated_at);
      }
      const { data: n } = await supabase!.from("love_notes").select("*").order("created_at", { ascending: false }).limit(20);
      if (n) setNotes(n);
    };
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const send = async (kind: "msg" | "unlock", body: string | null, lock_id: string | null) => {
    if (!supabase) return;
    const { error } = await supabase.from("gm_messages").insert({ kind, body, lock_id });
    setLog((l) => [`${new Date().toLocaleTimeString()} — ${error ? "❌ " + error.message : kind === "msg" ? "📡 sent: " + body : "🔓 remote unlock: " + lock_id}`, ...l]);
  };

  const current = state && CHAPTERS.flatMap((c) => c.locks).find((l) => !state.solved.includes(l));

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-cyan-300">Handler HQ</div>
          <h1 className="text-xl font-black text-white">Piccalito&apos;s Control Room 🎛️</h1>
        </div>
        <span className="text-[11px] font-mono px-2 py-1 rounded-full border border-slate-700">{isSupabaseConfigured ? "🟢 Supabase live" : "⚪ local mode"}</span>
      </header>

      {!isSupabaseConfigured && (
        <div className={card}>
          <p className="text-sm text-cyan-200">
            Supabase isn&apos;t configured, so live progress, live messages and remote unlocks are off. The two-player codes below still work.
          </p>
        </div>
      )}

      {isSupabaseConfigured && (
        <div className={card}>
          <h2 className="text-xs font-mono uppercase text-teal-300">👀 Her progress (refreshes every 5s)</h2>
          {!state ? (
            <p className="text-sm text-slate-400">She hasn&apos;t started yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <Stat label="locks solved" value={`${state.solved.length}/25`} />
                <Stat label="kisses owed (hints)" value={String(kissesOwed(state))} />
                <Stat label="hidden kisses" value={`${state.kisses.length}/${HIDDEN_KISSES.length}`} />
                <Stat label="playing for" value={state.startedAt ? formatDuration((state.finishedAt || Date.now()) - state.startedAt) : "—"} />
              </div>
              <p className="text-sm text-slate-300">
                Now on: <strong className="text-white font-mono">{current || "🎉 FINISHED"}</strong>
                {current && state.hints[current] ? ` · ${state.hints[current]} hint(s) used` : ""}
                {updated && <span className="text-slate-500 text-xs"> · last activity {new Date(updated).toLocaleTimeString()}</span>}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {CHAPTERS.map((c) => (
                  <div key={c.n} className={`rounded-lg p-2 text-[10px] font-mono border ${chapterDone(state, c.n) ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-700"}`}>
                    CH{c.n} {c.locks.filter((l) => state.solved.includes(l)).length}/{c.locks.length}
                  </div>
                ))}
              </div>
              {state.signature && (
                <div>
                  <div className="text-[11px] font-mono text-slate-400">✍️ Her co-founder pact signature:</div>
                  <img src={state.signature} alt="signature" className="w-full max-w-md rounded-xl bg-slate-950 border border-slate-800" />
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className={card}>
        <h2 className="text-xs font-mono uppercase text-cyan-300">🤝 Two-player locks — only give the code when she does the thing</h2>
        {Object.entries(TWO_PLAYER_LOCKS).map(([id, when]) => (
          <div key={id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-slate-500">{id} {state?.solved.includes(id) && "✅"}</div>
              <div className="text-sm text-slate-200">{when}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-black tracking-[0.3em] text-cyan-300">{gmCode(id)}</span>
              {isSupabaseConfigured && (
                <button onClick={() => send("unlock", null, id)} className="px-3 py-2 rounded-lg bg-cyan-400/20 border border-cyan-400/50 text-cyan-200 text-xs font-bold">
                  Remote unlock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-xs font-mono uppercase text-teal-300 px-1">💬 Hotline with Chutyymiii</h2>
        <ChatPanel me="Piccalito" />
        {log.map((l, i) => (
          <div key={i} className="text-[11px] font-mono text-slate-400 px-1">{l}</div>
        ))}
      </div>

      {notes.length > 0 && (
        <div className={card}>
          <h2 className="text-xs font-mono uppercase text-teal-300">💌 Love notes</h2>
          {notes.map((n, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-950 border border-teal-400/20 text-sm">
              <strong className="text-teal-300">{n.sender}:</strong> {n.message}
            </div>
          ))}
        </div>
      )}

      <details className={card}>
        <summary className="text-xs font-mono uppercase text-slate-300 cursor-pointer">🗝️ Answer key (tap to reveal)</summary>
        <div className="space-y-1 pt-2">
          {CHAPTERS.flatMap((c) =>
            c.locks.map((l) => (
              <div key={l} className="flex gap-3 text-xs font-mono border-b border-slate-800 py-1.5">
                <span className={`w-24 shrink-0 ${state?.solved.includes(l) ? "text-emerald-400" : "text-slate-500"}`}>{l}</span>
                <span className="text-slate-200">{ANSWER_KEY[l]}</span>
              </div>
            ))
          )}
        </div>
      </details>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950 border border-slate-800 p-3">
      <div className="text-xl font-black text-white">{value}</div>
      <div className="text-[10px] font-mono text-slate-400">{label}</div>
    </div>
  );
}
