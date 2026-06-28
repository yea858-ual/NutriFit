import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

const STORAGE_KEY = 'nutrifit_diario'

const COMIDAS = [
  { id: 'desayuno', label: 'Desayuno', emoji: '🌅', hora: '8:00' },
  { id: 'comida', label: 'Comida', emoji: '🍽️', hora: '14:00' },
  { id: 'cena', label: 'Cena', emoji: '🌙', hora: '21:00' },
  { id: 'snack', label: 'Snack', emoji: '🍎', hora: '' },
]

export default function Diario() {
  const router = useRouter()
  const [fotos, setFotos] = useState<Record<string, string>>({})
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    cargarFotos()
  }, [fecha])

  const cargarFotos = async () => {
    const guardado = await AsyncStorage.getItem(`${STORAGE_KEY}_${fecha}`)
    if (guardado) setFotos(JSON.parse(guardado))
    else setFotos({})
  }

  const guardarFotos = async (nuevas: Record<string, string>) => {
    setFotos(nuevas)
    await AsyncStorage.setItem(`${STORAGE_KEY}_${fecha}`, JSON.stringify(nuevas))
  }

  const tomarFoto = async (comidaId: string) => {
    Alert.alert(
      'Añadir foto',
      '¿Cómo quieres añadir la foto?',
      [
        {
          text: 'Cámara', onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            })
            if (!result.canceled) {
              const nuevas = { ...fotos, [comidaId]: result.assets[0].uri }
              guardarFotos(nuevas)
            }
          }
        },
        {
          text: 'Galería', onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.7,
            })
            if (!result.canceled) {
              const nuevas = { ...fotos, [comidaId]: result.assets[0].uri }
              guardarFotos(nuevas)
            }
          }
        },
        { text: 'Cancelar', style: 'cancel' }
      ]
    )
  }

  const eliminarFoto = (comidaId: string) => {
    Alert.alert(
      'Eliminar foto',
      '¿Quieres eliminar esta foto del diario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: () => {
            const nuevas = { ...fotos }
            delete nuevas[comidaId]
            guardarFotos(nuevas)
          }
        }
      ]
    )
  }

  const fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  const irDiaAnterior = () => {
    const d = new Date(fecha + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    setFecha(d.toISOString().split('T')[0])
  }

  const irDiaSiguiente = () => {
    const d = new Date(fecha + 'T12:00:00')
    d.setDate(d.getDate() + 1)
    setFecha(d.toISOString().split('T')[0])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        <TouchableOpacity onPress={() => router.back()} style={styles.btnVolver}>
          <Text style={styles.btnVolverText}>← Volver</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Diario de comidas</Text>
        <Text style={styles.subtitulo}>Registra lo que comes cada día</Text>

        {/* Navegación de fecha */}
        <View style={styles.fechaNav}>
          <TouchableOpacity onPress={irDiaAnterior} style={styles.fechaBtn}>
            <Text style={styles.fechaBtnText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.fechaTexto}>{fechaFormateada}</Text>
          <TouchableOpacity onPress={irDiaSiguiente} style={styles.fechaBtn}>
            <Text style={styles.fechaBtnText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Comidas */}
        {COMIDAS.map(comida => (
          <View key={comida.id} style={styles.comidaCard}>
            <View style={styles.comidaHeader}>
              <Text style={styles.comidaEmoji}>{comida.emoji}</Text>
              <View style={styles.comidaInfo}>
                <Text style={styles.comidaLabel}>{comida.label}</Text>
                {comida.hora ? <Text style={styles.comidaHora}>{comida.hora}</Text> : null}
              </View>
              <TouchableOpacity
                style={styles.btnFoto}
                onPress={() => tomarFoto(comida.id)}
              >
                <Text style={styles.btnFotoText}>
                  {fotos[comida.id] ? '📷 Cambiar' : '📷 Añadir'}
                </Text>
              </TouchableOpacity>
            </View>

            {fotos[comida.id] ? (
              <TouchableOpacity
                onLongPress={() => eliminarFoto(comida.id)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: fotos[comida.id] }}
                  style={styles.foto}
                  resizeMode="cover"
                />
                <Text style={styles.fotoHint}>Mantén pulsado para eliminar</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.fotoPlaceholder}
                onPress={() => tomarFoto(comida.id)}
              >
                <Text style={styles.fotoPlaceholderEmoji}>📸</Text>
                <Text style={styles.fotoPlaceholderText}>Toca para añadir foto</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

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
  fechaNav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 16,
    borderWidth: 0.5, borderColor: '#eee',
  },
  fechaBtn: { padding: 8 },
  fechaBtnText: { fontSize: 22, color: '#0F6E56', fontWeight: '300' },
  fechaTexto: { fontSize: 14, fontWeight: '500', color: '#111', textAlign: 'center', flex: 1, textTransform: 'capitalize' },
  comidaCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 0.5, borderColor: '#eee',
  },
  comidaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  comidaEmoji: { fontSize: 20, marginRight: 10 },
  comidaInfo: { flex: 1 },
  comidaLabel: { fontSize: 14, fontWeight: '600', color: '#111' },
  comidaHora: { fontSize: 11, color: '#888', marginTop: 1 },
  btnFoto: {
    backgroundColor: '#f0f0f0', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  btnFotoText: { fontSize: 12, color: '#555', fontWeight: '500' },
  foto: { width: '100%', height: 200, borderRadius: 8 },
  fotoHint: { fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 4 },
  fotoPlaceholder: {
    height: 120, borderRadius: 8, borderWidth: 1, borderColor: '#eee',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  fotoPlaceholderEmoji: { fontSize: 28, marginBottom: 6 },
  fotoPlaceholderText: { fontSize: 12, color: '#aaa' },
})