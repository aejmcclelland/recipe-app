// app/actions/getCategories.ts
'use server';

import connectDB from '@/config/database';
import Category from '@/models/Category';
import { convertToSerializeableObject } from '@/utils/convertToObject';

export async function getCategories() {
	await connectDB();
	const categories = await (Category as any).find({}).lean();
	return convertToSerializeableObject(categories);
}
