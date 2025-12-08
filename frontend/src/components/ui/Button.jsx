import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition';
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 shadow',
    secondary: 'bg-white border border-indigo-600 text-indigo-600 px-4 py-2',
    danger: 'bg-red-600 hover:bg-red-700 text-white px-3 py-2',
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
