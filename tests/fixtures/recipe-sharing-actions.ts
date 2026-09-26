// Browser-only action doubles: no database writes, email or account creation.
import type { SharingResult } from '../../types/recipeSharing';

const recipient = { id: 'eeeeeeeeeeeeeeeeeeeeeeee', email: 'recipient@example.com' };
let shared = false;
export async function getSharingRecipients(): Promise<SharingResult> {
	return { status: 'recipients', recipients: shared ? [recipient] : [] };
}
export async function lookupSharingRecipient(_recipeId: string, input: string): Promise<SharingResult> {
	const email = input.trim().toLowerCase();
	if (email === 'failure@example.com') throw new Error('private server detail');
	if (email === 'limited@example.com') return { status: 'rate_limited' };
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { status: 'invalid_email' };
	if (email === 'owner@example.com') return { status: 'self' };
	if (email !== recipient.email) return { status: 'unregistered', email };
	return { status: shared ? 'already_shared' : 'ready', recipient };
}
export async function grantRecipeAccess(): Promise<SharingResult> {
	shared = true;
	return { status: 'shared' };
}
export async function revokeRecipeAccess(): Promise<SharingResult> {
	shared = false;
	return { status: 'revoked' };
}
