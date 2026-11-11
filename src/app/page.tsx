import { Suspense } from "react";
import Link from "next/link";
import GogumaLogo from "@/components/GogumaLogo";
import { getCurrentUser } from "@/lib/auth";

const CROPS = [
  { emoji: "🍠", name: "고구마", desc: "주인공" },
  { emoji: "🥔", name: "감자", desc: "든든한 이웃" },
  { emoji: "🌽", name: "옥수수", desc: "알알이 거래" },
  { emoji: "🌰", name: "밤", desc: "알찬 물건" },
];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-16">
      <Suspense fallback={null}>
        <Welcome searchParams={searchParams} />
      </Suspense>

      <section className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="mb-3 inline-block rounded-full border-2 border-soil bg-flesh-soft px-3 py-1 text-sm">
            우리 동네 밭에서 캐낸 중고거래
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            흙 털고 건네는<br />
            <span className="text-skin">구수한</span> 우리 동네 장터
          </h1>
          <p className="mt-5 max-w-md leading-relaxed text-soil-soft">
            안 쓰는 물건, 한 바구니 담아 이웃에게 건네 보세요.
            군고구마처럼 따끈한 거래가 기다리고 있어요.
          </p>

          <div className="mt-8 flex min-h-12 flex-wrap gap-3">
            <Suspense fallback={null}>
              <HeroActions />
            </Suspense>
          </div>
        </div>

        <div className="card-sack flex flex-col items-center gap-3 px-6 py-10 text-center">
          <GogumaLogo size={140} steaming />
          <p className="font-display text-2xl">갓 구운 거래 준비 중</p>
          <p className="text-sm text-soil-soft">
            물건 올리기, 동네 둘러보기, 채팅은<br />다음 수확 때 찾아올게요.
          </p>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="mb-5 font-display text-2xl">이번 철 밭 소식</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CROPS.map((c) => (
            <li key={c.name} className="stitch bg-[#fffaf0]/70 px-4 py-6 text-center">
              <div className="text-4xl">{c.emoji}</div>
              <div className="mt-2 font-display text-lg">{c.name}</div>
              <div className="text-xs text-soil-soft">{c.desc}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

// 가입/로그인 직후(?welcome=1) 환영 인사
async function Welcome({ searchParams }: { searchParams: PageProps<"/">["searchParams"] }) {
  const { welcome } = await searchParams;
  if (!welcome) return null;
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <p className="card-sack mb-10 px-5 py-3 font-display text-lg text-leaf">
      🌱 {user.nickname}님, 고구마밭에 오신 걸 환영해요!
    </p>
  );
}

// 로그인 여부에 따라 버튼이 달라집니다.
async function HeroActions() {
  const user = await getCurrentUser();

  if (user) return <Link href="/my" className="btn-goguma">내 정보 보기 🍠</Link>;

  return (
    <>
      <Link href="/signup" className="btn-goguma">고구마 캐러 가기</Link>
      <Link href="/login" className="btn-straw">이미 회원이에요</Link>
    </>
  );
}
