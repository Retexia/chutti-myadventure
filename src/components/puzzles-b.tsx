"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { seededRandom, shuffle } from "@/lib/game";
import { buzz, tone } from "@/lib/audio";
import { drivePhoto } from "@/data/memories";
import { TwoPlayerCode } from "@/components/puzzles-a";

const btn = "px-4 py-2.5 rounded-xl font-bold text-sm transition active:scale-95";
const primary = `${btn} bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950`;
const ghost = `${btn} bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700`;

/* ---------------- Library shelf ---------------- */
const BOOKS = [
  { call: "910.4 CAN", title: "On the Road to Canada", color: "bg-red-800" },
  { call: "306.7 FIR", title: "Mysteries of the First Date", color: "bg-sky-800" },
  { call: "641.5 NEA", title: "Neapolitan Pizza at Midnight", color: "bg-cyan-700" },
  { call: "001.9 SLE", title: "Dreams of Sleeping Till Noon", color: "bg-emerald-800" },
  { call: "398.2 LOS", title: "Into the Lost Streets of Colombo", color: "bg-sky-800" },
  { call: "133.5 LOV", title: "Omens & Horoscopes for Lovers", color: "bg-fuchsia-800" }
];

export function LibraryShelf() {
  const [pulled, setPulled] = useState<number[]>([]);
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-1.5 p-3 pb-0 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-cyan-900/40 border-b-8 border-cyan-900 overflow-x-auto">
        {BOOKS.map((b, i) => {
          const out = pulled.includes(i);
          return (
            <button
              key={i}
              onClick={() => setPulled((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))}
              className={`${b.color} shrink-0 w-14 sm:w-16 rounded-t-md border border-black/30 text-white transition-all flex flex-col items-center justify-between py-2 ${out ? "h-56 -translate-y-2 shadow-2xl" : "h-48"}`}
            >
              <span className="text-[10px] font-serif leading-tight [writing-mode:vertical-rl] rotate-180 px-1">{b.title}</span>
              {out && <span className="text-[9px] font-mono bg-white text-slate-900 px-1 rounded">{b.call}</span>}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-slate-500">Tap a book to pull it off the shelf and read its spine label.</p>
    </div>
  );
}

/* ---------------- Foggy tuk-tuk maze ---------------- */
const N = 9; // cells per side → (2N+1)^2 grid
const QUOTES = ["appuchchooooo! 🙈", "bhhhhh! 😤", "suttee! 😳", "appuchchooooo!! 🫣", "bhhhhh… suttee 🥰"];

function buildMaze(seed: number) {
  const rand = seededRandom(seed);
  const S = 2 * N + 1;
  const g: number[][] = Array.from({ length: S }, () => Array(S).fill(1));
  const stack: [number, number][] = [[0, 0]];
  const seen = new Set(["0,0"]);
  g[1][1] = 0;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const nbrs = (
      [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
      ] as [number, number][]
    )
      .map(([dx, dy]) => [x + dx, y + dy] as [number, number])
      .filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N && !seen.has(`${a},${b}`));
    if (!nbrs.length) {
      stack.pop();
      continue;
    }
    const [nx, ny] = nbrs[Math.floor(rand() * nbrs.length)];
    seen.add(`${nx},${ny}`);
    g[2 * ny + 1][2 * nx + 1] = 0;
    g[y + ny + 1][x + nx + 1] = 0;
    stack.push([nx, ny]);
  }
  // a few extra openings so there are loops to get lost in
  for (let k = 0; k < N; k++) {
    const r = 1 + Math.floor(rand() * (S - 2));
    const c = 1 + Math.floor(rand() * (S - 2));
    if ((r + c) % 2 === 1) g[r][c] = 0;
  }
  // BFS distances from start
  const dist: Record<string, number> = { "1,1": 0 };
  const q: [number, number][] = [[1, 1]];
  while (q.length) {
    const [r, c] = q.shift()!;
    for (const [dr, dc] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1]
    ]) {
      const nr = r + dr,
        nc = c + dc;
      if (g[nr]?.[nc] === 0 && dist[`${nr},${nc}`] === undefined) {
        dist[`${nr},${nc}`] = dist[`${r},${c}`] + 1;
        q.push([nr, nc]);
      }
    }
  }
  const cells = Object.entries(dist)
    .map(([k, d]) => ({ r: +k.split(",")[0], c: +k.split(",")[1], d }))
    .filter(({ r, c }) => r % 2 === 1 && c % 2 === 1);
  const home = cells.reduce((a, b) => (b.d > a.d ? b : a));
  const deadEnds = cells.filter(
    ({ r, c }) => !(r === 1 && c === 1) && !(r === home.r && c === home.c) && [g[r + 1][c], g[r - 1][c], g[r][c + 1], g[r][c - 1]].filter((v) => v === 0).length === 1
  );
  const pool = shuffle(deadEnds.length >= 5 ? deadEnds : cells.filter((x) => x.d > 4), rand).sort((a, b) => b.d - a.d);
  const kisses: string[] = [];
  for (const p of pool) {
    if (kisses.length >= 5) break;
    if (kisses.every((k) => Math.abs(+k.split(",")[0] - p.r) + Math.abs(+k.split(",")[1] - p.c) > 4)) kisses.push(`${p.r},${p.c}`);
  }
  for (const p of pool) if (kisses.length < 5 && !kisses.includes(`${p.r},${p.c}`)) kisses.push(`${p.r},${p.c}`);
  return { g, home: `${home.r},${home.c}`, kisses };
}

