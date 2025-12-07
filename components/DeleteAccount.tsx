'use client';

import { useTransition } from 'react';
import { deleteAccount } from '@/app/actions/deleteAccount';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Box, Button } from '@mui/material';

export function DeleteAccountSection() {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const handleDelete = () => {
		const confirmed = window.confirm(
			'Are you sure you want to delete your account? This cannot be undone.'
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
		<Box display='flex' flexDirection='column' gap={2}>
			<h2 className='text text-red-600'>Delete account</h2>
			<p className='text-sm text-gray-600 mb-3'>
				This will permanently remove your profile and associated data.
			</p>
			<Button
				variant='contained'
				onClick={handleDelete}
				disabled={isPending}
				className='btn btn-error btn-outline'>
				{isPending ? 'Deleting...' : 'Delete my Acount'}
			</Button>
		</Box>
	);
}
