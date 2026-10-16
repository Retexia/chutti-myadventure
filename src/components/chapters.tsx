"use client";

import React, { useEffect, useState } from "react";
import { useGame } from "@/components/GameProvider";
import { AnswerBox, ChapterShell, ExtLink, HiddenKiss, Lock, Photo } from "@/components/ui";
import { ClockSetter, LockerHunt, Mastermind, MorseLantern, SeatingPuzzle, ShyMeter, SnoozeButton, TileArrange, TwoPlayerCode } from "@/components/puzzles-a";
import { LibraryShelf, MemoryMatch, ShoutMeter, SignaturePad, SlidingPuzzle, Terminal, Timeline, TukTukMaze } from "@/components/puzzles-b";
import { CHAPTERS, HIDDEN_KISSES, formatDuration, kissesOwed } from "@/lib/game";
import { norm, wrongLine } from "@/lib/answers";
import { buzz } from "@/lib/audio";
import { supabase } from "@/lib/supabase";

type P = { onNext: () => void };
const maps = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const Story = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-slate-300 leading-relaxed">{children}</p>;
const Evidence = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-sm text-slate-300 space-y-1.5 font-mono">{children}</div>
);

/* ======================= CHAPTER 1 ======================= */
export function Chapter1({ onNext }: P) {
  const { solve, notify } = useGame();
  return (
    <ChapterShell
      n={1}
      onNext={onNext}
      intro={
        <>
          <Story>
            <strong>Agent Chutyymiii.</strong> It is 11:27 AM. Our satellites confirm you are <em>still</em> in bed. Before the anniversary mission can begin, you must
            defeat the three guardians of sleep. Piccalito has been awake since morning, waiting (as usual). <HiddenKiss id="k1" />
          </Story>
          <Story>Warning: some locks in this mission are impossible to open alone. When that happens… you know who to call.</Story>
        </>
      }
      reward={
        <div className="grid grid-cols-2 gap-2">
          <Photo i={94} className="w-full h-40 rounded-xl" />
          <Photo i={96} className="w-full h-40 rounded-xl" />
        </div>
      }
    >
      <Lock id="c1-alarm" index={0} title="The Runaway Snooze Button" hints={[
        "It gets tired eventually. Persistence, like Piccalito waiting every morning for your 'good morning' text.",
        "On a phone, just keep tapping it. On a laptop, keep chasing it with the mouse.",
        "After 9 escapes it gives up and turns green. Then tap it."
      ]} solvedNote="Alarm silenced. Piccalito's 'good morning' texts remain unanswered as usual. 📱">
        <SnoozeButton onSolve={() => solve("c1-alarm", "⏰ Alarm defeated! (it's 11:29 AM)")} />
      </Lock>

      <Lock id="c1-clock" index={1} title="The Official Wake-Up Time" hints={[
        "An hour hand halfway between 11 and 12 means it's 11-something.",
        "How many times did Piccalito kiss you in the tuk-tuk after Domino's? Add one, then find that number on the clock face.",
        "5 + 1 = 6. Minute hand on the 6 means :30. Set it to 11:30."
      ]} solvedNote="11:30 AM — officially logged as Sleeping Beauty's earliest possible appearance. ☀️">
        <Evidence>
          <div>📁 Spy log #1130 — subject&apos;s wake-up time:</div>
          <div>&quot;The hour hand rests exactly halfway between 11 and 12.</div>
          <div>The minute hand points at the number of kisses stolen in a certain tuk-tuk… plus one.&quot;</div>
        </Evidence>
        <ClockSetter
          onCheck={(m) => {
            if (m === 690) return solve("c1-clock", "⏰ 11:30 AM. Correct. Typical.");
            buzz();
            if (m < 600) notify("🚨 IMPOSTOR DETECTED. The real Chutyymiii has never seen that hour.", "bad");
            else if (m >= 690 && m < 720) notify("🤏 So close. But the riddle is very specific about that minute hand.", "bad");
            else notify(wrongLine(), "bad");
          }}
        />
      </Lock>

      <Lock id="c1-dream" index={2} title="Suspect Identification" hints={[
        "Look at your pillow.",
        "Zzz…",
        "S _ _ _ P — the thing you do until noon."
      ]} solvedNote="Confirmed: SLEEP > Piccalito. He is filing an official complaint. 😤😂">
        <Evidence>
          <div>🕵️ Piccalito has long suspected you love something MORE than him.</div>
          <div>Exhibit A: it happens every night from ~2 AM until 11:30 AM.</div>
          <div>Exhibit B: you defend it fiercely.</div>
          <div>Exhibit C: 5 letters, starts with S.</div>
          <div>Exhibit D: you are thinking about it right now.</div>
        </Evidence>
        <AnswerBox
          lockId="c1-dream"
          placeholder="Name the suspect…"
          successMsg="🛏️ SLEEP. Case closed."
          special={(s) => (norm(s).includes("piccalito") ? "🥹 Aww… nice try. But the evidence says otherwise." : norm(s) === "suttee" ? "😂 'suttee' is a word, not a suspect." : null)}
        />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= CHAPTER 2 ======================= */
const CIPHER = "ZKDW GLG L EULQJ BRX RQ RXU ILUVW GDWH";

function CaesarWheel() {
  const [k, setK] = useState(0);
  const out = CIPHER.replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 - k + 26) % 26) + 65));
  return (
    <div className="space-y-3">
      <Evidence>
        <div className="text-[11px] text-slate-500">intercepted message:</div>
        <div className="text-cyan-200 tracking-widest break-words">{CIPHER}</div>
      </Evidence>
      <div className="rounded-2xl bg-slate-950 border border-teal-500/30 p-4 space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">🎡 decoder wheel · shift</span>
          <span className="text-teal-300 font-bold text-base">{k}</span>
        </div>
        <input type="range" min={0} max={25} value={k} onChange={(e) => setK(+e.target.value)} className="w-full accent-teal-500" />
        <div className="font-mono text-sm text-white tracking-widest break-words">{out}</div>
      </div>
    </div>
  );
}

