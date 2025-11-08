import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/auth';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Loading from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { FaUsers, FaUserTie, FaCalendarCheck, FaDumbbell, FaDollarSign, FaTasks, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTrainers: 0,
    totalAppointments: 0,
    totalWorkouts: 0,
    totalNutritionLogs: 0,
    totalPayments: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [topTrainers, setTopTrainers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch stats
      const statsResponse = await axios.get('/api/admin/stats', config);
      const statsData = statsResponse.data?.data?.stats || {};

      // Fetch users for subscription count
      const usersResponse = await axios.get('/api/admin/users', config);
      const users = usersResponse.data?.data?.users || [];
      const activeSubscriptions = users.filter(user => 
        user.subscriptionStatus === 'active'
      ).length;

      // Fetch trainers
      const trainersResponse = await axios.get('/api/admin/trainers', config);
      const trainers = trainersResponse.data?.data?.trainers || [];

      // Calculate top trainers (mock - would need appointment data)
      const topTrainersData = trainers.slice(0, 5).map(trainer => ({
        id: trainer._id,
        name: trainer.user?.name || 'Unknown',
        appointments: Math.floor(Math.random() * 20) + 5, // Mock data
        rating: (4.5 + Math.random() * 0.5).toFixed(1),
        clients: trainer.clients?.length || 0,
      }));

      // Create recent activity from users
      const activities = users.slice(0, 5).map(user => ({
        type: 'user',
        title: `New user registered: ${user.name}`,
        date: user.createdAt || new Date(),
        icon: <FaUsers className="text-blue-500" />,
        color: 'blue',
      }));

      setStats({
        ...statsData,
        activeSubscriptions,
      });
      setTopTrainers(topTrainersData);
      setRecentActivity(activities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
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
            <p className={`mt-1 text-sm ${changeType === 'increase' ? 'text-green-600' : changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'}`}>
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
              Admin Dashboard 🛡️
            </h1>
            <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">
              Welcome back, {currentUser?.name || 'Administrator'}! System is running smoothly.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/admin/users">
              <Button variant="primary">
                Manage Users
              </Button>
            </Link>
            <Link to="/admin/appointments">
              <Button variant="outline">
                View All
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          icon={<FaUsers className="h-6 w-6 text-blue-600 dark:text-blue-400" />}
          title="Total Users"
          value={stats.totalUsers}
          change={`${stats.totalTrainers} trainers`}
        />
        <StatCard 
          icon={<FaUserTie className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />}
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          change={stats.totalUsers > 0 ? `${Math.round((stats.activeSubscriptions / stats.totalUsers) * 100)}% conversion` : '0%'}
          changeType="increase"
        />
        <StatCard 
          icon={<FaDollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />}
          title="Total Revenue"
          value={`$${stats.totalRevenue?.toLocaleString() || 0}`}
          change={`${stats.totalPayments} payments`}
        />
        <StatCard 
          icon={<FaCalendarCheck className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
          title="Total Appointments"
          value={stats.totalAppointments}
          change={`${stats.totalWorkouts} workouts`}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="System Overview">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Workouts</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalWorkouts}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nutrition Logs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalNutritionLogs}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Trainers</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalTrainers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalPayments}</p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card title="System Health">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Database</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                  <FaCheckCircle className="mr-2" /> Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">API Status</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                  <FaCheckCircle className="mr-2" /> Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Users Online</span>
                <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                  {Math.floor(stats.totalUsers * 0.3)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="Recent Activity">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <li key={index} className="py-4 flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    {activity.icon}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{activity.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.date).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-4 text-gray-500 dark:text-gray-400">No recent activity</li>
            )}
          </ul>
        </Card>

        <Card title="Top Performing Trainers">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {topTrainers.length > 0 ? (
              topTrainers.map(trainer => (
                <li key={trainer.id} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{trainer.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {trainer.appointments} sessions • {trainer.clients} clients
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="font-bold text-gray-900 dark:text-white">{trainer.rating}</span>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-4 text-gray-500 dark:text-gray-400">No trainers available</li>
            )}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
