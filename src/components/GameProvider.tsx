"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ALL_LOCKS, EMPTY_STATE, GameState, PLAYER } from "@/lib/game";
import { chime } from "@/lib/audio";
import { confetti } from "@/lib/confetti";

const STORAGE_KEY = "nmw-quest-v2";

export interface Transmission {
  id: number;
  kind: string;
  body: string | null;
  lock_id: string | null;
  created_at: string;
}

interface Toast {
  id: number;
  msg: string;
  tone: "good" | "bad" | "info" | "gm";
}

interface GameCtx {
  state: GameState;
  loaded: boolean;
  isSolved: (id: string) => boolean;
  solve: (id: string, msg?: string) => void;
  revealHint: (id: string) => void;
  markOpened: (id: string) => void;
  findKiss: (id: string) => void;
  update: (patch: Partial<GameState>) => void;
  notify: (msg: string, tone?: Toast["tone"]) => void;
  transmissions: Transmission[];
}

const Ctx = createContext<GameCtx | null>(null);

export const useGame = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside GameProvider");
  return c;
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(EMPTY_STATE);
  const [loaded, setLoaded] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  const notify = useCallback((msg: string, tone: Toast["tone"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "gm" ? 9000 : 3800);
  }, []);

  const mutate = useCallback((fn: (s: GameState) => GameState) => {
    setState((s) => ({ ...fn(s), updatedAt: Date.now() }));
  }, []);

  // Load: localStorage first, then prefer the remote copy if it has more progress (other device).
  useEffect(() => {
    let local: GameState = EMPTY_STATE;
    try {
      if (new URLSearchParams(window.location.search).get("reset") === "1") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) local = { ...EMPTY_STATE, ...JSON.parse(raw) };
      }
    } catch {}
    setState(local);
    setLoaded(true);
    (async () => {
      if (!supabase) return;
      const { data } = await supabase.from("quest_state").select("state").eq("player", PLAYER).maybeSingle();
      const remote = data?.state as GameState | undefined;
      if (remote && (remote.solved?.length || 0) > local.solved.length) {
        setState({ ...EMPTY_STATE, ...remote });
      }
    })();
  }, []);

  // Persist locally on every change; push to Supabase debounced.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
    if (!supabase || !state.updatedAt) return;
    const t = setTimeout(() => {
      supabase!
        .from("quest_state")
        .upsert({ player: PLAYER, state, updated_at: new Date().toISOString() })
        .then(() => {});
    }, 1200);
    return () => clearTimeout(t);
  }, [state, loaded]);

  const solve = useCallback(
    (id: string, msg?: string) => {
      if (stateRef.current.solved.includes(id)) return;
      chime();
      confetti(1400, ["🩵", "✨", "💋"], 26);
      mutate((s) => {
        const solved = [...s.solved, id];
        const finished = ALL_LOCKS.every((l) => solved.includes(l));
        return { ...s, solved, finishedAt: finished ? Date.now() : s.finishedAt };
      });
      notify(msg || "🔓 Lock opened!", "good");
    },
    [mutate, notify]
  );

  // Poll Piccalito's transmissions (hints + remote unlocks) from HQ.
  useEffect(() => {
    if (!supabase || !loaded) return;
    let stop = false;
    const poll = async () => {
      const { data } = await supabase!.from("gm_messages").select("*").order("id", { ascending: true }).limit(200);
      if (stop || !data) return;
      setTransmissions(data as Transmission[]);
      const s = stateRef.current;
      for (const m of data as Transmission[]) {
        if (m.kind === "unlock" && m.lock_id && !s.solved.includes(m.lock_id)) {
          solve(m.lock_id, "📡 Piccalito unlocked this one remotely 💖");
        }
        if (m.kind === "msg" && m.id > s.lastMsgId && s.lastMsgId !== 0) {
          notify("📡 Piccalito: " + m.body, "gm");
        }
      }
      const maxId = data.length ? (data[data.length - 1] as Transmission).id : 0;
      if (maxId > s.lastMsgId) mutate((x) => ({ ...x, lastMsgId: maxId }));
      else if (s.lastMsgId === 0) mutate((x) => ({ ...x, lastMsgId: -1 }));
    };
    poll();
    const t = setInterval(poll, 7000);
    return () => {
      stop = true;
      clearInterval(t);
    };
  }, [loaded, solve, notify, mutate]);

  const value: GameCtx = {
    state,
    loaded,
    isSolved: (id) => state.solved.includes(id),
    solve,
    revealHint: (id) => mutate((s) => ({ ...s, hints: { ...s.hints, [id]: (s.hints[id] || 0) + 1 } })),
    markOpened: (id) => {
      if (stateRef.current.openedAt[id]) return;
      mutate((s) => (s.openedAt[id] ? s : { ...s, openedAt: { ...s.openedAt, [id]: Date.now() } }));
    },
    findKiss: (id) => {
      if (stateRef.current.kisses.includes(id)) return;
      chime();
      mutate((s) => ({ ...s, kisses: [...s.kisses, id] }));
      notify(`💋 Hidden kiss found! (${stateRef.current.kisses.length + 1}/8)`, "good");
    },
    update: (patch) => mutate((s) => ({ ...s, ...patch })),
    notify,
    transmissions
  };

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-4 z-[100] flex flex-col gap-2 sm:max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-in px-4 py-3 rounded-2xl shadow-2xl text-sm font-medium border backdrop-blur ${
              t.tone === "good"
                ? "bg-emerald-950/95 border-emerald-400/50 text-emerald-100"
                : t.tone === "bad"
                ? "bg-rose-950/95 border-rose-400/50 text-rose-100"
                : t.tone === "gm"
                ? "bg-sky-950/95 border-cyan-300/70 text-cyan-100"
                : "bg-slate-900/95 border-teal-400/40 text-teal-100"
            }`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
