import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { useAppointments } from '../context/appointment';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { FaCalendarAlt, FaUsers, FaDollarSign, FaPlus, FaUserCheck, FaChartLine } from 'react-icons/fa';

export default function TrainerDashboard() {
  const { currentUser } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    weeklyAppointments: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    averageRating: 4.8,
    completedSessions: 0,
  });

  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    if (!appointmentsLoading && appointments) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filter today's appointments
      const todayAppointments = appointments.filter(
        (appointment) => {
          const appointmentDate = new Date(appointment.date);
          appointmentDate.setHours(0, 0, 0, 0);
          return appointmentDate.getTime() === today.getTime() && 
                 appointment.status !== 'cancelled';
        }
      ).length;

      // Calculate week start (Sunday)
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

      // Get unique clients
      const uniqueClients = new Set(
        appointments
          .filter(apt => apt.user)
          .map((appointment) => appointment.user?._id || appointment.user)
      );

      // Calculate monthly revenue
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const completedAppointments = appointments.filter(
        (appointment) => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate >= monthStart && 
                 appointment.status === 'completed';
        }
      );

      const monthlyRevenue = completedAppointments.reduce((total, apt) => {
        return total + (apt.price || 0);
      }, 0);

      const completedSessions = appointments.filter(
        (appointment) => appointment.status === 'completed'
      ).length;

      setStats({
        todayAppointments,
        weeklyAppointments,
        totalClients: uniqueClients.size,
        monthlyRevenue,
        completedSessions,
      });

      // Today's schedule
      const todaysAppointments = appointments
        .filter(appointment => {
          const appointmentDate = new Date(appointment.date);
          return appointmentDate.getDate() === today.getDate() &&
                 appointmentDate.getMonth() === today.getMonth() &&
                 appointmentDate.getFullYear() === today.getFullYear() &&
                 appointment.status !== 'cancelled';
        })
        .sort((a, b) => {
          const timeA = a.startTime || '00:00';
          const timeB = b.startTime || '00:00';
          return timeA.localeCompare(timeB);
        });

      setTodaySchedule(todaysAppointments);

      // Recent clients
      const clientMap = new Map();
      appointments
        .filter(apt => apt.user)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .forEach(appointment => {
          const userId = appointment.user?._id || appointment.user;
          const userName = appointment.user?.name || 'Unknown Client';
          if (userId && !clientMap.has(userId) && clientMap.size < 5) {
            clientMap.set(userId, {
              id: userId,
              name: userName,
              lastSession: appointment.date || appointment.createdAt,
              status: appointment.status,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random`
            });
          }
        });

      setRecentClients(Array.from(clientMap.values()));
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
              Welcome back, {currentUser?.name || 'Trainer'}! 💪
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              {stats.todayAppointments > 0 
                ? `You have ${stats.todayAppointments} appointment${stats.todayAppointments > 1 ? 's' : ''} today`
                : "No appointments scheduled for today"
              }
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/trainer/appointments">
              <Button variant="primary" icon={<FaPlus className="mr-2" />}>
                View Schedule
              </Button>
            </Link>
            <Link to="/trainer/clients">
              <Button variant="outline">
                View Clients
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={<FaCalendarAlt className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Today's Appointments"
          value={stats.todayAppointments}
          change={`${stats.todayAppointments > 0 ? 'Scheduled' : 'All done!'}`}
        />
        <StatCard 
          icon={<FaUsers className="h-6 w-6 text-green-600 dark:text-green-400" />}
          title="Total Clients"
          value={stats.totalClients}
          changeType="increase"
          change={`${stats.completedSessions} sessions completed`}
        />
        <StatCard 
          icon={<FaDollarSign className="h-6 w-6 text-orange-600 dark:text-orange-400" />}
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
          change={`${stats.completedSessions} sessions`}
        />
        <StatCard 
          icon={<FaChartLine className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          title="Weekly Sessions"
          value={stats.weeklyAppointments}
          change={`${Math.round((stats.weeklyAppointments / 40) * 100)}% capacity`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Today's Schedule">
            {todaySchedule.length > 0 ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {todaySchedule.map(apt => (
                  <li key={apt._id} className="py-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {apt.type ? apt.type.charAt(0).toUpperCase() + apt.type.slice(1) : 'Appointment'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {apt.startTime || ''} - {apt.endTime || ''} with {apt.user?.name || 'Client'}
                      </p>
                      {apt.location && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Location: {apt.location}
                        </p>
                      )}
                    </div>
                    <Badge variant={apt.status === 'confirmed' ? 'success' : apt.status === 'completed' ? 'success' : 'warning'}>
                      {apt.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today.</p>
            )}
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card title="Quick Actions">
            <div className="flex flex-col space-y-4">
              <Link to="/trainer/workouts">
                <Button variant="secondary" className="w-full justify-start">
                  <FaPlus className="mr-3" /> Create Workout Plan
                </Button>
              </Link>
              <Link to="/trainer/clients">
                <Button variant="secondary" className="w-full justify-start">
                  <FaUserCheck className="mr-3" /> Manage Clients
                </Button>
              </Link>
              <Link to="/trainer/appointments">
                <Button variant="secondary" className="w-full justify-start">
                  <FaCalendarAlt className="mr-3" /> View Full Schedule
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {recentClients.length > 0 && (
        <div className="mt-8">
          <Card title="Recent Clients">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {recentClients.map(client => (
                <div key={client.id} className="flex flex-col items-center text-center">
                  <img 
                    src={client.avatar} 
                    alt={client.name} 
                    className="w-24 h-24 rounded-full mb-4 border-2 border-gray-200 dark:border-gray-700" 
                  />
                  <p className="font-semibold text-gray-900 dark:text-white">{client.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last: {new Date(client.lastSession).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
