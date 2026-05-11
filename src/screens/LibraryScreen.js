import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useManga } from '../context/MangaContext';
import { TRENDING } from '../data/mockData';

const FILTERS = ['Tous', 'En lecture', 'Terminés', 'Favoris'];
const ACCENT = '#e94560';
const CARD = '#16213e';
const BG = '#0f0f1a';

const MOCK_LIBRARY = TRENDING.slice(0, 4).map((m, i) => ({
  ...m,
  progress: i % 2 === 0 ? 'En lecture' : 'Terminés',
  lastRead: `Ch. ${(i + 1) * 20}`,
  pct: Math.round(30 + i * 15),
  isMock: true,
}));

function pct(manga) {
  if (manga.pct != null) return manga.pct;
  if (!manga.chapters?.length) return 0;
  return 20;
}

function lastReadLabel(manga) {
  if (manga.lastRead) return manga.lastRead;
  if (manga.chapters?.length) return `Ch. ${manga.chapters[0].number}`;
  return 'Nouveau';
}

export default function LibraryScreen({ navigation }) {
  const { library, removeFromLibrary } = useManga();
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [deleteMode, setDeleteMode] = useState(false);

  const combined = [
    ...library.map((m) => ({ ...m, isMock: false })),
    ...MOCK_LIBRARY,
  ];

  const filtered =
    activeFilter === 'Tous'
      ? combined
      : combined.filter((m) => m.progress === activeFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Bibliothèque</Text>
        <View style={styles.headerActions}>
          {library.length > 0 && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setDeleteMode((v) => !v)}
            >
              <Text style={[styles.editBtnText, deleteMode && { color: ACCENT }]}>
                {deleteMode ? 'Terminer' : 'Modifier'}
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddManga')}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="library-outline" size={56} color="#2a2a4a" />
          <Text style={styles.emptyTitle}>Bibliothèque vide</Text>
          <Text style={styles.emptySubtitle}>
            Ajoutez des manga depuis une URL
          </Text>
          <TouchableOpacity
            style={styles.addFirstBtn}
            onPress={() => navigation.navigate('AddManga')}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.addFirstBtnText}>Ajouter un manga</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => !deleteMode && navigation.navigate('Detail', { manga: item })}
              activeOpacity={0.8}
            >
              {/* Cover */}
              {item.cover ? (
                <Image source={{ uri: item.cover }} style={styles.cover} />
              ) : (
                <View style={[styles.cover, styles.coverPlaceholder]}>
                  <Ionicons name="image-outline" size={22} color="#4a4a6a" />
                </View>
              )}

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.mangaTitle} numberOfLines={2}>{item.title}</Text>
                {item.genre ? <Text style={styles.genre} numberOfLines={1}>{item.genre}</Text> : null}

                <View style={styles.progressRow}>
                  <View style={[styles.statusBadge, item.progress === 'Terminés' && styles.statusBadgeDone]}>
                    <Text style={[styles.statusText, item.progress === 'Terminés' && styles.statusTextDone]}>
                      {item.progress || 'En lecture'}
                    </Text>
                  </View>
                  <Text style={styles.lastRead}>{lastReadLabel(item)}</Text>
                </View>

                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${pct(item)}%` }]} />
                </View>

                {/* Scraped badge */}
                {!item.isMock && (
                  <View style={styles.scrapedBadge}>
                    <Ionicons name="link-outline" size={10} color="#a0a0b0" />
                    <Text style={styles.scrapedText}> Importé</Text>
                  </View>
                )}
              </View>

              {/* Right side */}
              {deleteMode && !item.isMock ? (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeFromLibrary(item.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={18} color={ACCENT} />
                </TouchableOpacity>
              ) : (
                <Ionicons name="chevron-forward" size={18} color="#2a2a4a" />
              )}
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            library.length > 0 ? (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionLabel}>
                  {library.length} manga importé{library.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14,
  },
  title: { flex: 1, color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  editBtnText: { color: '#a0a0b0', fontSize: 14 },
  addBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    width: 36, height: 36, alignItems: 'center', justifyContent: 'center',
  },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  filterChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: CARD, marginRight: 8,
  },
  filterChipActive: { backgroundColor: ACCENT },
  filterText: { color: '#a0a0b0', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 16, paddingTop: 4 },
  sectionHeader: { marginBottom: 10 },
  sectionLabel: { color: '#a0a0b0', fontSize: 12 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: CARD, borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  cover: { width: 56, height: 78, borderRadius: 8, backgroundColor: BG },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12 },
  mangaTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, lineHeight: 19 },
  genre: { color: '#a0a0b0', fontSize: 12, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusBadge: {
    backgroundColor: 'rgba(233,69,96,0.15)',
    borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, marginRight: 8,
  },
  statusBadgeDone: { backgroundColor: 'rgba(100,200,100,0.15)' },
  statusText: { color: ACCENT, fontSize: 10, fontWeight: 'bold' },
  statusTextDone: { color: '#64c864' },
  lastRead: { color: '#a0a0b0', fontSize: 11 },
  progressBarBg: { height: 3, backgroundColor: '#2a2a4a', borderRadius: 2, marginTop: 8 },
  progressBarFill: { height: 3, backgroundColor: ACCENT, borderRadius: 2 },
  scrapedBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 5,
  },
  scrapedText: { color: '#6a6a8a', fontSize: 10 },
  deleteBtn: { padding: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  emptySubtitle: { color: '#a0a0b0', fontSize: 14, marginTop: 6, textAlign: 'center' },
  addFirstBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: ACCENT, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 20,
  },
  addFirstBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
});
