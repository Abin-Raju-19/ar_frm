import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Welcome to the admin dashboard. Here you can manage users, trainers, appointments, workouts, and nutrition plans.
      </p>
      {/* Admin specific content will go here */}
    </DashboardLayout>
  );
};

export default AdminDashboard;