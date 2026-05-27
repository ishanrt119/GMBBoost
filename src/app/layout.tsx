import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/providers/SessionProvider";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "GMBBoost AI | AI-Powered Google Business Growth Platform",
  description: "Automate your Google Business Profile, generate more reviews, convert leads instantly, and grow local visibility using AI.",
  keywords: ["Google Business Profile", "Local SEO", "AI Marketing", "WhatsApp Automation", "Business Growth"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} ${inter.className} antialiased bg-[#030014]`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
