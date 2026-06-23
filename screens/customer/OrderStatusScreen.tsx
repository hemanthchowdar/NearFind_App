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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, OrderStatus, TERMINAL_STATUSES } from '../../constants';
import { subscribeToOrder } from '../../services/firestore';
import type { Order, RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderStatus'>;

// Human-friendly status labels
const STATUS_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  [OrderStatus.Placed]: { label: 'Order Placed', icon: 'receipt-outline', color: Colors.primary },
  [OrderStatus.Accepted]: { label: 'Accepted by Store', icon: 'checkmark-circle-outline', color: Colors.success },
  [OrderStatus.Packed]: { label: 'Order Packed', icon: 'cube-outline', color: Colors.info },
  [OrderStatus.ReadyForPickup]: { label: 'Ready for Pickup', icon: 'bicycle-outline', color: '#F59E0B' },
  [OrderStatus.PickedUp]: { label: 'Picked Up', icon: 'car-outline', color: '#8B5CF6' },
  [OrderStatus.Delivered]: { label: 'Delivered!', icon: 'checkmark-done-circle-outline', color: Colors.success },
  [OrderStatus.AutoCancelled]: { label: 'Auto-Cancelled', icon: 'close-circle-outline', color: Colors.error },
  [OrderStatus.Rejected]: { label: 'Rejected by Store', icon: 'close-circle-outline', color: Colors.error },
  [OrderStatus.NoPartnerFound]: { label: 'No Delivery Partner', icon: 'alert-circle-outline', color: Colors.warning },
};

// Cancellation/failure explanation messages
const FAILURE_MESSAGES: Record<string, string> = {
  [OrderStatus.AutoCancelled]:
    "The store didn't respond in time — your order was cancelled automatically. No charges were made.",
  [OrderStatus.Rejected]:
    'The store has rejected this order. Your stock has been restored. Please try another store.',
  [OrderStatus.NoPartnerFound]:
    'No delivery partner was available to pick up your order. Please try placing a new order.',
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
          <Text style={styles.loadingText}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatusInfo = STATUS_LABELS[order.status] || {
    label: order.status,
    icon: 'help-circle-outline',
    color: Colors.textMuted,
  };

  const isTerminal = TERMINAL_STATUSES.includes(order.status as OrderStatus);
  const isFailed = [OrderStatus.AutoCancelled, OrderStatus.Rejected, OrderStatus.NoPartnerFound].includes(
    order.status as OrderStatus
  );
  const failureMessage = FAILURE_MESSAGES[order.status];

  // Full timeline of all statuses the order has gone through
  const ALL_STEPS = [
    OrderStatus.Placed,
    OrderStatus.Accepted,
    OrderStatus.Packed,
    OrderStatus.ReadyForPickup,
    OrderStatus.PickedUp,
    OrderStatus.Delivered,
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.popToTop()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Status</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Current status hero */}
        <View style={[styles.statusHero, { backgroundColor: currentStatusInfo.color + '15' }]}>
          <View style={[styles.statusIconCircle, { backgroundColor: currentStatusInfo.color }]}>
            <Ionicons name={currentStatusInfo.icon as any} size={32} color={Colors.white} />
          </View>
          <Text style={[styles.statusLabel, { color: currentStatusInfo.color }]}>
            {currentStatusInfo.label}
          </Text>
          {!isTerminal && (
            <View style={styles.liveIndicator}>
              <View style={[styles.liveDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.liveText}>Live Tracking</Text>
            </View>
          )}
        </View>

        {/* Failure message */}
        {isFailed && failureMessage && (
          <View style={styles.failureCard}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.error} />
            <Text style={styles.failureText}>{failureMessage}</Text>
          </View>
        )}

        {/* Order details card */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Product</Text>
            <Text style={styles.detailValue}>{order.productName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Store</Text>
            <Text style={styles.detailValue}>{order.retailerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>{order.qty}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total</Text>
            <Text style={[styles.detailValue, { fontWeight: '800', color: Colors.primary }]}>
              ₹{(order.price * order.qty).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Status Timeline</Text>
          {order.statusHistory.map((entry, index) => {
            const info = STATUS_LABELS[entry.status] || {
              label: entry.status,
              icon: 'ellipse',
              color: Colors.textMuted,
            };
            const isLast = index === order.statusHistory.length - 1;
            const time = entry.timestamp?.toDate
              ? entry.timestamp.toDate().toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--';
            const date = entry.timestamp?.toDate
              ? entry.timestamp.toDate().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })
              : '';

            return (
              <View key={index} style={styles.timelineItem}>
                {/* Connector line */}
                {!isLast && <View style={[styles.timelineLine, { backgroundColor: info.color }]} />}
                {/* Dot */}
                <View style={[styles.timelineDot, { backgroundColor: info.color }]}>
                  <Ionicons name={info.icon as any} size={14} color={Colors.white} />
                </View>
                {/* Content */}
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, { color: info.color }]}>{info.label}</Text>
                  <Text style={styles.timelineTime}>
                    {date} • {time}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        {isTerminal && (
          <TouchableOpacity
            style={styles.newOrderBtn}
            onPress={() => navigation.popToTop()}
          >
            <Ionicons name="refresh-outline" size={18} color={Colors.primary} />
            <Text style={styles.newOrderBtnText}>Place New Order</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 60 }} />
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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
  },

  // Status hero
  statusHero: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  statusLabel: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },

  // Failure card
  failureCard: {
    flexDirection: 'row',
    backgroundColor: Colors.errorBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  failureText: {
    flex: 1,
    fontSize: 13,
    color: Colors.error,
    lineHeight: 18,
  },

  // Details card
  detailsCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  // Timeline
  timelineCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 18,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: 32,
    opacity: 0.3,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineTime: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },

  // New order button
  newOrderBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  newOrderBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
});