export function Chapter2({ onNext }: P) {
  const { solve } = useGame();
  return (
    <ChapterShell
      n={2}
      onNext={onNext}
      intro={
        <>
          <Story>
            The first date. <ExtLink href="https://www.portcitycolombo.lk/">Port City Colombo</ExtLink>. A nervous boy showed up with something in his hands. He brought
            backup — two friends. She brought backup too — one friend. Then the whole group rode all the way to somewhere south… and for the first time in history,
            Piccalito sat next to Chutyymiii. <HiddenKiss id="k2" />
          </Story>
          <Story>The case file is incomplete. Reconstruct it.</Story>
        </>
      }
      reward={
        <div className="grid grid-cols-2 gap-2">
          <Photo i={85} className="w-full h-48 rounded-xl" />
          <Photo i={32} className="w-full h-48 rounded-xl" />
        </div>
      }
    >
      <Lock id="c2-gifts" index={0} title="The Intercepted Message" hints={[
        "The key is a number. Count the friends who came along: Daham, Hasitha… and who did YOU bring?",
        "Set the decoder wheel to 3. The message turns into a question.",
        "The answer is: flowers and chocolates 💐🍫"
      ]} solvedNote="💐🍫 Flowers and chocolates. He was SO nervous holding them.">
        <Story>The decoder key is the number of friends who joined our first date. Decode the question, then answer it.</Story>
        <CaesarWheel />
        <AnswerBox lockId="c2-gifts" placeholder="Answer the decoded question…" successMsg="💐🍫 Correct! He still remembers your face when you saw them." />
      </Lock>

      <Lock id="c2-seats" index={1} title="The Seating Chart" hints={[
        "Daham is in seat 1 — that's given. Hasitha can't be in seat 2 (the cricket argument).",
        "Chutyymiii must sit between Sewmini and Piccalito. Those three need three seats in a row.",
        "Seat 1 → 5: Daham, Sewmini, Chutyymiii, Piccalito, Hasitha."
      ]} solvedNote="Seat 3 & 4: the first time we ever sat together. 🙈">
        <Story>On the ride from Port City, five people sat in one row. Witnesses gave these statements:</Story>
        <Evidence>
          <div>1. Daham grabbed the window seat (seat 1) before anyone else.</div>
          <div>2. Daham and Hasitha argued about cricket the whole way, so they did NOT sit next to each other.</div>
          <div>3. Sewmini sat right next to her bestie, Chutyymiii.</div>
          <div>4. For the first time EVER, Piccalito sat right next to Chutyymiii. 🙈</div>
          <div>5. Piccalito was so nervous he sat as far from Daham as possible — while still next to Chutyymiii.</div>
        </Evidence>
        <SeatingPuzzle onSolve={() => solve("c2-seats", "🚌 Seating chart reconstructed perfectly!")} />
      </Lock>

      <Lock id="c2-map" index={2} title="Where Did The Ride End?" hints={[
        "Tap the satellite link and look at the labels around the pin.",
        "It's south of Colombo along Galle Road, famous for its zoo.",
        "Dehiwala!"
      ]} solvedNote="🦒 Dehiwala — and it seems someone later posed at the zoo sign there.">
        <Evidence>
          <div>🛰️ GPS log recovered from Piccalito&apos;s phone:</div>
          <div>START  6.9366° N, 79.8366° E — <ExtLink href="https://www.google.com/maps/search/?api=1&query=6.9366,79.8366">view</ExtLink></div>
          <div>FINISH 6.8566° N, 79.8737° E — <ExtLink href="https://www.google.com/maps/search/?api=1&query=6.8566,79.8737">open satellite</ExtLink></div>
        </Evidence>
        <AnswerBox lockId="c2-map" placeholder="Name the town where the ride ended…" successMsg="📍 Dehiwala confirmed!" />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= CHAPTER 3 ======================= */
export function Chapter3({ onNext }: P) {
  const { solve } = useGame();
  return (
    <ChapterShell
      n={3}
      onNext={onNext}
      intro={
        <>
          <Story>
            Day two. <ExtLink href="https://onegalleface.com/">One Galle Face</ExtLink>. Hours went by like minutes. And somewhere between the escalators and the photo
            booth, a crime was committed: <strong>a ring vanished from Chutyymiii&apos;s finger.</strong> <HiddenKiss id="k3" />
          </Story>
          <Story>The thief was never arrested. The thief still has it. The thief is reading this over your shoulder, probably smiling. Let&apos;s get it back.</Story>
        </>
      }
      reward={
        <div className="grid grid-cols-3 gap-2">
          <Photo i={90} className="w-full h-40 rounded-xl" />
          <Photo i={91} className="w-full h-40 rounded-xl" />
          <Photo i={9} className="w-full h-40 rounded-xl" />
        </div>
      }
    >
      <Lock id="c3-lockers" index={0} title="36 Lockers, 1 Ring" hints={[
        "Each emoji tells you how many steps away the ring is. Two clues together cross out most lockers.",
        "Distance = steps up/down + steps left/right. A 🔥 means it's directly next to that locker.",
        "Start in the middle (lockers 15, 16, 21 or 22) and follow the heat."
      ]} solvedNote="💍 Found the locker… but wait. Something's off.">
        <Story>The thief stashed the ring in one of 36 mall lockers. Security cameras give you 7 tries before you&apos;re caught and the ring is moved.</Story>
        <LockerHunt onSolve={() => solve("c3-lockers", "💍 Locker found! But it's locked with a safe…")} />
      </Lock>

      <Lock id="c3-safe" index={1} title="The Thief's Safe" hints={[
        "Try 0123, then 4567 — together they tell you which digits are in the code.",
        "Once you know the 4 digits, use the 🟢 to pin down their positions one by one.",
        "If a digit gives 🟢 in a position, keep it there and shuffle the others around it."
      ]} solvedNote="The safe clicked open…">
        <Story>Inside the locker: a small safe with a 4-digit code. No repeated digits. It tells you how close you are after every try.</Story>
        <Mastermind onSolve={() => solve("c3-safe", "🔓 The safe is open!")} />
      </Lock>

      <Lock id="c3-confess" index={2} twoPlayer title="An Empty Safe" hints={[
        "This lock is two-player. No amount of thinking will open it. You need Piccalito.",
        "Call him. Right now. Demand your ring.",
        "Say 'please' in your cutest voice. That's the whole secret. 📞"
      ]} solvedNote="He admitted it. He still has your ring and he's keeping it safe — forever. 💍">
        <Evidence>
          <div>The safe is… EMPTY. 😱 Only a folded note inside:</div>
          <div className="text-teal-200">&quot;Looking for the ring? I still have it. 😏 — P.&quot;</div>
        </Evidence>
        <Story>Call Piccalito and demand your ring back. He&apos;ll only give you the release code if you say <em>&quot;please&quot;</em> in your cutest voice.</Story>
        <TwoPlayerCode lockId="c3-confess" />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= CHAPTER 4 ======================= */
export function Chapter4({ onNext }: P) {
  const { solve } = useGame();
  return (
    <ChapterShell
      n={4}
      onNext={onNext}
      intro={
        <>
          <Story>
            <ExtLink href={maps("Diyatha Uyana Battaramulla")}>Diyatha Pokuna</ExtLink>. A park by the water, two people dressed far too nicely for a park, and one
            very bold move: Piccalito kissed her hand. She turned into a tomato. <HiddenKiss id="k4" />
          </Story>
        </>
      }
      reward={
        <div className="grid grid-cols-2 gap-2">
          <Photo i={61} className="w-full h-56 rounded-xl" />
          <Photo i={97} className="w-full h-56 rounded-xl" />
        </div>
      }
    >
      <Lock id="c4-dress" index={0} title="Dress Code at the Gate" hints={["Not tracksuits.", "We looked very… professional.", "F-O-R-M-A-L"]} solvedNote="👔👗 Formal. We looked like we were going to a wedding, not a park.">
        <Story>The park guard blocks the path: &quot;Tonight&apos;s dress code is one word. Spell it with the tiles.&quot;</Story>
        <TileArrange lockId="c4-dress" tiles={["F", "O", "R", "M", "A", "L"]} successMsg="🤵‍♂️👗 Dress code approved!" />
      </Lock>

      <Lock id="c4-shy" index={1} title="The Shyness Meter" hints={[
        "Watch the rhythm. Tap slightly before the needle enters the pink zone.",
        "The zone moves and shrinks after every hit. One miss resets everything — stay calm.",
        "Hold your phone with both hands and breathe. Shyness takes patience."
      ]} solvedNote="🙈 Shyness: 100%. Face: hidden. Heart: stolen.">
        <Story>Recreate the moment. Kiss her hand at exactly the right moment — five times in a row — until she&apos;s too shy to look at you.</Story>
        <ShyMeter onSolve={() => solve("c4-shy", "🙈 She's SUPER shy now!")} />
      </Lock>

      <Lock id="c4-morse" index={2} title="A Lantern Across the Pond" hints={[
        "Short flash = dot, long flash = dash. Slow the speed down and write it on paper.",
        "It's 5 letters. The first one is  -...",
        "-... .-.. ..- ... ....  =  B L U S H"
      ]} solvedNote="🌸 BLUSH. Exactly what your cheeks did.">
        <Story>
          As the sun set, someone flashed a lantern from across the water. It spells the color your cheeks turned that day. You may need a{" "}
          <ExtLink href="https://en.wikipedia.org/wiki/Morse_code">Morse code chart</ExtLink>.
        </Story>
        <MorseLantern message="BLUSH" />
        <AnswerBox lockId="c4-morse" placeholder="What did the lantern say?" successMsg="🏮 Message decoded!" />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= CHAPTER 5 ======================= */
export function Chapter5({ onNext }: P) {
  const { solve } = useGame();
  return (
    <ChapterShell
      n={5}
      onNext={onNext}
      intro={
        <>
          <Story>
            Another day: the <ExtLink href={maps("Colombo Public Library")}>Colombo Public Library</ExtLink>. Two people pretending to read. Then pizza. Then… nobody
            knew how to get back to the bodima. Completely lost in Colombo. So we took a tuk-tuk — and somewhere on that ride, Piccalito stole five kisses while she said
            words that cannot be translated into any human language. <HiddenKiss id="k5" />
          </Story>
        </>
      }
      reward={
        <div className="grid grid-cols-3 gap-2">
          <Photo i={64} className="w-full h-40 rounded-xl" />
          <Photo i={66} className="w-full h-40 rounded-xl" />
          <Photo i={23} className="w-full h-40 rounded-xl" />
        </div>
      }
    >
      <Lock id="c5-shelf" index={0} title="The Librarian's Riddle" hints={[
        "Pull every book off the shelf to read its call number (like 133.5).",
        "Smallest number first: 001.9 → … → 910.4. Then take the first letter of each title.",
        "D-O-M-I-N-O 🍕"
      ]} solvedNote="🍕 Domino's! The best detour of our lives.">
        <Story>The librarian slides you a note: &quot;Your next destination is hidden on this shelf. Sort the books by their call numbers and read the first letter of each title.&quot;</Story>
        <LibraryShelf />
        <AnswerBox lockId="c5-shelf" placeholder="Where did we go after the library?" successMsg="🍕 Pizza time!" />
      </Lock>

      <Lock id="c5-maze" index={1} title="Lost in Colombo" hints={[
        "The fog only lets you see 2 steps ahead — just like that night. Roads you've driven stay dimly visible.",
        "Kisses hide at dead ends. Explore every dead end you pass.",
        "The bodima is the farthest point from Domino's. Collect all 5 kisses first, or the door stays locked."
      ]} solvedNote="🛺 Home at last. 5 kisses. Zero sense of direction. Perfect night.">
        <Story>Drive the tuk-tuk from Domino&apos;s 🍕 back to the bodima 🏠. You can&apos;t see far. Collect all 5 kisses 💋 on the way.</Story>
        <TukTukMaze onSolve={() => solve("c5-maze", "🏠 Made it home!")} />
      </Lock>

      <Lock id="c5-shout" index={2} title="Voice Verification" hints={[
        "Allow microphone access when the browser asks.",
        "It needs to be LOUD and long: appuchchoooooooooooooo",
        "No mic? Use the two-player route and send Piccalito a voice note."
      ]} solvedNote="📣 Voice verified. The neighbours have also verified it.">
        <Story>One last security check. The bodima door only opens for the real Chutyymiii. Shout your legendary word into the microphone: <strong>&quot;appuchchooooo!&quot;</strong></Story>
        <ShoutMeter lockId="c5-shout" />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= CHAPTER 6 ======================= */
export function Chapter6({ onNext }: P) {
  const { solve, update } = useGame();
  return (
    <ChapterShell
      n={6}
      onNext={onNext}
      intro={
        <>
          <Story>
            Not every chapter is a date. Some are hard days. We built <ExtLink href="https://www.retexia.com/">retexia.com</ExtLink> together, and finding clients and
            building their systems is tough. Some days it feels like nothing is moving. <HiddenKiss id="k6" />
          </Story>
          <Story>But we&apos;re co-founders. And co-founders don&apos;t quit on each other.</Story>
        </>
      }
      reward={
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Photo i={79} className="w-full h-40 rounded-xl" />
            <Photo i={55} className="w-full h-40 rounded-xl" />
          </div>
          <div className="rounded-2xl bg-slate-950/70 border border-emerald-400/30 p-4 text-sm text-slate-200 leading-relaxed space-y-2">
            <p>My Chutyymiii — I know the clients are slow and some days feel heavy. But look at what we&apos;ve already built: a real company, a real website, real products, from nothing but the two of us.</p>
            <p>I&apos;m going to become the best businessman I can be before I meet your dad — and I want you next to me while I do it. Every client we win, we win together.</p>
            <p className="text-emerald-200">Keep going with me. The hard part is the part that makes the story good. — P.</p>
          </div>
        </div>
      }
    >
      <Lock id="c6-recon" index={0} title="Field Recon" hints={[
        "Open retexia.com and look at the Products menu.",
        "There are two products: one for WhatsApp, one for social media.",
        "Retexia Lingo."
      ]} solvedNote="💬 Retexia Lingo — our WhatsApp product. Ours.">
        <Story>
          Visit our HQ: <ExtLink href="https://www.retexia.com/">retexia.com</ExtLink>. One of our products makes a business&apos;s WhatsApp answer customers in seconds. What is that
          product called?
        </Story>
        <AnswerBox lockId="c6-recon" placeholder="Product name…" successMsg="💬 Correct, co-founder!" />
      </Lock>

      <Lock id="c6-terminal" index={1} title="Deploy the System" hints={[
        "Type help. Then ls. Then cat README.md.",
        "Some files are hidden. Hackers use `ls -a` — then `cat .env`.",
        "retexia backwards is aixeter → type: deploy aixeter"
      ]} solvedNote="🚀 Deployed. Clients signed. We're unstoppable.">
        <Story>Our servers refuse to deploy the new client system. You&apos;re the only co-founder awake (it&apos;s past noon, so you&apos;re finally up). Hack in and deploy it.</Story>
        <Terminal onSolve={() => solve("c6-terminal", "🚀 System deployed!")} />
      </Lock>

      <Lock id="c6-contract" index={2} title="The Co-Founder Pact" hints={[]} solvedNote="✍️ Signed. Legally binding (in Piccalito's heart).">
        <Evidence>
          <div className="text-cyan-200">CO-FOUNDER PACT</div>
          <div>I, Chutyymiii, promise to keep building Retexia with Piccalito through the slow months, the hard clients and the long nights.</div>
          <div>We win together. We learn together. We go to Canada together.</div>
          <div className="text-teal-300">— No matter what.</div>
        </Evidence>
        <SignaturePad
          onSave={(sig) => {
            update({ signature: sig });
            solve("c6-contract", "✍️ Pact signed. Piccalito can see it in HQ 😌");
          }}
        />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= CHAPTER 7 ======================= */
export function Chapter7({ onNext }: P) {
  const { solve } = useGame();
  return (
    <ChapterShell
      n={7}
      onNext={onNext}
      intro={
        <Story>
          Deep inside Piccalito&apos;s Google Drive sits a classified archive: 98 photos of us. Hands, mirror selfies, pizza, library kisses, a suspicious number of
          kittens. The archive is guarded. Prove you remember. <HiddenKiss id="k7" />
        </Story>
      }
      reward={
        <div className="grid grid-cols-3 gap-2">
          <Photo i={72} className="w-full h-40 rounded-xl" />
          <Photo i={71} className="w-full h-40 rounded-xl" />
          <Photo i={67} className="w-full h-40 rounded-xl" />
        </div>
      }
    >
      <Lock id="c7-match" index={0} title="Memory Match" hints={["Flip systematically, row by row, and remember what you saw.", "Say the photos out loud as you flip them — it really helps."]} solvedNote="🧠 Every pair matched.">
        <MemoryMatch photos={[3, 12, 23, 33, 59, 67, 89, 92]} onSolve={() => solve("c7-match", "🧠 Perfect memory!")} />
      </Lock>

      <Lock id="c7-timeline" index={1} title="The Corrupted Timeline" hints={[
        "The Dehiwala Zoo photo is the oldest (June).",
        "The camcorder hug is stamped Jul 13. The library is from August.",
        "Oldest → newest: zoo sign → camcorder hug → mall mirror → library → hands-on-face."
      ]} solvedNote="⏳ Timeline restored.">
        <Story>Five memories got shuffled. Tap them in order — <strong>oldest first</strong>.</Story>
        <Timeline photos={[32, 92, 12, 64, 97]} onSolve={() => solve("c7-timeline", "⏳ Timeline restored!")} />
      </Lock>

      <Lock id="c7-slide" index={2} title="The Shredded Photo" hints={[
        "Solve the top row first, then the left column, then the rest.",
        "Turn on tile numbers if you get stuck.",
        "Target: 1 2 3 / 4 5 6 / 7 8 _ — patience, agent."
      ]} solvedNote="🧩 Photo restored.">
        <Story>Someone shredded one of our photos. Slide the pieces back together.</Story>
        <SlidingPuzzle photo={67} onSolve={() => solve("c7-slide", "🧩 Photo restored!")} />
      </Lock>

      <Lock id="c7-toll" index={3} twoPlayer title="The Archive Toll" hints={["This one is two-player.", "Send Piccalito a new selfie of you two (or a video-call screenshot)."]} solvedNote="📸 Toll paid. New memory added to the archive.">
        <Story>
          The archive guard demands a toll before releasing the last file: <strong>one brand-new selfie of the two of you</strong> (a video-call screenshot counts). Send it
          to Piccalito — he&apos;ll send you the code.
        </Story>
        <TwoPlayerCode lockId="c7-toll" />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= CHAPTER 8 ======================= */
export function Chapter8({ onNext }: P) {
  const { solve } = useGame();
  const tags = CHAPTERS.slice(0, 7).map((c) => c.fragment);
  return (
    <ChapterShell
      n={8}
      onNext={onNext}
      intro={
        <>
          <Story>
            The dream: Canada. Stable money, a quiet place, a peaceful life — together. You can sleep until 11:30 AM every single day there; Piccalito has already agreed to
            this in writing.
          </Story>
          <Story>Three final locks between you and the boarding gate.</Story>
        </>
      }
      reward={<Finale />}
    >
      <Lock id="c8-tags" index={0} title="Luggage Tags" hints={[
        "You earned a tag at the end of every chapter: NO, MA, TT, ER, W, HA, T.",
        "It's three words. Our promise.",
        "NO · MA · TT · ER · W · HA · T"
      ]} solvedNote="🧳 NO MATTER WHAT. Bags checked in.">
        <Story>At the check-in counter, your seven luggage tags must spell our sacred term.</Story>
        <TileArrange lockId="c8-tags" tiles={tags} seed={8} successMsg="🧳 NO MATTER WHAT ❤️" />
      </Lock>

      <Lock id="c8-flight" index={1} title="Find Our Gate" hints={[
        "Canada's busiest airport is in Toronto.",
        "Search for: Toronto Pearson airport code.",
        "YYZ ✈️"
      ]} solvedNote={<>✈️ CMB → YYZ. <ExtLink href="https://www.google.com/travel/flights?q=Flights%20from%20CMB%20to%20YYZ">Peek at our future flight</ExtLink></>}>
        <Story>
          Our first landing: Canada&apos;s busiest airport. Every Canadian airport code starts with a <strong>Y</strong>. Find ours — you&apos;re allowed to{" "}
          <ExtLink href="https://www.google.com/">search the web</ExtLink>.
        </Story>
        <AnswerBox lockId="c8-flight" placeholder="3-letter airport code" successMsg="✈️ Gate found!" />
      </Lock>

      <Lock id="c8-final" index={2} twoPlayer title="The Last Vault" hints={["This is the final two-player lock.", "Ask Piccalito to show you the ring. 💍"]} solvedNote="💍 The ring was safe all along. Just like you are with him.">
        <Story>
          The last vault needs a key Piccalito has kept hidden ever since One Galle Face. Ask him to <strong>show you the ring</strong>. 💍 The code is his to give.
        </Story>
        <TwoPlayerCode lockId="c8-final" label="The ring's code" />
      </Lock>
    </ChapterShell>
  );
}

/* ======================= FINALE ======================= */
const COUPONS = [
  "😴 One morning of sleeping until noon, zero complaints from Piccalito",
  "🍕 One Domino's date (getting lost afterwards optional)",
  "🛺 One tuk-tuk ride with exactly 5 kisses",
  "💐 One surprise bouquet + chocolates, first-date style",
  "🤚 One hand kiss, any time, any place (shyness guaranteed)"
];
const BONUS = ["🎬 One movie night where SHE picks", "🫂 One unlimited hug, redeemable instantly", "📚 One library date — actual reading not required"];

function Finale() {
  const { state } = useGame();
  const [notes, setNotes] = useState<{ sender: string; message: string }[]>([]);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const allKisses = state.kisses.length >= HIDDEN_KISSES.length;
  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("love_notes")
      .select("sender,message")
      .order("created_at", { ascending: false })
      .then(({ data }) => data && setNotes(data));
  }, [sent]);
  const send = async () => {
    if (!text.trim()) return;
    const n = { sender: "Chutyymiii", message: text.trim() };
    setNotes([n, ...notes]);
    setText("");
    if (supabase) await supabase.from("love_notes").insert(n);
    setSent(true);
  };
  const played = state.startedAt ? (state.finishedAt || Date.now()) - state.startedAt : 0;
  return (
    <div className="space-y-5">
      <div className="rounded-3xl overflow-hidden border-2 border-cyan-300/60 bg-gradient-to-br from-cyan-100 to-teal-100 text-slate-900">
        <div className="px-5 py-3 bg-slate-900 text-cyan-200 flex justify-between items-center font-mono text-xs">
          <span>✈️ BOARDING PASS · NO MATTER WHAT AIRLINES</span>
          <span>🍁</span>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div><div className="text-slate-500">PASSENGERS</div><div className="font-black text-sm">CHUTYYMIII &amp; PICCALITO</div></div>
          <div><div className="text-slate-500">FROM → TO</div><div className="font-black text-2xl">CMB → YYZ</div></div>
          <div><div className="text-slate-500">SEAT</div><div className="font-black text-sm">3 &amp; 4 (next to each other, like the first time)</div></div>
          <div><div className="text-slate-500">BOARDING</div><div className="font-black text-sm">11:30 AM (obviously)</div></div>
        </div>
      </div>

      <div className="rounded-3xl bg-slate-950/70 border border-teal-400/40 p-5 sm:p-6 space-y-3 text-sm leading-relaxed text-slate-200">
        <h3 className="text-2xl font-black text-white">Happy Anniversary, my Chutyymiii 💖</h3>
        <p>
          You did it. You woke up (eventually), decoded my nervous first-date flowers and chocolates, sat next to me all the way to Dehiwala again, chased your stolen
          ring through One Galle Face, blushed at Diyatha Pokuna, got lost after Domino&apos;s with me one more time, deployed Retexia and signed our pact.
        </p>
        <p>
          We&apos;ve had beautiful days and hard ones, and we&apos;re still in some hard ones right now. But every chapter of this game is real, and every one of them
          happened because you chose me. I&apos;m going to keep building, keep fighting for our clients and our future, and become someone your dad is proud to meet.
        </p>
        <p>
          One day we&apos;ll be in Canada — stable, peaceful, together — and you&apos;ll still be asleep at 11 AM while I make breakfast. Above everything: I love you so
          much. <strong className="text-teal-300">No matter what.</strong>
        </p>
        <p className="text-teal-300">— Forever yours, Piccalito 💍 (yes, I still have your ring)</p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
          <div className="text-2xl font-black text-white">{formatDuration(played)}</div>
          <div className="text-[10px] font-mono text-slate-400">mission time</div>
        </div>
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
          <div className="text-2xl font-black text-teal-300">{kissesOwed(state)}</div>
          <div className="text-[10px] font-mono text-slate-400">kisses owed (hints)</div>
        </div>
        <div className="rounded-2xl bg-slate-950/70 border border-slate-800 p-3">
          <div className="text-2xl font-black text-cyan-300">{state.kisses.length}/{HIDDEN_KISSES.length}</div>
          <div className="text-[10px] font-mono text-slate-400">hidden kisses found</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase text-cyan-300">🎟️ Redeemable in real life — show Piccalito</h4>
        <div className="grid sm:grid-cols-2 gap-2">
          {[...COUPONS, ...(allKisses ? BONUS : [])].map((c) => (
            <div key={c} className="rounded-xl border-2 border-dashed border-teal-400/50 bg-teal-950/30 px-3 py-2.5 text-sm text-teal-100">{c}</div>
          ))}
        </div>
        {!allKisses && (
          <p className="text-[11px] text-slate-500">
            🔍 {HIDDEN_KISSES.length - state.kisses.length} hidden 💋 are still somewhere in the mission (tiny, faint, hiding in the stories). Find all of them to unlock 3 bonus coupons.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-mono uppercase text-teal-300">💌 Write back to Piccalito</h4>
        <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Your anniversary note…" className="w-full rounded-xl bg-slate-950 border border-slate-700 p-3 text-sm text-white" />
        <button onClick={send} className="px-5 py-2.5 rounded-xl bg-teal-500 text-slate-950 font-bold text-sm">Send love note 💖</button>
        {notes.map((n, i) => (
          <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-teal-400/20 text-sm">
            <strong className="text-teal-300">{n.sender}:</strong> <span className="text-slate-200">{n.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const CHAPTER_COMPONENTS = [Chapter1, Chapter2, Chapter3, Chapter4, Chapter5, Chapter6, Chapter7, Chapter8];
