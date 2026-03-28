import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workspaces from './pages/Workspaces';
import Tasks from './pages/Tasks';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Home from './pages/Home';

// Një ProtectedRoute e thjeshtë bazuar në localStorage (siç e kërkoi rregulli)
function ProtectedRoute({ children }) {
    const token = localStorage.getItem('token');
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default function App() {
  return (
    <Routes>
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route 
        path="/workspace/:workspaceId/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workspaces" 
        element={
          <ProtectedRoute>
            <Workspaces />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } 
      />
      
      {/* Ky ishte faqja fillestare e "Personit A" për Users */}
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
