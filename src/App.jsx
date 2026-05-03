// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Layout          from './components/Layout';
import ProtectedRoute  from './components/ProtectedRoute';
import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import Customers       from './pages/Customers';
import CustomerDetail  from './pages/CustomerDetail';
import Records         from './pages/Records';
import Payments        from './pages/Payments';
import Profile         from './pages/Profile';

export default function App() {
  const { loading } = useAuth();

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14, background: 'var(--green-glow)',
        border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>🏪</div>
      <div style={{ width: 32, height: 32, border: '3px solid var(--green)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text2)', fontSize: '0.82rem', margin: 0 }}>Loading BizManager...</p>
    </div>
  );

  return (
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index               element={<Dashboard />} />
        <Route path="customers"    element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetail />} />
        <Route path="records"      element={<Records />} />
        <Route path="payments"     element={<Payments />} />
        <Route path="profile"      element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}