import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { useAppointments } from '../context/appointment';
import { useWorkouts } from '../context/workout';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import WorkoutChart from '../components/dashboard/WorkoutChart';
import { FaCalendarAlt, FaDumbbell, FaFire, FaCrown, FaClipboardList, FaPlus } from 'react-icons/fa';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { workouts, loading: workoutsLoading } = useWorkouts();
  
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    completedWorkouts: 0,
    activeSubscription: false,
    weeklyProgress: 0,
    totalCaloriesBurned: 0,
    streakDays: 0,
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    if (!appointmentsLoading && !workoutsLoading) {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const upcomingAppointments = appointments.filter(
        (appointment) =>
          new Date(appointment.date) > today && appointment.status !== 'cancelled'
      ).length;

      const completedWorkouts = workouts.filter(
        (workout) => workout.status === 'completed'
      ).length;

      const weeklyWorkouts = workouts.filter(
        (workout) => 
          new Date(workout.createdAt) >= weekAgo && workout.status === 'completed'
      ).length;

      const totalCaloriesBurned = workouts
        .filter(workout => workout.status === 'completed')
        .reduce((total, workout) => total + (workout.caloriesBurned || 0), 0);

      const streakDays = Math.min(completedWorkouts * 2, 30);

      setStats({
        upcomingAppointments,
        completedWorkouts,
        activeSubscription: currentUser?.subscriptionStatus === 'active',
        weeklyProgress: weeklyWorkouts,
        totalCaloriesBurned,
        streakDays,
      });

      const activities = [
        ...appointments.slice(0, 3).map(apt => ({
          type: 'appointment',
          title: `${apt.type || 'Appointment'} - ${apt.startTime || ''}`,
          date: apt.date,
          status: apt.status,
          icon: <FaCalendarAlt className="text-blue-500" />
        })),
        ...workouts.slice(0, 3).map(workout => ({
          type: 'workout',
          title: workout.name,
          date: workout.createdAt,
          status: workout.status,
          icon: <FaDumbbell className="text-green-500" />
        }))
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      setRecentActivities(activities);
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

  const upcomingAppointmentsList = appointments
    .filter(apt => new Date(apt.date) > new Date() && apt.status !== 'cancelled')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  const recentWorkouts = workouts
    .filter(workout => workout.status === 'completed')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const StatCard = ({ icon, title, value, change, changeType }) => (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <p className={`mt-1 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 p-3">
          {icon}
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {currentUser?.name || 'User'}! 👋
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              {stats.streakDays > 0 
                ? `🔥 You're on a ${stats.streakDays}-day streak! Keep it up!`
                : "Let's start your fitness journey today!"
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/workouts/new">
              <Button variant="primary" icon={<FaPlus className="mr-2" />}>
                New Workout
              </Button>
            </Link>
            <Link to="/appointments/new">
              <Button variant="outline">
                Book Session
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={<FaCalendarAlt className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Upcoming Appointments"
          value={stats.upcomingAppointments}
          change={`${stats.upcomingAppointments > 0 ? 'This week' : 'No upcoming'}`}
        />
        <StatCard 
          icon={<FaDumbbell className="h-6 w-6 text-green-600 dark:text-green-400" />}
          title="Weekly Progress"
          value={`${stats.weeklyProgress} workouts`}
          changeType="increase"
          change="+5% from last week"
        />
        <StatCard 
          icon={<FaFire className="h-6 w-6 text-orange-600 dark:text-orange-400" />}
          title="Calories Burned"
          value={stats.totalCaloriesBurned.toLocaleString()}
          change="Total this month"
        />
        <StatCard 
          icon={<FaCrown className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          title="Membership"
          value={stats.activeSubscription ? 'Premium' : 'Free'}
          change={stats.activeSubscription ? 'Expires next month' : 'Upgrade available'}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Workout Progress This Week">
            <div className="h-80">
              <WorkoutChart workouts={workouts} />
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card title="Quick Actions">
            <div className="flex flex-col space-y-4">
              <Button variant="secondary" className="w-full justify-start">
                <FaClipboardList className="mr-3" /> Log Nutrition
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <FaDumbbell className="mr-3" /> View Workout Plans
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <FaCalendarAlt className="mr-3" /> Manage Appointments
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <FaCrown className="mr-3" /> Upgrade Membership
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Upcoming Appointments">
            {upcomingAppointmentsList.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {upcomingAppointmentsList.map(apt => (
                  <li key={apt._id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {apt.type ? apt.type.charAt(0).toUpperCase() + apt.type.slice(1) : 'Appointment'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(apt.date).toLocaleDateString()} at {apt.startTime || ''} - {apt.endTime || ''}
                        {apt.trainer?.user?.name && ` with ${apt.trainer.user.name}`}
                      </p>
                    </div>
                    <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'}>
                      {apt.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No upcoming appointments.</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card title="Recent Activity">
            <ul className="space-y-4">
              {recentActivities.map((activity, index) => (
                <li key={index} className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}