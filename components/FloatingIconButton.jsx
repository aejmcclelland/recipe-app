'use client';

import { IconButton, Tooltip } from '@mui/material';

const FloatingIconButton = ({ onClick, icon, tooltip, color = '#d32f2f' }) => (
    <Tooltip title={tooltip}>
        <IconButton
            onClick={onClick}
            aria-label={tooltip}
            sx={{
                backgroundColor: color,
                borderRadius: '50%',
                width: 64,
                height: 64,
                color: 'white',
                '&:hover': { backgroundColor: '#b71c1c' },
            }}
        >
            {icon}
        </IconButton>
    </Tooltip>
);

export default FloatingIconButton;