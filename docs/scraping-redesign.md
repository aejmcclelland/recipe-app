The attachment is identical to the previous design brief. The proposed scope remains **two added files and three changed files**. No files were modified.

### 1. Files to add

Under `/Users/andrewmcclelland/Documents/rebekahs-recipes`:

- `utils/normaliseScrapedIngredient.ts` — pure measurement recognition and safe fallback.
- `tests/unit/scraped-ingredients.ts` — a small table-driven test file using existing `node:test` and `tsx`.

### 2. Existing files to change

| File | Change and reason |
|---|---|
| [parseScrapedRecipes.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/parseScrapedRecipes.ts) | Normalise each line before Ingredient lookup and include recognised measurements in the Recipe entry |
| [RecipeCard.jsx](/Users/andrewmcclelland/Documents/rebekahs-recipes/components/RecipeCard.jsx) | Display quantity, then unit, then ingredient |
| [pluraliseUnit.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/pluraliseUnit.ts) | Prevent plural suffixes on metric symbols |

### 3. Normaliser API

```ts
type ImportedUnit = Extract<
  Unit,
  'g' | 'kg' | 'ml' | 'l' | 'teaspoon' | 'tablespoon'
>;

type NormalisedIngredient =
  | {
      parsed: true;
      ingredient: string;
      quantity: number;
      unit: ImportedUnit;
    }
  | {
      parsed: false;
      ingredient: string;
      quantity?: never;
      unit?: never;
    };

normaliseScrapedIngredient(rawIngredient: string): NormalisedIngredient
```

Import `Unit` from the existing measurement definitions. Keep these new types local to the helper. `parsed` is not persisted.

### 4. Canonical alias map

All canonical values already exist in [measurements.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/measurements.ts).

| Accepted tokens, case-insensitive | Canonical value |
|---|---|
| `tbsp`, `tablespoon`, `tablespoons` | `tablespoon` |
| `tsp`, `teaspoon`, `teaspoons` | `teaspoon` |
| `g`, `gram`, `grams` | `g` |
| `kg`, `kilogram`, `kilograms` | `kg` |
| `ml`, `millilitre`, `millilitres` | `ml` |
| `l`, `litre`, `litres` | `l` |

Other dropdown units remain available for manual entry but are outside automatic parsing in version one.

### 5. Parsing algorithm

1. Retain the original string for fallback.
2. Trim a separate working copy.
3. Match from the beginning: **number + recognised unit + whitespace + ingredient description**.
4. Accept integers and dot decimals with digits on both sides of the decimal point.
5. Allow attached symbols: `200g`, `400ml`, `1kg`, `1.5l`. Require spacing before spelled-out units and spoon aliases.
6. Match complete unit tokens, never prefixes of other words.
7. Convert the complete quantity with `Number`; require a finite, positive value no greater than `Number.MAX_SAFE_INTEGER`.
8. Require a non-empty description beginning with a letter. Reject standalone leading continuations such as `x`, `or`, or `to`, which may indicate a composite measurement.
9. Return the description with surrounding whitespace removed, preserving its case, internal whitespace, and remaining content.

Do not use `parseFloat` or the existing fraction helper.

### 6. Fallback rules

Every unsuccessful recognition returns:

```ts
{ parsed: false, ingredient: rawIngredient }
```

The original string must remain exact, with measurement properties omitted.

- Leading/trailing whitespace: ignored for recognition, preserved on fallback.
- Repeated whitespace: accepted between measurement tokens; retained within the description.
- Case: unit recognition is case-insensitive; the helper preserves description case.
- Empty input: unchanged fallback; existing save validation rejects empty ingredients.
- Missing description, malformed quantity, zero, negative values: fallback.
- Fractions, ranges, package expressions, count-only ingredients, unknown units: fallback.
- No searching inside an unsupported line for a smaller parseable expression.

### 7. `parseScrapedRecipe` integration

