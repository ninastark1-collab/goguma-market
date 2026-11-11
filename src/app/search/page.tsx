import { Suspense } from "react";
import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import ItemCard from "@/components/ItemCard";
import { CATEGORIES, SAMPLE_ITEMS } from "@/lib/market";

export const metadata: Metadata = { title: "검색 · 고구마마켓" };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Suspense fallback={<SearchBar />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  // 제목이나 카테고리 이름에 검색어가 들어 있으면 보여 줍니다.
  const items = query
    ? SAMPLE_ITEMS.filter((i) => {
        const cat = CATEGORIES.find((c) => c.slug === i.category)?.name ?? "";
        return i.title.includes(query) || cat.includes(query);
      })
    : [];

  return (
    <>
      <SearchBar defaultValue={query} />
      {query && (
        <p className="mt-6 font-display text-lg">
          ‘{query}’ 검색 결과 <span className="text-skin">{items.length}</span>개
        </p>
      )}
      {items.length > 0 ? (
        <ul className="mt-4 grid grid-cols-1 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="stitch mt-8 flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="text-5xl">🔍</span>
          <p className="font-display text-xl">{query ? "앗, 찾는 물건이 아직 없어요" : "무엇을 찾고 계세요?"}</p>
          <p className="text-sm text-soil-soft">다른 검색어로 다시 찾아보세요.</p>
        </div>
      )}
    </>
  );
}
