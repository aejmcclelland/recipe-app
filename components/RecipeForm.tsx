'use client';

import React, {
	useRef,
	useEffect,
	Dispatch,
	SetStateAction,
	useTransition,
	FormEvent,
} from 'react';
import { useFormStatus } from 'react-dom';
import { Box, TextField } from '@mui/material';
import GetRecipeButton from './GetRecipeButton';
import { scrapeData } from '../app/actions/scrapeData';

interface RecipeFormProps {
	url: string;
	setUrl: Dispatch<SetStateAction<string>>;
	setData: Dispatch<SetStateAction<any>>;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ url, setUrl, setData }) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const [isPending, startTransition] = useTransition();

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const handleScrape = (e: FormEvent) => {
		e.preventDefault();

		const formData = new FormData();
		formData.append('url', url);

		startTransition(async () => {
			try {
				const data = await scrapeData(formData);
				setData(data); // ✅ sets data for page display
			} catch (err) {
				console.error('Scrape failed:', err);
			}
		});
	};

	return (
		<form onSubmit={handleScrape}>
			<Box
				className='no-print'
				display='flex'
				flexDirection='column'
				sx={{ width: 500, maxWidth: '100%', mx: 'auto' }}>
				<TextField
					fullWidth
					label='Paste Recipe URL'
					placeholder='https://example.com/recipe'
					value={url}
					onChange={(e) => setUrl(e.target.value)}
					inputRef={inputRef}
					id='url-input'
					name='url'
					variant='outlined'
					sx={{
						mb: 2,
						'& .MuiOutlinedInput-root': {
							borderRadius: '12px',
							width: 500,
							maxWidth: '100%',
						},
					}}
				/>
				<GetRecipeButton isDisabled={isPending || !url} isPending={isPending} />
			</Box>
		</form>
	);
};

export default RecipeForm;
