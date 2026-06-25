import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StatusBar,
  Dimensions,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../constants';
import { getAllRetailers, getAllDeliveryPartners } from '../services/firestore';
import type { Retailer, DeliveryPartner, RootStackParamList } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }: Props) {
  
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showRetailerModal, setShowRetailerModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [customerName, setCustomerName] = useState('');

  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [r, dp] = await Promise.all([getAllRetailers(), getAllDeliveryPartners()]);
        setRetailers(r);
        setDeliveryPartners(dp);
      } catch (e) {
        console.warn('Could not pre-fetch data:', e);
      }
    })();
  }, []);

  const roles = [
    {
      key: 'customer',
      title: 'Customer',
      description: 'Order essentials, food, and more from nearby vendors.',
      cta: 'Get Started',
      iconBg: Colors.customerCardBg,
      icon: <Ionicons name="person-outline" size={22} color={Colors.primary} />,
      decorIcon: <Ionicons name="cube-outline" size={36} color={Colors.border} />,
      onPress: () => setShowCustomerModal(true),
    },
    {
      key: 'retailer',
      title: 'Retailer',
      description: 'List products and reach customers in your immediate neighborhood.',
      cta: 'Merchant Portal',
      iconBg: Colors.retailerCardBg,
      icon: <MaterialCommunityIcons name="storefront-outline" size={22} color="#D97706" />,
      decorIcon: <MaterialCommunityIcons name="store-outline" size={36} color={Colors.border} />,
      onPress: () => setShowRetailerModal(true),
    },
    {
      key: 'delivery',
      title: 'Delivery Partner',
      description: 'Earn on your schedule by delivering items across the city.',
      cta: 'Join the Fleet',
      iconBg: Colors.deliveryCardBg,
      icon: <MaterialCommunityIcons name="truck-delivery-outline" size={22} color="#16A34A" />,
      decorIcon: <MaterialCommunityIcons name="motorbike" size={36} color={Colors.border} />,
      onPress: () => setShowDeliveryModal(true),
    },
    {
      key: 'admin',
      title: 'Admin',
      description: 'Manage city operations, monitor logistics, and support.',
      cta: 'Operator Console',
      iconBg: Colors.adminCardBg,
      icon: <Ionicons name="shield-checkmark-outline" size={22} color="#4F46E5" />,
      decorIcon: <Ionicons name="server-outline" size={36} color={Colors.border} />,
      onPress: () => navigation.navigate('AdminDashboard'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>NearFind</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={18} color={Colors.white} />
            </View>
          </View>
        </View>

        {/* Hero section */}
        <View style={styles.heroSection}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveBadgeText}>Now Live In Your Area</Text>
          </View>
          <Text style={styles.heroTitle}>
            Hyperlocal. Fast.{'\n'}
            <Text style={styles.heroTitleAccent}>Real-time.</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Select your role to start navigating the most energetic urban delivery network.
          </Text>
        </View>

        {/* Role cards */}
        {roles.map((role) => (
          <TouchableOpacity
            key={role.key}
            style={styles.roleCard}
            activeOpacity={0.7}
            onPress={role.onPress}
          >
            <View style={styles.roleCardContent}>
              <View style={[styles.roleIconCircle, { backgroundColor: role.iconBg }]}>
                {role.icon}
              </View>
              <View style={styles.roleTextBlock}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDesc}>{role.description}</Text>
                <View style={styles.roleCta}>
                  <Text style={styles.roleCtaText}>{role.cta}</Text>
                  <Ionicons name="arrow-forward" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
            <View style={styles.roleDecorIcon}>{role.decorIcon}</View>
          </TouchableOpacity>
        ))}

        {/* Bottom banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerOverlay}>
            <View style={styles.bannerAvatars}>
              <View style={[styles.bannerAvatar, { backgroundColor: '#6C2BD9' }]}>
                <Ionicons name="person" size={12} color="#fff" />
              </View>
              <View style={[styles.bannerAvatar, { backgroundColor: '#F59E0B', marginLeft: -8 }]}>
                <Ionicons name="person" size={12} color="#fff" />
              </View>
              <View style={[styles.bannerAvatar, { backgroundColor: '#22C55E', marginLeft: -8 }]}>
                <Ionicons name="person" size={12} color="#fff" />
              </View>
              <Text style={styles.bannerAvatarText}>+ 2.4k active users near you</Text>
            </View>
          </View>
        </View>

        <Text style={styles.securedText}>SECURED BY NEARFIND CORE</Text>

        {/* Bottom spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Customer Name Modal ─────────────────────────────────────────────── */}
      <Modal visible={showCustomerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Welcome, Customer!</Text>
            <Text style={styles.modalSubtitle}>What should we call you?</Text>
            <TextInput
              style={styles.modalInput}
              value={customerName}
              onChangeText={setCustomerName}
              placeholder="Enter your name"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                const name = customerName.trim();
                if (!name) {
                  Alert.alert('Name Required', 'Please enter your name to continue.');
                  return;
                }
                setShowCustomerModal(false);
                navigation.navigate('CustomerTabs', {
                  customerName: name,
                });
              }}
            >
              <Text style={styles.modalPrimaryBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowCustomerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Retailer Picker Modal ───────────────────────────────────────────── */}
      <Modal visible={showRetailerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Store</Text>
            <Text style={styles.modalSubtitle}>Which retailer are you?</Text>
            {retailers.length === 0 ? (
              <Text style={styles.modalEmptyText}>
                No retailers found. Please seed the database first from the Admin screen.
              </Text>
            ) : (
              retailers.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setShowRetailerModal(false);
                    navigation.navigate('RetailerDashboard', {
                      retailerId: r.id,
                      retailerName: r.name,
                    });
                  }}
                >
                  <MaterialCommunityIcons name="storefront-outline" size={20} color={Colors.primary} />
                  <Text style={styles.modalOptionText}>{r.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowRetailerModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── Delivery Partner Picker Modal ───────────────────────────────────── */}
      <Modal visible={showDeliveryModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join as Delivery Partner</Text>
            <Text style={styles.modalSubtitle}>Who are you?</Text>
            {deliveryPartners.length === 0 ? (
              <Text style={styles.modalEmptyText}>
                No delivery partners found. Please seed the database first from the Admin screen.
              </Text>
            ) : (
              deliveryPartners.map((dp) => (
                <TouchableOpacity
                  key={dp.id}
                  style={styles.modalOption}
                  onPress={() => {
                    setShowDeliveryModal(false);
                    navigation.navigate('DeliveryDashboard', {
                      partnerId: dp.id,
                      partnerName: dp.name,
                    });
                  }}
                >
                  <MaterialCommunityIcons name="motorbike" size={20} color={Colors.primary} />
                  <Text style={styles.modalOptionText}>{dp.name}</Text>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setShowDeliveryModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

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
    paddingTop: 12,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notifBtn: {
    padding: 4,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  heroSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.customerCardBg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 8,
  },
  liveBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  heroTitleAccent: {
    color: Colors.primary,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.accent,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 20,
    maxWidth: 300,
  },

  roleCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    flexDirection: 'row',
    alignItems: 'flex-start',
    overflow: 'hidden',
    
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardContent: {
    flex: 1,
  },
  roleIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  roleTextBlock: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  roleDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  roleCta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  roleDecorIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    opacity: 0.25,
  },

  bannerContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    height: 120,
    justifyContent: 'flex-end',
  },
  bannerOverlay: {
    padding: 16,
  },
  bannerAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  bannerAvatarText: {
    fontSize: 12,
    color: Colors.white,
    marginLeft: 8,
    fontWeight: '600',
  },
  securedText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 1.5,
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 17, 53, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
    marginBottom: 16,
  },
  modalPrimaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalPrimaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  modalCancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
    gap: 12,
  },
  modalOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modalEmptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
    lineHeight: 20,
  },
});
