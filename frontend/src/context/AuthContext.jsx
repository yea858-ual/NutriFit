import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/http'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [usuario, setUsuario] = useState(null)

  const cargarUsuario = async () => {
    try {
      const res = await api.get('/users/me')
      setUsuario({
        nombre: res.data.nombre,
        email: res.data.email,
        objetivo: res.data.objetivo,
        intolerancia_gluten: res.data.intolerancia_gluten === true,
        intolerancia_lactosa: res.data.intolerancia_lactosa === true,
        alergia_frutos_secos: res.data.alergia_frutos_secos === true,
        dieta_vegetariana: res.data.dieta_vegetariana === true,
        dieta_vegana: res.data.dieta_vegana === true,
      })
    } catch (err) {
      logout()
    }
  }

  useEffect(() => {
    if (token) cargarUsuario()
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
    <AuthContext.Provider value={{ token, usuario, login, logout, estaLogueado, recargarUsuario: cargarUsuario }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}