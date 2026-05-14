import { useState } from 'react'
import api from '../api/http'
import Layout from '../components/Layout'

export default function Buscador() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [gramos, setGramos] = useState(100)
  const [cargando, setCargando] = useState(false)
  const [haBuscado, setHaBuscado] = useState(false)

  const buscar = async () => {
    if (!query.trim()) return
    setCargando(true)
    setHaBuscado(true)
    try {
      const res = await api.get(`/alimentos/buscar?q=${query}`)
      setResultados(res.data)
      setSeleccionado(null)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  const calcular = (alimento) => {
    const factor = gramos / 100
    return {
      kcal: Math.round(alimento.kcal_100g * factor),
      proteinas: Math.round(alimento.proteinas_100g * factor * 10) / 10,
      carbohidratos: Math.round(alimento.carbohidratos_100g * factor * 10) / 10,
      grasas: Math.round(alimento.grasas_100g * factor * 10) / 10,
    }
  }

  return (
    <Layout>
      <div style={{ maxWidth: '680px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#111', margin: '0 0 4px' }}>Buscador</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>Busca alimentos y calcula sus macros</p>
        </div>

        {/* Buscador */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder="Buscar alimento... ej: pollo, arroz, yogur"
            style={{
              flex: 1, border: '0.5px solid #ddd', borderRadius: '8px',
              padding: '10px 14px', fontSize: '13px', outline: 'none',
              color: '#111', background: '#fff'
            }}
          />
          <button onClick={buscar} disabled={cargando}
            style={{
              background: '#0F6E56', color: '#fff', border: 'none',
              borderRadius: '8px', padding: '10px 20px', fontSize: '13px',
              fontWeight: '500', cursor: 'pointer'
            }}>
            {cargando ? '...' : 'Buscar'}
          </button>
        </div>

        {/* Resultados */}
        {resultados.length > 0 && !seleccionado && (
          <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #eee', overflow: 'hidden' }}>
            {resultados.map((a, idx) => (
              <div key={a.id} onClick={() => { setSeleccionado(a); setGramos(100) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', cursor: 'pointer',
                  borderBottom: idx < resultados.length - 1 ? '0.5px solid #f5f5f5' : 'none',
                  background: '#fff'
                }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#111', margin: '0 0 2px' }}>{a.nombre}</p>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0, textTransform: 'capitalize' }}>{a.categoria}</p>
                </div>
                <span style={{ fontSize: '12px', color: '#0F6E56', fontWeight: '500' }}>
                  {a.kcal_100g} kcal/100g
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Calculadora */}
        {seleccionado && (
          <div>
            <button onClick={() => setSeleccionado(null)}
              style={{
                background: 'none', border: 'none', fontSize: '13px',
                color: '#888', cursor: 'pointer', marginBottom: '16px', padding: 0
              }}>
              ← Volver a resultados
            </button>

            <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', border: '0.5px solid #eee', marginBottom: '12px' }}>
              <p style={{ fontSize: '16px', fontWeight: '500', color: '#111', margin: '0 0 4px' }}>{seleccionado.nombre}</p>
              <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px', textTransform: 'capitalize' }}>{seleccionado.categoria}</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>Cantidad (g)</label>
                <input
                  type="number"
                  value={gramos}
                  onChange={(e) => setGramos(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: '100px', border: '0.5px solid #ddd', borderRadius: '8px',
                    padding: '8px 10px', fontSize: '13px', outline: 'none', color: '#111'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
                {(() => {
                  const m = calcular(seleccionado)
                  return [
                    { label: 'Calorías', valor: m.kcal, unit: 'kcal', color: '#0F6E56' },
                    { label: 'Proteínas', valor: m.proteinas, unit: 'g', color: '#185FA5' },
                    { label: 'Carbos', valor: m.carbohidratos, unit: 'g', color: '#BA7517' },
                    { label: 'Grasas', valor: m.grasas, unit: 'g', color: '#444' },
                  ].map(d => (
                    <div key={d.label} style={{
                      background: '#f8f8f8', borderRadius: '8px', padding: '12px', textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px' }}>{d.label}</p>
                      <p style={{ fontSize: '18px', fontWeight: '500', color: d.color, margin: 0 }}>
                        {d.valor}<span style={{ fontSize: '11px', color: '#aaa', fontWeight: '400' }}>{d.unit}</span>
                      </p>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        )}

        {haBuscado && resultados.length === 0 && query && !cargando && (
          <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '40px 0' }}>
            No se encontraron resultados para "{query}"
          </p>
        )}
      </div>
    </Layout>
  )
}