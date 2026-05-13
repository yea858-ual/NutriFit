import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/http'

const NOMBRE_CATEGORIA = {
  carne: 'Carne',
  pescado: 'Pescado',
  marisco: 'Marisco',
  huevo: 'Huevo',
  lacteo: 'Lácteo',
  bebida_vegetal: 'Bebida vegetal',
  verdura: 'Verdura',
  legumbre: 'Legumbre',
  cereal_desayuno: 'Cereales desayuno',
  cereal_comida: 'Cereales comida',
  fruta: 'Fruta',
  frutos_secos: 'Frutos secos',
  semillas: 'Semillas',
  grasa: 'Grasa',
  grasa_vegetal: 'Grasa vegetal',
  embutido: 'Embutido',
  conserva: 'Conserva',
  condimento: 'Condimento',
  caldo: 'Caldo',
  suplemento: 'Suplemento',
  dulce: 'Dulce',
}

export default function ListaCompra() {
  const navigate = useNavigate()
  const [lista, setLista] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [marcados, setMarcados] = useState({})

  useEffect(() => {
    cargarLista()
  }, [])

  const cargarLista = async () => {
    setCargando(true)
    try {
      const res = await api.post('/menu/compra')
      setLista(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const toggleMarcado = (key) => {
    setMarcados(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const nombreCategoria = (cat) => NOMBRE_CATEGORIA[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)

  if (cargando) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-400 text-sm">Generando lista de la compra...</p>
    </div>
  )

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
          <button onClick={() => navigate('/plan')} className="text-sm text-gray-500 hover:text-gray-900">Plan semanal</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Cabecera */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Lista de la compra</h1>
            <p className="text-sm text-gray-400">
              {lista?.total_ingredientes} ingredientes · {lista?.total_categorias} categorías
            </p>
          </div>
          <button onClick={() => setMarcados({})}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg">
            Limpiar
          </button>
        </div>

        {/* Lista por categorías */}
        {lista?.categorias.map(cat => (
          <div key={cat.categoria} className="mb-6">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              {nombreCategoria(cat.categoria)} ({cat.total_items})
            </p>
            <div className="space-y-1">
              {cat.items.map(item => {
                const key = `${cat.categoria}-${item.nombre}`
                const marcado = marcados[key]
                return (
                  <button key={key} onClick={() => toggleMarcado(key)}
                    className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                        ${marcado ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                        {marcado && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={`text-sm transition-colors ${marcado ? 'text-gray-300 line-through' : 'text-gray-700'}`}>
                        {item.nombre}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{item.cantidad_legible}</span>
                  </button>
                )
              })}
            </div>
            <div className="h-px bg-gray-100 mt-4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}