import type { Metadata, Viewport } from "next";
import { pretendard } from "@/lib/fonts";
import "./globals.css";

const description =
  "왜 틀렸는지 아는 것이 진짜 공부의 시작. 오답의 원인을 태그로 기록하고 나의 실수 패턴을 발견하는 메타인지 오답노트";

export const metadata: Metadata = {
  // Phase 6 배포 시 실제 도메인으로 교체 (P6-7)
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "MetaNote",
    template: "%s | MetaNote",
  },
  description,
  openGraph: {
    title: "MetaNote",
    description,
    siteName: "MetaNote",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-canvas-soft font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
