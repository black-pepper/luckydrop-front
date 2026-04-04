# LuckyDrop 추가 페이지 분석 및 Message Box API 명세

## 1. 비교 결과

현재 프론트엔드 `src` 기준으로 이미 구현된 화면은 아래와 같습니다.

- `/`: 추첨 참여 페이지
- `/admin/login`: 관리자 로그인
- `/admin`: 관리자 대시보드
- `/admin/create`: 콘텐츠 생성
- `/admin/manage/:id`: 콘텐츠 관리

`luckydrop-ui` 저장소 기준으로 추가된 화면은 아래와 같습니다.

- `/`: 랜딩 페이지
- `/draw`: 기존 추첨 참여 페이지 이동
- `/messagebox`: 메시지함 소개
- `/messagebox/write`: 메시지 작성
- `/messagebox/list`: 메시지 목록
- `/messagebox/view/:id`: 메시지 상세
- `/admin/messagebox/:id`: 관리자 메시지함 관리

정리하면, 실제 백엔드 API가 필요한 신규 기능은 `message box` 도메인입니다. 랜딩 페이지는 정적 UI 성격이 강해서 이번 기준에서는 전용 API가 필수는 아닙니다.

## 2. 전제 및 권장 계약

### 콘텐츠 식별 방식

UI 시안에는 참여자용 메시지함 경로에 `contentId` path param이 없습니다. 실제 서비스에서는 어떤 메시지함에 접근했는지 식별할 수 있어야 하므로 아래 둘 중 하나가 필요합니다.

1. 권장: `/messagebox/:contentId`, `/messagebox/:contentId/write` 같은 경로 구조로 변경
2. 대안: 기존 라우트를 유지하고 `?contentId=123` 쿼리 파라미터 사용

이 문서는 **쿼리 파라미터 `contentId`를 사용한다는 가정**으로 작성했습니다. 추후 path param으로 바꾸더라도 API 의미는 동일합니다.

### 인증

- 참여자용 API: 비인증
- 관리자용 API: 관리자 인증 필요
- 관리자 인증 수단은 기존 백엔드 정책에 맞춰 세션 또는 JWT 사용

### 공통 응답 형식

기존 프론트의 `src/api/types.ts` 형식을 따라 아래 래퍼를 유지하는 것을 권장합니다.

```json
{
  "success": true,
  "data": {},
  "message": "optional"
}
```

## 3. 페이지별 필요 API

### 3-1. `/messagebox`

화면 목적:

- 메시지함 소개 문구 노출
- 메시지 작성 가능 여부 확인
- 전체 목록 공개 여부 확인

필요 API:

#### `GET /api/message-box/contents/{contentId}/public`

설명:

- 참여자용 메시지함 진입 시 필요한 공개 설정과 소개 문구 조회

응답 예시:

```json
{
  "success": true,
  "data": {
    "contentId": 31,
    "title": "익명 메시지함",
    "description": "익명으로 마음을 전해보세요.",
    "status": "ACTIVE",
    "allowWrite": true,
    "allowPublicList": true,
    "anonymousNotice": "모든 메시지는 익명으로 전달됩니다.",
    "privacyWarning": "이름, 연락처 등 개인정보는 입력하지 마세요."
  }
}
```

필드 메모:

- `allowWrite=false`면 작성 버튼 비활성화 또는 안내 문구 표시
- `allowPublicList=false`면 목록 보기 버튼 숨김
- `status`가 `ENDED`면 작성 제한 처리

### 3-2. `/messagebox/write`

화면 목적:

- 익명 메시지 작성 및 등록

필요 API:

#### `POST /api/message-box/contents/{contentId}/messages`

요청 본문:

```json
{
  "content": "응원합니다. 늘 고마워요."
}
```

검증 규칙 권장:

- `content`: 필수
- trim 후 빈 문자열 불가
- 최대 500자
- 금칙어/신고어 필터는 선택

응답 예시:

```json
{
  "success": true,
  "data": {
    "messageId": 10021,
    "createdAt": "2026-04-01T22:30:00+09:00"
  }
}
```

오류 케이스:

- 메시지함 종료
- 작성 차단 상태
- 글자 수 초과
- 존재하지 않는 `contentId`

### 3-3. `/messagebox/list`

화면 목적:

- 공개 가능한 메시지 목록 조회

필요 API:

#### `GET /api/message-box/contents/{contentId}/messages`

쿼리 파라미터:

- `cursor`: optional
- `size`: optional, 기본 20

설명:

- 공개 목록 화면용 메시지 요약 목록 조회
- `allowPublicList=false`인 경우 403 또는 비공개 상태 응답

