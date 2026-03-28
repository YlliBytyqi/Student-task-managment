import { Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';

function ProtectedRoute({ children }) {
    const { token, loading } = useContext(AuthContext);

    if (loading) return <div>Duke u ngarkuar...</div>;

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
