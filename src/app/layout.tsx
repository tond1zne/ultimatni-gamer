import type { Metadata } from "next";
import { Anton, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const body = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Ultimate Streamer Challenge",
  description: "Vyzvy ve hrach i v realnem zivote. Splni, nahraj dukaz, sbiraj body.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <body className={`${display.variable} ${body.variable} ${mono.variable} font-body bg-paper text-ink`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">{children}</main>
        <footer className="border-t-[3px] border-ink mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-mono text-xs text-steel flex flex-col sm:flex-row justify-between gap-2">
            <span>ULTIMATE STREAMER CHALLENGE © {new Date().getFullYear()}</span>
            <span>Body se uzaviraji kazdy tyden. Hraj, dokazuj, stoupej v zebricku.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
