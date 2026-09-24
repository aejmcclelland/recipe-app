// app/recipes/copyWeb/page.tsx

import { getCategories } from '@/app/actions/getCategories';
import CopyWebClient from '@/components/CopyWebClient';
import React from 'react';

const CopyWebRecipePage = async ({
	searchParams,
}: {
	searchParams: Promise<{ url?: string | string[] }>;
}) => {
	const { url } = await searchParams;
	// Next.js has already decoded the parameter. Ignore ambiguous repeated values.
	const initialUrl = typeof url === 'string' ? url.trim() : '';
	const categories = await getCategories(); // ✅ fetched from the DB

	return <CopyWebClient key={initialUrl} categories={categories} initialUrl={initialUrl} />;
};

export default CopyWebRecipePage;
