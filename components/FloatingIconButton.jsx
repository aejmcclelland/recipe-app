'use client';

import { Button, IconButton, Tooltip } from '@mui/material';

const FloatingIconButton = ({ onClick, icon, tooltip, color = '#d32f2f', appearance = 'default', selected = false, actionKind = 'toggle' }) => {
    if (appearance === 'detail' && actionKind !== 'toggle') {
        return <Button
            onClick={onClick}
            startIcon={icon}
            variant={actionKind === 'secondary' ? 'outlined' : 'text'}
            color={actionKind === 'destructive' ? 'error' : 'primary'}
            sx={{ minHeight: 44 }}
        >
            {tooltip}
        </Button>;
    }

    let iconStyles;
    if (appearance === 'detail') {
        iconStyles = {
            bgcolor: selected ? 'action.selected' : 'transparent',
            color: selected ? 'text.primary' : 'text.secondary',
            borderRadius: 2,
            width: 44,
            height: 44,
            flexShrink: 0,
            '&:hover': { bgcolor: 'action.hover' },
        };
    } else if (appearance === 'home') {
        iconStyles = {
            bgcolor: selected ? 'text.primary' : 'transparent',
            color: selected ? 'background.paper' : 'text.secondary',
            border: '1px solid',
            borderColor: selected ? 'text.primary' : 'divider',
            borderRadius: 2,
            width: 44,
            height: 44,
            flexShrink: 0,
            '&:hover': {
                bgcolor: selected ? 'text.secondary' : 'action.hover',
            },
        };
    } else {
        iconStyles = {
            backgroundColor: color,
            borderRadius: '50%',
            width: 64,
            height: 64,
            color: 'white',
            '&:hover': { backgroundColor: '#b71c1c' },
        };
    }

    return (
        <Tooltip title={tooltip}>
            <IconButton
                onClick={onClick}
                aria-label={tooltip}
                aria-pressed={appearance === 'home' || appearance === 'detail' ? selected : undefined}
                sx={iconStyles}
            >
                {icon}
            </IconButton>
        </Tooltip>
    );
};

export default FloatingIconButton;
