# 🎛️ Game Master Guide — for Piccalito only

**Don't send her this file.** It isn't deployed (only `public/` is served), but it's in the repo.

## Your secret control room

Open **`/piccalito-hq`** on the deployed site (e.g. `https://your-site.vercel.app/piccalito-hq`).
PIN: `ring-thief-1130` (change it with the `NEXT_PUBLIC_GM_PIN` env var in Vercel).

Her login passcode: `1130` (change it with `NEXT_PUBLIC_HER_PASSCODE`). Text it to her with the link.

With Supabase connected you can:
- 💬 Chat with her live (the hotline). Use 🔒 for secret messages.
- 👀 Watch her progress live: the current lock, hints used, time played, and her signed co-founder pact.
- 🔓 Remote-unlock any two-player lock, e.g. while you're on a video call.

## Two-player locks (she CANNOT solve these alone)

| Lock | When to give the code | Code |
|---|---|---|
| Ch 3 · An Empty Safe | She calls you and demands her ring back with a cute "please" | **1855** |
| Ch 5 · Voice Verification | Only if her mic doesn't work: she sends a voice note shouting "appuchchooooo" | **2019** |
| Ch 7 · The Archive Toll | She sends you a brand-new selfie of you two (or a video-call screenshot) | **7709** |
| Ch 8 · The Last Vault | You **show her the ring** you stole at One Galle Face 💍 | **9401** |

(The HQ page always shows the current codes, so read them from there.)

## Answer key

| Lock | Answer |
|---|---|
| 1.1 Runaway Snooze | Keep chasing/tapping it. After 9 escapes it gets tired |
| 1.2 Wake-up clock | 11:30 (hour halfway 11–12, minute hand on 5 kisses + 1 = 6) |
| 1.3 Suspect | sleep |
| 2.1 Cipher | Shift 3 (3 friends) → "WHAT DID I BRING YOU ON OUR FIRST DATE" → flowers and chocolates |
| 2.2 Seating | Daham, Sewmini, Chutyymiii, Piccalito, Hasitha |
| 2.3 GPS | Dehiwala |
| 3.1 Lockers | Random each time; follow the hot/cold emojis (7 tries) |
| 3.2 Safe | Random Mastermind code |
| 3.3 | 🤝 two-player |
| 4.1 Dress code | FORMAL |
| 4.2 Shyness meter | Timing game, 5 hits in a row |
| 4.3 Lantern | BLUSH (Morse) |
| 5.1 Library | Sort books by call number → first letters spell DOMINO |
| 5.2 Maze | Collect 5 💋 at dead ends, then reach 🏠 (the farthest point) |
| 5.3 Shout | Mic loud for 2 seconds, or 🤝 fallback |
| 6.1 Recon | Lingo (from retexia.com → Products) |
| 6.2 Terminal | `ls -a` → `cat .env` → `deploy aixeter` |
| 6.3 Pact | Sign it |
| 7.1 Memory match | Card game |
| 7.2 Timeline | Zoo sign → camcorder hug → mall mirror (pink dress) → library → hands on face |
| 7.3 Sliding puzzle | 3×3 |
| 7.4 | 🤝 two-player |
| 8.1 Luggage tags | NO · MA · TT · ER · W · HA · T |
| 8.2 Airport | YYZ |
| 8.3 | 🤝 two-player (show her the ring) |

## How it stays long and hard

- Hints are **time-locked**: hint 1 unlocks after 3 minutes on a lock, hint 2 after 8, hint 3 after 15.
- Every hint costs **1 real kiss** owed to you. The counter is shown in her header and on the finale.
- **8 hidden 💋** are scattered in the story text (faint, tiny). Finding all 8 unlocks 3 bonus real-life coupons at the end.

## Testing tips

- Add `?reset=1` to the URL to wipe progress on that device. **Remove it before sending her the link.**
- Progress saves in her browser and to Supabase (if configured), so she can close the tab and continue later.
