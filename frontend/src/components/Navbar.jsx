import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout, usuario } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { path: '/dashboard', label: 'Inicio' },
    { path: '/plan', label: 'Plan semanal' },
    { path: '/compra', label: 'Lista compra' },
    { path: '/perfil', label: 'Perfil' },
  ]

  return (
    <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between bg-white sticky top-0 z-10">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-medium">N</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">NutriFit</span>
      </div>

      <div className="flex items-center gap-1">
        {links.map(link => (
          <button key={link.path} onClick={() => navigate(link.path)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors
              ${location.pathname === link.path
                ? 'bg-green-50 text-green-700 font-medium'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}>
            {link.label}
          </button>
        ))}
        <button onClick={handleLogout}
          className="ml-2 px-3 py-1.5 rounded-lg text-sm text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors">
          Salir
        </button>
      </div>
    </nav>
  )
}