import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Header from './pages/Header';
import Login from './components/Auth/Login';
import Home from './components/Home/Home';
import MyProfile from './components/Profile/MyProfile';
import Settings from './components/Settings/Settings';
import './styles/App.css';

const LoginRoute = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <Login />;
};

function AppRoutes() {
  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
