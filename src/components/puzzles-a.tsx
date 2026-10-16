"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { gmCode, shuffle } from "@/lib/game";
import { CHECK, wrongLine } from "@/lib/answers";
import { alarmBeep, buzz, tone } from "@/lib/audio";

const btn = "px-4 py-2.5 rounded-xl font-bold text-sm transition active:scale-95";
const primary = `${btn} bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950`;
const ghost = `${btn} bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700`;

/* ---------------- Runaway snooze button ---------------- */
const SNOOZE_TAUNTS = [
  "⏰ BEEP BEEP BEEP! Catch the SNOOZE button to shut it up!",
  "😝 Nope. Too slow.",
  "🏃‍♀️ It ran away. Just like you run away from mornings.",
  "😴 It's 11:31 AM and you're still losing to a button.",
  "🙄 bhhhhh!",
  "🐢 Piccalito could do this in his sleep (unlike you, who only sleeps).",
  "😂 suttee! Missed again.",
  "🥵 The button is getting tired…",
  "😮‍💨 It's almost out of breath…",
  "🫠 The button gave up. Tap it now!"
];

export function SnoozeButton({ onSolve }: { onSolve: () => void }) {
  const [pos, setPos] = useState({ x: 50, y: 55 });
  const [escapes, setEscapes] = useState(0);
  const [sound, setSound] = useState(false);
  const tired = escapes >= SNOOZE_TAUNTS.length - 1;
  useEffect(() => {
    if (!sound) return;
    alarmBeep();
    const t = setInterval(alarmBeep, 1400);
    return () => clearInterval(t);
  }, [sound]);
  const lastDodge = useRef(0);
  const dodge = () => {
    // cooldown: the button slides through the cursor while moving, which would chain-trigger dodges
    if (tired || Date.now() - lastDodge.current < 450) return;
    lastDodge.current = Date.now();
    setEscapes((e) => e + 1);
    setPos({ x: 12 + Math.random() * 76, y: 18 + Math.random() * 66 });
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2">
        <p className="text-sm text-cyan-200">{SNOOZE_TAUNTS[Math.min(escapes, SNOOZE_TAUNTS.length - 1)]}</p>
        <button onClick={() => setSound((s) => !s)} className="text-xs text-slate-400 underline shrink-0">
          {sound ? "🔇 mute alarm" : "🔊 alarm sound"}
        </button>
      </div>
      <div className="relative h-60 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden select-none">
        <div className={`absolute inset-0 flex items-center justify-center text-7xl opacity-20 ${tired ? "" : "wiggle"}`}>⏰</div>
        <button
          onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
          onPointerDown={(e) => {
            if (e.pointerType !== "mouse" && !tired) {
              e.preventDefault();
              dodge();
            }
          }}
          onClick={() => tired && onSolve()}
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transition: "left .18s, top .18s" }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 px-5 py-3 rounded-full font-black text-sm shadow-xl ${
            tired ? "bg-emerald-400 text-slate-950" : "bg-rose-500 text-white"
          }`}
        >
          {tired ? "😮‍💨 snooze" : "SNOOZE"}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Analog clock setter ---------------- */
export function ClockSetter({ onCheck }: { onCheck: (minutes: number) => void }) {
  const [m, setM] = useState(7 * 60);
  const add = (d: number) => setM((x) => (x + d + 720) % 720);
  const hourDeg = (m / 720) * 360;
  const minDeg = ((m % 60) / 60) * 360;
  const h = Math.floor(m / 60) || 12;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg viewBox="0 0 200 200" className="w-48 h-48 shrink-0">
        <circle cx="100" cy="100" r="94" className="fill-slate-950 stroke-teal-400/60" strokeWidth="4" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = ((i + 1) / 12) * Math.PI * 2;
          return (
            <text key={i} x={100 + Math.sin(a) * 76} y={100 - Math.cos(a) * 76 + 5} textAnchor="middle" className="fill-slate-300 text-[14px] font-bold">
              {i + 1}
            </text>
          );
        })}
        <line x1="100" y1="100" x2="100" y2="52" stroke="#2dd4bf" strokeWidth="7" strokeLinecap="round" transform={`rotate(${hourDeg} 100 100)`} />
        <line x1="100" y1="100" x2="100" y2="28" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" transform={`rotate(${minDeg} 100 100)`} />
        <circle cx="100" cy="100" r="6" className="fill-white" />
      </svg>
      <div className="space-y-3 w-full">
        <div className="grid grid-cols-2 gap-2">
          <button className={ghost} onClick={() => add(-60)}>− hour</button>
          <button className={ghost} onClick={() => add(60)}>+ hour</button>
          <button className={ghost} onClick={() => add(-5)}>− 5 min</button>
          <button className={ghost} onClick={() => add(5)}>+ 5 min</button>
        </div>
        <p className="text-xs text-slate-400 font-mono">
          Digital readout: {String(h).padStart(2, "0")}:{String(m % 60).padStart(2, "0")} (AM, obviously. She&apos;s never seen PM from bed.)
        </p>
        <button className={`${primary} w-full`} onClick={() => onCheck(m)}>
          ⏰ Set the alarm
        </button>
      </div>
    </div>
  );
}

/* ---------------- Seating logic puzzle ---------------- */
const CREW = ["Daham", "Hasitha", "Sewmini", "Chutyymiii", "Piccalito"];
const SEAT_ANSWER = ["Daham", "Sewmini", "Chutyymiii", "Piccalito", "Hasitha"];

export function SeatingPuzzle({ onSolve }: { onSolve: () => void }) {
  const { notify } = useGame();
  const [seats, setSeats] = useState<string[]>(["", "", "", "", ""]);
  const check = () => {
    if (seats.some((s) => !s)) return notify("🪑 Fill every seat first.", "bad");
    if (new Set(seats).size < 5) return notify("🪑 Someone is sitting on someone's lap. Each person gets one seat!", "bad");
    const right = seats.filter((s, i) => s === SEAT_ANSWER[i]).length;
    if (right === 5) return onSolve();
    buzz();
    notify(`🚌 ${right}/5 people are in the right seat. Re-read the witness statements.`, "bad");
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {seats.map((s, i) => (
          <div key={i} className="rounded-xl bg-slate-950 border border-slate-700 p-1.5 sm:p-2 text-center space-y-1">
            <div className="text-[10px] font-mono text-slate-500">{i === 0 ? "🪟 SEAT 1" : `SEAT ${i + 1}`}</div>
            <div className="text-xl">{s === "Chutyymiii" ? "👑" : s === "Piccalito" ? "😳" : s ? "🙂" : "🪑"}</div>
            <select
              value={s}
              onChange={(e) => setSeats(seats.map((x, j) => (j === i ? e.target.value : x)))}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 text-[10px] sm:text-xs text-white py-1"
            >
              <option value="">—</option>
              {CREW.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <button className={`${primary} w-full`} onClick={check}>
        🚌 Lock in the seating chart
      </button>
    </div>
  );
}

/* ---------------- Locker hot/cold hunt ---------------- */
const SIZE = 6;
const TRIES = 7;
const heat = (d: number) => (d === 0 ? "💍" : d === 1 ? "🔥" : d === 2 ? "♨️" : d <= 4 ? "🌤️" : d <= 6 ? "🌬️" : "🧊");

export function LockerHunt({ onSolve }: { onSolve: () => void }) {
  const { notify } = useGame();
  const [ring, setRing] = useState(() => Math.floor(Math.random() * SIZE * SIZE));
  const [opened, setOpened] = useState<Record<number, string>>({});
  const [caught, setCaught] = useState(false);
  const used = Object.keys(opened).length;
  const open = (i: number) => {
    if (opened[i] || caught) return;
    const d = Math.abs((i % SIZE) - (ring % SIZE)) + Math.abs(Math.floor(i / SIZE) - Math.floor(ring / SIZE));
    setOpened({ ...opened, [i]: heat(d) });
    if (d === 0) {
      tone(1200, 200);
      setTimeout(onSolve, 700);
      return;
    }
    tone(300 + (8 - Math.min(d, 8)) * 90, 90);
    if (used + 1 >= TRIES) {
      setCaught(true);
      buzz();
      notify("🚨 SECURITY! You got caught. The ring has been moved to a new locker.", "bad");
      setTimeout(() => {
        setRing(Math.floor(Math.random() * SIZE * SIZE));
        setOpened({});
        setCaught(false);
      }, 1800);
    }
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-slate-400">🔥 burning (1 step) · ♨️ hot (2) · 🌤️ warm (3–4) · 🌬️ cool (5–6) · 🧊 freezing</span>
        <span className={TRIES - used <= 2 ? "text-rose-300" : "text-cyan-300"}>Tries left: {TRIES - used}</span>
      </div>
      <div className={`grid grid-cols-6 gap-1.5 ${caught ? "shake opacity-50" : ""}`}>
        {Array.from({ length: SIZE * SIZE }).map((_, i) => (
          <button
            key={i}
            onClick={() => open(i)}
            className={`aspect-square rounded-lg text-lg border ${opened[i] ? "bg-slate-800 border-slate-600" : "bg-slate-950 border-slate-700 hover:border-teal-400"}`}
          >
            {opened[i] || <span className="text-[10px] text-slate-600 font-mono">{i + 1}</span>}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-500">Steps are counted like a tuk-tuk drives: up/down/left/right only, no diagonals.</p>
    </div>
  );
}

/* ---------------- Mastermind safe ---------------- */
export function Mastermind({ onSolve }: { onSolve: () => void }) {
  const { notify } = useGame();
  const [secret] = useState(() => shuffle("0123456789".split("")).slice(0, 4).join(""));
  const [guess, setGuess] = useState("");
  const [history, setHistory] = useState<{ g: string; exact: number; near: number }[]>([]);
  const submit = () => {
    if (!/^\d{4}$/.test(guess) || new Set(guess).size < 4) return notify("🔢 4 different digits, agent. No repeats.", "bad");
    let exact = 0,
      near = 0;
    guess.split("").forEach((c, i) => {
      if (secret[i] === c) exact++;
      else if (secret.includes(c)) near++;
    });
    setHistory([{ g: guess, exact, near }, ...history]);
    setGuess("");
    if (exact === 4) {
      setTimeout(onSolve, 500);
    } else {
      tone(400, 80);
      if (history.length + 1 === 10) notify("😏 10 tries… Piccalito knows the code. He's not telling.", "info");
    }
  };
  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <input
          value={guess}
          onChange={(e) => setGuess(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          placeholder="4 different digits"
          className="flex-1 min-w-0 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-lg text-white font-mono tracking-[0.5em] text-center"
        />
        <button className={primary}>Try</button>
      </form>
      <p className="text-[11px] text-slate-400">🟢 = right digit, right spot · 🟡 = right digit, wrong spot. The safe never repeats a digit.</p>
      <div className="space-y-1 max-h-52 overflow-y-auto">
        {history.map((h, i) => (
          <div key={i} className="flex justify-between items-center px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-sm">
            <span className="text-slate-500 text-xs">#{history.length - i}</span>
            <span className="tracking-[0.4em] text-white">{h.g}</span>
            <span>
              {"🟢".repeat(h.exact)}
              {"🟡".repeat(h.near)}
              {h.exact + h.near === 0 && "⚫"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Two-player code lock ---------------- */
export function TwoPlayerCode({ lockId, label = "Code from Piccalito" }: { lockId: string; label?: string }) {
  const { solve, notify } = useGame();
  const [v, setV] = useState("");
  const [shake, setShake] = useState(false);
  return (
    <div className="space-y-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (v === gmCode(lockId)) return solve(lockId, "🤝 Piccalito's code accepted!");
          buzz();
          setShake(true);
          setTimeout(() => setShake(false), 500);
          notify("❌ That's not Piccalito's code. Go and ask him nicely 🥺", "bad");
        }}
        className={`flex gap-2 ${shake ? "shake" : ""}`}
      >
        <input
          value={v}
          onChange={(e) => setV(e.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          placeholder={label}
          className="flex-1 min-w-0 rounded-xl bg-slate-950 border border-cyan-400/40 px-3 py-2.5 text-lg text-white font-mono tracking-[0.5em] text-center"
        />
        <button className={primary}>Unlock</button>
      </form>
      <p className="text-[11px] text-cyan-200/70">
        📡 This lock cannot be solved alone. Piccalito holds the code — or he can unlock it remotely from his HQ.
      </p>
    </div>
  );
}

/* ---------------- Tap-to-arrange tiles ---------------- */
export function TileArrange({ lockId, tiles, seed = 7, successMsg }: { lockId: string; tiles: string[]; seed?: number; successMsg?: string }) {
  const { solve, notify } = useGame();
  const order = useMemo(() => {
    let o = shuffle(tiles.map((_, i) => i));
    while (o.every((x, i) => x === i) && tiles.length > 1) o = shuffle(o);
    return o;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);
  const [picked, setPicked] = useState<number[]>([]);
  const word = picked.map((i) => tiles[i]).join("");
  const check = () => {
    if (CHECK[lockId](word)) return solve(lockId, successMsg);
    buzz();
    notify(wrongLine(), "bad");
    setPicked([]);
  };
  return (
    <div className="space-y-3">
      <div className="min-h-[56px] flex flex-wrap gap-2 p-3 rounded-2xl bg-slate-950 border border-dashed border-teal-400/40">
        {picked.length === 0 && <span className="text-xs text-slate-500">Tap the tiles below in the right order…</span>}
        {picked.map((i, k) => (
          <button key={k} onClick={() => setPicked((p) => p.filter((_, j) => j !== k))} className="px-3 py-2 rounded-lg bg-teal-500/30 border border-teal-400 font-mono font-black text-white">
            {tiles[i]}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {order.map((i) => (
          <button
            key={i}
            disabled={picked.includes(i)}
            onClick={() => setPicked((p) => (p.includes(i) ? p : [...p, i]))}
            className="px-3 py-2 rounded-lg bg-cyan-500/15 border border-cyan-400/50 font-mono font-black text-cyan-100 disabled:opacity-20"
          >
            {tiles[i]}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button className={ghost} onClick={() => setPicked([])}>
          Reset
        </button>
        <button className={`${primary} flex-1`} disabled={picked.length < tiles.length} onClick={check}>
          Check
        </button>
      </div>
    </div>
  );
}

/* ---------------- Shyness meter timing game ---------------- */
export function ShyMeter({ onSolve }: { onSolve: () => void }) {
  const [streak, setStreak] = useState(0);
  const [zone, setZone] = useState({ start: 35, width: 30 });
  const [pos, setPos] = useState(0);
  const posRef = useRef(0);
  const [msg, setMsg] = useState("Tap 💋 when the needle is inside the glowing blush zone. 5 hand kisses to go!");
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const speed = 0.0009 + streak * 0.0001;
    const loop = (t: number) => {
      const p = ((Math.sin((t - t0) * speed) + 1) / 2) * 100;
      posRef.current = p;
      setPos(p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [streak]);
  const kiss = () => {
    const p = posRef.current;
    // a little forgiveness on both edges
    if (p >= zone.start - 3 && p <= zone.start + zone.width + 3) {
      const next = streak + 1;
      tone(600 + next * 120, 120);
      if (next >= 5) {
        setMsg("🙈🙈🙈 SHYNESS 100%. She's hiding her face. Mission accomplished.");
        setStreak(5);
        setTimeout(onSolve, 900);
        return;
      }
      setStreak(next);
      const w = 30 - next * 2;
      setZone({ start: 5 + Math.random() * (90 - w), width: w });
      setMsg(["", "😊 Hand kissed. She smiled.", "☺️ She looked away…", "😳 Cheeks turning pink…", "🫣 She can't look at you anymore!"][next]);
    } else {
      buzz();
      setMsg("🤭 Missed — she giggled. Try again, your progress is safe.");
    }
  };
  return (
    <div className="space-y-3">
      <p className="text-sm text-teal-200 min-h-[20px]">{msg}</p>
      <div className="relative h-10 rounded-full bg-slate-950 border border-slate-700 overflow-hidden">
        <div className="absolute inset-y-0 bg-teal-500/50 border-x-2 border-teal-300" style={{ left: `${zone.start}%`, width: `${zone.width}%` }} />
        <div className="absolute inset-y-0 w-1 bg-cyan-300 shadow-[0_0_12px_#67e8f9]" style={{ left: `${pos}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Shyness: {streak * 20}%</span>
        <span>{"🩷".repeat(streak)}{"🤍".repeat(5 - streak)}</span>
      </div>
      <button onClick={kiss} className={`${primary} w-full text-lg py-4`}>
        💋🤚 Kiss her hand
      </button>
    </div>
  );
}

