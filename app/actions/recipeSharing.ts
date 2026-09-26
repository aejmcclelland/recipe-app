'use server';

import Recipe from '@/models/Recipe';
import User from '@/models/User';
import { getSessionUser } from '@/utils/getSessionUser';
import { getOwnedRecipe, ownedRecipeFilter, isRecipeId } from '@/utils/recipeAccess';
import { requireVerifiedEmail } from '@/utils/requireVerifiedEmail';
import { enforceRateLimit, RateLimitError } from '@/utils/rateLimit';
import { sanitiseEmail } from '@/utils/emailVerification';
import { revalidatePath } from 'next/cache';
import type { SharingResult } from '@/types/recipeSharing';

async function ownerFor(recipeId: string) {
	const actor = await getSessionUser();
	if (!actor || !await getOwnedRecipe(recipeId, actor.id)) return null;
	return actor;
}

async function safely(work: () => Promise<SharingResult>): Promise<SharingResult> {
	try { return await work(); }
	catch (error) {
		if (error instanceof RateLimitError) return { status: 'rate_limited' };
		console.error('Recipe sharing failed:', error);
		return { status: 'error' };
	}
}

function validEmail(email: string) {
	return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function refresh(recipeId: string) {
	revalidatePath(`/recipes/${recipeId}`);
	revalidatePath('/recipes');
	revalidatePath('/recipes/profile');
}

export async function lookupSharingRecipient(recipeId: string, input: unknown): Promise<SharingResult> {
	return safely(async () => {
		const actor = await ownerFor(recipeId);
		if (!actor) return { status: 'unavailable' };
		await enforceRateLimit('recipe-sharing', actor.id);
		const email = sanitiseEmail(input);
		if (!validEmail(email)) return { status: 'invalid_email' };
		const user = await User.findOne({ email }).select('_id email').lean();
		if (!user) return { status: 'unregistered', email };
		if (user._id.toString() === actor.id) return { status: 'self' };
		const shared = await Recipe.exists({ ...ownedRecipeFilter(recipeId, actor.id), sharedWith: user._id });
		return { status: shared ? 'already_shared' : 'ready', recipient: { id: user._id.toString(), email: user.email } };
	});
}

export async function getSharingRecipients(recipeId: string): Promise<SharingResult> {
	return safely(async () => {
		const actor = await ownerFor(recipeId);
		if (!actor) return { status: 'unavailable' };
		const recipe = await Recipe.findOne(ownedRecipeFilter(recipeId, actor.id)).select('sharedWith').lean();
		if (!recipe) return { status: 'unavailable' };
		const users = await User.find({ _id: { $in: recipe.sharedWith ?? [] } }).select('_id email').lean();
		return { status: 'recipients', recipients: users.map(user => ({ id: user._id.toString(), email: user.email })) };
	});
}

export async function grantRecipeAccess(recipeId: string, input: unknown): Promise<SharingResult> {
	return safely(async () => {
		const actor = await ownerFor(recipeId);
		if (!actor) return { status: 'unavailable' };
		await requireVerifiedEmail(actor);
		await enforceRateLimit('recipe-sharing', actor.id);
		const email = sanitiseEmail(input);
		if (!validEmail(email)) return { status: 'invalid_email' };
		const recipient = await User.findOne({ email }).select('_id').lean();
		if (!recipient) return { status: 'unregistered', email };
		if (recipient._id.toString() === actor.id) return { status: 'self' };
		const result = await Recipe.updateOne(ownedRecipeFilter(recipeId, actor.id), { $addToSet: { sharedWith: recipient._id } });
		if (!result.matchedCount) return { status: 'unavailable' };
		refresh(recipeId);
		return { status: 'shared' };
	});
}

export async function revokeRecipeAccess(recipeId: string, recipientId: string): Promise<SharingResult> {
	return safely(async () => {
		const actor = await ownerFor(recipeId);
		if (!actor || !isRecipeId(recipientId)) return { status: 'unavailable' };
		await requireVerifiedEmail(actor);
		if (recipientId === actor.id) return { status: 'self' };
		const result = await Recipe.updateOne(ownedRecipeFilter(recipeId, actor.id), { $pull: { sharedWith: recipientId } });
		if (!result.matchedCount) return { status: 'unavailable' };
		refresh(recipeId);
		return { status: 'revoked' };
	});
}
