import React from 'react';

export default function FormGroup({
  children,
  className = '',
  layout = 'vertical',
  responsive = true,
  ...props
}) {
  const layoutClasses = {
    vertical: 'flex flex-col gap-4',
    horizontal: responsive 
      ? 'flex flex-col sm:flex-row gap-4 items-start' 
      : 'flex flex-row gap-4 items-start',
    grid: responsive
      ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'
      : 'grid grid-cols-1 gap-4'
  };

  return (
    <div className={`${layoutClasses[layout]} ${className}`} {...props}>
      {children}
    </div>
  );
}