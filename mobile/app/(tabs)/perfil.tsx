import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/http'

const OBJETIVOS = [
  { valor: 'perder_peso', label: 'Perder peso' },
  { valor: 'mantenimiento', label: 'Mantenimiento' },
  { valor: 'ganar_musculo', label: 'Ganar músculo' },
]

const ACTIVIDADES = [
  { valor: 'sedentario', label: 'Sedentario' },
  { valor: 'ligero', label: 'Ligero (1-2 días/sem)' },
  { valor: 'moderado', label: 'Moderado (3-4 días/sem)' },
  { valor: 'activo', label: 'Activo (5-6 días/sem)' },
  { valor: 'muy_activo', label: 'Muy activo (diario)' },
]

const INTOLERANCIAS = [
  { name: 'intolerancia_gluten', label: 'Sin gluten' },
  { name: 'intolerancia_lactosa', label: 'Sin lactosa' },
  { name: 'alergia_frutos_secos', label: 'Sin frutos secos' },
  { name: 'dieta_vegetariana', label: 'Vegetariano' },
  { name: 'dieta_vegana', label: 'Vegano' },
]

export default function Perfil() {
  const router = useRouter()
  const { recargarUsuario, logout } = useAuth()
  const insets = useSafeAreaInsets()
  const [form, setForm] = useState({
    edad: '', peso_kg: '', altura_cm: '', sexo: 'hombre',
    nivel_actividad: 'moderado', objetivo: 'mantenimiento',
    intolerancia_gluten: false, intolerancia_lactosa: false,
    alergia_frutos_secos: false, dieta_vegetariana: false, dieta_vegana: false,
  })
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await api.get('/users/me')
        setForm({
          edad: res.data.edad?.toString() || '',
          peso_kg: res.data.peso_kg?.toString() || '',
          altura_cm: res.data.altura_cm?.toString() || '',
          sexo: res.data.sexo || 'hombre',
          nivel_actividad: res.data.nivel_actividad || 'moderado',
          objetivo: res.data.objetivo || 'mantenimiento',
          intolerancia_gluten: res.data.intolerancia_gluten || false,
          intolerancia_lactosa: res.data.intolerancia_lactosa || false,
          alergia_frutos_secos: res.data.alergia_frutos_secos || false,
          dieta_vegetariana: res.data.dieta_vegetariana || false,
          dieta_vegana: res.data.dieta_vegana || false,
        })
      } catch (err) {
        console.error(err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const guardar = async () => {
    setGuardando(true)
    setError('')
    try {
      await api.put('/users/me', {
        ...form,
        edad: parseInt(form.edad),
        peso_kg: parseFloat(form.peso_kg),
        altura_cm: parseFloat(form.altura_cm),
      })
      await api.post('/nutrition/calcular')
      await recargarUsuario()
      router.push('/(tabs)/dashboard')
    } catch (err) {
      setError('Error al guardar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  const eliminarCuenta = () => {
    Alert.alert(
      'Eliminar cuenta',
      '¿Estás seguro? Esta acción eliminará tu cuenta y todos tus datos de forma permanente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar', style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/users/me')
              await logout()
            } catch (err) {
              setError('Error al eliminar la cuenta')
            }
          }
        }
      ]
    )
  }

  const toggle = (campo: string) =>
    setForm(prev => ({ ...prev, [campo]: !prev[campo as keyof typeof prev] }))

  const pillStyle = (activo: boolean) => ({
    ...styles.pill,
    backgroundColor: activo ? '#0F6E56' : '#f0f0f0',
  })

  const pillTextStyle = (activo: boolean) => ({
    ...styles.pillText,
    color: activo ? '#fff' : '#666',
    fontWeight: activo ? '500' as const : '400' as const,
  })

  if (cargando) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#0F6E56" />
    </View>
  )

  return (
    <View style={styles.wrapper}>

      {/* Header */}
      <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerLogo}>
          <Text style={styles.headerLogoText}>N</Text>
        </View>
        <Text style={styles.headerTitle}>NutriFit</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>

            <Text style={styles.titulo}>Mi perfil</Text>
            <Text style={styles.subtitulo}>Actualiza tus datos para recalcular tu plan</Text>

            {/* Datos físicos */}
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>DATOS FÍSICOS</Text>
              <View style={styles.gridTres}>
                {[
                  { name: 'edad', label: 'Edad', placeholder: '22' },
                  { name: 'peso_kg', label: 'Peso (kg)', placeholder: '70' },
                  { name: 'altura_cm', label: 'Altura (cm)', placeholder: '175' },
                ].map(f => (
                  <View key={f.name} style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{f.label}</Text>
                    <TextInput
                      style={styles.input}
                      value={form[f.name as keyof typeof form] as string}
                      onChangeText={v => setForm(prev => ({ ...prev, [f.name]: v }))}
                      placeholder={f.placeholder}
                      placeholderTextColor="#ccc"
                      keyboardType="numeric"
                    />
                  </View>
                ))}
              </View>
            </View>

            {/* Sexo */}
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>SEXO</Text>
              <View style={styles.pillsRow}>
                {['hombre', 'mujer'].map(s => (
                  <TouchableOpacity
                    key={s}
                    style={pillStyle(form.sexo === s)}
                    onPress={() => setForm(prev => ({ ...prev, sexo: s }))}
                  >
                    <Text style={pillTextStyle(form.sexo === s)}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Objetivo */}
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>OBJETIVO</Text>
              <View style={styles.pillsRow}>
                {OBJETIVOS.map(o => (
                  <TouchableOpacity
                    key={o.valor}
                    style={pillStyle(form.objetivo === o.valor)}
                    onPress={() => setForm(prev => ({ ...prev, objetivo: o.valor }))}
                  >
                    <Text style={pillTextStyle(form.objetivo === o.valor)}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Nivel de actividad */}
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>NIVEL DE ACTIVIDAD</Text>
              <View style={styles.pillsRow}>
                {ACTIVIDADES.map(a => (
                  <TouchableOpacity
                    key={a.valor}
                    style={pillStyle(form.nivel_actividad === a.valor)}
                    onPress={() => setForm(prev => ({ ...prev, nivel_actividad: a.valor }))}
                  >
                    <Text style={pillTextStyle(form.nivel_actividad === a.valor)}>{a.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Intolerancias */}
            <View style={styles.card}>
              <Text style={styles.cardTitulo}>INTOLERANCIAS Y PREFERENCIAS</Text>
              <View style={styles.pillsRow}>
                {INTOLERANCIAS.map(item => (
                  <TouchableOpacity
                    key={item.name}
                    style={pillStyle(form[item.name as keyof typeof form] as boolean)}
                    onPress={() => toggle(item.name)}
                  >
                    <Text style={pillTextStyle(form[item.name as keyof typeof form] as boolean)}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <TouchableOpacity
              style={[styles.btnGuardar, guardando && { opacity: 0.7 }]}
              onPress={guardar}
              disabled={guardando}
            >
              {guardando
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnGuardarText}>Guardar perfil</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnLogout} onPress={logout}>
              <Text style={styles.btnLogoutText}>Cerrar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnEliminar} onPress={eliminarCuenta}>
              <Text style={styles.btnEliminarText}>Eliminar cuenta permanentemente</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#0F6E56',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  headerLogoText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#0F6E56' },
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: '600', color: '#111', marginBottom: 2 },
  subtitulo: { fontSize: 13, color: '#888', marginBottom: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 0.5, borderColor: '#eee',
  },
  cardTitulo: {
    fontSize: 11, fontWeight: '600', color: '#0F6E56',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12,
  },
  gridTres: { flexDirection: 'row', gap: 10 },
  inputGroup: { flex: 1 },
  inputLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  input: {
    borderWidth: 0.5, borderColor: '#ddd', borderRadius: 8,
    padding: 10, fontSize: 13, color: '#111',
  },
  pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  pillText: { fontSize: 12 },
  error: { fontSize: 12, color: '#e53e3e', marginBottom: 12 },
  btnGuardar: {
    backgroundColor: '#0F6E56', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 12,
  },
  btnGuardarText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  btnLogout: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 10,
    borderWidth: 0.5, borderColor: '#ddd',
  },
  btnLogoutText: { color: '#555', fontSize: 14, fontWeight: '500' },
  btnEliminar: {
    borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 0.5, borderColor: '#e53e3e',
  },
  btnEliminarText: { color: '#e53e3e', fontSize: 13 },
})