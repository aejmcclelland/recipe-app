'use client';

import React from 'react';
import { Button } from '@mui/material';
import jsPDF from 'jspdf';

interface ExportPDFButtonProps {
	title: string;
	ingredients: string[];
	method: string[];
	icon: React.ReactNode;
}

const ExportPDFButton: React.FC<ExportPDFButtonProps> = ({
	title,
	ingredients,
	method,
	icon,
}) => {
	const handleExport = () => {
		const doc = new jsPDF();

		doc.setFontSize(16);
		doc.text(title, 10, 20);

		doc.setFontSize(12);
		doc.text('Ingredients:', 10, 30);
		ingredients.forEach((item, index) => {
			doc.text(`- ${item}`, 10, 40 + index * 8);
		});

		let methodStartY = 40 + ingredients.length * 8 + 10;
		doc.text('Method:', 10, methodStartY);
		method.forEach((step, index) => {
			doc.text(`${index + 1}. ${step}`, 10, methodStartY + 10 + index * 8);
		});

		doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
	};

	return (
		<Button variant='outlined' onClick={handleExport} startIcon={icon}>
			Export PDF
		</Button>
	);
};

export default ExportPDFButton;
