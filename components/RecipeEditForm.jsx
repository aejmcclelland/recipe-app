// components/RecipeEditForm.jsx
'use client';

import {
	Box,
	Button,
	Checkbox,
	FormControl,
	FormControlLabel,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	styled,
	TextField,
	Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import updateRecipe from '@/app/actions/editRecipe';
import { fractionToDecimal } from '@/utils/fractionToDecimal';
import { validateAndCleanRecipeForm } from '@/utils/recipeFormValidation';
import AddIcon from '@mui/icons-material/Add';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import IngredientInputRow from './IngredientInputRow';
import StepsInputRow from './StepsInputRow';

const DEFAULT_IMAGE =
	'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png';

const VisuallyHiddenInput = styled('input')({
	clip: 'rect(0 0 0 0)',
	clipPath: 'inset(50%)',
	height: 1,
	overflow: 'hidden',
	position: 'absolute',
	bottom: 0,
	left: 0,
	whiteSpace: 'nowrap',
	width: 1,
});

export default function RecipeEditForm({ recipe, categories = [] }) {
	const router = useRouter();

	// recipe.category might be an id OR a populated object
	const initialCategoryId = useMemo(() => {
		if (!recipe?.category) return '';
		if (typeof recipe.category === 'string') return recipe.category;
		return recipe.category._id ?? '';
	}, [recipe]);

	const initialSteps = useMemo(() => {
		if (!recipe?.steps) return [];
		return Array.isArray(recipe.steps) ? recipe.steps : [String(recipe.steps)];
	}, [recipe]);

	const [selectedCategory, setSelectedCategory] = useState(initialCategoryId);
	const [imageFile, setImageFile] = useState(null);
	const [selectedImageName, setSelectedImageName] = useState(null);
	const [deleteImage, setDeleteImage] = useState(false);

	const [prepTime, setPrepTime] = useState(recipe?.prepTime ?? '');
	const [cookTime, setCookTime] = useState(recipe?.cookTime ?? '');
	const [serves, setServes] = useState(recipe?.serves ?? '');

	// Keep row identity separate from editable values and array positions.
	const [steps, setSteps] = useState(() =>
		initialSteps.map((value) => ({ rowId: crypto.randomUUID(), value })),
	);
	const [ingredients, setIngredients] = useState(() =>
		(recipe?.ingredients ?? []).map((ingredient) => ({
			...ingredient,
			rowId: crypto.randomUUID(),
		})),
	);
	const [ingredientErrors, setIngredientErrors] = useState(() =>
		Array.isArray(recipe?.ingredients)
			? recipe.ingredients.map(() => ({}))
			: [],
	);

	const handleCategoryChange = (event) =>
		setSelectedCategory(event.target.value);

	const handleImageChange = (event) => {
		const file = event.target.files?.[0] ?? null;
		setImageFile(file);
		setSelectedImageName(file?.name ?? null);
		if (file) setDeleteImage(false);
	};

	const handleDeleteImageChange = (event) => {
		const checked = event.target.checked;
		setDeleteImage(checked);
		if (checked) {
			setImageFile(null);
			setSelectedImageName(null);
		}
	};

	const handleIngredientChange = (index, field, value) => {
		setIngredients((prev) =>
			(prev || []).map((ing, i) =>
				i === index ? { ...ing, [field]: value } : ing,
			),
		);

		// clear field error as they edit
		setIngredientErrors((prev) => {
			const next = [...(prev || [])];
			const rowErr = { ...(next[index] || {}) };

			delete rowErr[field];
			if (field === 'unit' && String(value ?? '') !== 'other') {
				delete rowErr.customUnit;
			}

			next[index] = rowErr;
			return next;
		});
	};

	const handleAddIngredient = () => {
		const rowId = crypto.randomUUID();
		setIngredients((prev) => [
			...(prev || []),
			{ rowId, ingredient: '', quantity: '', unit: '', customUnit: '' },
		]);
		setIngredientErrors((prev) => [...(prev || []), {}]);
	};

	const handleRemoveIngredient = (index) => {
		setIngredients((prev) => (prev || []).filter((_, i) => i !== index));
		setIngredientErrors((prev) => (prev || []).filter((_, i) => i !== index));
	};

	const handleAddStep = () => {
		const rowId = crypto.randomUUID();
		setSteps((prev) => [...(prev || []), { rowId, value: '' }]);
	};

	const handleStepChange = (index, value) => {
		setSteps((prev) => {
			const updated = [...(prev || [])];
			updated[index] = { ...updated[index], value };
			return updated;
		});
	};

	const handleRemoveStep = (index) => {
		setSteps((prev) => (prev || []).filter((_, i) => i !== index));
	};

	const updateRecipeById = async (event) => {
		event.preventDefault();
		const formData = new FormData(event.target);

		// Persist controlled values
		formData.set('category', selectedCategory);
		formData.set('prepTime', String(prepTime));
		formData.set('cookTime', String(cookTime));
		formData.set('serves', String(serves));

		const result = validateAndCleanRecipeForm({
			ingredients: ingredients.map(({ rowId: _rowId, ...ingredient }) => ingredient),
			steps: steps.map((step) => step.value),
			fractionToDecimal,
		});

		if (!result.ok) {
			setIngredientErrors(
				result.ingredientErrors || (ingredients || []).map(() => ({})),
			);
			toast.error(result.message);
			return;
		}

		setIngredientErrors([]);
		formData.set('ingredients', JSON.stringify(result.cleanedIngredients));
		formData.set('steps', JSON.stringify(result.cleanedSteps));

		// Image flags
		if (imageFile) formData.set('imageFile', imageFile);
		formData.set('deleteImage', String(deleteImage));

		try {
			const recipeId = await updateRecipe(recipe._id, formData);
			toast.success('Recipe updated successfully!');
			router.push(`/recipes/${recipeId}`);
		} catch (error) {
			console.error('Error updating recipe:', error);
			toast.error('Error updating recipe!');
		}
	};

	return (
		<Box sx={{ width: '100%' }}>
			<form onSubmit={updateRecipeById}>
				<Stack spacing={4}>
					{/* Name */}
					<Stack spacing={2}>
						<TextField
							name='name'
							label='Recipe Name'
							placeholder='e.g. Classic Lasagna'
							variant='outlined'
							fullWidth
							required
							defaultValue={recipe?.name ?? ''}
						/>
					</Stack>

					{/* Category */}
					<Stack spacing={2} sx={{ width: '100%' }}>
						<FormControl fullWidth required>
							<InputLabel id='category-label'>Category</InputLabel>
							<Select
								labelId='category-label'
								label='Category'
								name='category'
								value={selectedCategory}
								onChange={handleCategoryChange}>
								{Array.isArray(categories) && categories.length > 0 ? (
									categories.map((category) => (
										<MenuItem key={category._id} value={category._id}>
											{category.name}
										</MenuItem>
									))
								) : (
									<MenuItem value='' disabled>
										No categories available
									</MenuItem>
								)}
							</Select>
						</FormControl>
					</Stack>

					<Stack component='section' aria-labelledby='recipe-image-heading' spacing={2} sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
						<Typography id='recipe-image-heading' variant='h5' component='h2'>Recipe image</Typography>
						{/* Current image preview */}
						<Box
							sx={{ width: '100%', '& img': { objectFit: 'cover', borderRadius: 2, maxWidth: '100%', height: 'auto' } }}>
							<Image
								src={deleteImage ? DEFAULT_IMAGE : recipe.image || DEFAULT_IMAGE}
								alt={recipe?.name || 'Recipe Image'}
								width={300}
								height={187}
							/>
						</Box>

						{/* Image upload */}
						<Stack spacing={2} sx={{ width: '100%' }}>
							<Button
								component='label'
								variant='outlined'
								startIcon={<AddIcon />}
								sx={{ alignSelf: 'flex-start', minHeight: 44 }}>
								Upload New Image (optional)
								<VisuallyHiddenInput
									name='imageFile'
									accept='image/*'
									type='file'
									onChange={handleImageChange}
								/>
							</Button>

							{selectedImageName && (
								<Typography variant='body2' color='text.secondary' sx={{ overflowWrap: 'anywhere' }}>
									Selected: {selectedImageName}
								</Typography>
							)}

							<FormControlLabel
								control={
									<Checkbox
										checked={deleteImage}
										onChange={handleDeleteImageChange}
									/>
								}
								label='Delete current image and use default image'
							/>
						</Stack>

					</Stack>

					{/* Times & Serves */}
					<Stack component='section' aria-labelledby='recipe-timing-heading' spacing={3} sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
						<Typography id='recipe-timing-heading' variant='h5' component='h2'>Timing and servings</Typography>
						<Stack spacing={2} useFlexGap direction={{ xs: 'column', sm: 'row' }}>
							<TextField
								label='Prep Time (mins)'
								name='prepTime'
								type='number'
								variant='outlined'
								fullWidth
								required
								value={prepTime}
								onChange={(e) => setPrepTime(e.target.value)}
							/>
							<TextField
								label='Cook Time (mins)'
								name='cookTime'
								type='number'
								variant='outlined'
								fullWidth
								required
								value={cookTime}
								onChange={(e) => setCookTime(e.target.value)}
							/>
							<TextField
								label='Serves'
								name='serves'
								type='number'
								variant='outlined'
								fullWidth
								required
								value={serves}
								onChange={(e) => setServes(e.target.value)}
							/>
						</Stack>
					</Stack>

					{/* Ingredients */}
					<Stack component='section' aria-labelledby='recipe-ingredients-heading' spacing={3} sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
						<Typography id='recipe-ingredients-heading' variant='h5' component='h2'>Ingredients</Typography>
						<Stack spacing={3}>
							{ingredients.map((ingredient, index) => (
								<IngredientInputRow
									appearance='edit'
									key={ingredient.rowId}
									index={index}
									ingredient={ingredient}
									errors={ingredientErrors?.[index]}
									handleIngredientChange={handleIngredientChange}
									handleRemoveIngredient={() => handleRemoveIngredient(index)}
								/>
							))}

							<Button
								variant='outlined'
								onClick={handleAddIngredient}
								type='button'
								sx={{ width: { xs: '100%', sm: 'auto' }, alignSelf: { sm: 'flex-start' }, minHeight: 44 }}>
								+ Add Ingredient
							</Button>
						</Stack>
					</Stack>

					{/* Steps */}
					<Stack component='section' aria-labelledby='recipe-method-heading' spacing={3} sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
						<Typography id='recipe-method-heading' variant='h5' component='h2'>Method</Typography>
						<Stack spacing={2}>
							{steps.map((step, index) => (
								<StepsInputRow
									appearance='edit'
									key={step.rowId}
									index={index}
									step={step.value}
									handleStepChange={handleStepChange}
									handleRemoveStep={handleRemoveStep}
								/>
							))}
							<Button
								variant='outlined'
								onClick={handleAddStep}
								type='button'
								sx={{ width: { xs: '100%', sm: 'auto' }, alignSelf: { sm: 'flex-start' }, minHeight: 44 }}>
								+ Add Step
							</Button>
						</Stack>
					</Stack>

					<Button
						type='submit'
						variant='contained'
						size='large'
						sx={{ alignSelf: { sm: 'flex-start' }, width: { xs: '100%', sm: 'auto' }, minHeight: 48, px: 4 }}>
						Update Recipe
					</Button>
				</Stack>
			</form>
		</Box>
	);
}
