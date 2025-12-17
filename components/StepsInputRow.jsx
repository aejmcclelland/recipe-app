// components/StepsInputRow.jsx
'use client';

import { Stack, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function StepsInputRow({
    index,
    step,
    handleStepChange,
    handleRemoveStep,
}) {
    return (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
            <TextField
                label={`Step ${index + 1}`}
                value={step ?? ''}
                onChange={(e) => handleStepChange(index, e.target.value)}
                sx={{ flex: 1, minWidth: 0 }}
                fullWidth
            />

            <IconButton
                aria-label="Remove step"
                onClick={() => handleRemoveStep(index)}
                sx={{ flexShrink: 0 }}
            >
                <DeleteIcon color='warning'/>
            </IconButton>
        </Stack>
    );
}