import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SnapFix | AI Civic Issue Reporting Platform",
  description: "Real-time AI-powered civic issue reporting and municipal routing. Built by Team Theorem X.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.variable} antialiased bg-[#0B0F19] text-slate-100 font-sans selection:bg-[#11d493] selection:text-[#0b0f19] flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-1 bg-[#0B0F19] flex flex-col">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
