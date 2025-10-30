import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppProvider';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import TrainerDashboard from './pages/TrainerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import TrainerAppointments from './pages/TrainerAppointments';
import AdminAppointments from './pages/AdminAppointments';
import Workouts from './pages/Workouts';
import TrainerWorkouts from './pages/TrainerWorkouts';
import AdminWorkouts from './pages/AdminWorkouts';
import Nutrition from './pages/Nutrition';
import TrainerNutrition from './pages/TrainerNutrition';
import AdminNutrition from './pages/AdminNutrition';
import Payments from './pages/Payments';
import TrainerPayments from './pages/TrainerPayments';
import AdminPayments from './pages/AdminPayments';
import ComponentDemo from './pages/ComponentDemo';
import { useAuth } from './context/AuthContext';

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
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Appointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/workouts" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Workouts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nutrition" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Nutrition />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/payments" 
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <Payments />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/trainer" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/appointments" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/workouts" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerWorkouts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/nutrition" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerNutrition />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/trainer/payments" 
            element={
              <ProtectedRoute allowedRoles={['trainer']}>
                <TrainerPayments />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/appointments" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAppointments />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/workouts" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminWorkouts />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/nutrition" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminNutrition />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/payments" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPayments />
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
