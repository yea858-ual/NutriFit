import { useState, useEffect } from 'react'
import api from '../api/http'
import Layout from '../components/Layout'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function PlanSemanal() {
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
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <p style={{ fontSize: '13px', color: '#888' }}>Cargando tu plan semanal...</p>
      </div>
    </Layout>
  )

  const diaData = plan?.dias[diaActivo]

  return (
    <Layout>
      <div style={{ maxWidth: '680px' }}>

        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#111', margin: '0 0 4px' }}>Plan semanal</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              {plan ? `${plan.total_alimentos_distintos} alimentos distintos esta semana` : ''}
            </p>
          </div>
          <button onClick={regenerar} disabled={generando}
            style={{
              background: '#fff', border: '0.5px solid #ddd', borderRadius: '8px',
              padding: '8px 14px', fontSize: '12px', color: '#555', cursor: 'pointer'
            }}>
            {generando ? 'Regenerando...' : 'Regenerar plan'}
          </button>
        </div>

        {error && (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>{error}</p>
            <button onClick={regenerar} disabled={generando}
              style={{
                background: '#0F6E56', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '11px 24px', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer'
              }}>
              {generando ? 'Generando...' : 'Generar plan semanal'}
            </button>
          </div>
        )}

        {plan && (
          <>
            {/* Tabs días */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
              {DIAS.map((dia, i) => (
                <button key={dia} onClick={() => setDiaActivo(i)}
                  style={{
                    padding: '6px 14px', borderRadius: '20px', border: 'none',
                    fontSize: '12px', fontWeight: diaActivo === i ? '500' : '400',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    background: diaActivo === i ? '#0F6E56' : '#f0f0f0',
                    color: diaActivo === i ? '#fff' : '#666',
                  }}>
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>

            {diaData && (
              <>
                {/* Totales del día */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  {[
                    { label: 'kcal', valor: Math.round(diaData.totales.kcal) },
                    { label: 'proteínas', valor: `${Math.round(diaData.totales.proteinas_g)}g` },
                    { label: 'carbos', valor: `${Math.round(diaData.totales.carbohidratos_g)}g` },
                    { label: 'grasas', valor: `${Math.round(diaData.totales.grasas_g)}g` },
                  ].map(t => (
                    <div key={t.label} style={{
                      background: '#fff', borderRadius: '10px', padding: '12px',
                      border: '0.5px solid #eee', textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px' }}>{t.label}</p>
                      <p style={{ fontSize: '18px', fontWeight: '500', color: '#111', margin: 0 }}>{t.valor}</p>
                    </div>
                  ))}
                </div>

                {/* Comidas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {diaData.comidas.map(comida => (
                    <div key={comida.tipo} style={{
                      background: '#fff', borderRadius: '10px', padding: '16px',
                      border: '0.5px solid #eee'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{
                          fontSize: '11px', fontWeight: '500', color: '#0F6E56',
                          textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>{comida.tipo}</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{Math.round(comida.kcal_total)} kcal</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {comida.alimentos.map(a => (
                          <div key={a.alimento_id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                          }}>
                            <span style={{ fontSize: '13px', color: '#333' }}>{a.nombre}</span>
                            <span style={{
                              fontSize: '12px', color: '#888', background: '#f8f8f8',
                              padding: '2px 8px', borderRadius: '4px'
                            }}>{a.cantidad_g}g</span>
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
    </Layout>
  )
}