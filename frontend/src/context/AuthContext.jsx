import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/http'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const cargarUsuario = async () => {
      if (token) {
        try {
          const res = await api.get('/users/me')
          setUsuario({
            nombre: res.data.nombre,
            email: res.data.email,
            objetivo: res.data.objetivo,
          })
        } catch (err) {
          logout()
        }
      }
    }
    cargarUsuario()
  }, [token])

  const login = (tokenNuevo, datosUsuario) => {
    localStorage.setItem('token', tokenNuevo)
    setToken(tokenNuevo)
    setUsuario(datosUsuario)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
  }

  const estaLogueado = !!token

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, estaLogueado }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}