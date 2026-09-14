import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Órbita — mapa astral e tarot",
  description: "Seu mapa astral, tarot do dia e horóscopo personalizado, todo dia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700;800&family=Manrope:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
