// app/actions/getCategories.ts
'use server';

import connectDB from '@/config/database';
import Category from '@/models/Category';
import { convertToSerializeableObject } from '@/utils/convertToObject';
import type { Model } from 'mongoose';

type CategoryRecord = {
	name: string;
};

export async function getCategories() {
	await connectDB();
	const categoryModel = Category as Model<CategoryRecord>;
	const categories = await categoryModel.find({}).lean();
	return convertToSerializeableObject(categories);
}
