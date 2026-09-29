import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "BroomBoom Franchise | Partner with India's Leading Mobility & Travel Network",

  description:
    "Join the BroomBoom franchise ecosystem. Choose from 3 high-ROI packages: Silver Kiosk, Gold District Hub, and Platinum Master Franchise. High profit margins, zero tech headache, and exclusive territory rights.",

  keywords: [
    "BroomBoom franchise",
    "cab franchise India",
    "travel franchise business",
    "MakeMyTrip franchise partner",
    "mobility franchise opportunity",
    "car rental business franchise",
    "outstation taxi business",
  ],

  robots: {
    index: false,
    follow: false,
  },

  icons: {
    icon: "/broomboom-logo.png",
    shortcut: "/broomboom-logo.png",
    apple: "/broomboom-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
        >
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),
                  dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-N6D7HH8');
          `}
        </Script>
      </head>

      <body className="antialiased text-slate-900 bg-puja-cream min-h-screen">
        {children}
      </body>
    </html>
  );
}