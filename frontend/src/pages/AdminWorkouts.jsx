import { useState, useEffect } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';

const AdminWorkouts = () => {
  const { currentUser } = useAuth();
  const { 
    workouts, 
    loading, 
    error, 
    createWorkout, 
    updateWorkout, 
    deleteWorkout 
  } = useWorkouts();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'strength',
    difficulty: 'beginner',
    duration: 30,
    isTemplate: true,
    exercises: [{ name: '', sets: 3, reps: 10, weight: 0, notes: '' }]
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('');
  const [users, setUsers] = useState([]);

  // Fetch users for filtering
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // This would be replaced with an actual API call
        const response = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleExerciseChange = (index, field, value) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: 3, reps: 10, weight: 0, notes: '' }]
    });
  };

  const removeExercise = (index) => {
    const updatedExercises = [...formData.exercises];
    updatedExercises.splice(index, 1);
    setFormData({ ...formData, exercises: updatedExercises });
  };

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.type || !formData.difficulty) {
        setFormError('Please fill all required fields');
        setActionLoading(false);
        return;
      }

      // Validate exercises
      const invalidExercises = formData.exercises.filter(ex => !ex.name);
      if (invalidExercises.length > 0) {
        setFormError('All exercises must have a name');
        setActionLoading(false);
        return;
      }

      await createWorkout(formData);
      setFormSuccess('Workout created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create workout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateWorkout = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      // Validate form
      if (!formData.name || !formData.type || !formData.difficulty) {
        setFormError('Please fill all required fields');
        setActionLoading(false);
        return;
      }

      // Validate exercises
      const invalidExercises = formData.exercises.filter(ex => !ex.name);
      if (invalidExercises.length > 0) {
        setFormError('All exercises must have a name');
        setActionLoading(false);
        return;
      }

      await updateWorkout(selectedWorkout._id, formData);
      setFormSuccess('Workout updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update workout');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWorkout = async () => {
    setFormError('');
    setActionLoading(true);

    try {
      await deleteWorkout(selectedWorkout._id);
      setFormSuccess('Workout deleted successfully!');
      setIsDeleteModalOpen(false);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to delete workout');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (workout) => {
    setSelectedWorkout(workout);
    setFormData({
      name: workout.name,
      description: workout.description || '',
      type: workout.type,
      difficulty: workout.difficulty,
      duration: workout.duration,
      isTemplate: workout.isTemplate !== false,
      exercises: workout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes || ''
      }))
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (workout) => {
    setSelectedWorkout(workout);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (workout) => {
    setSelectedWorkout(workout);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'strength',
      difficulty: 'beginner',
      duration: 30,
      isTemplate: true,
      exercises: [{ name: '', sets: 3, reps: 10, weight: 0, notes: '' }]
    });
    setFormError('');
    setFormSuccess('');
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge variant="success">Beginner</Badge>;
      case 'intermediate':
        return <Badge variant="warning">Intermediate</Badge>;
      case 'advanced':
        return <Badge variant="danger">Advanced</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'strength':
        return <Badge variant="primary">Strength</Badge>;
      case 'cardio':
        return <Badge variant="info">Cardio</Badge>;
      case 'flexibility':
        return <Badge variant="secondary">Flexibility</Badge>;
      case 'hiit':
        return <Badge>HIIT</Badge>;
      default:
        return <Badge>Other</Badge>;
    }
  };

  const getTemplateBadge = (isTemplate) => {
    return isTemplate ? 
      <Badge variant="success">Template</Badge> : 
      <Badge variant="info">User Workout</Badge>;
  };

  // Filter workouts by type, search query, template status, and user
  const filteredWorkouts = workouts
    .filter(workout => {
      // Filter by type
      if (filter !== 'all' && workout.type !== filter) return false;
      
      // Filter by template status
      if (templateFilter === 'templates' && !workout.isTemplate) return false;
      if (templateFilter === 'user-workouts' && workout.isTemplate) return false;
      
      // Filter by user
      if (userFilter && workout.createdBy !== userFilter) return false;
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          workout.name.toLowerCase().includes(query) ||
          workout.description?.toLowerCase().includes(query) ||
          workout.exercises.some(ex => ex.name.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

  // Get user name by ID
  const getUserName = (userId) => {
    const user = users.find(u => u._id === userId);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Workouts</h1>
          <Button 
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
          >
            Create New Workout
          </Button>
        </div>

        {error && (
          <Alert 
            type="error" 
            title="Error" 
            message={error} 
            className="mb-4" 
          />
        )}

        {formSuccess && (
          <Alert 
            type="success" 
            title="Success" 
            message={formSuccess} 
            className="mb-4" 
            onClose={() => setFormSuccess('')}
          />
        )}

        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <Select
              placeholder="Filter by user"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              options={[
                { value: '', label: 'All Users' },
                ...users.map(user => ({
                  value: user._id,
                  label: `${user.firstName} ${user.lastName}`
                }))
              ]}
            />
            
            <Select
              placeholder="Filter by template status"
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              options={[
                { value: 'all', label: 'All Workouts' },
                { value: 'templates', label: 'Templates Only' },
                { value: 'user-workouts', label: 'User Workouts Only' }
              ]}
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button 
              variant={filter === 'all' ? 'primary' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All Types
            </Button>
            <Button 
              variant={filter === 'strength' ? 'primary' : 'outline'}
              onClick={() => setFilter('strength')}
            >
              Strength
            </Button>
            <Button 
              variant={filter === 'cardio' ? 'primary' : 'outline'}
              onClick={() => setFilter('cardio')}
            >
              Cardio
            </Button>
            <Button 
              variant={filter === 'flexibility' ? 'primary' : 'outline'}
              onClick={() => setFilter('flexibility')}
            >
              Flexibility
            </Button>
            <Button 
              variant={filter === 'hiit' ? 'primary' : 'outline'}
              onClick={() => setFilter('hiit')}
            >
              HIIT
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading size="lg" />
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No workouts found matching your filters.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <Card 
                key={workout._id} 
                title={
                  <div className="flex justify-between items-center">
                    <span className="truncate">{workout.name}</span>
                    {getTypeBadge(workout.type)}
                  </div>
                }
                footer={
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openViewModal(workout)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditModal(workout)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => openDeleteModal(workout)}
                    >
                      Delete
                    </Button>
                  </div>
                }
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Difficulty:</span>
                    {getDifficultyBadge(workout.difficulty)}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Type:</span>
                    {getTemplateBadge(workout.isTemplate)}
                  </div>
                  <p>
                    <span className="font-medium">Created by:</span>{' '}
                    {getUserName(workout.createdBy)}
                  </p>
                  <p>
                    <span className="font-medium">Duration:</span>{' '}
                    {workout.duration} minutes
                  </p>
                  <p>
                    <span className="font-medium">Exercises:</span>{' '}
                    {workout.exercises.length}
                  </p>
                  {workout.description && (
                    <p className="text-gray-600 dark:text-gray-400 truncate">
                      {workout.description}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Workout Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Workout"
        size="lg"
      >
        <form onSubmit={handleCreateWorkout}>
          {formError && (
            <Alert 
              type="error" 
              title="Error" 
              message={formError} 
              className="mb-4" 
            />
          )}
          
          <div className="space-y-4">
            <Input
              label="Workout Name"
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="Description"
              type="textarea"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the workout"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Type"
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: 'strength', label: 'Strength' },
                  { value: 'cardio', label: 'Cardio' },
                  { value: 'flexibility', label: 'Flexibility' },
                  { value: 'hiit', label: 'HIIT' },
                  { value: 'other', label: 'Other' }
                ]}
                required
              />
              
              <Select
                label="Difficulty"
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ]}
                required
              />
              
              <Input
                label="Duration (minutes)"
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="5"
                max="180"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isTemplate"
                name="isTemplate"
                checked={formData.isTemplate}
                onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isTemplate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Create as template (can be assigned to multiple users)
              </label>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Exercises</h3>
              
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Exercise {index + 1}</h4>
                    {formData.exercises.length > 1 && (
                      <Button 
                        variant="danger" 
                        size="sm"
                        type="button"
                        onClick={() => removeExercise(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Exercise Name"
                      type="text"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Sets"
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                      />
                      
                      <Input
                        label="Reps"
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
                        min="0"
                        required
                      />
                      
                      <Input
                        label="Weight (kg)"
                        type="number"
                        value={exercise.weight}
                        onChange={(e) => handleExerciseChange(index, 'weight', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    
                    <Input
                      label="Notes"
                      type="text"
                      value={exercise.notes}
                      onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                      placeholder="Any special instructions"
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addExercise}
                className="mt-2"
              >
                Add Exercise
              </Button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={actionLoading}
            >
              Create Workout
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Workout Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Workout"
        size="lg"
      >
        <form onSubmit={handleUpdateWorkout}>
          {formError && (
            <Alert 
              type="error" 
              title="Error" 
              message={formError} 
              className="mb-4" 
            />
          )}
          
          <div className="space-y-4">
            <Input
              label="Workout Name"
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="Description"
              type="textarea"
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the workout"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Type"
                id="edit-type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                options={[
                  { value: 'strength', label: 'Strength' },
                  { value: 'cardio', label: 'Cardio' },
                  { value: 'flexibility', label: 'Flexibility' },
                  { value: 'hiit', label: 'HIIT' },
                  { value: 'other', label: 'Other' }
                ]}
                required
              />
              
              <Select
                label="Difficulty"
                id="edit-difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' }
                ]}
                required
              />
              
              <Input
                label="Duration (minutes)"
                type="number"
                id="edit-duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                min="5"
                max="180"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isTemplate"
                name="isTemplate"
                checked={formData.isTemplate}
                onChange={(e) => setFormData({ ...formData, isTemplate: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="edit-isTemplate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Template (can be assigned to multiple users)
              </label>
            </div>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Exercises</h3>
              
              {formData.exercises.map((exercise, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Exercise {index + 1}</h4>
                    {formData.exercises.length > 1 && (
                      <Button 
                        variant="danger" 
                        size="sm"
                        type="button"
                        onClick={() => removeExercise(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Exercise Name"
                      type="text"
                      value={exercise.name}
                      onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                      required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Sets"
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(index, 'sets', parseInt(e.target.value) || 0)}
                        min="1"
                        required
                      />
                      
                      <Input
                        label="Reps"
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(index, 'reps', parseInt(e.target.value) || 0)}
                        min="0"
                        required
                      />
                      
                      <Input
                        label="Weight (kg)"
                        type="number"
                        value={exercise.weight}
                        onChange={(e) => handleExerciseChange(index, 'weight', parseInt(e.target.value) || 0)}
                        min="0"
                      />
                    </div>
                    
                    <Input
                      label="Notes"
                      type="text"
                      value={exercise.notes}
                      onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                      placeholder="Any special instructions"
                    />
                  </div>
                </div>
              ))}
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={addExercise}
                className="mt-2"
              >
                Add Exercise
              </Button>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={actionLoading}
            >
              Update Workout
            </Button>
          </div>
        </form>
      </Modal>

      {/* View Workout Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedWorkout?.name || 'Workout Details'}
      >
        {selectedWorkout && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {getTypeBadge(selectedWorkout.type)}
                {getDifficultyBadge(selectedWorkout.difficulty)}
                {getTemplateBadge(selectedWorkout.isTemplate)}
              </div>
              <span>{selectedWorkout.duration} minutes</span>
            </div>
            
            <p>
              <span className="font-medium">Created by:</span>{' '}
              {getUserName(selectedWorkout.createdBy)}
            </p>
            
            {selectedWorkout.description && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-1">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedWorkout.description}</p>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-2">Exercises</h3>
              
              <div className="space-y-4">
                {selectedWorkout.exercises.map((exercise, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium mb-2">{exercise.name}</h4>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Sets</span>
                        <p>{exercise.sets}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Reps</span>
                        <p>{exercise.reps}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Weight</span>
                        <p>{exercise.weight > 0 ? `${exercise.weight} kg` : 'N/A'}</p>
                      </div>
                    </div>
                    
                    {exercise.notes && (
                      <div>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Notes</span>
                        <p>{exercise.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button 
            variant="outline"
            onClick={() => setIsViewModalOpen(false)}
          >
            Close
          </Button>
          <Button 
            onClick={() => {
              setIsViewModalOpen(false);
              openEditModal(selectedWorkout);
            }}
          >
            Edit Workout
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Workout"
      >
        {formError && (
          <Alert 
            type="error" 
            title="Error" 
            message={formError} 
            className="mb-4" 
          />
        )}
        
        <p className="mb-4">
          Are you sure you want to delete the workout "{selectedWorkout?.name}"? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteModalOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteWorkout}
            loading={actionLoading}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminWorkouts;