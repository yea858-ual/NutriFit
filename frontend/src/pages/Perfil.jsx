import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/http'

const OBJETIVOS = [
  { valor: 'perder_peso', label: 'Perder peso' },
  { valor: 'mantenimiento', label: 'Mantenimiento' },
  { valor: 'ganar_musculo', label: 'Ganar músculo' },
]

const ACTIVIDADES = [
  { valor: 'sedentario', label: 'Sedentario' },
  { valor: 'ligero', label: 'Ligero (1-2 días/semana)' },
  { valor: 'moderado', label: 'Moderado (3-4 días/semana)' },
  { valor: 'activo', label: 'Activo (5-6 días/semana)' },
  { valor: 'muy_activo', label: 'Muy activo (diario)' },
]

const INTOLERANCIAS = [
  { name: 'intolerancia_gluten', label: 'Sin gluten' },
  { name: 'intolerancia_lactosa', label: 'Sin lactosa' },
  { name: 'alergia_frutos_secos', label: 'Sin frutos secos' },
  { name: 'dieta_vegetariana', label: 'Vegetariano' },
  { name: 'dieta_vegana', label: 'Vegano' },
]

export default function Perfil() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    edad: '',
    peso_kg: '',
    altura_cm: '',
    sexo: 'hombre',
    nivel_actividad: 'moderado',
    objetivo: 'mantenimiento',
    intolerancia_gluten: false,
    intolerancia_lactosa: false,
    alergia_frutos_secos: false,
    dieta_vegetariana: false,
    dieta_vegana: false,
  })
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const toggle = (campo) => setForm(prev => ({ ...prev, [campo]: !prev[campo] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      await api.put('/users/me', {
        ...form,
        edad: parseInt(form.edad),
        peso_kg: parseFloat(form.peso_kg),
        altura_cm: parseFloat(form.altura_cm),
      })
      navigate('/dashboard')
    } catch (err) {
      setError('Error al guardar el perfil')
    } finally {
      setCargando(false)
    }
  }

  const pillClass = (activo) =>
    `px-4 py-2 rounded-full text-sm border cursor-pointer transition-colors select-none
    ${activo
      ? 'bg-green-50 text-green-700 border-green-400 font-medium'
      : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">N</span>
          </div>
          <span className="text-base font-medium text-gray-900">NutriFit</span>
        </div>

        {/* Pasos */}
        <div className="flex items-center gap-2 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">1</span>
            </div>
            <span className="text-xs text-gray-400">Cuenta</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs font-medium">2</span>
            </div>
            <span className="text-xs text-green-600 font-medium">Perfil</span>
          </div>
          <div className="flex-1 h-px bg-gray-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-medium">3</span>
            </div>
            <span className="text-xs text-gray-400">Dashboard</span>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-xl font-medium text-gray-900 mb-1">Cuéntanos sobre ti</h1>
        <p className="text-sm text-gray-400 mb-6">Usamos estos datos para calcular tu plan nutricional personalizado</p>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Datos físicos */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Datos físicos</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'edad', label: 'Edad', placeholder: '22' },
                { name: 'peso_kg', label: 'Peso (kg)', placeholder: '70' },
                { name: 'altura_cm', label: 'Altura (cm)', placeholder: '170' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-400 mb-1">{f.label}</label>
                  <input
                    type="number"
                    name={f.name}
                    value={form[f.name]}
                    onChange={(e) => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    placeholder={f.placeholder}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Sexo */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Sexo</p>
            <div className="flex gap-3">
              {['hombre', 'mujer'].map(s => (
                <button key={s} type="button"
                  onClick={() => setForm(prev => ({ ...prev, sexo: s }))}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-colors
                    ${form.sexo === s
                      ? 'bg-green-50 text-green-700 border-green-400 font-medium'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Objetivo */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">¿Cuál es tu objetivo?</p>
            <div className="flex flex-wrap gap-2">
              {OBJETIVOS.map(o => (
                <button key={o.valor} type="button"
                  onClick={() => setForm(prev => ({ ...prev, objetivo: o.valor }))}
                  className={pillClass(form.objetivo === o.valor)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Actividad */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Nivel de actividad física</p>
            <select
              name="nivel_actividad"
              value={form.nivel_actividad}
              onChange={(e) => setForm(prev => ({ ...prev, nivel_actividad: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400">
              {ACTIVIDADES.map(a => <option key={a.valor} value={a.valor}>{a.label}</option>)}
            </select>
          </div>

          {/* Divisor */}
          <div className="h-px bg-gray-100"></div>

          {/* Intolerancias */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Intolerancias y preferencias</p>
            <p className="text-xs text-gray-400 mb-3">Selecciona las que apliquen</p>
            <div className="flex flex-wrap gap-2">
              {INTOLERANCIAS.map(item => (
                <button key={item.name} type="button"
                  onClick={() => toggle(item.name)}
                  className={pillClass(form[item.name])}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Botón */}
          <button type="submit" disabled={cargando}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {cargando ? 'Guardando...' : 'Guardar y continuar →'}
          </button>
        </form>
      </div>
    </div>
  )
}