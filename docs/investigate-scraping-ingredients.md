**Recommendation:** use a small, strict measurement-prefix normaliser, persist existing dropdown unit values, and preserve the entire input whenever recognition is uncertain.

**Evidence limitation:** the repository establishes how the scrapers extract text, but contains no captured ingredient corpus proving each website’s conventions. No files or database records were changed.

### 1. Current measurement model

[Recipe.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/models/Recipe.ts:32) stores:

```ts
{
  ingredient: ObjectId; // References an Ingredient document
  quantity?: number;
  unit?: string;
}
```

[Ingredient.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/models/Ingredient.ts:8) stores a required, uniquely indexed `name`.

The schema permits arbitrary unit strings and missing measurements. It has no separate `customUnit` field, measurement range, package size, or original-text field.

### 2. Current supported units and persisted values

In [measurements.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/measurements.ts:3), **every option’s displayed label and stored value are identical**:

| Group | Labels and persisted values |
|---|---|
| Weight | `g`, `kg`, `ounce`, `pound` |
| Volume | `ml`, `l`, `teaspoon`, `tablespoon`, `cup`, `pint`, `quart`, `gallon` |
| Count/food-specific | `clove`, `fillet`, `pinch`, `slice`, `piece`, `stick`, `head`, `leaf`, `sprig`, `loaf`, `bunch` |
| Containers | `bottle`, `can`, `bag`, `package`, `container`, `bowl`, `pot`, `jar`, `box`, `roll`, `sheet` |

[IngredientInputRow](/Users/andrewmcclelland/Documents/rebekahs-recipes/components/IngredientInputRow.jsx:38) also provides **Other…**:

- Form state uses `unit:"other"` and `customUnit:"entered text"`.
- Validation/save resolves that text into persisted `unit`.
- Loading an unrecognised persisted unit reconstructs Other/custom-unit state.
- There is no alias normalisation: `tbsp`, `tablespoon`, and `tablespoons` remain distinct strings.

[types/recipe.ts](/Users/andrewmcclelland/Documents/rebekahs-recipes/types/recipe.ts:16) is narrower than storage: its `unit?: Unit` excludes arbitrary custom strings, while its `customUnit` property is not a persisted schema field.

### 3. Scraper-specific ingredient behaviour

| Scraper | Extraction and normalisation |
|---|---|
| [BBC Good Food](/Users/andrewmcclelland/Documents/rebekahs-recipes/library/scrapers/bbcGoodFood.ts:17) | Reads `.recipe__ingredients ul li, .ingredients-list__item`; extracts all descendant text and trims surrounding whitespace |
| [BBC Food](/Users/andrewmcclelland/Documents/rebekahs-recipes/library/scrapers/bbcFood.ts:39) | Reads `.ssrcss-1ynsflq-UnorderedList li`; extracts text, collapses whitespace, then trims |
| [Jamie Oliver](/Users/andrewmcclelland/Documents/rebekahs-recipes/library/scrapers/jamieOliver.ts:11) | Reads `.ingredients-rich-text p.type-body`; trims; discards empty strings and strings containing “shop” |

None separates quantities, units, descriptions, or package expressions.

The import UI passes these strings to the save action. [parseScrapedRecipe](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/parseScrapedRecipes.ts:18) then lowercases/trims each **whole line** and upserts it as an Ingredient name.

### 4. Observed ingredient format catalogue

The available repository evidence is limited:

| Format/example | Evidence | What it establishes |
|---|---|---|
| Attached measurement: `200g flour` | [Import test fixture](/Users/andrewmcclelland/Documents/rebekahs-recipes/tests/recipe-import.spec.ts:5) | A mocked response associated with a BBC Good Food test URL; **not verified scraper output** |
| Separate numeric measurements: `200`, `g`, `Spaghetti` | [seedDB.js](/Users/andrewmcclelland/Documents/rebekahs-recipes/seedDB.js:48) | Structured seed data; not scraped text |
| `4 tbsp olive oil` | Your investigation example | A requested target case; no repository fixture establishes its website provenance |

