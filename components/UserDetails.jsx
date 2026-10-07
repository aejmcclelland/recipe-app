'use client';

import React, { useMemo, useState } from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ProfileImageUpload from './ProfileImageUpload';
import ProfileDetailsForm from './ProfileDetailsForm';

export default function UserDetails({ user, onDetailsUpdated, appearance = 'default' }) {
	const isProfile = appearance === 'profile';
	const [userImage, setUserImage] = useState(user?.image || null);

	const fullName = useMemo(() => {
		const first = (user?.firstName || '').trim();
		const last = (user?.lastName || '').trim();
		const combined = `${first} ${last}`.trim();
		return combined || user?.name || 'Guest';
	}, [user?.firstName, user?.lastName, user?.name]);

	const handleImageUpdate = (newImageUrl) => {
		setUserImage(newImageUrl);
	};

	const profileUser = useMemo(
		() => ({
			...(user || {}),
			image: userImage,
		}),
		[user, userImage]
	);

	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				mb: 4,
				p: 3,
				border: '1px solid #ddd',
				borderRadius: 2,
				boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
				width: '100%',
				maxWidth: 520,
				mx: 'auto',
				...(isProfile && {
					p: { xs: 2.5, sm: 4 },
					maxWidth: 600,
					bgcolor: 'background.paper',
					borderColor: 'divider',
					borderRadius: 3,
					boxShadow: 'none',
				}),
			}}
		>
			{/* Avatar */}
			<ProfileImageUpload
				user={profileUser}
				onImageUpdated={handleImageUpdate}
				fallbackIcon={<AccountCircleIcon fontSize="large" />}
				appearance={appearance}
			/>

			{/* Header */}
			<Typography variant={isProfile ? 'h6' : 'h5'} component={isProfile ? 'h2' : undefined} sx={{ mt: isProfile ? 2 : 1, ...(isProfile && { fontWeight: 600, overflowWrap: 'anywhere', textAlign: 'center' }) }}>
				{fullName}
			</Typography>
			<Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', ...(isProfile && { overflowWrap: 'anywhere', maxWidth: '100%', textAlign: 'center' }) }}>
				{user?.email || ''}
			</Typography>

			<Divider sx={{ width: '100%', my: 2 }} />

			{/* Read-only summary */}
			<Stack spacing={0.5} sx={{ width: '100%', mb: isProfile ? 3 : 2, ...(isProfile && { overflowWrap: 'anywhere' }) }}>
				<Typography variant="subtitle2" color="text.secondary">
					Current details
				</Typography>
				<Typography variant="body2">
					<strong>First name:</strong> {user?.firstName || '—'}
				</Typography>
				<Typography variant="body2">
					<strong>Surname:</strong> {user?.lastName || '—'}
				</Typography>
				<Typography variant="body2">
					<strong>Email:</strong> {user?.email || '—'}
				</Typography>
			</Stack>

			{/* Editable form */}
			<Box sx={{ width: '100%' }}>
				<ProfileDetailsForm user={profileUser} onDetailsUpdated={onDetailsUpdated} appearance={appearance} />
			</Box>
		</Box>
	);
}
