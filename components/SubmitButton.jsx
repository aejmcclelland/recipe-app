'use client';
import { useState } from 'react';

const SubmitButton = ({ text, pendingText }) => {
    const [isPending, setIsPending] = useState(false);

    const handleClick = () => {
        setIsPending(true);
    };

    return (
        <button
            type="submit"
            onClick={handleClick}
            disabled={isPending}
        >
            {isPending ? pendingText : text}
        </button>
    );
};

export default SubmitButton;