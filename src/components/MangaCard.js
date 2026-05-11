import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function MangaCard({ item, onPress, style }) {
  if (!item) return null;

  const title = item.title || 'Sans titre';
  const cover = item.cover || null;
  const genre = item.genre || null;
  const rating = item.rating != null ? String(item.rating) : null;
  const isOngoing = item.status === 'En cours';

  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageWrapper}>
        {cover ? (
          <Image source={{ uri: cover }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Text style={styles.placeholderIcon}>📖</Text>
          </View>
        )}
        {isOngoing && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>En cours</Text>
          </View>
        )}
        {item.sourceUrl && <View style={styles.importedDot} />}
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {genre ? <Text style={styles.genre} numberOfLines={1}>{genre}</Text> : null}
        {rating ? (
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.rating}> {rating}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 120, marginRight: 12 },
  imageWrapper: { borderRadius: 10, overflow: 'hidden', position: 'relative' },
  cover: { width: 120, height: 170, backgroundColor: '#16213e' },
  coverPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderIcon: { fontSize: 28 },
  badge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: '#e94560', borderRadius: 4,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  importedDot: {
    position: 'absolute', top: 6, right: 6,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#4a90e2', borderWidth: 1, borderColor: '#0f0f1a',
  },
  info: { marginTop: 6 },
  title: { color: '#ffffff', fontSize: 12, fontWeight: '600', lineHeight: 16 },
  genre: { color: '#a0a0b0', fontSize: 10, marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  star: { color: '#e94560', fontSize: 10 },
  rating: { color: '#e94560', fontSize: 10, fontWeight: 'bold' },
});
