# Rebekah's Recipes

## Purpose

Rebekah's Recipes is a production-style Next.js recipe application.

When making changes:

- Follow existing project patterns before introducing new ones.
- Keep changes as small and focused as possible.
- Preserve existing functionality unless explicitly asked to change it.

---

## Next.js

Before making any Next.js changes:

- Use the bundled documentation included with the installed version of Next.js.

- Consult `node_modules/next/dist/docs` for framework-specific guidance.

- Prefer the APIs and patterns documented for the installed version over prior
  knowledge.

---

## React

Before making React component, hook, state, effect, form, or rendering changes:

- Read `docs/technologies/react.md`.

- Follow those project-specific React guidelines alongside the installed Next.js
  documentation.

---

## Technology

- Next.js App Router
- TypeScript
- React 19
- Prisma
- NextAuth
- DaisyUI
- Tailwind CSS

---

## Coding Standards

- Prefer Server Components unless a Client Component is required.
- Do not introduce `any`.
- Reuse existing utility functions where possible.
- Keep components small and focused.
- Use existing UI patterns and styling.

---

## Database

- Do not modify the Prisma schema unless requested.
- Avoid unnecessary database queries.
- Prefer existing Prisma helpers.

---

## Authentication

- Preserve the existing authentication flow.
- Do not modify NextAuth configuration unless requested.

---

## Validation

Before considering a task complete, run:

```bash
pnpm lint
pnpm exec tsc --noEmit
```

Fix all errors.

---

## References

Project-specific technology guidance:

- React: `docs/technologies/react.md`
- Material UI `docs/technologies/mui.md`

Always follow project technology guides before introducing new patterns.

Official documentation:

- https://react.dev/
- https://react.dev/learn
- https://react.dev/reference/react

## AI Instructions

Before making Next.js changes, consult the bundled Next.js documentation for the
installed version when available.

Do not generate deprecated Next.js APIs.
