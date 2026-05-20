// components/RecipeCard.jsx
'use client';

import { Card, CardContent, Typography, Box } from '@mui/material';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { pluraliseUnit } from '@/utils/pluraliseUnit';

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
		<Card
			sx={{
				width: '100%',
				maxWidth: '100%',
				marginBottom: 2,
				boxShadow: '4px 4px 20px 0px rgba(0, 0, 0, 0.2)', // Increased and softened shadow
			}}>
			<CardContent>
				<Box
					sx={{
						display: 'flex',
						flexDirection: { xs: 'column', md: 'row' },
						gap: 2,
						width: '100%',
					}}
				>
					{/* Left Section: Image and Ingredients */}
					<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
						{/* Recipe Image */}
						<Box mb={2} display='flex' justifyContent='center'>
							<Image
								src={
									recipe.image ||
									'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png'
								} // Provide a default image URL
								alt={recipe.name || 'Recipe Image'}
								width={300}
								height={187}
								loading='eager'
								style={{
									width: 'auto',
									maxWidth: '100%',
									height: 'auto',
									objectFit: 'cover',
								}}
							/>
						</Box>

						{/* Ingredients */}
						<Box mt={2} sx={{ paddingLeft: 2 }}>
							<Typography variant='h6'>Ingredients:</Typography>
							{Array.isArray(recipe.ingredients) &&
							recipe.ingredients.length > 0 ? (
								<ul>
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
													{quantity} {name}
												</li>
											);
										}

										// Quantity + unit -> pluralised correctly
										return (
											<li key={getIngredientKey(ing, index)}>
												{quantity} {name} {pluraliseUnit(unit, quantity)}
											</li>
										);
									})}
								</ul>
							) : (
								<Typography variant='body2'>No Ingredients Found</Typography>
							)}
						</Box>
					</Box>

					{/* Right Section: Recipe steps */}
					<Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
						<Typography variant='h6' gutterBottom>
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
								}}
							>
								{displaySteps.map((step) => (
									<li key={getStepKey(step)}>{step}</li>
								))}
							</Box>
						) : (
							<Typography variant='body2' color='text.secondary'>
								No steps provided
							</Typography>
						)}

						{/* Additional Information */}
						<Box mt={2}>
							<Typography variant='body2' color='text.secondary'>
								Prep Time:{' '}
								{recipe.prepTime ? `${recipe.prepTime} minutes` : 'N/A'}
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								Cook Time:{' '}
								{recipe.cookTime ? `${recipe.cookTime} minutes` : 'N/A'}
							</Typography>
							<Typography variant='body2' color='text.secondary'>
								Serves: {recipe.serves || 'N/A'}
							</Typography>
						</Box>
					</Box>
				</Box>
			</CardContent>
		</Card>
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