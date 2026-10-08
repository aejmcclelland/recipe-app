'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { RecipeResult } from '@/types/recipe';
import CategorySelect from '@/components/CategorySelect';
import RecipeForm from '@/components/RecipeForm';
import ButtonToolbar from '@/components/ButtonToolbar';
import { toast } from 'react-toastify';
import { saveScrapedRecipe } from '@/app/actions/saveScrapedRecipe';
import { useRouter } from 'next/navigation';
import ScrapingSiteLinks from '@/components/ScrapingSiteLinks';

interface CopyWebClientProps {
	categories: Array<{ _id: string; name: string }>;
	initialUrl: string;
}

const CopyWebClient: React.FC<CopyWebClientProps> = ({ categories, initialUrl }) => {
	const [url, setUrl] = useState(initialUrl);
	const [data, setData] = useState<RecipeResult | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
	const [save, setSave] = useState(false);
	const reviewSectionRef = useRef<HTMLElement>(null);
	const reviewHeadingRef = useRef<HTMLHeadingElement>(null);
	const router = useRouter();

	useEffect(() => {
		if (!data) return;

		// Wait until the successful import's review UI has been committed.
		reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		reviewHeadingRef.current?.focus({ preventScroll: true });
	}, [data]);

	useEffect(() => {
		console.log('CopyWebClient mounted');
	}, []);

	useEffect(() => {
		const persistRecipe = async () => {
			if (save && data && selectedCategoryId) {
				try {
					console.log(
						'ABOUT TO SAVE:',
						data.image,
						data.title,
						selectedCategoryId,
					);
					const newRecipe = await saveScrapedRecipe(data, selectedCategoryId);
					console.log('CLIENT RECEIVED:', newRecipe.image, newRecipe.title);
					toast.success('Recipe saved!');
					router.push(`/recipes/${newRecipe._id}`);
				} catch (error) {
					console.error('Save error:', error);
					toast.error('Failed to save recipe.');
				} finally {
					setSave(false);
				}
			}
		};

		persistRecipe();
	}, [save, data, selectedCategoryId, router]);

	return (
		<Box sx={{ maxWidth: 'md', mx: 'auto', py: { xs: 2, md: 4 } }}>
			<Box className='no-print' sx={{ maxWidth: 560, mx: 'auto' }}>
				<Typography variant='overline' color='text.secondary'>
					1. Import a recipe
				</Typography>
				<Typography variant='h2' component='h1' sx={{ mt: 1, mb: 2 }}>
					Save a recipe from the web
				</Typography>
				<Typography color='text.secondary' sx={{ mb: 3 }}>
					Paste a recipe link and import it. Then review the recipe, choose a category and save it to your collection.
				</Typography>
				<RecipeForm url={url} setUrl={setUrl} setData={setData} hasPreview={!!data} />
				<Typography variant='body2' color='text.secondary' sx={{ mt: 3, mb: 1 }}>
					Supports BBC GoodFood, BBC Food and Jamie Oliver.
				</Typography>
				<ScrapingSiteLinks />
			</Box>

			{data && (
				<Box ref={reviewSectionRef} component='section' aria-labelledby='imported-recipe-title' sx={{ mt: 5, pt: 4, borderTop: 1, borderColor: 'divider' }}>
					<Typography className='no-print' variant='overline' color='text.secondary'>
						2. Review and save
					</Typography>
					<Typography ref={reviewHeadingRef} tabIndex={-1} id='imported-recipe-title' role='status' variant='h3' component='h2' sx={{ mt: 1, mb: 2, overflowWrap: 'anywhere' }}>
						{data.title}
					</Typography>
					<Typography className='no-print' color='text.secondary' sx={{ mb: 3 }}>
						Check the ingredients and method below. Choose a category, then save the recipe to your collection.
					</Typography>
					<Stack className='no-print' spacing={2} sx={{ mb: 4 }}>
						<Box sx={{ width: '100%', maxWidth: { sm: 320 } }}>
							<CategorySelect categories={categories} value={selectedCategoryId} onChange={setSelectedCategoryId} />
						</Box>
						<ButtonToolbar
							title={data.title}
							ingredients={data.ingredients}
							steps={data.steps}
							setUrl={setUrl}
							setData={setData}
							categoryId={selectedCategoryId}
							onSave={() => {
								if (!selectedCategoryId) {
									toast.error('Please select a category before saving.');
									return;
								}
								setSave(true);
							}}
							save={save}
						/>
					</Stack>
					{data.image && (
						<Box
							className='no-print'
							sx={{
								width: '100%',
								height: { xs: 200, md: 300 },
								backgroundImage: `url(${data.image})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								borderRadius: 2,
								mb: 4,
							}}
						/>
					)}
					<Grid container spacing={{ xs: 3, sm: 4, md: 5 }}>
						<Grid size={{ xs: 12, md: 4 }}>
							<Typography variant='h5' component='h3' gutterBottom>Ingredients</Typography>
							<Box component='ul' sx={{ m: 0, pl: 2.5, lineHeight: 1.8, overflowWrap: 'anywhere', '& li + li': { mt: 1 } }}>
								{data.ingredients.map((item, i) => <li key={i}>{item}</li>)}
							</Box>
						</Grid>
						<Grid size={{ xs: 12, md: 8 }}>
							<Typography variant='h5' component='h3' gutterBottom>Method</Typography>
							<Box component='ol' sx={{ m: 0, pl: 2.5, lineHeight: 1.8, overflowWrap: 'anywhere', '& li + li': { mt: 2 } }}>
								{data.steps.map((step, i) => <li key={i}>{step}</li>)}
							</Box>
						</Grid>
					</Grid>
				</Box>
			)}
		</Box>
	);
};

export default CopyWebClient;
