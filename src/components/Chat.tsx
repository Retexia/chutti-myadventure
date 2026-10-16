"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChatMsg, Who, useChat } from "@/lib/chat";
import { tone } from "@/lib/audio";

const STICKERS = ["appuchchooooo 🙈", "bhhhhh 😤", "suttee 😳", "no matter what 🍁", "💋💋💋💋💋", "wake up sleepy 😴", "I miss you 🩵", "where's my ring 💍"];
const GLYPHS = "▓▒░█<>/\\|#%&@$*+=?01";
const isOnlyEmoji = (s: string) => /^(\p{Extended_Pictographic}|\p{Emoji_Component}|\s|‍|️)+$/u.test(s) && [...s.replace(/\s/g, "")].length <= 6;

/** Incoming messages "decrypt" from random glyphs into the real text. */
function Decrypt({ text, run }: { text: string; run: boolean }) {
  const [out, setOut] = useState(run ? "" : text);
  useEffect(() => {
    if (!run) return setOut(text);
    let i = 0;
    const chars = [...text];
    const t = setInterval(() => {
      i += Math.max(1, Math.ceil(chars.length / 18));
      setOut(chars.map((c, k) => (k < i || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join(""));
      if (i >= chars.length) clearInterval(t);
    }, 40);
    return () => clearInterval(t);
  }, [text, run]);
  return <>{out}</>;
}

function Bubble({ m, mine, fresh, showAuto }: { m: ChatMsg; mine: boolean; fresh: boolean; showAuto: boolean }) {
  const [revealed, setRevealed] = useState(!m.secret);
  const big = isOnlyEmoji(m.body);
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"} bubble-in`}>
      <div className="max-w-[80%] space-y-0.5">
        <button
          onClick={() => setRevealed(true)}
          className={`text-left rounded-2xl px-3.5 py-2 text-sm leading-snug break-words ${
            big ? "bg-transparent text-4xl px-1" : mine ? "bg-gradient-to-br from-teal-400 to-cyan-500 text-slate-950 rounded-br-md" : "bg-slate-800/90 border border-teal-500/20 text-slate-100 rounded-bl-md"
          } ${m.secret && !revealed ? "border-2 border-dashed border-cyan-300/60 italic" : ""} ${big && fresh ? "stamp" : ""}`}
        >
          {m.secret && !revealed ? "🔒 secret transmission — tap to decrypt" : <Decrypt text={m.body} run={(fresh || m.secret) && !mine && !big} />}
        </button>
        <div className={`text-[9px] font-mono text-slate-500 flex gap-1.5 ${mine ? "justify-end" : ""}`}>
          {m.secret && <span>🔒</span>}
          {showAuto && m.auto && <span>🤖 auto</span>}
          {m.chapter ? <span>📍 ch {m.chapter}</span> : null}
          <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
      </div>
    </div>
  );
}

function ChatBody({ me, chapter, height, onIncoming }: { me: Who; chapter?: number | null; height: string; onIncoming?: (m: ChatMsg) => void }) {
  const { messages, send, typing, otherTyping, otherOnline, freshIds, other, enabled } = useChat(me);
  const [text, setText] = useState("");
  const [secret, setSecret] = useState(false);
  const [hearts, setHearts] = useState<number[]>([]);
  const end = useRef<HTMLDivElement>(null);
  const seen = useRef(0);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
    const last = messages[messages.length - 1];
    if (last && last.id > seen.current) {
      const incoming = seen.current ? messages.filter((m) => m.id > seen.current && m.sender !== me) : [];
      if (incoming.length) {
        tone(880, 90);
        tone(1320, 120, 90);
        incoming.forEach((m) => onIncoming?.(m));
      }
      seen.current = last.id;
    }
  }, [messages, otherTyping, me, onIncoming]);

  const fire = (body: string) => {
    if (!body.trim()) return;
    send(body, { secret, chapter });
    setText("");
    setSecret(false);
    const id = Date.now();
    setHearts((h) => [...h, id]);
    setTimeout(() => setHearts((h) => h.filter((x) => x !== id)), 1100);
  };

  if (!enabled)
    return (
      <div className="p-5 text-sm text-slate-300 space-y-2">
        <p>🔌 The encrypted line needs Supabase to connect you two.</p>
        <p className="text-xs text-slate-500">Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then run supabase/schema.sql.</p>
      </div>
    );

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2 border-b border-teal-500/20 flex items-center justify-between text-[11px] font-mono">
        <span className="text-teal-300">🔐 encrypted line · {me} ⇄ {other}</span>
        <span className={otherOnline ? "text-emerald-300" : "text-slate-500"}>
          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${otherOnline ? "bg-emerald-400 pulse-ring" : "bg-slate-600"}`} />
          {other} {otherOnline ? "online" : "away"}
        </span>
      </div>
      <div className={`overflow-y-auto px-3 py-3 space-y-2.5 ${height}`}>
        {messages.length === 0 && <p className="text-center text-xs text-slate-500 pt-8">No transmissions yet. Say something sweet 🩵</p>}
        {messages.map((m) => (
          <Bubble key={m.id} m={m} mine={m.sender === me} fresh={freshIds.has(m.id)} showAuto={me === "Piccalito"} />
        ))}
        {otherTyping && (
          <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-800/80 w-fit bubble-in">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="flex gap-1.5 overflow-x-auto px-3 pb-2 no-scrollbar">
        {STICKERS.map((s) => (
          <button key={s} onClick={() => fire(s)} className="shrink-0 px-2.5 py-1 rounded-full text-[11px] bg-teal-500/10 border border-teal-400/30 text-teal-100 hover:bg-teal-500/25">
            {s}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          fire(text);
        }}
        className="relative flex items-center gap-2 p-3 pt-1"
      >
        <button
          type="button"
          onClick={() => setSecret(!secret)}
          title="Secret message (blurred until tapped)"
          className={`shrink-0 w-10 h-10 rounded-xl border text-lg ${secret ? "bg-cyan-400/25 border-cyan-300" : "bg-slate-900 border-slate-700"}`}
        >
          {secret ? "🔒" : "🔓"}
        </button>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            typing();
          }}
          placeholder={secret ? "Secret transmission…" : `Message ${other}…`}
          className="flex-1 min-w-0 rounded-xl bg-slate-950 border border-slate-700 focus:border-teal-400 outline-none px-3 py-2.5 text-sm text-white"
        />
        <button className="relative shrink-0 w-11 h-10 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 btn-shine text-slate-950 font-black">
          ➤
          {hearts.map((h) => (
            <span key={h} className="absolute inset-0 pointer-events-none">
              {[-30, -12, 0, 14, 32].map((dx, i) => (
                <span key={i} className="heart-fly left-3 top-1 text-base" style={{ ["--dx" as any]: `${dx}px`, animationDelay: `${i * 60}ms` }}>
                  🩵
                </span>
              ))}
            </span>
          ))}
        </button>
      </form>
    </div>
  );
}

/** Floating chat bubble for her, available on every chapter. */
export function ChatDock({ me, chapter }: { me: Who; chapter?: number | null }) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const onIncoming = React.useCallback((m: ChatMsg) => {
    if (openRef.current) return;
    setUnread((u) => u + 1);
    setPreview(m.secret ? "🔒 secret transmission" : m.body);
    setTimeout(() => setPreview(null), 5000);
  }, []);
  return (
    <>
      <div className={`fixed z-50 right-3 bottom-3 sm:right-5 sm:bottom-5 w-[calc(100vw-1.5rem)] sm:w-96 rounded-3xl overflow-hidden border border-teal-400/40 bg-slate-950/90 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(45,212,191,0.5)] transition-all duration-300 origin-bottom-right ${open ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}`}>
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="text-sm font-bold text-white">💬 Piccalito Hotline</span>
          <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded-lg bg-slate-800">✕</button>
        </div>
        <ChatBody me={me} chapter={chapter} height="h-[50vh] sm:h-80" onIncoming={onIncoming} />
      </div>
      {!open && (
        <div className="fixed z-50 right-4 bottom-4 sm:right-6 sm:bottom-6 flex flex-col items-end gap-2">
          {preview && (
            <button onClick={() => { setOpen(true); setUnread(0); }} className="max-w-[260px] text-left px-3 py-2 rounded-2xl rounded-br-md bg-slate-900/95 border border-teal-400/40 text-sm text-teal-50 bubble-in">
              {preview}
            </button>
          )}
          <button
            onClick={() => {
              setOpen(true);
              setUnread(0);
            }}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-2xl shadow-[0_10px_30px_-5px_rgba(45,212,191,0.7)] pulse-ring"
            aria-label="Open chat"
          >
            💬
            {unread > 0 && <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center bounce-badge">{unread}</span>}
          </button>
        </div>
      )}
    </>
  );
}

/** Inline chat for Piccalito's HQ. */
export function ChatPanel({ me }: { me: Who }) {
  return (
    <div className="rounded-3xl overflow-hidden border border-teal-400/30 bg-slate-950/70 backdrop-blur-md">
      <ChatBody me={me} height="h-96" />
    </div>
  );
}
