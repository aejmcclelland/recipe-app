// components/RecipeEditForm.jsx
'use client';

import { useMemo, useRef, useState } from 'react';
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
	TextField,
	Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

import updateRecipe from '@/app/actions/editRecipe';
import IngredientInputRow from './IngredientInputRow';
import StepsInputRow from './StepsInputRow';

const DEFAULT_IMAGE =
	'https://res.cloudinary.com/dqeszgo28/image/upload/v1728739432/300_bebabf.png';

export default function RecipeEditForm({ recipe, categories = [] }) {
	const router = useRouter();

	// Normalise initial values
	const initialCategoryId = useMemo(() => {
		// recipe.category might be an id OR a populated object
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

	// Ingredients are edited client-side and submitted as JSON
	const [ingredients, setIngredients] = useState(recipe?.ingredients ?? []);

	// Steps as editable rows (same UX as Add form)
	const [steps, setSteps] = useState(initialSteps);
	const stepsRef = useRef(null);

	const handleCategoryChange = (event) => {
		setSelectedCategory(event.target.value);
	};

	const handleImageChange = (event) => {
		const file = event.target.files?.[0] ?? null;
		setImageFile(file);
		setSelectedImageName(file?.name ?? null);
		// If they upload a new image, assume they don't want to delete
		if (file) setDeleteImage(false);
	};

	const handleDeleteImageChange = (event) => {
		const checked = event.target.checked;
		setDeleteImage(checked);
		// If they choose delete, clear any selected upload
		if (checked) {
			setImageFile(null);
			setSelectedImageName(null);
		}
	};

	const handleIngredientChange = (index, field, value) => {
		const updatedIngredients = ingredients.map((ingredient, i) =>
			i === index ? { ...ingredient, [field]: value } : ingredient
		);
		setIngredients(updatedIngredients);
	};

	const handleAddIngredient = () => {
		setIngredients([
			...ingredients,
			{ ingredient: '', quantity: '', unit: '' },
		]);
	};

	const handleRemoveIngredient = (index) => {
		setIngredients(ingredients.filter((_, i) => i !== index));
	};

	const handleAddStep = () => {
		setSteps([...steps, '']);
	};

	const handleStepChange = (index, value) => {
		const updated = [...steps];
		updated[index] = value;
		setSteps(updated);
	};

	const handleRemoveStep = (index) => {
		setSteps(steps.filter((_, i) => i !== index));
	};

	const updateRecipeById = async (event) => {
		event.preventDefault();

		const formData = new FormData(event.target);

		// Persist controlled values
		formData.set('category', selectedCategory);
		formData.set('prepTime', String(prepTime));
		formData.set('cookTime', String(cookTime));
		formData.set('serves', String(serves));

		// Add ingredients + steps as JSON
		formData.set('ingredients', JSON.stringify(ingredients));
		if (stepsRef.current) {
			stepsRef.current.value = JSON.stringify(steps);
			formData.set('steps', stepsRef.current.value);
		} else {
			formData.set('steps', JSON.stringify(steps));
		}

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
		<Box sx={{ width: 800, maxWidth: '100%', mx: 'auto', p: 3 }}>
			<form onSubmit={updateRecipeById}>
				<Stack spacing={4}>
					<Stack spacing={1}>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							align="center"
						>
							Update your recipe details below
						</Typography>
					</Stack>

					{/* Current image preview */}
					<Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
						<Image
							src={deleteImage ? DEFAULT_IMAGE : recipe.image || DEFAULT_IMAGE}
							alt={recipe?.name || 'Recipe Image'}
							width={300}
							height={187}
							style={{ objectFit: 'cover', borderRadius: 12 }}
						/>
					</Box>

					{/* Image upload */}
					<Stack spacing={2} sx={{ width: '100%' }}>
						<Button
							component="label"
							variant="contained"
							fullWidth
							startIcon={<AddIcon />}
							sx={{
								backgroundColor: '#d32f2f',
								color: '#fff',
								fontWeight: 600,
								fontSize: '1rem',
								height: 40,
								minHeight: 40,
								'&:hover': { backgroundColor: '#b71c1c' },
							}}
						>
							Upload New Image (optional)
							<input
								hidden
								accept="image/*"
								type="file"
								onChange={handleImageChange}
							/>
						</Button>

						{selectedImageName && (
							<Typography variant="body2" color="text.secondary" sx={{ pl: 1 }}>
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
							label="Delete current image and use default image"
						/>
					</Stack>

					{/* Name */}
					<Stack spacing={2}>
						<Typography variant="h6" align="left">
							Recipe Name
						</Typography>
						<TextField
							name="name"
							placeholder="e.g. Classic Lasagna"
							variant="outlined"
							fullWidth
							required
							defaultValue={recipe?.name ?? ''}
							sx={{
								fontWeight: 600,
								fontSize: '1.1rem',
								'& .MuiInputBase-root': {
									height: 48,
								},
							}}
						/>
					</Stack>

					{/* Category */}
					<Stack spacing={2} sx={{ width: '100%' }}>
						<Typography variant="body2" align="left">
							Select a Category
						</Typography>
						<FormControl fullWidth required>
							<InputLabel id="category-label">Category</InputLabel>
							<Select
								labelId="category-label"
								label="Category"
								name="category"
								value={selectedCategory}
								onChange={handleCategoryChange}
							>
								{Array.isArray(categories) && categories.length > 0 ? (
									categories.map((category) => (
										<MenuItem key={category._id} value={category._id}>
											{category.name}
										</MenuItem>
									))
								) : (
									<MenuItem value="" disabled>
										No categories available
									</MenuItem>
								)}
							</Select>
						</FormControl>
					</Stack>

					{/* Times & Serves */}
					<Stack spacing={4} sx={{ mt: 1 }}>
						<Typography variant="h5">Times & Serves</Typography>
						<Stack spacing={2} direction={{ mobile: 'column', tablet: 'row' }}>
							<TextField
								label="Prep Time (mins)"
								name="prepTime"
								type="number"
								variant="outlined"
								fullWidth
								required
								value={prepTime}
								onChange={(e) => setPrepTime(e.target.value)}
							/>
							<TextField
								label="Cook Time (mins)"
								name="cookTime"
								type="number"
								variant="outlined"
								fullWidth
								required
								value={cookTime}
								onChange={(e) => setCookTime(e.target.value)}
							/>
							<TextField
								label="Serves"
								name="serves"
								type="number"
								variant="outlined"
								fullWidth
								required
								value={serves}
								onChange={(e) => setServes(e.target.value)}
							/>
						</Stack>
					</Stack>

					{/* Ingredients */}
					<Stack spacing={1}>
						<Typography variant="h5">Ingredients</Typography>
						<Stack spacing={2}>
							{ingredients.map((ingredient, index) => (
								<IngredientInputRow
									key={index}
									index={index}
									ingredient={ingredient}
									handleIngredientChange={handleIngredientChange}
									handleRemoveIngredient={() => handleRemoveIngredient(index)}
								/>
							))}

							<Button
								variant="contained"
								onClick={handleAddIngredient}
								type="button"
								sx={{ width: { mobile: '100%', tablet: 'auto' } }}
							>
								+ Add Ingredient
							</Button>
						</Stack>
					</Stack>

					{/* Steps */}
					<Stack spacing={1}>
						<Typography variant="h5">Steps</Typography>
						<Stack spacing={2}>
							{steps.map((step, index) => (
								<StepsInputRow
									key={index}
									index={index}
									step={step}
									handleStepChange={handleStepChange}
									handleRemoveStep={handleRemoveStep}
								/>
							))}
							<Button
								variant="contained"
								onClick={handleAddStep}
								type="button"
								sx={{ width: { mobile: '100%', tablet: 'auto' } }}
							>
								+ Add Step
							</Button>
							<input type="hidden" name="steps" ref={stepsRef} />
						</Stack>
					</Stack>

					<Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 1 }}>
						Update Recipe
					</Button>
				</Stack>
			</form>
		</Box>
	);
}