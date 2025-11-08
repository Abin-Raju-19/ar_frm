import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AppProvider } from './context/AppProvider';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ComponentDemo from './pages/ComponentDemo';
import { useAuth } from './context/auth';

// Lazy-loaded dashboards to avoid fetching on unauthenticated redirects
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrainerDashboard = lazy(() => import('./pages/TrainerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const Appointments = lazy(() => import('./pages/Appointments'));
const TrainerAppointments = lazy(() => import('./pages/TrainerAppointments'));
const AdminAppointments = lazy(() => import('./pages/AdminAppointments'));

const Workouts = lazy(() => import('./pages/Workouts'));
const TrainerWorkouts = lazy(() => import('./pages/TrainerWorkouts'));
const AdminWorkouts = lazy(() => import('./pages/AdminWorkouts'));

const Nutrition = lazy(() => import('./pages/Nutrition'));
const TrainerNutrition = lazy(() => import('./pages/TrainerNutrition'));
const AdminNutrition = lazy(() => import('./pages/AdminNutrition'));

const Payments = lazy(() => import('./pages/Payments'));
const TrainerPayments = lazy(() => import('./pages/TrainerPayments'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect based on user role
    if (currentUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (currentUser.role === 'trainer') {
      return <Navigate to="/trainer" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <Router>
      <AppProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/components" element={<ComponentDemo />} />
          
          {/* Protected routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Suspense fallback={<div className="p-6">Loading Dashboard...</div>}>
                  <Dashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <Appointments />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workouts" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <Workouts />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nutrition" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <Nutrition />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <Payments />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/trainer" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <Suspense fallback={<div className="p-6">Loading Trainer Dashboard...</div>}>
                  <TrainerDashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/appointments" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <TrainerAppointments />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/workouts" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <TrainerWorkouts />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/nutrition" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <TrainerNutrition />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/payments" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <TrainerPayments />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<div className="p-6">Loading Admin Dashboard...</div>}>
                  <AdminDashboard />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/appointments" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <AdminAppointments />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/workouts" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <AdminWorkouts />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/nutrition" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <AdminNutrition />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Suspense fallback={<div className="p-6">Loading...</div>}>
                  <AdminPayments />
                </Suspense>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Layout><div className="p-6">Page Not Found</div></Layout>} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;