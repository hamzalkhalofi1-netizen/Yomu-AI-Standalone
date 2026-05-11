import React, { useState } from 'react';
import {
  FlatList, Image, ScrollView, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CHAPTERS } from '../data/mockData';
import { useManga } from '../context/MangaContext';

const ACCENT = '#e94560';
const CARD = '#16213e';
const BG = '#0f0f1a';

function buildInfoTags(manga) {
  const chapters = manga.chapters?.length || CHAPTERS.length;
  const rating = manga.rating;
  const status = manga.status || 'En cours';
  const views = manga.views || null;

  const tags = [
    { icon: 'book-outline', label: `${chapters} Ch.` },
    rating ? { icon: 'star-outline', label: `${rating} / 10` } : null,
    { icon: 'time-outline', label: status },
    views ? { icon: 'eye-outline', label: views } : null,
  ];
  return tags.filter(Boolean);
}

export default function DetailScreen({ route, navigation }) {
  const { manga } = route.params;
  const { addToLibrary, removeFromLibrary, isInLibrary } = useManga();
  const [isFav, setIsFav] = useState(false);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('chapitres');
  const [sortDesc, setSortDesc] = useState(true);

  const inLibrary = isInLibrary(manga.id);
  const synopsis =
    manga.description ||
    'Aucun synopsis disponible pour ce manga.';

  const chapters = manga.chapters?.length ? manga.chapters : CHAPTERS;
  const sortedChapters = sortDesc ? chapters : [...chapters].reverse();

  const infoTags = buildInfoTags(manga);

  const toggleLibrary = () => {
    if (inLibrary) {
      removeFromLibrary(manga.id);
    } else {
      addToLibrary(manga);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{manga.title}</Text>
        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { marginRight: 6 }]}
            onPress={() => setIsFav(!isFav)}
          >
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={22} color={isFav ? ACCENT : '#fff'} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Hero */}
        <View style={styles.heroWrapper}>
          {manga.cover ? (
            <Image source={{ uri: manga.cover }} style={styles.heroBg} blurRadius={12} />
          ) : (
            <View style={[styles.heroBg, { backgroundColor: '#16213e' }]} />
          )}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            {manga.cover ? (
              <Image source={{ uri: manga.cover }} style={styles.coverImage} />
            ) : (
              <View style={[styles.coverImage, styles.coverPlaceholder]}>
                <Ionicons name="image-outline" size={36} color="#4a4a6a" />
              </View>
            )}
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

        {/* Info tags */}
        {infoTags.length > 0 && (
          <View style={styles.infoTags}>
            {infoTags.map((tag, i) => (
              <View key={i} style={styles.infoTag}>
                <Ionicons name={tag.icon} size={14} color={ACCENT} />
                <Text style={styles.infoTagText}>{tag.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Alternative titles */}
        {manga.altTitles?.length > 0 && (
          <View style={styles.altTitleBox}>
            <Text style={styles.altTitleLabel}>Titres alternatifs</Text>
            <View style={styles.altTitleList}>
              {manga.altTitles.map((t, i) => (
                <View key={i} style={styles.altTitleChip}>
                  <Text style={styles.altTitleText} numberOfLines={1}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryBtn}>
            <Ionicons name="book-outline" size={16} color="#fff" />
            <Text style={styles.primaryBtnText}> Lire Ch. 1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, inLibrary && styles.secondaryBtnActive]}
            onPress={toggleLibrary}
          >
            <Ionicons
              name={inLibrary ? 'bookmark' : 'bookmark-outline'}
              size={16}
              color={inLibrary ? '#fff' : ACCENT}
            />
            <Text style={[styles.secondaryBtnText, inLibrary && { color: '#fff' }]}>
              {inLibrary ? ' Retiré' : ' Bibliothèque'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconSquareBtn}>
            <Ionicons name="download-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Source URL indicator */}
        {manga.sourceUrl && (
          <View style={styles.sourceRow}>
            <Ionicons name="link-outline" size={12} color="#4a4a6a" />
            <Text style={styles.sourceText} numberOfLines={1}> {manga.sourceUrl}</Text>
          </View>
        )}

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

        {/* Synopsis tab */}
        {activeTab === 'synopsis' && (
          <View style={styles.synopsisBox}>
            <Text style={styles.synopsisText} numberOfLines={synopsisExpanded ? undefined : 5}>
              {synopsis}
            </Text>
            {synopsis.length > 200 && (
              <TouchableOpacity onPress={() => setSynopsisExpanded(!synopsisExpanded)}>
                <Text style={styles.synopsisToggle}>
                  {synopsisExpanded ? 'Voir moins ▲' : 'Voir plus ▼'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Chapters tab */}
        {activeTab === 'chapitres' && (
          <View style={styles.chaptersList}>
            <View style={styles.chapterListHeader}>
              <Text style={styles.chapterCount}>{chapters.length} Chapitres</Text>
              <TouchableOpacity
                style={styles.sortBtn}
                onPress={() => setSortDesc((v) => !v)}
              >
                <Ionicons name="swap-vertical-outline" size={14} color="#a0a0b0" />
                <Text style={styles.sortText}> {sortDesc ? 'Plus récent' : 'Plus ancien'}</Text>
              </TouchableOpacity>
            </View>

            {sortedChapters.map((ch) => (
              <TouchableOpacity key={ch.id} style={styles.chapterRow} activeOpacity={0.75}>
                <View style={styles.chapterLeft}>
                  <Text style={styles.chapterNumber}>Ch. {ch.number}</Text>
                  <Text style={styles.chapterTitle} numberOfLines={1}>
                    {ch.title && ch.title !== `Chapitre ${ch.number}` ? ch.title : `Chapitre ${ch.number}`}
                  </Text>
                </View>
                <View style={styles.chapterRight}>
                  {ch.date ? <Text style={styles.chapterDate}>{ch.date}</Text> : null}
                  {ch.pages > 0 ? <Text style={styles.chapterPages}>{ch.pages} pages</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#2a2a4a" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Similar tab */}
        {activeTab === 'similaires' && (
          <View style={styles.similarBox}>
            <Ionicons name="sparkles-outline" size={40} color="#2a2a4a" />
            <Text style={styles.similarEmpty}>Recommandations bientôt disponibles ✨</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 8,
  },
  topTitle: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600', marginHorizontal: 8 },
  topActions: { flexDirection: 'row' },
  iconBtn: { padding: 8, borderRadius: 10, backgroundColor: CARD },
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
    backgroundColor: CARD, borderWidth: 2, borderColor: ACCENT,
  },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  heroInfo: { flex: 1, paddingLeft: 14, paddingBottom: 4 },
  mangaTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 26 },
  mangaGenre: { color: '#a0a0b0', fontSize: 12, marginTop: 4 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: 'rgba(233,69,96,0.15)',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: ACCENT, marginRight: 5 },
  statusText: { color: ACCENT, fontSize: 11, fontWeight: 'bold' },
  infoTags: {
    flexDirection: 'row', justifyContent: 'space-around',
    backgroundColor: CARD, marginHorizontal: 16,
    borderRadius: 12, padding: 14, marginTop: 14,
  },
  infoTag: { alignItems: 'center' },
  infoTagText: { color: '#fff', fontSize: 11, fontWeight: '600', marginTop: 4 },

  altTitleBox: { marginHorizontal: 16, marginTop: 12 },
  altTitleLabel: { color: '#a0a0b0', fontSize: 11, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  altTitleList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  altTitleChip: {
    backgroundColor: '#1e2a4a', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  altTitleText: { color: '#c0c0d0', fontSize: 12 },

  actionRow: { flexDirection: 'row', paddingHorizontal: 16, marginTop: 14, gap: 8 },
  primaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 13,
  },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  secondaryBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: CARD, borderRadius: 12, paddingVertical: 13,
    borderWidth: 1, borderColor: ACCENT,
  },
  secondaryBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  secondaryBtnText: { color: ACCENT, fontWeight: 'bold', fontSize: 14 },
  iconSquareBtn: {
    backgroundColor: CARD, borderRadius: 12,
    paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center',
  },

  sourceRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, marginTop: 8,
  },
  sourceText: { color: '#4a4a6a', fontSize: 11, flex: 1 },

  tabs: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 20,
    backgroundColor: CARD, borderRadius: 12, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderRadius: 9 },
  tabActive: { backgroundColor: ACCENT },
  tabText: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#fff' },

  synopsisBox: { paddingHorizontal: 16, marginTop: 16 },
  synopsisText: { color: '#c0c0d0', fontSize: 14, lineHeight: 22 },
  synopsisToggle: { color: ACCENT, marginTop: 10, fontSize: 13 },

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
    backgroundColor: CARD, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8,
  },
  chapterLeft: { flex: 1 },
  chapterNumber: { color: ACCENT, fontSize: 13, fontWeight: 'bold' },
  chapterTitle: { color: '#a0a0b0', fontSize: 12, marginTop: 2 },
  chapterRight: { alignItems: 'flex-end', marginRight: 10 },
  chapterDate: { color: '#a0a0b0', fontSize: 11 },
  chapterPages: { color: '#2a2a4a', fontSize: 10, marginTop: 2 },

  similarBox: { padding: 40, alignItems: 'center' },
  similarEmpty: { color: '#a0a0b0', fontSize: 14, marginTop: 12, textAlign: 'center' },
});
