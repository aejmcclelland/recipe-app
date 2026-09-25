The simplest fit is to **keep `Recipe.user` as the owner, add a `sharedWith` array of registered user IDs, and create independent copies through a dedicated server action**. No RBAC framework or Prisma migration is needed.

No files were modified. This is a source inspection, not a live database or security exploit test.

**Current architecture relevant to sharing**

The actual persistence layer is **MongoDB/Mongoose**, despite Prisma being listed in the supplied project instructions.

- [Recipe model](/Users/andrewmcclelland/Documents/rebekahs-recipes/models/Recipe.ts): `user` is one required `User` ObjectId. Recipe content includes name, ingredient references with quantities/units, steps, times, servings, image URL, category and optional `sourceUrl`. There is no sharing or visibility field.
- [User model](/Users/andrewmcclelland/Documents/rebekahs-recipes/models/User.ts): stores account details, verification state and `bookmarks`, an array of Recipe IDs. **Bookmarks are references, not owned copies or access grants.**
- [Ingredient model](/Users/andrewmcclelland/Documents/rebekahs-recipes/models/Ingredient.ts): ingredients are shared dictionary records identified by unique names. Recipe edits replace references and recipe-specific quantities; they do not rename the dictionary records.
- [Database helper](/Users/andrewmcclelland/Documents/rebekahs-recipes/config/database.ts): centralizes the Mongoose connection.

**Authentication and existing security findings**

[NextAuth configuration](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/authOptions.ts) uses JWT sessions with credentials and Google authentication. Credentials sign-in requires verified email; Google users receive database user IDs.

The helpers worth reusing are:

- [getSessionUser](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/getSessionUser.ts): resolves the session to an existing database user.
- [requireVerifiedEmail](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/requireVerifiedEmail.ts): enforces verification for existing recipe mutations.
- [rateLimit](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/rateLimit.ts): provides creation/import limits.
- [proxy.js](/Users/andrewmcclelland/Documents/rebekahs-recipes/proxy.js): protects add, edit and profile routes at the login level. It does not establish recipe ownership.

`isAuthenticated` has no callers found and provides no resource authorization; it should not become the sharing guard.

Three existing issues need addressing before sharing is considered secure:

1. **Recipe details are currently readable without authorization.** The detail page fetches by ID regardless of session, then uses ownership only to control buttons.
2. **Entire owner records reach a Client Component.** The detail page calls `.populate('user')` without a projection and serializes the result into `RecipeCard`. Password hashes and token fields are not excluded by the User schema. Rendering only selected fields does not prevent their inclusion in client props.
3. **Identity resolution depends on client-updatable email.** [getSessionUser](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/getSessionUser.ts:18) looks up the account by session email, while the [JWT callback](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/authOptions.ts:137) accepts email from session updates. This creates a source-visible impersonation path. Resolve identity using the signed session’s stable user ID and verify that account exists. This can be corrected in the helper without changing providers or OAuth configuration.

**Relevant recipe reads and mutations**

| Path | Current behavior | Sharing impact |
|---|---|---|
| [Recipe detail](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/recipes/[id]/page.jsx) | `findById`; populates ingredients and owner | Require owner/shared access before returning content; restrict serialized fields |
| [Edit page](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/recipes/[id]/edit/page.jsx) | `findOne({_id, user})` | Preserve owner-only access |
| [Edit action](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/editRecipe.js) | Fetches by ID, checks owner, verifies email, updates by ID | Reuse owner guard; also include owner in final update filter |
| [Delete action](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/deleteRecipe.js) | Owner-filtered read and delete; destroys image | Preserve owner checks; make image lifecycle safe for copies |
| [Account deletion](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/deleteAccount.ts) | Deletes all recipes owned by session user | Remove their recipient references elsewhere; preserve copies owned by other users |
| [saveRecipe](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/saveRecipe.js) | Checks recipe existence, then toggles bookmark | Existence is insufficient; this must not become the copy implementation |
| [Profile](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/recipes/profile/page.jsx) | Fetches owned recipes and populates bookmarks without access filtering | Filter bookmarks by current access; add shared-recipe discovery |

