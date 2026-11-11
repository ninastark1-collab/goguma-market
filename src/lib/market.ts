// 고구마마켓 카테고리와 예시 매물
// 실제 물건 올리기(DB) 기능을 만들기 전까지 화면을 채우는 예시 데이터예요.

export type Category = { slug: string; name: string; emoji: string };

export const CATEGORIES: Category[] = [
  { slug: "digital", name: "디지털기기", emoji: "📱" },
  { slug: "appliance", name: "생활가전", emoji: "🔌" },
  { slug: "furniture", name: "가구/인테리어", emoji: "🪑" },
  { slug: "kitchen", name: "생활/주방", emoji: "🍳" },
  { slug: "kids", name: "유아동", emoji: "🧸" },
  { slug: "clothes", name: "의류", emoji: "👕" },
  { slug: "goods", name: "잡화", emoji: "👜" },
  { slug: "beauty", name: "뷰티/미용", emoji: "💄" },
  { slug: "sports", name: "스포츠/레저", emoji: "⚽" },
  { slug: "hobby", name: "취미/게임/음반", emoji: "🎮" },
  { slug: "books", name: "도서", emoji: "📚" },
  { slug: "tickets", name: "티켓/교환권", emoji: "🎟️" },
  { slug: "food", name: "농산물/가공식품", emoji: "🍠" },
  { slug: "pets", name: "반려동물용품", emoji: "🐶" },
  { slug: "plants", name: "식물", emoji: "🪴" },
  { slug: "etc", name: "기타 중고물품", emoji: "📦" },
];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

export type Item = {
  id: number;
  title: string;
  price: number; // 0 = 나눔
  region: string;
  ago: string;
  category: string;
  emoji: string;
  tint: string; // 썸네일 배경색
  likes: number;
  chats: number;
  status?: "예약중" | "거래완료";
};

export const SAMPLE_ITEMS: Item[] = [
  { id: 1, title: "호박고구마 10kg 한 박스 (올해 수확)", price: 25000, region: "가남읍", ago: "10분 전", category: "food", emoji: "🍠", tint: "#fbe2b4", likes: 12, chats: 4 },
  { id: 2, title: "아이폰 13 미니 128G 깨끗해요", price: 380000, region: "여주동", ago: "32분 전", category: "digital", emoji: "📱", tint: "#e3e8f2", likes: 8, chats: 3 },
  { id: 3, title: "원목 4인 식탁 + 의자 세트", price: 120000, region: "오학동", ago: "1시간 전", category: "furniture", emoji: "🪑", tint: "#ecd9c0", likes: 21, chats: 6, status: "예약중" },
  { id: 4, title: "가마솥 무쇠 냄비 (길들임 완료)", price: 45000, region: "가남읍", ago: "2시간 전", category: "kitchen", emoji: "🍲", tint: "#e6e1da", likes: 5, chats: 1 },
  { id: 5, title: "아기 원목 장난감 나눔해요", price: 0, region: "능서면", ago: "3시간 전", category: "kids", emoji: "🧸", tint: "#f6dfe6", likes: 30, chats: 9 },
  { id: 6, title: "등산화 260 한 번 신었어요", price: 35000, region: "여주동", ago: "5시간 전", category: "sports", emoji: "🥾", tint: "#dfe8d3", likes: 3, chats: 0 },
  { id: 7, title: "몬스테라 큰 화분 분양", price: 15000, region: "점동면", ago: "어제", category: "plants", emoji: "🪴", tint: "#dbead2", likes: 17, chats: 2 },
  { id: 8, title: "닌텐도 스위치 + 게임 3개", price: 210000, region: "오학동", ago: "어제", category: "hobby", emoji: "🎮", tint: "#f1dcdc", likes: 25, chats: 7, status: "거래완료" },
  { id: 9, title: "겨울 패딩 점퍼 L (거의 새것)", price: 40000, region: "가남읍", ago: "2일 전", category: "clothes", emoji: "🧥", tint: "#e0e3ee", likes: 9, chats: 2 },
  { id: 10, title: "초등 전집 동화책 60권", price: 30000, region: "여주동", ago: "3일 전", category: "books", emoji: "📚", tint: "#f3e6cc", likes: 14, chats: 3 },
  { id: 11, title: "강아지 이동장 (소형견용)", price: 18000, region: "능서면", ago: "4일 전", category: "pets", emoji: "🐶", tint: "#efe2d2", likes: 6, chats: 1 },
  { id: 12, title: "미니 제습기 거의 안 썼어요", price: 50000, region: "점동면", ago: "5일 전", category: "appliance", emoji: "💨", tint: "#dbe9ee", likes: 4, chats: 1 },
];

export function formatPrice(price: number) {
  return price === 0 ? "나눔 🧡" : `${price.toLocaleString("ko-KR")}원`;
}
