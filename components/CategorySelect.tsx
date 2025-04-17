'use client';

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface Props {
	categories: Array<{ _id: string; name: string }>;
	value: string;
	onChange: (value: string) => void;
}

const CategorySelect: React.FC<Props> = ({ categories, value, onChange }) => {
	return (
		<FormControl fullWidth sx={{ mb: 2 }}>
			<InputLabel id='category-select-label'>Category</InputLabel>
			<Select
				labelId='category-select-label'
				id='category-select'
				value={value}
				onChange={(e) => onChange(e.target.value)}
				label='Category'>
				{categories.map((cat) => (
					<MenuItem key={cat._id} value={cat._id}>
						{cat.name}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	);
};

export default CategorySelect;
