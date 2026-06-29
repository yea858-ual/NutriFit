import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl, Share
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../api/http'

const STORAGE_KEY = 'nutrifit_lista_compra'

const NOMBRE_CATEGORIA: Record<string, string> = {
  carne: 'Carne', pescado: 'Pescado', marisco: 'Marisco', huevo: 'Huevo',
  lacteo: 'Lácteo', bebida_vegetal: 'Bebida vegetal', verdura: 'Verdura',
  legumbre: 'Legumbre', cereal_desayuno: 'Cereales desayuno',
  cereal_comida: 'Cereales comida', fruta: 'Fruta', frutos_secos: 'Frutos secos',
  semillas: 'Semillas', grasa: 'Grasa', grasa_vegetal: 'Grasa vegetal',
  embutido: 'Embutido', conserva: 'Conserva', condimento: 'Condimento',
}

export default function ListaCompra() {
  const insets = useSafeAreaInsets()
  const [lista, setLista] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [marcados, setMarcados] = useState<Record<string, boolean>>({})
  const [refreshing, setRefreshing] = useState(false)

  const cargarMarcados = async () => {
    const guardados = await AsyncStorage.getItem(STORAGE_KEY)
    if (guardados) setMarcados(JSON.parse(guardados))
  }

  const cargarLista = async () => {
    try {
      const res = await api.post('/menu/compra')
      setLista(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarMarcados()
    cargarLista()
  }, [])

  const onRefresh = async () => {
    setRefreshing(true)
    await cargarLista()
    setRefreshing(false)
  }

  const toggleMarcado = async (key: string) => {
    const nuevos = { ...marcados, [key]: !marcados[key] }
    setMarcados(nuevos)
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevos))
  }

  const limpiar = async () => {
    setMarcados({})
    await AsyncStorage.removeItem(STORAGE_KEY)
  }

  const compartir = async () => {
    if (!lista) return
    let texto = '🛒 Lista de la compra NutriFit\n\n'
    lista.categorias.forEach((cat: any) => {
      texto += `${nombreCategoria(cat.categoria).toUpperCase()}\n`
      cat.items.forEach((item: any) => {
        const marcado = marcados[`${cat.categoria}-${item.nombre}`]
        texto += `${marcado ? '✅' : '◻️'} ${item.nombre} - ${item.cantidad_legible}\n`
      })
      texto += '\n'
    })
    await Share.share({ message: texto })
  }

  const nombreCategoria = (cat: string) =>
    NOMBRE_CATEGORIA[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)

  const totalMarcados = Object.values(marcados).filter(Boolean).length

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

      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0F6E56" />}
      >
        <View style={styles.content}>

          {/* Cabecera */}
          <View style={styles.header}>
            <View>
              <Text style={styles.titulo}>Lista de la compra</Text>
              {lista && (
                <Text style={styles.subtitulo}>
                  {lista.total_ingredientes} ingredientes · {totalMarcados} marcados
                </Text>
              )}
            </View>
            <View style={styles.headerBtns}>
              <TouchableOpacity style={styles.btnIcon} onPress={compartir}>
                <Text style={styles.btnIconText}>Compartir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnIcon} onPress={limpiar}>
                <Text style={styles.btnIconText}>Limpiar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {lista?.categorias.map((cat: any) => (
            <View key={cat.categoria} style={styles.categoriaSection}>
              <Text style={styles.categoriaTitulo}>
                {nombreCategoria(cat.categoria)} ({cat.total_items})
              </Text>
              <View style={styles.categoriaCard}>
                {cat.items.map((item: any, idx: number) => {
                  const key = `${cat.categoria}-${item.nombre}`
                  const marcado = marcados[key]
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.itemRow,
                        idx < cat.items.length - 1 && styles.itemBorder,
                        marcado && styles.itemMarcado
                      ]}
                      onPress={() => toggleMarcado(key)}
                    >
                      <View style={[styles.checkbox, marcado && styles.checkboxMarcado]}>
                        {marcado && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                      <Text style={[styles.itemNombre, marcado && styles.itemNombreMarcado]}>
                        {item.nombre}
                      </Text>
                      <View style={styles.cantidadBadge}>
                        <Text style={styles.cantidadText}>{item.cantidad_legible}</Text>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>
          ))}
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
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#0F6E56',
    alignItems: 'center', justifyContent: 'center', marginRight: 8,
  },
  headerLogoText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  headerTitle: { fontSize: 16, fontWeight: '600', color: '#0F6E56' },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  titulo: { fontSize: 22, fontWeight: '600', color: '#111' },
  subtitulo: { fontSize: 12, color: '#888', marginTop: 2 },
  headerBtns: { flexDirection: 'row', gap: 8 },
  btnIcon: {
    backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  btnIconText: { fontSize: 12, color: '#555' },
  categoriaSection: { marginBottom: 20 },
  categoriaTitulo: {
    fontSize: 11, fontWeight: '600', color: '#0F6E56',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  categoriaCard: {
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 0.5, borderColor: '#eee', overflow: 'hidden',
  },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  itemBorder: { borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  itemMarcado: { backgroundColor: '#fafafa' },
  checkbox: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  checkboxMarcado: { backgroundColor: '#0F6E56', borderColor: '#0F6E56' },
  checkmark: { color: '#fff', fontSize: 11, fontWeight: '700' },
  itemNombre: { flex: 1, fontSize: 13, color: '#333' },
  itemNombreMarcado: { color: '#bbb', textDecorationLine: 'line-through' },
  cantidadBadge: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  cantidadText: { fontSize: 12, color: '#999' },
})