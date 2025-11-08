import React from 'react';
export default function Grid({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className = '',
  ...props
}) {
  // Convert cols object to tailwind classes
  const getColsClass = () => {
    const classes = [];
    
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    
    return classes.join(' ');
  };

  // Convert gap to tailwind class
  const gapClass = `gap-${gap}`;

  return (
    <div 
      className={`grid ${getColsClass()} ${gapClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}