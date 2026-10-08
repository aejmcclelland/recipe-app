// components/RecipeCard.jsx
'use client';

import { Typography, Box } from '@mui/material';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { pluraliseUnit } from '@/utils/pluraliseUnit';
import { formatQuantity } from '@/utils/formatQuantity';

function normaliseStepText(value) {
	if (typeof value === 'string') {
		return value
			.split(/\r?\n/)
			.map((step) => step.replace(/\s+/g, ' ').trim())
			.filter(Boolean);
	}

	if (Array.isArray(value)) {
		return value.flatMap(normaliseStepText);
	}

	return [];
}

function getDisplaySteps(recipe) {
	return [
		recipe?.steps,
		recipe?.method,
		recipe?.methods,
		recipe?.instructions,
		recipe?.directions,
	].flatMap(normaliseStepText);
}

function getIngredientKey(ingredient, index) {
	return (
		ingredient?._id ||
		ingredient?.ingredient?._id ||
		ingredient?.ingredient?.name ||
		`ingredient-${index}`
	);
}

function getStepKey(step) {
	return step;
}

export default function RecipeCard({ recipe }) {
	if (!recipe) {
		return <Typography variant='h6'>No Recipe Found</Typography>;
	}

	const displaySteps = getDisplaySteps(recipe);

	return (
		<Box component='article' sx={{ width: '100%', color: 'text.primary' }}>
			<Box
				sx={{
					display: 'flex',
					flexWrap: 'wrap',
					columnGap: 3,
					rowGap: 1,
					pb: 3,
					mb: 4,
					borderBottom: '1px solid',
					borderColor: 'divider',
				}}>
				<Typography variant='body2' color='text.secondary'>
					Prep Time: {recipe.prepTime ? `${recipe.prepTime} minutes` : 'N/A'}
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Cook Time: {recipe.cookTime ? `${recipe.cookTime} minutes` : 'N/A'}
				</Typography>
				<Typography variant='body2' color='text.secondary'>
					Serves: {recipe.serves || 'N/A'}
				</Typography>
			</Box>
			<Box
				sx={{
					display: 'flex',
					flexDirection: { xs: 'column', md: 'row' },
					gap: { xs: 4, md: 6 },
					width: '100%',
				}}>
				{/* Left Section: Image and Ingredients */}
				<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					{/* Recipe Image */}
					<Box
						sx={{
							mb: 4,
							position: 'relative',
							aspectRatio: '8 / 5',
							borderRadius: 3,
							overflow: 'hidden',
							bgcolor: 'background.paper',
						}}>
						<Image
							src={recipe.image || '/images/recipes/default-recipe.jpg'} // Provide a default image URL
							alt={recipe.name || 'Recipe Image'}
							fill
							sizes='(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), (max-width: 1199px) calc(50vw - 48px), 552px'
							loading='eager'
							style={{
								objectFit: 'cover',
							}}
						/>
					</Box>

					{/* Ingredients */}
					<Box component='section' aria-labelledby='ingredients-heading'>
						<Typography
							id='ingredients-heading'
							component='h2'
							variant='h6'
							sx={{ mb: 2, fontWeight: 600 }}>
							Ingredients:
						</Typography>
						{Array.isArray(recipe.ingredients) &&
						recipe.ingredients.length > 0 ? (
							<Box
								component='ul'
								sx={{
									pl: 2.5,
									m: 0,
									lineHeight: 1.75,
									overflowWrap: 'anywhere',
									'& li': { pl: 0.5, mb: 1 },
									'& li::marker': { color: 'text.secondary' },
								}}>
								{recipe.ingredients.map((ing, index) => {
									const name = ing?.ingredient?.name ?? 'Unknown Ingredient';
									const quantity = ing?.quantity;
									const unit =
										ing?.unit === 'other' ? ing?.customUnit : ing?.unit;

									// Hide legacy placeholder values that were previously injected for scraped recipes
									const isLegacyDefault = quantity === 1 && unit === 'unit';

									// No meaningful quantity/unit -> just show the ingredient name
									if (quantity == null || isLegacyDefault) {
										return <li key={getIngredientKey(ing, index)}>{name}</li>;
									}

									// Quantity but no unit -> "2 chicken"
									if (!unit) {
										return (
											<li key={getIngredientKey(ing, index)}>
												{formatQuantity(quantity)} {name}
											</li>
										);
									}

									// Quantity + unit -> pluralised correctly
									return (
										<li key={getIngredientKey(ing, index)}>
											{formatQuantity(quantity)} {pluraliseUnit(unit, quantity)}{' '}
											{name}
										</li>
									);
								})}
							</Box>
						) : (
							<Typography variant='body2'>No Ingredients Found</Typography>
						)}
					</Box>
				</Box>

				{/* Right Section: Recipe steps */}
				<Box
					component='section'
					aria-labelledby='method-heading'
					sx={{ flex: 1, minWidth: 0, width: '100%' }}>
					<Typography
						id='method-heading'
						component='h2'
						variant='h6'
						sx={{ mb: 2, fontWeight: 600 }}>
						Steps:
					</Typography>
					{displaySteps.length > 0 ? (
						<Box
							component='ol'
							sx={{
								pl: 3,
								m: 0,
								width: '100%',
								overflow: 'visible',
								lineHeight: 1.75,
								overflowWrap: 'anywhere',
								'& li': { pl: 1, mb: 2.5 },
								'& li::marker': { color: 'text.secondary', fontWeight: 600 },
							}}>
							{displaySteps.map((step) => (
								<li key={getStepKey(step)}>{step}</li>
							))}
						</Box>
					) : (
						<Typography variant='body2' color='text.secondary'>
							No steps provided
						</Typography>
					)}
				</Box>
			</Box>
		</Box>
	);
}

RecipeCard.propTypes = {
	recipe: PropTypes.shape({
		_id: PropTypes.string,
		image: PropTypes.string,
		name: PropTypes.string,
		ingredients: PropTypes.arrayOf(
			PropTypes.shape({
				_id: PropTypes.string,
				quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
				unit: PropTypes.string,
				customUnit: PropTypes.string,
				ingredient: PropTypes.shape({
					_id: PropTypes.string,
					name: PropTypes.string,
				}),
			})
		),
		steps: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string),
		]),
		method: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string),
		]),
		methods: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string),
		]),
		instructions: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string),
		]),
		directions: PropTypes.oneOfType([
			PropTypes.string,
			PropTypes.arrayOf(PropTypes.string),
		]),
		prepTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		cookTime: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		serves: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	}),
};
