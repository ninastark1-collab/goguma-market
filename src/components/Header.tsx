import { Suspense } from "react";
import Link from "next/link";
import GogumaLogo from "@/components/GogumaLogo";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";

// 헤더 껍데기(로고)는 미리 만들어 두고(static),
// 로그인 상태에 따라 바뀌는 오른쪽 메뉴만 요청 때마다 그립니다(Suspense).
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-soil bg-hanji/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <GogumaLogo size={40} />
          <span className="font-display text-2xl text-skin">
            고구마<span className="text-soil">마켓</span>
          </span>
        </Link>

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
    <nav className="flex items-center gap-2 text-sm sm:gap-3">
      {user ? (
        <>
          <Link href="/my" className="font-display text-soil hover:text-skin">
            <span className="hidden sm:inline">{user.nickname}님 </span>🍠
          </Link>
          <form action={logout}>
            <button type="submit" className="btn-straw text-sm">로그아웃</button>
          </form>
        </>
      ) : (
        <>
          <Link href="/login" className="font-display text-soil hover:text-skin">로그인</Link>
          <Link href="/signup" className="btn-straw text-sm">회원가입</Link>
        </>
      )}
    </nav>
  );
}
