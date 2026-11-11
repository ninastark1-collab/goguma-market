import { Suspense } from "react";
import Link from "next/link";
import GogumaLogo from "@/components/GogumaLogo";
import LogoutButton from "@/components/LogoutButton";
import { NAV_ITEMS } from "@/components/nav";
import { getCurrentUser } from "@/lib/auth";

// 헤더 껍데기(로고, 메뉴)는 미리 만들어 두고(static),
// 로그인 상태에 따라 바뀌는 오른쪽 부분만 요청 때마다 그립니다(Suspense).
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-soil bg-hanji/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <GogumaLogo size={40} />
            <span className="font-display text-2xl text-skin">
              고구마<span className="text-soil">마켓</span>
            </span>
          </Link>
          {/* PC 화면 메뉴 (휴대폰은 아래 고정 메뉴) */}
          <nav className="hidden items-center gap-5 md:flex">
            {NAV_ITEMS.filter((n) => !n.primary && n.href !== "/my").map((n) => (
              <Link key={n.href} href={n.href} className="font-display text-soil-soft hover:text-skin">
                {n.href === "/" ? "중고거래" : n.label}
              </Link>
            ))}
          </nav>
        </div>

        <Suspense fallback={<span className="h-9 w-32 animate-pulse rounded-full bg-hanji-deep" />}>
          <UserNav />
        </Suspense>
      </div>
    </header>
  );
}

async function UserNav() {
  const user = await getCurrentUser();

  return (
    <div className="flex items-center gap-2 text-sm sm:gap-3">
      {user ? (
        <>
          <span className="hidden rounded-full border-2 border-soil/30 px-3 py-1 text-xs text-soil-soft sm:inline">
            📍 {user.region ?? "동네 미설정"}
          </span>
          <Link href="/write" className="btn-goguma hidden px-4! py-1.5! text-sm! md:inline-flex">
            + 내 물건 팔기
          </Link>
          <Link href="/my" className="hidden font-display text-soil hover:text-skin md:inline">
            {user.nickname}님
          </Link>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/login" className="font-display text-soil hover:text-skin">로그인</Link>
          <Link href="/signup" className="btn-straw text-sm">회원가입</Link>
        </>
      )}
    </div>
  );
}
