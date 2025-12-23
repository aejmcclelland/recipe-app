// utils/recipeFormValidation.ts

export type IngredientRowInput = {
  ingredient?: unknown;
  quantity?: unknown;
  unit?: unknown;
  customUnit?: unknown;
  // allow extra props (e.g. _id, ingredient populated object, etc.)
  [key: string]: unknown;
};

export type CleanIngredientRow = {
  ingredient: string;
  quantity?: string | number;
  unit?: string;
  customUnit?: string;
  [key: string]: unknown;
};

export type IngredientRowFieldErrors = {
  ingredient?: string;
  quantity?: string;
  unit?: string;
  customUnit?: string;
};

export type RecipeFormValidationOk = {
  ok: true;
  cleanedIngredients: CleanIngredientRow[];
  cleanedSteps: string[];
  /** Always present so forms can reset error UI easily */
  ingredientErrors: IngredientRowFieldErrors[];
};

export type RecipeFormValidationError = {
  ok: false;
  message: string;
  field?: 'steps' | 'ingredients';
  /** Per-row field errors for ingredient rows (indexes line up with the *input* array). */
  ingredientErrors?: IngredientRowFieldErrors[];
  /** Optional helper for step UI */
  stepsError?: string;
};

export type RecipeFormValidationResult =
  | RecipeFormValidationOk
  | RecipeFormValidationError;

type Options = {
  ingredients: IngredientRowInput[];
  steps: unknown[];
  /** Optional: convert strings like "1/2" to a decimal (e.g. 0.5). */
  fractionToDecimal?: (value: string) => number;
  /** If true, require at least one step. Default: true */
  requireSteps?: boolean;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Client-safe validation + normalisation used by BOTH Add + Edit forms.
 * - Trims strings
 * - Removes completely empty ingredient rows
 * - Enforces: ingredient name required for non-empty rows
 * - Enforces: quantity <-> unit pairing
 * - Enforces: when unit === 'other', customUnit required (and becomes the unit)
 * - Cleans steps and enforces at least 1 step (configurable)
 *
 * It returns BOTH:
 * - cleaned arrays for submission
 * - per-row field errors so the UI can highlight exact inputs
 */
export function validateAndCleanRecipeForm(
  options: Options
): RecipeFormValidationResult {
  const {
    ingredients,
    steps,
    fractionToDecimal,
    requireSteps = true,
  } = options;

  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
  const safeSteps = Array.isArray(steps) ? steps : [];

  // ---- Steps ----
  const cleanedSteps = safeSteps
    .map((s) => String(s ?? '').trim())
    .filter(Boolean);

  if (requireSteps && cleanedSteps.length === 0) {
    return {
      ok: false,
      field: 'steps',
      message: 'Please add at least one step.',
      stepsError: 'Please add at least one step.',
      ingredientErrors: safeIngredients.map(() => ({})),
    };
  }

  // Always initialise errors to keep UI simple.
  const ingredientErrors: IngredientRowFieldErrors[] = safeIngredients.map(
    () => ({})
  );

  // ---- Ingredients ----
  const cleanedIngredientsWithMeta = safeIngredients
    .map((row, index) => {
      // Support both: { ingredient: 'onion' } and populated { ingredient: { name: 'onion' } }
      const rawName =
        (row as any)?.ingredient?.name ?? (row as any)?.ingredient ?? '';
      const ingredientName = String(rawName ?? '').trim();

      const rawQty = (row as any)?.quantity ?? '';
      const qtyStr = String(rawQty ?? '').trim();

      // If they typed a fraction like "1/2", allow converting it.
      let quantity: string | number | undefined;
      if (qtyStr.length === 0) {
        quantity = undefined;
      } else if (
        typeof rawQty === 'string' &&
        rawQty.includes('/') &&
        fractionToDecimal
      ) {
        quantity = fractionToDecimal(rawQty);
      } else {
        quantity = rawQty as any;
      }

      const unitRaw = String((row as any)?.unit ?? '').trim();
      const customUnit = String((row as any)?.customUnit ?? '').trim();
      const unit = unitRaw === 'other' ? customUnit : unitRaw;

      return {
        ...row,
        ingredient: ingredientName,
        quantity,
        unit,
        customUnit,
        _meta: { ingredientName, qtyStr, unitRaw, customUnit, index },
      } as any;
    })
    // drop completely empty rows
    .filter((row) => {
      const m = row._meta;
      return m.ingredientName || m.qtyStr || m.unitRaw || m.customUnit;
    });

  if (cleanedIngredientsWithMeta.length === 0) {
    return {
      ok: false,
      field: 'ingredients',
      message: 'Please add at least one ingredient.',
      ingredientErrors,
    };
  }

  // Build per-row field errors (using original indexes)
  for (const r of cleanedIngredientsWithMeta) {
    const m = r._meta as {
      ingredientName: string;
      qtyStr: string;
      unitRaw: string;
      customUnit: string;
      index: number;
    };

    const rowErr = ingredientErrors[m.index] ?? (ingredientErrors[m.index] = {});

    // ingredient name required
    if (!isNonEmptyString(m.ingredientName)) {
      rowErr.ingredient = 'Please enter an ingredient name.';
    }

    const hasQty = m.qtyStr.length > 0;
    const hasUnit = m.unitRaw.length > 0;

    // quantity requires unit
    if (hasQty && !hasUnit) {
      rowErr.unit = 'Choose a unit (or select Other).';
    }

    // unit requires quantity
    if (hasUnit && !hasQty) {
      rowErr.quantity = 'Please enter a quantity.';
    }

    // other requires customUnit
    if (m.unitRaw === 'other' && !isNonEmptyString(m.customUnit)) {
      rowErr.customUnit = 'Please type the custom unit.';
    }
  }

  const hasAnyIngredientErrors = ingredientErrors.some(
    (e) => Object.keys(e).length > 0
  );

  if (hasAnyIngredientErrors) {
    // Prefer a helpful generic message (the UI can show field-level helperText)
    return {
      ok: false,
      field: 'ingredients',
      message: 'Please fix the highlighted ingredient fields.',
      ingredientErrors,
    };
  }

  // strip meta
  const cleanedIngredients = cleanedIngredientsWithMeta.map(
    ({ _meta, ...r }: any) => r
  );

  return { ok: true, cleanedIngredients, cleanedSteps, ingredientErrors };
}