응답 예시:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "messageId": 10021,
        "preview": "응원합니다. 늘 고마워요.",
        "createdAt": "2026-04-01T22:30:00+09:00"
      },
      {
        "messageId": 10020,
        "preview": "항상 잘 보고 있어요.",
        "createdAt": "2026-04-01T19:10:00+09:00"
      }
    ],
    "nextCursor": "10020",
    "hasNext": true
  }
}
```

필드 메모:

- UI에서는 `relativeTime` mock 값을 쓰지만, 실제 API는 `createdAt`만 내려주고 프론트에서 상대시간 포맷팅하는 편이 좋음
- `preview`는 서버에서 2줄 분량으로 잘라 내려도 되고, 원문 일부를 내려주고 프론트에서 line clamp 처리해도 됨

### 3-4. `/messagebox/view/:id`

화면 목적:

- 메시지 단건 상세 조회
- 이전/다음 메시지 이동

필요 API:

#### `GET /api/message-box/contents/{contentId}/messages/{messageId}`

응답 예시:

```json
{
  "success": true,
  "data": {
    "messageId": 10021,
    "content": "응원합니다. 늘 고마워요.",
    "createdAt": "2026-04-01T22:30:00+09:00",
    "prevMessageId": 10020,
    "nextMessageId": 10022
  }
}
```

필드 메모:

- 이전/다음 이동 버튼 구현을 위해 `prevMessageId`, `nextMessageId` 포함 권장
- 비공개 목록인 경우 상세 접근도 함께 막는 정책이 자연스러움

### 3-5. `/admin/messagebox/:id`

화면 목적:

- 관리자용 메시지 검색/목록/상세/삭제
- 메시지함 공개 설정 수정

필요 API는 두 그룹입니다.

#### A. 관리자용 메시지함 기본 정보 조회

`GET /api/admin/message-box/contents/{contentId}`

응답 예시:

```json
{
  "success": true,
  "data": {
    "contentId": 31,
    "title": "익명 메시지함",
    "status": "ACTIVE",
    "messageCount": 128,
    "allowWrite": true,
    "allowPublicList": true,
    "anonymousNotice": "모든 메시지는 익명으로 전달됩니다.",
    "privacyWarning": "이름, 연락처 등 개인정보는 입력하지 마세요.",
    "createdAt": "2026-03-20T10:00:00+09:00",
    "updatedAt": "2026-04-01T20:10:00+09:00"
  }
}
```

#### B. 관리자용 메시지 목록 조회

`GET /api/admin/message-box/contents/{contentId}/messages`

쿼리 파라미터:

- `page`: 기본 0
- `size`: 기본 20
- `keyword`: optional

응답 예시:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "messageId": 10021,
        "content": "응원합니다. 늘 고마워요.",
        "createdAt": "2026-04-01T22:30:00+09:00"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 128,
    "totalPages": 7
  }
}
```

관리자 화면에서는 전체 본문 검색이 필요하므로 `keyword` 검색 지원 권장.

#### C. 관리자용 메시지 단건 조회

`GET /api/admin/message-box/contents/{contentId}/messages/{messageId}`

응답 예시:

```json
{
  "success": true,
  "data": {
    "messageId": 10021,
    "content": "응원합니다. 늘 고마워요.",
    "createdAt": "2026-04-01T22:30:00+09:00"
  }
}
```

`ManageMessageBox` 화면의 보기 버튼 모달 또는 상세 패널에서 사용 가능합니다.

#### D. 관리자용 메시지 삭제

`DELETE /api/admin/message-box/contents/{contentId}/messages/{messageId}`

응답 예시:

```json
{
  "success": true,
  "data": {
    "deleted": true
  }
}
```

삭제 정책 메모:

- 실제 삭제 대신 soft delete 권장
- 참여자 공개 목록과 관리자 목록 모두 삭제 반영

#### E. 메시지함 설정 수정

`PATCH /api/admin/message-box/contents/{contentId}/settings`

요청 본문:

```json
{
  "allowWrite": true,
  "allowPublicList": true,
  "anonymousNotice": "모든 메시지는 익명으로 전달됩니다.",
  "privacyWarning": "이름, 연락처 등 개인정보는 입력하지 마세요."
}
```

응답 예시:

```json
{
  "success": true,
  "data": {
    "contentId": 31,
    "allowWrite": true,
    "allowPublicList": true,
    "anonymousNotice": "모든 메시지는 익명으로 전달됩니다.",
    "privacyWarning": "이름, 연락처 등 개인정보는 입력하지 마세요.",
    "updatedAt": "2026-04-01T22:35:00+09:00"
  }
}
```

## 4. 스프링 백엔드 DTO 예시

### PublicMessageBoxInfoResponse

```java
public record PublicMessageBoxInfoResponse(
    Long contentId,
    String title,
    String description,
    String status,
    boolean allowWrite,
    boolean allowPublicList,
    String anonymousNotice,
    String privacyWarning
) {}
```

### CreateMessageRequest

```java
public record CreateMessageRequest(
    @NotBlank
    @Size(max = 500)
    String content
) {}
```

### MessageSummaryResponse

```java
public record MessageSummaryResponse(
    Long messageId,
    String preview,
    OffsetDateTime createdAt
) {}
```

### MessageDetailResponse

```java
public record MessageDetailResponse(
    Long messageId,
    String content,
    OffsetDateTime createdAt,
    Long prevMessageId,
    Long nextMessageId
) {}
```

### AdminMessageBoxSettingsRequest

```java
public record AdminMessageBoxSettingsRequest(
    boolean allowWrite,
    boolean allowPublicList,
    @Size(max = 200)
    String anonymousNotice,
    @Size(max = 200)
    String privacyWarning
) {}
```

## 5. 프론트 연동 시 추가 반영 포인트

- `src/App.tsx` 기준 라우팅 차이 반영 필요
- 기존 `/` 추첨 페이지는 `luckydrop-ui`처럼 `/draw`로 이동하는 것이 자연스러움
- 메시지함 참여자 페이지는 현재 UI 시안만 있고 실제 API 연결 코드는 없음
- 관리자 대시보드 카드에서 `type === "messagebox"`인 경우 `/admin/messagebox/:id`로 이동하도록 분기 필요
- 상대시간은 서버보다 프론트 포맷팅이 유지보수에 유리

## 6. 이번 비교 기준에서 API가 필요 없는 페이지

### 랜딩 페이지

`luckydrop-ui/src/pages/Landing.tsx`는 CTA 이동 중심 화면이라 현재 기준에서는 별도 API가 없어도 구현 가능합니다.

필요하다면 나중에 아래 정도만 추가 검토하면 됩니다.

- 공개 콘텐츠 추천 목록
- 통계 배지
- 운영 공지
