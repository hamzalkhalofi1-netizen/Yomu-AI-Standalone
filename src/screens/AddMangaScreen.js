import React, { useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchMangaFromUrl, sanitizeUrl } from '../utils/scraper';
import { useManga } from '../context/MangaContext';

const BG = '#0f0f1a';
const CARD = '#16213e';
const ACCENT = '#e94560';

const EXAMPLES = [
  'https://mangadex.org/title/...',
  'https://www.manga-scan.fr/manga/...',
  'https://lectormanga.com/library/...',
];

export default function AddMangaScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { addToLibrary, isInLibrary } = useManga();

  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleFetch = async () => {
    const { error: ve } = sanitizeUrl(url);
    if (ve) { setError(ve); return; }
    setLoading(true); setError(null); setResult(null);
    const res = await fetchMangaFromUrl(url);
    setLoading(false);
    if (res.error) { setError(res.error); }
    else { setResult(res); }
  };

  const handleAdd = () => {
    if (!result) return;
    addToLibrary(result);
    navigation.navigate('Bibliothèque');
  };

  const alreadyAdded = result && isInLibrary(result.id);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Importer un manga</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>URL du manga</Text>
        <TextInput
          style={styles.input}
          placeholder="https://mangadex.org/title/..."
          placeholderTextColor="#4a4a6a"
          value={url}
          onChangeText={(t) => { setUrl(t); setError(null); setResult(null); }}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleFetch}
        />

        <Text style={styles.hint}>
          Exemples de sources compatibles :
        </Text>
        {EXAMPLES.map((ex, i) => (
          <TouchableOpacity key={i} onPress={() => setUrl(ex)}>
            <Text style={styles.example}>• {ex}</Text>
          </TouchableOpacity>
        ))}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.fetchBtn, loading && styles.fetchBtnLoading]}
          onPress={handleFetch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.fetchBtnText}>🔍 Extraire les informations</Text>
          )}
        </TouchableOpacity>

        {loading && (
          <Text style={styles.loadingHint}>
            Connexion via proxy CORS... Cela peut prendre 10–15 secondes.
          </Text>
        )}

        {result && (
          <View style={styles.resultCard}>
            {result.cover ? (
              <Image source={{ uri: result.cover }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={[styles.cover, styles.coverPlaceholder]}>
                <Text style={{ fontSize: 48 }}>📖</Text>
              </View>
            )}
            <Text style={styles.resultTitle}>{result.title}</Text>
            {result.genre ? <Text style={styles.resultMeta}>{result.genre}</Text> : null}
            {result.status ? <Text style={styles.resultStatus}>{result.status}</Text> : null}
            {result.rating ? <Text style={styles.resultRating}>★ {result.rating}</Text> : null}
            {result.description ? (
              <Text style={styles.resultDesc} numberOfLines={4}>{result.description}</Text>
            ) : null}
            {result.chapters?.length > 0 && (
              <View style={styles.chapterBadge}>
                <Text style={styles.chapterBadgeText}>{result.chapters.length} chapitres trouvés</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.addBtn, alreadyAdded && styles.addBtnDone]}
              onPress={alreadyAdded ? undefined : handleAdd}
            >
              <Text style={styles.addBtnText}>
                {alreadyAdded ? '✓ Déjà dans la bibliothèque' : '+ Ajouter à la bibliothèque'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14, marginTop: 8,
  },
  backBtn: { paddingVertical: 4 },
  backBtnText: { color: ACCENT, fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  body: { padding: 16 },
  label: { color: '#a0a0b0', fontSize: 13, marginBottom: 8 },
  input: {
    backgroundColor: CARD, color: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    borderWidth: 1, borderColor: '#1e2a4a', marginBottom: 14,
  },
  hint: { color: '#4a4a6a', fontSize: 12, marginBottom: 6 },
  example: { color: '#4a90e2', fontSize: 12, marginBottom: 4 },
  errorBox: {
    backgroundColor: 'rgba(233,69,96,0.15)', borderRadius: 10,
    padding: 10, marginVertical: 10, borderWidth: 1, borderColor: ACCENT,
  },
  errorText: { color: ACCENT, fontSize: 13 },
  fetchBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 14,
  },
  fetchBtnLoading: { backgroundColor: '#a0325a' },
  fetchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  loadingHint: { color: '#a0a0b0', fontSize: 12, textAlign: 'center', marginTop: 10 },
  resultCard: {
    marginTop: 24, backgroundColor: CARD,
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1e2a4a', paddingBottom: 16,
  },
  cover: { width: '100%', height: 220 },
  coverPlaceholder: { backgroundColor: '#1a2a4a', alignItems: 'center', justifyContent: 'center' },
  resultTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', padding: 14, paddingBottom: 4 },
  resultMeta: { color: '#a0a0b0', fontSize: 12, paddingHorizontal: 14, marginBottom: 2 },
  resultStatus: { color: '#4a90e2', fontSize: 12, paddingHorizontal: 14, marginBottom: 2 },
  resultRating: { color: ACCENT, fontSize: 13, fontWeight: 'bold', paddingHorizontal: 14, marginBottom: 6 },
  resultDesc: {
    color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19,
    paddingHorizontal: 14, marginBottom: 10,
  },
  chapterBadge: {
    marginHorizontal: 14, backgroundColor: '#1e2a4a',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    alignSelf: 'flex-start', marginBottom: 12,
  },
  chapterBadgeText: { color: '#a0a0b0', fontSize: 12 },
  addBtn: {
    marginHorizontal: 14, backgroundColor: ACCENT,
    borderRadius: 12, paddingVertical: 12, alignItems: 'center',
  },
  addBtnDone: { backgroundColor: '#1e4a2a' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});
