// components/RecipeForm.tsx
'use client';

import React, {
	useState,
	Dispatch,
	SetStateAction,
	useTransition,
	FormEvent,
} from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';
import GetRecipeButton from './GetRecipeButton';
import { scrapeData } from '../app/actions/scrapeData';
import type { RecipeResult } from '@/types/recipe';

interface RecipeFormProps {
	url: string;
	setUrl: Dispatch<SetStateAction<string>>;
	setData: Dispatch<SetStateAction<RecipeResult | null>>;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ url, setUrl, setData }) => {
	const [isPending, startTransition] = useTransition();
	const [isPasting, setIsPasting] = useState(false);
	const [clipboardError, setClipboardError] = useState('');
	const [importError, setImportError] = useState('');

	const handlePaste = async () => {
		if (isPending || isPasting) return;
		setClipboardError('');
		setIsPasting(true);
		try {
			if (!navigator.clipboard?.readText) {
				setClipboardError('Clipboard access is unavailable. Touch and hold the Recipe link field, then choose Paste, or type the link.');
				return;
			}
			const text = (await navigator.clipboard.readText()).trim();
			if (!text) {
				setClipboardError('No recipe link found on the clipboard. Copy a recipe link, or paste or type it below.');
				return;
			}
			setUrl(text);
			setImportError('');
		} catch {
			setClipboardError('We couldn’t read your clipboard. Touch and hold the Recipe link field, then choose Paste, or type the link.');
		} finally {
			setIsPasting(false);
		}
	};

	const handleScrape = (e: FormEvent) => {
		e.preventDefault();
		if (isPending || isPasting || !url.trim()) return;
		setImportError('');
		setClipboardError('');
		setData(null);

		const formData = new FormData();
		formData.append('url', url);

		startTransition(async () => {
			try {
				const data = await scrapeData(formData);
				setData(data); // sets data for page display
			} catch {
				setImportError('We couldn’t import this recipe. Check the link is from Good Food, BBC Food or Jamie Oliver, and that you’re signed in with a verified account. Then try again.');
			}
		});
	};

	return (
		<Stack
			component='form'
			onSubmit={handleScrape}
			spacing={2}
			className='no-print'
			sx={{
				width: '100%',
				maxWidth: 500,
				mx: 'auto',
			}}>
			<Button
				type='button'
				variant={url.trim() ? 'outlined' : 'contained'}
				fullWidth
				disabled={isPending || isPasting}
				onClick={handlePaste}
				sx={{ minHeight: 48, borderRadius: '12px', fontWeight: 600 }}>
				{isPasting ? 'Pasting…' : 'Paste recipe link'}
			</Button>
			{clipboardError && <Alert severity='info'>{clipboardError}</Alert>}
			<TextField
				fullWidth
				label='Recipe link'
				placeholder='https://example.com/recipe'
				value={url}
				onChange={(e) => {
					setUrl(e.target.value);
					setClipboardError('');
					setImportError('');
				}}
				disabled={isPending || isPasting}
				slotProps={{ htmlInput: { inputMode: 'url', autoCapitalize: 'none', spellCheck: false } }}
				id='url-input'
				name='url'
				variant='outlined'
				sx={{
					'& .MuiOutlinedInput-root': {
						borderRadius: '12px',
					},
				}}
			/>

			{importError && <Alert severity='error'>{importError}</Alert>}
			<GetRecipeButton isDisabled={isPasting || !url.trim()} isPending={isPending} />
		</Stack>
	);
};

export default RecipeForm;
