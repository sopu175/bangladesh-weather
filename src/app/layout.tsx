import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
});

export const metadata: Metadata = {
  title: "BD Mausam — Weather Forecast for Bangladesh",
  description:
    "Live weather and 7-day forecasts for all 64 districts of Bangladesh, with GPS location detection and AI-powered weather briefings.",
  keywords: [
    "Bangladesh weather",
    "Dhaka weather",
    "BD Mausam",
    "weather forecast Bangladesh",
    "আবহাওয়া",
  ],
  authors: [{ name: "BD Mausam" }],
  openGraph: {
    title: "BD Mausam — Weather Forecast for Bangladesh",
    description:
      "Live weather and 7-day forecasts for all 64 districts of Bangladesh.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#006A4E",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoBengali.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
