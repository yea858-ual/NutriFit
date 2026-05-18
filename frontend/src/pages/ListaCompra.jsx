import { useState, useEffect } from 'react'
import api from '../api/http'
import Layout from '../components/Layout'

const NOMBRE_CATEGORIA = {
  carne: 'Carne', pescado: 'Pescado', marisco: 'Marisco', huevo: 'Huevo',
  lacteo: 'Lácteo', bebida_vegetal: 'Bebida vegetal', verdura: 'Verdura',
  legumbre: 'Legumbre', cereal_desayuno: 'Cereales desayuno',
  cereal_comida: 'Cereales comida', fruta: 'Fruta', frutos_secos: 'Frutos secos',
  semillas: 'Semillas', grasa: 'Grasa', grasa_vegetal: 'Grasa vegetal',
  embutido: 'Embutido', conserva: 'Conserva', condimento: 'Condimento',
}

const STORAGE_KEY = 'nutrifit_lista_compra'

export default function ListaCompra() {
  const [lista, setLista] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [marcados, setMarcados] = useState({})

  useEffect(() => {
    // Cargar marcados guardados
    const guardados = localStorage.getItem(STORAGE_KEY)
    if (guardados) setMarcados(JSON.parse(guardados))
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
    setMarcados(prev => {
      const nuevos = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos))
      return nuevos
    })
  }

  const limpiar = () => {
    setMarcados({})
    localStorage.removeItem(STORAGE_KEY)
  }

  const nombreCategoria = (cat) => NOMBRE_CATEGORIA[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)

  const totalMarcados = Object.values(marcados).filter(Boolean).length

  if (cargando) return (
    <Layout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <p style={{ fontSize: '13px', color: '#888' }}>Cargando lista de la compra...</p>
      </div>
    </Layout>
  )

  return (
    <Layout>
      <div style={{ maxWidth: '680px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#111', margin: '0 0 4px' }}>Lista de la compra</h1>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
              {lista ? `${lista.total_ingredientes} ingredientes · ${totalMarcados} marcados` : ''}
            </p>
          </div>
          <button onClick={limpiar}
            style={{
              background: '#fff', border: '0.5px solid #ddd', borderRadius: '8px',
              padding: '8px 14px', fontSize: '12px', color: '#555', cursor: 'pointer'
            }}>
            Limpiar
          </button>
        </div>

        {lista?.categorias.map(cat => (
          <div key={cat.categoria} style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '11px', fontWeight: '500', color: '#0F6E56',
              textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px'
            }}>
              {nombreCategoria(cat.categoria)} ({cat.total_items})
            </p>
            <div style={{
              background: '#fff', borderRadius: '10px',
              border: '0.5px solid #eee', overflow: 'hidden'
            }}>
              {cat.items.map((item, idx) => {
                const key = `${cat.categoria}-${item.nombre}`
                const marcado = marcados[key]
                return (
                  <div key={key} onClick={() => toggleMarcado(key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 14px', cursor: 'pointer',
                      borderBottom: idx < cat.items.length - 1 ? '0.5px solid #f5f5f5' : 'none',
                      background: marcado ? '#fafafa' : '#fff'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%',
                        border: marcado ? 'none' : '1.5px solid #ccc',
                        background: marcado ? '#0F6E56' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {marcado && <span style={{ color: '#fff', fontSize: '11px' }}>✓</span>}
                      </div>
                      <span style={{
                        fontSize: '13px', color: marcado ? '#bbb' : '#333',
                        textDecoration: marcado ? 'line-through' : 'none'
                      }}>
                        {item.nombre}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '12px', color: '#999', background: '#f5f5f5',
                      padding: '2px 8px', borderRadius: '4px'
                    }}>
                      {item.cantidad_legible}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}