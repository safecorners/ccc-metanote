import type { Metadata } from "next";
import { pretendard } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MetaNote",
    template: "%s | MetaNote",
  },
  description:
    "왜 틀렸는지 아는 것이 진짜 공부 — 오답의 원인을 태그로 기록하고 나의 실수 패턴을 발견하는 메타인지 오답노트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas-soft font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
