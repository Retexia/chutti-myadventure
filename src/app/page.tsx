"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { INITIAL_MEMORIES, MemoryPhoto } from "@/data/memories";
import { driveImage } from "@/lib/drive";

interface StageMeta {
  id: number;
  short: string;
  title: string;
  clueCode: string;
  clueDesc: string;
  hint: string;
}

const STAGES_META: StageMeta[] = [
  {
    id: 0,
    short: "1. 11:30 AM Alarm",
    title: "Sleeping Beauty Gate",
    clueCode: "WAKE-1130",
    clueDesc: "Wakes up between 11AM–12PM (Sleep > Piccalito lol)",
    hint: "Set the wake-up slider between 11:00 AM and 12:00 PM, and tap all 5 cozy pillows!"
  },
  {
    id: 1,
    short: "2. Port City Date",
    title: "Port City to Dehiwala",
    clueCode: "SEAT-DEHIWALA",
    clueDesc: "Flowers & Chocolates, Daham/Hasitha/Sewmini, sat next to her to Dehiwala",
    hint: "Choose Flowers & Chocolates, Daham/Hasitha/Sewmini, type 'Dehiwala', and click the Empty Seat next to Chutyymiii!"
  },
  {
    id: 2,
    short: "3. Ring Heist",
    title: "One Galle Face Heist",
    clueCode: "STOLEN-RING",
    clueDesc: "Stole her ring at One Galle Face & still keeps it safe today",
    hint: "Click Vault #8 in the grid or type 'ring' in the confirmation box!"
  },
  {
    id: 3,
    short: "4. Diyatha Park",
    title: "Diyatha Formal Blush",
    clueCode: "SHY-HANDKISS",
    clueDesc: "Formal clothes at Diyatha Pokuna + kissed her hand & she got super shy",
    hint: "Select 'Formal clothes' and click 'Kiss Chutyymiii's Hand' 4 times to reach 100%!"
  },
  {
    id: 4,
    short: "5. Tuk-Tuk 5x",
    title: "Library, Domino's & Tuk-Tuk",
    clueCode: "5KISS-SUTTEE",
    clueDesc: "Lost from Public Library & Domino's to bodima; 5 kisses: appuchchooooo, bhhhhh, suttee",
    hint: "Steer the Tuk-Tuk to collect 5 kisses, and click all 3 quote buttons ('appuchchooooo', 'bhhhhh', 'suttee')!"
  },
  {
    id: 5,
    short: "6. Retexia.com",
    title: "Building Retexia Together",
    clueCode: "CEO-RETEXIA",
    clueDesc: "Co-founders of retexia.com; becoming the best businessman before meeting her dad",
    hint: "Click all 4 Retexia milestone modules to turn them green, then type 'retexia'!"
  },
  {
    id: 6,
    short: "7. Canada Vow",
    title: "Canada: No Matter What",
    clueCode: "CANADA-FOREVER",
    clueDesc: "Peaceful life in Canada with stable money — 'No Matter What'",
    hint: "Type our sacred 3-word promise: 'no matter what'!"
  }
];

