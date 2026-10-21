import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SentryUserTracker } from "./components/SentryUserTracker";
import { PageviewTracker } from "./components/PageviewTracker";
import PlausibleProvider from "next-plausible";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://splendor-client.fly.dev";
const siteTitle = "璀璨宝石 Splendor";
const siteDescription =
  "免费在线玩璀璨宝石（Splendor）：浏览器直接开局，支持联机对战与 AI 对手，无需下载安装。";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "璀璨宝石",
    "Splendor",
    "在线桌游",
    "免费",
    "浏览器游戏",
    "AI 对手",
    "联机对战",
  ],
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    siteName: siteTitle,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <SentryUserTracker />
          <PageviewTracker />
          <PlausibleProvider domain="splendor.uno">
            {children}
          </PlausibleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
