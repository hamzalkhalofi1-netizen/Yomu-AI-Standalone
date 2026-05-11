import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { fetchMangaList } from './src/utils/scraper';

const DEMO_SOURCE = 'https://olympusscanlation.com/manga/';

export default function App() {
  const [mangaList, setMangaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchMangaList(DEMO_SOURCE);
      setMangaList(results);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {item.cover ? (
        <Image source={{ uri: item.cover }} style={styles.cover} />
      ) : (
        <View style={styles.coverPlaceholder}>
          <Text style={styles.placeholderText}>No Cover</Text>
        </View>
      )}
      <Text style={styles.title} numberOfLines={2}>
        {item.title || 'Untitled'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <View style={styles.header}>
        <Text style={styles.headerText}>Yomu AI</Text>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#e94560" />
          <Text style={styles.loadingText}>Loading manga...</Text>
        </View>
      )}

      {!loading && error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && mangaList.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No manga found.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && mangaList.length > 0 && (
        <FlatList
          data={mangaList}
          keyExtractor={(_, i) => String(i)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#e94560',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#a0a0b0',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14,
  },
  emptyText: {
    color: '#a0a0b0',
    fontSize: 14,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#e94560',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  list: {
    padding: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#16213e',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  cover: {
    width: '100%',
    aspectRatio: 0.7,
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    aspectRatio: 0.7,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#a0a0b0',
    fontSize: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 12,
    padding: 8,
    textAlign: 'center',
  },
});
