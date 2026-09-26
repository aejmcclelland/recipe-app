'use client';

import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { getSharingRecipients, grantRecipeAccess, lookupSharingRecipient, revokeRecipeAccess } from '@/app/actions/recipeSharing';
import type { SharingRecipient, SharingResult } from '@/types/recipeSharing';

function message(result: SharingResult): string {
	switch (result.status) {
		case 'ready': return `${result.recipient.email} is registered. You can share this recipe with them.`;
		case 'already_shared': return `${result.recipient.email} already has access.`;
		case 'unregistered': return `${result.email} is not registered. No access has been granted. Invitations are not available yet.`;
		case 'invalid_email': return 'Enter a complete, valid email address.';
		case 'self': return 'You already own this recipe. You cannot share it with yourself.';
		case 'shared': return 'Recipe shared successfully.';
		case 'revoked': return 'Access revoked successfully.';
		case 'unavailable': return 'Sharing is unavailable. Only the recipe owner can manage access.';
		case 'rate_limited': return 'Too many sharing attempts. Please try again later.';
		case 'error': return 'We couldn’t complete that request. Please try again.';
		case 'recipients': return '';
	}
}

export default function RecipeSharing({ recipeId }: { recipeId: string }) {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState('');
	const [recipients, setRecipients] = useState<SharingRecipient[] | null>(null);
	const [result, setResult] = useState<SharingResult | null>(null);
	const [busy, setBusy] = useState(false);

	async function run(action: () => Promise<SharingResult>) {
		setBusy(true);
		setResult(null);
		try {
			const next = await action();
			setResult(next);
			if (next.status === 'recipients') setRecipients(next.recipients);
			if (next.status === 'shared' || next.status === 'revoked') {
				const current = await getSharingRecipients(recipeId);
				if (current.status === 'recipients') setRecipients(current.recipients);
				else { setRecipients(null); setResult(current); }
			}
		} catch {
			setResult({ status: 'error' });
		} finally { setBusy(false); }
	}

	const failure = result && ['invalid_email', 'self', 'unavailable', 'rate_limited', 'error'].includes(result.status);
	return <>
		<Button variant="outlined" onClick={() => {
			setOpen(true); setEmail(''); setRecipients(null);
			void run(() => getSharingRecipients(recipeId));
		}}>Manage sharing</Button>
		<Dialog open={open} onClose={() => { if (!busy) setOpen(false); }} fullWidth maxWidth="sm" aria-labelledby="sharing-title">
			<DialogTitle id="sharing-title">Manage sharing</DialogTitle>
			<DialogContent>
				<Stack spacing={3} sx={{ pt: 1 }}>
					<Typography>Share with a registered user by their exact email address. They can view this recipe, but cannot edit, delete or share it.</Typography>
					<form noValidate onSubmit={event => { event.preventDefault(); void run(() => lookupSharingRecipient(recipeId, email)); }}>
						<Stack spacing={2}>
							<TextField label="Recipient email" type="email" value={email} disabled={busy} fullWidth
								error={result?.status === 'invalid_email'}
								helperText={result?.status === 'invalid_email' ? 'Enter a complete, valid email address.' : 'Exact email address only.'}
								onChange={event => { setEmail(event.target.value); setResult(null); }} />
							<Button type="submit" variant="contained" disabled={busy}>Find recipient</Button>
						</Stack>
					</form>
					{busy && <Typography role="status">Please wait…</Typography>}
					{result && result.status !== 'recipients' && <Alert severity={failure ? 'error' : 'info'} role={failure ? 'alert' : 'status'}>{message(result)}</Alert>}
					{result?.status === 'ready' && <Button variant="contained" disabled={busy}
						onClick={() => { const selectedEmail = result.recipient.email; void run(() => grantRecipeAccess(recipeId, selectedEmail)); }}>Share recipe</Button>}
					<Typography component="h2" variant="h6">People with access</Typography>
					{recipients === null && !busy && <Button onClick={() => void run(() => getSharingRecipients(recipeId))}>Retry loading recipients</Button>}
					{recipients?.length === 0 && <Typography>This recipe is not shared with anyone.</Typography>}
					{recipients && recipients.length > 0 && <Stack component="ul" spacing={2} sx={{ pl: 0, listStyle: 'none' }}>
						{recipients.map(recipient => <Stack key={recipient.id} component="li" direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}>
							<Typography sx={{ overflowWrap: 'anywhere' }}>{recipient.email}</Typography>
							<Button color="error" disabled={busy} aria-label={`Revoke access for ${recipient.email}`}
								onClick={() => void run(() => revokeRecipeAccess(recipeId, recipient.id))}>Revoke access</Button>
						</Stack>)}
					</Stack>}
				</Stack>
			</DialogContent>
			<DialogActions><Button disabled={busy} onClick={() => setOpen(false)}>Close</Button></DialogActions>
		</Dialog>
	</>;
}
