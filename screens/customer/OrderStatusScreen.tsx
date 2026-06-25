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
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors, OrderStatus } from '../../constants';
import { subscribeToOrder } from '../../services/firestore';
import type { Order, RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

const HERO_STATUS_INFO: Record<string, { title: string; desc: string }> = {
  [OrderStatus.Placed]: {
    title: 'Placed',
    desc: 'Your order has been received by the store and is pending acceptance.',
  },
  [OrderStatus.Accepted]: {
    title: 'Accepted',
    desc: 'The store accepted your order and is starting to prepare it.',
  },
  [OrderStatus.Packed]: {
    title: 'Packed',
    desc: 'Your order is being double-checked and wrapped up!',
  },
  [OrderStatus.ReadyForPickup]: {
    title: 'Ready for Pickup',
    desc: 'Your order is packed and waiting for our delivery partner.',
  },
  [OrderStatus.PickedUp]: {
    title: 'Picked Up',
    desc: 'Our delivery partner is on the way to your location!',
  },
  [OrderStatus.Delivered]: {
    title: 'Delivered',
    desc: 'Your order has been successfully delivered. Enjoy!',
  },
};

const REJECTED_HERO_INFO: Record<string, { title: string; desc: string }> = {
  [OrderStatus.Rejected]: {
    title: 'Order Rejected',
    desc: 'The retailer is currently out of stock. Your refund is being processed.',
  },
  [OrderStatus.AutoCancelled]: {
    title: 'Order Cancelled',
    desc: 'The store did not respond in time. Your refund is being processed.',
  },
  [OrderStatus.NoPartnerFound]: {
    title: 'Delivery Search Failed',
    desc: 'No delivery partner was available. Your refund is being processed.',
  },
};

const ACTIVE_MILESTONES = [
  OrderStatus.Placed,
  OrderStatus.Accepted,
  OrderStatus.Packed,
  OrderStatus.ReadyForPickup,
  OrderStatus.PickedUp,
  OrderStatus.Delivered,
];

const ACTIVE_MILESTONE_LABELS: Record<string, string> = {
  [OrderStatus.Placed]: 'Placed',
  [OrderStatus.Accepted]: 'Accepted',
  [OrderStatus.Packed]: 'Packed',
  [OrderStatus.ReadyForPickup]: 'Ready for Pickup',
  [OrderStatus.PickedUp]: 'Picked Up',
  [OrderStatus.Delivered]: 'Delivered',
};

export default function OrderStatusScreen({ route, navigation }: Props) {
  const { customerName, orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToOrder(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
      setLoading(false);
    });
    return unsubscribe;
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.loadingText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isFailed = [OrderStatus.AutoCancelled, OrderStatus.Rejected, OrderStatus.NoPartnerFound].includes(
    order.status as OrderStatus
  );

  const getMilestoneTime = (status: string) => {
    const entry = order.statusHistory?.find((h) => h.status === status);
    if (!entry || !entry.timestamp) return null;
    const ts = entry.timestamp as any;
    const date = typeof ts.toDate === 'function' ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleSupportPress = () => {
    alert('Calling support helper at +91 99999-99999...');
  };

  const handleSearchAgainPress = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'CustomerTabs',
            params: { customerName },
          },
        ],
      })
    );
  };

  const handleBottomTabPress = (tab: string) => {
    if (tab === 'Home' || tab === 'Profile' || tab === 'Search') {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'CustomerTabs',
              params: { customerName },
            },
          ],
        })
      );
    }
  };

  if (isFailed) {
    const heroInfo = REJECTED_HERO_INFO[order.status] || {
      title: 'Order Cancelled',
      desc: 'Your refund is being processed.',
    };

    const failedReasonLabel = 
      order.status === OrderStatus.Rejected ? 'Out of stock' :
      order.status === OrderStatus.AutoCancelled ? 'Timeout' : 'No partner available';

    const failedStepTitle = 
      order.status === OrderStatus.Rejected ? 'Retailer Rejected' :
      order.status === OrderStatus.AutoCancelled ? 'Auto-Cancelled' : 'Search Failed';

    const failureTime = getMilestoneTime(order.status);
    const placedTime = getMilestoneTime(OrderStatus.Placed);

    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F6FF" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerLogo}>NearFind</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.notifBtn}>
              <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={16} color={Colors.white} />
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Failed Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.errorIconCircleOuter}>
              <Ionicons name="alert" size={32} color={Colors.error} />
            </View>
            <Text style={styles.heroTitle}>{heroInfo.title}</Text>
            <Text style={styles.heroDesc}>{heroInfo.desc}</Text>
          </View>

          {/* Timeline History Card */}
          <View style={styles.card}>
            <Text style={styles.timelineHistoryTitle}>TIMELINE HISTORY</Text>

            {/* Placed step */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineLine, styles.timelineLineCompleted]} />
                <View style={styles.dotCompleted}>
                  <Ionicons name="checkmark" size={14} color={Colors.white} />
                </View>
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.stepLabel, styles.stepLabelCompleted]}>Order Placed</Text>
                {placedTime && <Text style={styles.stepTime}>{placedTime}</Text>}
              </View>
            </View>

            {/* Failed step */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineLine} />
                <View style={styles.dotFailed}>
                  <Ionicons name="close" size={14} color={Colors.white} />
                </View>
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.stepLabelFailed}>{failedStepTitle}</Text>
                <Text style={styles.stepTimeFailed}>
                  {failureTime || '--:--'} • <Text style={{ fontWeight: '600' }}>{failedReasonLabel}</Text>
                </Text>
              </View>
            </View>

            {/* Preparation step (Canceled) */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineLine} />
                <View style={styles.dotFuture} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.stepLabelDisabled}>In Preparation</Text>
                <Text style={styles.stepSubtextDisabled}>Canceled</Text>
              </View>
            </View>

            {/* Delivery step (Canceled) */}
            <View style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={styles.dotFuture} />
              </View>
              <View style={styles.timelineRight}>
                <Text style={styles.stepLabelDisabled}>Out for Delivery</Text>
                <Text style={styles.stepSubtextDisabled}>Canceled</Text>
              </View>
            </View>
          </View>

          {/* Refund Details Card */}
          <View style={[styles.card, styles.orderDetailsCard]}>
            <View style={styles.storeRow}>
              <View style={styles.storeLeft}>
                <Text style={styles.timelineHistoryTitle}>REFUND TOTAL</Text>
                <Text style={styles.refundAmountText}>₹{(order.price * order.qty).toFixed(2)}</Text>
              </View>
              <View style={[styles.pricePill, { backgroundColor: Colors.accent }]}>
                <Text style={styles.pricePillText}>EST. 3-5 DAYS</Text>
              </View>
            </View>

            <View style={styles.refundMetaRow}>
              <Text style={styles.orderNumber}>Order #NF-{orderId.slice(-5).toUpperCase()}</Text>
              <Text style={styles.itemsCountText}>{order.qty} Item{order.qty > 1 ? 's' : ''}</Text>
            </View>

            {/* Mock Item Images */}
            <View style={styles.mockThumbnailsRow}>
              <View style={styles.mockThumbnailBox}>
                <Ionicons name="basket-outline" size={20} color={Colors.textSecondary} />
              </View>
              {order.qty > 1 && (
                <View style={[styles.mockThumbnailBox, { backgroundColor: '#ECE9F4' }]}>
                  <Ionicons name="cube-outline" size={20} color={Colors.textSecondary} />
                </View>
              )}
            </View>
          </View>

          {/* Need help box */}
          <TouchableOpacity style={styles.needHelpBox} onPress={handleSupportPress}>
            <View style={styles.needHelpLeft}>
              <View style={styles.needHelpIconBox}>
                <Feather name="headphones" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.needHelpTitle}>Need help with this?</Text>
                <Text style={styles.needHelpDesc}>Contact our 24/7 support team</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
          </TouchableOpacity>

          {/* Bottom actions */}
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.searchAgainBtn} onPress={handleSearchAgainPress}>
              <Ionicons name="search" size={18} color={Colors.white} />
              <Text style={styles.searchAgainBtnText}>Search again</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.orderHistoryBtn} onPress={handleSearchAgainPress}>
              <Ionicons name="time-outline" size={18} color={Colors.textPrimary} />
              <Text style={styles.orderHistoryBtnText}>Order history</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  let currentIndex = ACTIVE_MILESTONES.indexOf(order.status as OrderStatus);
  if (currentIndex === -1) currentIndex = 0;

  const heroInfo = HERO_STATUS_INFO[order.status] || {
    title: order.status,
    desc: 'Status updating live...',
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6FF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerLogo}>NearFind</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={16} color={Colors.white} />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.liveStatusPill}>
            <Text style={styles.liveStatusText}>LIVE STATUS</Text>
          </View>
          <Text style={styles.heroTitle}>{heroInfo.title}</Text>
          <Text style={styles.heroDesc}>{heroInfo.desc}</Text>
        </View>

        {/* Timeline Card */}
        <View style={styles.card}>
          {ACTIVE_MILESTONES.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isActive = index === currentIndex;
            const isNext = index === currentIndex + 1;
            const isLast = index === ACTIVE_MILESTONES.length - 1;
            const timeStr = getMilestoneTime(step);

            const lineStyle = [
              styles.timelineLine,
              isCompleted || isActive ? styles.timelineLineCompleted : null,
            ];

            return (
              <View key={step} style={styles.timelineRow}>
                {/* Visual indicator (line + dot) */}
                <View style={styles.timelineLeft}>
                  {!isLast && <View style={lineStyle} />}
                  {isCompleted ? (
                    <View style={styles.dotCompleted}>
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                    </View>
                  ) : isActive ? (
                    <View style={styles.dotActive}>
                      <View style={styles.dotActiveInner} />
                    </View>
                  ) : (
                    <View style={styles.dotFuture} />
                  )}
                </View>

                {/* Text details */}
                <View style={styles.timelineRight}>
                  <View style={styles.timelineTextRow}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isActive ? styles.stepLabelActive : null,
                        isCompleted ? styles.stepLabelCompleted : null,
                      ]}
                    >
                      {ACTIVE_MILESTONE_LABELS[step]}
                    </Text>
                    {isCompleted && timeStr && <Text style={styles.stepTime}>{timeStr}</Text>}
                  </View>

                  {isActive && (
                    <View style={styles.activeTag}>
                      <Text style={styles.activeTagText}>Active Now</Text>
                    </View>
                  )}

                  {isNext && (
                    <View style={styles.nextTag}>
                      <Text style={styles.nextTagText}>Next Step</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Order Details Card */}
        <View style={[styles.card, styles.orderDetailsCard]}>
          <View style={styles.storeRow}>
            <View style={styles.storeLeft}>
              <Text style={styles.storeName}>{order.retailerName}</Text>
              <Text style={styles.orderNumber}>Order #NF-{orderId.slice(-5).toUpperCase()}</Text>
            </View>
            <View style={styles.pricePill}>
              <Text style={styles.pricePillText}>₹{(order.price * order.qty).toFixed(2)}</Text>
            </View>
          </View>

          {/* Product row */}
          <View style={styles.productRow}>
            <View style={styles.productIconBox}>
              <Ionicons name="basket-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{order.qty}x {order.productName}</Text>
              <Text style={styles.productSubtitle}>Classic Masala, 70g</Text>
            </View>
          </View>

          {/* Estimate & View Bill */}
          <View style={styles.billRow}>
            <View style={styles.estimateBox}>
              <Ionicons name="time-outline" size={16} color={Colors.primary} />
              <Text style={styles.estimateText}>Estimate: <Text style={styles.estimateValue}>1:57 mins</Text></Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.viewBillText}>VIEW BILL</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Support Button */}
          <TouchableOpacity style={styles.supportBtn} onPress={handleSupportPress}>
            <Ionicons name="call" size={18} color={Colors.white} />
            <Text style={styles.supportBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Custom Bottom Tab Bar */}
      <SafeAreaView edges={['bottom']} style={styles.bottomTabBarContainer}>
        <View style={styles.bottomTabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => handleBottomTabPress('Home')}>
            <Ionicons name="home-outline" size={22} color={Colors.textMuted} />
            <Text style={styles.tabLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItemActive}>
            <View style={styles.tabActivePill}>
              <Ionicons name="receipt" size={20} color={Colors.textPrimary} />
            </View>
            <Text style={styles.tabLabelActive}>Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => handleBottomTabPress('Search')}>
            <Ionicons name="search-outline" size={22} color={Colors.textMuted} />
            <Text style={styles.tabLabel}>Search</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => handleBottomTabPress('Profile')}>
            <Ionicons name="person-outline" size={22} color={Colors.textMuted} />
            <Text style={styles.tabLabel}>Profile</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
  backBtn: {
    padding: 4,
  },
  headerLogo: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
  },

  heroSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  liveStatusPill: {
    backgroundColor: '#F3EEFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  liveStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: '85%',
  },

  errorIconCircleOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFE4E6', // Light red
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  timelineHistoryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineLeft: {
    width: 30,
    alignItems: 'center',
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 14,
    top: 24,
    bottom: -16,
    width: 2,
    backgroundColor: '#E8E4F0',
  },
  timelineLineCompleted: {
    backgroundColor: Colors.primary,
  },
  dotCompleted: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotFailed: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  dotActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: '#A3D900',
  },
  dotActiveInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  dotFuture: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E8E4F0',
    backgroundColor: Colors.white,
    zIndex: 1,
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 20,
  },
  timelineTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepLabelCompleted: {
    color: Colors.textSecondary,
  },
  stepLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  stepLabelFailed: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  stepLabelDisabled: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
    opacity: 0.5,
  },
  stepSubtextDisabled: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
    opacity: 0.5,
  },
  stepTime: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  stepTimeFailed: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 2,
  },
  activeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F7FFA6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  activeTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#658C00',
  },
  nextTag: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  nextTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },

  orderDetailsCard: {
    paddingBottom: 20,
  },
  storeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  storeLeft: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  refundAmountText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  orderNumber: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  refundMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  itemsCountText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  pricePill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pricePillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F6FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  productIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#E8DFF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  productSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  estimateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  estimateText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  estimateValue: {
    fontWeight: '700',
    color: Colors.primary,
  },
  viewBillText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  supportBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  supportBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  mockThumbnailsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mockThumbnailBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EAE5F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DCD4EC',
  },

  needHelpBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },
  needHelpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  needHelpIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needHelpTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  needHelpDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  actionButtonsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  searchAgainBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  searchAgainBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  orderHistoryBtn: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#E8E4F0',
  },
  orderHistoryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

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
  tabItemActive: {
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
