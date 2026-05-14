import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/http'
import Layout from '../components/Layout'

const ETIQUETAS_INTOLERANCIAS = [
  { key: 'intolerancia_gluten', label: 'Sin gluten' },
  { key: 'intolerancia_lactosa', label: 'Sin lactosa' },
  { key: 'alergia_frutos_secos', label: 'Sin frutos secos' },
  { key: 'dieta_vegetariana', label: 'Vegetariano' },
  { key: 'dieta_vegana', label: 'Vegano' },
]

export default function Dashboard() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const cargarPlan = async () => {
      try {
        const res = await api.get('/nutrition/ultimo')
        setPlan(res.data)
      } catch (err) {}
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

  const intoleranciasActivas = ETIQUETAS_INTOLERANCIAS.filter(i => usuario?.[i.key])

  return (
    <Layout>
      <div style={{ maxWidth: '680px' }}>

        {/* Saludo */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#111', margin: '0 0 4px' }}>
            Hola, {usuario?.nombre?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: '13px', color: '#888', margin: '0 0 10px' }}>Tu resumen nutricional de hoy</p>

          {/* Intolerancias */}
          {intoleranciasActivas.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {intoleranciasActivas.map(i => (
                <span key={i.key} style={{
                  fontSize: '11px', fontWeight: '500',
                  background: '#E1F5EE', color: '#0F6E56',
                  padding: '3px 10px', borderRadius: '20px',
                }}>
                  {i.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {plan ? (
          <div>

            <div style={{
              background: '#0F6E56', borderRadius: '12px', padding: '20px',
              marginBottom: '14px'
            }}>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
                Calorías diarias
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '36px', fontWeight: '500', color: '#fff' }}>
                  {Math.round(plan.calorias_objetivo).toLocaleString()}
                </span>
                <span style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>kcal</span>
              </div>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', margin: '4px 0 10px' }}>
                {plan.ajuste_calorico > 0 ? `+${plan.ajuste_calorico} kcal · Ganar músculo` :
                 plan.ajuste_calorico < 0 ? `${plan.ajuste_calorico} kcal · Perder peso` :
                 'Mantenimiento'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              {[
                { label: 'Proteínas', valor: plan.proteinas_g, unit: 'g', color: '#0F6E56' },
                { label: 'Carbohidratos', valor: plan.carbohidratos_g, unit: 'g', color: '#BA7517' },
                { label: 'Grasas', valor: plan.grasas_g, unit: 'g', color: '#185FA5' },
                { label: 'BMR', valor: plan.bmr, unit: 'kcal', color: '#444' },
              ].map(m => (
                <div key={m.label} style={{
                  background: '#fff', borderRadius: '10px', padding: '14px',
                  border: '0.5px solid #eee'
                }}>
                  <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px' }}>{m.label}</p>
                  <p style={{ fontSize: '20px', fontWeight: '500', color: m.color, margin: 0 }}>
                    {Math.round(m.valor)}
                    <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '400' }}>{m.unit}</span>
                  </p>
                </div>
              ))}
            </div>

            <div style={{
              background: '#fff', borderRadius: '10px', padding: '16px',
              border: '0.5px solid #eee', marginBottom: '14px'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#333', margin: '0 0 12px' }}>
                Distribución por comida
              </p>
              {Object.entries(plan.distribucion_comidas).map(([tipo, datos]) => (
                <div key={tipo} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span style={{ fontSize: '13px', color: '#555', textTransform: 'capitalize', width: '80px' }}>
                    {tipo}
                  </span>
                  <div style={{ flex: 1, height: '4px', background: '#f0f0f0', borderRadius: '2px', margin: '0 12px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', background: '#1D9E75', borderRadius: '2px',
                      width: `${(datos.kcal / plan.calorias_objetivo) * 100}%`
                    }} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#333', width: '70px', textAlign: 'right' }}>
                    {Math.round(datos.kcal)} kcal
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <button onClick={() => navigate('/plan')}
                style={{
                  background: '#0F6E56', color: '#fff', border: 'none',
                  borderRadius: '10px', padding: '12px', fontSize: '13px',
                  fontWeight: '500', cursor: 'pointer'
                }}>
                Ver plan semanal
              </button>
              <button onClick={() => navigate('/compra')}
                style={{
                  background: '#fff', color: '#333', border: '0.5px solid #ddd',
                  borderRadius: '10px', padding: '12px', fontSize: '13px',
                  fontWeight: '500', cursor: 'pointer'
                }}>
                Lista de la compra
              </button>
            </div>

            <button onClick={calcularPlan} disabled={cargando}
              style={{
                width: '100%', background: 'transparent', border: 'none',
                fontSize: '12px', color: '#aaa', cursor: 'pointer', padding: '8px'
              }}>
              {cargando ? 'Recalculando...' : 'Recalcular plan nutricional'}
            </button>

          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '500', color: '#111', margin: '0 0 8px' }}>
              Calcula tu plan nutricional
            </h2>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px' }}>
              Basado en tus datos y objetivos personales
            </p>
            <button onClick={calcularPlan} disabled={cargando}
              style={{
                background: '#0F6E56', color: '#fff', border: 'none',
                borderRadius: '10px', padding: '12px 28px', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer'
              }}>
              {cargando ? 'Calculando...' : 'Calcular mi plan'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}