export function TukTukMaze({ onSolve }: { onSolve: () => void }) {
  const { notify } = useGame();
  const maze = useMemo(() => buildMaze(1130), []);
  const S = 2 * N + 1;
  const [pos, setPos] = useState<[number, number]>([1, 1]);
  const [got, setGot] = useState<string[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set(["1,1"]));
  const [bubble, setBubble] = useState("🍕 Full of Domino's. No idea where the bodima is. Find 5 kisses on the way home!");
  const touch = useRef<{ x: number; y: number } | null>(null);
  const posRef = useRef<[number, number]>([1, 1]);
  const gotRef = useRef<string[]>([]);
  const doneRef = useRef(false);

  const move = useCallback(
    (dr: number, dc: number) => {
      if (doneRef.current) return;
      const [r, c] = posRef.current;
      const nr = r + dr,
        nc = c + dc;
      if (maze.g[nr]?.[nc] !== 0) {
        tone(120, 40, 0, "square", 0.04);
        return;
      }
      const key = `${nr},${nc}`;
      posRef.current = [nr, nc];
      setPos([nr, nc]);
      setSeen((s) => new Set(s).add(key));
      if (maze.kisses.includes(key) && !gotRef.current.includes(key)) {
        gotRef.current = [...gotRef.current, key];
        setGot(gotRef.current);
        tone(900, 120);
        setBubble(`💋 Kiss #${gotRef.current.length}/5 — Chutyymiii: "${QUOTES[gotRef.current.length - 1]}"`);
      }
      if (key === maze.home) {
        const left = 5 - gotRef.current.length;
        if (left <= 0) {
          doneRef.current = true;
          setBubble("🏠 Made it to the bodima! Lost, full of pizza, and kissed 5 times. Perfect night.");
          setTimeout(onSolve, 1000);
        } else {
          setBubble(`🚪 The bodima door won't open… you still owe ${left} kiss${left === 1 ? "" : "es"}. Go back out!`);
        }
      }
    },
    [maze, onSolve]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return;
      const map: Record<string, [number, number]> = {
        ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1], w: [-1, 0], s: [1, 0], a: [0, -1], d: [0, 1]
      };
      const m = map[e.key];
      if (m) {
        e.preventDefault();
        move(m[0], m[1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move]);

  const [pr, pc] = pos;
  return (
    <div className="space-y-3">
      <p className="text-sm text-teal-200 min-h-[40px]">{bubble}</p>
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>💋 {got.length}/5</span>
        <span>arrow keys / WASD / swipe / buttons</span>
      </div>
      <div
        className="grid mx-auto rounded-xl overflow-hidden border border-slate-700 touch-none select-none w-full max-w-[420px]"
        style={{ gridTemplateColumns: `repeat(${S}, 1fr)` }}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) Math.abs(dx) > Math.abs(dy) ? move(0, dx > 0 ? 1 : -1) : move(dy > 0 ? 1 : -1, 0);
          touch.current = null;
        }}
      >
        {maze.g.map((row, r) =>
          row.map((v, c) => {
            const key = `${r},${c}`;
            const near = Math.max(Math.abs(r - pr), Math.abs(c - pc)) <= 2;
            const remembered = seen.has(key);
            const visible = near || remembered;
            const isMe = r === pr && c === pc;
            let content = "";
            if (isMe) content = "🛺";
            else if (visible && maze.kisses.includes(key) && !got.includes(key)) content = "💋";
            else if (visible && key === maze.home) content = "🏠";
            else if (r === 1 && c === 1) content = "🍕";
            return (
              <div
                key={key}
                className={`aspect-square flex items-center justify-center text-[9px] sm:text-xs leading-none ${
                  !near && !remembered ? "bg-black" : v === 1 ? (near ? "bg-slate-600" : "bg-slate-800") : near ? "bg-slate-900" : "bg-slate-950"
                }`}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <span />
        <button className={ghost} onClick={() => move(-1, 0)}>▲</button>
        <span />
        <button className={ghost} onClick={() => move(0, -1)}>◀</button>
        <button className={ghost} onClick={() => move(1, 0)}>▼</button>
        <button className={ghost} onClick={() => move(0, 1)}>▶</button>
      </div>
    </div>
  );
}

/* ---------------- Microphone shout meter ---------------- */
export function ShoutMeter({ lockId }: { lockId: string }) {
  const { solve } = useGame();
  const [level, setLevel] = useState(0);
  const [held, setHeld] = useState(0);
  const [status, setStatus] = useState<"idle" | "listening" | "failed">("idle");
  const [fallback, setFallback] = useState(false);
  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => cleanup.current(), []);
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      src.connect(an);
      const buf = new Float32Array(an.fftSize);
      let raf = 0;
      let total = 0;
      let last = performance.now();
      setStatus("listening");
      const loop = (t: number) => {
        an.getFloatTimeDomainData(buf);
        const rms = Math.sqrt(buf.reduce((a, v) => a + v * v, 0) / buf.length);
        const lv = Math.min(1, rms * 6);
        setLevel(lv);
        if (lv > 0.55) total += t - last;
        last = t;
        setHeld(total);
        if (total >= 2000) {
          cleanup.current();
          solve(lockId, "📣 APPUCHCHOOOOO received loud and clear! 😂");
          return;
        }
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      cleanup.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((tr) => tr.stop());
        ctx.close();
      };
    } catch {
      setStatus("failed");
      setFallback(true);
    }
  };
  return (
    <div className="space-y-3">
      {status !== "listening" ? (
        <button className={`${primary} w-full`} onClick={start}>
          🎙️ Turn on the microphone
        </button>
      ) : (
        <div className="space-y-2">
          <div className="h-8 rounded-full bg-slate-950 border border-slate-700 overflow-hidden">
            <div className={`h-full transition-all ${level > 0.55 ? "bg-teal-500" : "bg-slate-500"}`} style={{ width: `${level * 100}%` }} />
          </div>
          <div className="h-2 rounded-full bg-slate-950 overflow-hidden">
            <div className="h-full bg-cyan-400" style={{ width: `${Math.min(100, held / 20)}%` }} />
          </div>
          <p className="text-xs text-slate-400">Pink = loud enough. Keep it loud until the gold bar is full (2 seconds of pure appuchchooooo).</p>
        </div>
      )}
      {status === "failed" && <p className="text-xs text-rose-300">The microphone is blocked or unavailable on this device.</p>}
      <button onClick={() => setFallback(!fallback)} className="text-xs text-slate-400 underline">
        {fallback ? "hide the two-player route" : "Mic not working? Use the two-player route"}
      </button>
      {fallback && (
        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-400/30 space-y-2">
          <p className="text-xs text-cyan-100">Send Piccalito a WhatsApp voice note of you shouting &quot;appuchchooooo&quot;. Proper volume. He will reply with a code.</p>
          <TwoPlayerCode lockId={lockId} />
        </div>
      )}
    </div>
  );
}

