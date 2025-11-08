import React, { useState } from 'react';
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

const AdminAppointments = () => {
  const { currentUser } = useAuth();
  const { 
    appointments, 
    loading, 
    error, 
    updateAppointment,
    cancelAppointment
  } = useAppointments();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({ ...dateRange, [name]: value });
  };

  const handleUpdateAppointment = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setActionLoading(true);

    try {
      const appointmentData = {
        status: formData.status,
        notes: formData.notes
      };

      await updateAppointment(selectedAppointment._id, appointmentData);
      setFormSuccess('Appointment updated successfully!');
      setIsUpdateModalOpen(false);
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

  const openUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status || 'scheduled',
      notes: appointment.notes || ''
    });
    setIsUpdateModalOpen(true);
  };

  const openDeleteModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDeleteModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="primary">Scheduled</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelled</Badge>;
      case 'no_show':
        return <Badge variant="warning">No Show</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const isWithinDateRange = (date) => {
    if (!dateRange.startDate && !dateRange.endDate) return true;
    
    const appointmentDate = new Date(date);
    const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
    const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
    
    if (startDate && endDate) {
      return appointmentDate >= startDate && appointmentDate <= endDate;
    } else if (startDate) {
      return appointmentDate >= startDate;
    } else if (endDate) {
      return appointmentDate <= endDate;
    }
    
    return true;
  };

  // Filter appointments based on selected filter, search query, and date range
  const filteredAppointments = appointments
    .filter(appointment => {
      // Apply status filter
      switch(filter) {
        case 'scheduled':
          return appointment.status === 'scheduled';
        case 'completed':
          return appointment.status === 'completed';
        case 'cancelled':
          return appointment.status === 'cancelled';
        case 'no_show':
          return appointment.status === 'no_show';
        default:
          return true; // 'all' filter
      }
    })
    .filter(appointment => {
      // Apply date range filter
      return isWithinDateRange(appointment.date);
    })
    .filter(appointment => {
      // Apply search query
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      const clientName = `${appointment.clientFirstName || ''} ${appointment.clientLastName || ''}`.toLowerCase();
      const trainerName = `${appointment.trainerFirstName || ''} ${appointment.trainerLastName || ''}`.toLowerCase();
      const appointmentType = (appointment.type || '').toLowerCase();
      
      return (
        clientName.includes(query) ||
        trainerName.includes(query) ||
        appointmentType.includes(query) ||
        appointment._id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending (newest first)

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Appointments</h1>
          <div className="flex space-x-2">
            <Button 
              onClick={() => {
                setDateRange({ startDate: '', endDate: '' });
                setSearchQuery('');
                setFilter('all');
              }}
              variant="outline"
            >
              Reset Filters
            </Button>
          </div>
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

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-3">
            <Card title="Filters">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      size="sm"
                      variant={filter === 'all' ? 'primary' : 'outline'}
                      onClick={() => setFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      size="sm"
                      variant={filter === 'scheduled' ? 'primary' : 'outline'}
                      onClick={() => setFilter('scheduled')}
                    >
                      Scheduled
                    </Button>
                    <Button 
                      size="sm"
                      variant={filter === 'completed' ? 'primary' : 'outline'}
                      onClick={() => setFilter('completed')}
                    >
                      Completed
                    </Button>
                    <Button 
                      size="sm"
                      variant={filter === 'cancelled' ? 'primary' : 'outline'}
                      onClick={() => setFilter('cancelled')}
                    >
                      Cancelled
                    </Button>
                    <Button 
                      size="sm"
                      variant={filter === 'no_show' ? 'primary' : 'outline'}
                      onClick={() => setFilter('no_show')}
                    >
                      No Show
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      name="startDate"
                      placeholder="Start Date"
                      value={dateRange.startDate}
                      onChange={handleDateRangeChange}
                    />
                    <Input
                      type="date"
                      name="endDate"
                      placeholder="End Date"
                      value={dateRange.endDate}
                      onChange={handleDateRangeChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <Input
                    type="text"
                    placeholder="Search by client, trainer, or type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </Card>
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
                No appointments found matching your filters.
              </p>
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Date & Time</th>
                  <th className="py-3 px-4 text-left">Client</th>
                  <th className="py-3 px-4 text-left">Trainer</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAppointments.map((appointment) => {
                  const appointmentDate = new Date(appointment.date);
                  
                  return (
                    <tr key={appointment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-4">
                        {appointmentDate.toLocaleDateString()}{' '}
                        {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        {appointment.clientFirstName} {appointment.clientLastName}
                      </td>
                      <td className="py-3 px-4">
                        {appointment.trainerFirstName} {appointment.trainerLastName}
                      </td>
                      <td className="py-3 px-4">
                        {appointment.type}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUpdateModal(appointment)}
                          >
                            Update
                          </Button>
                          {appointment.status !== 'cancelled' && (
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => openDeleteModal(appointment)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Appointment Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Update Appointment Status"
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
            {selectedAppointment && (
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p><strong>Client:</strong> {selectedAppointment.clientFirstName} {selectedAppointment.clientLastName}</p>
                <p><strong>Trainer:</strong> {selectedAppointment.trainerFirstName} {selectedAppointment.trainerLastName}</p>
                <p><strong>Date:</strong> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(selectedAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Type:</strong> {selectedAppointment.type}</p>
              </div>
            )}
            
            <Select
              label="Status"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              options={[
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'no_show', label: 'No Show' }
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
              placeholder="Add notes about this appointment"
            />
          </div>
          
          <div className="mt-6 flex justify-end space-x-2">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsUpdateModalOpen(false)}
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

export default AdminAppointments;