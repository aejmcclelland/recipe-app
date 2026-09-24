'use client';
import React from 'react';
import { Button, CircularProgress } from '@mui/material';

interface GetRecipeButtonProps {
	isPending: boolean;
	isDisabled: boolean;
}

const GetRecipeButton: React.FC<GetRecipeButtonProps> = ({
	isPending,
	isDisabled,
}) => {
	return (
		<Button
			className='no-print'
			variant='contained'
			color='secondary'
			type='submit'
			startIcon={isPending ? <CircularProgress size={20} color='inherit' aria-hidden='true' /> : undefined}
			disabled={isPending || isDisabled}
			fullWidth
			sx={{
				paddingY: 1.5,
				fontSize: '1.1rem',
				fontWeight: 600,
				fontFamily: 'Archivo, sans-serif',
				borderRadius: '12px',
			}}>
			{isPending ? 'Importing recipe…' : 'Import Recipe'}
		</Button>
	);
};

export default GetRecipeButton;
