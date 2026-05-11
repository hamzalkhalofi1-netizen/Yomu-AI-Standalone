import React, { useState } from 'react';
import {
  Image, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CHAPTERS } from '../data/mockData';

const INFO_TAGS = [
  { icon: 'book-outline', label: '205 Ch.' },
  { icon: 'star-outline', label: '9.2 / 10' },
  { icon: 'time-outline', label: 'En cours' },
  { icon: 'eye-outline', label: '14.2M vues' },
];

export default function DetailScreen({ route, navigation }) {
  const { manga } = route.params;
  const [isFav, setIsFav] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chapitres');

  const synopsis = manga.description ||
    'Tanjiro Kamado, un jeune garçon au cœur pur qui vit en montagne, voit sa vie basculer le jour où toute sa famille est massacrée par un démon. Sa sœur cadette Nezuko, la seule survivante, a été transformée en démon. Tanjiro décide alors de devenir pourfendeur de démons et de trouver un moyen de ramener Nezuko à son état humain.';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{manga.title}</Text>
        <View style={styles.topActions}>
          <TouchableOpacity style={[styles.iconBtn, { marginRight: 6 }]} onPress={() => setIsFav(!isFav)}>
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? '#e94560' : '#fff'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Hero */}
        <View style={styles.heroWrapper}>
          <Image source={{ uri: manga.cover }} style={styles.heroBg} blurRadius={12} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Image source={{ uri: manga.cover }} style={styles.coverImage} />
            <View style={styles.heroInfo}>
              <Text style={styles.mangaTitle}>{manga.title}</Text>
              {manga.genre ? <Text style={styles.mangaGenre}>{manga.genre}</Text> : null}
              <View style={styles.statusPill}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>{manga.status || 'En cours'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Tags */}
        <View style={styles.infoTags}>
          {INFO_TAGS.map((tag, i) => (
            <View key={i} style={styles.infoTag}>
              <Ionicons name={tag.icon} size={14} color="#e94560" />
              <Text style={styles.infoTagText}>{tag.label}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="book-outline" size={16} color="#fff" />
            <Text style={styles.primaryBtnText}> Lire Ch. 1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn}>
            <Ionicons name="download-outline" size={16} color="#e94560" />
            <Text style={styles.secondaryBtnText}> Télécharger</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconSquareBtn}>
            <Ionicons name="bookmark-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {['chapitres', 'synopsis', 'similaires'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'synopsis' && (
          <View style={styles.synopsisBox}>
            <Text style={styles.synopsisText} numberOfLines={synopsisExpanded ? undefined : 4}>
              {synopsis}
            </Text>
            <TouchableOpacity onPress={() => setSynopsisExpanded(!synopsisExpanded)}>
              <Text style={styles.synopsisToggle}>
                {synopsisExpanded ? 'Voir moins ▲' : 'Voir plus ▼'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'chapitres' && (
          <View style={styles.chaptersList}>
            <View style={styles.chapterListHeader}>
              <Text style={styles.chapterCount}>{CHAPTERS.length} Chapitres</Text>
              <TouchableOpacity style={styles.sortBtn}>
                <Ionicons name="swap-vertical-outline" size={14} color="#a0a0b0" />
                <Text style={styles.sortText}> Trier</Text>
              </TouchableOpacity>
            </View>
            {CHAPTERS.map((ch) => (
              <TouchableOpacity key={ch.id} style={styles.chapterRow} activeOpacity={0.75}>
                <View style={styles.chapterLeft}>
                  <Text style={styles.chapterNumber}>Ch. {ch.number}</Text>
                  <Text style={styles.chapterTitle}>{ch.title}</Text>
                </View>
                <View style={styles.chapterRight}>
                  <Text style={styles.chapterDate}>{ch.date}</Text>
                  <Text style={styles.chapterPages}>{ch.pages} pages</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#2a2a4a" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeTab === 'similaires' && (
          <View style={styles.similarBox}>
            <Text style={styles.similarEmpty}>Recommandations bientôt disponibles ✨</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  topTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', marginHorizontal: 8 },
  topActions: { flexDirection: 'row' },
  iconBtn: { padding: 8, borderRadius: 10, backgroundColor: '#16213e' },
  heroWrapper: { height: 220, overflow: 'hidden' },
  heroBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,26,0.72)' },
  heroContent: {
    flexDirection: 'row', alignItems: 'flex-end',
    padding: 16, paddingBottom: 20,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  coverImage: {
    width: 100, height: 145, borderRadius: 10,
    backgroundColor: '#16213e', borderWidth: 2, borderColor: '#e94560',
  },
  heroInfo: { flex: 1, paddingLeft: 14, paddingBottom: 4 },
  mangaTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 26 },
  mangaGenre: { color: '#a0a0b0', fontSize: 12, marginTop: 4 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: 'rgba(233,69,96,0.15)',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#e94560', marginRight: 5 },
  statusText: { color: '#e94560', fontSize: 11, fontWeight: 'bold' },
  infoTags: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: '#16213e', marginHorizontal: 16,
    borderRadius: 12, padding: 14, marginTop: 14,
  },
  infoTag: { alignItems: 'center' },
  infoTagText: { color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 4 },
  actionRow: {
    flexDirection: 'row', paddingHorizontal: 16, marginTop: 14,
  },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#e94560', borderRadius: 12, paddingVertical: 13, marginRight: 10,
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#16213e', borderRadius: 12, paddingVertical: 13,
    borderWidth: 1, borderColor: '#e94560', marginRight: 10,
  },
  secondaryBtnText: { color: '#e94560', fontWeight: 'bold', fontSize: 14 },
  iconSquareBtn: {
    backgroundColor: '#16213e', borderRadius: 12,
    paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 20,
    backgroundColor: '#16213e', borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: '#e94560' },
  tabText: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  synopsisBox: { paddingHorizontal: 16, marginTop: 16 },
  synopsisText: { color: '#c0c0d0', fontSize: 14, lineHeight: 22 },
  synopsisToggle: { color: '#e94560', marginTop: 10, fontSize: 13 },
  chaptersList: { paddingHorizontal: 16, marginTop: 14 },
  chapterListHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  chapterCount: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortText: { color: '#a0a0b0', fontSize: 12 },
  chapterRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
  },
  chapterLeft: { flex: 1 },
  chapterNumber: { color: '#e94560', fontSize: 13, fontWeight: 'bold' },
  chapterTitle: { color: '#a0a0b0', fontSize: 12, marginTop: 2 },
  chapterRight: { alignItems: 'flex-end', marginRight: 10 },
  chapterDate: { color: '#a0a0b0', fontSize: 11 },
  chapterPages: { color: '#2a2a4a', fontSize: 10, marginTop: 2 },
  similarBox: { padding: 32, alignItems: 'center' },
  similarEmpty: { color: '#a0a0b0', fontSize: 14 },
});
