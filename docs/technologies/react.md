# React

## Version and scope

- Use React 19 patterns.
- Follow the official React documentation for current guidance.
- Apply these guidelines alongside the project's Next.js App Router conventions.

## Component model

- Prefer Server Components unless client interactivity is required.
- Add `"use client"` only when a component needs hooks, browser APIs, event
  handlers, or client-side state.
- Keep Client Components as small and focused as possible.
- Prefer composition over large components with multiple responsibilities.
- Keep reusable components in `/components`.

## State and effects

- Minimise `useEffect`; derive values during rendering where possible.
- Do not use `useEffect` solely to synchronise props into state.
- Do not call `setState` synchronously inside an effect unless synchronisation
  with an external system genuinely requires it.
- Use effects for external systems such as browser APIs, subscriptions, timers,
  storage, and third-party libraries.
- Prefer lazy state initialisation when reading an initial value from a browser
  API such as `localStorage`.
- Keep effect dependency arrays complete and accurate.
- Prefer event handlers for user-triggered logic instead of effects.
- Avoid storing values in state when they can be calculated from props or other
  existing state.

## Rendering and error handling

- Do not construct or return JSX from inside a `try/catch` block.
- Catch data-loading and mutation errors before returning JSX.
- Use Next.js `error.js` files or React Error Boundaries for render-time errors.
- Do not expect `try/catch` around JSX to catch errors thrown while child
  components render.
- Use stable and meaningful keys when rendering lists.
- Do not use array indexes as keys when item identity or order can change.
- Extract complicated conditional rendering into focused child components when
  it improves readability.

## Forms

- Prefer controlled components unless an existing project pattern requires
  uncontrolled inputs.
- Keep validation logic outside presentation components where practical.
- Preserve user input when displaying validation errors.
- Show clear field-level validation messages.
- Avoid duplicating form state that can be derived from existing values.

## Performance

- Do not add `useMemo`, `useCallback`, or `React.memo` by default.
- Use memoisation only when there is a demonstrated rendering or computation
  problem.
- Avoid unnecessary state because each state update may cause another render.
- Prefer server-side data fetching when client-side fetching is not required.

## Project conventions

- Pages use the Next.js App Router.
- Prefer async Server Components for server-side data loading.
- Keep business logic in server actions, services, or utilities where
  appropriate.
- Use TypeScript for new React files where practical.
- Avoid creating custom hooks unless the logic is reused or meaningfully
  improves separation of concerns.
- Use the project's existing UI components and styling conventions consistently.
- Follow existing project patterns before introducing a new abstraction.

# React Patterns

## State

Prefer deriving state rather than synchronising state.

Avoid:

useEffect(() => {
    setState(...)
}, [dependency])

Instead prefer:

- lazy useState initialisers
- derived values via useMemo
- updating related state in the same event handler
- reducers where state becomes complex

## Context

Context values should be memoised with useMemo.

Context actions should use useCallback.

Do not expose raw state setters unless genuinely required.

## Forms

Recipe forms are controlled.

Ingredient rows and their validation errors should stay synchronised by the event handlers.

Avoid effects that synchronise parallel state.

...

## Validation

Before considering React work complete, run:

```bash
pnpm lint
pnpm exec tsc --noEmit

Resolve React hook, error-boundary, and TypeScript warnings caused by the change.
```

## References

* https://react.dev/learn
* https://react.dev/reference/react
* https://react.dev/learn/you-might-not-need-an-effect