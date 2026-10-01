import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import SmoothScroll from "@/components/SmoothScroll";

// Geist stays the body default so the existing hero's inherited font is unchanged.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Body face for the section system (`font-body`).
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

// Display face (`font-display`), replacing the SF Pro system stack 2026-07-30.
// Self-hosted from Assets/Impact.ttf — commercially licensed; webfont-license
// coverage confirmed with the user before wiring this in. Single static
// weight, so no bold variant exists to select — the old forced 700 override
// on .font-display is dropped in globals.css to avoid the browser
// faux-bolding an already-heavy face.
const impact = localFont({
  src: "./fonts/Impact.ttf",
  variable: "--font-impact",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TNT Crane & Rigging — Crane Rental, Rigging & Lift Engineering",
  description:
    "Crane rental, specialty rigging, and lift engineering unified across North America. Find equipment by capacity, locate your nearest branch, and request a lift plan.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${impact.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {/* Inertial smooth scroll + single GSAP rAF loop for all scroll motion */}
        <SmoothScroll />
        {/* Fixed nav + shared footer wrap every route */}
        <SiteNav />
        {/* The nav is fixed, so it overlays page content. Inner routes used to
            clear it only by accident — their first section's `py-20` happened
            to exceed the old 102px chrome. Raising the bar to 122px put the
            first eyebrow 10px UNDER it. This reserves the space explicitly.
            The homepage cancels it (see page.tsx) because its hero is meant to
            run full-bleed beneath the bar. */}
        <main className="pt-[var(--chrome-h)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
