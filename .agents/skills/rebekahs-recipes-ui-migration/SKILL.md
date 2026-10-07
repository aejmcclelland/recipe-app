---
name: rebekahs-recipes-ui-migration
description: Guide incremental UI redesign work in the Rebekah's Recipes Next.js/MUI app. Use when auditing, planning, implementing, or reviewing visual changes so the authenticated product inherits the approved public design language without changing application behaviour.
---

# Rebekah's Recipes UI Migration

Use this skill for UI redesign, styling migration, responsive polish, and visual consistency work in the Rebekah's Recipes repository.

## Design reference

Treat the approved public landing page and public account experience as the visual reference for the rest of the product.

The target visual language is:

- warm ivory/off-white page backgrounds
- charcoal primary text
- espresso Rebekah face branding
- restrained red used as an accent, not as the default surface/button colour
- dark primary calls to action
- editorial serif typography for prominent page/section headings
- normal sans-serif UI/body typography
- `Shadows Into Light` only for the word `Recipes` in the brand wordmark
- subtle borders instead of heavy Material elevation
- restrained corner radii
- generous but purposeful spacing
- minimal default-looking MUI styling
- flat, calm surfaces rather than shadow-heavy cards

Authenticated product screens may be slightly denser than the marketing landing page. Preserve useful information density.

## Core migration rules

1. Preserve application behaviour unless the user explicitly asks for a UX or functional change.
2. Prefer incremental route-by-route migration over a whole-app redesign.
3. Audit only the files needed for the requested route or component unless a dependency must be inspected.
4. Reuse existing logic and components where practical.
5. Do not replace MUI or introduce another UI framework.
6. Do not add dependencies unless they are clearly necessary and approved.
7. Avoid unrelated refactors during styling work.
8. Keep current responsive breakpoints unless there is a demonstrated layout problem.
9. Preserve accessibility, keyboard interaction, focus states, validation, loading states, error states, and touch targets.
10. Do not change queries, serialization, routing, authentication logic, optimistic updates, rollback behaviour, or other business logic as a side effect of visual work.

## Styling ownership

Choose the narrowest appropriate styling layer.

### MUI theme

Put reusable visual-system values here:

- palette tokens
- typography roles
- spacing conventions
- shared radii
- borders
- shadows/elevation policy
- button variants
- text field/input treatment
- Paper/surface treatment
- Menu/Popover treatment
- Divider styling
- focus states

Prefer theme tokens and component overrides over repeated literal values.

### Global CSS

Use only for concerns that are genuinely global, such as:

- resets
- document/body behaviour
- overflow
- font smoothing
- print rules
- unavoidable third-party styling bridges

Do not add broad MUI class overrides when the theme can express the rule.

### Shared components

Use shared components when they represent repeated composition or product identity, for example:

- Rebekah brand lockup
- shared shell/navigation
- repeated page headers
- repeated empty states
- repeated surface/form composition

Do not create wrapper components merely to avoid a small local `sx` block.

### Local `sx`

Use local `sx` for:

- page-specific layout
- route-specific composition
- one-off responsive arrangement
- component-specific details that do not belong in the design system

Avoid duplicating theme colour, border, radius, button, or typography values locally.

## Branding

Use the Rebekah face mark as the primary brand mark where the approved design calls for it.

The brand lockup should:

- use the Rebekah face mark with the `Rebekah's Recipes` wordmark
- preserve the established spacing and proportions unless specifically reviewing the lockup
- use `Shadows Into Light` only for `Recipes`
- remain clear and restrained on desktop and mobile
- avoid reverting to generic restaurant/food icons where the new brand has already been approved

Do not modify the logo asset unless explicitly asked.

## MUI guidance

When redesigning existing MUI UI:

- prefer borders over strong shadows
- avoid default red-filled styling on every button variant
- keep text/outlined buttons visually lighter than primary actions
- keep semantic error/success colours distinct from brand accent colours
- style portalled components such as Menu and Popover through the active theme where possible
- check input adornments, label spacing, focus rings, and validation after changing input overrides
- avoid hard-coded black/white/red when an appropriate theme token exists
- scope route-specific shared-component changes so they do not unexpectedly restyle legacy routes still awaiting migration

## Page hierarchy

Product pages should have a clear, calm hierarchy.

Prefer:

- one obvious page title or greeting
- concise supporting copy only where useful
- clear primary action
- restrained secondary actions
- consistent content width and gutters
- efficient recipe-card grids and controls
- uncluttered forms

Avoid:

- stacked welcome headings that repeat the same message
- excessive nested Containers
- unnecessary `minHeight: 100vh` wrappers
- large raised cards around simple forms
- competing primary buttons
- decorative UI that reduces recipe information density

## Recipe library guidance

For recipe-library/home migration:

- preserve existing grid breakpoints unless a visual review shows a problem
- keep recipe browsing efficient
- use flat bordered recipe cards
- keep bookmark controls visually restrained but easy to discover
- preserve owned/shared recipe distinctions and existing messages
- preserve search/filter behaviour and mobile filter scrolling
- keep add/import actions clear without dominating the page
- simplify empty states without changing their available actions

## Forms and account UI

Public/auth forms should remain especially simple for less technical users.

Prefer:

- clear single-column hierarchy
- consistent full-width fields
- obvious submit action
- quiet secondary links
- centred or deliberately aligned recovery/help actions
- minimal visual clutter

Preserve:

- validation
- pending states
- redirects
- verification flows
- provider sign-in behaviour

Third-party provider buttons may retain recognisable provider styling where appropriate.

## Responsive review

For every visual implementation pass:

1. Check at least one representative desktop viewport.
2. Check at least one representative mobile viewport.
3. Verify header/brand balance.
4. Verify no horizontal overflow.
5. Verify tap targets remain usable.
6. Verify typography wraps naturally.
7. Verify menus/popovers fit within the viewport.
8. Verify recipe grids retain useful density.

Do not create separate mobile assets unless the existing source cannot crop acceptably.

## Accessibility checks

Do not regress:

- keyboard navigation
- visible focus treatment
- form labels
- validation messaging
- colour contrast
- semantic button/link behaviour
- accessible names
- touch target size

Do not remove focus indicators simply for visual cleanliness.

## Implementation workflow

For each migration phase:

1. Inspect only the relevant route/components and direct dependencies.
2. Identify what belongs in theme, shared components, global CSS, or local layout.
3. Preserve behaviour and scope boundaries.
4. Make the smallest coherent visual implementation.
5. Run lint and TypeScript.
6. Run focused tests for the affected route/behaviour rather than the full suite unless broader testing is justified.
7. Capture desktop and mobile screenshots when visual review is requested.
8. Report:
   - files changed
   - shared/theme changes
   - route-scoped styling decisions
   - tests/checks run
   - any risks or follow-up items
9. Stop for visual review before expanding to the next route group when the task requests phased migration.

## Review discipline

When the user has approved a screen or phase:

- treat the approved result as the baseline
- do not polish it again without a concrete reason
- propagate its established design language rather than inventing a new one
- avoid widening scope during implementation

If a screen already inherits the approved theme cleanly, say so rather than proposing unnecessary changes.

## Current migration direction

The public landing page, guest shell, public theme, sign-in/register experience, recovery/verification screens, and legal screens have established the approved design direction.

For subsequent authenticated migration work, use that approved public system as the reference while keeping product screens somewhat denser and more task-focused than the marketing page.
