import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function AppointmentCard({ appointment, onView, onEdit, onCancel }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status.toLowerCase()]}`}>
        {status}
      </span>
    );
  };

  return (
    <Card 
      title={appointment.title || 'Appointment'}
      className="h-full"
      hoverable
    >
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-sm font-medium">{appointment.trainerName || 'Trainer'}</p>
          {getStatusBadge(appointment.status)}
        </div>
        
        <div className="text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span> {formatDate(appointment.date)}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span> {appointment.duration} minutes
          </p>
          {appointment.notes && (
            <p className="text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
              <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span> {appointment.notes}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button size="sm" onClick={() => onView(appointment.id)} fullWidth>View</Button>
          {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onEdit(appointment.id)} fullWidth>Edit</Button>
              <Button size="sm" variant="danger" onClick={() => onCancel(appointment.id)} fullWidth>Cancel</Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}