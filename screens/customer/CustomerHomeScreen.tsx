import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import type { RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerTabs'>;

export default function CustomerHomeScreen({ route, navigation }: Props) {
  const { customerName } = route.params;
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { label: 'Fruits & Veg', icon: 'leaf-outline', color: '#10B981' },
    { label: 'Dairy & Bread', icon: 'water-outline', color: '#3B82F6' },
    { label: 'Snacks', icon: 'pizza-outline', color: '#F59E0B' },
    { label: 'Cold Drinks', icon: 'ice-cream-outline', color: '#06B6D4' },
    { label: 'Instant Food', icon: 'restaurant-outline', color: '#EF4444' },
    { label: 'Personal Care', icon: 'sparkles-outline', color: '#EC4899' },
    { label: 'Household', icon: 'briefcase-outline', color: '#8B5CF6' },
    { label: 'Meat', icon: 'cube-outline', color: '#F97316' },
  ];

  const handleQuickBuy = (itemName: string) => {
    
    navigation.navigate('CustomerSearch', { customerName });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }}
                style={styles.avatar}
              />
            </View>
            <View style={styles.brandTitleContainer}>
              <Text style={styles.brandName}>NearFind</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <View style={styles.notifBadge} />
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('CustomerSearch', { customerName })}
          style={styles.searchBarContainer}
        >
          <Ionicons name="search-outline" size={20} color={Colors.textMuted} style={styles.searchIcon} />
          <Text style={styles.searchPlaceholder}>Search for groceries, snacks...</Text>
          <Ionicons name="mic-outline" size={20} color={Colors.primary} style={styles.micIcon} />
        </TouchableOpacity>

        {/* Banner Carousel (Single Promo matching Figma) */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerScrollView}
        >
          <View style={styles.promoBanner}>
            <View style={styles.bannerLeft}>
              <View style={styles.ultraFastBadge}>
                <Text style={styles.ultraFastText}>ULTRA FAST</Text>
              </View>
              <Text style={styles.bannerTitle}>Delivery in 10 mins</Text>
              <Text style={styles.bannerSubtitle}>Freshness at your doorstep, now.</Text>
            </View>
            <View style={styles.bannerRight}>
              {/* Purple grocery bag overlay visual layout */}
              <View style={styles.bagGraphicContainer}>
                <Ionicons name="basket" size={64} color="rgba(255, 255, 255, 0.25)" />
              </View>
            </View>
          </View>

          {/* Secondary Banner matching right side peek */}
          <View style={[styles.promoBanner, { backgroundColor: '#A3D900', marginLeft: 10 }]}>
            <View style={styles.bannerLeft}>
              <Text style={[styles.bannerTitle, { color: '#1A1135', fontSize: 22 }]}>FLAT 50% OFF</Text>
              <Text style={[styles.bannerSubtitle, { color: '#1A1135', fontWeight: 'bold' }]}>On your first 3 orders</Text>
              <TouchableOpacity style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>ORDER NOW</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Categories Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CustomerSearch', { customerName })}>
            <Text style={styles.seeAllText}>SEE ALL</Text>
          </TouchableOpacity>
        </View>

        {/* 4x2 Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('CustomerSearch', { customerName })}
            >
              <View style={styles.categoryIconBg}>
                <Ionicons name={cat.icon as any} size={24} color={Colors.primary} />
              </View>
              <Text style={styles.categoryText} numberOfLines={2}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Buy It Again */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Buy it Again</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollList}
        >
          {/* Item 1 */}
          <View style={styles.productCardHorizontal}>
            <Image
              source={require('../../assets/fresh_whole_milk.png')}
              style={styles.productImageHorizontal}
            />
            <View style={styles.productInfoHorizontal}>
              <Text style={styles.productName} numberOfLines={1}>Fresh Whole Milk</Text>
              <Text style={styles.productPrice}>₹75</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleQuickBuy('Fresh Whole Milk')}>
                <Text style={styles.addButtonText}>+ ADD</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Item 2 */}
          <View style={styles.productCardHorizontal}>
            <Image
              source={require('../../assets/premium_bananas.png')}
              style={styles.productImageHorizontal}
            />
            <View style={styles.productInfoHorizontal}>
              <Text style={styles.productName} numberOfLines={1}>Premium Bananas</Text>
              <Text style={styles.productPrice}>₹60</Text>
              <TouchableOpacity style={styles.addButton} onPress={() => handleQuickBuy('Premium Bananas')}>
                <Text style={styles.addButtonText}>+ ADD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Trending Near You */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Near You</Text>
        </View>

        <View style={styles.verticalList}>
          {/* Sparkling Lime Soda */}
          <View style={styles.trendingCard}>
            <Image
              source={require('../../assets/sparkling_lime_soda.png')}
              style={styles.trendingImage}
            />
            <View style={styles.trendingInfo}>
              <View style={styles.tagRow}>
                <View style={styles.bestSellerTag}>
                  <Text style={styles.tagText}>BESTSELLER</Text>
                </View>
              </View>
              <Text style={styles.trendingName}>Sparkling Lime Soda</Text>
              <Text style={styles.trendingDesc}>300ml • Chilled</Text>
              <View style={styles.priceRow}>
                <Text style={styles.trendingPrice}>₹45</Text>
                <View style={styles.stockTag}>
                  <Text style={styles.stockText}>IN STOCK</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.plusButton} onPress={() => handleQuickBuy('Sparkling Lime Soda')}>
              <Ionicons name="add" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Artisanal Sea Salt Chips */}
          <View style={styles.trendingCard}>
            <Image
              source={require('../../assets/sea_salt_chips.png')}
              style={styles.trendingImage}
            />
            <View style={styles.trendingInfo}>
              <View style={styles.tagRow}>
                <View style={[styles.bestSellerTag, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.tagText, { color: '#D97706' }]}>NEW ARRIVAL</Text>
                </View>
              </View>
              <Text style={styles.trendingName}>Artisanal Sea Salt Chips</Text>
              <Text style={styles.trendingDesc}>150g • Hand-cooked</Text>
              <View style={styles.priceRow}>
                <Text style={styles.trendingPrice}>₹120</Text>
                <View style={[styles.stockTag, { backgroundColor: '#FEE2E2' }]}>
                  <Text style={[styles.stockText, { color: '#EF4444' }]}>ONLY 5 LEFT</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.plusButton} onPress={() => handleQuickBuy('Artisanal Sea Salt Chips')}>
              <Ionicons name="add" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  brandTitleContainer: {
    marginLeft: 12,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    zIndex: 1,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EEFF',
    borderRadius: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9E3FF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 14,
    color: '#8A84A0',
    fontWeight: '500',
  },
  micIcon: {
    marginLeft: 10,
  },
  bannerScrollView: {
    paddingLeft: 16,
    marginBottom: 24,
  },
  promoBanner: {
    width: width - 52,
    backgroundColor: '#6C2BD9',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bannerLeft: {
    flex: 1.2,
    zIndex: 2,
  },
  ultraFastBadge: {
    backgroundColor: '#C8FF00',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  ultraFastText: {
    color: '#1A1135',
    fontWeight: '900',
    fontSize: 10,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 28,
  },
  bannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    lineHeight: 16,
  },
  bannerRight: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bagGraphicContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerButton: {
    backgroundColor: '#1A1135',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  bannerButtonText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  categoryCard: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  categoryIconBg: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F0ECF9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A1135',
    textAlign: 'center',
  },
  horizontalScrollList: {
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 28,
  },
  productCardHorizontal: {
    width: 170,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  productImageHorizontal: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    backgroundColor: '#FAF9FF',
    marginBottom: 8,
  },
  productInfoHorizontal: {
    paddingHorizontal: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1135',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  verticalList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0ECF9',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  trendingImage: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#FAF9FF',
  },
  trendingInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bestSellerTag: {
    backgroundColor: '#EBFEDE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#22C55E',
  },
  trendingName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1135',
    marginBottom: 2,
  },
  trendingDesc: {
    fontSize: 12,
    color: '#8A84A0',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trendingPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  stockTag: {
    backgroundColor: '#EBFEDE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stockText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#22C55E',
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