/* ---------------- Retexia terminal ---------------- */
const FILES: Record<string, string> = {
  "README.md": "RETEXIA SYSTEMS v1.0\nThe clients are waiting. The system is built. It just needs to be DEPLOYED.\nusage: deploy <DEPLOY_KEY>\n(the key is somewhere on this machine… not everything is visible at first glance)",
  "clients.txt":
    "client #1 ........ ⏳ 'let me think about it'\nclient #2 ........ 😩 'maybe next month'\nclient #3 ........ 👻 ghosted us\nclient #4 ........ 🧾 wants a discount on the discount\nclient #∞ ........ ❤️ Chutyymiii (my favourite client, pays in kisses)",
  "todo.txt":
    "[x] fall for Chutyymiii\n[x] build retexia.com together\n[ ] win clients (we WILL)\n[ ] become the best businessman before meeting her dad\n[ ] stable money\n[ ] Canada 🍁 — no matter what",
  "motivation.txt":
    "Hard days are part of the build log, not the end of it.\nEvery 'no' is one step closer to the 'yes' that changes everything.\nYou are not alone in this company. You never will be.\n— your co-founder, P.",
  ".env": "# shh. secrets.\nDEPLOY_KEY=<our company name, written backwards>\n# because when times are hard, sometimes you go backwards before you go forward."
};

