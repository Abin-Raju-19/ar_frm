import React, { useState, useEffect } from 'react';
import { useNutrition } from '../context/nutrition';
import { useAuth } from '../context/auth';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';

const TrainerNutrition = () => {
  const { currentUser } = useAuth();
  const {
    nutritionPlans,
    loading,
    error,
    fetchNutritionPlans,
    createNutritionPlan,
    updateNutritionPlan,
    deleteNutritionPlan,
  } = useNutrition();

  // State for clients
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientError, setClientError] = useState(null);

  // State for modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  
  // State for selected plan
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dailyCalories: '',
    protein: '',
    carbs: '',
    fat: '',
    type: 'weight-loss',
    isTemplate: true,
    meals: [{ name: '', description: '', calories: '', protein: '', carbs: '', fat: '' }],
  });
  
  // State for assign form
  const [assignForm, setAssignForm] = useState({
    clientId: '',
    notes: '',
  });
  
  // State for form errors
  const [formError, setFormError] = useState(null);
  
  // State for operation status
  const [operationLoading, setOperationLoading] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [templateFilter, setTemplateFilter] = useState('templates');
  
  // Fetch clients on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Fetch clients
  const fetchClients = async () => {
    try {
      setLoadingClients(true);
      setClientError(null);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/users/clients', config);
      setClients(response.data);
      setLoadingClients(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClientError('Failed to fetch clients');
      setLoadingClients(false);
    }
  };

  // Filtered nutrition plans
  const filteredPlans = nutritionPlans.filter(plan => {
    // Filter by template status
    if (templateFilter === 'templates' && !plan.isTemplate) return false;
    if (templateFilter === 'assigned' && plan.isTemplate) return false;
    
    // Filter by type
    if (typeFilter !== 'all' && plan.type !== typeFilter) return false;
    
    // Filter by search query
    if (searchQuery && !plan.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle assign form change
  const handleAssignFormChange = (e) => {
    const { name, value } = e.target;
    setAssignForm({ ...assignForm, [name]: value });
  };

  // Handle meal input change
  const handleMealChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMeals = [...formData.meals];
    updatedMeals[index] = { ...updatedMeals[index], [name]: value };
    setFormData({ ...formData, meals: updatedMeals });
  };

  // Add meal
  const addMeal = () => {
    setFormData({
      ...formData,
      meals: [...formData.meals, { name: '', description: '', calories: '', protein: '', carbs: '', fat: '' }],
    });
  };

  // Remove meal
  const removeMeal = (index) => {
    const updatedMeals = [...formData.meals];
    updatedMeals.splice(index, 1);
    setFormData({ ...formData, meals: updatedMeals });
  };

  // Handle create nutrition plan
  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.dailyCalories) {
        setFormError('Please fill in all required fields');
        setOperationLoading(false);
        return;
      }
      
      // Create nutrition plan
      await createNutritionPlan({
        ...formData,
        isTemplate: true,
        createdBy: currentUser._id,
      });
      setOperationSuccess('Nutrition plan created successfully');
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create nutrition plan');
    } finally {
      setOperationLoading(false);
      setTimeout(() => setOperationSuccess(null), 3000);
    }
  };

  // Handle update nutrition plan
  const handleUpdatePlan = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Validate form data
      if (!formData.name || !formData.description || !formData.dailyCalories) {
        setFormError('Please fill in all required fields');
        setOperationLoading(false);
        return;
      }
      
      // Update nutrition plan
      await updateNutritionPlan(selectedPlan._id, formData);
      setOperationSuccess('Nutrition plan updated successfully');
      setIsEditModalOpen(false);
      resetForm();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update nutrition plan');
    } finally {
      setOperationLoading(false);
      setTimeout(() => setOperationSuccess(null), 3000);
    }
  };

  // Handle delete nutrition plan
  const handleDeletePlan = async () => {
    setOperationLoading(true);
    
    try {
      await deleteNutritionPlan(selectedPlan._id);
      setOperationSuccess('Nutrition plan deleted successfully');
      setIsDeleteModalOpen(false);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to delete nutrition plan');
    } finally {
      setOperationLoading(false);
      setTimeout(() => setOperationSuccess(null), 3000);
    }
  };

  // Handle assign nutrition plan
  const handleAssignPlan = async (e) => {
    e.preventDefault();
    setOperationLoading(true);
    setFormError(null);
    
    try {
      // Validate form data
      if (!assignForm.clientId) {
        setFormError('Please select a client');
        setOperationLoading(false);
        return;
      }
      
      // Create a copy of the selected plan for the client
      const planData = {
        ...selectedPlan,
        _id: undefined,
        isTemplate: false,
        assignedTo: assignForm.clientId,
        assignedBy: currentUser._id,
        notes: assignForm.notes,
      };
      
      await createNutritionPlan(planData);
      setOperationSuccess('Nutrition plan assigned successfully');
      setIsAssignModalOpen(false);
      resetAssignForm();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to assign nutrition plan');
    } finally {
      setOperationLoading(false);
      setTimeout(() => setOperationSuccess(null), 3000);
    }
  };

  // Open view modal
  const openViewModal = (plan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      dailyCalories: plan.dailyCalories,
      protein: plan.protein,
      carbs: plan.carbs,
      fat: plan.fat,
      type: plan.type,
      isTemplate: plan.isTemplate,
      meals: plan.meals || [{ name: '', description: '', calories: '', protein: '', carbs: '', fat: '' }],
    });
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setIsDeleteModalOpen(true);
  };

  // Open assign modal
  const openAssignModal = (plan) => {
    setSelectedPlan(plan);
    resetAssignForm();
    setIsAssignModalOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      dailyCalories: '',
      protein: '',
      carbs: '',
      fat: '',
      type: 'weight-loss',
      isTemplate: true,
      meals: [{ name: '', description: '', calories: '', protein: '', carbs: '', fat: '' }],
    });
    setFormError(null);
  };

  // Reset assign form
  const resetAssignForm = () => {
    setAssignForm({
      clientId: '',
      notes: '',
    });
    setFormError(null);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nutrition Plans</h1>
          <Button onClick={openCreateModal}>Create New Plan</Button>
        </div>

        {operationSuccess && (
          <Alert type="success" className="mb-4">
            {operationSuccess}
          </Alert>
        )}

        {error && (
          <Alert type="error" className="mb-4">
            {error}
          </Alert>
        )}

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'weight-loss', label: 'Weight Loss' },
                  { value: 'muscle-gain', label: 'Muscle Gain' },
                  { value: 'maintenance', label: 'Maintenance' },
                ]}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Status</label>
              <Select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                options={[
                  { value: 'templates', label: 'Templates' },
                  { value: 'assigned', label: 'Assigned Plans' },
                ]}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : filteredPlans.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No nutrition plans found.</p>
            <Button onClick={openCreateModal} className="mt-4">
              Create Your First Plan
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan) => (
              <Card key={plan._id} className="p-0 overflow-hidden">
                <div className="p-4 bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <div className="flex space-x-2">
                      <Badge color={plan.type === 'weight-loss' ? 'red' : plan.type === 'muscle-gain' ? 'blue' : 'green'}>
                        {plan.type === 'weight-loss' ? 'Weight Loss' : 
                         plan.type === 'muscle-gain' ? 'Muscle Gain' : 'Maintenance'}
                      </Badge>
                      {plan.isTemplate && (
                        <Badge color="purple">Template</Badge>
                      )}
                    </div>
                  </div>
                  {plan.assignedTo && (
                    <p className="text-sm text-gray-500 mt-1">
                      Assigned to: {clients.find(c => c._id === plan.assignedTo)?.name || 'Unknown Client'}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4 line-clamp-2">{plan.description}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Calories</p>
                      <p className="font-semibold">{plan.dailyCalories}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Protein</p>
                      <p className="font-semibold">{plan.protein}g</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <p className="text-xs text-gray-500">Carbs</p>
                      <p className="font-semibold">{plan.carbs}g</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => openViewModal(plan)}>
                      View Details
                    </Button>
                    <div className="flex space-x-2">
                      {plan.isTemplate && (
                        <Button variant="primary" onClick={() => openAssignModal(plan)}>
                          Assign
                        </Button>
                      )}
                      <Button variant="outline" onClick={() => openEditModal(plan)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => openDeleteModal(plan)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* View Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={selectedPlan?.name || 'Nutrition Plan Details'}
        >
          {selectedPlan && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{selectedPlan.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Daily Targets</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Calories:</span> {selectedPlan.dailyCalories}</p>
                    <p><span className="font-medium">Protein:</span> {selectedPlan.protein}g</p>
                    <p><span className="font-medium">Carbs:</span> {selectedPlan.carbs}g</p>
                    <p><span className="font-medium">Fat:</span> {selectedPlan.fat}g</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Plan Type</h3>
                  <Badge color={selectedPlan.type === 'weight-loss' ? 'red' : selectedPlan.type === 'muscle-gain' ? 'blue' : 'green'} className="text-sm">
                    {selectedPlan.type === 'weight-loss' ? 'Weight Loss' : 
                     selectedPlan.type === 'muscle-gain' ? 'Muscle Gain' : 'Maintenance'}
                  </Badge>
                  
                  {selectedPlan.isTemplate ? (
                    <div className="mt-2">
                      <Badge color="purple" className="text-sm">Template</Badge>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <p className="text-sm"><span className="font-medium">Assigned to:</span> {clients.find(c => c._id === selectedPlan.assignedTo)?.name || 'Unknown Client'}</p>
                      {selectedPlan.notes && (
                        <p className="text-sm mt-2"><span className="font-medium">Notes:</span> {selectedPlan.notes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Meals</h3>
                {selectedPlan.meals && selectedPlan.meals.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPlan.meals.map((meal, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-medium mb-2">{meal.name}</h4>
                        <p className="text-gray-600 mb-2">{meal.description}</p>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Calories</p>
                            <p className="font-semibold">{meal.calories}</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Protein</p>
                            <p className="font-semibold">{meal.protein}g</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Carbs</p>
                            <p className="font-semibold">{meal.carbs}g</p>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded">
                            <p className="text-xs text-gray-500">Fat</p>
                            <p className="font-semibold">{meal.fat}g</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No meals added to this plan.</p>
                )}
              </div>
              
              <div className="flex justify-end mt-4">
                <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Nutrition Plan Template"
        >
          <form onSubmit={handleCreatePlan} className="space-y-4">
            {formError && (
              <Alert type="error" className="mb-4">
                {formError}
              </Alert>
            )}
            
            <Input
              label="Plan Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              textarea
              required
            />
            
            <Select
              label="Plan Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'weight-loss', label: 'Weight Loss' },
                { value: 'muscle-gain', label: 'Muscle Gain' },
                { value: 'maintenance', label: 'Maintenance' },
              ]}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Daily Calories"
                name="dailyCalories"
                type="number"
                value={formData.dailyCalories}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Protein (g)"
                name="protein"
                type="number"
                value={formData.protein}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Carbs (g)"
                name="carbs"
                type="number"
                value={formData.carbs}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Fat (g)"
                name="fat"
                type="number"
                value={formData.fat}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Meals</h3>
                <Button type="button" onClick={addMeal} variant="outline" size="sm">
                  Add Meal
                </Button>
              </div>
              
              {formData.meals.map((meal, index) => (
                <div key={index} className="border p-4 rounded mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Meal {index + 1}</h4>
                    {formData.meals.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMeal(index)}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Meal Name"
                      name="name"
                      value={meal.name}
                      onChange={(e) => handleMealChange(index, e)}
                      required
                    />
                    
                    <Input
                      label="Description"
                      name="description"
                      value={meal.description}
                      onChange={(e) => handleMealChange(index, e)}
                      textarea
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Calories"
                        name="calories"
                        type="number"
                        value={meal.calories}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                      
                      <Input
                        label="Protein (g)"
                        name="protein"
                        type="number"
                        value={meal.protein}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Carbs (g)"
                        name="carbs"
                        type="number"
                        value={meal.carbs}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                      
                      <Input
                        label="Fat (g)"
                        name="fat"
                        type="number"
                        value={meal.fat}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={operationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={operationLoading}>
                {operationLoading ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Nutrition Plan"
        >
          <form onSubmit={handleUpdatePlan} className="space-y-4">
            {formError && (
              <Alert type="error" className="mb-4">
                {formError}
              </Alert>
            )}
            
            <Input
              label="Plan Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            
            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              textarea
              required
            />
            
            <Select
              label="Plan Type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'weight-loss', label: 'Weight Loss' },
                { value: 'muscle-gain', label: 'Muscle Gain' },
                { value: 'maintenance', label: 'Maintenance' },
              ]}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Daily Calories"
                name="dailyCalories"
                type="number"
                value={formData.dailyCalories}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Protein (g)"
                name="protein"
                type="number"
                value={formData.protein}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Carbs (g)"
                name="carbs"
                type="number"
                value={formData.carbs}
                onChange={handleInputChange}
                required
              />
              
              <Input
                label="Fat (g)"
                name="fat"
                type="number"
                value={formData.fat}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Meals</h3>
                <Button type="button" onClick={addMeal} variant="outline" size="sm">
                  Add Meal
                </Button>
              </div>
              
              {formData.meals.map((meal, index) => (
                <div key={index} className="border p-4 rounded mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Meal {index + 1}</h4>
                    {formData.meals.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeMeal(index)}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <Input
                      label="Meal Name"
                      name="name"
                      value={meal.name}
                      onChange={(e) => handleMealChange(index, e)}
                      required
                    />
                    
                    <Input
                      label="Description"
                      name="description"
                      value={meal.description}
                      onChange={(e) => handleMealChange(index, e)}
                      textarea
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Calories"
                        name="calories"
                        type="number"
                        value={meal.calories}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                      
                      <Input
                        label="Protein (g)"
                        name="protein"
                        type="number"
                        value={meal.protein}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Carbs (g)"
                        name="carbs"
                        type="number"
                        value={meal.carbs}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                      
                      <Input
                        label="Fat (g)"
                        name="fat"
                        type="number"
                        value={meal.fat}
                        onChange={(e) => handleMealChange(index, e)}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={operationLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={operationLoading}>
                {operationLoading ? 'Updating...' : 'Update Plan'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Nutrition Plan"
        >
          <div className="space-y-4">
            <p>Are you sure you want to delete this nutrition plan? This action cannot be undone.</p>
            
            {formError && (
              <Alert type="error">
                {formError}
              </Alert>
            )}
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={operationLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeletePlan}
                disabled={operationLoading}
              >
                {operationLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Assign Modal */}
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          title="Assign Nutrition Plan"
        >
          <form onSubmit={handleAssignPlan} className="space-y-4">
            {formError && (
              <Alert type="error" className="mb-4">
                {formError}
              </Alert>
            )}
            
            {clientError && (
              <Alert type="error" className="mb-4">
                {clientError}
              </Alert>
            )}
            
            {loadingClients ? (
              <Loading />
            ) : clients.length === 0 ? (
              <Alert type="info">
                You don't have any clients yet. Please add clients first.
              </Alert>
            ) : (
              <>
                <Select
                  label="Select Client"
                  name="clientId"
                  value={assignForm.clientId}
                  onChange={handleAssignFormChange}
                  options={clients.map(client => ({
                    value: client._id,
                    label: client.name,
                  }))}
                  required
                />
                
                <Input
                  label="Notes for Client"
                  name="notes"
                  value={assignForm.notes}
                  onChange={handleAssignFormChange}
                  textarea
                  placeholder="Add any specific instructions or notes for this client..."
                />
                
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAssignModalOpen(false)}
                    disabled={operationLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={operationLoading || clients.length === 0}>
                    {operationLoading ? 'Assigning...' : 'Assign Plan'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default TrainerNutrition;