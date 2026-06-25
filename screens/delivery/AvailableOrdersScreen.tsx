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
  Switch,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, OrderStatus } from '../../constants';
import {
  subscribeToAvailableDeliveries,
  subscribeToMyDeliveries,
  claimDelivery,
  markPickedUp,
  markDelivered,
} from '../../services/firestore';
import type { Order, RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'DeliveryDashboard'>;

interface DeliveryJob {
  id: string;
  isMock: boolean;
  storeName: string;
  distance: string;
  payout: number;
  pickupAddress: string;
  dropAddress: string;
  customerName: string;
  qty: number;
  isUrgent?: boolean;
}

export default function AvailableOrdersScreen({ route, navigation }: Props) {
  const { partnerId, partnerName } = route.params;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'Home' | 'Orders' | 'Profile'>('Home');

  // Online / offline toggle
  const [isLookingForOrders, setIsLookingForOrders] = useState(true);

  // Firestore live collections
  const [availableDbOrders, setAvailableDbOrders] = useState<Order[]>([]);
  const [myDbOrders, setMyDbOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock active delivery state (when driver claims a mock order)
  const [activeMockJob, setActiveMockJob] = useState<DeliveryJob | null>(null);
  const [mockJobState, setMockJobState] = useState<'arrived' | 'pickedup' | 'delivered'>('arrived');

  // List of mock available orders matching Screenshot 2
  const [mockJobs, setMockJobs] = useState<DeliveryJob[]>([
    {
      id: 'ORD-8821',
      isMock: true,
      storeName: 'Aggarwal Stores',
      distance: '2.4 km away',
      payout: 65.00,
      pickupAddress: 'MG Road, Central Sector, Blr 560001',
      dropAddress: 'Rahul S., HSR Layout, Sector 4',
      customerName: 'Sarah J.',
      qty: 3,
      isUrgent: true,
    },
    {
      id: 'ORD-8815',
      isMock: true,
      storeName: 'Modern Grocers',
      distance: '4.1 km away',
      payout: 42.00,
      pickupAddress: 'Indiranagar 12th Main',
      dropAddress: 'Anjali M., Koramangala',
      customerName: 'Anjali M.',
      qty: 1,
    },
    {
      id: 'ORD-8810',
      isMock: true,
      storeName: "Baker's Point",
      distance: '1.8 km away',
      payout: 35.00,
      pickupAddress: 'Commercial Street',
      dropAddress: 'Vikas P., Shivajinagar',
      customerName: 'Vikas P.',
      qty: 1,
    },
  ]);

  useEffect(() => {
    // Subscribe to available deliveries
    const unsubAvailable = subscribeToAvailableDeliveries((data) => {
      setAvailableDbOrders(data);
      setLoading(false);
    });

    // Subscribe to my claimed deliveries
    const unsubMy = subscribeToMyDeliveries(partnerId, (data) => {
      setMyDbOrders(data);
    });

    return () => {
      unsubAvailable();
      unsubMy();
    };
  }, [partnerId]);

  // Identify any active in-progress Firestore deliveries claimed by this driver
  const activeDbDelivery = myDbOrders.find(
    (o) => o.status === OrderStatus.ReadyForPickup || o.status === OrderStatus.PickedUp
  );

  // Action handlers
  const handleAcceptJob = async (job: DeliveryJob) => {
    if (job.isMock) {
      setActiveMockJob(job);
      setMockJobState('arrived');
      Alert.alert('Job Claimed', `You have accepted delivery for ${job.storeName}.`);
    } else {
      try {
        await claimDelivery(job.id, partnerId);
        Alert.alert('Success', 'Delivery claimed successfully!');
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to claim delivery');
      }
    }
  };

  const handleDeclineJob = (jobId: string) => {
    setMockJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  // Firestore Delivery State Machine
  const handleNextStepDb = async (order: Order) => {
    try {
      if (order.status === OrderStatus.ReadyForPickup) {
        // Driver picks up order from store
        await markPickedUp(order.id);
        Alert.alert('Order Picked Up', 'You have collected the parcel. Proceed to customer location.');
      } else if (order.status === OrderStatus.PickedUp) {
        // Driver delivers order to customer
        await markDelivered(order.id);
        Alert.alert('Delivered!', 'Order marked as successfully delivered.');
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to update delivery status');
    }
  };

  // Mock Delivery State Machine
  const handleNextStepMock = () => {
    if (mockJobState === 'arrived') {
      setMockJobState('pickedup');
      Alert.alert('Picked Up', 'Order collected from store. Tap Arrived to deliver.');
    } else if (mockJobState === 'pickedup') {
      setMockJobState('delivered');
      Alert.alert('Delivered', 'Mock delivery completed successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Remove mock job from active state
            setActiveMockJob(null);
          },
        },
      ]);
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

  // Tab 1: Delivery Home Tab (Screenshot 1 Layout)
  const renderHomeTab = () => {
    const totalEarnings = 1240.50;
    const completedCount = 14 + myDbOrders.filter((o) => o.status === OrderStatus.Delivered).length;

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Active Toggle Switch */}
        <View style={styles.storeStatusCard}>
          <View style={styles.storeStatusTextRow}>
            <View style={[styles.statusDot, { backgroundColor: isLookingForOrders ? '#A3D900' : '#EF4444' }]} />
            <View>
              <Text style={styles.statusLabelText}>ONLINE STATUS</Text>
              <Text style={styles.statusMainText}>
                {isLookingForOrders ? 'Looking for Orders' : 'Offline'}
              </Text>
            </View>
          </View>
          <Switch
            value={isLookingForOrders}
            onValueChange={setIsLookingForOrders}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#E2E8F0', true: '#6C2BD9' }}
          />
        </View>

        {/* Today's Earnings purple banner */}
        <View style={styles.salesBannerCard}>
          <View style={styles.salesLeft}>
            <Text style={styles.salesLabel}>TODAY'S EARNINGS</Text>
            <Text style={styles.salesAmount}>₹{totalEarnings.toFixed(2)}</Text>
            <View style={styles.trendPill}>
              <Text style={styles.trendPillText}>+12% vs Yesterday</Text>
            </View>
          </View>
          <View style={styles.salesRight}>
            <Ionicons name="trending-up" size={48} color="#C8FF00" />
          </View>
        </View>

        {/* Stats grid */}
        <View style={styles.twoColRow}>
          <View style={styles.halfCard}>
            <Ionicons name="car-outline" size={24} color={Colors.primary} style={{ marginBottom: 6 }} />
            <Text style={styles.halfCardLabel}>DELIVERIES</Text>
            <Text style={styles.halfCardValue}>{completedCount}</Text>
          </View>
          <View style={styles.halfCard}>
            <Ionicons name="star-outline" size={24} color="#C8FF00" style={{ marginBottom: 6 }} />
            <Text style={styles.halfCardLabel}>RATING</Text>
            <Text style={styles.halfCardValue}>4.8</Text>
          </View>
        </View>

        {/* Nearby map preview banner */}
        <View style={styles.mapPreviewBanner}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=400&q=80' }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.mapBannerOverlay} />
          <View style={styles.mapBannerContent}>
            <View style={styles.mapBannerText}>
              <Text style={styles.mapBannerTitle}>3 Nearby Orders</Text>
              <Text style={styles.mapBannerSubtitle}>Avg. ₹85 per delivery</Text>
            </View>
            <TouchableOpacity style={styles.viewMapBtn} onPress={() => setActiveTab('Orders')}>
              <Text style={styles.viewMapBtnText}>VIEW MAP</Text>
              <Ionicons name="map-outline" size={16} color="#1A1135" style={{ marginLeft: 6 }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance graph */}
        <View style={styles.performanceCard}>
          <View style={styles.perfHeader}>
            <Text style={styles.perfTitle}>Performance</Text>
            <Text style={styles.perfTimeframe}>Last 6 Hours</Text>
          </View>

          {/* Simple custom vertical bar graph */}
          <View style={styles.graphContainer}>
            {/* Popover marker at 2 PM */}
            <View style={styles.popoverMarker}>
              <Text style={styles.popoverText}>₹310</Text>
              <View style={styles.popoverArrow} />
            </View>

            <View style={styles.barsContainer}>
              {[
                { label: '12 PM', height: 40 },
                { label: '1 PM', height: 60 },
                { label: '2 PM', height: 95, highlight: true },
                { label: '3 PM', height: 45 },
                { label: '4 PM', height: 30 },
                { label: '5 PM', height: 50 },
              ].map((bar, idx) => (
                <View key={idx} style={styles.barColumn}>
                  <View style={styles.barRail}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${bar.height}%` },
                        bar.highlight && { backgroundColor: Colors.primary },
                      ]}
                    />
                  </View>
                  <Text style={styles.barLabel}>{bar.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Session active stats */}
        <View style={styles.sessionCard}>
          <View style={styles.sessionLeft}>
            <View style={styles.clockIconBg}>
              <Ionicons name="timer-outline" size={20} color={Colors.primary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.sessionTitleText}>Current Session</Text>
              <Text style={styles.sessionSubtitleText}>3h 42m active</Text>
            </View>
          </View>
          <Ionicons name="information-circle-outline" size={22} color="#8A84A0" />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Tab 2: Orders Tab (Screenshot 2 and Screenshot 3 depending on state)
  const renderOrdersTab = () => {
    const activeJob = activeDbDelivery || activeMockJob;

    // A. ACTIVE DELIVERY ROUTE VIEW (Screenshot 3 Layout)
    if (activeJob) {
      const isDb = !('isMock' in activeJob);
      const isReadyToPickup = isDb ? activeJob.status === OrderStatus.ReadyForPickup : mockJobState === 'arrived';
      const isPickedUp = isDb ? activeJob.status === OrderStatus.PickedUp : mockJobState === 'pickedup';

      // Setup labels based on status
      const storeName = isDb ? activeJob.retailerName : activeJob.storeName;
      const pickupAddress = isDb ? 'MG Road, Central Sector, Blr 560001' : activeJob.pickupAddress;
      const orderIdLabel = isDb ? `#NF-${activeJob.id.slice(-5).toUpperCase()}` : `#${activeJob.id}`;
      const qtyLabel = isDb ? activeJob.qty : activeJob.qty;
      const customerName = isDb ? activeJob.customerName : activeJob.customerName;
      const dropoffAddress = isDb ? 'HSR Layout, Sector 4 • 2.4km from Store' : activeJob.dropAddress;

      let actionBtnText = 'Arrived at Store >';
      if (isPickedUp) {
        actionBtnText = 'Confirm Delivery >';
      } else if (!isReadyToPickup && !isPickedUp) {
        // Fallback or in-between state
        actionBtnText = 'Confirm Pickup >';
      }

      return (
        <View style={{ flex: 1, backgroundColor: '#FAF9FF' }}>
          {/* Map View Panel */}
          <View style={styles.routeMapContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80' }}
              style={StyleSheet.absoluteFillObject}
            />
            {/* Live route label */}
            <View style={styles.liveRouteTag}>
              <View style={styles.liveRouteDot} />
              <Text style={styles.liveRouteText}>LIVE ROUTE</Text>
            </View>

            {/* Navigate FAB button */}
            <TouchableOpacity style={styles.navigateFab} onPress={() => Alert.alert('Navigation', 'Launching Google Maps...')}>
              <Ionicons name="navigate-circle" size={24} color={Colors.primary} />
              <Text style={styles.navigateFabText}>NAVIGATE</Text>
            </TouchableOpacity>

            {/* Isometric location pin indicator overlay */}
            <View style={styles.pinOverlayContainer}>
              <Ionicons name="location" size={44} color="#6C2BD9" style={styles.pinShadow} />
            </View>
          </View>

          {/* Active Job detail card info */}
          <ScrollView style={styles.activeJobDetailsScroll} contentContainerStyle={{ padding: 16 }}>
            <View style={styles.activeRouteCard}>
              <View style={styles.routeStoreRow}>
                <View style={styles.storeIconBox}>
                  <Ionicons name="basket-outline" size={22} color={Colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.pickupLabel}>PICKUP FROM</Text>
                  <Text style={styles.activeStoreTitle}>{storeName}</Text>
                  <Text style={styles.activeStoreAddress}>{pickupAddress}</Text>
                </View>
                <TouchableOpacity style={styles.phoneButton} onPress={() => Alert.alert('Calling Store', 'Connecting with Merchant...')}>
                  <Ionicons name="call" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Order details checklist */}
              <View style={styles.routeOrderDetailsRow}>
                <View>
                  <Text style={styles.orderDetailsLabel}>ORDER DETAILS</Text>
                  <View style={styles.orderIdBadge}>
                    <Text style={styles.orderIdBadgeText}>{orderIdLabel}</Text>
                  </View>
                </View>
                <Text style={styles.itemsCountValue}>{qtyLabel} Items</Text>
              </View>

              {/* Mock items list */}
              <View style={styles.itemsListContainer}>
                <View style={styles.itemCheckRow}>
                  <Ionicons name="checkmark-circle" size={20} color="#A3D900" />
                  <Text style={styles.itemCheckText}>
                    {qtyLabel > 1 ? `${qtyLabel - 1}x Espresso` : '1x Espresso'}
                  </Text>
                </View>
                {qtyLabel > 1 && (
                  <View style={styles.itemCheckRow}>
                    <Ionicons name="checkmark-circle" size={20} color="#A3D900" />
                    <Text style={styles.itemCheckText}>1x Bagel</Text>
                  </View>
                )}
                <TouchableOpacity style={styles.viewFullListBtn}>
                  <Text style={styles.viewFullListText}>VIEW FULL LIST</Text>
                  <Ionicons name="chevron-down" size={14} color="#8A84A0" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Customer info card */}
            <View style={styles.routeCustomerCard}>
              <View style={styles.customerAvatarRow}>
                <View style={styles.customerAvatarBg}>
                  <Text style={styles.avatarInitialsText}>
                    {customerName.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.customerLabelText}>CUSTOMER</Text>
                  <Text style={styles.customerNameText}>{customerName}</Text>
                </View>
                <View style={styles.etaContainer}>
                  <Text style={styles.etaLabel}>ETA STORE</Text>
                  <View style={styles.etaBadgeRow}>
                    <Ionicons name="time" size={14} color="#A3D900" />
                    <Text style={styles.etaBadgeText}>4 mins</Text>
                  </View>
                </View>
              </View>

              {/* Drop-off address */}
              <View style={styles.dropAddressRow}>
                <View style={styles.dropPinIconBg}>
                  <Ionicons name="location-outline" size={18} color="#1A1135" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.customerLabelText}>DROP-OFF</Text>
                  <Text style={styles.dropAddressText}>{dropoffAddress}</Text>
                </View>
              </View>
            </View>

            {/* Main status progression CTA button */}
            <TouchableOpacity
              style={styles.arriveSubmitBtn}
              onPress={() => {
                if (isDb) {
                  handleNextStepDb(activeJob as Order);
                } else {
                  handleNextStepMock();
                }
              }}
            >
              <Text style={styles.arriveSubmitBtnText}>{actionBtnText}</Text>
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      );
    }

    // B. AVAILABLE JOBS LIST VIEW (Screenshot 2 Layout)
    // Combine Firestore ReadyForPickup orders + Mock orders
    const combinedJobs: DeliveryJob[] = [
      ...availableDbOrders.map((ord) => ({
        id: ord.id,
        isMock: false,
        storeName: ord.retailerName,
        distance: '1.2 km away',
        payout: 45.00,
        pickupAddress: 'MG Road, Central Sector, Blr 560001',
        dropAddress: `${ord.customerName}, HSR Layout`,
        customerName: ord.customerName,
        qty: ord.qty,
        isUrgent: false,
      })),
      ...mockJobs,
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Status header banner */}
        <View style={styles.statusOnlinePayoutCard}>
          <View style={styles.statusOnlineRow}>
            <View style={styles.glowingDot} />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.onlineLabelText}>ONLINE</Text>
              <Text style={styles.onlineStatusText}>Accepting Orders</Text>
            </View>
          </View>
          <View style={styles.payoutColumn}>
            <Text style={styles.payoutLabelText}>TODAY'S PAYOUT</Text>
            <Text style={styles.payoutAmountText}>₹1,240.50</Text>
          </View>
        </View>

        {/* Section title */}
        <View style={styles.ordersHeaderRow}>
          <Text style={styles.ordersHeaderTitle}>Available Near You</Text>
          <View style={styles.ordersCountBadge}>
            <Text style={styles.ordersCountBadgeText}>{combinedJobs.length} orders</Text>
          </View>
        </View>

        {/* Available Job Cards */}
        {combinedJobs.map((job) => (
          <View key={job.id} style={styles.jobCard}>
            <View style={styles.jobHeaderRow}>
              <View style={styles.jobHeaderLeft}>
                {job.isUrgent && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentBadgeText}>URGENT</Text>
                  </View>
                )}
                <Text style={[styles.distanceText, !job.isUrgent && { marginLeft: 0 }]}>
                  {job.distance}
                </Text>
              </View>
              <View style={styles.payoutTag}>
                <Text style={styles.payoutValueText}>₹{job.payout.toFixed(2)}</Text>
                <Text style={styles.payoutUnitLabel}>PAYOUT</Text>
              </View>
            </View>

            <Text style={styles.jobStoreName}>{job.storeName}</Text>

            {/* Locations detail segment */}
            <View style={styles.jobLocationsBox}>
              <View style={styles.jobLocationItem}>
                <View style={[styles.jobDotIndicator, { backgroundColor: Colors.primary }]} />
                <Text style={styles.jobLocText} numberOfLines={1}>
                  Pickup: <Text style={styles.boldText}>{job.pickupAddress}</Text>
                </Text>
              </View>
              <View style={styles.jobLocDivider} />
              <View style={styles.jobLocationItem}>
                <View style={[styles.jobDotIndicator, { backgroundColor: '#C8FF00' }]} />
                <Text style={styles.jobLocText} numberOfLines={1}>
                  Drop: <Text style={styles.boldText}>{job.dropAddress}</Text>
                </Text>
              </View>
            </View>

            {/* Accept / Decline CTA Buttons */}
            <View style={styles.jobActionsRow}>
              <TouchableOpacity style={styles.declineJobBtn} onPress={() => handleDeclineJob(job.id)}>
                <Ionicons name="close" size={18} color="#1A1135" />
                <Text style={styles.declineJobBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptJobBtn} onPress={() => handleAcceptJob(job)}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                <Text style={styles.acceptJobBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {combinedJobs.length === 0 && (
          <View style={styles.emptyRequestsBox}>
            <Ionicons name="file-tray-full-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyRequestsTitle}>No deliveries available</Text>
            <Text style={styles.emptyRequestsDesc}>
              Waiting for merchants to mark orders as packed.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Tab 3: Delivery Profile Tab
  const renderProfileTab = () => {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.profileAvatarBox}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' }}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
        <Text style={styles.placeholderTitle}>{partnerName}</Text>
        <Text style={styles.placeholderDesc}>Logged in as Delivery Partner Account</Text>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutBtnText}>Log Out Agent</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9FF" />

      {/* Header (Hide header specifically on active pickup route view for visual aesthetics matching Screenshot 3) */}
      {!(activeTab === 'Orders' && (activeDbDelivery || activeMockJob)) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircleSmall}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' }}
                style={{ width: '100%', height: '100%' }}
              />
            </View>
            <Text style={styles.headerTitle}>NearFind</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <View style={styles.notifDot} />
            <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Header specifically for active pickup route view matching Screenshot 3 */}
      {activeTab === 'Orders' && (activeDbDelivery || activeMockJob) && (
        <View style={styles.routeHeader}>
          <View style={styles.routeHeaderLeft}>
            <Ionicons name="bicycle-outline" size={24} color={Colors.primary} />
            <Text style={styles.routeHeaderTitle}>Active Pickup</Text>
          </View>
          <TouchableOpacity style={styles.helpButton} onPress={() => Alert.alert('Helpdesk', 'Connecting to support chat...')}>
            <Ionicons name="help-circle-outline" size={16} color="#1A1135" style={{ marginRight: 4 }} />
            <Text style={styles.helpButtonText}>HELP</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main tab selection */}
      {activeTab === 'Home' ? (
        renderHomeTab()
      ) : activeTab === 'Orders' ? (
        renderOrdersTab()
      ) : (
        renderProfileTab()
      )}

      {/* Custom Bottom Tab Navigation */}
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
                color={activeTab === 'Home' ? '#1A1135' : Colors.textMuted}
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
                name="bicycle"
                size={20}
                color={activeTab === 'Orders' ? '#1A1135' : Colors.textMuted}
              />
            </View>
            <Text style={activeTab === 'Orders' ? styles.tabLabelActive : styles.tabLabel}>
              Orders
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
                color={activeTab === 'Profile' ? '#1A1135' : Colors.textMuted}
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
    backgroundColor: '#FAF9FF',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAF9FF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircleSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
    letterSpacing: -0.5,
  },
  notifBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    zIndex: 1,
  },

  // Switch looking toggle
  storeStatusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  storeStatusTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    shadowColor: '#A3D900',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A84A0',
    letterSpacing: 1,
  },
  statusMainText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },

  // Today's Earnings purple banner
  salesBannerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#6C2BD9',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  salesLeft: {
    flex: 1.2,
  },
  salesLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
  salesAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginVertical: 4,
  },
  trendPill: {
    backgroundColor: '#C8FF00',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 6,
  },
  trendPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1135',
  },
  salesRight: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  // Capacities half width stats
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  halfCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A84A0',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  halfCardValue: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primary,
  },

  // Map Preview Banner
  mapPreviewBanner: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  mapBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 17, 53, 0.45)',
  },
  mapBannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapBannerText: {
    flex: 1.2,
  },
  mapBannerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  mapBannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
  viewMapBtn: {
    backgroundColor: '#C8FF00',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewMapBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1A1135',
  },

  // Performance graph card
  performanceCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    marginBottom: 16,
  },
  perfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  perfTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
  },
  perfTimeframe: {
    fontSize: 11,
    color: '#8A84A0',
    fontWeight: '700',
  },
  graphContainer: {
    height: 160,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  popoverMarker: {
    position: 'absolute',
    top: 0,
    left: '32%',
    backgroundColor: '#1A1135',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    zIndex: 10,
  },
  popoverText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  popoverArrow: {
    width: 6,
    height: 6,
    backgroundColor: '#1A1135',
    transform: [{ rotate: '45deg' }],
    marginTop: -3,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
  },
  barColumn: {
    alignItems: 'center',
    width: `${100 / 6}%`,
  },
  barRail: {
    height: 80,
    width: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 4,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#C8FF00',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8A84A0',
    marginTop: 8,
  },

  // Session stats
  sessionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8E5EA',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4CFD8',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionTitleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A84A0',
  },
  sessionSubtitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1135',
  },

  // ─── AVAILABLE ORDERS TAB (Screenshot 2) ────────────────────────────────────

  statusOnlinePayoutCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    marginBottom: 24,
  },
  statusOnlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  glowingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#A3D900',
  },
  onlineLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
    letterSpacing: 0.5,
  },
  onlineStatusText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  payoutColumn: {
    alignItems: 'flex-end',
  },
  payoutLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
  },
  payoutAmountText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1135',
  },
  ordersHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ordersHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1135',
  },
  ordersCountBadge: {
    backgroundColor: '#C8FF00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  ordersCountBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1a1135',
  },

  // Job Cards list
  jobCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  jobHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentBadge: {
    backgroundColor: '#F3EEFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgentBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  distanceText: {
    fontSize: 13,
    color: '#8A84A0',
    fontWeight: '600',
    marginLeft: 8,
  },
  payoutTag: {
    alignItems: 'flex-end',
  },
  payoutValueText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  payoutUnitLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8A84A0',
  },
  jobStoreName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 14,
  },
  jobLocationsBox: {
    backgroundColor: '#FAF9FF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    gap: 8,
  },
  jobLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobDotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  jobLocText: {
    fontSize: 13,
    color: '#8A84A0',
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
    color: '#1A1135',
  },
  jobLocDivider: {
    height: 1,
    backgroundColor: '#E9E3FF',
    marginLeft: 18,
  },
  jobActionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  declineJobBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  declineJobBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1135',
  },
  acceptJobBtn: {
    flex: 1.3,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  acceptJobBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },

  // ─── ACTIVE PICKUP ROUTE STYLES (Screenshot 3) ─────────────────────────────

  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FAF9FF',
  },
  routeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1135',
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8E5EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  helpButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1135',
  },
  routeMapContainer: {
    height: 220,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  liveRouteTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#C8FF00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveRouteDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1A1135',
    marginRight: 6,
  },
  liveRouteText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1A1135',
  },
  navigateFab: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 100,
  },
  navigateFabText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 6,
  },
  pinOverlayContainer: {
    position: 'absolute',
    top: '35%',
    left: '45%',
  },
  pinShadow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  activeJobDetailsScroll: {
    flex: 1,
  },
  activeRouteCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  routeStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECF9',
    paddingBottom: 14,
  },
  storeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A84A0',
    letterSpacing: 0.5,
  },
  activeStoreTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1135',
  },
  activeStoreAddress: {
    fontSize: 11,
    color: '#8A84A0',
  },
  phoneButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeOrderDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 14,
    marginBottom: 10,
  },
  orderDetailsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
  },
  orderIdBadge: {
    backgroundColor: '#F3EEFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  orderIdBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
  },
  itemsCountValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  itemsListContainer: {
    backgroundColor: '#FAF9FF',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  itemCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemCheckText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1135',
  },
  viewFullListBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0ECF9',
    paddingTop: 10,
    marginTop: 4,
  },
  viewFullListText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A84A0',
  },
  routeCustomerCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  customerAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECF9',
    paddingBottom: 14,
  },
  customerAvatarBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitialsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1A1135',
  },
  customerLabelText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A84A0',
  },
  customerNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1135',
  },
  etaContainer: {
    alignItems: 'flex-end',
  },
  etaLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A84A0',
  },
  etaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  etaBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#658C00',
  },
  dropAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
  },
  dropPinIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#EBFEDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropAddressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1135',
  },
  arriveSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  arriveSubmitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
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
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C8FF00',
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
    backgroundColor: '#C8FF00',
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
    color: '#1A1135',
    fontWeight: '800',
  },
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
});