The normaliser belongs **inside its existing ingredient loop**, before database lookup:

```text
scraper → saveScrapedRecipe → parseScrapedRecipe
    → normaliser → Ingredient lookup/upsert → Recipe ingredient entry
```

For successful parsing:

- Lowercase the extracted ingredient name to match manual persistence.
- Resolve that Ingredient using the existing upsert.
- Return `{ ingredient: id, quantity, unit }`.

For fallback:

- Resolve the exact original string without lowercasing or trimming.
- Return `{ ingredient: id }`.

Continue using `$setOnInsert`; never rename existing Ingredient documents.

The existing return type already supports optional quantity/unit, so it needs no structural change. Exact fallback preservation may create separate documents for differently cased fallback strings; that is an explicit trade-off.

### 8. `saveScrapedRecipe`, scrapers, and schemas

**No changes required.**

The save action already validates strings and persists the parser’s returned ingredient entries. Site scrapers continue extracting raw strings. Recipe and Ingredient schemas already support the proposed storage.

### 9. Display correction

Use the existing full-word convention:

```text
4 tablespoons olive oil
2 teaspoons chilli flakes
200 g plain flour
1.5 l vegetable stock
```

Change only RecipeCard’s structured branch to:

```text
quantity → pluralised unit → ingredient name
```

Keep `pluraliseUnit`, with an early return for `g`, `kg`, `ml`, and `l`. Retain the existing name-only, quantity-only, and legacy-placeholder display branches.

General custom-unit grammar remains outside this change.

### 10. Edit-form compatibility

No changes to `RecipeEditForm`, `IngredientInputRow`, validation, or the update action are needed.

A populated `"olive oil"` Ingredient with `quantity:4` and `unit:"tablespoon"` already:

- Loads into separate controls.
- Selects an existing dropdown option.
- Passes measurement-pair validation.
- Saves through the existing name lookup and numeric quantity conversion.

Fallback rows remain valid with both measurement controls empty.

### 11. Existing-data behaviour

Normalisation runs only when saving **new imports**.

Existing name-only imports keep their current display and edit behaviour. No shared Ingredient is renamed, and no historical measurement is extracted automatically.

The shared display correction also improves existing structured manual recipes. Historical imports already containing duplicated measurements remain unrepaired.

Exact fallback preservation applies during import; subsequent explicit edits retain the existing trimming/lowercasing behaviour.

### 12. Focused tests

Use 12 short cases:

| Input | Expected |
|---|---|
| `4 tbsp olive oil` | `4`, `tablespoon`, `olive oil` |
| `2 tsp chilli flakes` | `2`, `teaspoon`, `chilli flakes` |
| `200g plain flour` | `200`, `g`, `plain flour` |
| `400 ml chicken stock` | `400`, `ml`, `chicken stock` |
| `  1.5   L Vegetable  Stock  ` | `1.5`, `l`, `Vegetable  Stock` |
| `2 garlic cloves` | Exact fallback |
| `½ tsp chilli flakes` | Exact fallback |
| `2 x 400g tins tomatoes` | Exact fallback |
| `  Salt and  pepper to taste  ` | Exact fallback |
| `1-2 tbsp olive oil` | Exact fallback |
| `1..5 g flour` | Exact fallback |
| Empty string | Exact fallback |

Include two small formatting assertions alongside relevant success cases: `tablespoon` pluralises; `g` does not.

Run using:

```bash
pnpm exec node --import tsx --test tests/unit/scraped-ingredients.ts
```

Existing import browser tests mock raw previews, which remain unchanged; no integration-test adjustments are necessary.

### 13. Implementation order

1. Add the normaliser and focused tests.
2. Integrate it into scraped persistence.
3. Correct display ordering and metric-symbol pluralisation.
4. Run focused tests, lint, TypeScript, and `git diff --check`.
5. Verify one structured import and one fallback through detail display and editing.

This remains a design proposal only; no implementation, dependencies, schema changes, or migration have been made.