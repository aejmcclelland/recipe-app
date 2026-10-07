'use client';
import React from 'react';
import { Button, CircularProgress } from '@mui/material';

interface GetRecipeButtonProps {
	isPending: boolean;
	isDisabled: boolean;
	secondary?: boolean;
}

const GetRecipeButton: React.FC<GetRecipeButtonProps> = ({
	isPending,
	isDisabled,
	secondary = false,
}) => {
	return (
		<Button
			className='no-print'
			variant={secondary ? 'outlined' : 'contained'}
			color='primary'
			type='submit'
			startIcon={isPending ? <CircularProgress size={20} color='inherit' aria-hidden='true' /> : undefined}
			disabled={isPending || isDisabled}
			fullWidth
			sx={{ minHeight: 48 }}>
			{isPending ? 'Importing recipe…' : 'Import Recipe'}
		</Button>
	);
};

export default GetRecipeButton;
