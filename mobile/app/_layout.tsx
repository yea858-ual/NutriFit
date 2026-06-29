import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

function RootLayoutNav() {
  const { estaLogueado, cargando } = useAuth()
  const segments = useSegments()
  const router = useRouter()
  const [listo, setListo] = useState(false)

  useEffect(() => {
    setListo(true)
  }, [])

  useEffect(() => {
    if (!listo || cargando) return
    const enAutenticacion = segments[0] === '(auth)'
    if (!estaLogueado && !enAutenticacion) {
      router.replace('/(auth)/login')
    } else if (estaLogueado && enAutenticacion) {
      router.replace('/(tabs)/dashboard')
    }
  }, [estaLogueado, segments, listo, cargando])

  if (cargando) {
    return (
      <View style={styles.splash}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>N</Text>
        </View>
        <Text style={styles.logoTitle}>NutriFit</Text>
        <ActivityIndicator color="rgba(255,255,255,0.7)" style={{ marginTop: 40 }} />
      </View>
    )
  }

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: true }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="notificaciones/index" />
      <Stack.Screen name="pedometro/index" />
      <Stack.Screen name="diario/index" />
    </Stack>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0F6E56',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
})