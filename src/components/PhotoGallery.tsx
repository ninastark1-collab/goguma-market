"use client";
// 판매글 상세의 사진 넘겨 보기
// 휴대폰에선 손가락으로 옆으로 밀고, PC에선 ◀ ▶ 버튼이나 아래 점을 눌러 넘겨요.
// (CSS scroll-snap: 스크롤이 사진 한 장 단위로 '착' 멈추게 해 주는 기능)

import { useRef, useState } from "react";
import Image from "next/image";

export default function PhotoGallery({ urls, alt, dim }: { urls: string[]; alt: string; dim?: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = urls.length > 1;

  // 스크롤 위치로 지금 몇 번째 사진인지 계산해요.
  function onScroll() {
    const el = trackRef.current;
    if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  function go(i: number) {
    const el = trackRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="relative border-b-2 border-soil bg-soil">
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex aspect-square snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] sm:aspect-[4/3]"
      >
        {urls.map((url, i) => (
          <div key={url} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={url}
              alt={`${alt} 사진 ${i + 1}`}
              fill
              sizes="(min-width: 672px) 672px, 100vw"
              priority={i === 0}
              className={`object-contain ${dim ? "opacity-60" : ""}`}
            />
          </div>
        ))}
      </div>

      {many && (
        <>
          <span className="absolute right-3 top-3 rounded-full bg-soil/75 px-2.5 py-0.5 text-xs text-white">
            {index + 1} / {urls.length}
          </span>
          {index > 0 && (
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="이전 사진"
              className="absolute left-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border-2 border-soil bg-hanji/90 sm:grid"
            >
              ◀
            </button>
          )}
          {index < urls.length - 1 && (
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="다음 사진"
              className="absolute right-2 top-1/2 hidden h-9 w-9 -translate-y-1/2 place-items-center rounded-full border-2 border-soil bg-hanji/90 sm:grid"
            >
              ▶
            </button>
          )}
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {urls.map((url, i) => (
              <button
                key={url}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}번째 사진 보기`}
                className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-flesh" : "w-2 bg-hanji/70"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
