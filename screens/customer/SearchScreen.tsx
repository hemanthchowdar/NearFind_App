import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { searchProducts, getAllProducts } from '../../services/firestore';
import type { Product, RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerSearch'>;

const POPULAR_SEARCHES = ['Maggi Noodles', 'Amul Milk', 'Britannia Bread', 'Coca Cola'];

export default function SearchScreen({ route, navigation }: Props) {
  const { customerName } = route.params;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const products = await getAllProducts();
        setAllProducts(products);
      } catch (e) {
        console.warn('Failed to load products:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchProducts(query);
        setResults(found);
      } catch (e) {
        console.warn('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('CustomerResults', {
      customerName,
      productId: product.id,
      productName: product.name,
    });
  };

  const handlePopularSearch = (term: string) => {
    setQuery(term);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatarCircle}>
              <Ionicons name="person" size={16} color={Colors.white} />
            </View>
            <Text style={styles.headerLogo}>NearFind</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a product..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="mic-outline" size={20} color={Colors.textMuted} />
          )}
        </View>

        {/* Popular Searches (shown when no query) */}
        {!query.trim() && (
          <View style={styles.popularSection}>
            <View style={styles.popularHeader}>
              <Text style={styles.popularTitle}>Popular Searches</Text>
              <TouchableOpacity>
                <Text style={styles.clearHistory}>Clear History</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chipsContainer}>
              {POPULAR_SEARCHES.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={styles.chip}
                  onPress={() => handlePopularSearch(term)}
                >
                  <Text style={styles.chipText}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty / Illustration state */}
        {!hasSearched && !query.trim() && (
          <View style={styles.emptyState}>
            <View style={styles.emptyCircleOuter}>
              <View style={styles.emptyCircleInner}>
                <Ionicons name="basket-outline" size={48} color={Colors.primary} />
              </View>
              <View style={styles.searchIconFloat}>
                <Ionicons name="search" size={20} color={Colors.textPrimary} />
              </View>
            </View>
            <Text style={styles.emptyTitle}>Ready to find something?</Text>
            <Text style={styles.emptySubtitle}>
              Type your favorite snacks, dairy, or daily{'\n'}essentials to see what's near you.
            </Text>

            {/* Feature cards */}
            <View style={styles.featureRow}>
              <View style={styles.featureCard}>
                <View style={styles.featureIconCircle}>
                  <Ionicons name="flash-outline" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.featureTitle}>Super Fast</Text>
                <Text style={styles.featureDesc}>Get delivered in under 15 mins</Text>
              </View>
              <View style={styles.featureCard}>
                <View style={[styles.featureIconCircle, { backgroundColor: '#FFF7ED' }]}>
                  <MaterialCommunityIconsAlt name="truck-delivery-outline" size={20} color="#D97706" />
                </View>
                <Text style={styles.featureTitle}>Live Track</Text>
                <Text style={styles.featureDesc}>Real-time delivery updates</Text>
              </View>
            </View>
          </View>
        )}

        {/* Search Results */}
        {hasSearched && (
          <View style={styles.resultsSection}>
            {loading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 40 }} />
            ) : results.length === 0 ? (
              <View style={styles.noResults}>
                <Ionicons name="search-outline" size={48} color={Colors.textMuted} />
                <Text style={styles.noResultsTitle}>No products found</Text>
                <Text style={styles.noResultsDesc}>
                  Try searching for "Maggi", "Milk", or "Bread"
                </Text>
              </View>
            ) : (
              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultCard}
                    activeOpacity={0.7}
                    onPress={() => handleProductPress(item)}
                  >
                    <View style={styles.resultIconCircle}>
                      <Ionicons name="cube-outline" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.resultTextBlock}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultHint}>Tap to see nearby retailers</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function MaterialCommunityIconsAlt({ name, size, color }: { name: string; size: number; color: string }) {
  
  return <Feather name="truck" size={size} color={color} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerLogo: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  notifBtn: {
    padding: 4,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },

  popularSection: {
    marginBottom: 24,
  },
  popularHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  clearHistory: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  emptyState: {
    alignItems: 'center',
    marginTop: 20,
  },
  emptyCircleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyCircleInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIconFloat: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },

  featureRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  featureIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.customerCardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },

  resultsSection: {
    flex: 1,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  resultIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.customerCardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultTextBlock: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resultHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  noResults: {
    alignItems: 'center',
    marginTop: 60,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  noResultsDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
});
