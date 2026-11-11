import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "채팅 · 고구마마켓" };

export default function ChatPage() {
  return <ComingSoon emoji="💬" title="채팅" desc="판매자와 구매자가 거래 약속을 잡는 1:1 채팅이 들어올 자리예요." />;
}
