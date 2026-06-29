import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/http'

const ETIQUETAS_INTOLERANCIAS = [
  { key: 'intolerancia_gluten', label: 'Sin gluten' },
  { key: 'intolerancia_lactosa', label: 'Sin lactosa' },
  { key: 'alergia_frutos_secos', label: 'Sin frutos secos' },
  { key: 'dieta_vegetariana', label: 'Vegetariano' },
  { key: 'dieta_vegana', label: 'Vegano' },
]

export default function Dashboard() {
  const { usuario } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [plan, setPlan] = useState<any>(null)
  const [recalculando, setRecalculando] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const cargarPlan = async () => {
    try {
      const res = await api.get('/nutrition/ultimo')
      setPlan(res.data)
    } catch (err) {}
  }

  useEffect(() => {
    cargarPlan()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await cargarPlan()
    setRefreshing(false)
  }

  const recalcular = async () => {
    setRecalculando(true)
    try {
      const res = await api.post('/nutrition/calcular')
      setPlan(res.data)
    } catch (err) {
      router.push('/(tabs)/perfil')
    } finally {
      setRecalculando(false)
    }
  }

  const intoleranciasActivas = ETIQUETAS_INTOLERANCIAS.filter(
    i => usuario?.[i.key as keyof typeof usuario]
  )

  const nombre = usuario?.nombre?.split(' ')[0] || ''

  return (
    <View style={styles.wrapper}>

      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLogo}>
          <Text style={styles.headerLogoText}>N</Text>
        </View>
        <Text style={styles.headerTitle}>NutriFit</Text>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F6E56" />}
      >
        <View style={styles.content}>

          {/* Cabecera */}
          <View style={styles.header}>
            <Text style={styles.saludo}>Hola, {nombre} 👋</Text>
            <Text style={styles.subtitulo}>Tu resumen nutricional</Text>
            {intoleranciasActivas.length > 0 && (
              <View style={styles.badges}>
                {intoleranciasActivas.map(i => (
                  <View key={i.key} style={styles.badge}>
                    <Text style={styles.badgeText}>{i.label}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {plan ? (
            <>
              {/* Calorías */}
              <View style={styles.calCard}>
                <Text style={styles.calLabel}>Calorías diarias</Text>
                <View style={styles.calRow}>
                  <Text style={styles.calValue}>
                    {Math.round(plan.calorias_objetivo).toLocaleString()}
                  </Text>
                  <Text style={styles.calUnit}>kcal</Text>
                </View>
                <Text style={styles.calObjetivo}>
                  {plan.ajuste_calorico > 0
                    ? `+${plan.ajuste_calorico} kcal · Ganar músculo`
                    : plan.ajuste_calorico < 0
                    ? `${plan.ajuste_calorico} kcal · Perder peso`
                    : 'Mantenimiento'}
                </Text>
              </View>

              {/* Macros */}
              <View style={styles.macrosGrid}>
                {[
                  { label: 'Proteínas', valor: Math.round(plan.proteinas_g), unit: 'g', color: '#0F6E56' },
                  { label: 'Carbohidratos', valor: Math.round(plan.carbohidratos_g), unit: 'g', color: '#BA7517' },
                  { label: 'Grasas', valor: Math.round(plan.grasas_g), unit: 'g', color: '#185FA5' },
                  { label: 'BMR', valor: Math.round(plan.bmr), unit: 'kcal', color: '#444' },
                ].map(m => (
                  <View key={m.label} style={styles.macroCard}>
                    <Text style={styles.macroLabel}>{m.label}</Text>
                    <Text style={[styles.macroValue, { color: m.color }]}>
                      {m.valor}<Text style={styles.macroUnit}>{m.unit}</Text>
                    </Text>
                  </View>
                ))}
              </View>

              {/* Distribución por comida */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Distribución por comida</Text>
                {Object.entries(plan.distribucion_comidas).map(([tipo, datos]: any) => (
                  <View key={tipo} style={styles.comidaRow}>
                    <Text style={styles.comidaNombre}>
                      {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                    </Text>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, {
                        width: `${(datos.kcal / plan.calorias_objetivo) * 100}%` as any
                      }]} />
                    </View>
                    <Text style={styles.comidaKcal}>{Math.round(datos.kcal)} kcal</Text>
                  </View>
                ))}
              </View>

              {/* Botones principales */}
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => router.push('/(tabs)/plan')}
              >
                <Text style={styles.btnPrimaryText}>Ver plan semanal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => router.push('/(tabs)/compra')}
              >
                <Text style={styles.btnSecondaryText}>Lista de la compra</Text>
              </TouchableOpacity>

              {/* Herramientas nativas */}
              <View style={styles.herramientasTitulo}>
                <Text style={styles.herramientasLabel}>Herramientas</Text>
              </View>

              <View style={styles.herramientasGrid}>
                <TouchableOpacity
                  style={styles.herramientaCard}
                  onPress={() => router.push('/notificaciones')}
                >
                  <Text style={styles.herramientaEmoji}>🔔</Text>
                  <Text style={styles.herramientaNombre}>Recordatorio</Text>
                  <Text style={styles.herramientaDesc}>Configura avisos de comidas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.herramientaCard}
                  onPress={() => router.push('/pedometro')}
                >
                  <Text style={styles.herramientaEmoji}>👣</Text>
                  <Text style={styles.herramientaNombre}>Actividad</Text>
                  <Text style={styles.herramientaDesc}>Pasos y calorías quemadas</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.herramientaCard}
                  onPress={() => router.push('/diario')}
                >
                  <Text style={styles.herramientaEmoji}>📸</Text>
                  <Text style={styles.herramientaNombre}>Diario</Text>
                  <Text style={styles.herramientaDesc}>Fotos de tus comidas</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={recalcular} disabled={recalculando}>
                <Text style={styles.recalcular}>
                  {recalculando ? 'Recalculando...' : 'Recalcular plan nutricional'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Calcula tu plan nutricional</Text>
              <Text style={styles.emptySubtitle}>Basado en tus datos y objetivos</Text>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={recalcular}
                disabled={recalculando}
              >
                {recalculando
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.btnPrimaryText}>Calcular mi plan</Text>
                }
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#f8f9fa' },
  headerBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  headerLogo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F6E56',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  headerLogoText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F6E56',
  },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  saludo: { fontSize: 22, fontWeight: '600', color: '#111', marginBottom: 2 },
  subtitulo: { fontSize: 13, color: '#888', marginBottom: 10 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { backgroundColor: '#E1F5EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '500', color: '#0F6E56' },
  calCard: {
    backgroundColor: '#0F6E56', borderRadius: 14, padding: 20, marginBottom: 12,
  },
  calLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  calRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  calValue: { fontSize: 40, fontWeight: '600', color: '#fff' },
  calUnit: { fontSize: 16, color: 'rgba(255,255,255,0.7)' },
  calObjetivo: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  macrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  macroCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    width: '47%', borderWidth: 0.5, borderColor: '#eee',
  },
  macroLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  macroValue: { fontSize: 22, fontWeight: '500' },
  macroUnit: { fontSize: 11, color: '#aaa', fontWeight: '400' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 0.5, borderColor: '#eee', marginBottom: 12,
  },
  cardTitle: { fontSize: 13, fontWeight: '500', color: '#333', marginBottom: 12 },
  comidaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  comidaNombre: { fontSize: 13, color: '#555', width: 80, textTransform: 'capitalize' },
  barContainer: { flex: 1, height: 4, backgroundColor: '#f0f0f0', borderRadius: 2, marginHorizontal: 10, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: '#1D9E75', borderRadius: 2 },
  comidaKcal: { fontSize: 12, fontWeight: '500', color: '#333', width: 65, textAlign: 'right' },
  btnPrimary: {
    backgroundColor: '#0F6E56', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 10,
  },
  btnPrimaryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnSecondary: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 16,
    borderWidth: 0.5, borderColor: '#ddd',
  },
  btnSecondaryText: { color: '#333', fontSize: 14, fontWeight: '500' },
  herramientasTitulo: { marginBottom: 10 },
  herramientasLabel: { fontSize: 11, fontWeight: '600', color: '#999', textTransform: 'uppercase', letterSpacing: 0.5 },
  herramientasGrid: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  herramientaCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 0.5, borderColor: '#eee',
  },
  herramientaEmoji: { fontSize: 24, marginBottom: 6 },
  herramientaNombre: { fontSize: 12, fontWeight: '600', color: '#111', marginBottom: 2, textAlign: 'center' },
  herramientaDesc: { fontSize: 10, color: '#aaa', textAlign: 'center' },
  recalcular: { textAlign: 'center', fontSize: 12, color: '#aaa', padding: 8 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: '#111', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#888', marginBottom: 24 },
})