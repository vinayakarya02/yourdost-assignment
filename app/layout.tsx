import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Footer, Header } from "@/components/chrome";
import { SafetySheet } from "@/components/safety";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "YourDOST Wellbeing Compass",
  description: "Not sure where to start? Let's find your next step together. A gentle check-in that guides you to support within YourDOST.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#F7F4EF", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={sans.variable}>
      <body className="atmosphere grain min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-midnight focus:px-4 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Providers>
          <Header />
          <main id="main">{children}</main>
          <Footer />
          <SafetySheet />
        </Providers>
      </body>
    </html>
  );
}
