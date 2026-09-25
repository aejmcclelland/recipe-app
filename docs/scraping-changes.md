Implemented the approved plan with your fallback-persistence adjustment. No commits made.

Changed exactly five files:

- Added [normaliseScrapedIngredient.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/normaliseScrapedIngredient.ts): conservative V1 parsing, canonical aliases, lossless fallbacks.
- Added [scraped-ingredients.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/tests/unit/scraped-ingredients.ts): 12 focused tests.
- Updated [parseScrapedRecipes.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/parseScrapedRecipes.ts): persists recognised measurements; trims/lowercases both parsed names and fallbacks.
- Updated [RecipeCard.jsx](/Users/andrewmcclelland/Documents/rebekahs-recipes/components/RecipeCard.jsx): displays quantity → unit → ingredient.
- Updated [pluraliseUnit.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/pluraliseUnit.ts): preserves `g`, `kg`, `ml`, and `l`.

Examples:

| Input | Normaliser output |
|---|---|
| `4 tbsp olive oil` | `{parsed:true, ingredient:"olive oil", quantity:4, unit:"tablespoon"}` |
| `200g plain flour` | `{parsed:true, ingredient:"plain flour", quantity:200, unit:"g"}` |
| `1.5 l vegetable stock` | `{parsed:true, ingredient:"vegetable stock", quantity:1.5, unit:"l"}` |
| `2 x 400g tins tomatoes` | `{parsed:false, ingredient:"2 x 400g tins tomatoes"}` |

`"  Salt and pepper to taste  "` remains exact in the normaliser fallback, then resolves to `"salt and pepper to taste"` during persistence.

**Verification:** all 12 tests, lint, TypeScript, and `git diff --check` passed. An in-memory check also confirmed persistence canonicalisation, rendered text, and edit validation.

Existing imported recipes are untouched. No database writes, schema changes, scraper changes, migrations, or dependencies were added. Your design documents remain unchanged.