# Repository Instructions

## Notion Context

When the Notion connector is available, read only the Notion pages that are relevant to the current task.

- `frontend-project-context`
  - Page: https://app.notion.com/p/36b41a6b4b05813090beec832adce1b3
  - Use for stack, routing, API/auth rules, environment variables, scripts, and repository structure.
- `frontend-design-spec`
  - Page: https://app.notion.com/p/36b41a6b4b058112bea8d82b3d41048d
  - Use for UI tone, colors, typography, layout, motion, and component patterns.

If the connector cannot fetch the pages, state that clearly before making assumptions and continue from the local codebase.

## Project Conventions

- Prefer existing routes, API wrappers, type names, hooks, and component patterns before adding new abstractions.
- Public participant API calls should use the existing request wrapper.
- Authenticated management API calls should use the existing auth request wrapper and Supabase session token flow.
- Use string `code` values as identifiers instead of numeric IDs.
- Use existing local shadcn/ui-style components in `src/components/ui` before creating new UI primitives.
- Keep UI changes aligned with `components.json`, `src/index.css`, `tailwind.config.ts`, and existing `src/components/ui` usage.
- Do not change dependency versions unless the user explicitly asks for it or approves it.
- Environment variables are managed through GitHub repository secrets. Do not add or change environment variables arbitrarily in code or config; ask the user to add or update GitHub Secrets when needed.

## Verification

- Run the narrowest relevant checks for the change.
- For broad frontend changes, prefer `npm run lint`, `npm run test`, and `npm run build` when practical.
