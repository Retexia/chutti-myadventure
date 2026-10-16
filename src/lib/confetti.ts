export function confetti(durationMs = 2500, emojis = ["🩵", "💋", "🍁", "✨", "💍"], count = 90) {
  if (typeof document === "undefined") return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const g = canvas.getContext("2d")!;
  const parts = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * 0.5,
    vy: 2 + Math.random() * 4,
    vx: -1.5 + Math.random() * 3,
    r: Math.random() * Math.PI,
    vr: -0.1 + Math.random() * 0.2,
    s: 16 + Math.random() * 16,
    e: emojis[Math.floor(Math.random() * emojis.length)]
  }));
  const start = performance.now();
  const frame = (t: number) => {
    g.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.font = `${p.s}px serif`;
      g.fillText(p.e, 0, 0);
      g.restore();
    }
    if (t - start < durationMs) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
