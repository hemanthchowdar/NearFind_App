import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, OrderStatus } from '../../constants';
import {
  subscribeToRetailerOrders,
  acceptOrder,
  rejectOrder,
  markPacked,
  markReadyForPickup,
} from '../../services/firestore';
import type { Order, RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'RetailerDashboard'>;

export default function IncomingOrdersScreen({ route, navigation }: Props) {
  const { retailerId, retailerName } = route.params;

  // Local state for active tab
  const [activeTab, setActiveTab] = useState<'Home' | 'Orders' | 'Search' | 'Profile'>('Home');

  // Firestore orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Time ticker for request countdowns
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Subscribe to live orders for this store
    const unsubscribe = subscribeToRetailerOrders(retailerId, (data) => {
      setOrders(data);
      setLoading(false);
    });

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [retailerId]);

  // Filter orders by status
  const placedRequests = orders.filter((o) => o.status === OrderStatus.Placed);
  const activeOrders = orders.filter((o) => o.status === OrderStatus.Accepted || o.status === OrderStatus.Packed);
  const completedOrdersCount = orders.filter((o) => o.status === OrderStatus.Delivered).length;

  const acceptedCount = orders.filter((o) => o.status === OrderStatus.Accepted).length;
  const packedCount = orders.filter((o) => o.status === OrderStatus.Packed).length;

  // Action handlers
  const handleAccept = async (orderId: string) => {
    try {
      await acceptOrder(orderId);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to accept order');
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await rejectOrder(orderId);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to reject order');
    }
  };

  const handleMarkPacked = async (orderId: string) => {
    try {
      await markPacked(orderId);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to mark as packed');
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await markReadyForPickup(orderId);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to mark ready for pickup');
    }
  };

  const handleSignOut = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      })
    );
  };

  // ─── RENDERS ───────────────────────────────────────────────────────────────

  // 1. Home / New Requests Tab
  const renderNewRequestsTab = () => {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Today's Performance */}
        <View style={styles.performanceCard}>
          <View style={styles.performanceLeft}>
            <Text style={styles.performanceLabel}>TODAY'S PERFORMANCE</Text>
            <Text style={styles.performanceTitle}>
              {completedOrdersCount + 24} Orders Completed
            </Text>
          </View>
          <View style={styles.performanceIconBox}>
            <Ionicons name="trending-up" size={18} color="#658C00" />
          </View>
        </View>

        {/* Requests List */}
        {placedRequests.map((req) => {
          // Calculate remaining countdown
          const createdTime = req.createdAt?.toMillis ? req.createdAt.toMillis() : new Date(req.createdAt as any).getTime();
          const limit = createdTime + 60_000;
          const remaining = limit - now;
          const secs = Math.max(0, Math.floor(remaining / 1000));
          const timeString = secs > 0 ? `${secs}s left` : 'Expired';

          return (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconBox}>
                  <Ionicons name="basket-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.cardHeaderMiddle}>
                  <Text style={styles.itemTitle}>{req.qty}x {req.productName}</Text>
                  <Text style={styles.customerName}>Customer: {req.customerName}</Text>
                </View>
                <View style={styles.tagPill}>
                  <View style={styles.tagPillDot} />
                  <Text style={styles.tagPillText}>{timeString}</Text>
                </View>
              </View>

              <View style={styles.metaBoxRow}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaItemLabel}>QUANTITY</Text>
                  <Text style={styles.metaItemValue}>{req.qty} Unit</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaItemLabel}>DISTANCE</Text>
                  <Text style={styles.metaItemValue}>0.4 km</Text>
                </View>
              </View>

              <View style={styles.actionBtnRow}>
                <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(req.id)}>
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.white} />
                  <Text style={styles.acceptBtnText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(req.id)}>
                  <Ionicons name="close-circle-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Empty state placeholder */}
        {placedRequests.length === 0 && (
          <View style={styles.emptyRequestsBox}>
            <Ionicons name="file-tray-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyRequestsTitle}>Waiting for more orders...</Text>
            <Text style={styles.emptyRequestsDesc}>
              NearFind is searching for nearby shoppers.
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // 2. Orders / Live Queue Tab
  const renderOrdersTab = () => {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Count Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: Colors.primary }]}>
            <View style={styles.statBoxTop}>
              <Ionicons name="clipboard-outline" size={20} color={Colors.white} />
              <Text style={styles.statBoxLabel}>ACCEPTED</Text>
            </View>
            <Text style={styles.statBoxNumber}>
              {acceptedCount < 10 ? `0${acceptedCount}` : acceptedCount}
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: Colors.accent }]}>
            <View style={styles.statBoxTop}>
              <Ionicons name="cube-outline" size={20} color={Colors.textPrimary} />
              <Text style={[styles.statBoxLabel, { color: Colors.textPrimary }]}>PACKED</Text>
            </View>
            <Text style={[styles.statBoxNumber, { color: Colors.textPrimary }]}>
              {packedCount < 10 ? `0${packedCount}` : packedCount}
            </Text>
          </View>
        </View>

        {/* Active Queue Cards */}
        {activeOrders.map((ord) => {
          const isAccepted = ord.status === OrderStatus.Accepted;

          return (
            <View key={ord.id} style={styles.card}>
              <View style={styles.cardTopBar}>
                <Text style={styles.orderIdLabel}>#NF-{ord.id.slice(-5).toUpperCase()}</Text>
                <View
                  style={[
                    styles.statusPill,
                    isAccepted ? styles.statusPillPurple : styles.statusPillGreen,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isAccepted ? styles.statusPillTextPurple : styles.statusPillTextGreen,
                    ]}
                  >
                    {ord.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.activeCustomerName}>{ord.customerName}</Text>

              {/* Items row */}
              <View style={styles.activeDetailsRow}>
                <Ionicons name="briefcase-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.activeDetailsText} numberOfLines={1}>
                  {ord.qty} item{ord.qty > 1 ? 's' : ''} • {ord.productName}
                </Text>
              </View>

              {/* Delivery ETA / Driver Assignment row */}
              {isAccepted ? (
                <View style={styles.activeDetailsRow}>
                  <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.activeDetailsText}>ETA: 14 mins</Text>
                </View>
              ) : (
                <View style={styles.activeDetailsRow}>
                  <Ionicons name="car-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.activeDetailsText}>
                    {ord.deliveryPartnerId
                      ? 'Driver Assigned: David K.'
                      : 'Searching for driver...'}
                  </Text>
                </View>
              )}

              {/* Action Button */}
              {isAccepted ? (
                <TouchableOpacity
                  style={styles.markPackedBtn}
                  onPress={() => handleMarkPacked(ord.id)}
                >
                  <Ionicons name="cube-outline" size={18} color={Colors.white} />
                  <Text style={styles.markPackedBtnText}>MARK PACKED</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.markReadyBtn}
                  onPress={() => handleMarkReady(ord.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.markReadyBtnText}>MARK READY FOR PICKUP</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {activeOrders.length === 0 && (
          <View style={styles.emptyRequestsBox}>
            <Ionicons name="file-tray-full-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyRequestsTitle}>Queue is empty</Text>
            <Text style={styles.emptyRequestsDesc}>
              No orders are currently in preparation.
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // 3. Search Placeholder Tab
  const renderSearchTab = () => {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="search" size={48} color={Colors.textMuted} />
        <Text style={styles.placeholderTitle}>Search Orders</Text>
        <Text style={styles.placeholderDesc}>Find specific customer invoices and historic logs.</Text>
      </View>
    );
  };

  // 4. Profile / Sign Out Tab
  const renderProfileTab = () => {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.profileAvatarBox}>
          <MaterialCommunityIcons name="storefront" size={40} color={Colors.white} />
        </View>
        <Text style={styles.placeholderTitle}>{retailerName}</Text>
        <Text style={styles.placeholderDesc}>Logged in as Retailer Account</Text>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutBtnText}>Log Out Store</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6FF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircleSmall}>
            <MaterialCommunityIcons name="storefront-outline" size={16} color={Colors.white} />
          </View>
          <Text style={styles.headerTitle}>
            {activeTab === 'Home' ? 'New Requests' : 'NearFind'}
          </Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Main Tab Views */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching live queue...</Text>
        </View>
      ) : activeTab === 'Home' ? (
        renderNewRequestsTab()
      ) : activeTab === 'Orders' ? (
        renderOrdersTab()
      ) : activeTab === 'Search' ? (
        renderSearchTab()
      ) : (
        renderProfileTab()
      )}

      {/* Custom Bottom Tab Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomTabBarContainer}>
        <View style={styles.bottomTabBar}>
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Home')}
          >
            <View style={activeTab === 'Home' ? styles.tabActivePill : null}>
              <Ionicons
                name="home"
                size={20}
                color={activeTab === 'Home' ? Colors.textPrimary : Colors.textMuted}
              />
            </View>
            <Text style={activeTab === 'Home' ? styles.tabLabelActive : styles.tabLabel}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Orders')}
          >
            <View style={activeTab === 'Orders' ? styles.tabActivePill : null}>
              <Ionicons
                name="receipt"
                size={20}
                color={activeTab === 'Orders' ? Colors.textPrimary : Colors.textMuted}
              />
            </View>
            <Text style={activeTab === 'Orders' ? styles.tabLabelActive : styles.tabLabel}>
              Orders
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Search')}
          >
            <View style={activeTab === 'Search' ? styles.tabActivePill : null}>
              <Ionicons
                name="search"
                size={20}
                color={activeTab === 'Search' ? Colors.textPrimary : Colors.textMuted}
              />
            </View>
            <Text style={activeTab === 'Search' ? styles.tabLabelActive : styles.tabLabel}>
              Search
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Profile')}
          >
            <View style={activeTab === 'Profile' ? styles.tabActivePill : null}>
              <Ionicons
                name="person"
                size={20}
                color={activeTab === 'Profile' ? Colors.textPrimary : Colors.textMuted}
              />
            </View>
            <Text style={activeTab === 'Profile' ? styles.tabLabelActive : styles.tabLabel}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FF',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F8F6FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  notifBtn: {
    padding: 4,
  },

  // Today's Performance Card
  performanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  performanceLeft: {
    flex: 1,
  },
  performanceLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  performanceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  performanceIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F7FFA6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Timeline / Request Card
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderMiddle: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  tagPillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#658C00',
  },
  metaBoxRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
  },
  metaItemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  metaItemValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptBtn: {
    flex: 1.2,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: '#E8E4F0',
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  rejectBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Empty Requests Placeholder
  emptyRequestsBox: {
    borderWidth: 2,
    borderColor: '#E8E4F0',
    borderStyle: 'dashed',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  emptyRequestsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyRequestsDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },

  // Active Orders queue count stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  statBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statBoxLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 1,
  },
  statBoxNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 12,
  },

  // Active Order Queue Card
  cardTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusPillPurple: {
    backgroundColor: '#F3EEFF',
  },
  statusPillGreen: {
    backgroundColor: '#F7FFA6',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusPillTextPurple: {
    color: Colors.primary,
  },
  statusPillTextGreen: {
    color: '#658C00',
  },
  activeCustomerName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  activeDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  activeDetailsText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  markPackedBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  markPackedBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  markReadyBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  markReadyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },

  // General tab placeholders
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  placeholderDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },
  profileAvatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },

  // Bottom Tab Bar
  bottomTabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  bottomTabBar: {
    flexDirection: 'row',
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabActivePill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    fontSize: 10,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
