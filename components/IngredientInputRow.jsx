// components/IngredientsInputRow.jsx
'use client';

import { useEffect, useMemo } from 'react';
import { Box, IconButton, TextField, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { UNIT_OPTIONS } from '../utils/measurements';

export default function IngredientInputRow({
  index,
  ingredient,
  errors,
  handleIngredientChange,
  handleRemoveIngredient,
}) {
  // Normalise options to an array of { value, label }
  const unitOptions = useMemo(() => {
    return (UNIT_OPTIONS ?? [])
      .map((u) => {
        if (typeof u === 'string') return { value: u, label: u };
        if (u && typeof u === 'object') {
          const value = String(u.value ?? '').trim();
          const label = String(u.label ?? value).trim();
          return value ? { value, label } : null;
        }
        return null;
      })
      .filter(Boolean);
  }, []);

  const allowedUnitValues = useMemo(() => {
    const set = new Set(unitOptions.map((o) => o.value));
    set.add('');
    set.add('other');
    return set;
  }, [unitOptions]);

  // Always keep the Unit field controlled by a string
  const rawUnitValue = String(ingredient.unit ?? '').trim();
  const unitValue = allowedUnitValues.has(rawUnitValue) ? rawUnitValue : 'other';
  const isOther = unitValue === 'other';

  // If we loaded a recipe that has a free-text unit (e.g. "half", "handful"),
  // automatically move it into customUnit and switch the select to "Other".
  useEffect(() => {
    const hasUnknownUnit = rawUnitValue && !allowedUnitValues.has(rawUnitValue);
    if (!hasUnknownUnit) return;

    // Only auto-migrate once; don't overwrite if customUnit already exists.
    if (!ingredient.customUnit) {
      handleIngredientChange(index, 'customUnit', rawUnitValue);
    }
    if (ingredient.unit !== 'other') {
      handleIngredientChange(index, 'unit', 'other');
    }
  }, [rawUnitValue, allowedUnitValues, ingredient.customUnit, ingredient.unit, handleIngredientChange, index]);

  const fieldError = (key) => {
    const msg = errors?.[key];
    return typeof msg === 'string' && msg.trim().length ? msg : undefined;
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Row 1: Ingredient (full width always) */}
      <TextField
        label="Ingredient"
        value={ingredient.ingredient?.name ?? ingredient.ingredient ?? ''}
        onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
        fullWidth
        error={!!fieldError('ingredient')}
        helperText={fieldError('ingredient')}
        sx={{ minWidth: 0 }}
      />

      {/* Row 2(+):
          - Mobile:   [Quantity][Unit][Delete] then Custom unit full-width below
          - Tablet+:  [Quantity][Unit][Custom unit][Delete] all on one line when Other is selected
      */}
      <Box
        sx={{
          width: '100%',
          display: 'grid',
          gap: 2,
          alignItems: 'start',
          gridTemplateColumns: {
            mobile: '1fr 1fr auto',
            tablet: isOther ? '120px 160px 1fr auto' : '120px 160px 1fr auto',
          },
          gridTemplateAreas: {
            mobile: isOther
              ? `
                "qty unit del"
                "custom custom custom"
              `
              : `"qty unit del"`,
            tablet: isOther ? `"qty unit custom del"` : `"qty unit custom del"`,
          },
        }}
      >
        {/* Quantity */}
        <Box sx={{ gridArea: 'qty', minWidth: 0 }}>
          <TextField
            label="Quantity"
            value={ingredient.quantity ?? ''}
            onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
            slotProps={{ input: { inputMode: 'decimal' } }}
            fullWidth
            error={!!fieldError('quantity')}
            helperText={fieldError('quantity')}
          />
        </Box>

        {/* Unit (TextField select is more reliable than Select+renderValue with some theme overrides) */}
        <Box sx={{ gridArea: 'unit', minWidth: 0 }}>
          <TextField
            select
            label="Unit"
            value={unitValue}
            onChange={(e) => {
              const next = String(e.target.value ?? '');
              handleIngredientChange(index, 'unit', next);

              if (next !== 'other') {
                handleIngredientChange(index, 'customUnit', '');
              }
            }}
            fullWidth
            error={!!fieldError('unit')}
            helperText={fieldError('unit')}
          >
            <MenuItem value="">
              <em>Select unit</em>
            </MenuItem>

            {unitOptions.map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}

            <MenuItem value="other">Other…</MenuItem>
          </TextField>
        </Box>

        {/* Custom unit */}
        <Box sx={{ gridArea: 'custom', minWidth: 0 }}>
          {isOther && (
            <TextField
              label="Custom unit"
              value={ingredient.customUnit ?? ''}
              onChange={(e) => handleIngredientChange(index, 'customUnit', e.target.value)}
              onKeyDown={(e) => {
                // stop Enter submitting the whole recipe form
                if (e.key === 'Enter') e.preventDefault();
              }}
              fullWidth
              error={!!fieldError('customUnit')}
              helperText={fieldError('customUnit')}
            />
          )}
        </Box>

        {/* Delete */}
        <Box
          sx={{
            gridArea: 'del',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <IconButton aria-label="Remove ingredient" onClick={handleRemoveIngredient}>
            <DeleteIcon color="warning" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}