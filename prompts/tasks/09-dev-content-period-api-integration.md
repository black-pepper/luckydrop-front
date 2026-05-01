# 📝 작업 프롬프트: 컨텐츠 기간 관리 기능 추가 및 UI 연동

## 1. 작업 개요
컨텐츠(이벤트)의 시작일과 종료일을 관리할 수 있는 기능을 추가하고, 참여자 페이지(`/draw/{code}`)에서 해당 정보를 반영하여 UI를 동적으로 표시하며, 기간에 따른 참여 제한 로직을 구현합니다.

## 2. 참조 문서 및 규칙
- `prompts/common-rules.md`: 공통 개발 규칙 준수
- `prompts/modes/development.md`: 개발 모드 가이드 준수

## 3. 수정 필요 파일 및 작업 상세

### 📂 `src/api/types.ts` (API 타입 정의)
- 아래 인터페이스들에 `startAt?: string;` 및 `endAt?: string;` (ISO date-time 형식) 필드 추가
  - `ParticipantContentDetailResponse`
  - `ManageContentResponse`
  - `ManageContentDetailResponse`
  - `ManageContentCreateRequest`
  - `ManageContentUpdateRequest`

### 📂 `src/pages/Index.tsx` (참여자 메인 페이지)
- `getParticipantContentDetail` API를 사용하여 접속한 `contentCode`에 대한 상세 정보를 페치합니다.
- 페치된 `title`, `description`, `startAt`, `endAt` 정보를 `CodeInputCard`와 `UserInfoCard`에 props로 전달합니다.
- 현재 시간이 이벤트 기간(`startAt` ~ `endAt`) 내에 있는지 판단하는 로직을 추가합니다. (`null`인 경우 무제한)

### 📂 `src/components/draw/CodeInputCard.tsx` (코드 입력 카드)
- 하드코딩된 제목("🎉 럭키 드로우"), 설명("발급받은 코드를 입력하고..."), 기간("이벤트 기간: ...")을 props로 받은 데이터로 대체합니다.
- 기간 정보가 `null`인 경우 "무기한" 또는 해당 섹션을 생략하도록 처리합니다.

### 📂 `src/components/draw/UserInfoCard.tsx` (사용자 정보 및 뽑기 버튼 카드)
- 이벤트 기간 종료 여부(`isExpired`)를 props로 전달받습니다.
- **뽑기 버튼 상태 및 텍스트 변경:**
  - 남은 기회가 있고(`remainingDraws > 0`) 이벤트 기간 중이면: 버튼 활성화 ("🎰 뽑기 시작!")
  - 남은 기회가 없으면(`remainingDraws <= 0`): 버튼 비활성화, 텍스트 "기회가 모두 소진되었습니다" 표시
  - 이벤트 기간이 지났으면(`isExpired`): 버튼 비활성화, 텍스트 "종료되었습니다." 표시

### 📂 `src/pages/manage/CreateContent.tsx` (관리자 컨텐츠 생성)
- 2단계(기본 정보) UI에 시작일(`startAt`)과 종료일(`endAt`)을 입력할 수 있는 필드를 추가합니다. (`<Input type="datetime-local" />` 등 활용)
- 컨텐츠 생성 API 호출 시 해당 값을 포함합니다.

### 📂 `src/pages/manage/ManageContent.tsx` (관리자 컨텐츠 관리)
- '기본정보' 탭의 수정 모드에서 시작일(`startAt`)과 종료일(`endAt`)을 수정할 수 있도록 UI를 추가합니다.
- 컨텐츠 수정 API 호출 시 해당 값을 포함합니다.

## 4. 관련 API (수정 대상)
제공된 OpenAPI 스펙에 따라 다음 API들의 Request/Response Body에 `startAt`, `endAt` 필드를 반영합니다:
- `GET /api/draw/contents/{contentCode}` (`ParticipantContentDetailResponse`)
- `GET /api/manage/contents` (`ManagerContentResponse`)
- `POST /api/manage/contents` (`ManagerContentCreateRequest`)
- `GET /api/manage/contents/{contentCode}` (`ManagerContentDetailResponse`)
- `PUT /api/manage/contents/{contentCode}` (`ManagerContentUpdateRequest`)

## 5. 제약 및 주의사항
- 컨텐츠 시작일 및 종료일은 선택사항입니다. `null`인 경우 무제한으로 간주합니다.
- 기존의 레이아웃과 디자인 시스템(shadcn/ui, Tailwind CSS)을 유지하며 자연스럽게 통합합니다.
- 날짜 표시 시 사용자 로케일에 맞는 형식(예: `YYYY.MM.DD HH:mm`)을 사용합니다.
