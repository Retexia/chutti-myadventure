# Operation: No Matter What — Chutyymiii & Piccalito Anniversary Quest 🕵️‍♀️💖🍁

A custom Next.js 14 (App Router) + Supabase interactive mystery date & escape-room game built for **Chutyymiii & Piccalito's Anniversary**.

## ✨ Features & Chapters Included
1. **Stage 1 — The 11:30 AM Sleeping Beauty Protocol**: Interactive wake-up clock tuner (`11:00 AM – 12:00 PM`) + 5-pillow tap challenge.
2. **Stage 2 — Port City Colombo to Dehiwala**: First date memory lock (Flowers & Chocolates, friends **Daham, Hasitha & Sewmini**, riding from [Port City Colombo](https://www.portcitycolombo.lk/) to **Dehiwala**, and sitting right next to her for the first time).
3. **Stage 3 — One Galle Face Ring Heist**: Hot/Cold vault radar mini-game at [One Galle Face](https://onegalleface.com/) to uncover the **ring** Piccalito stole and still keeps safe.
4. **Stage 4 — Formal Elegance at Diyatha Pokuna**: Formal attire check + interactive "Hand Kiss Shyness Meter" at [Diyatha Uyana](https://www.watersedge.lk/experience/diyatha-uyana/).
5. **Stage 5 — Public Library, Domino's Pizza & The Tuk-Tuk of 5 Kisses**: Lost on the way back to the *bodima* from [Colombo Public Library](https://www.colombo.mc.gov.lk/public-library.php) & Domino's, collecting 5 kisses in a Tuk-Tuk with her iconic words: `"appuchchooooo"`, `"bhhhhh"`, `"suttee"`.
6. **Stage 6 — Co-Founders of Retexia (`retexia.com`)**: Interactive system-builder celebrating [retexia.com](https://www.retexia.com/), encouraging her through tough client/system days, and Piccalito's goal to become the best businessman before meeting her dad.
7. **Stage 7 — Destination Canada (`"No Matter What"`)**: Final cryptographic lock opening Piccalito's anniversary letter, YouTube soundtrack links, Memory Photo Vault, and a real-time Supabase Love Note guestbook.

---

## 🚀 Deploy to Vercel + Supabase in 3 Minutes

### Step 1: Set Up Supabase Database
1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard, paste the contents of `supabase/schema.sql`, and click **Run**.
3. Copy your **Project URL** and **anon public key** from **Project Settings → API**.

### Step 2: Add Your Google Drive Photos
- Photos load straight from the public Google Drive folder (`1YF8_6ULUcxEM2T47EUwC1MJUqe58ceTd`) as small resized images — nothing is downloaded into the repo. Keep the folder shared as **Anyone with the link → Viewer**.
- To add more: copy a photo's Drive share link and add a row to `DRIVE_PHOTOS` in `src/data/memories.ts`, **or** paste the link into the **Memory Vault** modal once deployed (saved to Supabase).

### Step 3: Deploy to Vercel
1. Push this folder to a GitHub repository (or run `npx vercel` inside this directory).
2. In Vercel, add two Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Click **Deploy** — Next.js will build and publish your anniversary adventure automatically!
# chutti-myadventure
