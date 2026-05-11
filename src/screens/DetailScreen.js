import React from 'react';
import {
  FlatList, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useManga } from '../context/MangaContext';
import { CHAPTERS } from '../data/mockData';

const BG = '#0f0f1a';
const CARD = '#16213e';
const ACCENT = '#e94560';

export default function DetailScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { manga } = route.params || {};
  const { addToLibrary, removeFromLibrary, isInLibrary } = useManga();

  if (!manga) {
    return (
      <View style={styles.errorView}>
        <Text style={styles.errorText}>Manga introuvable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>← Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const inLib = isInLibrary(manga.id);
  const chapters = Array.isArray(manga.chapters) && manga.chapters.length > 0
    ? manga.chapters
    : CHAPTERS;

  const rating = manga.rating != null ? String(manga.rating) : null;
  const chapterCount = typeof manga.chapters === 'number'
    ? manga.chapters
    : Array.isArray(manga.chapters) ? manga.chapters.length : chapters.length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          {manga.cover ? (
            <Image source={{ uri: manga.cover }} style={styles.heroBg} resizeMode="cover" />
          ) : (
            <View style={[styles.heroBg, styles.heroBgPlaceholder]}>
              <Text style={{ fontSize: 64 }}>📖</Text>
            </View>
          )}
          <View style={styles.heroOverlay} />
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>← Retour</Text>
          </TouchableOpacity>
          <View style={styles.heroContent}>
            {manga.genre ? (
              <View style={styles.genrePill}>
                <Text style={styles.genreText}>{manga.genre}</Text>
              </View>
            ) : null}
            <Text style={styles.title}>{manga.title}</Text>
            <View style={styles.metaRow}>
              {rating ? <Text style={styles.rating}>★ {rating}</Text> : null}
              {manga.status ? <Text style={styles.status}>{manga.status}</Text> : null}
              <Text style={styles.chCount}>{chapterCount} ch.</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.libBtn, inLib && styles.libBtnActive]}
            onPress={() => inLib ? removeFromLibrary(manga.id) : addToLibrary(manga)}
          >
            <Text style={styles.libBtnText}>
              {inLib ? '✓ Dans la bibliothèque' : '+ Ajouter'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.readBtn}>
            <Text style={styles.readBtnText}>▶ Lire</Text>
          </TouchableOpacity>
        </View>

        {manga.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Synopsis</Text>
            <Text style={styles.synopsis}>{manga.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chapitres ({chapters.length})</Text>
          {chapters.slice(0, 30).map((ch) => (
            <TouchableOpacity key={ch.id} style={styles.chapterRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.chTitle}>{ch.title}</Text>
                {ch.date ? <Text style={styles.chDate}>{ch.date}</Text> : null}
              </View>
              {ch.pages > 0 && (
                <Text style={styles.chPages}>{ch.pages} p.</Text>
              )}
              <Text style={styles.chArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  errorView: { flex: 1, backgroundColor: BG, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#fff', fontSize: 16, marginBottom: 12 },
  backLink: { color: ACCENT, fontSize: 14 },
  heroSection: { height: 300, position: 'relative' },
  heroBg: { width: '100%', height: '100%' },
  heroBgPlaceholder: { backgroundColor: CARD, alignItems: 'center', justifyContent: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,26,0.7)' },
  backBtn: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  backBtnText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  heroContent: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  genrePill: {
    alignSelf: 'flex-start', backgroundColor: ACCENT,
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  genreText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  rating: { color: ACCENT, fontWeight: 'bold', fontSize: 13, marginRight: 12 },
  status: { color: '#4a90e2', fontSize: 12, marginRight: 12 },
  chCount: { color: '#a0a0b0', fontSize: 12 },
  actionRow: {
    flexDirection: 'row', padding: 16, paddingBottom: 8,
  },
  libBtn: {
    flex: 1, backgroundColor: CARD, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center', marginRight: 8,
    borderWidth: 1, borderColor: '#1e2a4a',
  },
  libBtnActive: { backgroundColor: '#1e4a2a', borderColor: '#2a6a3a' },
  libBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  readBtn: {
    flex: 1, backgroundColor: ACCENT, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  readBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  section: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginBottom: 10 },
  synopsis: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 20 },
  chapterRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1e2a4a',
  },
  chTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  chDate: { color: '#a0a0b0', fontSize: 11, marginTop: 2 },
  chPages: { color: '#4a4a6a', fontSize: 11, marginRight: 8 },
  chArrow: { color: '#4a4a6a', fontSize: 18 },
});
