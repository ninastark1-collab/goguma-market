import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import GogumaLogo from "@/components/GogumaLogo";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "나의 고구마 · 고구마마켓" };

// href가 있는 메뉴만 들어갈 수 있고, 나머지는 '준비 중'이에요.
const MY_MENUS: { group: string; items: { icon: string; label: string; href?: string }[] }[] = [
  { group: "나의 거래", items: [
    { icon: "🧺", label: "판매내역" },
    { icon: "🛍️", label: "구매내역" },
    { icon: "♡", label: "관심목록", href: "/my/likes" },
  ] },
  { group: "나의 동네", items: [
    { icon: "📍", label: "내 동네 설정" },
    { icon: "🔔", label: "키워드 알림" },
    { icon: "🌾", label: "동네생활 글" },
  ] },
];

export default function MyPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <Suspense fallback={<p className="py-20 text-center text-soil-soft">고구마 굽는 중…</p>}>
        <Profile />
      </Suspense>

      {MY_MENUS.map((m) => (
        <section key={m.group} className="mt-8">
          <h2 className="mb-2 px-1 font-display text-lg">{m.group}</h2>
          <ul className="stitch divide-y-2 divide-dashed divide-straw bg-[#fffaf0]/70">
            {m.items.map((it) => (
              <li key={it.label}>
                {it.href ? (
                  <Link href={it.href} className="flex items-center justify-between px-4 py-3.5 hover:bg-flesh-soft/40">
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{it.icon}</span>
                      {it.label}
                    </span>
                    <span className="text-soil-soft">›</span>
                  </Link>
                ) : (
                  <div className="flex items-center justify-between px-4 py-3.5">
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{it.icon}</span>
                      {it.label}
                    </span>
                    <span className="text-xs text-soil-soft">준비 중</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// 로그인한 사람만 볼 수 있는 정보 (proxy.ts에서 한 번 막고, 여기서 한 번 더 확인)
async function Profile() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my");

  const joined = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })
    : "-";

  return (
    <div className="card-sack px-6 py-6">
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full border-2 border-soil bg-flesh-soft">
          <GogumaLogo size={64} />
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl">{user.nickname}</h1>
          <p className="text-sm text-soil-soft">📍 {user.region ?? "동네를 아직 정하지 않았어요"}</p>
          <p className="mt-1 truncate text-xs text-soil-soft">{user.email}</p>
        </div>
      </div>

      {/* 고구마 온도: 당근의 '매너온도'처럼 거래 신뢰도를 보여 줄 자리 */}
      <div className="mt-5">
        <div className="flex justify-between text-sm">
          <span className="font-display">고구마 온도 🔥</span>
          <span className="font-display text-flesh">36.5℃</span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full border-2 border-soil bg-hanji-deep">
          <div className="h-full w-[36.5%] bg-flesh" />
        </div>
        <p className="mt-1 text-xs text-soil-soft">첫 온도는 36.5℃에서 시작해요 · 가입일 {joined}</p>
      </div>

      <div className="mt-5 flex gap-2">
        <Link href="/write" className="btn-goguma flex-1 px-3! py-2! text-sm!">+ 내 물건 팔기</Link>
        <LogoutButton className="btn-straw text-sm h-full" />
      </div>
    </div>
  );
}
