let ctx: AudioContext | null = null;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function tone(freq: number, ms: number, delayMs = 0, type: OscillatorType = "sine", vol = 0.15) {
  const a = ac();
  if (!a) return;
  const t0 = a.currentTime + delayMs / 1000;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.01);
  gain.gain.setValueAtTime(vol, t0 + ms / 1000 - 0.01);
  gain.gain.linearRampToValueAtTime(0, t0 + ms / 1000);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + ms / 1000 + 0.02);
}

export const chime = () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 160, i * 110, "triangle"));
export const buzz = () => tone(140, 260, 0, "sawtooth", 0.08);
export const alarmBeep = () => [0, 180, 360].forEach((d) => tone(880, 120, d, "square", 0.06));
