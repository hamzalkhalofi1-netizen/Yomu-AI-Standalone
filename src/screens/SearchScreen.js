import React, { useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator, FlatList, Image, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { searchMangaByTitle, fetchMangaFromUrl, sanitizeUrl } from '../utils/scraper';
import { useManga } from '../context/MangaContext';

const BG = '#0f0f1a';
const CARD = '#16213e';
const ACCENT = '#e94560';

function ModeToggle({ mode, onChange }) {
  return (
    <View style={toggle.wrapper}>
      <TouchableOpacity
        style={[toggle.btn, mode === 'title' && toggle.btnActive]}
        onPress={() => onChange('title')}
      >
        <Text style={styles.modeIcon}>🔍</Text>
        <Text style={[toggle.text, mode === 'title' && toggle.textActive]}> Par titre</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[toggle.btn, mode === 'url' && toggle.btnActive]}
        onPress={() => onChange('url')}
      >
        <Text style={styles.modeIcon}>🔗</Text>
        <Text style={[toggle.text, mode === 'url' && toggle.textActive]}> Par URL</Text>
      </TouchableOpacity>
    </View>
  );
}

function UrlResultCard({ manga, onAdd, isAdded }) {
  return (
    <View style={urc.card}>
      {manga.cover ? (
        <Image source={{ uri: manga.cover }} style={urc.cover} resizeMode="cover" />
      ) : (
        <View style={[urc.cover, urc.coverPlaceholder]}>
          <Text style={{ fontSize: 32 }}>📖</Text>
        </View>
      )}
      <View style={urc.info}>
        <Text style={urc.title}>{manga.title}</Text>
        {manga.genre ? <Text style={urc.genre}>{manga.genre}</Text> : null}
        {manga.rating ? (
          <Text style={urc.rating}>★ {manga.rating}</Text>
        ) : null}
        {manga.status ? (
          <Text style={urc.status}>{manga.status}</Text>
        ) : null}
        {manga.description ? (
          <Text style={urc.desc} numberOfLines={3}>{manga.description}</Text>
        ) : null}
        {manga.chapters?.length > 0 && (
          <View style={urc.pills}>
            <View style={urc.pill}>
              <Text style={urc.pillText}>{manga.chapters.length} chapitres</Text>
            </View>
          </View>
        )}
        <TouchableOpacity
          style={[urc.addBtn, isAdded && urc.addBtnDone]}
          onPress={() => !isAdded && onAdd(manga)}
        >
          <Text style={urc.addBtnText}>
            {isAdded ? '✓ Dans la bibliothèque' : '+ Ajouter à la bibliothèque'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { library, addToLibrary, isInLibrary } = useManga();

  const [mode, setMode] = useState('title');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [urlResult, setUrlResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceTimer = useRef(null);

  const handleTitleChange = useCallback((text) => {
    setQuery(text);
    setError(null);
    clearTimeout(debounceTimer.current);
    if (!text.trim()) { setResults([]); return; }
    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      const res = await searchMangaByTitle(text);
      setLoading(false);
      if (Array.isArray(res)) { setResults(res); }
      else { setError(res.error || 'Erreur de recherche.'); setResults([]); }
    }, 600);
  }, []);

  const handleUrlSearch = useCallback(async () => {
    const { error: ve } = sanitizeUrl(query);
    if (ve) { setError(ve); return; }
    setLoading(true); setUrlResult(null); setError(null);
    const res = await fetchMangaFromUrl(query);
    setLoading(false);
    if (res.error) { setError(res.error); }
    else { setUrlResult(res); }
  }, [query]);

  const handleModeChange = (m) => {
    setMode(m); setQuery(''); setResults([]); setUrlResult(null); setError(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Recherche</Text>
      <ModeToggle mode={mode} onChange={handleModeChange} />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={mode === 'title' ? 'Titre du manga...' : 'https://mangadex.org/title/...'}
          placeholderTextColor="#4a4a6a"
          value={query}
          onChangeText={mode === 'title' ? handleTitleChange : setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={mode === 'url' ? 'search' : 'default'}
          onSubmitEditing={mode === 'url' ? handleUrlSearch : undefined}
        />
        {mode === 'url' && (
          <TouchableOpacity style={styles.searchBtn} onPress={handleUrlSearch}>
            <Text style={styles.searchBtnText}>OK</Text>
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={ACCENT} size="small" />
          <Text style={styles.loadingText}>
            {mode === 'url' ? 'Extraction en cours...' : 'Recherche...'}
          </Text>
        </View>
      )}

      {mode === 'url' && urlResult && (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <UrlResultCard
            manga={urlResult}
            isAdded={isInLibrary(urlResult.id)}
            onAdd={(m) => {
              addToLibrary(m);
              navigation.navigate('Bibliothèque');
            }}
          />
        </ScrollView>
      )}

      {mode === 'title' && (
        <FlatList
          data={results}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            !loading && query.trim().length > 0 && !error ? (
              <Text style={styles.emptyText}>Aucun résultat pour « {query} »</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Detail', { manga: item })}
            >
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={styles.resultCover} resizeMode="cover" />
              ) : (
                <View style={[styles.resultCover, styles.resultCoverPlaceholder]}>
                  <Text style={{ fontSize: 24 }}>📖</Text>
                </View>
              )}
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>{item.title}</Text>
                {item.genre ? <Text style={styles.resultGenre} numberOfLines={1}>{item.genre}</Text> : null}
                {item.rating ? <Text style={styles.resultRating}>★ {item.rating}</Text> : null}
                <Text style={styles.resultStatus}>{item.status}</Text>
                {item.chapters?.length > 0 && (
                  <Text style={styles.resultChapters}>{item.chapters.length} ch.</Text>
                )}
                <TouchableOpacity
                  style={[styles.addSmall, isInLibrary(item.id) && styles.addSmallDone]}
                  onPress={() => !isInLibrary(item.id) && addToLibrary(item)}
                >
                  <Text style={styles.addSmallText}>
                    {isInLibrary(item.id) ? '✓ Ajouté' : '+ Bibliothèque'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerTitle: {
    color: '#fff', fontSize: 22, fontWeight: 'bold',
    marginHorizontal: 16, marginBottom: 16, marginTop: 8,
  },
  modeIcon: { fontSize: 14 },
  inputRow: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12 },
  input: {
    flex: 1, backgroundColor: CARD, color: '#fff', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    borderWidth: 1, borderColor: '#1e2a4a',
  },
  searchBtn: {
    backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 18,
    alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  errorBox: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: 'rgba(233,69,96,0.15)',
    borderRadius: 10, padding: 10, borderWidth: 1, borderColor: ACCENT,
  },
  errorText: { color: ACCENT, fontSize: 13 },
  loadingBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 8 },
  loadingText: { color: '#a0a0b0', fontSize: 13, marginLeft: 8 },
  emptyText: { color: '#a0a0b0', fontSize: 14, textAlign: 'center', marginTop: 40 },
  resultCard: {
    flexDirection: 'row', backgroundColor: CARD,
    borderRadius: 12, marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1e2a4a',
  },
  resultCover: { width: 80, height: 120 },
  resultCoverPlaceholder: { backgroundColor: '#1a2a4a', alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, padding: 10, justifyContent: 'space-between' },
  resultTitle: { color: '#fff', fontSize: 14, fontWeight: '700', lineHeight: 18 },
  resultGenre: { color: '#a0a0b0', fontSize: 11, marginTop: 3 },
  resultRating: { color: ACCENT, fontSize: 11, fontWeight: 'bold', marginTop: 2 },
  resultStatus: { color: '#4a90e2', fontSize: 11, marginTop: 2 },
  resultChapters: { color: '#a0a0b0', fontSize: 11, marginTop: 2 },
  addSmall: {
    marginTop: 6, backgroundColor: ACCENT, borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  addSmallDone: { backgroundColor: '#1e4a2a' },
  addSmallText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
});

const toggle = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', backgroundColor: CARD,
    borderRadius: 10, padding: 3, marginHorizontal: 16, marginBottom: 14,
  },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, borderRadius: 8,
  },
  btnActive: { backgroundColor: ACCENT },
  text: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  textActive: { color: '#fff' },
});

const urc = StyleSheet.create({
  card: { backgroundColor: CARD, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#1e2a4a' },
  cover: { width: '100%', height: 200 },
  coverPlaceholder: { backgroundColor: '#1a2a4a', alignItems: 'center', justifyContent: 'center' },
  info: { padding: 14 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  genre: { color: '#a0a0b0', fontSize: 12, marginBottom: 4 },
  rating: { color: ACCENT, fontWeight: 'bold', fontSize: 13, marginBottom: 4 },
  status: { color: '#4a90e2', fontSize: 12, marginBottom: 6 },
  desc: { color: 'rgba(255,255,255,0.75)', fontSize: 13, lineHeight: 19, marginBottom: 10 },
  pills: { flexDirection: 'row', marginBottom: 10 },
  pill: {
    backgroundColor: '#1e2a4a', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  pillText: { color: '#a0a0b0', fontSize: 11 },
  addBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', marginTop: 6,
  },
  addBtnDone: { backgroundColor: '#1e4a2a' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
