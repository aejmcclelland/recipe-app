'use client';

import { deleteAccount } from '@/app/actions/deleteAccount';
import { Box, Button, Typography } from '@mui/material';
import { signOut } from 'next-auth/react';
import { useTransition } from 'react';
import { toast } from 'react-toastify';

type DeleteAccountSectionProps = Readonly<{
	appearance?: 'default' | 'profile';
}>;

export function DeleteAccountSection({
	appearance = 'default',
}: DeleteAccountSectionProps) {
	const isProfile = appearance === 'profile';
	const [isPending, startTransition] = useTransition();

	const handleDelete = () => {
		const confirmed = window.confirm(
			'Are you sure you want to delete your account? This cannot be undone.',
		);

		if (!confirmed) return;

		startTransition(async () => {
			try {
				const result = await deleteAccount();

				if (!result?.success) {
					toast.error('Failed to delete account. Please try again.');
					return;
				}

				toast.success('Your account has been deleted.');

				// Log out and send them to home/signin
				await signOut({ callbackUrl: '/recipes/signin?deleted=1' });
			} catch (err) {
				console.error(err);
				toast.error('Something went wrong deleting your account.');
			}
		});
	};

	return (
		<Box
			display='flex'
			flexDirection='column'
			gap={isProfile ? 1.5 : 2}
			sx={
				isProfile
					? { mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }
					: undefined
			}>
			{isProfile ? (
				<Typography component='h2' variant='h6' sx={{ fontWeight: 600 }}>
					Delete account
				</Typography>
			) : (
				<h2 className='text text-red-600'>Delete account</h2>
			)}
			{isProfile ? (
				<Typography variant='body2' color='text.secondary'>
					This will permanently remove your profile and associated data.
				</Typography>
			) : (
				<p className='text-sm text-gray-600 mb-3'>
					This will permanently remove your profile and associated data.
				</p>
			)}
			<Button
				variant={isProfile ? 'outlined' : 'contained'}
				color={isProfile ? 'error' : 'primary'}
				onClick={handleDelete}
				disabled={isPending}
				sx={isProfile ? { alignSelf: 'flex-end', minHeight: 44 } : undefined}
				className={isProfile ? undefined : 'btn btn-error btn-outline'}>
				{isPending ? 'Deleting...' : 'Delete my Acount'}
			</Button>
		</Box>
	);
}
