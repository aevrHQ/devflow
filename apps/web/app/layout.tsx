import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevFlow - Centralized Webhook Hub",
  description:
    "Turn noisy JSON payloads into structured, actionable Telegram notifications. Built for developers who want clarity, not clutter.",
  metadataBase: new URL("https://devflow.app"), // Replace with actual domain if different
  openGraph: {
    title: "DevFlow - Centralized Webhook Hub",
    description:
      "Turn noisy JSON payloads into structured, actionable Telegram notifications.",
    url: "https://devflow.app",
    siteName: "DevFlow",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevFlow - Centralized Webhook Hub",
    description:
      "Turn noisy JSON payloads into structured, actionable Telegram notifications.",
    creator: "@miracleonyenma", // Assuming based on github username, can be adjusted
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextTopLoader color="#000" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