Those are all individual-recipe database lookup/existence paths found, including the indirect bookmark population.

Additional collection reads are owner-filtered today:

- [Home](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/page.jsx)
- [Recipes listing](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/recipes/page.jsx)
- [Search action](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/searchRecipes.js), called by [SearchResultsClient](/Users/andrewmcclelland/Documents/rebekahs-recipes/components/SearchResultsClient.jsx)

I recommend keeping “My Recipes” owner-only and adding “Shared with me” to the existing recipes page. Search can include accessible recipes with ownership clearly labelled.

[bookmarkRecipe](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/bookmarkRecipe.js) and [addBookmark](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/addBookmark.js) currently add IDs without recipe access checks. All bookmark entry points need consistent handling. Removing an old bookmark should remain possible after access is revoked.

There are **no recipe API routes**. The only API route found is the NextAuth handler. Recipe operations use Server Actions.

The affected UI includes the detail page, `RecipeCard`, `RecipeOverviewCard`, `BookmarkRecipeCard`, `BookmarkButton`, listing/search components and new sharing/copy controls. `RecipeEditForm`, `RecipeDeleteForm` and `DeleteRecipeButton` must retain owner-only behavior. `ProfileRecipes` also calls deletion, although I found no current caller of that component.

**Proposed data model**

Add one field to Recipe:

```ts
sharedWith: ObjectId[] // refs to existing User records; default []
```

Keep `user` as the required owner. Do not duplicate relationships on User.

- Use `$addToSet` to grant access and `$pull` to revoke it.
- Validate recipients exist; reject self-sharing.
- Store IDs, never email addresses, as grants.
- Add indexes on `user` and `sharedWith` for owned/shared listings.
- Treat missing `sharedWith` on existing recipes as empty.

A separate sharing collection is unnecessary for the current requirements. It would become useful only if grants needed substantial metadata or very large recipient lists.

**Provenance:** omit `copiedFromRecipeId` initially because no requested behavior needs it. If later useful, make it an optional informational reference: no cascade deletion, synchronization, implicit authorization or automatic source population. A deleted source must not invalidate the copy.

**Proposed authorization model**

Place small server-only helpers in a proposed `utils/recipeAccess.ts`, alongside the existing authentication helpers:

- `recipeReadFilter(userId)` — owner OR recipient.
- `getReadableRecipe(recipeId)` — resolves the trusted session and performs the authorized query.
- `getOwnedRecipe(recipeId)` — resolves the session and queries by ID plus owner.

Validate IDs before querying and return the same unavailable result for missing and inaccessible recipes.

| Operation | Owner | Shared user | Other / signed out |
|---|---:|---:|---:|
| View | Yes | Yes | No |
| Edit/delete | Yes | No | No |
| View/manage sharing settings | Yes | No | No |
| Save independent copy | Not needed initially | Yes | No |
| Change ownership | No operation exposed | No | No |

Every mutation must perform its own check. In particular, **do not replace edit/delete ownership checks with the broader read-access check**.

Final update/delete/share database filters should include both `_id` and `user`. Updates must explicitly allowlist content fields and exclude ownership and sharing fields.

When combining search with access rules, use `AND(access condition, search condition)` so the two `$or` groups cannot accidentally broaden access.

Return minimal client data; recipient lists belong only in an owner-authorized sharing response. This follows the installed Next.js [data-security guidance](/Users/andrewmcclelland/Documents/rebekahs-recipes/node_modules/next/dist/docs/01-app/02-guides/data-security.md).

**Creation reuse and “Save to My Recipes”**

There are two actual creation paths:

- [addRecipe](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/addRecipe.js): validates category, uploads an image or chooses a placeholder, normalizes ingredients/steps, assigns session ownership, saves and redirects.
- [saveScrapedRecipe](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/saveScrapedRecipe.ts): validates scraped input, uses [parseScrapedRecipes](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/parseScrapedRecipes.ts), applies defaults, assigns session ownership and returns the saved recipe.

Neither currently exposes a shared creation service.

