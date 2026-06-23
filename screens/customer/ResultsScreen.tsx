import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { getStockForProduct } from '../../services/firestore';
import type { RetailerStockWithName, RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerResults'>;

// Mock distances/ETA for demo — in production these come from a geolocation service
const MOCK_DISTANCES = ['0.8 km', '1.4 km', '2.1 km', '0.5 km', '3.2 km'];
const MOCK_ETAS = ['12 MINS', '20 MINS', '25 MINS', '8 MINS', '30 MINS'];

export default function ResultsScreen({ route, navigation }: Props) {
  const { customerName, productId, productName } = route.params;
  const [stocks, setStocks] = useState<RetailerStockWithName[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getStockForProduct(productId);
        // Sort: in-stock first, then by price ascending
        data.sort((a, b) => {
          if (a.stock === 0 && b.stock > 0) return 1;
          if (a.stock > 0 && b.stock === 0) return -1;
          return a.price - b.price;
        });
        setStocks(data);
      } catch (e) {
        console.warn('Failed to load stock:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [productId]);

  const handleSelect = (item: RetailerStockWithName) => {
    if (item.stock === 0) return;
    navigation.navigate('ConfirmOrder', {
      customerName,
      productId,
      productName,
      retailerId: item.retailerId,
      retailerName: item.retailerName,
      price: item.price,
      stock: item.stock,
    });
  };

  // Find the cheapest in-stock retailer for the "Neighborhood Favorite" banner
  const favoriteRetailer = stocks.find((s) => s.stock > 0);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {productName}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={14} color={Colors.white} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Section header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.localLabel}>LOCAL RESULTS</Text>
            <Text style={styles.sectionTitle}>Available Nearby</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn}>
            <Feather name="sliders" size={14} color={Colors.white} />
            <Text style={styles.filterText}>FILTERS</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 60 }} />
        ) : stocks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No retailers found</Text>
            <Text style={styles.emptyDesc}>
              No nearby stores currently carry {productName}.
            </Text>
          </View>
        ) : (
          <>
            {/* Retailer cards */}
            {stocks.map((item, index) => {
              const inStock = item.stock > 0;
              const distance = MOCK_DISTANCES[index % MOCK_DISTANCES.length];
              const eta = MOCK_ETAS[index % MOCK_ETAS.length];

              return (
                <View
                  key={item.id}
                  style={[
                    styles.retailerCard,
                    !inStock && styles.retailerCardDisabled,
                  ]}
                >
                  <View style={styles.retailerCardTop}>
                    {/* Store icon */}
                    <View style={[styles.storeIcon, !inStock && styles.storeIconDisabled]}>
                      <MaterialCommunityIcons
                        name="storefront-outline"
                        size={28}
                        color={inStock ? Colors.primary : Colors.outOfStock}
                      />
                    </View>

                    {/* Store info */}
                    <View style={styles.storeInfo}>
                      <Text style={[styles.storeName, !inStock && styles.storeNameDisabled]}>
                        {item.retailerName}
                      </Text>
                      <View style={styles.storeMetaRow}>
                        {inStock ? (
                          <>
                            <View style={styles.liveStockBadge}>
                              <View style={styles.liveStockDot} />
                              <Text style={styles.liveStockText}>LIVE STOCK</Text>
                            </View>
                            <Text style={styles.distanceText}>{distance}</Text>
                          </>
                        ) : (
                          <Text style={styles.distanceText}>{distance}</Text>
                        )}
                      </View>
                    </View>

                    {/* Price & stock */}
                    <View style={styles.priceBlock}>
                      {inStock ? (
                        <>
                          <Text style={styles.priceText}>₹{item.price.toFixed(2)}</Text>
                          <Text style={styles.stockCount}>{item.stock} in stock</Text>
                        </>
                      ) : (
                        <View style={styles.outOfStockBadge}>
                          <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Bottom row */}
                  <View style={styles.retailerCardBottom}>
                    {inStock ? (
                      <>
                        <View style={styles.etaRow}>
                          <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                          <Text style={styles.etaText}>ETA {eta}</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.selectBtn}
                          activeOpacity={0.7}
                          onPress={() => handleSelect(item)}
                        >
                          <Text style={styles.selectBtnText}>SELECT</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.restockText}>
                          <Text style={{ fontStyle: 'italic' }}>Next restock expected{'\n'}tomorrow</Text>
                        </Text>
                        <TouchableOpacity
                          style={[styles.selectBtn, styles.selectBtnDisabled]}
                          disabled
                        >
                          <Text style={[styles.selectBtnText, styles.selectBtnTextDisabled]}>SELECT</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Neighborhood Favorite banner */}
            {favoriteRetailer && (
              <View style={styles.favoriteBanner}>
                <View style={styles.favoriteBadge}>
                  <Text style={styles.favoriteBadgeText}>NEIGHBORHOOD FAVORITE</Text>
                </View>
                <Text style={styles.favoriteStoreName}>{favoriteRetailer.retailerName}</Text>
                <Text style={styles.favoriteDesc}>
                  Rated #1 for {productName} & Snacks in your area.{'\n'}Fast 12-min delivery!
                </Text>
                <TouchableOpacity
                  style={styles.orderNowBtn}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(favoriteRetailer)}
                >
                  <Text style={styles.orderNowText}>ORDER NOW</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.background,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notifBtn: {
    padding: 4,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  localLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  filterText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },

  // Retailer cards
  retailerCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  retailerCardDisabled: {
    opacity: 0.6,
    backgroundColor: Colors.outOfStockBg,
  },
  retailerCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  storeIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: Colors.customerCardBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeIconDisabled: {
    backgroundColor: Colors.outOfStockBg,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  storeNameDisabled: {
    color: Colors.outOfStock,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 0.3,
  },
  distanceText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  stockCount: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  outOfStockBadge: {
    backgroundColor: Colors.errorBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: 0.5,
  },

  // Bottom row
  retailerCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  selectBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
  },
  selectBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  selectBtnDisabled: {
    backgroundColor: Colors.outOfStock,
    opacity: 0.5,
  },
  selectBtnTextDisabled: {
    color: Colors.white,
  },
  restockText: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 16,
  },

  // Favorite banner
  favoriteBanner: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    marginTop: 4,
    alignItems: 'center',
  },
  favoriteBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  favoriteBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 1,
  },
  favoriteStoreName: {
    fontSize: 24,
    fontWeight: '900',
    color: Colors.white,
    marginBottom: 6,
  },
  favoriteDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  orderNowBtn: {
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
  },
  orderNowText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
});
