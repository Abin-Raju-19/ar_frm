import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function WorkoutCard({ workout, onView, onEdit, onDelete }) {
  return (
    <Card 
      title={workout.name}
      subtitle={`Duration: ${workout.duration} minutes`}
      className="h-full"
      hoverable
    >
      <div className="space-y-3">
        <div className="text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span> {workout.type}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Difficulty:</span> {workout.difficulty}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Calories:</span> {workout.calories} kcal
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button size="sm" onClick={() => onView(workout.id)} fullWidth>View</Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(workout.id)} fullWidth>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(workout.id)} fullWidth>Delete</Button>
        </div>
      </div>
    </Card>
  );
}