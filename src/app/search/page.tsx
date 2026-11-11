import { Suspense } from "react";
import type { Metadata } from "next";
import SearchBar from "@/components/SearchBar";
import ItemList, { EmptyBox } from "@/components/ItemList";
import { searchItems } from "@/lib/items";

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

  // 제목이나 카테고리 이름에 검색어가 들어 있는 판매글을 DB에서 찾아요.
  const items = query ? await searchItems(query) : [];

  return (
    <>
      <SearchBar defaultValue={query} />
      {query && (
        <p className="mt-6 font-display text-lg">
          ‘{query}’ 검색 결과 <span className="text-skin">{items.length}</span>개
        </p>
      )}
      <div className="mt-4">
        <ItemList
          items={items}
          empty={
            <EmptyBox
              emoji="🔍"
              title={query ? "앗, 찾는 물건이 아직 없어요" : "무엇을 찾고 계세요?"}
              desc="다른 검색어로 다시 찾아보세요."
            />
          }
        />
      </div>
    </>
  );
}
