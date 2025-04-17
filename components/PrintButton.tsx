'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';

interface PrintButtonProps {
	icon: React.ReactNode;
}

const PrintButton: React.FC<PrintButtonProps> = ({ icon }) => {
	const handlePrint = () => {
		window.print(); // This opens the system print dialog
	};

	return (
		<Tooltip title='Print'>
			<IconButton onClick={handlePrint}>{icon}</IconButton>
		</Tooltip>
	);
};

export default PrintButton;
