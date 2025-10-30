import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { useAppointments } from '../context/AppointmentContext';
import { useWorkouts } from '../context/WorkoutContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import WorkoutChart from '../components/dashboard/WorkoutChart';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedWorkouts: 0,
    activeSubscription: false,
  });

  useEffect(() => {
    if (!appointmentsLoading && !workoutsLoading) {
      // Calculate dashboard statistics
      const upcomingAppointments = appointments.filter(
        (appointment) =>
          new Date(appointment.date) > new Date() && appointment.status !== 'cancelled'
      ).length;

      const completedWorkouts = workouts.filter(
        (workout) => workout.status === 'completed'
      ).length;

      setStats({
        upcomingAppointments,
        completedWorkouts,
        activeSubscription: currentUser?.subscription?.status === 'active',
      });
    }
  }, [appointments, workouts, appointmentsLoading, workoutsLoading, currentUser]);

  if (appointmentsLoading || workoutsLoading) {
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
          Welcome back, {currentUser?.name || 'User'}!
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Here's an overview of your fitness journey
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
                Upcoming Appointments
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.upcomingAppointments}
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed Workouts
              </p>
              <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                {stats.completedWorkouts}
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-5">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Subscription Status
              </p>
              <div className="mt-1">
                {stats.activeSubscription ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="danger">Inactive</Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Fitness Tracking Visualization */}
      <div className="mt-8">
        <Card title="Workouts This Week">
          <WorkoutChart workouts={workouts} />
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card title="Recent Appointments">
          {appointments.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {appointments.slice(0, 3).map((appointment) => (
                  <li key={appointment._id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300">
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
              No appointments scheduled yet.
            </p>
          )}
        </Card>

        {/* Recent Workouts */}
        <Card title="Recent Workouts">
          {workouts.length > 0 ? (
            <div className="flow-root">
              <ul className="-my-5 divide-y divide-gray-200 dark:divide-gray-700">
                {workouts.slice(0, 3).map((workout) => (
                  <li key={workout._id} className="py-4">
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
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {workout.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {workout.exercises?.length || 0} exercises
                        </p>
                      </div>
                      <div>
                        <Badge
                          variant={
                            workout.status === 'completed'
                              ? 'success'
                              : workout.status === 'in_progress'
                              ? 'primary'
                              : 'default'
                          }
                        >
                          {workout.status === 'in_progress'
                            ? 'In Progress'
                            : workout.status.charAt(0).toUpperCase() +
                              workout.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
              No workouts available yet.
            </p>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}