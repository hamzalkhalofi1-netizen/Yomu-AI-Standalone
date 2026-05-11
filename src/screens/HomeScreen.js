import React, { useState } from 'react';
import {
  FlatList, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FEATURED, TRENDING } from '../data/mockData';
import FeaturedSlider from '../components/FeaturedSlider';
import MangaCard from '../components/MangaCard';
import { useManga } from '../context/MangaContext';

const BG = '#0f0f1a';
const CARD = '#16213e';
const ACCENT = '#e94560';

const CATEGORIES = ['Tout', 'Action', 'Fantasy', 'Romance', 'Horreur', 'Comédie'];

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { library } = useManga();
  const [activeCategory, setActiveCategory] = useState('Tout');

  const filtered = activeCategory === 'Tout'
    ? TRENDING
    : TRENDING.filter((m) =>
        m.genre && m.genre.toLowerCase().includes(activeCategory.toLowerCase())
      );

  const handleMangaPress = (manga) => {
    navigation.navigate('Detail', { manga });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.appName}>Yomu AI</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddManga')}
        >
          <Text style={styles.addBtnText}>+ Importer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>✨ À la une</Text>
      <FeaturedSlider data={FEATURED} onPress={handleMangaPress} />

      <Text style={styles.sectionTitle}>Catégories</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
            onPress={() => setActiveCategory(cat)}
          >
            <Text style={[styles.catText, activeCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>🔥 Tendances</Text>
        <Text style={styles.seeAll}>{filtered.length} manga</Text>
      </View>
      <FlatList
        data={filtered}
        horizontal
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <MangaCard item={item} onPress={() => handleMangaPress(item)} />
        )}
      />

      {library.length > 0 && (
        <>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>📚 Ma bibliothèque</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Bibliothèque')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={library.slice(0, 6)}
            horizontal
            keyExtractor={(i) => i.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <MangaCard item={item} onPress={() => handleMangaPress(item)} />
            )}
          />
        </>
      )}

      {library.length === 0 && (
        <View style={styles.ctaBanner}>
          <Text style={styles.ctaTitle}>Importez votre premier manga</Text>
          <Text style={styles.ctaDesc}>
            Collez l'URL d'un site manga pour l'ajouter à votre bibliothèque personnelle.
          </Text>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.navigate('AddManga')}
          >
            <Text style={styles.ctaBtnText}>+ Importer un manga</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 16,
  },
  greeting: { color: '#a0a0b0', fontSize: 13 },
  appName: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  addBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 22, marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, marginTop: 22, marginBottom: 12,
  },
  seeAll: { color: ACCENT, fontSize: 12, fontWeight: '600' },
  categories: { paddingHorizontal: 16, paddingBottom: 4 },
  catPill: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
    backgroundColor: CARD, marginRight: 8, borderWidth: 1, borderColor: '#1e2a4a',
  },
  catPillActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  catText: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  ctaBanner: {
    margin: 16, marginTop: 22, backgroundColor: CARD,
    borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#1e2a4a',
  },
  ctaTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  ctaDesc: { color: '#a0a0b0', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  ctaBtn: {
    backgroundColor: ACCENT, borderRadius: 10,
    paddingVertical: 10, alignItems: 'center',
  },
  ctaBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
