import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Perfil from './pages/Perfil'
import PlanSemanal from './pages/PlanSemanal'
import ListaCompra from './pages/ListaCompra'

function ProtectedRoute({ children }) {
  const { estaLogueado } = useAuth()
  return estaLogueado ? children : <Navigate to="/login" />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="/plan" element={<ProtectedRoute><PlanSemanal /></ProtectedRoute>} />
      <Route path="/compra" element={<ProtectedRoute><ListaCompra /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App