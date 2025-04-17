'use client';

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { RecipeResult } from '@/types/recipe';
import CategorySelect from '@/components/CategorySelect';
import RecipeForm from '@/components/RecipeForm';
import ButtonToolbar from '@/components/ButtonToolbar';
import { toast } from 'react-toastify';
import { saveScrapedRecipe } from '@/app/actions/saveScrapedRecipe';
import { useRouter } from 'next/navigation';

interface CopyWebClientProps {
	categories: Array<{ _id: string; name: string }>;
}

const CopyWebClient: React.FC<CopyWebClientProps> = ({ categories }) => {
	const [url, setUrl] = useState('');
	const [data, setData] = useState<RecipeResult | null>(null);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
	const [save, setSave] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const persistRecipe = async () => {
			if (save && data && selectedCategoryId) {
				try {
					const newRecipe = await saveScrapedRecipe(data, selectedCategoryId);
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
	}, [save, data, selectedCategoryId]);

	return (
		<Container>
			<Typography className='no-print' variant='h4' gutterBottom sx={{ mb: 4 }}>
				Copy a Recipe from the Web
			</Typography>

			<RecipeForm url={url} setUrl={setUrl} setData={setData} />

			{data && (
				<Box sx={{ paddingBottom: 1, flexGrow: 1 }}>
					{data.image && (
						<Box
							className='no-print'
							sx={{
								width: '100%',
								margin: 2,
								height: { mobile: 200, laptop: 300 },
								backgroundImage: `url(${data.image})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
								borderRadius: 2,
								marginBottom: 2,
							}}
						/>
					)}
					<Grid container spacing={{ mobile: 1, tablet: 2, laptop: 3 }}>
						<Grid size={{ mobile: 12, laptop: 4 }}>
							<Box className='no-print' sx={{ textAlign: 'center', mt: 2 }}>
								<CategorySelect
									categories={categories}
									value={selectedCategoryId}
									onChange={setSelectedCategoryId}
								/>
							</Box>
							<Box sx={{ p: 2 }}>
								<Typography variant='h6' gutterBottom>
									Ingredients:
								</Typography>
								<ul>
									{data.ingredients.map((item, i) => (
										<li key={i}>{item}</li>
									))}
								</ul>
							</Box>
						</Grid>
						<Grid size={{ mobile: 12, laptop: 8 }}>
							<Box sx={{ p: 2 }}>
								<Typography variant='h6' gutterBottom>
									Method:
								</Typography>
								<ol>
									{data.method.map((step, i) => (
										<li key={i}>{step}</li>
									))}
								</ol>
							</Box>
						</Grid>
						<Grid size={12}>
							<Box
								className='no-print'
								sx={{
									display: 'flex',
									justifyContent: 'center',
									mt: 4,
									pb: { mobile: '40px', laptop: '40px' },
								}}>
								<ButtonToolbar
									title={data.title}
									ingredients={data.ingredients}
									method={data.method}
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
							</Box>
						</Grid>
					</Grid>
				</Box>
			)}
		</Container>
	);
};

export default CopyWebClient;
