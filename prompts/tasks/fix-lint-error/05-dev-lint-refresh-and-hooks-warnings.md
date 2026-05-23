파일명:
- 05-dev-lint-refresh-and-hooks-warnings.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- 남아 있는 ESLint warnings를 가능한 범위에서 정리한다.

배경:
- 주요 warning:
  - Fast Refresh: `react-refresh/only-export-components`
  - Hook dependency: `react-hooks/exhaustive-deps`
- 대상 파일:
  - `src/components/manage/DrawModeTabs.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/ui/button.tsx`
  - `src/components/ui/form.tsx`
  - `src/components/ui/navigation-menu.tsx`
  - `src/components/ui/sidebar.tsx`
  - `src/components/ui/sonner.tsx`
  - `src/components/ui/toggle.tsx`
  - `src/pages/manage/ManageLogin.tsx`

포함 범위:
- Fast Refresh warning은 컴포넌트 export와 상수/헬퍼 export 분리 가능성을 확인한다.
- 기존 shadcn/ui 패턴이 있다면 그 구조를 우선 존중한다.
- Hook dependency warning은 effect 내부 의존성과 함수 안정성을 확인한 뒤 수정한다.
- warning 수정이 동작 변경을 만들 수 있으면 영향 범위를 명시한다.

제외 범위:
- UI 컴포넌트 디자인 변경은 하지 않는다.
- 컴포넌트 API를 깨는 export 변경은 하지 않는다.
- 경고 제거를 위해 ESLint 규칙을 끄지 않는다.

제약:
- Fast Refresh 대응을 위해 파일 분리가 필요하면 최소 파일만 추가한다.
- Hook dependency는 단순히 배열에 값을 추가하기 전에 무한 렌더링 가능성을 확인한다.
- 기존 import 경로와 barrel export 영향을 확인한다.

명명 규칙:
- 분리 파일이 필요하면 기존 파일명 기준으로 역할이 드러나게 작성한다.
- 예: `button-variants.ts`, `sidebar-context.tsx` 등 기존 스타일에 맞춘다.

완료 조건:
- 대상 warning이 제거되거나, 제거하지 못한 warning의 이유와 리스크를 명확히 보고한다.
- `npm run lint` 결과를 보고한다.
