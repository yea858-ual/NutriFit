import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/http'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const res = await api.post('/auth/registro', { nombre, email, password })
      login(res.data.access_token, { nombre: res.data.nombre, email: res.data.email })
      navigate('/perfil')
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#f8f9fa',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '40px', height: '40px', background: '#0F6E56',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 12px',
            fontSize: '16px', fontWeight: '600', color: '#fff'
          }}>N</div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#111', margin: '0 0 4px' }}>
            NutriFit
          </h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Crea tu cuenta
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#fff', borderRadius: '14px',
          padding: '28px', border: '0.5px solid #e8e8e8'
        }}>
          <form onSubmit={handleSubmit}>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>
                Nombre completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required
                style={{
                  width: '100%', border: '0.5px solid #ddd', borderRadius: '8px',
                  padding: '10px 12px', fontSize: '13px', color: '#111',
                  outline: 'none', boxSizing: 'border-box', background: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%', border: '0.5px solid #ddd', borderRadius: '8px',
                  padding: '10px 12px', fontSize: '13px', color: '#111',
                  outline: 'none', boxSizing: 'border-box', background: '#fff'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#555', marginBottom: '6px' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                style={{
                  width: '100%', border: '0.5px solid #ddd', borderRadius: '8px',
                  padding: '10px 12px', fontSize: '13px', color: '#111',
                  outline: 'none', boxSizing: 'border-box', background: '#fff'
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: '12px', color: '#e53e3e', margin: '0 0 16px' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%', background: '#0F6E56', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '11px', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer', opacity: cargando ? 0.7 : 1
              }}>
              {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '16px' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: '#0F6E56', fontWeight: '500', textDecoration: 'none' }}>
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  )
}