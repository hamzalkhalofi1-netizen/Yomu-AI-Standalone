import React, { useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TRENDING } from '../data/mockData';

const FILTERS = ['Tous', 'En lecture', 'Terminés', 'Favoris'];

const LIBRARY = TRENDING.slice(0, 5).map((m, i) => ({
  ...m,
  progress: i % 2 === 0 ? 'En lecture' : 'Terminés',
  lastRead: `Ch. ${(i + 1) * 20}`,
  pct: Math.round(30 + i * 15),
}));

export default function LibraryScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('Tous');
  const filtered = activeFilter === 'Tous' ? LIBRARY : LIBRARY.filter((m) => m.progress === activeFilter);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Bibliothèque</Text>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="library-outline" size={56} color="#2a2a4a" />
          <Text style={styles.emptyTitle}>Bibliothèque vide</Text>
          <Text style={styles.emptySubtitle}>Ajoutez des manga à votre bibliothèque</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('Detail', { manga: item })}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.cover }} style={styles.cover} />
              <View style={styles.info}>
                <Text style={styles.mangaTitle}>{item.title}</Text>
                <Text style={styles.genre}>{item.genre}</Text>
                <View style={styles.progressRow}>
                  <View style={[styles.statusBadge, item.progress === 'Terminés' && styles.statusBadgeDone]}>
                    <Text style={[styles.statusText, item.progress === 'Terminés' && styles.statusTextDone]}>
                      {item.progress}
                    </Text>
                  </View>
                  <Text style={styles.lastRead}>{item.lastRead}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${item.pct}%` }]} />
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#2a2a4a" />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 14 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 16 },
  filterChip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: '#16213e', marginRight: 8,
  },
  filterChipActive: { backgroundColor: '#e94560' },
  filterText: { color: '#a0a0b0', fontSize: 13 },
  filterTextActive: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  cover: { width: 56, height: 78, borderRadius: 8, backgroundColor: '#0f0f1a' },
  info: { flex: 1, marginLeft: 12 },
  mangaTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  genre: { color: '#a0a0b0', fontSize: 12, marginTop: 2 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusBadge: {
    backgroundColor: 'rgba(233,69,96,0.15)',
    borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, marginRight: 8,
  },
  statusBadgeDone: { backgroundColor: 'rgba(100,200,100,0.15)' },
  statusText: { color: '#e94560', fontSize: 10, fontWeight: 'bold' },
  statusTextDone: { color: '#64c864' },
  lastRead: { color: '#a0a0b0', fontSize: 11 },
  progressBarBg: { height: 3, backgroundColor: '#2a2a4a', borderRadius: 2, marginTop: 8 },
  progressBarFill: { height: 3, backgroundColor: '#e94560', borderRadius: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 12 },
  emptySubtitle: { color: '#a0a0b0', fontSize: 14, marginTop: 6 },
});
