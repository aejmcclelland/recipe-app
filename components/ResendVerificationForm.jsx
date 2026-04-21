'use client';

import { useState } from 'react';
import {
	Box,
	Button,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { toast } from 'react-toastify';

import { resendVerificationEmail } from '@/app/actions/resendVerificationEmail';

export default function ResendVerificationForm({ initialEmail = '' }) {
	const [email, setEmail] = useState(initialEmail);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const trimmedEmail = email.trim().toLowerCase();
	const canSubmit = trimmedEmail.includes('@');

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!canSubmit) {
			toast.error('Please enter a valid email address.');
			return;
		}

		try {
			setIsSubmitting(true);
			await resendVerificationEmail(trimmedEmail);
			toast.success(
				"If your account exists and isn't verified, we've sent a new verification email."
			);
		} catch (error) {
			console.error(error);
			toast.error(
				'We could not send that verification email just now. Please try again.'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Box
			component='form'
			onSubmit={handleSubmit}
			sx={{ width: '100%', maxWidth: 420, mx: 'auto' }}
		>
			<Stack spacing={2}>
				<Typography variant='body2' color='text.secondary'>
					Enter your email address and we&apos;ll send you a fresh verification
					link.
				</Typography>

				<TextField
					label='Email'
					name='email'
					type='email'
					required
					fullWidth
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					autoComplete='email'
					slotProps={{
						input: {
							startAdornment: (
								<InputAdornment position='start'>
									<MailOutlineIcon fontSize='small' />
								</InputAdornment>
							),
						},
					}}
				/>

				<Button
					type='submit'
					variant='contained'
					disabled={isSubmitting || !canSubmit}
				>
					{isSubmitting ? 'Sending...' : 'Resend verification email'}
				</Button>
			</Stack>
		</Box>
	);
}
