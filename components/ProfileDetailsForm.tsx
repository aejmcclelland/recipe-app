'use client';

import { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify';
import updateProfileDetails from '@/app/actions/updateProfileDetails';
import { DeleteAccountSection } from '@/components/DeleteAccount';

export default function ProfileDetailsForm({ user, onDetailsUpdated }) {
	const [firstName, setFirstName] = useState(user.firstName || '');
	const [lastName, setLastName] = useState(user.lastName || '');
	const [email, setEmail] = useState(user.email || '');
	const [isSaving, setIsSaving] = useState(false);

	const handleSubmit = async () => {
		try {
			setIsSaving(true);
			await updateProfileDetails({ firstName, lastName, email });
			toast.success('Profile updated!');
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
			/>
			<Button variant='contained' onClick={handleSubmit} disabled={isSaving}>
				{isSaving ? 'Saving...' : 'Save Changes'}
			</Button>
			{/* Delete account section */}
			<DeleteAccountSection />
		</Box>
	);
}
