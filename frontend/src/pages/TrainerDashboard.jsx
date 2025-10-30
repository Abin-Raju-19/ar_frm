import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';

export default function TrainerDashboard() {
  const { currentUser } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weeklyAppointments: 0,
    totalClients: 0,
  });

  useEffect(() => {
    if (!appointmentsLoading) {
      // Calculate dashboard statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayAppointments = appointments.filter(
        (appointment) => {
          const appointmentDate = new Date(appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === today.getTime() && 
                 appointment.status !== 'cancelled';
        }
      ).length;

      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weeklyAppointments = appointments.filter(
        (appointment) => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= weekStart && 
                 appointmentDate <= weekEnd && 
                 appointment.status !== 'cancelled';
        }
      ).length;

      // Get unique client count
      const uniqueClients = new Set(
        appointments.map((appointment) => appointment.userId)
      );

      setStats({
        todayAppointments,
        weeklyAppointments,
        totalClients: uniqueClients.size,
      });
    }
  }, [appointments, appointmentsLoading]);

  if (appointmentsLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="pb-5 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Trainer Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {currentUser?.name || 'Trainer'}!
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Stats Cards */}
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-primary-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Today's Appointments
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.todayAppointments}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-secondary-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                This Week's Appointments
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.weeklyAppointments}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 rounded-md bg-green-500 p-3">
              <svg
                className="h-6 w-6 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Clients
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.totalClients}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        {/* Today's Schedule */}
        <Card title="Today's Schedule">
          {appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            const today = new Date();
            return appointmentDate.getDate() === today.getDate() &&
                   appointmentDate.getMonth() === today.getMonth() &&
                   appointmentDate.getFullYear() === today.getFullYear() &&
                   appointment.status !== 'cancelled';
          }).length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {appointments
                  .filter(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    const today = new Date();
                    return appointmentDate.getDate() === today.getDate() &&
                           appointmentDate.getMonth() === today.getMonth() &&
                           appointmentDate.getFullYear() === today.getFullYear() &&
                           appointment.status !== 'cancelled';
                  })
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((appointment) => (
                    <li key={appointment._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {appointment.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            Client: {appointment.userName || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant={
                              appointment.status === 'confirmed'
                                ? 'success'
                                : appointment.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No appointments scheduled for today.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-8">
        {/* Upcoming Appointments */}
        <Card title="Upcoming Appointments">
          {appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return appointmentDate > today && appointment.status !== 'cancelled';
          }).length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {appointments
                  .filter(appointment => {
                    const appointmentDate = new Date(appointment.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return appointmentDate > today && appointment.status !== 'cancelled';
                  })
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map((appointment) => (
                    <li key={appointment._id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-secondary-100 text-secondary-600 dark:bg-secondary-900 dark:text-secondary-300">
                            <svg
                              className="h-6 w-6"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {appointment.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {new Date(appointment.date).toLocaleDateString()} at{' '}
                            {new Date(appointment.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div>
                          <Badge
                            variant={
                              appointment.status === 'confirmed'
                                ? 'success'
                                : appointment.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No upcoming appointments scheduled.
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}