export function Terminal({ onSolve }: { onSolve: () => void }) {
  const [lines, setLines] = useState<string[]>(["retexia-hq login: chutyymiii", "Welcome back, co-founder. Type `help` to begin."]);
  const [cmd, setCmd] = useState("");
  const [deployed, setDeployed] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [lines]);
  const run = (raw: string) => {
    const input = raw.trim();
    const out: string[] = [`$ ${input}`];
    const [c, ...args] = input.split(/\s+/);
    const arg = args.join(" ");
    switch (c) {
      case "":
        break;
      case "help":
        out.push("commands: help, ls, cat <file>, whoami, pwd, date, clear, deploy <key>, sudo …");
        break;
      case "ls":
        out.push(Object.keys(FILES).filter((f) => arg.includes("-a") || !f.startsWith(".")).join("   ") + (arg.includes("-a") ? "   .   .." : ""));
        break;
      case "cat":
        out.push(FILES[arg] ?? `cat: ${arg || "?"}: No such file (try ls)`);
        break;
      case "whoami":
        out.push("chutyymiii — co-founder of Retexia, CEO of Piccalito's heart, professional sleeper");
        break;
      case "pwd":
        out.push("/home/chutyymiii/retexia");
        break;
      case "date":
        out.push(new Date().toString() + "  (still earlier than your wake-up time, probably)");
        break;
      case "sudo":
        out.push("Permission denied: only Piccalito has sudo access… and only to your heart 💘");
        break;
      case "rm":
        out.push("rm: nope. We don't delete anything we built together.");
        break;
      case "clear":
        setLines([]);
        return;
      case "deploy":
        if (arg.toLowerCase() === "aixeter") {
          out.push("🔑 key accepted", "building………… ✅", "uploading……… ✅", "🚀 SYSTEM LIVE. Client #1 just signed. Then #2. Then #3.", "We did it. Like always — together.");
          setDeployed(true);
          setTimeout(onSolve, 2200);
        } else out.push(arg ? "❌ deploy failed: invalid DEPLOY_KEY" : "usage: deploy <DEPLOY_KEY>");
        break;
      default:
        out.push(`${c}: command not found (type help)`);
    }
    setLines((l) => [...l, ...out]);
  };
  return (
    <div className="rounded-2xl bg-black border border-emerald-500/30 font-mono text-[12px] sm:text-[13px] text-emerald-300 p-3 space-y-1">
      <div className="h-64 overflow-y-auto whitespace-pre-wrap break-words space-y-0.5">
        {lines.map((l, i) => (
          <div key={i} className={l.startsWith("$") ? "text-emerald-100" : ""}>
            {l}
          </div>
        ))}
        <div ref={end} />
      </div>
      {!deployed && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(cmd);
            setCmd("");
          }}
          className="flex items-center gap-2 border-t border-emerald-500/20 pt-2"
        >
          <span>$</span>
          <input value={cmd} onChange={(e) => setCmd(e.target.value)} autoCapitalize="none" autoComplete="off" spellCheck={false} className="flex-1 bg-transparent outline-none text-emerald-100" placeholder="type a command…" />
        </form>
      )}
    </div>
  );
}

