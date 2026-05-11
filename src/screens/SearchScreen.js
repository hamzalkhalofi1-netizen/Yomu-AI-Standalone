import React, { useState } from 'react';
import {
  FlatList, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MangaCard from '../components/MangaCard';
import { TRENDING } from '../data/mockData';

const GENRES = ['Action', 'Romance', 'Fantasy', 'Horreur', 'Comédie', 'Drame', 'Seinen', 'Shonen', 'Isekai', 'Sports'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = (text) => {
    setQuery(text);
    if (text.length > 1) {
      const filtered = TRENDING.filter((m) =>
        m.title.toLowerCase().includes(text.toLowerCase())
      );
      setResults(filtered);
      setSearched(true);
    } else {
      setResults([]);
      setSearched(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Recherche</Text>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color="#a0a0b0" />
          <TextInput
            style={styles.input}
            placeholder="Manga, auteur, genre..."
            placeholderTextColor="#a0a0b0"
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color="#a0a0b0" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!searched ? (
        <View style={styles.genresSection}>
          <Text style={styles.sectionLabel}>Parcourir par genre</Text>
          <View style={styles.genreGrid}>
            {GENRES.map((g) => (
              <TouchableOpacity key={g} style={styles.genreChip}>
                <Text style={styles.genreText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sectionLabel}>Tendances</Text>
          <FlatList
            horizontal
            data={TRENDING.slice(0, 4)}
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <MangaCard
                item={item}
                onPress={() => navigation.navigate('Detail', { manga: item })}
              />
            )}
          />
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="search" size={48} color="#2a2a4a" />
              <Text style={styles.emptyText}>Aucun résultat pour "{query}"</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.resultRow}
              onPress={() => navigation.navigate('Detail', { manga: item })}
              activeOpacity={0.8}
            >
              <MangaCard item={item} />
              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultGenre}>{item.genre}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#e94560" />
                  <Text style={styles.ratingText}> {item.rating}</Text>
                  <Text style={styles.sep}> • </Text>
                  <Text style={styles.chapters}>{item.chapters} ch.</Text>
                </View>
              </View>
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
  searchRow: { paddingHorizontal: 16, marginBottom: 20 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  input: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 8 },
  genresSection: { flex: 1 },
  sectionLabel: { color: '#fff', fontWeight: 'bold', fontSize: 15, paddingHorizontal: 16, marginBottom: 12 },
  genreGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 24 },
  genreChip: {
    backgroundColor: '#16213e', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
    marginRight: 8, marginBottom: 8,
  },
  genreText: { color: '#a0a0b0', fontSize: 13 },
  resultsList: { padding: 16 },
  resultRow: { flexDirection: 'row', marginBottom: 14 },
  resultInfo: { flex: 1, paddingTop: 4, paddingLeft: 14 },
  resultTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  resultGenre: { color: '#a0a0b0', fontSize: 12, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  ratingText: { color: '#e94560', fontSize: 12, fontWeight: 'bold' },
  sep: { color: '#2a2a4a' },
  chapters: { color: '#a0a0b0', fontSize: 12 },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: '#a0a0b0', fontSize: 14, marginTop: 14 },
});
