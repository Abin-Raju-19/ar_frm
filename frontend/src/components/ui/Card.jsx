import React from 'react';
export default function Card({
  children,
  title,
  subtitle,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  footer,
  hoverable = false,
  responsive = true,
  ...props
}) {
  const hoverClasses = hoverable ? 'hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200' : '';
  const responsiveClasses = responsive ? 'w-full sm:w-auto md:w-auto lg:w-auto' : '';
  
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden ${hoverClasses} ${responsiveClasses} ${className}`}
      {...props}
    >
      {title && (
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 ${headerClassName}`}
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      <div className={`px-4 sm:px-6 py-3 sm:py-4 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div
          className={`px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 ${footerClassName}`}
        >
          {footer}
        </div>
      )}
    </div>
  );
}