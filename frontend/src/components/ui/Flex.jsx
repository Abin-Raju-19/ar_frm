import React from 'react';

export default function Flex({
  children,
  direction = 'row',
  wrap = false,
  justify = 'start',
  items = 'start',
  gap = 0,
  className = '',
  responsive = true,
  ...props
}) {
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const itemsClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';
  const gapClass = gap ? `gap-${gap}` : '';
  
  // Responsive direction change (column on mobile, row on larger screens)
  const responsiveClass = responsive 
    ? 'flex-col sm:flex-row' 
    : directionClasses[direction];

  const classes = [
    'flex',
    responsive ? responsiveClass : directionClasses[direction],
    wrapClass,
    justifyClasses[justify],
    itemsClasses[items],
    gapClass,
    className
  ].join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}