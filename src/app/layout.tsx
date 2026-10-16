import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Operation: No Matter What — Chutyymiii & Piccalito Anniversary Quest",
  description: "A mysterious, funny virtual anniversary date & escape-room adventure from Colombo to Canada."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-pink-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
