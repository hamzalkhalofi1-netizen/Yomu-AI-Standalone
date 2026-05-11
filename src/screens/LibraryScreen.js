import React, { useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useManga } from '../context/MangaContext';
import MangaCard from '../components/MangaCard';

const BG = '#0f0f1a';
const CARD = '#16213e';
const ACCENT = '#e94560';

export default function LibraryScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { library, removeFromLibrary } = useManga();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? library.filter((m) =>
        m.title && m.title.toLowerCase().includes(search.toLowerCase())
      )
    : library;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📚 Bibliothèque</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddManga')}
        >
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Rechercher dans ma bibliothèque..."
        placeholderTextColor="#4a4a6a"
        value={search}
        onChangeText={setSearch}
      />

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>
            {library.length === 0 ? 'Bibliothèque vide' : 'Aucun résultat'}
          </Text>
          <Text style={styles.emptyDesc}>
            {library.length === 0
              ? 'Importez un manga par URL ou ajoutez-en depuis la recherche.'
              : `Aucun manga correspondant à « ${search} »`}
          </Text>
          {library.length === 0 && (
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('AddManga')}
            >
              <Text style={styles.ctaBtnText}>+ Importer un manga</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MangaCard
                item={item}
                onPress={() => navigation.navigate('Detail', { manga: item })}
                style={{ width: '100%', marginRight: 0 }}
              />
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFromLibrary(item.id)}
              >
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, marginTop: 8,
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  addBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  search: {
    backgroundColor: CARD, color: '#fff', borderRadius: 12,
    marginHorizontal: 16, marginBottom: 14,
    paddingHorizontal: 14, paddingVertical: 10, fontSize: 14,
    borderWidth: 1, borderColor: '#1e2a4a',
  },
  grid: { paddingHorizontal: 12, paddingBottom: 20 },
  gridItem: { flex: 1, margin: 4, position: 'relative', maxWidth: '33%' },
  removeBtn: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(233,69,96,0.85)', borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  removeBtnText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyDesc: { color: '#a0a0b0', fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  ctaBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  ctaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
