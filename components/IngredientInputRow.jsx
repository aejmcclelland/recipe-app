// components/IngredientsInputRow.jsx
'use client';

import { useEffect, useMemo } from 'react';
import { Box, Stack, IconButton, TextField, MenuItem } from '@mui/material';
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
    <Stack spacing={2} useFlexGap sx={{ width: '100%', minWidth: 0 }}>
      {/* Row 1: Ingredient (full width always) */}
      <TextField
        label="Ingredient"
        value={ingredient.ingredient?.name ?? ingredient.ingredient ?? ''}
        onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
        fullWidth
        multiline
        minRows={1}
        error={!!fieldError('ingredient')}
        helperText={fieldError('ingredient')}
        sx={{
          minWidth: 0,
          '& .MuiInputBase-root': { p: 2 },
          // The theme adds search-icon padding to all inputs; textareas need their normal inset.
          '& .MuiInputBase-root .MuiInputBase-inputMultiline': { p: 0, overflowWrap: 'anywhere' },
        }}
      />

      <Stack direction="row" spacing={1} useFlexGap alignItems="flex-start">
        <Box sx={{
          flex: 1,
          minWidth: 0,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
        }}>
          {/* Quantity */}
          <Box sx={{ minWidth: 0 }}>
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
          <Box sx={{ minWidth: 0 }}>
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
          {isOther && (
            <Box sx={{ gridColumn: '1 / -1', minWidth: 0 }}>
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
            </Box>
          )}
        </Box>

        {/* Delete */}
        <IconButton
          aria-label="Remove ingredient"
          onClick={handleRemoveIngredient}
          sx={{ flexShrink: 0, width: 44, height: 44 }}
        >
          <DeleteIcon color="warning" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
