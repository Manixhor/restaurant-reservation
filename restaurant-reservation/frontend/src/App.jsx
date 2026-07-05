import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewReservation from './pages/customer/NewReservation';
import MyReservations from './pages/customer/MyReservations';
import AdminReservations from './pages/admin/AdminReservations';
import ManageTables from './pages/admin/ManageTables';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/reservations/new" element={
                <ProtectedRoute><NewReservation /></ProtectedRoute>
              } />
              <Route path="/reservations" element={
                <ProtectedRoute><MyReservations /></ProtectedRoute>
              } />
              <Route path="/admin/reservations" element={
                <ProtectedRoute adminOnly><AdminReservations /></ProtectedRoute>
              } />
              <Route path="/admin/tables" element={
                <ProtectedRoute adminOnly><ManageTables /></ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