I found no captured HTML or genuine scraper-response fixtures establishing Unicode fractions, mixed fractions, ranges, package expressions, or count-only lines for any particular source.

The examples below are therefore **design cases**, not claims about observed website output.

### 5. Quantity format compatibility

I exercised the existing validator and fraction helper in memory:

| Input format | Fits `quantity: Number`? | Current handling |
|---|---|---|
| Integer `4` | Yes | Converts correctly |
| Decimal `1.5` | Yes | Converts correctly |
| Simple fraction `1/2` | Yes, as `0.5` | Converts correctly |
| Unicode `½`, `¼`, `¾` | Yes, after explicit conversion | Not converted; server conversion produces `NaN` |
| Mixed Unicode `1½` | Yes, as `1.5` | Not converted |
| Spaced mixed fraction `1 1/2` | Yes, as `1.5` | **Incorrectly becomes `0.5`** |
| Ranges `½-1`, `½–1` | No single number preserves both bounds | Not supported |
| Slash-fraction range `1/2-1` | No | **Incorrectly becomes `0.5`**, losing the upper bound |
| Package expression `2 x 400g` | No single number preserves count and package size | Not supported |

[fractionToDecimal](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/fractionToDecimal.js:1) splits on `/` and uses `parseFloat`; it does not validate the complete expression. `1/0` becomes `Infinity`, serialises to `null`, and is subsequently treated as missing quantity.

The [form validator](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/recipeFormValidation.ts:138) checks measurement pairing, but not numeric validity. It should not be reused unchanged as an import quantity parser.

Numbers can store fractional magnitudes, with normal floating-point limitations; they do not preserve original fraction notation.

### 6. Unit alias findings

| Family | Repository evidence |
|---|---|
| `g / gram / grams` | `g` is a dropdown value; `grams` appears in an unused converter; no alias mapping |
| `kg / kilogram / kilograms` | Only `kg` is established in active measurement handling |
| `ml / millilitre / millilitres` | Only `ml` is established |
| `l / litre / litres` | `l` is active; the unused converter uses `liters` |
| `tsp / teaspoon / teaspoons` | `teaspoon` is active; display generates `teaspoons`; no `tsp` mapping |
| `tbsp / tablespoon / tablespoons` | `tablespoon` is active; display generates `tablespoons`; `tbsp` is your requested import case |

[middleware/converter.js](/Users/andrewmcclelland/Documents/rebekahs-recipes/middleware/converter.js:11) has no callers found. It uses different unit spellings and returns converted quantities as strings, so it is not an existing canonicalisation mechanism.

**Recommended canonical values:** retain the dropdown values, including `tablespoon` and `teaspoon`. This keeps imports compatible with editing. Choosing `tbsp` as the canonical stored value would currently make it appear under Other.

For the first implementation, `tbsp → tablespoon` is an explicit new mapping justified by your requested target. Additional unverified aliases should remain candidates until supported by samples; they should not be presented as already observed.

### 7. Safe / ambiguous / preserve-unchanged classification

| Category | Boundary and examples |
|---|---|
| **A. Safe to parse** | A complete positive numeric prefix, explicitly recognised unit, and non-empty description: `4 tbsp olive oil`, `250g penne`, `400 ml stock`. Require exact unit boundaries and retain all remaining description text. |
| **B. Potentially parseable but ambiguous** | `2 x 400g tins tomatoes`, ranges, alternative measurements, `2 garlic cloves`, `1 large onion`. These either exceed one-number storage or require interpretation beyond a measurement prefix. Preserve them in version one. |
| **C. Preserve unchanged** | `salt and pepper to taste`, `a handful of parsley`, unknown units, malformed quantities, or any failed recognition. |

For the conceptual boundary:

- Mass/volume tokens such as `g`, `ml`, and `tablespoon` are clear measurement units in an explicit prefix.
- `large`, `finely chopped`, and similar descriptors belong in ingredient text.
- The dropdown supports `clove`, but that does not justify extracting trailing `cloves` from `2 garlic cloves`.
- `1 large onion` could use quantity-only storage, but the current forms reject quantity without unit. Do not invent a placeholder unit to bypass that constraint.

