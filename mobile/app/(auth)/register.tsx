import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/http'

export default function Register() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleRegister = async () => {
    if (!nombre || !email || !password) {
      setError('Por favor rellena todos los campos')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setCargando(true)
    setError('')
    try {
      const res = await api.post('/auth/registro', { nombre, email, password })
      await login(res.data.access_token, {
        nombre: res.data.nombre,
        email: res.data.email,
      })
      router.replace('/(tabs)/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.logoTitle}>NutriFit</Text>
          <Text style={styles.logoSubtitle}>Crea tu cuenta</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>

          <Text style={styles.label}>Nombre completo</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre"
            placeholderTextColor="#aaa"
            autoCapitalize="words"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Contraseña</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#aaa"
            secureTextEntry
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, cargando && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={cargando}
          >
            {cargando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Crear cuenta</Text>
            }
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/(auth)/login" style={styles.link}>
            Inicia sesión
          </Link>
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F6E56',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#111',
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  error: {
    fontSize: 12,
    color: '#e53e3e',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#0F6E56',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
  },
  link: {
    color: '#0F6E56',
    fontWeight: '600',
  },
})