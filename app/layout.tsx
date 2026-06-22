import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Script from "next/script";


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
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
     <body className="min-h-full flex flex-col">

 <Script id="chaport-chat" strategy="afterInteractive">
  {`
    (function(w,d,v3){
      w.chaportConfig = {
        appId: '6a390ff1a2cd2e39938a1ec3',

        launcher: {
          show: false
        }
      };

      if(w.chaport)return;
        v3=w.chaport={};
        v3._q=[];
        v3._l={};
        v3.q=function(){v3._q.push(arguments)};
        v3.on=function(e,fn){
          if(!v3._l[e])v3._l[e]=[];
          v3._l[e].push(fn)
        };

        var s=d.createElement('script');
        s.type='text/javascript';
        s.async=true;
        s.src='https://app.chaport.com/javascripts/insert.js';

        var ss=d.getElementsByTagName('script')[0];
        ss.parentNode.insertBefore(s,ss);
      })(window, document);
    `}
  </Script>

  {children}

</body>
 </html>
  );
}