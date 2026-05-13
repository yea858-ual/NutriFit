import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/http'

export default function Dashboard() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const cargarPlan = async () => {
      try {
        const res = await api.get('/nutrition/ultimo')
        setPlan(res.data)
      } catch (err) {
        // No tiene plan todavía
      }
    }
    cargarPlan()
  }, [])

  const calcularPlan = async () => {
    setCargando(true)
    try {
      const res = await api.post('/nutrition/calcular')
      setPlan(res.data)
    } catch (err) {
      alert('Completa tu perfil primero')
      navigate('/perfil')
    } finally {
      setCargando(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">N</span>
          </div>
          <span className="text-sm font-medium text-gray-900">NutriFit</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/perfil')} className="text-sm text-gray-500 hover:text-gray-900">Perfil</button>
          <button onClick={() => navigate('/plan')} className="text-sm text-gray-500 hover:text-gray-900">Plan semanal</button>
          <button onClick={() => navigate('/compra')} className="text-sm text-gray-500 hover:text-gray-900">Lista compra</button>
          <button onClick={handleLogout} className="text-sm text-red-400 hover:text-red-600">Salir</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Saludo */}
        <h1 className="text-2xl font-medium text-gray-900 mb-1">
          Hola, {usuario?.nombre?.split(' ')[0]} 
        </h1>
        <p className="text-sm text-gray-400 mb-8">Aquí tienes tu resumen nutricional</p>

        {plan ? (
          <>
            {/* Calorías */}
            <div className="bg-green-50 rounded-xl p-5 mb-6">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wider mb-1">Calorías diarias</p>
              <p className="text-4xl font-medium text-green-800">{Math.round(plan.calorias_objetivo)} <span className="text-lg font-normal">kcal</span></p>
              <p className="text-xs text-green-600 mt-1">
                {plan.ajuste_calorico > 0 ? `+${plan.ajuste_calorico}` : plan.ajuste_calorico} kcal · {plan.ajuste_calorico > 0 ? 'Ganar músculo' : plan.ajuste_calorico < 0 ? 'Perder peso' : 'Mantenimiento'}
              </p>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Proteínas', valor: plan.proteinas_g, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Carbohidratos', valor: plan.carbohidratos_g, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Grasas', valor: plan.grasas_g, color: 'text-green-600', bg: 'bg-green-50' },
              ].map(m => (
                <div key={m.label} className={`${m.bg} rounded-xl p-4 text-center`}>
                  <p className="text-xs text-gray-500 mb-1">{m.label}</p>
                  <p className={`text-2xl font-medium ${m.color}`}>{Math.round(m.valor)}<span className="text-sm font-normal">g</span></p>
                </div>
              ))}
            </div>

            {/* Distribución */}
            <div className="border border-gray-100 rounded-xl p-5 mb-8">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">Distribución por comida</p>
              <div className="space-y-3">
                {Object.entries(plan.distribucion_comidas).map(([tipo, datos]) => (
                  <div key={tipo} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">{tipo}</span>
                    <span className="text-sm font-medium text-gray-900">{Math.round(datos.kcal)} kcal</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button onClick={() => navigate('/plan')}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-sm font-medium transition-colors">
                Ver plan semanal →
              </button>
              <button onClick={() => navigate('/compra')}
                className="flex-1 border border-gray-200 hover:border-green-300 text-gray-600 py-3 rounded-lg text-sm font-medium transition-colors">
                Lista de la compra
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🥗</span>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Calcula tu plan nutricional</h2>
            <p className="text-sm text-gray-400 mb-6">Basado en tus datos personales y objetivos</p>
            <button onClick={calcularPlan} disabled={cargando}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {cargando ? 'Calculando...' : 'Calcular mi plan →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}