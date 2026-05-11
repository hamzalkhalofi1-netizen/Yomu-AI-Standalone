import React, { useRef, useState } from 'react';
import {
  Dimensions, FlatList, Image, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 32;

export default function FeaturedSlider({ data, onPress }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (ITEM_WIDTH + 12));
    setActiveIndex(idx);
  };

  return (
    <View>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + 12}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.slide}
            activeOpacity={0.9}
            onPress={() => onPress && onPress(item)}
          >
            <Image source={{ uri: item.cover }} style={styles.image} />
            <View style={styles.overlay} />
            <View style={styles.slideContent}>
              <View style={styles.genrePill}>
                <Text style={styles.genreText}>{item.genre}</Text>
              </View>
              <Text style={styles.slideTitle}>{item.title}</Text>
              <Text style={styles.slideDesc} numberOfLines={2}>{item.description}</Text>
              <View style={styles.slideFooter}>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#e94560" />
                  <Text style={styles.ratingText}> {item.rating}</Text>
                </View>
                <TouchableOpacity style={styles.readBtn} onPress={() => onPress && onPress(item)}>
                  <Text style={styles.readBtnText}>Lire maintenant  </Text>
                  <Ionicons name="arrow-forward" size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.dots}>
        {data.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width: ITEM_WIDTH, height: 220,
    borderRadius: 16, overflow: 'hidden', backgroundColor: '#16213e',
  },
  image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,10,26,0.65)' },
  slideContent: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  genrePill: {
    alignSelf: 'flex-start', backgroundColor: '#e94560',
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 6,
  },
  genreText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  slideTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  slideDesc: { color: 'rgba(255,255,255,0.75)', fontSize: 12, lineHeight: 17, marginBottom: 10 },
  slideFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingRow: { flexDirection: 'row', alignItems: 'center' },
  ratingText: { color: '#e94560', fontWeight: 'bold', fontSize: 13 },
  readBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e94560', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7,
  },
  readBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#2a2a4a', marginHorizontal: 3,
  },
  dotActive: { backgroundColor: '#e94560', width: 18 },
});
