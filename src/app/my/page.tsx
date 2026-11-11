import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import GogumaLogo from "@/components/GogumaLogo";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/auth/actions";

export const metadata: Metadata = { title: "내 정보 · 고구마마켓" };

export default function MyPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card-sack flex flex-col items-center px-6 py-8 text-center">
        <GogumaLogo size={88} steaming />
        <Suspense fallback={<p className="mt-4 text-soil-soft">고구마 굽는 중…</p>}>
          <Profile />
        </Suspense>
      </div>
    </div>
  );
}

// 로그인한 사람만 볼 수 있는 정보 (proxy.ts에서 한 번 막고, 여기서 한 번 더 확인)
async function Profile() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my");

  const joined = new Date(user.createdAt).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <h1 className="mt-3 font-display text-3xl">{user.nickname}</h1>
      <p className="text-sm text-soil-soft">{user.region ?? "동네를 아직 정하지 않았어요"}</p>

      <dl className="stitch mt-6 w-full divide-y-2 divide-dashed divide-straw text-left text-sm">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-soil-soft">이메일</dt>
          <dd className="break-all">{user.email}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-soil-soft">가입일</dt>
          <dd>{joined}</dd>
        </div>
      </dl>

      <form action={logout} className="mt-6">
        <button type="submit" className="btn-straw">로그아웃</button>
      </form>
    </>
  );
}
