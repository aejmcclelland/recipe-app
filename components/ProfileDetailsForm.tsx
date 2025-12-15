'use client';

import { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify';
import updateProfileDetails from '@/app/actions/updateProfileDetails';
import { DeleteAccountSection } from '@/components/DeleteAccount';
import { useRouter } from 'next/navigation';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import InputAdornment from '@mui/material/InputAdornment';

type ProfileDetailsFormProps = {
	user: {
		id?: string;
		firstName?: string;
		lastName?: string;
		email?: string;
		emailVerified: boolean;
	};
	onDetailsUpdated?: () => void;
};

export default function ProfileDetailsForm({
	user,
	onDetailsUpdated,
}: ProfileDetailsFormProps) {
	const [firstName, setFirstName] = useState(user.firstName || '');
	const [lastName, setLastName] = useState(user.lastName || '');
	const [email, setEmail] = useState(user.email || '');
	const [emailVerified, setEmailVerified] = useState(
		Boolean(user.emailVerified)
	);
	const [isSaving, setIsSaving] = useState(false);

	const router = useRouter();

	const handleSubmit = async () => {
		try {
			setIsSaving(true);

			const result = await updateProfileDetails({
				firstName,
				lastName,
				email,
			});

			// If the action returns a refreshed user, reflect it locally
			if (result?.user) {
				setEmail(result.user.email);
				setFirstName(result.user.firstName);
				setLastName(result.user.lastName);
				setEmailVerified(Boolean(result.user.emailVerified));
			}

			if (result?.requiresEmailVerification) {
				toast.info(
					'Your email was updated. Please verify your new email address before signing in again.'
				);
			} else {
				toast.success('Profile updated!');
			}

			router.refresh();

			onDetailsUpdated?.();
		} catch (err) {
			console.error(err);
			toast.error('Failed to update profile.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Box display='flex' flexDirection='column' gap={2}>
			<TextField
				label='First Name'
				value={firstName}
				onChange={(e) => setFirstName(e.target.value)}
			/>
			<TextField
				label='Last Name'
				value={lastName}
				onChange={(e) => setLastName(e.target.value)}
			/>
			<TextField
				label='Email'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
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
				helperText={
					email !== user.email
						? 'Changing your email will require verification'
						: emailVerified
						? 'Email verified'
						: 'Email not verified'
				}
			/>
			<Button variant='contained' onClick={handleSubmit} disabled={isSaving}>
				{isSaving ? 'Saving...' : 'Save Changes'}
			</Button>
			{/* Delete account section */}
			<DeleteAccountSection />
		</Box>
	);
}
