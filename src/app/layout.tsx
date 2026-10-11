import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import { getSiteContent } from "@/lib/content";
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
    default: "Muhanad Wael El-Mahdy — Video Editor & Motion Designer",
    template: "%s — Muhanad Wael El-Mahdy",
  },
  description:
    "Portfolio of Muhanad Wael El-Mahdy, video editor and motion designer. Short-form, long-form, commercials, motion graphics, gaming edits and social media content.",
  keywords: [
    "video editor",
    "motion designer",
    "portfolio",
    "video editing",
    "motion graphics",
    "color grading",
    "sound design",
    "Muhanad Wael El-Mahdy",
  ],
  authors: [{ name: "Muhanad Wael El-Mahdy" }],
  openGraph: {
    title: "Muhanad Wael El-Mahdy — Video Editor & Motion Designer",
    description:
      "I transform raw footage into engaging visual stories through editing, motion graphics, sound design, and creative storytelling.",
    url: SITE_URL,
    siteName: "Muhanad Wael El-Mahdy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhanad Wael El-Mahdy — Video Editor & Motion Designer",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

// Seasonal accent: the admin picks a hue (blue/teal/purple/gold/rose) and the
// whole site's brand color shifts subtly — both themes.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const accent = ["blue", "teal", "purple", "gold", "rose"].includes(content["theme.accent"])
    ? content["theme.accent"]
    : "blue";

  return (
    <html lang="en" dir="ltr" className="scroll-smooth" data-accent={accent} suppressHydrationWarning>
      <body className={`${display.variable} ${sans.variable} font-sans bg-ink text-zinc-300 antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('mwm-theme')==='light')document.documentElement.classList.add('light');var L=localStorage.getItem('mwm-lang');if(L==='ar'){document.documentElement.lang='ar';document.documentElement.dir='rtl'}}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  );
}
