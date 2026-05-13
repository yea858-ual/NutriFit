import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/http'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function PlanSemanal() {
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [diaActivo, setDiaActivo] = useState(0)
  const [cargando, setCargando] = useState(false)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarUltimoPlan()
  }, [])

  const cargarUltimoPlan = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await api.get('/menu/ultimo')
      setPlan(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('No tienes ningún plan generado todavía.')
      }
    } finally {
      setCargando(false)
    }
  }

  const regenerar = async () => {
    setGenerando(true)
    try {
      const res = await api.post('/menu/generar')
      setPlan(res.data)
      setDiaActivo(0)
    } catch (err) {
      console.error(err)
    } finally {
      setGenerando(false)
    }
  }

  if (cargando) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-400 text-sm">Cargando tu plan semanal...</p>
    </div>
  )

  const diaData = plan?.dias[diaActivo]

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
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-900">Dashboard</button>
          <button onClick={() => navigate('/compra')} className="text-sm text-gray-500 hover:text-gray-900">Lista compra</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Plan semanal</h1>
            <p className="text-sm text-gray-400">{plan?.total_alimentos_distintos} alimentos distintos esta semana</p>
          </div>
          <button onClick={regenerar} disabled={generando}
            className="text-sm border border-gray-200 hover:border-green-300 text-gray-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {generando ? 'Regenerando...' : '↻ Regenerar'}
          </button>
        </div>

        {error && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button onClick={regenerar} disabled={generando}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium">
              {generando ? 'Generando...' : 'Generar plan semanal →'}
            </button>
          </div>
        )}

        {plan && (
          <>
            {/* Tabs días */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
              {DIAS.map((dia, i) => (
                <button key={dia} onClick={() => setDiaActivo(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                    ${diaActivo === i
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>

            {diaData && (
              <>
                {/* Totales del día */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'kcal', valor: Math.round(diaData.totales.kcal) },
                    { label: 'proteínas', valor: `${Math.round(diaData.totales.proteinas_g)}g` },
                    { label: 'carbos', valor: `${Math.round(diaData.totales.carbohidratos_g)}g` },
                    { label: 'grasas', valor: `${Math.round(diaData.totales.grasas_g)}g` },
                  ].map(t => (
                    <div key={t.label} className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-400 mb-1">{t.label}</p>
                      <p className="text-lg font-medium text-gray-900">{t.valor}</p>
                    </div>
                  ))}
                </div>

                {/* Comidas */}
                <div className="space-y-4">
                  {diaData.comidas.map(comida => (
                    <div key={comida.tipo} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-900 capitalize">{comida.tipo}</span>
                        <span className="text-xs text-gray-400">{Math.round(comida.kcal_total)} kcal</span>
                      </div>
                      <div className="space-y-2">
                        {comida.alimentos.map(a => (
                          <div key={a.alimento_id} className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">{a.nombre}</span>
                            <span className="text-xs text-gray-400">{a.cantidad_g}g</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}