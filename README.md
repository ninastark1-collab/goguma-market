# 🍠 고구마마켓

흙 털고 건네는 우리 동네 중고거래. Next.js + Supabase 로 단계별로 만들어 가는 공부용 프로젝트입니다.

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 자동 테스트 (Vitest)
```

`.env.local` 에 Supabase 주소와 publishable 키가 들어 있습니다. (`.env.example` 참고)
가계부 앱과 **같은 Supabase 프로젝트**를 씁니다. 가계부 테이블(`transactions`, `budgets`)은 건드리지 않습니다.

## 1단계: 회원가입 / 로그인 / 로그아웃 ✅

| 파일 | 하는 일 |
| --- | --- |
| `src/lib/supabase/client.ts` | 브라우저용 Supabase 클라이언트 |
| `src/lib/supabase/server.ts` | 서버용 클라이언트 (쿠키로 세션 읽기) |
| `src/lib/supabase/proxy.ts` + `src/proxy.ts` | 요청마다 세션 갱신, `/my` 보호, 로그인한 사람은 `/login`·`/signup` 접근 시 홈으로 |
| `src/app/auth/actions.ts` | `signup`, `login`, `logout` Server Actions |
| `src/app/auth/callback/route.ts` | 이메일 인증 링크를 눌렀을 때 세션으로 바꿔 주는 곳 |
| `src/lib/auth.ts` | 현재 사용자 + 프로필(닉네임, 동네) 가져오기 |
| `src/app/(auth)/login`, `signup` | 로그인 / 회원가입 화면 |
| `src/app/my` | 로그인한 사람만 보는 내 정보 |
| `supabase/migrations/001_goguma_profiles.sql` | `profiles` 테이블 + 가입 시 자동 생성 트리거 + RLS |

### 흐름
1. 회원가입 폼 → `signup` 액션 → `supabase.auth.signUp({ options: { data: { nickname, region } } })`
2. DB 트리거 `on_auth_user_created` 가 `auth.users` 에 들어온 메타데이터로 `profiles` 행을 만듭니다.
3. 세션은 쿠키에 저장되고, `proxy.ts` 가 요청마다 토큰을 갱신합니다.
4. 로그아웃은 `<form action={logout}>` 버튼 하나로 처리됩니다.

> 현재 Supabase 프로젝트는 **이메일 인증이 꺼져 있어서** 가입 즉시 로그인됩니다.
> 대시보드 → Authentication → Sign In / Providers 에서 "Confirm email"을 켜면, 인증 메일 안내 화면과 `/auth/callback` 이 동작합니다.

### Next.js 16 메모
- `middleware.ts` 대신 `proxy.ts` 를 씁니다.
- Cache Components 가 켜져 있어서, 쿠키(로그인 정보)를 읽는 컴포넌트는 `<Suspense>` 안에 둬야 합니다.

## 2단계: 판매글 CRUD (사진 제외) ✅

CRUD = 만들기(Create) · 읽기(Read) · 고치기(Update) · 지우기(Delete). 사진은 다음 단계에서 붙여요.

| 파일 | 하는 일 |
| --- | --- |
| `supabase/migrations/002_goguma_items.sql` | `items` 테이블 + RLS(누구나 보기, 본인만 쓰기/고치기/지우기) + 수정 시각 자동 갱신 |
| `src/lib/items.ts` | 판매글 목록 / 검색 / 한 개 읽기 (R) |
| `src/app/items/actions.ts` | `createItem`, `updateItem`, `deleteItem` Server Actions (C, U, D) |
| `src/components/ItemForm.tsx` | 글쓰기·고치기 공용 입력 폼 (제목, 카테고리, 가격, 설명, 판매 상태) |
| `src/app/write` | 판매글 쓰기 화면 |
| `src/app/items/[id]` | 판매글 상세 화면 (내 글이면 수정/삭제 버튼) |
| `src/app/items/[id]/edit` | 판매글 고치기 화면 (본인만) |
| `src/components/ItemList.tsx`, `ItemCard.tsx` | 홈·카테고리·검색의 판매글 목록 (예시 데이터 → DB) |

- 사진이 없는 동안 썸네일 자리에는 카테고리 그림과 배경색을 보여 줘요.
- 판매 상태(판매중/예약중/거래완료)는 '고치기'에서 바꿀 수 있어요.

## 3단계: 판매글 사진 (최대 10장) ✅

| 파일 | 하는 일 |
| --- | --- |
| `supabase/migrations/003_goguma_item_photos.sql` | `items.photos`(사진 경로 목록, 최대 10개) + Storage 버킷 `goguma-item-photos` + 내 폴더에만 올리기/지우기 정책 |
| `src/lib/photos.ts` | 브라우저에서 사진 줄이기(긴 쪽 1600px, JPG) + Storage에 올리기 |
| `src/components/PhotoPicker.tsx` | 사진 고르기, 미리보기, 빼기, 대표 사진 바꾸기 |
| `src/components/ItemForm.tsx` | 저장 시 새 사진부터 올리고 → 사진 경로와 글 내용을 Server Action으로 |
| `src/app/items/actions.ts` | 사진 경로 검사, 수정 때 뺀 사진·삭제한 글의 사진을 Storage에서도 지우기 |
| `src/components/PhotoGallery.tsx` | 상세 화면에서 사진 옆으로 넘겨 보기 |

### 흐름
1. 사진을 고르면 브라우저가 바로 크기를 줄여 미리보기를 보여 줘요.
2. 저장을 누르면 새 사진을 Storage의 `{내 사용자 id}/{무작위 이름}.jpg` 에 올려요. (서버를 거치지 않아 용량 한도 걱정 없음)
3. 글에는 사진 경로만 순서대로 저장돼요. 첫 번째 사진이 대표 사진이에요.
4. 화면에서는 `next/image`가 사진을 화면 크기에 맞게 줄여서 보여 줘요. (`next.config.ts`의 `images.remotePatterns`)

## 4단계: 좋아요(관심) + 판매자·구매자 1:1 채팅 ✅

| 파일 | 하는 일 |
| --- | --- |
| `supabase/migrations/004_goguma_likes_chat.sql` | `item_likes`, `chat_rooms`, `chat_messages` 테이블 + RLS + 숫자 자동 갱신 트리거 + Realtime |
| `src/app/items/like-actions.ts`, `src/components/LikeButton.tsx` | ♡ 누르기/취소 (누르는 즉시 화면 반영: `useOptimistic`) |
| `src/app/my/likes` | 관심목록 (내가 ♡ 누른 글) |
| `src/app/chat/actions.ts` | '채팅하기' → 이 글로 연 방이 있으면 그 방, 없으면 새 방 |
| `src/app/chat`, `src/app/chat/[roomId]` | 채팅 목록(안 읽은 수) / 1:1 대화방 |
| `src/components/ChatRoomView.tsx` | 메시지 보내기 + Supabase Realtime으로 새 메시지·읽음 표시 바로 반영 |
| `src/lib/social.ts` | 좋아요·채팅 데이터 읽기 |

### 보안 규칙 (RLS)
- 좋아요: 누가 눌렀는지는 본인만 보고, 화면엔 숫자(`items.like_count`)만 보여요.
- 채팅방·메시지: 방의 두 사람(판매자·구매자)만 보고 보낼 수 있어요. 방은 구매자가 만들고, 판매자는 그 글의 진짜 판매자여야 해요.
- 메시지는 보낸 뒤 내용을 못 고치고, 상대 메시지의 '읽음'(`read_at`)만 표시할 수 있어요.

### 개발 팁
- 판매자·구매자를 동시에 시험하려면 `localhost:3000`(한 계정)과 `127.0.0.1:3000`(다른 계정)을 따로 열어요. (`next.config.ts`의 `allowedDevOrigins`)

## 5단계: 판매글 댓글 ✅

| 파일 | 하는 일 |
| --- | --- |
| `supabase/migrations/005_goguma_item_comments.sql` | `item_comments` 테이블 + RLS (누구나 읽기 / 로그인한 본인만 쓰기 / 쓴 사람·판매자만 지우기) |
| `src/app/items/comment-actions.ts` | `addComment`, `deleteComment` Server Actions |
| `src/components/CommentForm.tsx`, `DeleteCommentButton.tsx` | 댓글 입력칸 / 삭제 버튼 |
| `src/app/items/[id]/page.tsx` | 상세 화면 아래 댓글 목록 (판매자 댓글엔 '판매자' 표시) |

## 6단계: 완성도 다듬기 — 신뢰·거래·동네 ✅

객관적으로 부족했던 디자인·기능·보이지 않는 부분을 한 번에 보완했어요.

**디자인**
- 좁은 휴대폰에서 머리말 줄바꿈 수정, 채팅 입력칸 항상 아래, 상세 가격 중복 제거
- 오류 안내(`error.tsx`) · 없는 페이지(`not-found.tsx`), 작업 후 토스트(`?toast=`), 로딩 틀(스켈레톤)
- PC 상세 2단 배치, 사진 눌러서 크게 보기, 프로필 이모지(🍠🥔🌽…)

**거래·신뢰**
- 거래완료 때 구매자 고르기(이 글로 채팅한 사람 중) → 판매내역/구매내역
- 거래 후기(최고예요/괜찮아요/별로예요) → 고구마 온도 자동 변화 (사용자가 직접 못 고쳐요)
- 판매자 프로필(`/users/[id]`): 온도·받은 후기·올린 물건
- 신고(`reports` 표, 운영자는 Supabase 대시보드에서 확인)·차단(서로 채팅 불가, 글·댓글 숨김)
- 도배 방지: 채팅 20개/분, 댓글 5개/분, 판매글 10개/시간 등 (DB 트리거)

**알림·채팅**
- 🔔 알림(내 글 댓글·좋아요, 거래완료, 후기, 동네생활 댓글) + 메뉴의 안 읽은 숫자(실시간)
- 채팅 사진 보내기(비공개 버킷 `goguma-chat-photos`, 방의 두 사람만), 가격 제안, 채팅방 나가기

**동네·검색**
- 홈 "전체 / 📍 내 동네" 탭, 더 보기, 끌어올리기(하루 1번)
- 검색 필터: 카테고리·가격대·거래완료 숨기기·정렬(최신/인기/가격)
- 동네생활 게시판(`/community`): 주제별 글·댓글·내 동네만

**계정**
- 내 정보 수정(닉네임·동네·프로필 그림), 비밀번호 바꾸기/찾기(메일), 회원 탈퇴
- 카톡 등 링크 공유 미리보기(판매글 제목·대표 사진)

| 주요 파일 | 하는 일 |
| --- | --- |
| `supabase/migrations/006~008_*.sql` | 위 기능의 표·RLS·트리거·버킷 |
| `src/lib/items.ts` `findItems()` | 목록 하나로 홈·카테고리·검색·판매내역 처리 (필터·정렬·차단 숨김·더 보기) |
| `src/lib/trust.ts`, `src/lib/community.ts` | 프로필·후기·알림·차단 / 동네생활 데이터 |
| `src/app/items/trade-actions.ts`, `src/app/safety/actions.ts`, `src/app/my/actions.ts` | 거래·후기·끌올 / 신고·차단 / 내 정보 Server Actions |
| `src/components/useBadges.tsx` | 안 읽은 채팅·알림 숫자 (실시간) |

## 7단계: 운영·신뢰 마무리 ✅

| 기능 | 파일 |
| --- | --- |
| 🏷️ 키워드 알림 (새 글 제목에 내 키워드 → 🔔, 10개까지) | `src/app/my/keywords`, DB `keyword_alerts` + 트리거 |
| 🛡️ 운영자 신고 처리 (접수/처리완료/반려, 글 숨기기, 댓글·글 지우기, 신고자에게 결과 알림) | `src/app/admin/reports`, `src/app/admin/actions.ts`, DB `goguma_admins` |
| 📍 위치 기반 동네 인증 (위치 → 동네 이름은 서버가 Nominatim으로 찾아요) | `src/app/my/region`, `src/lib/region.ts` |
| 📜 이용약관·개인정보처리방침 + 가입 동의 | `src/app/terms`, `src/app/privacy` |
| 📱 홈 화면에 앱처럼 설치(PWA), 앱 아이콘 | `src/app/manifest.ts`, `icon.tsx`, `apple-icon.tsx` |
| 🔎 검색엔진용 sitemap·robots, 동네생활 공유 미리보기 | `src/app/sitemap.ts`, `robots.ts` |
| ⌨️ 접근성: 본문으로 건너뛰기, 키보드 포커스 테두리 | `src/app/layout.tsx`, `globals.css` |
| 🧪 자동 테스트 (Vitest, 26개) | `npm test`, `src/lib/__tests__` |

- 운영자 지정·해제는 Supabase SQL에서만: `insert into goguma_admins (user_id) values ('사용자 id');`
- 동네 인증은 브라우저가 알려 준 위치를 믿어요. (웹에서는 위치 조작을 완전히 막을 수 없어요)

## 디자인 테마 — 구황작물 / 향토
한지 배경, 흙색 글자, 고구마 껍질 자주색 버튼, 군고구마 속살 노란색 강조.
색상과 버튼 스타일은 `src/app/globals.css` 의 `@theme` 과 `@utility` 에 모여 있습니다.

## 다음 단계 (예정)
- [x] 판매글 올리기 / 목록 / 상세 / 수정 / 삭제 (사진 제외)
- [x] 판매글 사진 업로드 (Supabase Storage, 최대 10장)
- [x] 좋아요(관심목록), 판매자·구매자 1:1 채팅
- [x] 판매글 댓글
- [x] 거래완료·후기·고구마 온도, 알림, 신고·차단, 동네생활, 검색 필터, 끌어올리기, 내 정보 관리
- [x] 키워드 알림, 운영자용 신고 처리 화면, 동네 인증(위치), 약관·개인정보, PWA, 자동 테스트
- [ ] 배포 (가계부와 다른 주소로)