Extract a small server-only `utils/createRecipe.ts` for validated persistence, explicit field selection and ownership assignment. Keep form parsing and scraped-text parsing in their existing adapters. Preserve their existing defaults and return/redirect behavior.

Add a `copySharedRecipe(sourceId)` Server Action that:

1. Resolves the trusted user, verifies email and applies the creation rate limit.
2. Loads the source server-side with current sharing authorization.
3. Copies only recipe content into a fresh creation input.
4. Assigns the caller as owner and initializes `sharedWith` to empty.
5. Saves through the shared creation service and opens the new recipe.

Do not accept source content, ownership or grants from the browser. Do not spread the source document into a new Recipe. Exclude document/subdocument IDs and version metadata.

New ingredient-row arrays and steps belong to the copy. Existing ingredient/category dictionary references can be reused because recipe editing does not mutate those dictionary entries.

**Images require an explicit solution:** reusing the original’s Cloudinary URL would let deletion of the original break the copy. Prefer a separate managed image asset for copied uploads; shared placeholders can remain shared. External imported images also have availability limitations. Handle image-copy failures without reporting a successful complete copy, and clean up any newly created asset if recipe creation fails.

**Proposed implementation sequence**

1. Correct trusted identity resolution and add regression coverage.
2. Add the sharing field and inspect existing data for missing/dangling owners. Do not guess ownership of legacy records.
3. Introduce authorization helpers and minimal response objects; secure detail, bookmark and search/list reads.
4. Preserve and centralize owner-only mutation checks.
5. Extract common creation persistence and implement independent copying, including image handling.
6. Add owner-only grant/revoke actions and controls, “Shared with me,” and “Save to My Recipes.”
7. Handle account deletion, stale bookmarks and refresh/revalidation; run security and browser tests.

**Security risks / edge cases**

- Revocation must block subsequent reads and copies, including requests from an already-open page. It cannot erase content already received or copies already saved.
- Define concurrent copy/revocation behavior explicitly. A copy authorized before revocation can finish; later requests must fail. Strict commit-time revocation would require additional coordination.
- Exact normalized-email lookup is sufficient for selecting existing recipients. Avoid a public user directory; rate-limit lookup/grant attempts and return minimal account information.
- An unverified registered recipient may receive a grant but remains subject to existing sign-in verification. Sharing should not create accounts or bypass verification.
- Do not cache private recipe responses across users. Refresh affected detail/list/profile views after mutations.
- Public image URLs are not protected by recipe-page authorization. Strictly private image delivery would need separate work.
- Account deletion currently aliases `User` as `Bookmark` and calls `deleteMany({user: userId})`; that is not valid bookmark-array cleanup and needs review when implementing lifecycle cleanup.
- Legacy recipes may lack valid owners despite the current required field; comments and the seed script indicate this possibility, but I did not inspect production data.

**Tests required**

Add server tests using owner A, recipient B, unrelated user C and a signed-out caller:

- Every read path denies C/anonymous and permits A/B.
- Direct action calls reject B/C for edit, delete, grant and revoke; verify no database/image side effects.
- Forged owner, recipient and provenance fields are rejected or ignored.
- Client session email updates cannot change the acting database user.
- Client responses contain no password/reset-token fields or unauthorized recipient lists.
- Duplicate grants, self-sharing, unknown users, malformed IDs and concurrent grants behave correctly.
- Revocation removes access through details, search, listings and bookmarks.
- Copies have new IDs, caller ownership, empty grants and preserved content.
- Editing/deleting either recipe leaves the other intact, including images.
- Source revocation/deletion and original-owner account deletion preserve the copy.
- Verification, rate limits and creation/image failures remain enforced.

Extend [recipes.protected.spec.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/tests/recipes.protected.spec.ts) and add a sharing/copy browser suite. Existing import tests mock action responses, so they do not prove database authorization. Use an isolated test database for real mutation coverage.

Baseline validation passed: `pnpm lint` and `pnpm exec tsc --noEmit --incremental false`. Incremental output was disabled to avoid writing build metadata. Git status remains clean.