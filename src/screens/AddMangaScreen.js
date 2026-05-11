import React, { useState, useRef } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fetchMangaFromUrl, sanitizeUrl } from '../utils/scraper';
import { useManga } from '../context/MangaContext';

const EXAMPLE_URLS = [
  'https://mangadex.org/title/...',
  'https://mangakakalot.com/manga/...',
  'https://manganelo.com/manga/...',
];

const ACCENT = '#e94560';
const CARD = '#16213e';
const BG = '#0f0f1a';

export default function AddMangaScreen({ navigation }) {
  const { addToLibrary } = useManga();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [added, setAdded] = useState(false);
  const inputRef = useRef(null);

  const clearState = () => {
    setResult(null);
    setErrorMsg(null);
    setAdded(false);
  };

  const handleUrlChange = (text) => {
    setUrl(text);
    clearState();
  };

  const handleSearch = async () => {
    clearState();

    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMsg('Veuillez coller l\'URL d\'une page manga.');
      return;
    }

    const { error: validErr } = sanitizeUrl(trimmed);
    if (validErr) {
      setErrorMsg(validErr);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchMangaFromUrl(trimmed);
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setResult(data);
      }
    } catch {
      setErrorMsg('Une erreur inattendue s\'est produite. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (!result) return;
    addToLibrary(result);
    setAdded(true);
  };

  const handleViewDetail = () => {
    if (!result) return;
    navigation.navigate('Detail', { manga: result });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter un manga</Text>
          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instruction */}
          <View style={styles.infoBox}>
            <Ionicons name="link-outline" size={18} color={ACCENT} />
            <Text style={styles.infoText}>
              Collez l'URL d'une page manga (MangaDex, Mangakakalot, etc.)
            </Text>
          </View>

          {/* URL Input */}
          <View style={styles.inputRow}>
            <View style={[styles.inputWrap, errorMsg && styles.inputWrapError]}>
              <Ionicons name="globe-outline" size={18} color="#a0a0b0" style={{ marginRight: 8 }} />
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="https://mangadex.org/title/..."
                placeholderTextColor="#4a4a6a"
                value={url}
                onChangeText={handleUrlChange}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
                editable={!loading}
              />
              {url.length > 0 && !loading && (
                <TouchableOpacity
                  onPress={() => { setUrl(''); clearState(); inputRef.current?.focus(); }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color="#4a4a6a" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.searchBtn, loading && styles.searchBtnDisabled]}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="search" size={20} color="#fff" />}
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={ACCENT} style={{ marginRight: 8, flexShrink: 0 }} />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          {/* Loading state */}
          {loading && (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={ACCENT} />
              <Text style={styles.loadingText}>Analyse de la page en cours…</Text>
              <Text style={styles.loadingSubtext}>Cela peut prendre quelques secondes</Text>
            </View>
          )}

          {/* Result card */}
          {!loading && result && (
            <View style={styles.resultCard}>
              <View style={styles.resultTop}>
                {result.cover ? (
                  <Image
                    source={{ uri: result.cover }}
                    style={styles.resultCover}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.resultCover, styles.resultCoverPlaceholder]}>
                    <Ionicons name="image-outline" size={32} color="#4a4a6a" />
                  </View>
                )}

                <View style={styles.resultInfo}>
                  <Text style={styles.resultTitle} numberOfLines={3}>{result.title}</Text>

                  {result.genre ? (
                    <Text style={styles.resultGenre} numberOfLines={2}>{result.genre}</Text>
                  ) : null}

                  <View style={styles.metaRow}>
                    {result.rating ? (
                      <View style={styles.metaPill}>
                        <Ionicons name="star" size={11} color={ACCENT} />
                        <Text style={styles.metaText}> {result.rating}</Text>
                      </View>
                    ) : null}
                    <View style={styles.metaPill}>
                      <Ionicons name="time-outline" size={11} color="#a0a0b0" />
                      <Text style={[styles.metaText, { color: '#a0a0b0' }]}> {result.status}</Text>
                    </View>
                    {result.chapters?.length > 0 && (
                      <View style={styles.metaPill}>
                        <Ionicons name="book-outline" size={11} color="#a0a0b0" />
                        <Text style={[styles.metaText, { color: '#a0a0b0' }]}> {result.chapters.length} ch.</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {/* Alt titles */}
              {result.altTitles?.length > 0 && (
                <View style={styles.altTitleBox}>
                  <Text style={styles.altTitleLabel}>Titres alternatifs</Text>
                  {result.altTitles.map((t, i) => (
                    <Text key={i} style={styles.altTitleItem} numberOfLines={1}>• {t}</Text>
                  ))}
                </View>
              )}

              {/* Synopsis preview */}
              {result.description ? (
                <View style={styles.synopsisBox}>
                  <Text style={styles.synopsisLabel}>Synopsis</Text>
                  <Text style={styles.synopsisText} numberOfLines={3}>{result.description}</Text>
                </View>
              ) : null}

              {/* Actions */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.addBtn, added && styles.addBtnDone]}
                  onPress={handleAdd}
                  disabled={added}
                >
                  <Ionicons
                    name={added ? 'checkmark-circle' : 'add-circle-outline'}
                    size={18}
                    color="#fff"
                  />
                  <Text style={styles.addBtnText}>
                    {added ? 'Ajouté !' : 'Ajouter à la bibliothèque'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.detailBtn} onPress={handleViewDetail}>
                  <Ionicons name="eye-outline" size={18} color={ACCENT} />
                  <Text style={styles.detailBtnText}>Voir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Examples */}
          {!loading && !result && !errorMsg && (
            <View style={styles.examplesBox}>
              <Text style={styles.examplesLabel}>Sites compatibles</Text>
              {[
                { icon: 'logo-chrome', name: 'MangaDex', url: 'mangadex.org', note: 'API officielle' },
                { icon: 'globe-outline', name: 'Mangakakalot', url: 'mangakakalot.com', note: 'HTML' },
                { icon: 'globe-outline', name: 'MangaBat', url: 'mangabat.com', note: 'HTML' },
                { icon: 'globe-outline', name: 'Manganelo', url: 'manganelo.com', note: 'HTML' },
              ].map((s) => (
                <View key={s.name} style={styles.exampleRow}>
                  <Ionicons name={s.icon} size={16} color="#4a4a6a" />
                  <Text style={styles.exampleName}>{s.name}</Text>
                  <Text style={styles.exampleUrl}>{s.url}</Text>
                  <View style={styles.exampleBadge}>
                    <Text style={styles.exampleBadgeText}>{s.note}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10,
  },
  backBtn: { padding: 8, borderRadius: 10, backgroundColor: CARD },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  infoBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(233,69,96,0.1)', borderRadius: 10,
    padding: 12, marginBottom: 16,
  },
  infoText: { flex: 1, color: '#c0c0d0', fontSize: 13, marginLeft: 8, lineHeight: 18 },

  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  inputWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: 'transparent', marginRight: 10,
  },
  inputWrapError: { borderColor: ACCENT },
  input: { flex: 1, color: '#fff', fontSize: 14 },
  searchBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    width: 48, height: 48, alignItems: 'center', justifyContent: 'center',
  },
  searchBtnDisabled: { opacity: 0.6 },

  errorBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: 'rgba(233,69,96,0.12)', borderRadius: 10,
    padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: ACCENT,
  },
  errorText: { flex: 1, color: '#e0a0a8', fontSize: 13, lineHeight: 19 },

  loadingBox: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 16 },
  loadingSubtext: { color: '#a0a0b0', fontSize: 12, marginTop: 6 },

  resultCard: { backgroundColor: CARD, borderRadius: 16, padding: 14, marginBottom: 20 },
  resultTop: { flexDirection: 'row' },
  resultCover: { width: 100, height: 145, borderRadius: 10, backgroundColor: '#0f0f1a' },
  resultCoverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  resultInfo: { flex: 1, paddingLeft: 12 },
  resultTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 22 },
  resultGenre: { color: '#a0a0b0', fontSize: 12, marginTop: 6 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  metaPill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(233,69,96,0.12)', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  metaText: { color: ACCENT, fontSize: 11, fontWeight: 'bold' },

  altTitleBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e2a4a' },
  altTitleLabel: { color: '#a0a0b0', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  altTitleItem: { color: '#c0c0d0', fontSize: 12, lineHeight: 20 },

  synopsisBox: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e2a4a' },
  synopsisLabel: { color: '#a0a0b0', fontSize: 11, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  synopsisText: { color: '#c0c0d0', fontSize: 13, lineHeight: 20 },

  actionRow: { flexDirection: 'row', marginTop: 14, gap: 10 },
  addBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 12,
  },
  addBtnDone: { backgroundColor: '#2a7a4a' },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  detailBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e2a4a', borderRadius: 12,
    paddingHorizontal: 18, paddingVertical: 12,
    borderWidth: 1, borderColor: ACCENT,
  },
  detailBtnText: { color: ACCENT, fontWeight: 'bold', fontSize: 14, marginLeft: 6 },

  examplesBox: { marginTop: 24 },
  examplesLabel: { color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  exampleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 10,
    padding: 12, marginBottom: 8,
  },
  exampleName: { color: '#fff', fontSize: 13, fontWeight: '600', marginLeft: 10, flex: 1 },
  exampleUrl: { color: '#4a4a6a', fontSize: 11, marginRight: 8 },
  exampleBadge: { backgroundColor: '#1e2a4a', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  exampleBadgeText: { color: '#a0a0b0', fontSize: 10 },
});
