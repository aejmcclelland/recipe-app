'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-toastify';
import type { RecipeResult } from '@/types/recipe';

import jsPDF from 'jspdf';

interface ButtonToolbarProps {
	title: string;
	ingredients: string[];
	steps: string[];
	setUrl: (url: string) => void;
	setData: React.Dispatch<React.SetStateAction<RecipeResult | null>>;
	categoryId: string;
	onSave: () => void;
	save?: boolean;
}

const ButtonToolbar: React.FC<ButtonToolbarProps> = ({
	title,
	ingredients,
	steps,
	setUrl,
	setData,
	categoryId,
	onSave,
	save,
}) => {
	const handleExportPDF = () => {
		const doc = new jsPDF();

		doc.setFontSize(16);
		doc.text(title, 10, 20);

		doc.setFontSize(12);
		doc.text('Ingredients:', 10, 30);
		ingredients.forEach((item, index) => {
			doc.text(`- ${item}`, 10, 40 + index * 8);
		});

		const stepsStartY = 40 + ingredients.length * 8 + 10;
		doc.text('Steps:', 10, stepsStartY);
		steps.forEach((step, index) => {
			doc.text(`${index + 1}. ${step}`, 10, stepsStartY + 10 + index * 8);
		});

		doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
	};

	return (
		<Box
			className='no-print'
			sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
			<Button
				variant='contained'
				startIcon={<SaveIcon />}
				disabled={!!save}
				onClick={() => {
					if (save) return;
					if (!categoryId) {
						toast.error('Please select a category before saving');
						return;
					}
					onSave();
				}}
				sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 48, px: 3 }}>
				Save recipe
			</Button>
			<Button variant='text' startIcon={<PictureAsPdfIcon />} onClick={handleExportPDF} sx={{ minHeight: 44 }}>
				Export to PDF
			</Button>
			<Button variant='text' startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ minHeight: 44 }}>
				Print
			</Button>
			<Button
				variant='text'
				startIcon={<AutorenewIcon />}
				onClick={() => {
					setUrl('');
					setData(null);
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}}
				sx={{ minHeight: 44 }}>
				Get another recipe
			</Button>
		</Box>
	);
};

export default ButtonToolbar;
