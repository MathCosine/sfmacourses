import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { ScrollProgress } from "@/components/ScrollProgress";
import { FloatingDock } from "@/components/FloatingDock";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "San Francisco Math Academy",
    template: "%s · SFMA",
  },
  description:
    "A free collection of curated, high-quality lessons to take you from the AMC 8 to AP Calculus BC and beyond.",
};

// Applies the saved (or system) theme before paint to avoid a flash.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${jetbrains.variable}`}>
        <ToastProvider>
          <ScrollProgress />
          {children}
          <FloatingDock />
          <KeyboardShortcuts />
        </ToastProvider>
      </body>
    </html>
  );
}
