import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CareLink — Intelligent Hospital Queue Management",
  description:
    "Smart hospital appointment booking and priority queue management system. Reduce wait times, prioritize emergencies, and streamline patient flow with CareLink.",
  keywords: [
    "hospital",
    "appointment",
    "booking",
    "queue management",
    "priority",
    "healthcare",
    "triage",
    "emergency",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
