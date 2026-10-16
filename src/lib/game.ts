export interface Song {
  id: string;
  title: string;
}

export interface Chapter {
  n: number;
  title: string;
  place: string;
  locks: string[];
  fragment: string;
  photo: number;
  song: Song;
}

export const CHAPTERS: Chapter[] = [
  {
    n: 1,
    title: "Operation Snooze",
    place: "Her bed · somewhere between 11 AM and 12 PM",
    locks: ["c1-alarm", "c1-clock", "c1-dream"],
    fragment: "NO",
    photo: 60,
    song: { id: "pIgZ7gMze7A", title: "Wham! — Wake Me Up Before You Go-Go" }
  },
  {
    n: 2,
    title: "The Port City Dossier",
    place: "Port City Colombo → Dehiwala",
    locks: ["c2-gifts", "c2-seats", "c2-map"],
    fragment: "MA",
    photo: 88,
    song: { id: "2Vv-BfVoq4g", title: "Ed Sheeran — Perfect" }
  },
  {
    n: 3,
    title: "The One Galle Face Heist",
    place: "One Galle Face · the day a ring went missing",
    locks: ["c3-lockers", "c3-safe", "c3-confess"],
    fragment: "TT",
    photo: 89,
    song: { id: "4m1EFMoRFvY", title: "Beyoncé — Single Ladies (Put a Ring on It)" }
  },
  {
    n: 4,
    title: "The Formal Affair",
    place: "Diyatha Pokuna · formal clothes required",
    locks: ["c4-dress", "c4-shy", "c4-morse"],
    fragment: "ER",
    photo: 97,
    song: { id: "vGJTaP6anOU", title: "Elvis Presley — Can't Help Falling In Love" }
  },
  {
    n: 5,
    title: "Lost After Domino's",
    place: "Colombo Public Library → Domino's → ??? → the bodima",
    locks: ["c5-shelf", "c5-maze", "c5-shout"],
    fragment: "W",
    photo: 65,
    song: { id: "RUz1pZ_LujU", title: "Dean Martin — That's Amore" }
  },
  {
    n: 6,
    title: "Retexia HQ: The Hard Days",
    place: "retexia.com · where two co-founders never give up",
    locks: ["c6-recon", "c6-terminal", "c6-contract"],
    fragment: "HA",
    photo: 78,
    song: { id: "mk48xRzuNvA", title: "The Script — Hall of Fame" }
  },
  {
    n: 7,
    title: "The Memory Archive",
    place: "Piccalito's Google Drive · 98 classified photos",
    locks: ["c7-match", "c7-timeline", "c7-slide", "c7-toll"],
    fragment: "T",
    photo: 33,
    song: { id: "rtOvBOTyX00", title: "Christina Perri — A Thousand Years" }
  },
  {
    n: 8,
    title: "Destination Canada",
    place: "CMB ✈ somewhere cold, peaceful and ours",
    locks: ["c8-tags", "c8-flight", "c8-final"],
    fragment: "",
    photo: 92,
    song: { id: "7eul_Vt6SZY", title: "Boyzone — No Matter What" }
  }
];

export const ALL_LOCKS = CHAPTERS.flatMap((c) => c.locks);

/** Locks that can only be opened with a code from Piccalito (or a remote unlock). */
export const TWO_PLAYER_LOCKS: Record<string, string> = {
  "c3-confess": "Chutyymiii calls you and asks for her ring back (cutest 'please' required)",
  "c5-shout": "Fallback only: she sends you a voice note shouting 'appuchchooooo'",
  "c7-toll": "She sends you a new selfie of you two (or a video-call screenshot)",
  "c8-final": "You show her the ring you stole at One Galle Face"
};

export const HIDDEN_KISSES = ["k-boot", "k1", "k2", "k3", "k4", "k5", "k6", "k7"];

/** Minutes after a lock is opened before each hint can be revealed. */
export const HINT_DELAYS = [3, 8, 15];

export const PLAYER = "chutyymiii";
/** Codes for the two-player locks; shown only in Piccalito's HQ. */
const GM_CODES: Record<string, string> = {
  "c3-confess": "2720",
  "c5-shout": "0831",
  "c7-toll": "1206",
  "c8-final": "0516"
};

export function gmCode(lockId: string): string {
  return GM_CODES[lockId] ?? "";
}

export interface GameState {
  booted: boolean;
  solved: string[];
  hints: Record<string, number>;
  openedAt: Record<string, number>;
  kisses: string[];
  startedAt: number | null;
  finishedAt: number | null;
  lastMsgId: number;
  signature: string | null;
  updatedAt: number;
}

export const EMPTY_STATE: GameState = {
  booted: false,
  solved: [],
  hints: {},
  openedAt: {},
  kisses: [],
  startedAt: null,
  finishedAt: null,
  lastMsgId: 0,
  signature: null,
  updatedAt: 0
};

export function chapterDone(state: GameState, n: number) {
  return CHAPTERS[n - 1].locks.every((l) => state.solved.includes(l));
}

export function chapterUnlocked(state: GameState, n: number) {
  return n === 1 || chapterDone(state, n - 1);
}

export function kissesOwed(state: GameState) {
  return Object.values(state.hints).reduce((a, b) => a + b, 0);
}

export function formatDuration(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
