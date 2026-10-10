import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Muhanad Wael Mahdy — Video Editor & Motion Designer",
    template: "%s — Muhanad Wael Mahdy",
  },
  description:
    "Portfolio of Muhanad Wael Mahdy, video editor and motion designer. Short-form, long-form, commercials, motion graphics, gaming edits and social media content.",
  keywords: [
    "video editor",
    "motion designer",
    "portfolio",
    "video editing",
    "motion graphics",
    "color grading",
    "sound design",
    "Muhanad Wael Mahdy",
  ],
  authors: [{ name: "Muhanad Wael Mahdy" }],
  openGraph: {
    title: "Muhanad Wael Mahdy — Video Editor & Motion Designer",
    description:
      "I transform raw footage into engaging visual stories through editing, motion graphics, sound design, and creative storytelling.",
    url: SITE_URL,
    siteName: "Muhanad Wael Mahdy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhanad Wael Mahdy — Video Editor & Motion Designer",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} font-sans bg-ink text-zinc-300 antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('mwm-theme')==='light')document.documentElement.classList.add('light')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
