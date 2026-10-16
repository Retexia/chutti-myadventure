"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type Who = "Chutyymiii" | "Piccalito";

export interface ChatMsg {
  id: number;
  sender: Who;
  body: string;
  secret: boolean;
  auto: boolean;
  chapter: number | null;
  created_at: string;
}

/** Pre-written messages "from Piccalito" that arrive when she clears each chapter. */
export const AUTO_MESSAGES: Record<number, string> = {
  1: "You're AWAKE?! It's a miracle 😳☀️ Proud of you, sleepy agent.",
  2: "That ride to Dehiwala… I was SO nervous sitting next to you 🙈",
  3: "Okay okay, I still have your ring. It's safe with me. Always 💍",
  4: "You're blushing right now, aren't you? 🙈🩵",
  5: "appuchchooooo 😂 I can hear it from here",
  6: "Co-founder, we're going to make it. Together, no matter what 💼🩵",
  7: "Every one of those photos is my favourite thing. You are. 📸",
  8: "I love you so much. Canada is waiting for us 🍁 No matter what."
};

export async function sendAuto(chapter: number) {
  if (!supabase || !AUTO_MESSAGES[chapter]) return;
  await supabase.from("chat_messages").insert({ sender: "Piccalito", body: AUTO_MESSAGES[chapter], secret: false, auto: true, chapter });
}

export function useChat(me: Who) {
  const other: Who = me === "Chutyymiii" ? "Piccalito" : "Chutyymiii";
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);
  const [freshIds, setFreshIds] = useState<Set<number>>(new Set());
  const channel = useRef<RealtimeChannel | null>(null);
  const loadedOnce = useRef(false);
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastTypingSent = useRef(0);

  const merge = useCallback((incoming: ChatMsg[]) => {
    if (!incoming.length) return;
    setMessages((prev) => {
      const ids = new Set(prev.map((m) => m.id));
      const added = incoming.filter((m) => !ids.has(m.id));
      if (!added.length) return prev;
      if (loadedOnce.current) setFreshIds((f) => new Set([...f, ...added.map((m) => m.id)]));
      return [...prev, ...added].sort((a, b) => a.id - b.id);
    });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    let stop = false;
    const load = async () => {
      const { data } = await supabase!.from("chat_messages").select("*").order("id", { ascending: false }).limit(200);
      if (stop || !data) return;
      merge((data as ChatMsg[]).reverse());
      loadedOnce.current = true;
    };
    load();
    const poll = setInterval(load, 6000);

    const ch = supabase
      .channel("nmw-chat", { config: { presence: { key: me } } })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (p) => merge([p.new as ChatMsg]))
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.who !== other) return;
        setOtherTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setOtherTyping(false), 3000);
      })
      .on("presence", { event: "sync" }, () => setOtherOnline(Object.keys(ch.presenceState()).includes(other)))
      .subscribe((status) => {
        if (status === "SUBSCRIBED") ch.track({ who: me, at: Date.now() });
      });
    channel.current = ch;
    return () => {
      stop = true;
      clearInterval(poll);
      supabase!.removeChannel(ch);
    };
  }, [me, other, merge]);

  const send = useCallback(
    async (body: string, opts: { secret?: boolean; chapter?: number | null } = {}) => {
      if (!supabase || !body.trim()) return;
      const { data } = await supabase
        .from("chat_messages")
        .insert({ sender: me, body: body.trim(), secret: !!opts.secret, auto: false, chapter: opts.chapter ?? null })
        .select()
        .single();
      if (data) merge([data as ChatMsg]);
    },
    [me, merge]
  );

  const typing = useCallback(() => {
    if (Date.now() - lastTypingSent.current < 1500) return;
    lastTypingSent.current = Date.now();
    channel.current?.send({ type: "broadcast", event: "typing", payload: { who: me } });
  }, [me]);

  return { messages, send, typing, otherTyping, otherOnline, freshIds, other, enabled: !!supabase };
}
