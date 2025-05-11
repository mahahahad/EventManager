import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Plus_Jakarta_Sans } from 'next/font/google'; // Import Plus Jakarta Sans
import "./globals.css";
import NotificationHandler from "@/components/NotificationHandler";

const plusJakartaSans = Plus_Jakarta_Sans({ // Use Plus Jakarta Sans
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "42EventManager",
  description: "42 Event Managing Application. Built by Mahad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`} // Apply Plus Jakarta Sans
      >
        <NotificationHandler />
        {children}
      </body>
    </html>
  );
}
