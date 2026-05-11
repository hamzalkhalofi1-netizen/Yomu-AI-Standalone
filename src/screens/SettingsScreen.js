import React from 'react';
import {
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useManga } from '../context/MangaContext';

const BG = '#0f0f1a';
const CARD = '#16213e';
const ACCENT = '#e94560';

function SettingRow({ icon, label, value, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, danger && styles.rowDanger]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Text style={styles.rowArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { library, removeFromLibrary } = useManga();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView>
        <Text style={styles.sectionLabel}>LECTURE</Text>
        <View style={styles.card}>
          <SettingRow icon="🌙" label="Thème" value="Sombre" />
          <SettingRow icon="📖" label="Mode lecture" value="Vertical" />
          <SettingRow icon="🔤" label="Langue UI" value="Français" />
        </View>

        <Text style={styles.sectionLabel}>BIBLIOTHÈQUE</Text>
        <View style={styles.card}>
          <SettingRow
            icon="📚"
            label="Manga importés"
            value={`${library.length}`}
          />
          <SettingRow
            icon="🔄"
            label="Actualiser les sources"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionLabel}>À PROPOS</Text>
        <View style={styles.card}>
          <SettingRow icon="ℹ" label="Version" value="1.0.0" />
          <SettingRow icon="🔒" label="Confidentialité" />
          <SettingRow icon="📝" label="Conditions d'utilisation" />
        </View>

        <Text style={styles.sectionLabel}>DONNÉES</Text>
        <View style={styles.card}>
          <SettingRow
            icon="🗑"
            label="Vider la bibliothèque"
            danger
            onPress={() => {
              library.forEach((m) => removeFromLibrary(m.id));
            }}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Yomu AI · Fait avec ❤</Text>
          <Text style={styles.footerSub}>Thème sombre · Accent #e94560</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14, marginTop: 8,
  },
  backBtn: { color: ACCENT, fontSize: 14, fontWeight: '600' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionLabel: {
    color: '#4a4a6a', fontSize: 11, fontWeight: 'bold',
    marginHorizontal: 16, marginTop: 22, marginBottom: 8, letterSpacing: 1,
  },
  card: {
    marginHorizontal: 16, backgroundColor: CARD,
    borderRadius: 14, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1e2a4a',
  },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1e2a4a',
  },
  rowIcon: { fontSize: 18, marginRight: 12 },
  rowLabel: { color: '#fff', fontSize: 14 },
  rowDanger: { color: ACCENT },
  rowValue: { color: '#a0a0b0', fontSize: 13, marginRight: 8 },
  rowArrow: { color: '#4a4a6a', fontSize: 18 },
  footer: { alignItems: 'center', marginTop: 32, marginBottom: 20 },
  footerText: { color: '#4a4a6a', fontSize: 13 },
  footerSub: { color: '#2a2a4a', fontSize: 11, marginTop: 4 },
});