/* ---------------- Morse lantern ---------------- */
const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--",
  N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--.."
};

export function MorseLantern({ message }: { message: string }) {
  const [on, setOn] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [sound, setSound] = useState(true);
  const [unit, setUnit] = useState(260);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const play = () => {
    if (playing) return;
    setPlaying(true);
    let t = 600;
    for (const letter of message) {
      for (const sym of MORSE[letter]) {
        const len = sym === "." ? unit : unit * 3;
        const start = t;
        timers.current.push(setTimeout(() => setOn(true), start));
        timers.current.push(setTimeout(() => setOn(false), start + len));
        if (sound) tone(620, len, start, "sine", 0.12);
        t += len + unit;
      }
      t += unit * 2;
    }
    timers.current.push(setTimeout(() => setPlaying(false), t + 300));
  };
  return (
    <div className="space-y-4">
      <div className="relative h-44 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-950 to-slate-950 border border-slate-800 flex items-center justify-center">
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-sky-900/60 to-transparent" />
        <div
          className="w-16 h-16 rounded-full transition-all duration-75"
          style={{ background: on ? "#99f6e4" : "#1e293b", boxShadow: on ? "0 0 60px 30px rgba(45,212,191,.65)" : "none" }}
        />
        <span className="absolute bottom-2 text-[10px] font-mono text-slate-500">a lantern across the pond…</span>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button className={primary} onClick={play} disabled={playing}>
          {playing ? "📡 transmitting…" : "▶ Watch the lantern"}
        </button>
        <button className={ghost} onClick={() => setSound(!sound)}>{sound ? "🔊 beeps on" : "🔇 beeps off"}</button>
        <label className="text-xs text-slate-400 flex items-center gap-2">
          speed
          <input type="range" min={150} max={450} step={30} value={600 - unit} onChange={(e) => setUnit(600 - +e.target.value)} className="accent-teal-500" />
        </label>
      </div>
    </div>
  );
}
