import { useState, useEffect } from 'react'
import api from '../api/http'
import Layout from '../components/Layout'

const STORAGE_KEY = 'nutrifit_buscador'

export default function Buscador() {
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState([])
  const [resultadosOFF, setResultadosOFF] = useState([])
  const [seleccionado, setSeleccionado] = useState(null)
  const [gramos, setGramos] = useState(100)
  const [cargando, setCargando] = useState(false)
  const [cargandoOFF, setCargandoOFF] = useState(false)
  const [haBuscado, setHaBuscado] = useState(false)

  // Cargar búsqueda guardada al entrar
  useEffect(() => {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (guardado) {
      const { query: q, resultados: r, resultadosOFF: rOFF } = JSON.parse(guardado)
      setQuery(q || '')
      setResultados(r || [])
      setResultadosOFF(rOFF || [])
      if (r?.length > 0 || rOFF?.length > 0) setHaBuscado(true)
    }
  }, [])

  const buscar = async () => {
    if (!query.trim()) return
    setCargando(true)
    setHaBuscado(true)
    setResultados([])
    setResultadosOFF([])
    setSeleccionado(null)

    try {
      const res = await api.get(`/alimentos/buscar?q=${query}`)
      setResultados(res.data)
      guardarBusqueda(query, res.data, [])
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }

    setCargandoOFF(true)
    try {
      const res = await api.get(`/alimentos/openfoodfacts/buscar?q=${query}`)
      setResultadosOFF(res.data)
      guardarBusqueda(query, resultados, res.data)
    } catch (err) {
      // OpenFoodFacts puede fallar
    } finally {
      setCargandoOFF(false)
    }
  }

  const guardarBusqueda = (q, r, rOFF) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ query: q, resultados: r, resultadosOFF: rOFF }))
  }

  const calcular = (alimento) => {
    const factor = gramos / 100
    return {
      kcal: Math.round((alimento.kcal_100g || 0) * factor),
      proteinas: Math.round((alimento.proteinas_100g || 0) * factor * 10) / 10,
      carbohidratos: Math.round((alimento.carbohidratos_100g || 0) * factor * 10) / 10,
      grasas: Math.round((alimento.grasas_100g || 0) * factor * 10) / 10,
    }
  }

  const seleccionar = (alimento, fuente) => {
    setSeleccionado({ ...alimento, fuente })
    setGramos(100)
  }

  const CardAlimento = ({ alimento, fuente }) => (
    <div onClick={() => seleccionar(alimento, fuente)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', cursor: 'pointer', background: '#fff',
        borderBottom: '0.5px solid #f5f5f5',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'}
      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {fuente === 'openfoodfacts' && alimento.imagen_url ? (
          <img src={alimento.imagen_url} alt={alimento.nombre}
            style={{
              width: '36px', height: '36px', borderRadius: '6px',
              objectFit: 'cover', flexShrink: 0, border: '0.5px solid #eee'
            }}
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <span style={{
            fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px',
            background: fuente === 'local' ? '#E1F5EE' : '#EEF2FF',
            color: fuente === 'local' ? '#0F6E56' : '#4F46E5',
            flexShrink: 0
          }}>
            {fuente === 'local' ? 'LOCAL' : 'OFF'}
          </span>
        )}
        <div>
          <p style={{ fontSize: '13px', fontWeight: '500', color: '#111', margin: '0 0 2px' }}>
            {alimento.nombre}
          </p>
          <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
            {fuente === 'local' ? alimento.categoria : alimento.marca || 'OpenFoodFacts'}
          </p>
        </div>
      </div>
      <span style={{
        fontSize: '12px', fontWeight: '500',
        color: fuente === 'local' ? '#0F6E56' : '#4F46E5'
      }}>
        {alimento.kcal_100g} kcal/100g
      </span>
    </div>
  )

  return (
    <Layout>
      <div style={{ maxWidth: '680px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#111', margin: '0 0 4px' }}>Buscador</h1>
          <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
            Busca alimentos y calcula sus macros
          </p>
        </div>

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

        {!seleccionado && haBuscado && (
          <div>
            {resultados.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '11px', fontWeight: '500', color: '#0F6E56',
                  textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px'
                }}>
                  Base de datos NutriFit ({resultados.length})
                </p>
                <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #eee', overflow: 'hidden' }}>
                  {resultados.map(a => <CardAlimento key={a.id} alimento={a} fuente="local" />)}
                </div>
              </div>
            )}

            {cargandoOFF && (
              <p style={{ fontSize: '12px', color: '#888', margin: '8px 0' }}>
                Buscando en OpenFoodFacts...
              </p>
            )}

            {!cargandoOFF && resultadosOFF.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{
                  fontSize: '11px', fontWeight: '500', color: '#4F46E5',
                  textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px'
                }}>
                  OpenFoodFacts ({resultadosOFF.length})
                </p>
                <div style={{ background: '#fff', borderRadius: '10px', border: '0.5px solid #eee', overflow: 'hidden' }}>
                  {resultadosOFF.map((a, idx) => (
                    <CardAlimento key={idx} alimento={a} fuente="openfoodfacts" />
                  ))}
                </div>
              </div>
            )}

            {!cargando && !cargandoOFF && resultados.length === 0 && resultadosOFF.length === 0 && (
              <p style={{ fontSize: '13px', color: '#888', textAlign: 'center', padding: '40px 0' }}>
                No se encontraron resultados para "{query}"
              </p>
            )}
          </div>
        )}

        {seleccionado && (
          <div>
            <button onClick={() => setSeleccionado(null)}
              style={{
                background: 'none', border: 'none', fontSize: '13px',
                color: '#888', cursor: 'pointer', marginBottom: '16px', padding: 0
              }}>
              ← Volver a resultados
            </button>

            <div style={{
              background: '#fff', borderRadius: '10px', padding: '20px',
              border: '0.5px solid #eee'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                {seleccionado.fuente === 'openfoodfacts' && seleccionado.imagen_url ? (
                  <img src={seleccionado.imagen_url} alt={seleccionado.nombre}
                    style={{
                      width: '48px', height: '48px', borderRadius: '8px',
                      objectFit: 'cover', border: '0.5px solid #eee'
                    }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <span style={{
                    fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px',
                    background: seleccionado.fuente === 'local' ? '#E1F5EE' : '#EEF2FF',
                    color: seleccionado.fuente === 'local' ? '#0F6E56' : '#4F46E5',
                  }}>
                    {seleccionado.fuente === 'local' ? 'LOCAL' : 'OFF'}
                  </span>
                )}
                <div>
                  <p style={{ fontSize: '15px', fontWeight: '500', color: '#111', margin: '0 0 2px' }}>
                    {seleccionado.nombre}
                  </p>
                  <p style={{ fontSize: '11px', color: '#888', margin: 0 }}>
                    {seleccionado.fuente === 'local'
                      ? seleccionado.categoria
                      : `OpenFoodFacts · ${seleccionado.marca || ''}`}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', color: '#555', whiteSpace: 'nowrap' }}>
                  Cantidad (g)
                </label>
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
                      background: '#f8f8f8', borderRadius: '8px',
                      padding: '12px', textAlign: 'center'
                    }}>
                      <p style={{ fontSize: '11px', color: '#888', margin: '0 0 4px' }}>{d.label}</p>
                      <p style={{ fontSize: '18px', fontWeight: '500', color: d.color, margin: 0 }}>
                        {d.valor}
                        <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '400' }}>{d.unit}</span>
                      </p>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}