'use client';

import React from 'react';
import { Box, Typography, List, ListItem, Divider } from '@mui/material';
import { RecipeResult } from '@/types/recipe';

interface Props {
	data?: RecipeResult;
	ingredients?: string[];
	method?: string[];
	image?: string;
	section?: 'ingredients' | 'method';
}

const ScrapedRecipePreview: React.FC<Props> = ({
	data,
	ingredients: propsIngredients,
	method: propsMethod,
	section,
	image,
}) => {
	const title = data?.title;
	const sourceUrl = data?.sourceUrl;
	const ingredients = propsIngredients ?? data?.ingredients ?? [];
	const method = propsMethod ?? data?.method ?? [];
	const imageSrc = image ?? data?.image;

	return (
		<Box sx={{ flexGrow: 1 }}>
			{imageSrc && (
				<Box
					sx={{
						width: '100%',
						height: { mobile: 200, laptop: 300 },
						backgroundImage: `url(${imageSrc})`,
						backgroundSize: 'cover',
						backgroundPosition: 'center',
						borderRadius: 2,
						marginBottom: 2,
					}}
				/>
			)}
			{title && (
				<Typography variant='h4' gutterBottom>
					{title}
				</Typography>
			)}

			{sourceUrl && (
				<Typography variant='subtitle1' gutterBottom>
					Source:{' '}
					<a href={sourceUrl} target='_blank' rel='noopener noreferrer'>
						{sourceUrl}
					</a>
				</Typography>
			)}

			<Divider sx={{ my: 2 }} />

			{section === 'ingredients' && (
				<>
					<Typography variant='h6'>Ingredients:</Typography>
					<List>
						{ingredients.map((item, index) => (
							<ListItem key={index} sx={{ pl: 0 }}>
								• {item}
							</ListItem>
						))}
					</List>
				</>
			)}

			{section === 'method' && (
				<>
					<Typography variant='h6'>Method:</Typography>
					<List>
						{method.map((step, index) => (
							<ListItem key={index} sx={{ pl: 0 }}>
								{index + 1}. {step}
							</ListItem>
						))}
					</List>
				</>
			)}
		</Box>
	);
};

export default ScrapedRecipePreview;
