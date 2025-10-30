import React from 'react';
import Card from '../ui/Card';

export default function StatCard({ title, value, icon, change, changeType = 'increase', className = '' }) {
  const changeClasses = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card className={`h-full ${className}`} hoverable>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
          
          {change && (
            <div className="mt-1 flex items-center text-sm">
              <span className={changeClasses[changeType]}>
                {changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '•'} {change}
              </span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="p-3 rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}