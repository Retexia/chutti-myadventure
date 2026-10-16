// Answers are base64-encoded so a peek at the page source doesn't spoil them.
// The plain-text answer key lives in GAME_MASTER.md (not deployed).

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "");

const dec = (b: string) => (typeof atob === "function" ? atob(b) : Buffer.from(b, "base64").toString());

const eq = (...enc: string[]) => (input: string) => enc.some((e) => norm(input) === dec(e));
const starts = (...enc: string[]) => (input: string) => enc.some((e) => norm(input).startsWith(dec(e)));
const has = (input: string, enc: string) => norm(input).includes(dec(enc));

export const CHECK: Record<string, (input: string) => boolean> = {
  "c1-dream": eq("c2xlZXA=", "c2xlZXBpbmc=", "bXlzbGVlcA==", "c2xlZXBz"),
  "c2-gifts": (s) => (has(s, "Zmxvd2Vy") || has(s, "cm9zZQ==")) && has(s, "Y2hvYw=="),
  "c2-map": starts("ZGVoaXc=", "ZGVoaXdl"),
  "c4-dress": eq("Zm9ybWFs"),
  "c4-morse": eq("bWFuaWth"),
  "c5-shelf": starts("ZG9taW5v"),
  "c6-recon": (s) => norm(s).endsWith(dec("bGluZ28=")),
  "c6-terminal": eq("YWl4ZXRlcg=="),
  "c8-tags": eq("bm9tYXR0ZXJ3aGF0"),
  "c8-flight": eq("eXl6")
};

export const isChutyymiii = (s: string) => /^chut+y*m+i+$/.test(norm(s));
export const isPiccalito = (s: string) => /^pic+al+it+o$/.test(norm(s));

const WRONG = [
  "❌ Nope. Piccalito is laughing somewhere.",
  "❌ Wrong! The lock just yawned at you.",
  "❌ Incorrect. Even your 11:30 AM self knows better.",
  "❌ Access denied. Try again, agent.",
  "❌ Close? Maybe. Correct? No.",
  "❌ The vault says: 'bhhhhh' 🙄",
  "❌ Suttee! Wrong answer."
];

export const wrongLine = () => WRONG[Math.floor(Math.random() * WRONG.length)];

/** Her login passcode — Piccalito texts it to her with the link. Set NEXT_PUBLIC_HER_PASSCODE in Vercel. */
export const HER_PASSCODE = process.env.NEXT_PUBLIC_HER_PASSCODE || "1130";
export const isHerPasscode = (s: string) => norm(s) === norm(HER_PASSCODE);
