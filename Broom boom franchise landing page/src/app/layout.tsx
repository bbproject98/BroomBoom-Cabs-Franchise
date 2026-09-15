import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BroomBoom Franchise | Partner with India's Leading Mobility & Travel Network",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased text-slate-900 bg-puja-cream min-h-screen">
        {children}
      </body>
    </html>
  );
}