### 8. Proposed normalisation contract

A small discriminated result is sufficient:

```ts
type NormalisedImportedIngredient =
  | {
      parsed: true;
      ingredient: string;
      quantity: number;
      unit: Unit;
    }
  | {
      parsed: false;
      ingredient: string;
      quantity?: never;
      unit?: never;
    };
```

Contract:

- Input is a non-empty scraped string; invalid input remains the save action’s validation responsibility.
- Successful parsing requires a finite, positive quantity, an explicitly supported unit, and a non-empty remaining description.
- Preserve descriptions, preparation notes, and parenthetical information.
- Never partially consume a range, package expression, or other uncertain measurement.
- On fallback, return **the exact input string**, with quantity/unit omitted.
- Keep the helper pure; `parsed` is control metadata, not a new persisted field.

Example:

```js
// "4 tbsp olive oil"
{ parsed: true, ingredient: "olive oil", quantity: 4, unit: "tablespoon" }

// "salt and pepper to taste"
{ parsed: false, ingredient: "salt and pepper to taste" }
```

“Original” means the string received from the scraper: earlier HTML extraction and whitespace changes cannot be undone.

The current unconditional lowercasing in `parseScrapedRecipe` would also need to respect fallback preservation. Otherwise the helper’s exact-text guarantee would be lost immediately downstream.

### 9. Compatibility implications for add/edit/display/search

- **Add/edit forms:** canonical dropdown units and numeric quantities fit existing controls. Name-only fallbacks also pass validation. Quantity-only parsed results would not.
- **Custom units:** no new custom-unit behaviour is needed for recognised canonical units.
- **Persistence:** save only the extracted name as Ingredient identity; save quantity/unit on the Recipe entry. Fallbacks retain the complete line.
- **Display:** [RecipeCard](/Users/andrewmcclelland/Documents/rebekahs-recipes/components/RecipeCard.jsx:99) currently renders `quantity name unit`. Canonicalising alone would produce `4 olive oil tablespoons`, not the desired order.
- **Pluralisation:** [pluraliseUnit](/Users/andrewmcclelland/Documents/rebekahs-recipes/utils/pluraliseUnit.ts:2) also produces `gs`, `mls`, and `tbsps`. A focused display correction belongs alongside introducing structured imports.
- **Search:** [searchRecipes](/Users/andrewmcclelland/Documents/rebekahs-recipes/app/actions/searchRecipes.js:31) searches Ingredient names. Food-name searches continue to work; measurements extracted out of names will no longer match through that search.
- **Fallback editing:** preserved text can still contain embedded measurements. Adding separate measurements later remains an existing ambiguity; this small import parser cannot eliminate it.

### 10. Recommended scope for the FIRST implementation

1. Add one pure normalisation helper at the existing import-persistence boundary.
2. Accept positive integers and dot decimals only.
3. Initially recognise `g`, `kg`, `ml`, `l`, `teaspoon`, `tablespoon`, and the explicitly requested `tbsp` alias.
4. Support attached metric forms such as `200g flour`, with strict token boundaries.
5. Preserve fractions, ranges, packages, count-only lines, unknown units, and uncertain expressions unchanged.
6. Persist structured results using the existing schemas.
7. Correct structured display ordering and measurement-symbol pluralisation.
8. Add focused tests for successful parsing, rejected partial matches, exact fallback preservation, and save/edit compatibility.

Questions repository evidence cannot answer:

- Which formats and aliases actually occur, and how frequently, on each site?
- Do current selectors capture every ingredient line without combining unrelated text?
- Should count-only ingredients eventually become structured despite current form validation?
- Is exact original spelling required only during import, or across later edits too? Existing edit saves lowercase names.

Lint and TypeScript checks passed. The working tree remains clean; no parser, schema change, or migration was implemented.