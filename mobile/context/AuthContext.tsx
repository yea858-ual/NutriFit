import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../api/http'

interface Usuario {
  nombre: string
  email: string
  objetivo?: string
  intolerancia_gluten?: boolean
  intolerancia_lactosa?: boolean
  alergia_frutos_secos?: boolean
  dieta_vegetariana?: boolean
  dieta_vegana?: boolean
}

interface AuthContextType {
  token: string | null
  usuario: Usuario | null
  login: (token: string, datos: Usuario) => Promise<void>
  logout: () => Promise<void>
  estaLogueado: boolean
  cargando: boolean
  recargarUsuario: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cargando, setCargando] = useState(true)

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
      await logout()
    }
  }

  useEffect(() => {
    const inicializar = async () => {
      const tokenGuardado = await AsyncStorage.getItem('token')
      if (tokenGuardado) {
        setToken(tokenGuardado)
        await cargarUsuario()
      }
      setCargando(false)
    }
    inicializar()
  }, [])

  const login = async (tokenNuevo: string, datos: Usuario) => {
    await AsyncStorage.setItem('token', tokenNuevo)
    setToken(tokenNuevo)
    setUsuario(datos)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{
      token,
      usuario,
      login,
      logout,
      estaLogueado: !!token,
      cargando,
      recargarUsuario: cargarUsuario,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}