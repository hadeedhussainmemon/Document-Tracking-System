import React from 'react';
import { useNavigate } from 'react-router-dom';

const FabAdd = ({ onClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        // If callback provided, use it; else navigate to dashboard
        if (onClick) return onClick();
        navigate('/dashboard');
    };

    return (
        <button aria-label="Add document" onClick={handleClick} className="fixed bottom-8 right-8 md:bottom-10 md:right-10 bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transform transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </button>
    );
};

export default FabAdd;
