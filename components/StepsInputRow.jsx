// components/StepsInputRow.jsx
'use client';
import { TextField, IconButton } from '@mui/material';
import  DeleteIcon  from '@mui/icons-material/Delete';

export default function StepsInputRow({ index, step, handleStepChange, handleRemoveStep }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TextField
                fullWidth
                variant="outlined"
                label={`Step ${index + 1}`}
                value={step}
                onChange={e => handleStepChange(index, e.target.value)}
            />
            <IconButton color="error" onClick={() => handleRemoveStep(index)} sx={{ color: '#d32f2f' }}>
                <DeleteIcon />
            </IconButton>
        </div>
    );
}