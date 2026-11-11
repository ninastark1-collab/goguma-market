import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "내 물건 팔기 · 고구마마켓" };

export default function WritePage() {
  return <ComingSoon emoji="📸" title="내 물건 팔기" desc="사진, 제목, 카테고리, 가격을 적어 우리 동네에 물건을 올리는 화면이 다음 단계에서 만들어져요." />;
}
