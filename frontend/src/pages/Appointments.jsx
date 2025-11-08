import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAppointments } from '../context/appointment';
import { useAuth } from '../context/auth';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';

const Appointments = () => {
  const { currentUser } = useAuth();
  const { 
    appointments, 
    loading, 
    error, 
    createAppointment, 
    updateAppointment, 
    cancelAppointment,
    createCheckoutSession
  } = useAppointments();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    trainer: '',
    type: 'consultation',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [filter, setFilter] = useState('upcoming');

  useEffect(() => {
    // Fetch trainers for the dropdown
    const fetchTrainers = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get('/api/trainers', config);
        const trainersData = response.data?.data?.trainers || [];
        setTrainers(trainersData.map(trainer => ({
          id: trainer._id,
          name: trainer.user?.name || 'Unknown Trainer'
        })));
      } catch (error) {
        console.error('Error fetching trainers:', error);
        setTrainers([]);
      }
    };
    fetchTrainers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      // Validate form
      if (!formData.date || !formData.time || !formData.trainer || !formData.type) {
        setFormError('Please fill all required fields');
        setActionLoading(false);
        return;
      }

      // Format date and time for API
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000); // 1 hour later
      
      const appointmentData = {
        date: dateTime,
        startTime: formData.time,
        endTime: endTime.toTimeString().slice(0, 5),
        trainer: formData.trainer,
        type: formData.type,
        location: 'online',
        notes: formData.notes,
        price: 50
      };

      const newAppointment = await createAppointment(appointmentData);
      setFormSuccess('Appointment created successfully!');
      setIsCreateModalOpen(false);
      
      // Redirect to payment if needed (appointment has a price)
      if (newAppointment.price && newAppointment.price > 0) {
        try {
          const session = await createCheckoutSession(newAppointment._id);
          // Redirect to Stripe checkout
          if (session?.data?.sessionUrl) {
            window.location.href = session.data.sessionUrl;
          } else if (session?.sessionUrl) {
            window.location.href = session.sessionUrl;
          }
        } catch (error) {
          console.error('Failed to create checkout session:', error);
        }
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      // Validate form
      if (!formData.date || !formData.time || !formData.trainer || !formData.type) {
        setFormError('Please fill all required fields');
        setActionLoading(false);
        return;
      }

      // Format date and time for API
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000); // 1 hour later
      
      const appointmentData = {
        date: dateTime,
        startTime: formData.time,
        endTime: endTime.toTimeString().slice(0, 5),
        trainer: formData.trainer,
        type: formData.type,
        location: selectedAppointment?.location || 'online',
        notes: formData.notes
      };

      await updateAppointment(selectedAppointment._id, appointmentData);
      setFormSuccess('Appointment updated successfully!');
      setIsEditModalOpen(false);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    setFormError('');
    setActionLoading(true);

    try {
      await cancelAppointment(selectedAppointment._id);
      setFormSuccess('Appointment cancelled successfully!');
      setIsDeleteModalOpen(false);
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (appointment) => {
    setSelectedAppointment(appointment);
    
    // Format date and time for form inputs
    const appointmentDate = new Date(appointment.date);
    const date = appointmentDate.toISOString().split('T')[0];
    const time = appointmentDate.toTimeString().slice(0, 5);
    
    setFormData({
      date,
      time: appointment.startTime || time,
      trainer: appointment.trainer?._id || appointment.trainer || '',
      type: appointment.type,
      notes: appointment.notes || ''
    });
    
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      trainer: '',
      type: 'consultation',
      notes: ''
    });
    setFormError('');
    setFormSuccess('');
  };

  const getStatusBadge = (appointment) => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    
    if (appointment.status === 'cancelled') {
      return <Badge variant="danger">Cancelled</Badge>;
    } else if (appointment.status === 'completed') {
      return <Badge variant="success">Completed</Badge>;
    } else if (appointmentDate < now) {
      return <Badge variant="warning">Missed</Badge>;
    } else {
      return <Badge variant="primary">Upcoming</Badge>;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    
    switch(filter) {
      case 'upcoming':
        return appointmentDate > now && appointment.status !== 'cancelled';
      case 'past':
        return appointmentDate < now || appointment.status === 'completed';
      case 'cancelled':
        return appointment.status === 'cancelled';
      default:
        return true;
    }
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Appointments</h1>
          <Button 
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
          >
            Book New Appointment
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

        <div className="mb-6">
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'upcoming' ? 'primary' : 'outline'}
              onClick={() => setFilter('upcoming')}
            >
              Upcoming
            </Button>
            <Button 
              variant={filter === 'past' ? 'primary' : 'outline'}
              onClick={() => setFilter('past')}
            >
              Past
            </Button>
            <Button 
              variant={filter === 'cancelled' ? 'primary' : 'outline'}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loading size="lg" />
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No {filter} appointments found.
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAppointments.map((appointment) => {
              const appointmentDate = new Date(appointment.date);
              const isPast = appointmentDate < new Date();
              const isCancelled = appointment.status === 'cancelled';
              
              return (
                <Card 
                  key={appointment._id} 
                  title={
                    <div className="flex justify-between items-center">
                      <span>{appointment.type}</span>
                      {getStatusBadge(appointment)}
                    </div>
                  }
                  footer={
                    <div className="flex justify-end space-x-2">
                      {!isPast && !isCancelled && (
                        <>
                          {appointment.price > 0 && !appointment.payment && appointment.status !== 'confirmed' && (
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  setActionLoading(true);
                                  const session = await createCheckoutSession(appointment._id);
                                  if (session?.data?.sessionUrl) {
                                    window.location.href = session.data.sessionUrl;
                                  } else if (session?.sessionUrl) {
                                    window.location.href = session.sessionUrl;
                                  }
                                } catch (error) {
                                  setFormError(error.response?.data?.message || 'Failed to create checkout session');
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              disabled={actionLoading}
                            >
                              {actionLoading ? 'Processing...' : 'Pay Now'}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditModal(appointment)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => openDeleteModal(appointment)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  }
                >
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Date:</span>{' '}
                      {appointmentDate.toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span>{' '}
                      {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p>
                      <span className="font-medium">Trainer:</span>{' '}
                      {appointment.trainer?.user?.name || appointment.trainer?.name || 'Not assigned'}
                    </p>
                    {appointment.startTime && appointment.endTime && (
                      <p>
                        <span className="font-medium">Time:</span>{' '}
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                    )}
                    {appointment.price > 0 && (
                      <p>
                        <span className="font-medium">Price:</span>{' '}
                        ${appointment.price.toFixed(2)}
                        {appointment.payment && (
                          <Badge variant="success" className="ml-2">Paid</Badge>
                        )}
                      </p>
                    )}
                    {appointment.notes && (
                      <p>
                        <span className="font-medium">Notes:</span>{' '}
                        {appointment.notes}
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Book New Appointment"
      >
        <form onSubmit={handleCreateAppointment}>
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
              label="Date"
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            
            <Input
              label="Time"
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
            
            <Select
              label="Trainer"
              id="trainer"
              name="trainer"
              value={formData.trainer}
              onChange={handleInputChange}
              options={trainers.map(trainer => ({
                value: trainer.id,
                label: trainer.name
              }))}
              required
            />
            
            <Select
              label="Appointment Type"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'personal_training', label: 'Personal Training' },
                { value: 'assessment', label: 'Fitness Assessment' },
                { value: 'nutrition', label: 'Nutrition Consultation' }
              ]}
              required
            />
            
            <Input
              label="Notes"
              type="textarea"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special requirements or information"
            />
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
              Book Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Appointment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Appointment"
      >
        <form onSubmit={handleUpdateAppointment}>
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
              label="Date"
              type="date"
              id="edit-date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            
            <Input
              label="Time"
              type="time"
              id="edit-time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
            
            <Select
              label="Trainer"
              id="edit-trainer"
              name="trainer"
              value={formData.trainer}
              onChange={handleInputChange}
              options={trainers.map(trainer => ({
                value: trainer.id,
                label: trainer.name
              }))}
              required
            />
            
            <Select
              label="Appointment Type"
              id="edit-type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              options={[
                { value: 'consultation', label: 'Consultation' },
                { value: 'personal_training', label: 'Personal Training' },
                { value: 'assessment', label: 'Fitness Assessment' },
                { value: 'nutrition', label: 'Nutrition Consultation' }
              ]}
              required
            />
            
            <Input
              label="Notes"
              type="textarea"
              id="edit-notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Any special requirements or information"
            />
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
              Update Appointment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Cancel Appointment"
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
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
        
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => setIsDeleteModalOpen(false)}
          >
            No, Keep It
          </Button>
          <Button 
            variant="danger" 
            onClick={handleCancelAppointment}
            loading={actionLoading}
          >
            Yes, Cancel Appointment
          </Button>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default Appointments;