import type { Metadata } from "next";
import { Fraunces, Manrope, Zen_Dots } from "next/font/google";

import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["600", "700"]
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope"
});

const zenDots = Zen_Dots({
  subsets: ["latin"],
  variable: "--font-zen-dots",
  weight: "400"
});

export const metadata: Metadata = {
  title: "EFindr",
  description: "AI event photo finder for private galleries and attendee selfie search."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${zenDots.variable}`}>
      <body className="font-[family-name:var(--font-manrope)]">{children}</body>
    </html>
  );
}

