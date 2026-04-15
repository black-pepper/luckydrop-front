# Prompt Draft: 08-draft-dev-manage-draw-results-api.md

## 1. Task Type
- Development

## 1-1. Prompt File Name
- 작업 번호: 08
- 단계: `draft`
- 유형: `dev`
- 작업 슬러그: `manage-draw-results-api`
- 최종 파일명: `08-draft-dev-manage-draw-results-api.md`

## 2. Goal
- 관리 페이지(`/manage/{code}`)에서 사용될 추첨 결과 목록 조회 API와 상품 지급 상태 변경 API 연동 코드를 추가한다.

## 3. Background
- 관리자는 자신이 생성한 콘텐츠의 추첨 결과(당첨 내역)를 확인하고, 실제 경품이 지급되었는지 상태를 관리할 수 있어야 한다.
- 참고 파일: `src/api/client.ts`, `src/api/types.ts`, `src/pages/manage/ManageContent.tsx`

## 4. Scope
### Include
- `src/api/types.ts`에 추첨 결과 관련 DTO 및 Response 타입 추가
- `src/api/client.ts`에 추첨 결과 목록 조회 및 지급 상태 수정 API 함수 추가
- `src/pages/manage/ManageContent.tsx`에서 목록 조회 API를 호출하여 데이터를 가져오는 로직 추가

### Exclude
- 신규 UI 컴포넌트 추가 또는 기존 UI 레이아웃 변경
- 지급 상태 변경(delivery) API의 실제 호출 실행 (API 정의만 수행)

## 5. Constraints
- **UI를 추가하지 말 것**: 기존 UI 구조 내에서 데이터 연동만 수행한다.
- **지급 상태 변경 API**: API 호출 함수는 작성하되, 이번 작업 범위에서는 호출 버튼 연동 등 실제 사용은 하지 않는다.
- 모든 파일은 UTF-8로 저장한다.
- 기존의 API 클라이언트 구조와 네이밍 규칙을 엄격히 준수한다.

## 6. Naming Plan
- API 함수명: `getAdminDrawResults`, `updateDeliveryStatus`
- 관련 타입명: `AdminDrawResultResponse`, `DrawResultDeliveryUpdateRequest`
- 용어 통일: `draw-results` (추첨 결과), `delivery` (지급)

## 7. Deliverables
- `src/api/types.ts` 수정 사항
- `src/api/client.ts` 수정 사항
- `src/pages/manage/ManageContent.tsx` 수정 사항 (데이터 로딩 로직)

## 8. Final Prompt Draft

```md
파일명: 08-run-dev-manage-draw-results-api.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- 관리자용 추첨 결과 조회 및 지급 상태 수정 API 연동

배경 API 정보:

1. 관리자용 추첨 결과 목록 조회
   - 엔드포인트: GET /api/manage/draw-results
   - 쿼리 파라미터: contentCode (string, 필수)
   - 응답: ApiResponseListAdminDrawResultResponse
     - data: AdminDrawResultResponse[]
       - drawResultId (number)
       - invitationCode (string)
       - invitationCodeName (string)
       - rewardName (string)
       - drawNo (number)
       - drawnAt (string, date-time)
       - delivered (boolean)

2. 상품 지급 여부 수정
   - 엔드포인트: PUT /api/manage/draw-results/{drawResultId}/delivery
   - 경로 파라미터: drawResultId (number, 필수)
   - 요청 바디: DrawResultDeliveryUpdateRequest
     - delivered (boolean, 필수)
   - 응답: ApiResponseAdminDrawResultResponse

포함 범위:
- src/api/types.ts: 위 명세에 따른 Interface 및 Type 정의 추가
- src/api/client.ts: axios를 사용한 API 호출 함수 2종 추가
- src/pages/manage/ManageContent.tsx: 페이지 진입 시 contentCode를 기반으로 getAdminDrawResults를 호출하여 데이터를 관리하는 로직 추가

제외 범위:
- 새로운 UI 컴포넌트 제작
- updateDeliveryStatus API의 실제 호출 트리거(버튼 등) 추가

제약:
- 기존 프로젝트의 API 호출 패턴(client.ts 활용)을 그대로 유지한다.
- UI 변경 없이 내부 데이터 상태 관리 로직만 보강한다.

완료 조건:
- API 타입 정의가 올바르게 추가됨
- API 호출 함수가 client.ts에 등록됨
- 관리 페이지에서 실제 API를 통해 추첨 결과 데이터를 성공적으로 불러오는지 확인 (콘솔 로그 또는 기존 UI 바인딩)
```
