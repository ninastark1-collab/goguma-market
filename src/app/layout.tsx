import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Toaster from "@/components/Toaster";
import { Gowun_Dodum, Jua } from "next/font/google";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

// 제목용: 동글동글한 Jua / 본문용: 단정한 고운돋움
const jua = Jua({ weight: "400", variable: "--font-jua", preload: false });
const gowun = Gowun_Dodum({ weight: "400", variable: "--font-gowun", preload: false });

export const metadata: Metadata = {
  title: "고구마마켓 — 우리 동네 구수한 중고거래",
  description: "흙 묻은 손으로 건네는 우리 동네 중고거래, 고구마마켓",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${jua.variable} ${gowun.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        {/* 휴대폰에선 아래 고정 메뉴에 가리지 않도록 여백을 둡니다 */}
        <footer className="border-t-2 border-dashed border-straw pb-24 pt-6 text-center text-sm text-soil-soft md:pb-6">
          🍠 고구마마켓 · 우리 동네 밭에서 캐낸 중고거래
          {/* 예시 판매글 사진의 작가·라이선스 표시 (CC BY 사진은 출처를 밝혀야 해요) */}
          <Link href="/credits" className="ml-2 text-xs underline underline-offset-2 hover:text-skin">
            사진 출처
          </Link>
        </footer>
        <BottomNav />
        {/* 토스트는 주소의 ?toast=를 읽어서, 요청 때만 알 수 있으니 Suspense 안에 둬요 */}
        <Suspense fallback={null}>
          <Toaster />
        </Suspense>
      </body>
    </html>
  );
}
