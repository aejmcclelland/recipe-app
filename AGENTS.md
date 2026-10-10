# Rebekah's Recipes — Codex Instructions

## Project scope

Rebekah's Recipes is a publicly deployed, production-style Next.js recipe application, with the long-term goal of becoming a reliable, maintainable product.

Development should follow sound software engineering practices while remaining proportionate to the application's current requirements.

When making changes:

- Follow existing project patterns before introducing new ones.
- Keep changes small, focused and maintainable.
- Preserve existing functionality unless explicitly asked to change it.
- Prioritise security, authorisation, data integrity, accessibility and reliable error handling.
- Treat authentication, user data and external integrations as production concerns.
- Avoid premature abstraction, unnecessary dependencies and speculative features.
- Do not introduce unrelated changes or expand the scope of a task without approval.
- Prefer straightforward solutions that can be understood, tested and maintained by a single developer.

## Technology and project guides

- Next.js App Router, React 19, TypeScript, NextAuth, MongoDB/Mongoose, Material UI and Tailwind CSS.
- For Next.js work, consult the relevant documentation bundled with the installed version at `node_modules/next/dist/docs/` before implementing changes.
- For React components, hooks, state, effects, forms, or rendering, read `docs/technologies/react.md`.
- For Material UI changes, read `docs/technologies/mui.md`.
- Follow the relevant local guides and current installed framework APIs; do not introduce deprecated Next.js patterns.

## Implementation standards

- Prefer Server Components unless client-side behaviour requires a Client Component.
- Preserve type safety; do not introduce `any`.
- Reuse existing utilities, database helpers, UI components and styling patterns.
- Keep components and functions focused; avoid abstractions that have only one speculative use.
- Preserve accessibility and meaningful error feedback for changed user flows.

## Data, authentication and security

- MongoDB is accessed through Mongoose. Preserve existing schemas, relationships, indexes and validation unless a requested task requires changes.
- Do not modify authentication configuration or session flows unless required for the requested change; explain any proposed change.
- Enforce authorization and ownership on the server, not only in the UI.
- Never expose secrets, credentials or private user data in code, logs or test fixtures.
- Reuse existing validation and security controls (including rate limiting) rather than creating parallel mechanisms.
- Changes affecting permissions, account access, or persistent data require focused regression coverage.

## Testing policy — risk-based and proportionate

Testing should protect important behaviour without creating a large, brittle suite. Do not treat test count or coverage percentage as a target.

Prioritise tests for:
- Authentication, logout, session expiry, protected routes and authorization/ownership boundaries.
- Security controls and validation, especially where a user could access or modify another user's data.
- Recipe create/edit/delete flows, data integrity, and other meaningful mutations.
- User-input forms: required fields, validation, submission and useful failure feedback.
- External API and recipe-scraping integrations: valid responses, failures, malformed data and graceful recovery.
- Nontrivial business logic and regressions caused by the requested change.

Avoid by default:
- Cosmetic assertions (exact colours, shadows, padding), decorative-image loading checks, and broad screenshot/snapshot coverage.
- Duplicating the same test across multiple browsers and viewports without a specific compatibility risk.
- Tests of internal implementation details when an observable behaviour can be tested instead.
- Network-dependent tests when deterministic local fixtures or mocks adequately cover the behaviour.
- Arbitrary sleeps, inflated timeouts, or extra retries to conceal a flaky assertion.

Before adding or changing tests:
1. Review existing coverage and identify the concrete regression each proposed test would detect.
2. Prefer the cheapest appropriate level: unit/integration for logic and validation; Playwright for essential end-to-end journeys.
3. Add only the minimum tests needed for the requested change. Do not create a new browser × viewport matrix by default.
4. Keep layout tests focused on layout and usability. Do not make them depend on unrelated image requests or external services.
5. For a substantial expansion of test count, screenshot baselines, browser combinations or test infrastructure, present a short rationale and seek approval before proceeding.

Do not delete or weaken security-critical tests merely to make CI pass. Investigate failures and clearly distinguish product bugs from test-environment or assertion problems.

## Validation and handoff

- Run focused tests relevant to files or behaviour changed, if feasible.
- Run `pnpm lint` and `pnpm exec tsc --noEmit` before completion when the environment permits.
- Do not automatically run the full multi-browser Playwright suite for a small change; use it when warranted by scope or explicitly requested. CI can run the comprehensive suite.
- If a check cannot run or fails for reasons outside the change, report the exact result. Do not claim it passed or fix unrelated issues without permission.
- At completion, summarise files changed, user-visible behaviour, tests/checks run and any remaining risks.
- Keep the diff limited to the task; do not change `AGENTS.md` or test policy incidentally.

## Next.js-managed agent rules

The following block is maintained by Next.js development tooling. Leave it intact.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
