import React from 'react';
export default function Container({
  children,
  className = '',
  fluid = false,
  ...props
}) {
  const containerClass = fluid 
    ? 'w-full px-4' 
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';

  return (
    <div className={`${containerClass} ${className}`} {...props}>
      {children}
    </div>
  );
}