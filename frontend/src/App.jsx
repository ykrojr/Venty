import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { useContext } from 'react';

import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ClientesScreen from './screens/ClientesScreen';
import EventoCreateScreen from './screens/EventoCreateScreen';

import EventoDetalheScreen from './screens/EventoDetalheScreen';
import InventarioScreen from './screens/InventarioScreen';
import CalendarScreen from './screens/CalendarScreen';

function PrivateRoute({ children }) {
  const { signed, loading } = useContext(AuthContext);

  if (loading) {
    return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Carregando...</div>;
  }

  return signed ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
          }} 
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginScreen />} />
          
          <Route path="/dashboard" element={<PrivateRoute><DashboardScreen /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><ClientesScreen /></PrivateRoute>} />
          
          <Route path="/evento/novo" element={<PrivateRoute><EventoCreateScreen /></PrivateRoute>} />
          <Route path="/evento/:id" element={<PrivateRoute><EventoDetalheScreen /></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute><InventarioScreen /></PrivateRoute>} />
          <Route path="/calendario" element={<PrivateRoute><CalendarScreen /></PrivateRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
