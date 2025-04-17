// app/recipes/copyWeb/page.tsx

import { getCategories } from '@/app/actions/getCategories';
import CopyWebClient from '@/components/CopyWebClient';
import React from 'react';

const CopyWebRecipePage = async () => {
	const categories = await getCategories(); // ✅ fetched from the DB

	return <CopyWebClient categories={categories} />;
};

export default CopyWebRecipePage;
