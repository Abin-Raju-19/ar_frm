import { useState, useEffect } from 'react';
import { useAppointments } from '../context/AppointmentContext';
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

const TrainerAppointments = () => {
  const { currentUser } = useAuth();
  const { 
    appointments, 
    loading, 
    error, 
    updateAppointment
  } = useAppointments();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [formData, setFormData] = useState({
    status: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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

  const openUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      status: appointment.status || 'scheduled',
      notes: appointment.notes || ''
    });
    setIsUpdateModalOpen(true);
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

  const isToday = (date) => {
    const today = new Date();
    const appointmentDate = new Date(date);
    return (
      appointmentDate.getDate() === today.getDate() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getFullYear() === today.getFullYear()
    );
  };

  const isThisWeek = (date) => {
    const now = new Date();
    const appointmentDate = new Date(date);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Saturday)
    endOfWeek.setHours(23, 59, 59, 999);
    
    return appointmentDate >= startOfWeek && appointmentDate <= endOfWeek;
  };

  // Filter appointments based on selected filter and search query
  const filteredAppointments = appointments
    .filter(appointment => {
      // Filter by trainer ID
      if (currentUser && currentUser.role === 'trainer') {
        if (appointment.trainerId !== currentUser._id) {
          return false;
        }
      }
      
      // Apply date filter
      switch(filter) {
        case 'today':
          return isToday(appointment.date);
        case 'week':
          return isThisWeek(appointment.date);
        case 'completed':
          return appointment.status === 'completed';
        case 'cancelled':
          return appointment.status === 'cancelled';
        default:
          return true;
      }
    })
    .filter(appointment => {
      // Apply search query
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      const clientName = `${appointment.clientFirstName || ''} ${appointment.clientLastName || ''}`.toLowerCase();
      const appointmentType = (appointment.type || '').toLowerCase();
      
      return (
        clientName.includes(query) ||
        appointmentType.includes(query) ||
        appointment._id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date ascending

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Trainer Appointments</h1>
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

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <Button 
              variant={filter === 'today' ? 'primary' : 'outline'}
              onClick={() => setFilter('today')}
            >
              Today
            </Button>
            <Button 
              variant={filter === 'week' ? 'primary' : 'outline'}
              onClick={() => setFilter('week')}
            >
              This Week
            </Button>
            <Button 
              variant={filter === 'completed' ? 'primary' : 'outline'}
              onClick={() => setFilter('completed')}
            >
              Completed
            </Button>
            <Button 
              variant={filter === 'cancelled' ? 'primary' : 'outline'}
              onClick={() => setFilter('cancelled')}
            >
              Cancelled
            </Button>
          </div>
          
          <div className="w-full md:w-64">
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                No appointments found for the selected filter.
              </p>
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="py-3 px-4 text-left">Client</th>
                  <th className="py-3 px-4 text-left">Date & Time</th>
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
                        {appointment.clientFirstName} {appointment.clientLastName}
                      </td>
                      <td className="py-3 px-4">
                        {appointmentDate.toLocaleDateString()}{' '}
                        {appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        {appointment.type}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(appointment.status)}
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openUpdateModal(appointment)}
                        >
                          Update
                        </Button>
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
              <div className="mb-4">
                <p><strong>Client:</strong> {selectedAppointment.clientFirstName} {selectedAppointment.clientLastName}</p>
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
    </DashboardLayout>
  );
};

export default TrainerAppointments;