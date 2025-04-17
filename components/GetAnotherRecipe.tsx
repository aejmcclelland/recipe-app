'use client';

import React from 'react';
import { Button, Box } from '@mui/material';

interface GetAnotherRecipeProps {
	setUrl: (value: string) => void;
	setData: (value: any) => void;
	icon: React.ReactNode;
}

const GetAnotherRecipe: React.FC<GetAnotherRecipeProps> = ({
	setUrl,
	setData,
	icon,
}) => {
	const handleClick = () => {
		setUrl('');
		setData(null);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	return (
		<Box className='no-print' sx={{ marginTop: '1.5rem', textAlign: 'center' }}>
			<Button
				onClick={handleClick}
				variant='contained'
				color='primary'
				startIcon={icon}
				sx={{ paddingY: 1.5, paddingX: 3, fontSize: '1rem' }}>
				Get Another Recipe
			</Button>
		</Box>
	);
};

export default GetAnotherRecipe;
