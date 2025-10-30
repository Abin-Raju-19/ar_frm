import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function PaymentCard({ payment, onView }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status.toLowerCase()]}`}>
        {status}
      </span>
    );
  };

  return (
    <Card 
      className="h-full"
      hoverable
    >
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{payment.description}</p>
          </div>
          {getStatusBadge(payment.status)}
        </div>
        
        <div className="text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span> {formatDate(payment.date)}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Method:</span> {payment.method}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">ID:</span> {payment.id.substring(0, 8)}...
          </p>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button size="sm" onClick={() => onView(payment.id)}>View Details</Button>
        </div>
      </div>
    </Card>
  );
}