/* ---------------- Signature pad ---------------- */
export function SignaturePad({ onSave }: { onSave: (dataUrl: string) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [strokes, setStrokes] = useState(0);
  const pt = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * 500, ((e.clientY - r.top) / r.height) * 160];
  };
  const ctx = () => {
    const g = ref.current!.getContext("2d")!;
    g.strokeStyle = "#5eead4";
    g.lineWidth = 3;
    g.lineCap = "round";
    return g;
  };
  return (
    <div className="space-y-2">
      <canvas
        ref={ref}
        width={500}
        height={160}
        className="w-full rounded-2xl bg-slate-950 border border-dashed border-teal-400/50 touch-none"
        onPointerDown={(e) => {
          drawing.current = true;
          const [x, y] = pt(e);
          const g = ctx();
          g.beginPath();
          g.moveTo(x, y);
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const [x, y] = pt(e);
          const g = ctx();
          g.lineTo(x, y);
          g.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          setStrokes((s) => s + 1);
        }}
      />
      <div className="flex gap-2">
        <button
          className={ghost}
          onClick={() => {
            ref.current!.getContext("2d")!.clearRect(0, 0, 500, 160);
            setStrokes(0);
          }}
        >
          Clear
        </button>
        <button className={`${primary} flex-1`} disabled={strokes < 2} onClick={() => onSave(ref.current!.toDataURL("image/png"))}>
          ✍️ Sign the co-founder pact
        </button>
      </div>
    </div>
  );
}

