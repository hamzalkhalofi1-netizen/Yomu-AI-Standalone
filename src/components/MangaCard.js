import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MangaCard({ item, onPress, style }) {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        <Image source={{ uri: item.cover }} style={styles.cover} />
        {item.status === 'En cours' && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>En cours</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        {item.genre ? <Text style={styles.genre} numberOfLines={1}>{item.genre}</Text> : null}
        {item.rating ? (
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={10} color="#e94560" />
            <Text style={styles.rating}> {item.rating}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 120, marginRight: 12 },
  imageWrapper: { borderRadius: 10, overflow: 'hidden' },
  cover: { width: 120, height: 170, backgroundColor: '#16213e', resizeMode: 'cover' },
  badge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: '#e94560', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  info: { marginTop: 6 },
  title: { color: '#ffffff', fontSize: 12, fontWeight: '600', lineHeight: 16 },
  genre: { color: '#a0a0b0', fontSize: 10, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  rating: { color: '#e94560', fontSize: 10, fontWeight: 'bold' },
});
