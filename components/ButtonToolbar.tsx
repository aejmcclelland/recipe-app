'use client';

import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SaveRecipeButton from './SaveRecipeButton';
import SaveIcon from '@mui/icons-material/Save';
import { toast } from 'react-toastify';

import jsPDF from 'jspdf';

interface ButtonToolbarProps {
	title: string;
	ingredients: string[];
	steps: string[];
	setUrl: (url: string) => void;
	setData: (data: any) => void;
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

		let stepsStartY = 40 + ingredients.length * 8 + 10;
		doc.text('Steps:', 10, stepsStartY);
		steps.forEach((step, index) => {
			doc.text(`${index + 1}. ${step}`, 10, stepsStartY + 10 + index * 8);
		});

		doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
	};

	return (
		<Box
			className='no-print'
			sx={{
				position: 'fixed',
				bottom: {
					mobile: 230,
					laptop: 150,
				},
				left: '50%',
				transform: 'translateX(-50%)',
				backgroundColor: 'rgba(255, 255, 255, 0.85)',
				borderRadius: 50,
				padding: '0.5rem 1.5rem',
				display: 'flex',
				gap: 2,
				zIndex: 10,
				boxShadow: 3,
				paddingBottom: 2,
			}}>
			<Tooltip title='Export to PDF'>
				<IconButton
					onClick={handleExportPDF}
					sx={{
						backgroundColor: '#d32f2f', // red button
						borderRadius: '50%',
						width: 64,
						height: 64,
						color: 'white',
						'&:hover': { backgroundColor: '#b71c1c' },
					}}>
					<PictureAsPdfIcon fontSize='medium' />
				</IconButton>
			</Tooltip>
			<Tooltip title='Print Recipe'>
				<IconButton
					onClick={() => window.print()}
					sx={{
						backgroundColor: '#d32f2f', // red button
						borderRadius: '50%',
						width: 64,
						height: 64,
						color: 'white',
						'&:hover': { backgroundColor: '#b71c1c' },
					}}>
					<PrintIcon fontSize='medium' />
				</IconButton>
			</Tooltip>
			<Tooltip title='Get Another Recipe'>
				<IconButton
					onClick={() => {
						setUrl('');
						setData(null);
						window.scrollTo({ top: 0, behavior: 'smooth' });
					}}
					sx={{
						backgroundColor: '#d32f2f', // red button
						borderRadius: '50%',
						width: 64,
						height: 64,
						color: 'white',
						'&:hover': { backgroundColor: '#b71c1c' },
					}}>
					<AutorenewIcon fontSize='medium' />
				</IconButton>
			</Tooltip>
			<Tooltip title='Save Recipe'>
				<IconButton
					onClick={() => {
						if (!categoryId) {
							toast.error('Please select a category before saving');
							return;
						}
						onSave();
					}}
					sx={{
						backgroundColor: '#d32f2f',
						borderRadius: '50%',
						width: 64,
						height: 64,
						color: 'white',
						'&:hover': { backgroundColor: '#b71c1c' },
					}}>
					<SaveIcon fontSize='medium' />
				</IconButton>
			</Tooltip>
		</Box>
	);
};

export default ButtonToolbar;
