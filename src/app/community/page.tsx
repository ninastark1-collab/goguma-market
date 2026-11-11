import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "동네생활 · 고구마마켓" };

export default function CommunityPage() {
  return <ComingSoon emoji="🌾" title="동네생활" desc="동네 소식, 맛집, 분실물, 같이 해요 모임까지 이웃과 나누는 게시판이 열릴 예정이에요." />;
}
