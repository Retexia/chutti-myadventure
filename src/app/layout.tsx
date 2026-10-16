import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Operation: No Matter What — Chutyymiii & Piccalito",
  description: "A classified anniversary mission from Colombo to Canada."
};

export const viewport: Viewport = {
  themeColor: "#031417"
};

const FLOATS = ["🩵", "✨", "💋", "🩵", "✨", "🍁", "🩵", "✨", "💍", "🩵"];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <div className="aurora" aria-hidden>
          <div className="blob b1" />
          <div className="blob b2" />
          <div className="blob b3" />
          <div className="stars" />
          {FLOATS.map((e, i) => (
            <span key={i} className="float" style={{ left: `${(i * 37 + 7) % 100}%`, animationDuration: `${16 + ((i * 7) % 14)}s`, animationDelay: `${-i * 2.7}s` }}>
              {e}
            </span>
          ))}
        </div>
        {children}
      </body>
    </html>
  );
}
