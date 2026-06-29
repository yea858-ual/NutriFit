import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator
} from 'react-native'
import { Pedometer } from 'expo-sensors'
import { useRouter } from 'expo-router'
import api from '../../api/http'

const OBJETIVO_PASOS = 10000
const KCAL_POR_PASO = 0.04 // aproximación media

export default function PedometroScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [pasos, setPasos] = useState(0)
  const [disponible, setDisponible] = useState<boolean | null>(null)
  const [plan, setPlan] = useState<any>(null)

  useEffect(() => {
    const init = async () => {
      const isAvailable = await Pedometer.isAvailableAsync()
      setDisponible(isAvailable)

      if (isAvailable) {
        const ahora = new Date()
        const inicio = new Date()
        inicio.setHours(0, 0, 0, 0)

        const result = await Pedometer.getStepCountAsync(inicio, ahora)
        setPasos(result.steps)

        const subscription = Pedometer.watchStepCount(result => {
          setPasos(prev => prev + result.steps)
        })

        return () => subscription.remove()
      }
    }
    init()

    const cargarPlan = async () => {
      try {
        const res = await api.get('/nutrition/ultimo')
        setPlan(res.data)
      } catch (err) {}
    }
    cargarPlan()
  }, [])

  const kcalQuemadas = Math.round(pasos * KCAL_POR_PASO)
  const progreso = Math.min((pasos / OBJETIVO_PASOS) * 100, 100)
  const ajusteCalórico = kcalQuemadas > 300 ? `+${kcalQuemadas - 300}` : `${kcalQuemadas - 300}`

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>

        <TouchableOpacity onPress={() => router.back()} style={styles.btnVolver}>
          <Text style={styles.btnVolverText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Actividad del día</Text>
        <Text style={styles.subtitulo}>Seguimiento de pasos y calorías quemadas</Text>

        {disponible === null && (
          <ActivityIndicator size="large" color="#0F6E56" style={{ marginTop: 40 }} />
        )}

        {disponible === false && (
          <View style={styles.noDisponible}>
            <Text style={styles.noDisponibleText}>
              El pedómetro no está disponible en este dispositivo.
            </Text>
          </View>
        )}

        {disponible === true && (
          <>
            {/* Pasos */}
            <View style={styles.pasosCard}>
              <Text style={styles.pasosLabel}>Pasos hoy</Text>
              <Text style={styles.pasosValor}>{pasos.toLocaleString()}</Text>
              <Text style={styles.pasosObjetivo}>/ {OBJETIVO_PASOS.toLocaleString()} objetivo</Text>

              {/* Barra de progreso */}
              <View style={styles.barraContainer}>
                <View style={[styles.barra, { width: `${progreso}%` as any }]} />
              </View>
              <Text style={styles.progresoPct}>{Math.round(progreso)}% del objetivo diario</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statValor}>{kcalQuemadas}</Text>
                <Text style={styles.statLabel}>kcal quemadas</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>📏</Text>
                <Text style={styles.statValor}>{(pasos * 0.75 / 1000).toFixed(1)}</Text>
                <Text style={styles.statLabel}>km recorridos</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>⏱️</Text>
                <Text style={styles.statValor}>{Math.round(pasos / 100)}</Text>
                <Text style={styles.statLabel}>minutos activo</Text>
              </View>
            </View>

            {/* Ajuste calórico */}
            {plan && (
              <View style={styles.ajusteCard}>
                <Text style={styles.ajusteTitulo}>Ajuste calórico sugerido</Text>
                <Text style={styles.ajusteSubtitulo}>
                  Basado en tu actividad real de hoy vs tu nivel declarado
                </Text>
                <View style={styles.ajusteRow}>
                  <View style={styles.ajusteItem}>
                    <Text style={styles.ajusteItemLabel}>Plan base</Text>
                    <Text style={styles.ajusteItemValor}>
                      {Math.round(plan.calorias_objetivo)} kcal
                    </Text>
                  </View>
                  <Text style={styles.ajusteMas}>+</Text>
                  <View style={styles.ajusteItem}>
                    <Text style={styles.ajusteItemLabel}>Quemado extra</Text>
                    <Text style={[styles.ajusteItemValor, { color: '#0F6E56' }]}>
                      {kcalQuemadas} kcal
                    </Text>
                  </View>
                  <Text style={styles.ajusteMas}>=</Text>
                  <View style={styles.ajusteItem}>
                    <Text style={styles.ajusteItemLabel}>Total sugerido</Text>
                    <Text style={[styles.ajusteItemValor, { color: '#0F6E56', fontWeight: '700' }]}>
                      {Math.round(plan.calorias_objetivo) + kcalQuemadas} kcal
                    </Text>
                  </View>
                </View>
              </View>
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
  btnVolver: { marginBottom: 16 },
  btnVolverText: { fontSize: 13, color: '#888' },
  titulo: { fontSize: 22, fontWeight: '600', color: '#111', marginBottom: 4 },
  subtitulo: { fontSize: 13, color: '#888', marginBottom: 20 },
  noDisponible: { alignItems: 'center', paddingVertical: 40 },
  noDisponibleText: { fontSize: 14, color: '#888', textAlign: 'center' },
  pasosCard: {
    backgroundColor: '#0F6E56', borderRadius: 16, padding: 24,
    marginBottom: 14, alignItems: 'center',
  },
  pasosLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  pasosValor: { fontSize: 52, fontWeight: '700', color: '#fff' },
  pasosObjetivo: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 16 },
  barraContainer: {
    width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3, overflow: 'hidden', marginBottom: 8,
  },
  barra: { height: '100%', backgroundColor: '#fff', borderRadius: 3 },
  progresoPct: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 0.5, borderColor: '#eee',
  },
  statEmoji: { fontSize: 20, marginBottom: 6 },
  statValor: { fontSize: 20, fontWeight: '600', color: '#111' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2, textAlign: 'center' },
  ajusteCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 0.5, borderColor: '#eee',
  },
  ajusteTitulo: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 },
  ajusteSubtitulo: { fontSize: 12, color: '#888', marginBottom: 16 },
  ajusteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ajusteItem: { alignItems: 'center', flex: 1 },
  ajusteItemLabel: { fontSize: 10, color: '#888', marginBottom: 4 },
  ajusteItemValor: { fontSize: 14, fontWeight: '600', color: '#111' },
  ajusteMas: { fontSize: 16, color: '#aaa', paddingHorizontal: 4 },
})