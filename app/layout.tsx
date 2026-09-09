import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LoreCue · 叙事创作与带团工作台",
    template: "%s · LoreCue",
  },
  description: "面向创作与跑团主持人的叙事知识库和临场咨询助手。",
  openGraph: {
    title: "LoreCue · 叙事创作与带团工作台",
    description: "分清原文、推断与临场新编，让口胡变成可追踪的历史。",
    images: [{ url: "/og.png", width: 1728, height: 907, alt: "港口旧案的剧本、地图与线索档案" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LoreCue · 叙事创作与带团工作台",
    description: "分清原文、推断与临场新编，让口胡变成可追踪的历史。",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
