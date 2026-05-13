import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/plan', label: 'Plan semanal' },
  { path: '/compra', label: 'Lista compra' },
  { path: '/buscador', label: 'Buscador' },
  { path: '/perfil', label: 'Mi perfil' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { usuario, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')
    : 'U'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fa' }}>

      <div style={{
        width: '220px', background: '#0F6E56', display: 'flex',
        flexDirection: 'column', flexShrink: 0, position: 'sticky',
        top: 0, height: '100vh'
      }}>

        <div style={{ padding: '20px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', background: '#1D9E75',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: '#fff'
            }}>N</div>
            <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>NutriFit</span>
          </div>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div style={{
            width: '34px', height: '34px', background: '#1D9E75', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: '500', color: '#fff', marginBottom: '8px'
          }}>{iniciales}</div>
          <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>
            {usuario?.nombre?.split(' ')[0]}
          </div>
        </div>

        <div style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const activo = location.pathname === item.path
            return (
              <div key={item.path} onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center',
                  padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                  marginBottom: '2px',
                  background: activo ? 'rgba(255,255,255,0.15)' : 'transparent',
                }}>
                <span style={{
                  fontSize: '13px', fontWeight: activo ? '500' : '400',
                  color: activo ? '#fff' : 'rgba(255,255,255,0.7)'
                }}>{item.label}</span>
              </div>
            )
          })}
        </div>

        <div style={{ padding: '14px 16px', borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
          <div onClick={handleLogout} style={{
            fontSize: '12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer'
          }}>
            Cerrar sesión
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  )
}