<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🍠 고구마마켓 — 작업 전에 꼭 읽기

## 이 프로젝트는 개발 공부용이에요
- 주인은 **개발 공부 중**이고, 기능을 **한 단계씩 차근차근** 만들어 가고 있어요.
- 한 번에 하나의 단계만 진행해요. 요청받지 않은 다음 단계 기능(물건 올리기, 채팅 등)을 미리 만들지 마세요.
- 코드에는 **한국어 주석**으로 "이 코드가 왜 필요한지"를 짧게 설명해 주세요. 새로 나온 개념(Server Action, proxy, Suspense, RLS 등)은 처음 쓸 때 한 줄 설명을 붙여요.
- 답변과 설명도 **한국어**로 해 주세요.
- 진행 단계는 `README.md`의 "다음 단계" 체크리스트에 기록해요.

## ⚠️ Supabase는 가계부 앱과 같은 프로젝트를 재활용 중이에요
- Supabase 프로젝트 `gfcylhusujdvzsoinwoj`(서울, ap-northeast-2)는 **가계부 앱(money-ledger)과 함께 쓰는 DB**예요.
- **가계부 테이블 `transactions`, `budgets`는 절대 건드리지 마세요.** (읽기·수정·삭제·스키마 변경 모두 금지)
  - 가계부는 로그인 없이 공개 키로 쓰는 앱이라, 이 테이블들의 RLS·정책을 바꾸면 가계부가 망가질 수 있어요.
- 고구마마켓 테이블은 가계부와 이름이 겹치지 않게 지어요. 지금 고구마마켓 테이블: `profiles`
- 인증(`auth.users`)도 두 앱이 같은 공간을 써요. 가계부는 로그인을 안 쓰지만, 사용자를 일괄 삭제하는 등 auth 전체에 영향을 주는 작업은 하지 마세요.
- DB를 바꿀 때는 **반드시 SQL 파일을 `supabase/migrations/`에 번호 순서대로 남기고**(예: `002_goguma_items.sql`), 모든 새 테이블에 **RLS를 켜고 정책을 함께** 만들어요. 바꾼 뒤에는 Supabase 보안 점검(advisors)을 돌려 확인해요.
- 데이터를 지우거나 테이블을 없애는 작업은 먼저 주인에게 물어보세요.
- 키: 코드에는 공개용 `publishable` 키만 써요. `service_role`/`secret` 키는 코드·깃에 넣지 마세요.

## 실행·배포 환경
- Node.js는 winget으로 설치했어요. 새 터미널에서 `node`가 안 잡히면 PATH를 새로 고치세요.
- 로컬: `npm run dev` → http://localhost:3000 (환경변수는 `.env.local`, 깃에 안 올라감)
- 배포: Vercel 프로젝트 `goguma-market` (https://goguma-market-blond.vercel.app). GitHub `main`에 push하면 자동 배포돼요. 가계부와는 **다른 주소로 따로** 배포해요.
- `vercel.json`의 `"regions": ["icn1"]`(서울)은 지우지 마세요. Supabase가 서울에 있어서, 미국 지역으로 돌아가면 로그인/로그아웃이 느려져요.
- Supabase 이메일 인증은 **꺼져 있어요**(가입 즉시 로그인). 켜려면 Supabase의 Redirect URLs에 배포 주소를 추가해야 해요.

## Next.js 16 주의사항 (이 프로젝트에서 실제로 겪은 것)
- `middleware.ts`가 아니라 **`src/proxy.ts`** 를 써요.
- Cache Components가 켜져 있어서, 쿠키·`searchParams`를 읽는 컴포넌트는 **`<Suspense>` 안에** 둬야 빌드가 돼요.
- 로그인 사용자는 `src/lib/auth.ts`의 `getCurrentUser()`로만 가져와요. (`cache()`로 요청당 1번만 조회하고, 안에서 `await connection()`을 먼저 불러요. Supabase 내부의 `Date.now()` 때문에 필요해요.)
- 작업이 끝나면 `npm run build`와 `npm run lint`가 통과하는지 확인해요.

## 아직 예시(가짜) 데이터인 것
- 홈·카테고리·검색의 매물은 `src/lib/market.ts`의 `SAMPLE_ITEMS` 예시예요. "물건 올리기" 단계에서 DB 테이블로 바꿀 예정이에요.
- 동네생활 / 채팅 / 글쓰기 / 나의 고구마의 메뉴들은 "준비 중" 화면이에요.

## 디자인 규칙
- 테마: 구황작물·향토 느낌(한지 배경, 흙색 글자, 고구마 껍질 자주색, 군고구마 속살 노란색).
- 색과 버튼은 `src/app/globals.css`의 `@theme` / `@utility`(`card-sack`, `btn-goguma`, `btn-straw`, `field`, `stitch`)를 재사용해요.
- 고구마 캐릭터(`src/components/GogumaLogo.tsx`)는 **귀엽게** 유지해요. 꼬불꼬불한 김(냄새처럼 보임)이나 지저분한 검은 점은 넣지 않아요.
