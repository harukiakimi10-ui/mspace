import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import LanguageManifest from "./LanguageManifest";

import Script from "next/script";
import ServiceWorkerRegister from "./ServiceWorkerRegister";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MSpace",
  description: "MSpace Social Platform",
    icons: {
    icon: "/mspace-favicon.png",
    apple: "/mspace-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
  lang="en"
  suppressHydrationWarning
  className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
>
  <body className="min-h-full flex flex-col">
 
  <LanguageManifest />
<ServiceWorkerRegister />
  {children}

</body>
 </html>
  );
}