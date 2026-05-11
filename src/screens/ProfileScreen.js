import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { USER_PROFILE } from '../data/mockData';

const STAT_ITEMS = [
  { label: 'Manga lus', value: USER_PROFILE.mangaRead },
  { label: 'Chapitres', value: USER_PROFILE.chaptersRead.toLocaleString() },
  { label: 'Abonnements', value: USER_PROFILE.following },
];

const MENU_ITEMS = [
  { icon: 'heart-outline', label: 'Mes Favoris', badge: '12' },
  { icon: 'download-outline', label: 'Téléchargements', badge: null },
  { icon: 'time-outline', label: 'Historique de lecture', badge: null },
  { icon: 'notifications-outline', label: 'Notifications', badge: '3' },
  { icon: 'settings-outline', label: 'Paramètres', screen: 'Settings' },
  { icon: 'help-circle-outline', label: 'Aide & Support', badge: null },
];

export default function ProfileScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Profil</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={22} color="#a0a0b0" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{USER_PROFILE.name.charAt(0)}</Text>
            </View>
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{USER_PROFILE.name}</Text>
          <Text style={styles.userHandle}>{USER_PROFILE.username}</Text>
          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STAT_ITEMS.map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < STAT_ITEMS.length - 1 && <View style={styles.statDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* Favorites */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Mes Favoris</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Voir tout</Text></TouchableOpacity>
          </View>
          <View style={styles.favRow}>
            {USER_PROFILE.favorites.map((fav) => (
              <View key={fav.id} style={styles.favItem}>
                <Image source={{ uri: fav.cover }} style={styles.favCover} />
                <Text style={styles.favTitle} numberOfLines={1}>{fav.title}</Text>
                <Text style={styles.favProgress}>{fav.progress}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.menuRow, i < MENU_ITEMS.length - 1 && styles.menuRowBorder]}
                onPress={() => item.screen && navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIconBox}>
                    <Ionicons name={item.icon} size={18} color="#e94560" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <View style={styles.menuRight}>
                  {item.badge && (
                    <View style={styles.menuBadge}>
                      <Text style={styles.menuBadgeText}>{item.badge}</Text>
                    </View>
                  )}
                  <Ionicons name="chevron-forward" size={16} color="#2a2a4a" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn}>
          <Ionicons name="log-out-outline" size={18} color="#e94560" />
          <Text style={styles.signOutText}> Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16,
  },
  pageTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  avatarCard: {
    alignItems: 'center', paddingVertical: 24,
    backgroundColor: '#16213e', marginHorizontal: 16,
    borderRadius: 16, marginBottom: 16,
  },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: '#e94560', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#0f0f1a',
  },
  avatarText: { color: '#fff', fontSize: 34, fontWeight: 'bold' },
  editAvatarBtn: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: '#e94560', borderRadius: 12,
    padding: 5, borderWidth: 2, borderColor: '#0f0f1a',
  },
  userName: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  userHandle: { color: '#a0a0b0', fontSize: 13, marginTop: 3 },
  editProfileBtn: {
    marginTop: 14, borderWidth: 1, borderColor: '#e94560',
    borderRadius: 10, paddingHorizontal: 24, paddingVertical: 8,
  },
  editProfileText: { color: '#e94560', fontWeight: '600', fontSize: 13 },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#16213e',
    marginHorizontal: 16, borderRadius: 14, padding: 18, marginBottom: 20,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  statLabel: { color: '#a0a0b0', fontSize: 11, marginTop: 3 },
  statDivider: { width: 1, backgroundColor: '#2a2a4a' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  seeAll: { color: '#e94560', fontSize: 13 },
  favRow: { flexDirection: 'row' },
  favItem: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  favCover: { width: '100%', aspectRatio: 0.7, borderRadius: 10, backgroundColor: '#16213e' },
  favTitle: { color: '#fff', fontSize: 11, marginTop: 6, textAlign: 'center' },
  favProgress: { color: '#a0a0b0', fontSize: 10, marginTop: 2 },
  menuCard: { backgroundColor: '#16213e', borderRadius: 14, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#0f0f1a' },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(233,69,96,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  menuLabel: { color: '#fff', fontSize: 14 },
  menuRight: { flexDirection: 'row', alignItems: 'center' },
  menuBadge: {
    backgroundColor: '#e94560', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, marginRight: 8,
  },
  menuBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 16, padding: 14, borderRadius: 12,
    backgroundColor: 'rgba(233,69,96,0.1)',
    borderWidth: 1, borderColor: 'rgba(233,69,96,0.3)',
  },
  signOutText: { color: '#e94560', fontWeight: 'bold', fontSize: 14 },
});
