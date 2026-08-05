import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DecisionProvider } from './context/DecisionContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import DecisionStudio from './pages/DecisionStudio';
import NewDecision from './pages/NewDecision';
import Login from './pages/Login';
import Register from './pages/Register';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-sm">Initializing Auth...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <DecisionProvider>
        <Router>
          <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/new-decision"
                  element={
                    <ProtectedRoute>
                      <NewDecision />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/studio/:id"
                  element={
                    <ProtectedRoute>
                      <DecisionStudio />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </DecisionProvider>
    </AuthProvider>
  );
}
