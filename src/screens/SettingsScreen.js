import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

function SettingsRow({ icon, label, value, onPress, toggle, toggleValue, onToggle, danger }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={toggle ? 1 : 0.7}>
      <View style={[styles.iconBox, danger && styles.iconBoxDanger]}>
        <Ionicons name={icon} size={18} color="#e94560" />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#2a2a4a', true: '#e94560' }}
          thumbColor="#fff"
        />
      ) : value ? (
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{value}</Text>
          <Ionicons name="chevron-forward" size={16} color="#2a2a4a" />
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#2a2a4a" />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [dataMode, setDataMode] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Paramètres</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.groupLabel}>Apparence</Text>
        <View style={styles.group}>
          <SettingsRow icon="moon-outline" label="Mode sombre" toggle toggleValue={darkMode} onToggle={setDarkMode} />
          <View style={styles.divider} />
          <SettingsRow icon="text-outline" label="Taille de police" value="Normale" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="color-palette-outline" label="Thème" value="Rouge" onPress={() => {}} />
        </View>

        <Text style={styles.groupLabel}>Lecture</Text>
        <View style={styles.group}>
          <SettingsRow icon="play-circle-outline" label="Lecture automatique" toggle toggleValue={autoPlay} onToggle={setAutoPlay} />
          <View style={styles.divider} />
          <SettingsRow icon="phone-portrait-outline" label="Orientation" value="Portrait" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="eye-outline" label="Mode de lecture" value="Vertical" onPress={() => {}} />
        </View>

        <Text style={styles.groupLabel}>Notifications</Text>
        <View style={styles.group}>
          <SettingsRow icon="notifications-outline" label="Activer les notifications" toggle toggleValue={notifications} onToggle={setNotifications} />
          <View style={styles.divider} />
          <SettingsRow icon="mail-outline" label="Email de mises à jour" toggle toggleValue={false} onToggle={() => {}} />
        </View>

        <Text style={styles.groupLabel}>Données & Stockage</Text>
        <View style={styles.group}>
          <SettingsRow icon="cellular-outline" label="Mode économiseur de données" toggle toggleValue={dataMode} onToggle={setDataMode} />
          <View style={styles.divider} />
          <SettingsRow icon="cloud-download-outline" label="Qualité des images" value="Haute" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="trash-outline" label="Vider le cache" value="124 MB" onPress={() => {}} />
        </View>

        <Text style={styles.groupLabel}>Compte</Text>
        <View style={styles.group}>
          <SettingsRow icon="shield-checkmark-outline" label="Confidentialité" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="document-text-outline" label="Conditions d'utilisation" onPress={() => {}} />
          <View style={styles.divider} />
          <SettingsRow icon="information-circle-outline" label="À propos" value="v1.0.0" onPress={() => {}} />
        </View>

        <Text style={styles.groupLabel}>Zone dangereuse</Text>
        <View style={styles.group}>
          <SettingsRow icon="log-out-outline" label="Se déconnecter" onPress={() => {}} danger />
          <View style={styles.divider} />
          <SettingsRow icon="trash-outline" label="Supprimer le compte" onPress={() => {}} danger />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#16213e',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  groupLabel: {
    color: '#a0a0b0', fontSize: 12, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 1,
    paddingHorizontal: 16, marginTop: 24, marginBottom: 8,
  },
  group: { backgroundColor: '#16213e', marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(233,69,96,0.12)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  iconBoxDanger: { backgroundColor: 'rgba(233,69,96,0.08)' },
  rowLabel: { flex: 1, color: '#fff', fontSize: 14 },
  rowLabelDanger: { color: '#e94560' },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowValue: { color: '#a0a0b0', fontSize: 13, marginRight: 6 },
  divider: { height: 1, backgroundColor: '#0f0f1a', marginLeft: 62 },
});
