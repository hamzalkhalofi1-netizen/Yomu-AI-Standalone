import React, { useState } from 'react';
import {
  FlatList, Image, ScrollView, StyleSheet,
  Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FeaturedSlider from '../components/FeaturedSlider';
import MangaCard from '../components/MangaCard';
import { FEATURED, TRENDING, RECENT_UPDATES } from '../data/mockData';

const CATEGORIES = ['Tous', 'Action', 'Romance', 'Fantasy', 'Horreur', 'Comédie', 'Drame'];

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour 👋</Text>
          <Text style={styles.headerTitle}>Yomu <Text style={styles.accent}>AI</Text></Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Search */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#a0a0b0" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher un manga..."
              placeholderTextColor="#a0a0b0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Featured */}
        <Text style={styles.sectionTitle}>⭐ À la une</Text>
        <FeaturedSlider
          data={FEATURED}
          onPress={(item) => navigation.navigate('Detail', { manga: item })}
        />

        {/* Categories */}
        <Text style={styles.sectionTitle}>Catégories</Text>
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(c) => c}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, activeCategory === item && styles.categoryChipActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.categoryText, activeCategory === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Trending */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>🔥 Populaires</Text>
          <TouchableOpacity style={{ paddingRight: 16 }}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={TRENDING}
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

        {/* Recent Updates */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>🕒 Mises à jour</Text>
          <TouchableOpacity style={{ paddingRight: 16 }}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.updatesList}>
          {RECENT_UPDATES.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.updateRow}
              onPress={() => navigation.navigate('Detail', { manga: item })}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.cover }} style={styles.updateCover} />
              <View style={styles.updateInfo}>
                <Text style={styles.updateTitle}>{item.title}</Text>
                <Text style={styles.updateChapter}>{item.chapter}</Text>
              </View>
              <Text style={styles.updateTime}>{item.time}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, paddingTop: 4,
  },
  greeting: { color: '#a0a0b0', fontSize: 13 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 2 },
  accent: { color: '#e94560' },
  notifBtn: { position: 'relative', padding: 6 },
  notifDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#e94560',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginBottom: 20,
  },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 11, marginRight: 10,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 14, marginLeft: 8 },
  filterBtn: { backgroundColor: '#16213e', borderRadius: 12, padding: 11 },
  sectionTitle: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
    paddingHorizontal: 16, marginBottom: 12, marginTop: 20,
  },
  sectionRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: { color: '#e94560', fontSize: 13 },
  categoryChip: {
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 7,
    backgroundColor: '#16213e', marginRight: 8,
  },
  categoryChipActive: { backgroundColor: '#e94560' },
  categoryText: { color: '#a0a0b0', fontSize: 13 },
  categoryTextActive: { color: '#fff', fontWeight: 'bold' },
  updatesList: { paddingHorizontal: 16 },
  updateRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 12,
    padding: 10, marginBottom: 10,
  },
  updateCover: { width: 48, height: 64, borderRadius: 8, backgroundColor: '#0f0f1a' },
  updateInfo: { flex: 1, marginLeft: 12 },
  updateTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  updateChapter: { color: '#e94560', fontSize: 12, marginTop: 4 },
  updateTime: { color: '#a0a0b0', fontSize: 11 },
});
