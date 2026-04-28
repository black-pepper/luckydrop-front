# LuckDrop Frontend

LuckDrop은 다양한 추첨 이벤트를 생성하고 관리할 수 있는 플랫폼의 프론트엔드 애플리케이션입니다. 사용자는 이벤트 코드와 초대 코드를 통해 추첨에 참여하고, 관리자는 대시보드를 통해 이벤트, 경품, 초대 코드를 체계적으로 관리할 수 있습니다.

## 주요 기능

### 참여자 페이지 (Participant)
- **추첨 참여**: 이벤트 코드(`contentCode`)와 초대 코드(`invitationCode`)를 입력하여 실시간 추첨 결과 확인.
- **경품 목록 조회**: 현재 진행 중인 이벤트의 경품 리스트와 잔여 수량 확인.
- **추첨 내역**: 본인이 참여한 추첨 결과 히스토리 조회.
- **반응형 디자인**: 모바일 및 데스크탑 환경에 최적화된 UI 제공.

### 주최자 페이지 (Manager)
- **대시보드**: 전체 이벤트 현황 파악 및 관리.
- **콘텐츠 관리**: 새로운 추첨 이벤트 생성, 수정, 삭제 및 기간 설정.
- **경품 관리**: 이벤트별 경품 등록, 가중치(확률) 설정, 재고 관리 및 이미지 업로드.
- **초대 코드 관리**: 개별 또는 일괄 초대 코드 생성, 사용 횟수 제한 및 유효기간 설정.
- **당첨 결과 추적**: 실시간 당첨 내역 확인 및 경품 지급(배송) 상태 관리.
- **인증**: Supabase Auth를 이용한 안전한 주최자 로그인.

## 기술 스택

- **Framework**: [React 18](https://reactjs.org/) (Vite)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI/Styling**: [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Form Management**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **HTTP Client**: Native [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) with custom wrappers

## 시작하기

### 사전 준비 사항
- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

1. **저장소 클론**
   ```sh
   git clone <repository-url>
   cd luckdrop-front
   ```

2. **의존성 설치**
   ```sh
   npm install
   ```

3. **환경 변수 설정**
   `.env.example` 파일을 복사하여 `.env` 파일을 생성하고 필요한 값을 입력합니다.
   ```sh
   cp .env.example .env
   ```
   - `VITE_API_BASE_URL`: 백엔드 API 서버 주소
   - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase 익명 키

4. **개발 서버 실행**
   ```sh
   npm run dev
   ```

## 프로젝트 구조

```text
src/
├── api/             # API 통신 클라이언트 및 타입 정의
├── components/      # 공통 UI 컴포넌트 및 도메인별 컴포넌트
│   ├── draw/        # 참여자 추첨 관련 컴포넌트
│   ├── manage/      # 관리자 페이지 관련 컴포넌트
│   └── ui/          # shadcn/ui 기반 기본 컴포넌트
├── hooks/           # 커스텀 훅
├── lib/             # 외부 라이브러리 설정 (Supabase, utils 등)
├── pages/           # 페이지 컴포넌트 (라우트 단위)
│   └── manage/      # 관리자 관련 페이지
└── test/            # 테스트 관련 설정 및 예시
```

## 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 프로덕션 빌드
- `npm run lint`: 린트 체크
- `npm run test`: 테스트 실행

## 라이선스

본 프로젝트의 라이선스는 해당 기관/개인의 정책에 따릅니다.