/* ---------------- Photo memory match ---------------- */
export function MemoryMatch({ photos, onSolve }: { photos: number[]; onSolve: () => void }) {
  const [cards] = useState(() => shuffle([...photos, ...photos].map((p, i) => ({ p, k: i }))));
  const [up, setUp] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const flip = (i: number) => {
    if (up.length === 2 || up.includes(i) || matched.includes(cards[i].p)) return;
    const next = [...up, i];
    setUp(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      if (cards[next[0]].p === cards[next[1]].p) {
        tone(880, 120);
        const m = [...matched, cards[i].p];
        setMatched(m);
        setUp([]);
        if (m.length === photos.length) setTimeout(onSolve, 700);
      } else setTimeout(() => setUp([]), 900);
    }
  };
  return (
    <div className="space-y-2">
      <div className="text-xs font-mono text-slate-400 flex justify-between">
        <span>pairs: {matched.length}/{photos.length}</span>
        <span>moves: {moves}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c, i) => {
          const show = up.includes(i) || matched.includes(c.p);
          return (
            <button key={c.k} onClick={() => flip(i)} className={`aspect-square rounded-xl overflow-hidden border ${matched.includes(c.p) ? "border-emerald-400" : "border-slate-700"} bg-slate-950`}>
              {show ? (
                <img src={drivePhoto(c.p, 300)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl">❔</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Photo timeline ---------------- */
export function Timeline({ photos, onSolve }: { photos: number[]; onSolve: () => void }) {
  const { notify } = useGame();
  const [shown] = useState(() => shuffle(photos.map((p, i) => ({ p, rank: i }))));
  const [order, setOrder] = useState<number[]>([]);
  const tap = (i: number) => setOrder((o) => (o.includes(i) ? o.filter((x) => x !== i) : [...o, i]));
  const check = () => {
    const right = order.filter((idx, pos) => shown[idx].rank === pos).length;
    if (right === photos.length) return onSolve();
    buzz();
    notify(`⏳ Timeline corrupted: only ${right}/${photos.length} memories are in the right place.`, "bad");
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {shown.map((s, i) => {
          const n = order.indexOf(i);
          return (
            <button key={i} onClick={() => tap(i)} className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 ${n >= 0 ? "border-teal-400" : "border-slate-700"}`}>
              <img src={drivePhoto(s.p, 300)} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              {n >= 0 && <span className="absolute top-1 left-1 w-7 h-7 rounded-full bg-teal-500 text-slate-950 font-black text-sm flex items-center justify-center">{n + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <button className={ghost} onClick={() => setOrder([])}>Reset</button>
        <button className={`${primary} flex-1`} disabled={order.length < photos.length} onClick={check}>
          ⏳ Restore the timeline
        </button>
      </div>
    </div>
  );
}

/* ---------------- Sliding photo puzzle ---------------- */
export function SlidingPuzzle({ photo, onSolve }: { photo: number; onSolve: () => void }) {
  const [tiles, setTiles] = useState<number[]>(() => {
    const t = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    let blank = 8;
    let prev = -1;
    for (let k = 0; k < 150; k++) {
      const r = Math.floor(blank / 3),
        c = blank % 3;
      const opts = [blank - 3, blank + 3, c > 0 ? blank - 1 : -1, c < 2 ? blank + 1 : -1].filter((x) => x >= 0 && x < 9 && x !== prev && (x !== blank - 3 || r > 0));
      const pick = opts[Math.floor(Math.random() * opts.length)];
      [t[blank], t[pick]] = [t[pick], t[blank]];
      prev = blank;
      blank = pick;
    }
    return t;
  });
  const [moves, setMoves] = useState(0);
  const [nums, setNums] = useState(false);
  const [won, setWon] = useState(false);
  const src = drivePhoto(photo, 600);
  const tap = (i: number) => {
    if (won) return;
    const b = tiles.indexOf(8);
    const adj = (Math.abs(i - b) === 3) || (Math.abs(i - b) === 1 && Math.floor(i / 3) === Math.floor(b / 3));
    if (!adj) return;
    const t = [...tiles];
    [t[i], t[b]] = [t[b], t[i]];
    setTiles(t);
    setMoves((m) => m + 1);
    tone(500, 30, 0, "triangle", 0.05);
    if (t.every((v, k) => v === k)) {
      setWon(true);
      setTimeout(onSolve, 1200);
    }
  };
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-mono text-slate-400">
        <span>moves: {moves}</span>
        <button className="underline" onClick={() => setNums(!nums)}>{nums ? "hide numbers" : "show tile numbers"}</button>
      </div>
      <div className="grid grid-cols-3 gap-1 w-full max-w-[360px] mx-auto aspect-square bg-slate-950 p-1 rounded-2xl border border-slate-700">
        {tiles.map((v, i) => (
          <button key={i} onClick={() => tap(i)} className={`relative overflow-hidden rounded-md ${v === 8 && !won ? "bg-slate-950" : "bg-slate-800"}`}>
            {(v !== 8 || won) && (
              <>
                <img
                  src={src}
                  alt=""
                  referrerPolicy="no-referrer"
                  draggable={false}
                  className="absolute max-w-none object-cover pointer-events-none"
                  style={{ width: "300%", height: "300%", left: `${-(v % 3) * 100}%`, top: `${-Math.floor(v / 3) * 100}%` }}
                />
                {nums && !won && <span className="absolute top-1 left-1 text-[10px] font-black bg-black/60 text-white rounded px-1">{v + 1}</span>}
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
