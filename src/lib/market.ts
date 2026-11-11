// 고구마마켓 카테고리, 판매글 모양(타입), 화면용 도우미 함수
// (DB에서 판매글을 불러오는 함수는 src/lib/items.ts에 있어요)

// tint: 사진이 아직 없어서, 카드 썸네일 자리에 카테고리 그림 + 배경색을 보여 줘요.
export type Category = { slug: string; name: string; emoji: string; tint: string };

export const CATEGORIES: Category[] = [
  { slug: "digital", name: "디지털기기", emoji: "📱", tint: "#e3e8f2" },
  { slug: "appliance", name: "생활가전", emoji: "🔌", tint: "#dbe9ee" },
  { slug: "furniture", name: "가구/인테리어", emoji: "🪑", tint: "#ecd9c0" },
  { slug: "kitchen", name: "생활/주방", emoji: "🍳", tint: "#e6e1da" },
  { slug: "kids", name: "유아동", emoji: "🧸", tint: "#f6dfe6" },
  { slug: "clothes", name: "의류", emoji: "👕", tint: "#e0e3ee" },
  { slug: "goods", name: "잡화", emoji: "👜", tint: "#efe2d2" },
  { slug: "beauty", name: "뷰티/미용", emoji: "💄", tint: "#f6dfe6" },
  { slug: "sports", name: "스포츠/레저", emoji: "⚽", tint: "#dfe8d3" },
  { slug: "hobby", name: "취미/게임/음반", emoji: "🎮", tint: "#f1dcdc" },
  { slug: "books", name: "도서", emoji: "📚", tint: "#f3e6cc" },
  { slug: "tickets", name: "티켓/교환권", emoji: "🎟️", tint: "#fbe2b4" },
  { slug: "food", name: "농산물/가공식품", emoji: "🍠", tint: "#fbe2b4" },
  { slug: "pets", name: "반려동물용품", emoji: "🐶", tint: "#efe2d2" },
  { slug: "plants", name: "식물", emoji: "🪴", tint: "#dbead2" },
  { slug: "etc", name: "기타 중고물품", emoji: "📦", tint: "#ede0c6" },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

// 판매 상태 (DB의 status 칸에 들어가는 값과 같아요)
export const STATUSES = ["판매중", "예약중", "거래완료"] as const;
export type ItemStatus = (typeof STATUSES)[number];

// DB items 테이블 한 줄 + 판매자 닉네임
export type Item = {
  id: number;
  seller_id: string;
  title: string;
  description: string;
  price: number; // 0 = 나눔
  category: string;
  region: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
  photos: string[]; // Storage 안의 사진 경로 목록 (첫 번째가 대표 사진)
  seller: { nickname: string } | null;
};

// 사진 설정: 저장 공간(버킷) 이름과 한 글에 올릴 수 있는 최대 장수
export const PHOTO_BUCKET = "goguma-item-photos";
export const MAX_PHOTOS = 10;

// 사진 경로("사용자id/파일.jpg") → 누구나 볼 수 있는 사진 주소
export function photoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${PHOTO_BUCKET}/${path}`;
}

export function formatPrice(price: number) {
  return price === 0 ? "나눔 🧡" : `${price.toLocaleString("ko-KR")}원`;
}

// "3분 전", "어제" 처럼 올린 시간을 사람이 읽기 쉽게 바꿔 줘요.
export function timeAgo(iso: string, now: number) {
  const sec = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (sec < 60) return "방금 전";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "어제";
  if (day < 30) return `${day}일 전`;
  return new Date(iso).toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}
