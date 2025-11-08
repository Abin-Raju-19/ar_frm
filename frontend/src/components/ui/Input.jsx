import React from 'react';
export default function Input({
  label,
  id,
  type = 'text',
  className = '',
  error,
  fullWidth = true,
  size = 'md',
  leftIcon,
  rightIcon,
  responsive = true,
  ...props
}) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  };

  const widthClass = fullWidth ? 'w-full' : 'w-auto';
  const responsiveClass = responsive ? 'w-full sm:w-auto md:w-auto' : '';
  
  return (
    <div className={`mb-4 ${responsive ? 'w-full sm:max-w-md' : ''}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          id={id}
          className={`${widthClass} ${sizeClasses[size]} ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}