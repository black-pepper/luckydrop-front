파일명:
- 04-draft-dev-admin-reward-api-integration.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- 관리자용 보상 화면에서 사용하는 mock 데이터를 실제 API 호출로 교체한다.
- 보상 목록 조회, 단건 조회, 생성, 수정, 삭제 5가지 API를 연결한다.

배경:
- 현재 `src/data/adminMockData.ts`의 `mockRewards` 배열로 보상 데이터를 표시하고 있다.
- `src/api/client.ts`에 admin 콘텐츠 API 함수들이 정의되어 있으며, 동일한 `authRequest` 패턴을 따른다.
- `src/api/types.ts`에 `RewardResponse` 타입이 이미 존재하며, 추가 타입 정의가 필요하다.
- 보상은 콘텐츠(`contentId`)에 속하는 구조이므로 목록 조회 시 `contentId`를 query param으로 전달한다.
- 인증은 Supabase 세션 토큰(`Authorization: Bearer`)을 사용하는 `authRequest`로 처리한다.

추가 API 명세:
- GET    /api/admin/rewards?contentId={contentId}  → 콘텐츠별 보상 목록 조회
- POST   /api/admin/rewards                        → 보상 생성
- GET    /api/admin/rewards/{rewardId}             → 단건 보상 조회
- PUT    /api/admin/rewards/{rewardId}             → 보상 수정
- DELETE /api/admin/rewards/{rewardId}             → 보상 삭제

응답 스키마:
- 단건: ApiResponse<AdminRewardResponse>
- 목록: ApiResponse<AdminRewardResponse[]>
- 삭제: ApiResponse<void>

포함 범위:
- `src/api/types.ts`: `AdminRewardResponse`, `RewardCreateRequest`, `RewardUpdateRequest` 타입 추가
- `src/api/client.ts`: 5개 admin reward API 함수 추가
  - `getAdminRewardsByContent(contentId: number)`
  - `getAdminReward(rewardId: number)`
  - `createAdminReward(payload: RewardCreateRequest)`
  - `updateAdminReward(rewardId: number, payload: RewardUpdateRequest)`
  - `deleteAdminReward(rewardId: number)`
- 보상 관련 admin 페이지/컴포넌트에서 mock 데이터 호출을 위 함수로 교체
- 로딩 상태 및 에러 처리는 기존 admin 페이지 패턴과 동일하게 적용

제외 범위:
- 보상 화면 UI 레이아웃 변경
- 사용자(비관리자)용 보상 관련 화면
- 콘텐츠 API 수정
- 테스트 코드 작성 (별도 verify 프롬프트로 분리)

제약:
- 모든 파일은 UTF-8로 저장
- 기존 `authRequest` 함수 재사용, 새 인증 로직 추가 금지
- 타입 명명은 기존 패턴(`AdminXxxResponse`, `XxxCreateRequest`, `XxxUpdateRequest`) 유지
- `RewardResponse`(기존)와 `AdminRewardResponse`(신규)의 역할 차이를 명확히 구분
- mock 데이터는 교체 후 참조가 없으면 제거하되, 다른 곳에서 사용 중이면 유지

명명 규칙:
- 타입: `AdminRewardResponse`, `RewardCreateRequest`, `RewardUpdateRequest`
- API 함수: `getAdminRewardsByContent`, `getAdminReward`, `createAdminReward`, `updateAdminReward`, `deleteAdminReward`
- 기존 용어 `reward` / `Reward` 유지, `prize` 등 혼용 금지

완료 조건:
- 보상 목록 화면에서 `contentId`를 전달해 실제 API로 목록을 불러온다.
- 보상 생성/수정/삭제 시 실제 API를 호출하고 결과를 화면에 반영한다.
- mock 데이터 의존이 제거(또는 최소화)된다.
- 기존 admin 콘텐츠 화면 동작에 영향이 없다.
- 빌드 오류 없음.

추가 API 문서

```
/api/admin/rewards":{"get":{"tags":["admin-reward-controller"],"operationId":"getRewardsByContent","parameters":[{"name":"contentId","in":"query","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseListAdminRewardResponse"}}}}},"security":[{"bearerAuth":[]}]},"post":{"tags":["admin-reward-controller"],"operationId":"createReward","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RewardCreateRequest"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseAdminRewardResponse"}}}}},"security":[{"bearerAuth":[]}]}},
"/api/admin/rewards/{rewardId}":{"get":{"tags":["admin-reward-controller"],"operationId":"getReward","parameters":[{"name":"rewardId","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseAdminRewardResponse"}}}}},"security":[{"bearerAuth":[]}]},"put":{"tags":["admin-reward-controller"],"operationId":"updateReward","parameters":[{"name":"rewardId","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/RewardUpdateRequest"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseAdminRewardResponse"}}}}},"security":[{"bearerAuth":[]}]},"delete":{"tags":["admin-reward-controller"],"operationId":"deleteReward","parameters":[{"name":"rewardId","in":"path","required":true,"schema":{"type":"integer","format":"int64"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseVoid"}}}}},"security":[{"bearerAuth":[]}]}},
```