export default function AnniversaryQuestPage() {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [totalKisses, setTotalKisses] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [showVault, setShowVault] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Stage 0 state
  const [sleepHour, setSleepHour] = useState<number>(7);
  const [pillowsCleared, setPillowsCleared] = useState<number[]>([]);

  // Stage 1 state
  const [s1Gifts, setS1Gifts] = useState<string>("");
  const [s1Crew, setS1Crew] = useState<string>("");
  const [s1Dest, setS1Dest] = useState<string>("");
  const [piccalitoSeated, setPiccalitoSeated] = useState<boolean>(false);

  // Stage 2 state
  const [ringFound, setRingFound] = useState<boolean>(false);
  const [s2Input, setS2Input] = useState<string>("");
  const [vaultClicked, setVaultClicked] = useState<Record<number, string>>({});

  // Stage 3 state
  const [s3Attire, setS3Attire] = useState<string>("");
  const [shyPercent, setShyPercent] = useState<number>(0);

  // Stage 4 state
  const [tuktukKisses, setTuktukKisses] = useState<number>(0);
  const [speechBubble, setSpeechBubble] = useState<string>(
    "🛺 Drive the Tuk-Tuk! Collect all 5 kisses on our lost ride back to the bodima!"
  );
  const [quotesClicked, setQuotesClicked] = useState<string[]>([]);

  // Stage 5 state
  const [retexiaNodes, setRetexiaNodes] = useState<number[]>([]);
  const [s5Input, setS5Input] = useState<string>("");

  // Stage 6 state
  const [s6Vow, setS6Vow] = useState<string>("");
  const [loveNotes, setLoveNotes] = useState<Array<{ sender: string; message: string; created_at?: string }>>([
    {
      sender: "Piccalito",
      message: "Happy Anniversary my sleepy queen Chutyymiii! Solve all 7 stages to unlock our Canada boarding pass ❤️"
    }
  ]);
  const [replyText, setReplyText] = useState<string>("");

  // Photos state
  const [photos, setPhotos] = useState<MemoryPhoto[]>(INITIAL_MEMORIES);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>("");
  const [newPhotoCaption, setNewPhotoCaption] = useState<string>("");

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Load initial data from Supabase if configured
  useEffect(() => {
    async function fetchInitialData() {
      if (!supabase) return;
      const { data: notesData } = await supabase
        .from("love_notes")
        .select("*")
        .order("created_at", { ascending: false });
      if (notesData && notesData.length > 0) {
        setLoveNotes(notesData);
      }
      const { data: photoData } = await supabase
        .from("memory_photos")
        .select("*")
        .order("created_at", { ascending: false });
      if (photoData && photoData.length > 0) {
        const mapped: MemoryPhoto[] = photoData.map((p: any) => ({
          id: p.id,
          src: driveImage(p.image_url),
          caption: p.caption,
          tag: p.chapter_tag || "Supabase Vault"
        }));
        setPhotos([...mapped, ...INITIAL_MEMORIES]);
      }
    }
    fetchInitialData();
  }, []);

  const syncProgress = async (nextStage: number, nextCompleted: number[], nextKisses: number) => {
    if (!supabase) return;
    try {
      await supabase.from("quest_progress").insert({
        player_name: "chutyymiii",
        current_stage: nextStage,
        unlocked_stages: nextCompleted,
        kisses_collected: nextKisses
      });
    } catch (e) {}
  };

  const completeStage = (stageId: number, successMsg: string) => {
    const updated = completedStages.includes(stageId)
      ? completedStages
      : [...completedStages, stageId];
    setCompletedStages(updated);
    const nextActive = stageId < 6 ? stageId + 1 : 6;
    setActiveStage(nextActive);
    setShowHint(false);
    notify(successMsg);
    syncProgress(nextActive, updated, totalKisses);
  };

  const formatHour = (val: number) => {
    const hr = Math.floor(val);
    const mins = val % 1 === 0.5 ? "30" : "00";
    const suffix = hr >= 12 ? "PM" : "AM";
    const dispHr = hr > 12 ? hr - 12 : hr;
    return `${String(dispHr).padStart(2, "0")}:${mins} ${suffix}`;
  };

  const handleSaveLoveNote = async () => {
    if (!replyText.trim()) return;
    const newEntry = { sender: "Chutyymiii", message: replyText.trim() };
    setLoveNotes([newEntry, ...loveNotes]);
    setReplyText("");
    notify("💌 Love note saved to Piccalito's heart & Supabase!");
    if (supabase) {
      await supabase.from("love_notes").insert(newEntry);
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhotoUrl.trim()) return;
    const cap = newPhotoCaption.trim() || "Chutyymiii & Piccalito Memory ❤️";
    const item: MemoryPhoto = {
      id: "custom-" + Date.now(),
      src: driveImage(newPhotoUrl),
      caption: cap,
      tag: "Added Memory"
    };
    setPhotos([item, ...photos]);
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    notify("📸 Photo added to Memory Vault!");
    if (supabase) {
      await supabase.from("memory_photos").insert({
        image_url: item.src,
        caption: item.caption,
        chapter_tag: item.tag
      });
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900/95 border border-pink-400/50 text-pink-100 px-4 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-pink-500/20 bg-slate-950/85 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-amber-500 flex items-center justify-center font-bold text-lg">
              🕵️‍♀️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-pink-400">
                  CLASSIFIED ANNIVERSARY DOSSIER
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {isSupabaseConfigured ? "Supabase Live" : "Local Mode"}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-white">
                Chutyymiii &amp; Piccalito · <span className="text-pink-400 italic">Operation: No Matter What</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              🔑 Clues: <strong>{completedStages.length} / 7</strong>
            </div>
            <div className="bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
              💋 Kisses: <strong>{totalKisses}</strong>
            </div>
            <button
              onClick={() => setShowVault(true)}
              className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 px-3 py-1.5 rounded-xl text-xs font-semibold text-pink-200"
            >
              📸 Memory Vault ({photos.length})
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {STAGES_META.map((st) => {
            const unlocked = st.id === 0 || completedStages.includes(st.id - 1) || completedStages.includes(st.id);
            const done = completedStages.includes(st.id);
            const active = activeStage === st.id;
            return (
              <button
                key={st.id}
                onClick={() => unlocked ? setActiveStage(st.id) : notify("🔒 Solve the previous stage first!")}
                className={`p-2.5 rounded-xl text-left border transition ${
                  active
                    ? "bg-pink-500/25 border-pink-400 text-white"
                    : done
                    ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-200"
                    : unlocked
                    ? "bg-slate-900/80 border-amber-400/35 text-amber-200"
                    : "bg-slate-900/40 border-slate-800 text-slate-500"
                }`}
              >
                <div className="flex justify-between text-[11px] font-mono">
                  <span>{st.short}</span>
                  <span>{done ? "✅" : unlocked ? "🔓" : "🔒"}</span>
                </div>
                <div className="text-xs font-semibold truncate mt-0.5">{st.title}</div>
              </button>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-8 bg-slate-900/80 border border-pink-500/25 rounded-3xl p-6 space-y-6 shadow-2xl">
            {/* STAGE 0 */}
            {activeStage === 0 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white">Stage 1: The 11:30 AM Sleeping Beauty Protocol 😴⏰</h2>
                <p className="text-sm text-slate-300">
                  Before our virtual date can begin, we have a hilarious obstacle: <strong>Chutyymiii loves her sleep</strong> (maybe even more than Piccalito lol 😂). Set the alarm dial to her real wake-up window (<strong>11:00 AM – 12:00 PM</strong>) and tap all 5 cozy pillows!
                </p>
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs font-mono">
                    <span>Wake-Up Time Dial:</span>
                    <span className="text-amber-300 font-bold text-base">{formatHour(sleepHour)}</span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={15}
                    step={0.5}
                    value={sleepHour}
                    onChange={(e) => setSleepHour(parseFloat(e.target.value))}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-around pt-2">
                    {[1, 2, 3, 4, 5].map((id) => (
                      <button
                        key={id}
                        onClick={() => {
                          if (!pillowsCleared.includes(id)) {
                            setPillowsCleared([...pillowsCleared, id]);
                            setTotalKisses((k) => k + 1);
                          }
                        }}
                        className={`text-2xl p-3 rounded-xl border ${
                          pillowsCleared.includes(id)
                            ? "bg-emerald-500/30 border-emerald-400"
                            : "bg-slate-800 border-slate-700"
                        }`}
                      >
                        {pillowsCleared.includes(id) ? "💖" : "🛌"}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      if (sleepHour < 11 || sleepHour > 12) return notify("⏰ Set the clock between 11:00 AM and 12:00 PM!");
                      if (pillowsCleared.length < 5) return notify("🛌 Tap all 5 pillows first!");
                      completeStage(0, "🎉 Stage 1 Cleared! Good morning at 11:30 AM, Chutyymiii!");
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-bold text-sm"
                  >
                    Unlock Stage 2: Port City Colombo →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 1 */}
            {activeStage === 1 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white">Stage 2: Port City Colombo to Dehiwala 💐🍫</h2>
                <img src="/memories/port_city_first_date.jpg" alt="Port City Date" className="w-full h-52 object-cover rounded-2xl border border-pink-400/30" />
                <p className="text-sm text-slate-300">
                  Our very first date at <a href="https://www.portcitycolombo.lk/" target="_blank" rel="noreferrer" className="text-pink-400 underline">Port City Colombo</a>! Reconstruct the exact details and take the seat right next to Chutyymiii all the way to Dehiwala:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select value={s1Gifts} onChange={(e) => setS1Gifts(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white">
                    <option value="">-- First Date Gifts --</option>
                    <option value="flowers_chocolates">Flowers &amp; Chocolates 💐🍫</option>
                    <option value="other">Teddy Bear &amp; Watch</option>
                  </select>
                  <select value={s1Crew} onChange={(e) => setS1Crew(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white">
                    <option value="">-- Friends Who Came --</option>
                    <option value="daham_hasitha_sewmini">Daham, Hasitha &amp; Sewmini</option>
                    <option value="other">Nobody else</option>
                  </select>
                  <input
                    value={s1Dest}
                    onChange={(e) => setS1Dest(e.target.value)}
                    placeholder="Town we rode to (Dehiwala)"
                    className="rounded-xl bg-slate-950 border border-slate-700 p-2.5 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-5 gap-2">
                  <div className="p-2 rounded-lg bg-slate-800 text-center text-xs">🪑 Daham</div>
                  <div className="p-2 rounded-lg bg-slate-800 text-center text-xs">🪑 Hasitha</div>
                  <div className="p-2 rounded-lg bg-slate-800 text-center text-xs">🪑 Sewmini</div>
                  <div className="p-2 rounded-lg bg-pink-500/30 border border-pink-400 text-center text-xs font-bold">👑 Chutyymiii</div>
                  <button
                    onClick={() => {
                      setPiccalitoSeated(true);
                      setTotalKisses((k) => k + 1);
                    }}
                    className={`p-2 rounded-lg text-xs font-bold border ${
                      piccalitoSeated ? "bg-emerald-500/30 border-emerald-400 text-emerald-200" : "bg-amber-500/20 border-amber-400 text-amber-200"
                    }`}
                  >
                    {piccalitoSeated ? "💑 Piccalito" : "✨ Sit Here"}
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (s1Gifts !== "flowers_chocolates") return notify("Pick Flowers & Chocolates!");
                    if (s1Crew !== "daham_hasitha_sewmini") return notify("Pick Daham, Hasitha & Sewmini!");
                    if (!s1Dest.toLowerCase().includes("dehiwala")) return notify("Type 'Dehiwala'!");
                    if (!piccalitoSeated) return notify("Click 'Sit Here' next to Chutyymiii!");
                    completeStage(1, "🎉 Stage 2 Cleared! Sitting next to you all the way to Dehiwala!");
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-bold text-sm"
                >
                  Unlock Stage 3: One Galle Face Ring Heist →
                </button>
              </div>
            )}

            {/* STAGE 2 */}
            {activeStage === 2 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white">Stage 3: One Galle Face &amp; The Stolen Ring 💍</h2>
                <p className="text-sm text-slate-300">
                  On our second outing at <a href="https://onegalleface.com/" target="_blank" rel="noreferrer" className="text-pink-400 underline">One Galle Face</a>, Piccalito stole something from you — and he still keeps it safe today! Click the boxes to find it:
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (idx === 7) {
                          setRingFound(true);
                          setS2Input("Ring");
                          setVaultClicked({ ...vaultClicked, [idx]: "💍 RING!" });
                          notify("💍 Found the stolen ring!");
                        } else {
                          setVaultClicked({
                            ...vaultClicked,
                            [idx]: Math.abs(idx - 7) <= 2 ? "🔥 Warm" : "❄️ Cold"
                          });
                        }
                      }}
                      className="h-14 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono"
                    >
                      {vaultClicked[idx] || `🎁 #${idx + 1}`}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={s2Input}
                    onChange={(e) => setS2Input(e.target.value)}
                    placeholder="What did Piccalito steal and keep? (ring)"
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (!ringFound && !s2Input.toLowerCase().includes("ring")) return notify("Find the ring or type 'ring'!");
                      completeStage(2, "🎉 Stage 3 Cleared! The stolen ring is still safe with Piccalito!");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Unlock Stage 4 →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 3 */}
            {activeStage === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white">Stage 4: Diyatha Pokuna in Formal Clothes 🤵‍♂️👗</h2>
                <img src="/memories/diyatha_pokuna_formal.jpg" alt="Diyatha Pokuna" className="w-full h-52 object-cover rounded-2xl border border-pink-400/30" />
                <p className="text-sm text-slate-300">
                  At <a href="https://www.watersedge.lk/experience/diyatha-uyana/" target="_blank" rel="noreferrer" className="text-pink-400 underline">Diyatha Uyana (Diyatha Pokuna)</a>, we wore formal clothes and Piccalito kissed your hand until you got super shy!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select value={s3Attire} onChange={(e) => setS3Attire(e.target.value)} className="rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-white">
                    <option value="">-- What were we wearing? --</option>
                    <option value="formal_clothes">Formal clothes 🤵‍♂️👗</option>
                    <option value="casual">Tracksuits</option>
                  </select>
                  <button
                    onClick={() => {
                      setShyPercent((p) => Math.min(100, p + 25));
                      setTotalKisses((k) => k + 1);
                    }}
                    className="py-3 px-4 rounded-xl bg-pink-500/25 border border-pink-400 text-pink-200 text-xs font-bold"
                  >
                    💋🤚 Kiss Her Hand (Shyness: {shyPercent}%)
                  </button>
                </div>
                <button
                  onClick={() => {
                    if (s3Attire !== "formal_clothes") return notify("Select 'Formal clothes'!");
                    if (shyPercent < 100) return notify("Tap 'Kiss Her Hand' until Shyness reaches 100%!");
                    completeStage(3, "🎉 Stage 4 Cleared! Super shy at Diyatha Pokuna!");
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-bold text-sm"
                >
                  Unlock Stage 5: Public Library, Domino's &amp; Tuk-Tuk →
                </button>
              </div>
            )}

            {/* STAGE 4 */}
            {activeStage === 4 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white">Stage 5: Library, Domino's &amp; 5 Kisses in the Tuk-Tuk 🛺🍕💋</h2>
                <img src="/memories/colombo_tuktuk_5kisses.jpg" alt="Tuk-Tuk" className="w-full h-52 object-cover rounded-2xl border border-pink-400/30" />
                <p className="text-sm text-slate-300">
                  After <a href="https://www.colombo.mc.gov.lk/public-library.php" target="_blank" rel="noreferrer" className="text-pink-400 underline">Colombo Public Library</a> and Domino's Pizza, we got lost heading back to the bodima! Collect all 5 Tuk-Tuk kisses and tap your 3 iconic expressions:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-pink-500/30 text-center text-xs font-mono text-pink-300">
                  {speechBubble}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        const next = Math.min(5, tuktukKisses + 1);
                        setTuktukKisses(next);
                        setTotalKisses((k) => k + 1);
                        setSpeechBubble(`💋 Tuk-Tuk Kiss #${next}/5 collected on the way to the bodima!`);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/35 border border-pink-400/40 text-xs font-bold text-pink-200"
                    >
                      🛺💋 Give Tuk-Tuk Kiss #{num}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["appuchchooooo", "bhhhhh", "suttee"].map((w) => (
                    <button
                      key={w}
                      onClick={() => {
                        if (!quotesClicked.includes(w)) setQuotesClicked([...quotesClicked, w]);
                        setSpeechBubble(`🗣️ Chutyymiii says: "${w}!"`);
                      }}
                      className={`py-2.5 rounded-xl text-xs font-mono border ${
                        quotesClicked.includes(w)
                          ? "bg-emerald-500/30 border-emerald-400 text-white font-bold"
                          : "bg-slate-950 border-slate-700 text-pink-200"
                      }`}
                    >
                      "{w}"
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (tuktukKisses < 5) return notify("Collect all 5 Tuk-Tuk kisses first!");
                    if (quotesClicked.length < 3) return notify("Click all 3 expressions: appuchchooooo, bhhhhh, suttee!");
                    completeStage(4, "🎉 Stage 5 Cleared! 'appuchchooooo, bhhhhh, suttee' unlocked!");
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-bold text-sm"
                >
                  Unlock Stage 6: Building Retexia.com Together →
                </button>
              </div>
            )}

            {/* STAGE 5 */}
            {activeStage === 5 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-bold text-white">Stage 6: Building Retexia.com &amp; Our Co-Founder Pact 🚀💼</h2>
                <p className="text-sm text-slate-300">
                  Even when times are hard and signing clients and building systems is tough, we built <a href="https://www.retexia.com/" target="_blank" rel="noreferrer" className="text-emerald-300 underline font-bold">retexia.com</a> together! Piccalito will become the best businessman before meeting your dad. Activate all 4 modules:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 1, title: "Launch retexia.com Official Web" },
                    { id: 2, title: "Win Clients & Build Systems Together" },
                    { id: 3, title: "Best Businessman Before Meeting Your Dad" },
                    { id: 4, title: "Build Stable Income for Canada" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (!retexiaNodes.includes(m.id)) setRetexiaNodes([...retexiaNodes, m.id]);
                      }}
                      className={`p-3.5 rounded-xl text-left text-xs font-bold border ${
                        retexiaNodes.includes(m.id)
                          ? "bg-emerald-500/25 border-emerald-400 text-emerald-200"
                          : "bg-slate-950 border-slate-700 text-slate-300"
                      }`}
                    >
                      ⚡ {m.title}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={s5Input}
                    onChange={(e) => setS5Input(e.target.value)}
                    placeholder="Type our company name (retexia)..."
                    className="flex-1 rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (retexiaNodes.length < 4) return notify("Click all 4 Retexia modules first!");
                      if (!s5Input.toLowerCase().includes("retexia")) return notify("Type 'retexia'!");
                      completeStage(5, "🎉 Stage 6 Cleared! Co-founders of Retexia forever!");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Unlock Stage 7 →
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 6 */}
            {activeStage === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white">Stage 7: Destination Canada — "No Matter What" 🍁🏔️❤️</h2>
                <img src="/memories/canada_dream_future.jpg" alt="Canada Dream" className="w-full h-56 object-cover rounded-2xl border border-amber-400/40" />
                <div className="flex gap-2">
                  <input
                    value={s6Vow}
                    onChange={(e) => setS6Vow(e.target.value)}
                    placeholder="Enter our 3-word promise (no matter what)..."
                    className="flex-1 rounded-xl bg-slate-950 border border-amber-400/40 px-4 py-3 text-sm text-white font-mono"
                  />
                  <button
                    onClick={() => {
                      if (!s6Vow.toLowerCase().includes("no matter what")) return notify("Hint: Type 'no matter what'!");
                      completeStage(6, "🎆 HAPPY ANNIVERSARY CHUTYYMIII! NO MATTER WHAT!");
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-amber-500 text-slate-950 font-extrabold text-sm"
                  >
                    🔓 Unlock Finale
                  </button>
                </div>

                {completedStages.includes(6) && (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-950/80 to-indigo-950/80 border-2 border-pink-400/50 space-y-4">
                    <h3 className="text-2xl font-bold text-white">Happy Anniversary, My Dearest Chutyymiii! 💖</h3>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      From flowers and chocolates at Port City Colombo (with Daham, Hasitha, and Sewmini) and sitting next to you all the way to Dehiwala, to stealing your ring at One Galle Face, kissing your hand in our formal clothes at Diyatha Pokuna, and getting lost after Colombo Public Library and Domino&apos;s Pizza with 5 kisses in the tuk-tuk (<em>&quot;appuchchooooo, bhhhhh, suttee!&quot;</em>) — every moment with you is my favorite adventure.
                    </p>
                    <p className="text-sm text-slate-200 leading-relaxed">
                      We will keep building <strong>Retexia (retexia.com)</strong> side by side, I will become the best businessman before meeting your dad, and we will reach our peaceful life in <strong>Canada</strong> with stable money — where you can still wake up at 11:30 AM every day! Above all, I love you so much. <strong>No Matter What.</strong> — Forever yours, <strong>Piccalito</strong> ❤️
                    </p>

                    <div className="pt-4 border-t border-pink-400/30 space-y-3">
                      <h4 className="text-xs font-mono uppercase text-pink-300">💌 Write a Reply to Piccalito (Syncs to Supabase)</h4>
                      <textarea
                        rows={3}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your anniversary note here, Chutyymiii..."
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-xs text-white"
                      />
                      <button
                        onClick={handleSaveLoveNote}
                        className="px-5 py-2 rounded-xl bg-pink-500 text-slate-950 font-bold text-xs"
                      >
                        Send Love Note 💖
                      </button>
                      <div className="space-y-2 pt-2">
                        {loveNotes.map((n, i) => (
                          <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-pink-400/20 text-xs">
                            <strong className="text-pink-300">{n.sender}:</strong> <span className="text-slate-200">{n.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
              <h3 className="text-xs font-mono uppercase text-amber-300">🧭 External Webs, Places &amp; YouTube</h3>
              <div className="space-y-2 text-xs">
                <a href="https://www.retexia.com/" target="_blank" rel="noreferrer" className="block p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/30 text-emerald-200">
                  🚀 Our Official Web: <strong>retexia.com</strong> ↗
                </a>
                <a href="https://www.portcitycolombo.lk/" target="_blank" rel="noreferrer" className="block p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200">
                  🌊 Date #1: Port City Colombo ↗
                </a>
                <a href="https://onegalleface.com/" target="_blank" rel="noreferrer" className="block p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200">
                  💍 Date #2: One Galle Face Mall ↗
                </a>
                <a href="https://www.watersedge.lk/experience/diyatha-uyana/" target="_blank" rel="noreferrer" className="block p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200">
                  🤵‍♂️ Formal Date: Diyatha Pokuna ↗
                </a>
                <a href="https://www.colombo.mc.gov.lk/public-library.php" target="_blank" rel="noreferrer" className="block p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200">
                  📚 Colombo Public Library ↗
                </a>
                <a href="https://www.youtube.com/watch?v=53DCbTp1Bug" target="_blank" rel="noreferrer" className="block p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-pink-500/30 text-pink-200">
                  🎵 YouTube: Suwanda Heene (Love Song) ↗
                </a>
                <a href="https://www.youtube.com/watch?v=glfsaT4FrZE" target="_blank" rel="noreferrer" className="block p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-pink-500/30 text-pink-200">
                  🎶 YouTube: 25 Romantic Sinhala Songs ↗
                </a>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase text-indigo-300">💡 Stage Hint</span>
                <button onClick={() => setShowHint(!showHint)} className="text-xs text-pink-300 underline">
                  {showHint ? "Hide Hint" : "Reveal Hint"}
                </button>
              </div>
              {showHint && (
                <p className="text-xs text-slate-300 pt-1">{STAGES_META[activeStage]?.hint}</p>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Memory Photo Vault Modal */}
      {showVault && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-pink-500/30 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">📸 Chutyymiii &amp; Piccalito Memory Photo Vault</h3>
              <button onClick={() => setShowVault(false)} className="px-3 py-1 rounded-lg bg-slate-800 text-xs">
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="Google Drive share link or image URL"
                className="rounded-xl bg-slate-950 border border-slate-700 p-2 text-xs text-white"
              />
              <input
                value={newPhotoCaption}
                onChange={(e) => setNewPhotoCaption(e.target.value)}
                placeholder="Memory caption..."
                className="rounded-xl bg-slate-950 border border-slate-700 p-2 text-xs text-white"
              />
              <button onClick={handleAddPhoto} className="rounded-xl bg-pink-500 text-slate-950 font-bold text-xs py-2">
                + Add Photo to Vault
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {photos.map((p) => (
                <div key={p.id} className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <img src={p.src} alt={p.caption} loading="lazy" referrerPolicy="no-referrer" className="w-full h-52 object-cover" />
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] font-mono text-pink-400">{p.tag}</span>
                    <p className="text-xs text-slate-200">{p.caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
