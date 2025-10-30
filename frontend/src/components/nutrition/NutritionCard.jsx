import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function NutritionCard({ nutrition, onView, onEdit, onDelete }) {
  return (
    <Card 
      title={nutrition.name}
      subtitle={`Calories: ${nutrition.calories} kcal`}
      className="h-full"
      hoverable
    >
      <div className="space-y-3">
        <div className="text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Protein:</span> {nutrition.protein}g
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Carbs:</span> {nutrition.carbs}g
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            <span className="font-medium text-gray-700 dark:text-gray-300">Fat:</span> {nutrition.fat}g
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button size="sm" onClick={() => onView(nutrition.id)} fullWidth>View</Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(nutrition.id)} fullWidth>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(nutrition.id)} fullWidth>Delete</Button>
        </div>
      </div>
    </Card>
  );
}