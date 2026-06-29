import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert
} from 'react-native'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

const STORAGE_KEY = 'nutrifit_notificaciones'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

const RECORDATORIOS_DEFAULT = [
  { id: 'desayuno', label: 'Desayuno', titulo: '¡Es hora del desayuno!', hora: '08:00', activo: true, emoji: '🌅' },
  { id: 'comida', label: 'Comida', titulo: '¡Es hora de comer!', hora: '14:00', activo: true, emoji: '🍽️' },
  { id: 'cena', label: 'Cena', titulo: '¡Es hora de cenar!', hora: '21:00', activo: true, emoji: '🌙' },
  { id: 'hidratacion1', label: 'Hidratación (mañana)', titulo: '¡Recuerda hidratarte!', hora: '10:00', activo: false, emoji: '💧' },
  { id: 'hidratacion2', label: 'Hidratación (tarde)', titulo: '¡Recuerda hidratarte!', hora: '17:00', activo: false, emoji: '💧' },
]

export default function Notificaciones() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [recordatorios, setRecordatorios] = useState(RECORDATORIOS_DEFAULT)
  const [permiso, setPermiso] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { status } = await Notifications.requestPermissionsAsync()
      setPermiso(status === 'granted')

      const guardados = await AsyncStorage.getItem(STORAGE_KEY)
      if (guardados) setRecordatorios(JSON.parse(guardados))
    }
    init()
  }, [])

  const guardar = async (nuevos: typeof recordatorios) => {
    setRecordatorios(nuevos)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos))
    await programarNotificaciones(nuevos)
  }

  const toggleRecordatorio = (id: string) => {
    const nuevos = recordatorios.map(r =>
      r.id === id ? { ...r, activo: !r.activo } : r
    )
    guardar(nuevos)
  }

  const programarNotificaciones = async (lista: typeof recordatorios) => {
    await Notifications.cancelAllScheduledNotificationsAsync()

    for (const r of lista) {
      if (!r.activo) continue
      const [hora, minuto] = r.hora.split(':').map(Number)

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${r.emoji} ${r.titulo}`,
          body: `Consulta tu plan semanal en NutriFit y disfruta de tu comida.`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: hora,
          minute: minuto,
        },
      })
    }

    Alert.alert('✅ Guardado', 'Los recordatorios se han configurado correctamente.')
  }

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>

        <TouchableOpacity onPress={() => router.back()} style={styles.btnVolver}>
          <Text style={styles.btnVolverText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Recordatorios</Text>
        <Text style={styles.subtitulo}>
          Activa los recordatorios para no olvidar ninguna comida del día
        </Text>

        {!permiso && (
          <View style={styles.alertaBanner}>
            <Text style={styles.alertaText}>
              ⚠️ Los permisos de notificaciones no están activados. Ve a Ajustes del iPhone para habilitarlos.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          {recordatorios.map((r, idx) => (
            <View
              key={r.id}
              style={[styles.itemRow, idx < recordatorios.length - 1 && styles.itemBorder]}
            >
              <Text style={styles.itemEmoji}>{r.emoji}</Text>
              <View style={styles.itemInfo}>
                <Text style={styles.itemLabel}>{r.label}</Text>
                <Text style={styles.itemHora}>{r.hora}</Text>
              </View>
              <Switch
                value={r.activo}
                onValueChange={() => toggleRecordatorio(r.id)}
                trackColor={{ false: '#ddd', true: '#0F6E56' }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        <Text style={styles.nota}>
          Los recordatorios se enviarán cada día a la hora indicada, aunque la app esté cerrada.
        </Text>

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
  alertaBanner: {
    backgroundColor: '#FFF3CD', borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#FFEAA7',
  },
  alertaText: { fontSize: 12, color: '#856404' },
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 0.5, borderColor: '#eee', overflow: 'hidden', marginBottom: 16,
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  itemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  itemEmoji: { fontSize: 20, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemLabel: { fontSize: 14, fontWeight: '500', color: '#111' },
  itemHora: { fontSize: 12, color: '#888', marginTop: 2 },
  nota: { fontSize: 12, color: '#aaa', textAlign: 'center', lineHeight: 18 },
})