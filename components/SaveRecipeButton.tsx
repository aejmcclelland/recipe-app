'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { saveScrapedRecipe } from '@/app/actions/saveScrapedRecipe';

interface SaveRecipeButtonProps {
	data: any;
	categoryId: string;
	onSaved?: () => void;
}

const SaveRecipeButton: React.FC<SaveRecipeButtonProps> = ({
	data,
	categoryId,
	onSaved,
}) => {
	const handleSave = async () => {
		if (!categoryId) {
			alert('Please select a category before saving the recipe.');
			return;
		}
		try {
			const result = await saveScrapedRecipe(data, categoryId);
			console.log('Saved recipe:', result);
			onSaved?.();
		} catch (error) {
			console.error('Failed to save recipe:', error);
		}
	};

	return (
		<Tooltip title='Save Recipe'>
			<IconButton
				onClick={handleSave}
				sx={{
					backgroundColor: '#d32f2f', // red button
					borderRadius: '50%',
					width: 64,
					height: 64,
					color: 'white',
					'&:hover': { backgroundColor: '#b71c1c' },
				}}>
				<SaveIcon fontSize='medium' />
			</IconButton>
		</Tooltip>
	);
};

export default SaveRecipeButton;
