import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/http'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

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
  const { recargarUsuario } = useAuth()
  const [form, setForm] = useState({
    edad: '', peso_kg: '', altura_cm: '', sexo: 'hombre',
    nivel_actividad: 'moderado', objetivo: 'mantenimiento',
    intolerancia_gluten: false, intolerancia_lactosa: false,
    alergia_frutos_secos: false, dieta_vegetariana: false, dieta_vegana: false,
  })
  const [cargando, setCargando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargarPerfil = async () => {
      setCargando(true)
      try {
        const res = await api.get('/users/me')
        setForm({
          edad: res.data.edad || '',
          peso_kg: res.data.peso_kg || '',
          altura_cm: res.data.altura_cm || '',
          sexo: res.data.sexo || 'hombre',
          nivel_actividad: res.data.nivel_actividad || 'moderado',
          objetivo: res.data.objetivo || 'mantenimiento',
          intolerancia_gluten: res.data.intolerancia_gluten || false,
          intolerancia_lactosa: res.data.intolerancia_lactosa || false,
          alergia_frutos_secos: res.data.alergia_frutos_secos || false,
          dieta_vegetariana: res.data.dieta_vegetariana || false,
          dieta_vegana: res.data.dieta_vegana || false,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargarPerfil()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    try {
      await api.put('/users/me', {
        ...form,
        edad: parseInt(form.edad),
        peso_kg: parseFloat(form.peso_kg),
        altura_cm: parseFloat(form.altura_cm),
      })
      await api.post('/nutrition/calcular')
      await recargarUsuario()
      navigate('/dashboard')
    } catch (err) {
      setError('Error al guardar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  const toggle = (campo) => setForm(prev => ({ ...prev, [campo]: !prev[campo] }))

  const pillStyle = (activo) => ({
    padding: '7px 14px', borderRadius: '20px', border: 'none',
    fontSize: '12px', fontWeight: activo ? '500' : '400', cursor: 'pointer',
    background: activo ? '#0F6E56' : '#f0f0f0',
    color: activo ? '#fff' : '#666',
  })

  if (cargando) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <p style={{ fontSize: '13px', color: '#888' }}>Cargando perfil...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: '560px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#111', margin: '0 0 4px' }}>Mi perfil</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Actualiza tus datos para recalcular tu plan nutricional</p>
        </div>

        <form onSubmit={handleSubmit}>

          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', border: '0.5px solid #eee', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px' }}>
              Datos físicos
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { name: 'edad', label: 'Edad', placeholder: '22' },
                { name: 'peso_kg', label: 'Peso (kg)', placeholder: '70' },
                { name: 'altura_cm', label: 'Altura (cm)', placeholder: '170' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ display: 'block', fontSize: '11px', color: '#888', marginBottom: '6px' }}>{f.label}</label>
                  <input type="number" name={f.name} value={form[f.name]}
                    onChange={(e) => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    placeholder={f.placeholder} required
                    style={{
                      width: '100%', border: '0.5px solid #ddd', borderRadius: '8px',
                      padding: '9px 10px', fontSize: '13px', outline: 'none',
                      boxSizing: 'border-box', color: '#111'
                    }} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', border: '0.5px solid #eee', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              Sexo
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['hombre', 'mujer'].map(s => (
                <button key={s} type="button"
                  onClick={() => setForm(prev => ({ ...prev, sexo: s }))}
                  style={pillStyle(form.sexo === s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', border: '0.5px solid #eee', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              Objetivo
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {OBJETIVOS.map(o => (
                <button key={o.valor} type="button"
                  onClick={() => setForm(prev => ({ ...prev, objetivo: o.valor }))}
                  style={pillStyle(form.objetivo === o.valor)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', border: '0.5px solid #eee', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              Nivel de actividad
            </p>
            <select value={form.nivel_actividad}
              onChange={(e) => setForm(prev => ({ ...prev, nivel_actividad: e.target.value }))}
              style={{
                width: '100%', border: '0.5px solid #ddd', borderRadius: '8px',
                padding: '9px 10px', fontSize: '13px', outline: 'none', color: '#111'
              }}>
              {ACTIVIDADES.map(a => <option key={a.valor} value={a.valor}>{a.label}</option>)}
            </select>
          </div>

          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', border: '0.5px solid #eee', marginBottom: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: '500', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
              Intolerancias y preferencias
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {INTOLERANCIAS.map(item => (
                <button key={item.name} type="button"
                  onClick={() => toggle(item.name)}
                  style={pillStyle(form[item.name])}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ fontSize: '12px', color: '#e53e3e', marginBottom: '12px' }}>{error}</p>}

          <button type="submit" disabled={guardando}
            style={{
              width: '100%', background: '#0F6E56', color: '#fff', border: 'none',
              borderRadius: '10px', padding: '12px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer', opacity: guardando ? 0.7 : 1
            }}>
            {guardando ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </Layout>
  )
}