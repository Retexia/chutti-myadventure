# Operation: No Matter What 🕵️‍♀️💍🍁

An anniversary puzzle hunt for **Chutyymiii**, from her handler **Piccalito**. Next.js 14 + optional Supabase, built to deploy on Vercel.

8 chapters · 25 locks · 4 two-player locks she can't solve without you · 8 hidden kisses · 98 Drive photos.

| Chapter | What she does |
|---|---|
| 1 · Operation Snooze | Catch a runaway snooze button, set an analog clock from a riddle, name the thing she loves more than you |
| 2 · The Port City Dossier | Decode a Caesar cipher, solve a seating-logic puzzle, find Dehiwala from GPS coordinates on Google Maps |
| 3 · The One Galle Face Heist | Hot/cold locker hunt, crack a Mastermind safe, then **call you** to get her ring back |
| 4 · The Formal Affair | Spell the dress code, a hand-kiss timing game, decode a Morse lantern across the pond |
| 5 · Lost After Domino's | Library call-number riddle, a **foggy tuk-tuk maze** collecting 5 kisses, shout "appuchchooooo" into the mic |
| 6 · Retexia HQ | Recon on retexia.com, hack a terminal to deploy, sign the co-founder pact |
| 7 · The Memory Archive | Photo memory match, timeline ordering, sliding photo puzzle, a selfie toll |
| 8 · Destination Canada | Assemble the luggage tags into the promise, find the airport code, **you show her the ring** |

Every chapter ends with a song (YouTube), photos and a luggage tag. The finale has a boarding pass, a letter, real-life kiss coupons and a love-note reply box.

**The answer key and two-player codes are in [GAME_MASTER.md](GAME_MASTER.md). Your live control room is at `/piccalito-hq`.**

## Login and the private hotline 💬

- **Her login:** codename `chutyymiii` → handler `piccalito` → the secret passcode you text her (`NEXT_PUBLIC_HER_PASSCODE`, default `1130`).
- **Your login:** `/piccalito-hq` with your PIN (`NEXT_PUBLIC_GM_PIN`, default `ring-thief-1130`).
- **Chat:** she has a floating 💬 hotline on every chapter, and you have the same chat in your HQ. It includes online status, a typing indicator, messages that "decrypt" as they arrive, 🔒 secret messages that stay hidden until tapped, quick stickers ("appuchchooooo", "bhhhhh", "suttee"…), big emoji, flying hearts, and a 📍 tag showing which chapter she was on.
- When she clears a chapter, a pre-written message from you lands in the chat (edit them in `src/lib/chat.ts` → `AUTO_MESSAGES`). Only you see the 🤖 label on these.
- The login is a fun lock, not bank-grade security: the passcodes ship in the page's JavaScript, so a determined developer could find them.
- Chat needs Supabase (run the updated `supabase/schema.sql`).

## Photos

The photos load straight from the public Google Drive folder as small resized images (~150 KB each). Nothing is stored in the repo or in Supabase. Keep the folder shared as **Anyone with the link → Viewer**. Supabase only stores links that are added through the Memory Vault.

## Deploy (about 5 minutes)

1. **Supabase (optional, but needed for your live HQ):** create a project at supabase.com → SQL Editor → paste `supabase/schema.sql` → Run. Copy the Project URL and the anon key from Project Settings → API.
2. **Vercel:** push this folder to GitHub → import it in Vercel (framework: Next.js, no settings to change).
3. In Vercel → Settings → Environment Variables, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_HER_PASSCODE` (her login passcode, default `1130`)
   - `NEXT_PUBLIC_GM_PIN` (your HQ PIN, default `ring-thief-1130`)
4. Deploy. Text her the main URL **and her passcode**. Keep `/piccalito-hq` open on your phone to chat.

Without Supabase the whole game still works (progress saves in her browser, and the two-player codes still work). You just won't get the live view, live messages or remote unlocks.

## Local dev

```bash
npm install
```

```bash
npm run dev
```
