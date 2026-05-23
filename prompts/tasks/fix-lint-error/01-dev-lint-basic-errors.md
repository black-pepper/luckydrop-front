파일명:
- 01-dev-lint-basic-errors.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- ESLint errors 중 작은 범위의 오류를 먼저 수정한다.
- 빈 interface, `prefer-const`, `require()` import 사용 문제를 해결한다.

배경:
- `npm run lint` 실행 시 ESLint 오류로 실패한다.
- 대상 오류:
  - `src/components/ui/command.tsx:24` 빈 interface
  - `src/components/ui/textarea.tsx:5` 빈 interface
  - `src/pages/manage/ManageContent.tsx:1225` `let` 대신 `const`
  - `tailwind.config.ts:100` `require()` import 사용

포함 범위:
- 빈 interface는 기존 props 타입 의미를 유지하면서 `type` 또는 직접 타입 사용으로 변경한다.
- 재할당되지 않는 `let`은 `const`로 변경한다.
- Tailwind plugin import는 TypeScript/ESLint 규칙에 맞게 변경한다.
- 변경 후 관련 파일 기준으로 타입 오류 가능성을 확인한다.

제외 범위:
- `any` 타입 제거 작업은 이번 작업에서 제외한다.
- Fast Refresh warning과 Hook dependency warning은 제외한다.
- 기능 리팩터링이나 UI 변경은 하지 않는다.

제약:
- 기존 컴포넌트 API와 export 이름을 유지한다.
- 변경 범위는 lint 오류 해결에 필요한 최소 범위로 제한한다.
- 모든 파일은 UTF-8로 유지한다.

명명 규칙:
- 새 파일은 만들지 않는다.
- 새 타입이 필요하면 기존 컴포넌트명과 역할이 드러나게 작성한다.

완료 조건:
- 위 4개 lint error가 해결된다.
- 수정한 파일에 불필요한 동작 변경이 없다.
- 실행 가능하면 `npm run lint` 또는 관련 검증 명령 결과를 보고한다.
