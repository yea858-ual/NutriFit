import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native'
import api from '../../api/http'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIAS_COMPLETOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export default function PlanSemanal() {
  const [plan, setPlan] = useState<any>(null)
  const [diaActivo, setDiaActivo] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')

  const cargarPlan = async () => {
    setError('')
    try {
      const res = await api.get('/menu/ultimo')
      setPlan(res.data)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('No tienes ningún plan generado todavía.')
      }
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPlan()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await cargarPlan()
    setRefreshing(false)
  }

  const regenerar = async () => {
    setGenerando(true)
    try {
      const res = await api.post('/menu/generar')
      setPlan(res.data)
      setDiaActivo(0)
      setError('')
    } catch (err) {
      setError('Error al generar el plan. Completa tu perfil primero.')
    } finally {
      setGenerando(false)
    }
  }

  if (cargando) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#0F6E56" />
    </View>
  )

  const diaData = plan?.dias[diaActivo]

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F6E56" />}
    >
      <View style={styles.content}>

        {/* Cabecera */}
        <View style={styles.header}>
          <View>
            <Text style={styles.titulo}>Plan semanal</Text>
            {plan && (
              <Text style={styles.subtitulo}>
                {plan.total_alimentos_distintos} alimentos distintos esta semana
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.btnRegenerar}
            onPress={regenerar}
            disabled={generando}
          >
            {generando
              ? <ActivityIndicator size="small" color="#555" />
              : <Text style={styles.btnRegenerarText}>Regenerar</Text>
            }
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.btnGenerar} onPress={regenerar} disabled={generando}>
              {generando
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnGenerarText}>Generar plan semanal</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {plan && (
          <>
            {/* Tabs días */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
              {DIAS.map((dia, i) => (
                <TouchableOpacity
                  key={dia}
                  style={[styles.tab, diaActivo === i && styles.tabActivo]}
                  onPress={() => setDiaActivo(i)}
                >
                  <Text style={[styles.tabText, diaActivo === i && styles.tabTextActivo]}>
                    {dia}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {diaData && (
              <>
                {/* Nombre del día */}
                <Text style={styles.diaNombre}>{DIAS_COMPLETOS[diaActivo]}</Text>

                {/* Totales del día */}
                <View style={styles.totalesGrid}>
                  {[
                    { label: 'kcal', valor: Math.round(diaData.totales.kcal) },
                    { label: 'proteínas', valor: `${Math.round(diaData.totales.proteinas_g)}g` },
                    { label: 'carbos', valor: `${Math.round(diaData.totales.carbohidratos_g)}g` },
                    { label: 'grasas', valor: `${Math.round(diaData.totales.grasas_g)}g` },
                  ].map(t => (
                    <View key={t.label} style={styles.totalCard}>
                      <Text style={styles.totalLabel}>{t.label}</Text>
                      <Text style={styles.totalValor}>{t.valor}</Text>
                    </View>
                  ))}
                </View>

                {/* Comidas */}
                {diaData.comidas.map((comida: any) => (
                  <View key={comida.tipo} style={styles.comidaCard}>
                    <View style={styles.comidaHeader}>
                      <Text style={styles.comidaTipo}>
                        {comida.tipo.charAt(0).toUpperCase() + comida.tipo.slice(1)}
                      </Text>
                      <Text style={styles.comidaKcal}>{Math.round(comida.kcal_total)} kcal</Text>
                    </View>
                    {comida.alimentos.map((a: any) => (
                      <View key={a.alimento_id} style={styles.alimentoRow}>
                        <Text style={styles.alimentoNombre}>{a.nombre}</Text>
                        <View style={styles.alimentoGramosBadge}>
                          <Text style={styles.alimentoGramosText}>{a.cantidad_g}g</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  titulo: { fontSize: 22, fontWeight: '600', color: '#111' },
  subtitulo: { fontSize: 12, color: '#888', marginTop: 2 },
  btnRegenerar: {
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8,
  },
  btnRegenerarText: { fontSize: 12, color: '#555', fontWeight: '500' },
  tabsContainer: { marginBottom: 16 },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#f0f0f0', marginRight: 8,
  },
  tabActivo: { backgroundColor: '#0F6E56' },
  tabText: { fontSize: 13, color: '#666', fontWeight: '400' },
  tabTextActivo: { color: '#fff', fontWeight: '500' },
  diaNombre: { fontSize: 16, fontWeight: '600', color: '#111', marginBottom: 12 },
  totalesGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  totalCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10,
    alignItems: 'center', borderWidth: 0.5, borderColor: '#eee',
  },
  totalLabel: { fontSize: 10, color: '#888', marginBottom: 4 },
  totalValor: { fontSize: 16, fontWeight: '500', color: '#111' },
  comidaCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 10, borderWidth: 0.5, borderColor: '#eee',
  },
  comidaHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  comidaTipo: { fontSize: 11, fontWeight: '600', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: 0.5 },
  comidaKcal: { fontSize: 12, color: '#888' },
  alimentoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  alimentoNombre: { fontSize: 13, color: '#333', flex: 1 },
  alimentoGramosBadge: { backgroundColor: '#f8f8f8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  alimentoGramosText: { fontSize: 12, color: '#999' },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' },
  btnGenerar: { backgroundColor: '#0F6E56', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnGenerarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
})