import React from 'react';
import {
  FlatList, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useManga } from '../context/MangaContext';
import { USER_PROFILE } from '../data/mockData';

const BG = '#0f0f1a';
const CARD = '#16213e';
const ACCENT = '#e94560';

function StatBox({ value, label }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { library } = useManga();

  const totalChapters = library.reduce((acc, m) => {
    if (typeof m.chapters === 'number') return acc + m.chapters;
    if (Array.isArray(m.chapters)) return acc + m.chapters.length;
    return acc;
  }, 0);

  const favorites = library.length > 0 ? library.slice(0, 3) : USER_PROFILE.favorites;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headerBg, { paddingTop: insets.top + 20 }]}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {USER_PROFILE.name.charAt(0)}
            </Text>
          </View>
        </View>
        <Text style={styles.name}>{USER_PROFILE.name}</Text>
        <Text style={styles.username}>{USER_PROFILE.username}</Text>

        <View style={styles.statsRow}>
          <StatBox value={library.length || USER_PROFILE.mangaRead} label="Manga" />
          <View style={styles.statDivider} />
          <StatBox value={totalChapters || USER_PROFILE.chaptersRead} label="Chapitres" />
          <View style={styles.statDivider} />
          <StatBox value={USER_PROFILE.following} label="Suivis" />
        </View>
      </View>

      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsBtnText}>⚙ Paramètres</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>❤ Favoris</Text>
      <FlatList
        data={favorites}
        horizontal
        keyExtractor={(i) => i.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.favCard}
            onPress={() => navigation.navigate('Detail', { manga: item })}
          >
            {item.cover ? (
              <Image source={{ uri: item.cover }} style={styles.favCover} resizeMode="cover" />
            ) : (
              <View style={[styles.favCover, styles.favPlaceholder]}>
                <Text style={{ fontSize: 24 }}>📖</Text>
              </View>
            )}
            <View style={styles.favOverlay} />
            <Text style={styles.favTitle} numberOfLines={2}>{item.title}</Text>
            {item.progress && (
              <Text style={styles.favProgress}>{item.progress}</Text>
            )}
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionTitle}>📊 Activité récente</Text>
      <View style={styles.activityCard}>
        {library.length > 0 ? (
          library.slice(0, 5).map((m) => (
            <TouchableOpacity
              key={m.id}
              style={styles.activityRow}
              onPress={() => navigation.navigate('Detail', { manga: m })}
            >
              <View style={styles.activityDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{m.title}</Text>
                <Text style={styles.activitySub}>
                  {m.progress || 'En lecture'} · {m.addedAt
                    ? new Date(m.addedAt).toLocaleDateString('fr-FR')
                    : ''}
                </Text>
              </View>
              <Text style={styles.activityArrow}>›</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noActivity}>
            <Text style={styles.noActivityText}>
              Votre historique de lecture apparaîtra ici.
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Recherche')}>
              <Text style={styles.noActivityLink}>Découvrir des manga →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerBg: {
    backgroundColor: CARD, alignItems: 'center',
    paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
  },
  avatarRing: {
    width: 92, height: 92, borderRadius: 46,
    borderWidth: 3, borderColor: ACCENT,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatar: {
    width: 82, height: 82, borderRadius: 41,
    backgroundColor: '#1e2a4a', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: ACCENT, fontSize: 32, fontWeight: 'bold' },
  name: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  username: { color: '#a0a0b0', fontSize: 13, marginTop: 4, marginBottom: 18 },
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#0f0f1a', borderRadius: 16,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 4,
  },
  statBox: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#a0a0b0', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: '#1e2a4a' },
  settingsBtn: {
    alignSelf: 'flex-end', margin: 16,
    backgroundColor: CARD, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#1e2a4a',
  },
  settingsBtnText: { color: '#a0a0b0', fontSize: 13, fontWeight: '600' },
  sectionTitle: {
    color: '#fff', fontSize: 16, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 6, marginBottom: 12,
  },
  favCard: {
    width: 130, height: 180, borderRadius: 12, overflow: 'hidden',
    marginRight: 12, backgroundColor: CARD,
  },
  favCover: { width: '100%', height: '100%' },
  favPlaceholder: { backgroundColor: '#1a2a4a', alignItems: 'center', justifyContent: 'center' },
  favOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,26,0.5)' },
  favTitle: {
    position: 'absolute', bottom: 24, left: 8, right: 8,
    color: '#fff', fontSize: 12, fontWeight: 'bold',
  },
  favProgress: {
    position: 'absolute', bottom: 8, left: 8,
    color: ACCENT, fontSize: 10, fontWeight: 'bold',
  },
  activityCard: {
    marginHorizontal: 16, backgroundColor: CARD,
    borderRadius: 16, padding: 8, borderWidth: 1, borderColor: '#1e2a4a',
    marginTop: 4,
  },
  activityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: 8,
    borderBottomWidth: 1, borderBottomColor: '#1e2a4a',
  },
  activityDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: ACCENT, marginRight: 12,
  },
  activityTitle: { color: '#fff', fontSize: 13, fontWeight: '600' },
  activitySub: { color: '#a0a0b0', fontSize: 11, marginTop: 2 },
  activityArrow: { color: '#4a4a6a', fontSize: 18, marginLeft: 8 },
  noActivity: { padding: 16, alignItems: 'center' },
  noActivityText: { color: '#a0a0b0', fontSize: 13, textAlign: 'center', marginBottom: 10 },
  noActivityLink: { color: ACCENT, fontSize: 13, fontWeight: '600' },
});
