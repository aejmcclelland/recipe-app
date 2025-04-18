'use client';

import React, {
	useRef,
	useEffect,
	Dispatch,
	SetStateAction,
	useTransition,
	FormEvent,
} from 'react';
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
				sx={{
					width: '100%',
					maxWidth: 500,
					mx: 'auto',
					display: 'flex',
					flexDirection: 'column',
					gap: 2,
				}}>
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
						'& .MuiOutlinedInput-root': {
							borderRadius: '12px',
						},
					}}
				/>

				<GetRecipeButton isDisabled={isPending || !url} isPending={isPending} />
			</Box>
		</form>
	);
};

export default RecipeForm;
