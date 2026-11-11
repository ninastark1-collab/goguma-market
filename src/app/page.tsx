import { Suspense } from "react";
import Link from "next/link";
import GogumaLogo from "@/components/GogumaLogo";
import SearchBar from "@/components/SearchBar";
import CategoryGrid from "@/components/CategoryGrid";
import ItemCard from "@/components/ItemCard";
import { getCurrentUser } from "@/lib/auth";
import { SAMPLE_ITEMS } from "@/lib/market";

const HOT_KEYWORDS = ["고구마", "김장", "패딩", "자전거", "유모차", "캠핑"];

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
      <Suspense fallback={null}>
        <Welcome searchParams={searchParams} />
      </Suspense>

      {/* 검색 */}
      <section>
        <SearchBar />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-soil-soft">인기 검색어</span>
          {HOT_KEYWORDS.map((k) => (
            <Link
              key={k}
              href={`/search?q=${encodeURIComponent(k)}`}
              className="rounded-full border border-soil/30 bg-[#fffaf0] px-2.5 py-1 hover:border-skin hover:text-skin"
            >
              {k}
            </Link>
          ))}
        </div>
      </section>

      {/* 배너 */}
      <section className="card-sack mt-6 flex items-center gap-4 overflow-hidden px-5 py-5 sm:px-8">
        <div className="flex-1">
          <p className="text-xs text-soil-soft">우리 동네 밭에서 캐낸 중고거래</p>
          <h1 className="mt-1 font-display text-2xl leading-snug sm:text-3xl">
            흙 털고 건네는 <span className="text-skin">구수한</span> 우리 동네 장터
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <Suspense fallback={<span className="h-10" />}>
              <BannerActions />
            </Suspense>
          </div>
        </div>
        <div className="hidden shrink-0 sm:block">
          <GogumaLogo size={130} steaming />
        </div>
      </section>

      {/* 카테고리 */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-xl">어떤 물건을 찾으세요?</h2>
        <CategoryGrid />
      </section>

      {/* 매물 목록 */}
      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-xl">우리 동네 인기 매물 🔥</h2>
          <span className="text-xs text-soil-soft">예시 매물이에요 · 물건 올리기는 다음 단계</span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4">
          {SAMPLE_ITEMS.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ul>
      </section>

      {/* 글쓰기 떠 있는 버튼 (PC) */}
      <Link
        href="/write"
        className="btn-goguma fixed bottom-8 right-8 z-20 hidden h-14 w-14 rounded-full! p-0! text-3xl! md:inline-flex"
        aria-label="내 물건 팔기"
      >
        +
      </Link>
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
    <p className="card-sack mb-6 px-5 py-3 font-display text-lg text-leaf">
      🌱 {user.nickname}님, 고구마밭에 오신 걸 환영해요!
    </p>
  );
}

async function BannerActions() {
  const user = await getCurrentUser();
  if (user)
    return (
      <Link href="/write" className="btn-goguma px-4! py-2! text-sm!">
        + 내 물건 팔기
      </Link>
    );

  return (
    <>
      <Link href="/signup" className="btn-goguma px-4! py-2! text-sm!">고구마 캐러 가기</Link>
      <Link href="/login" className="btn-straw text-sm">이미 회원이에요</Link>
    </>
  );
}
