import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState, useEffect, useRef } from 'react'
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, Image,
  KeyboardAvoidingView, Platform
} from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import AsyncStorage from '@react-native-async-storage/async-storage'
import api from '../../api/http'

const STORAGE_KEY = 'nutrifit_buscador'

export default function Buscador() {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')
  const [resultados, setResultados] = useState<any[]>([])
  const [resultadosOFF, setResultadosOFF] = useState<any[]>([])
  const [seleccionado, setSeleccionado] = useState<any>(null)
  const [gramos, setGramos] = useState('100')
  const [cargando, setCargando] = useState(false)
  const [cargandoOFF, setCargandoOFF] = useState(false)
  const [haBuscado, setHaBuscado] = useState(false)
  const [escaner, setEscaner] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const escaneando = useRef(false)

  useEffect(() => {
    const cargar = async () => {
      const guardado = await AsyncStorage.getItem(STORAGE_KEY)
      if (guardado) {
        const { query: q, resultados: r, resultadosOFF: rOFF } = JSON.parse(guardado)
        setQuery(q || '')
        setResultados(r || [])
        setResultadosOFF(rOFF || [])
        if (r?.length > 0 || rOFF?.length > 0) setHaBuscado(true)
      }
    }
    cargar()
  }, [])

  const guardar = async (q: string, r: any[], rOFF: any[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ query: q, resultados: r, resultadosOFF: rOFF }))
  }

  const buscar = async () => {
    if (!query.trim()) return
    setCargando(true)
    setHaBuscado(true)
    setResultados([])
    setResultadosOFF([])
    setSeleccionado(null)

    try {
      const res = await api.get(`/alimentos/buscar?q=${query}`)
      setResultados(res.data)
      guardar(query, res.data, [])
    } catch (err) {}
    finally { setCargando(false) }

    setCargandoOFF(true)
    try {
      const res = await api.get(`/alimentos/openfoodfacts/buscar?q=${query}`)
      setResultadosOFF(res.data)
      guardar(query, resultados, res.data)
    } catch (err) {}
    finally { setCargandoOFF(false) }
  }

  const abrirEscaner = async () => {
    if (!permission?.granted) {
      await requestPermission()
    }
    escaneando.current = false
    setEscaner(true)
  }

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (escaneando.current) return
    escaneando.current = true
    setEscaner(false)
    setQuery(data)
    setCargandoOFF(true)
    setHaBuscado(true)
    setResultados([])
    setResultadosOFF([])
    try {
      const res = await api.get(`/alimentos/openfoodfacts/buscar?q=${data}`)
      setResultadosOFF(res.data)
    } catch (err) {}
    finally { setCargandoOFF(false) }
  }

  const calcular = (alimento: any) => {
    const factor = parseFloat(gramos) / 100
    return {
      kcal: Math.round((alimento.kcal_100g || 0) * factor),
      proteinas: Math.round((alimento.proteinas_100g || 0) * factor * 10) / 10,
      carbohidratos: Math.round((alimento.carbohidratos_100g || 0) * factor * 10) / 10,
      grasas: Math.round((alimento.grasas_100g || 0) * factor * 10) / 10,
    }
  }

  if (escaner) {
    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.scanner}
          facing="back"
          onBarcodeScanned={onBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a'] }}
        />
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame} />
          <Text style={styles.scannerText}>Apunta al código de barras del producto</Text>
          <TouchableOpacity style={styles.btnCerrarScanner} onPress={() => setEscaner(false)}>
            <Text style={styles.btnCerrarScannerText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

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

            <Text style={styles.titulo}>Buscador</Text>
            <Text style={styles.subtitulo}>Busca alimentos y calcula sus macros</Text>

            {/* Barra de búsqueda */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={buscar}
                placeholder="Buscar alimento... ej: pollo, arroz"
                placeholderTextColor="#aaa"
                returnKeyType="search"
              />
              <TouchableOpacity style={styles.btnBuscar} onPress={buscar} disabled={cargando}>
                <Text style={styles.btnBuscarText}>{cargando ? '...' : 'Buscar'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnScanner} onPress={abrirEscaner}>
                <Text style={styles.btnScannerText}>📷</Text>
              </TouchableOpacity>
            </View>

            {/* Resultados */}
            {!seleccionado && haBuscado && (
              <>
                {resultados.length > 0 && (
                  <View style={styles.seccion}>
                    <Text style={styles.seccionTitulo}>Base de datos NutriFit ({resultados.length})</Text>
                    <View style={styles.lista}>
                      {resultados.map((a: any) => (
                        <TouchableOpacity
                          key={a.id}
                          style={styles.itemRow}
                          onPress={() => { setSeleccionado({ ...a, fuente: 'local' }); setGramos('100') }}
                        >
                          <View style={styles.localBadge}>
                            <Text style={styles.localBadgeText}>LOCAL</Text>
                          </View>
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemNombre}>{a.nombre}</Text>
                            <Text style={styles.itemCategoria}>{a.categoria}</Text>
                          </View>
                          <Text style={styles.itemKcal}>{a.kcal_100g} kcal/100g</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {cargandoOFF && (
                  <Text style={styles.buscandoOFF}>Buscando en OpenFoodFacts...</Text>
                )}

                {!cargandoOFF && resultadosOFF.length > 0 && (
                  <View style={styles.seccion}>
                    <Text style={[styles.seccionTitulo, { color: '#4F46E5' }]}>
                      OpenFoodFacts ({resultadosOFF.length})
                    </Text>
                    <View style={styles.lista}>
                      {resultadosOFF.map((a: any, idx: number) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.itemRow}
                          onPress={() => { setSeleccionado({ ...a, fuente: 'off' }); setGramos('100') }}
                        >
                          {a.imagen_url ? (
                            <Image source={{ uri: a.imagen_url }} style={styles.productImage} />
                          ) : (
                            <View style={styles.offBadge}>
                              <Text style={styles.offBadgeText}>OFF</Text>
                            </View>
                          )}
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemNombre}>{a.nombre}</Text>
                            <Text style={styles.itemCategoria}>{a.marca || 'OpenFoodFacts'}</Text>
                          </View>
                          <Text style={[styles.itemKcal, { color: '#4F46E5' }]}>
                            {a.kcal_100g} kcal/100g
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {!cargando && !cargandoOFF && resultados.length === 0 && resultadosOFF.length === 0 && (
                  <Text style={styles.sinResultados}>No se encontraron resultados para "{query}"</Text>
                )}
              </>
            )}

            {/* Calculadora de macros */}
            {seleccionado && (
              <View style={styles.calculadora}>
                <TouchableOpacity onPress={() => setSeleccionado(null)} style={styles.btnVolver}>
                  <Text style={styles.btnVolverText}>← Volver</Text>
                </TouchableOpacity>

                <View style={styles.calcCard}>
                  <View style={styles.calcHeader}>
                    {seleccionado.fuente === 'off' && seleccionado.imagen_url ? (
                      <Image source={{ uri: seleccionado.imagen_url }} style={styles.calcImage} />
                    ) : seleccionado.fuente === 'local' ? (
                      <View style={styles.localBadge}>
                        <Text style={styles.localBadgeText}>LOCAL</Text>
                      </View>
                    ) : (
                      <View style={styles.offBadge}>
                        <Text style={styles.offBadgeText}>OFF</Text>
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.calcNombre}>{seleccionado.nombre}</Text>
                      <Text style={styles.calcCategoria}>
                        {seleccionado.fuente === 'local' ? seleccionado.categoria : seleccionado.marca || 'OpenFoodFacts'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.gramosRow}>
                    <Text style={styles.gramosLabel}>Cantidad (g)</Text>
                    <TextInput
                      style={styles.gramosInput}
                      value={gramos}
                      onChangeText={setGramos}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.macrosGrid}>
                    {(() => {
                      const m = calcular(seleccionado)
                      return [
                        { label: 'Calorías', valor: m.kcal, unit: 'kcal', color: '#0F6E56' },
                        { label: 'Proteínas', valor: m.proteinas, unit: 'g', color: '#185FA5' },
                        { label: 'Carbos', valor: m.carbohidratos, unit: 'g', color: '#BA7517' },
                        { label: 'Grasas', valor: m.grasas, unit: 'g', color: '#444' },
                      ].map(d => (
                        <View key={d.label} style={styles.macroCard}>
                          <Text style={styles.macroLabel}>{d.label}</Text>
                          <Text style={[styles.macroValor, { color: d.color }]}>
                            {d.valor}<Text style={styles.macroUnit}>{d.unit}</Text>
                          </Text>
                        </View>
                      ))
                    })()}
                  </View>
                </View>
              </View>
            )}
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
  titulo: { fontSize: 22, fontWeight: '600', color: '#111', marginBottom: 2 },
  subtitulo: { fontSize: 13, color: '#888', marginBottom: 16 },
  searchRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  input: {
    flex: 1, borderWidth: 0.5, borderColor: '#ddd', borderRadius: 10,
    padding: 12, fontSize: 13, color: '#111', backgroundColor: '#fff',
  },
  btnBuscar: { backgroundColor: '#0F6E56', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  btnBuscarText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnScanner: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, justifyContent: 'center', borderWidth: 0.5, borderColor: '#ddd' },
  btnScannerText: { fontSize: 18 },
  seccion: { marginBottom: 16 },
  seccionTitulo: { fontSize: 11, fontWeight: '600', color: '#0F6E56', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  lista: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 0.5, borderColor: '#eee', overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#f5f5f5' },
  localBadge: { backgroundColor: '#E1F5EE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 10 },
  localBadgeText: { fontSize: 9, fontWeight: '700', color: '#0F6E56' },
  offBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 10 },
  offBadgeText: { fontSize: 9, fontWeight: '700', color: '#4F46E5' },
  productImage: { width: 36, height: 36, borderRadius: 6, marginRight: 10 },
  itemInfo: { flex: 1 },
  itemNombre: { fontSize: 13, fontWeight: '500', color: '#111' },
  itemCategoria: { fontSize: 11, color: '#888' },
  itemKcal: { fontSize: 12, fontWeight: '500', color: '#0F6E56' },
  buscandoOFF: { fontSize: 12, color: '#888', textAlign: 'center', marginVertical: 8 },
  sinResultados: { fontSize: 13, color: '#888', textAlign: 'center', paddingVertical: 40 },
  calculadora: { marginTop: 8 },
  btnVolver: { marginBottom: 12 },
  btnVolverText: { fontSize: 13, color: '#888' },
  calcCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#eee' },
  calcHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  calcImage: { width: 48, height: 48, borderRadius: 8 },
  calcNombre: { fontSize: 15, fontWeight: '500', color: '#111' },
  calcCategoria: { fontSize: 11, color: '#888' },
  gramosRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  gramosLabel: { fontSize: 12, color: '#555' },
  gramosInput: { borderWidth: 0.5, borderColor: '#ddd', borderRadius: 8, padding: 8, fontSize: 13, color: '#111', width: 100 },
  macrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  macroCard: { backgroundColor: '#f8f8f8', borderRadius: 8, padding: 12, width: '47%', alignItems: 'center' },
  macroLabel: { fontSize: 11, color: '#888', marginBottom: 4 },
  macroValor: { fontSize: 20, fontWeight: '500' },
  macroUnit: { fontSize: 11, color: '#aaa', fontWeight: '400' },
  scannerContainer: { flex: 1 },
  scanner: { flex: 1 },
  scannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  scannerFrame: { width: 250, height: 150, borderWidth: 2, borderColor: '#0F6E56', borderRadius: 12, marginBottom: 20 },
  scannerText: { color: '#fff', fontSize: 14, textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8, marginBottom: 20 },
  btnCerrarScanner: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  btnCerrarScannerText: { fontSize: 14, fontWeight: '600', color: '#333' },
})