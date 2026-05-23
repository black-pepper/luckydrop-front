파일명:
- 04-dev-lint-manage-content-any.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- `ManageContent.tsx`에 집중해서 다수의 `any` 타입 사용을 제거한다.

배경:
- `src/pages/manage/ManageContent.tsx`에서 `@typescript-eslint/no-explicit-any` 오류가 다수 발생한다.
- 대상 위치:
  - 587, 612, 663, 713, 725, 757, 772, 806, 837, 849

포함 범위:
- `ManageContent.tsx`의 주요 데이터 타입, 이벤트 타입, API 응답 타입을 파악한다.
- 반복되는 구조는 공통 타입으로 정리하되, 과도한 리팩터링은 하지 않는다.
- `any`를 실제 타입, 기존 타입, 제네릭, `unknown` 후 타입 좁히기 중 적절한 방식으로 교체한다.
- 동일한 데이터 개념은 하나의 타입 명명 기준으로 통일한다.

제외 범위:
- 화면 구조, 상태 관리 방식, API 호출 방식의 대규모 변경은 제외한다.
- lint와 직접 관련 없는 리팩터링은 하지 않는다.
- Fast Refresh warning과 Hook dependency warning은 제외한다.

제약:
- 변경 전후 사용자 동작이 같아야 한다.
- 타입을 맞추기 위해 런타임 동작을 임의로 바꾸지 않는다.
- 타입 단언은 필요한 경우에만 최소 범위로 사용하고 이유가 드러나게 한다.

명명 규칙:
- 새 타입은 `ManageContent...`, `Content...`, 기존 도메인 용어 중 현재 파일의 표현과 가장 일관된 이름을 사용한다.
- API 응답 타입과 UI 상태 타입을 혼동하지 않는다.

완료 조건:
- `ManageContent.tsx`의 명시적 `any` 오류가 제거된다.
- 기존 기능 흐름이 유지된다.
- `npm run lint`를 실행해 남은 오류와 경고를 보고한다.
