import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, OrderStatus, ACTIVE_STATUSES } from '../../constants';
import { subscribeToCustomerOrders } from '../../services/firestore';
import type { Order, RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = {
  customerName: string;
  navigation: any;
};

export default function CustomerOrdersScreen({ customerName, navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to customer's live orders
    const unsubscribe = subscribeToCustomerOrders(customerName, (data) => {
      setOrders(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [customerName]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status as OrderStatus));
  const pastOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status as OrderStatus));

  const handleOrderPress = (orderId: string) => {
    navigation.navigate('OrderStatus', { customerName, orderId });
  };

  const getStatusLabelColor = (status: string) => {
    switch (status) {
      case OrderStatus.Delivered:
        return Colors.success;
      case OrderStatus.AutoCancelled:
      case OrderStatus.Rejected:
        return Colors.error;
      case OrderStatus.NoPartnerFound:
        return Colors.warning;
      default:
        return Colors.primary;
    }
  };

  const renderOrderCard = (item: Order) => {
    const isActive = ACTIVE_STATUSES.includes(item.status as OrderStatus);
    const dateStr = item.createdAt?.toDate
      ? item.createdAt.toDate().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
        })
      : '';

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => handleOrderPress(item.id)}
      >
        <View style={styles.cardTop}>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{item.retailerName}</Text>
            <Text style={styles.orderId}>Order #NF-{item.id.slice(-5).toUpperCase()}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusLabelColor(item.status) + '15' },
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusLabelColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardBottom}>
          <View style={styles.productInfo}>
            <Ionicons name="basket-outline" size={16} color={Colors.textSecondary} />
            <Text style={styles.productText}>
              {item.qty}x {item.productName}
            </Text>
          </View>
          <Text style={styles.price}>₹{(item.price * item.qty).toFixed(2)}</Text>
        </View>

        {isActive && (
          <View style={styles.trackBanner}>
            <View style={styles.liveDot} />
            <Text style={styles.trackText}>Tap to Track Order Live</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} style={{ marginLeft: 'auto' }} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F6FF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching your orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="receipt-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Browse products and place your first hyperlocal order!
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Active Orders Section */}
          {activeOrders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Deliveries</Text>
              {activeOrders.map(renderOrderCard)}
            </View>
          )}

          {/* Past Orders Section */}
          {pastOrders.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order History</Text>
              {pastOrders.map(renderOrderCard)}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8F6FF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8F6FF',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  storeInfo: {
    flex: 1,
    marginRight: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  orderId: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 12,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  productText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  trackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3EEFF',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  trackText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
});
