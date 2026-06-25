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
  TextInput,
  Switch,
  Image,
  Modal,
  Dimensions,
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
  subscribeToRetailerStock,
  updateStockQty,
  addRetailerProduct,
} from '../../services/firestore';
import type { Order, RootStackParamList, RetailerStock } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'RetailerDashboard'>;

interface ActionOrder {
  id: string;
  isMock?: boolean;
  productName: string;
  qty: number;
  customerName: string;
  timeString?: string;
  statusText?: string;
  hasActions?: boolean;
}

export default function IncomingOrdersScreen({ route, navigation }: Props) {
  const { retailerId, retailerName } = route.params;

  const [activeTab, setActiveTab] = useState<'Home' | 'Orders' | 'Search' | 'Profile'>('Home');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [stockItems, setStockItems] = useState<(RetailerStock & { productName: string })[]>([]);

  const [isStoreOpen, setIsStoreOpen] = useState(true);

  const [now, setNow] = useState(Date.now());

  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [addingProduct, setAddingProduct] = useState(false);

  const [mockActionOrders, setMockActionOrders] = useState<ActionOrder[]>([
    {
      id: 'ORD-8821',
      isMock: true,
      productName: '2x Espresso, 1x Bagel',
      qty: 3,
      customerName: 'Sarah J.',
      timeString: '2m ago',
      hasActions: true,
    },
    {
      id: 'ORD-8819',
      isMock: true,
      productName: 'Large Custom Gift Basket',
      qty: 1,
      customerName: 'Mike R.',
      statusText: 'Pickup 4:00 PM',
      hasActions: false,
    },
  ]);

  const [mockProducts, setMockProducts] = useState([
    {
      id: 'stock-mock-1',
      isMock: true,
      productName: 'Dark Roast Reserve',
      price: 24.99,
      stock: 42,
      sku: 'CR-4922',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=150&q=80',
      isActive: true,
      tag: 'IN STOCK',
    },
    {
      id: 'stock-mock-2',
      isMock: true,
      productName: 'Wildflower Honey',
      price: 18.50,
      stock: 3,
      sku: 'WF-0312',
      image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=150&q=80',
      isActive: true,
      tag: 'LOW STOCK',
    },
    {
      id: 'stock-mock-3',
      isMock: true,
      productName: 'Midnight Scented Candle',
      price: 32.00,
      stock: 0,
      sku: 'SC-9901',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=150&q=80',
      isActive: false,
      tag: 'OUT OF STOCK',
    },
    {
      id: 'stock-mock-4',
      isMock: true,
      productName: 'Eco-Canvas Totebag',
      price: 12.00,
      stock: 156,
      sku: 'EB-8821',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=150&q=80',
      isActive: true,
      tag: 'PROMOTED',
    },
  ]);

  useEffect(() => {
    
    const unsubscribeOrders = subscribeToRetailerOrders(retailerId, (data) => {
      setOrders(data);
      setLoading(false);
    });

    const unsubscribeStock = subscribeToRetailerStock(retailerId, (data) => {
      setStockItems(data);
    });

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      unsubscribeOrders();
      unsubscribeStock();
      clearInterval(timer);
    };
  }, [retailerId]);

  const placedRequests = orders.filter((o) => o.status === OrderStatus.Placed);
  const activeOrders = orders.filter(
    (o) =>
      o.status === OrderStatus.Accepted ||
      o.status === OrderStatus.Packed ||
      o.status === OrderStatus.ReadyForPickup
  );
  const historyOrders = orders.filter(
    (o) =>
      o.status === OrderStatus.PickedUp ||
      o.status === OrderStatus.Delivered ||
      o.status === OrderStatus.Rejected
  );
  const completedOrdersCount = orders.filter((o) => o.status === OrderStatus.Delivered).length;

  const acceptedCount = orders.filter((o) => o.status === OrderStatus.Accepted).length;
  const packedCount = orders.filter((o) => o.status === OrderStatus.Packed).length;
  const readyCount = orders.filter((o) => o.status === OrderStatus.ReadyForPickup).length;

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

  const handleToggleMockProduct = (id: string, currentVal: boolean) => {
    setMockProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextActive = !currentVal;
          return {
            ...item,
            isActive: nextActive,
            stock: nextActive ? (item.stock === 0 ? 10 : item.stock) : 0,
            tag: nextActive ? (item.stock > 3 ? 'IN STOCK' : 'LOW STOCK') : 'OUT OF STOCK',
          };
        }
        return item;
      })
    );
  };

  const handleToggleDbProduct = async (stockId: string, currentStock: number) => {
    try {
      const newStock = currentStock > 0 ? 0 : 10;
      await updateStockQty(stockId, newStock);
    } catch (e: any) {
      Alert.alert('Error', 'Failed to update stock status');
    }
  };

  const handleActionOnMockOrder = (orderId: string, accepted: boolean) => {
    Alert.alert(
      accepted ? 'Order Accepted' : 'Order Declined',
      `Mock Order ${orderId} has been successfully ${accepted ? 'accepted' : 'declined'}.`
    );
    setMockActionOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  const handleAddProductSubmit = async () => {
    if (!newProductName.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }
    const priceNum = parseFloat(newProductPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid price.');
      return;
    }
    const stockNum = parseInt(newProductStock, 10);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('Validation Error', 'Please enter a valid stock amount.');
      return;
    }

    try {
      setAddingProduct(true);
      await addRetailerProduct(retailerId, newProductName, priceNum, stockNum);
      setAddModalVisible(false);
      setNewProductName('');
      setNewProductPrice('');
      setNewProductStock('');
      Alert.alert('Success', 'Product successfully added to your inventory!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add product');
    } finally {
      setAddingProduct(false);
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

  const getFilteredProducts = () => {
    
    const allItems = [
      ...mockProducts,
      ...stockItems.map((item) => ({
        id: item.id,
        isMock: false,
        productName: item.productName,
        price: item.price,
        stock: item.stock,
        sku: `SKU-${item.id.slice(-4).toUpperCase()}`,
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
        isActive: item.stock > 0,
        tag: item.stock === 0 ? 'OUT OF STOCK' : item.stock <= 3 ? 'LOW STOCK' : 'IN STOCK',
      })),
    ];

    let filtered = allItems.filter((item) =>
      item.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (stockFilter === 'Low') {
      filtered = filtered.filter((item) => item.stock > 0 && item.stock <= 5);
    } else if (stockFilter === 'Out') {
      filtered = filtered.filter((item) => item.stock === 0);
    }

    return filtered;
  };

  const renderNewRequestsTab = () => {
    
    const allPendingActions: ActionOrder[] = [
      ...placedRequests.map((req) => ({
        id: req.id,
        isMock: false,
        productName: `${req.qty}x ${req.productName}`,
        qty: req.qty,
        customerName: req.customerName,
        timeString: 'New live',
        hasActions: true,
      })),
      ...mockActionOrders,
    ];

    const completedOrders = 24 + completedOrdersCount;
    const progressPercent = Math.min(1, completedOrders / 30);

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Store Status Banner */}
        <View style={styles.storeStatusCard}>
          <View style={styles.storeStatusTextRow}>
            <View style={[styles.statusDot, { backgroundColor: isStoreOpen ? '#A3D900' : '#EF4444' }]} />
            <View>
              <Text style={styles.statusLabelText}>STORE STATUS</Text>
              <Text style={styles.statusMainText}>
                {isStoreOpen ? 'Open & Accepting' : 'Closed'}
              </Text>
            </View>
          </View>
          <Switch
            value={isStoreOpen}
            onValueChange={setIsStoreOpen}
            thumbColor="#FFFFFF"
            trackColor={{ false: '#E2E8F0', true: '#C8FF00' }}
          />
        </View>

        {/* Today's Sales Card */}
        <View style={styles.salesBannerCard}>
          <View style={styles.salesLeft}>
            <Text style={styles.salesLabel}>TODAY'S SALES</Text>
            <Text style={styles.salesAmount}>$1,482.50</Text>
            <Text style={styles.salesTrend}>📈 12% vs yesterday</Text>
          </View>
          <View style={styles.salesRight}>
            <Ionicons name="wallet-outline" size={64} color="rgba(255, 255, 255, 0.15)" />
          </View>
        </View>

        {/* Capacity & prep stats */}
        <View style={styles.twoColRow}>
          <View style={styles.halfCard}>
            <Text style={styles.halfCardLabel}>ACTIVE ORDERS</Text>
            <Text style={styles.halfCardValue}>
              {activeOrders.length < 10 ? `0${activeOrders.length}` : activeOrders.length}
              <Text style={styles.halfCardSubValue}> / 12 capacity</Text>
            </Text>
          </View>
          <View style={styles.halfCard}>
            <Text style={styles.halfCardLabel}>AVG PREP TIME</Text>
            <Text style={styles.halfCardValue}>
              14 <Text style={styles.halfCardSubValue}>min</Text>
            </Text>
          </View>
        </View>

        {/* Action Needed section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>Action Needed</Text>
            <View style={styles.newActionTag}>
              <Text style={styles.newActionTagText}>NEW</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => setActiveTab('Orders')}>
            <Text style={styles.viewAllLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* List items under Action Needed */}
        {allPendingActions.map((actionOrder) => (
          <View key={actionOrder.id} style={[styles.actionOrderCard, !actionOrder.hasActions && { borderLeftColor: '#E2E8F0' }]}>
            <View style={styles.actionHeaderRow}>
              <Text style={styles.actionOrderId}>#{actionOrder.id}</Text>
              {actionOrder.timeString ? (
                <View style={styles.actionTimeBadge}>
                  <Text style={styles.actionTimeText}>{actionOrder.timeString}</Text>
                </View>
              ) : (
                <Ionicons name="time-outline" size={18} color="#8A84A0" />
              )}
            </View>
            <Text style={styles.actionProductName}>{actionOrder.productName}</Text>
            <Text style={styles.actionCustomerText}>
              Customer: {actionOrder.customerName} • {actionOrder.statusText || 'ASAP'}
            </Text>

            {/* Render buttons if order requires immediate action */}
            {actionOrder.hasActions && (
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  style={styles.acceptOrderBtn}
                  onPress={() => {
                    if (actionOrder.isMock) {
                      handleActionOnMockOrder(actionOrder.id, true);
                    } else {
                      handleAccept(actionOrder.id);
                    }
                  }}
                >
                  <Text style={styles.acceptOrderBtnText}>ACCEPT ORDER</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.declineOrderBtn}
                  onPress={() => {
                    if (actionOrder.isMock) {
                      handleActionOnMockOrder(actionOrder.id, false);
                    } else {
                      handleReject(actionOrder.id);
                    }
                  }}
                >
                  <Text style={styles.declineOrderBtnText}>DECLINE</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}

        {allPendingActions.length === 0 && (
          <View style={styles.emptyActionsCard}>
            <Ionicons name="checkmark-done-circle-outline" size={32} color="#A3D900" />
            <Text style={styles.emptyActionsText}>No pending actions right now</Text>
          </View>
        )}

        {/* Daily Goal Tracker */}
        <View style={styles.goalCard}>
          <Text style={styles.goalTitle}>Daily Goal Tracker</Text>
          <Text style={styles.goalDesc}>You're on track to hit your daily target!</Text>

          <View style={styles.goalRow}>
            <Text style={styles.completedCountText}>{completedOrders} Orders Completed</Text>
            <Text style={styles.goalTargetText}>Goal: 30</Text>
          </View>

          {/* Goal Progress Bar */}
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progressPercent * 100}%` }]} />
          </View>

          {/* Bottom stats row */}
          <View style={styles.goalMetricsRow}>
            <View style={styles.goalMetricColumn}>
              <Text style={styles.metricBigText}>98%</Text>
              <Text style={styles.metricLabelText}>QUALITY</Text>
            </View>
            <View style={styles.goalDivider} />
            <View style={styles.goalMetricColumn}>
              <Text style={styles.metricBigText}>4.9</Text>
              <Text style={styles.metricLabelText}>RATING</Text>
            </View>
            <View style={styles.goalDivider} />
            <View style={styles.goalMetricColumn}>
              <Text style={styles.metricBigText}>0.5%</Text>
              <Text style={styles.metricLabelText}>CANCELS</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.gridItem} onPress={() => setActiveTab('Search')}>
            <View style={styles.gridIconBg}>
              <Ionicons name="cube-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.gridLabel}>Inventory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => Alert.alert('Payouts', 'Payout reports are being generated.')}
          >
            <View style={styles.gridIconBg}>
              <Ionicons name="card-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.gridLabel}>Payouts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridItem}
            onPress={() => Alert.alert('Staff Management', 'Access restricted to Store Manager.')}
          >
            <View style={styles.gridIconBg}>
              <Ionicons name="people-outline" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.gridLabel}>Staff</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  const renderOrdersTab = () => {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Count Stats Grid */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: Colors.primary }]}>
            <View style={styles.statBoxTop}>
              <Ionicons name="clipboard-outline" size={15} color={Colors.white} />
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statBoxLabel}>ACCEPTED</Text>
            </View>
            <Text style={styles.statBoxNumber}>
              {acceptedCount < 10 ? `0${acceptedCount}` : acceptedCount}
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: Colors.accent }]}>
            <View style={styles.statBoxTop}>
              <Ionicons name="cube-outline" size={15} color={Colors.textPrimary} />
              <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.statBoxLabel, { color: Colors.textPrimary }]}>PACKED</Text>
            </View>
            <Text style={[styles.statBoxNumber, { color: Colors.textPrimary }]}>
              {packedCount < 10 ? `0${packedCount}` : packedCount}
            </Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: '#3B82F6' }]}>
            <View style={styles.statBoxTop}>
              <Ionicons name="flash-outline" size={15} color={Colors.white} />
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.statBoxLabel}>READY</Text>
            </View>
            <Text style={styles.statBoxNumber}>
              {readyCount < 10 ? `0${readyCount}` : readyCount}
            </Text>
          </View>
        </View>

        {/* Active Queue Cards */}
        {activeOrders.map((ord) => {
          const isAccepted = ord.status === OrderStatus.Accepted;
          const isPacked = ord.status === OrderStatus.Packed;

          return (
            <View key={ord.id} style={styles.card}>
              <View style={styles.cardTopBar}>
                <Text style={styles.orderIdLabel}>#NF-{ord.id.slice(-5).toUpperCase()}</Text>
                <View
                  style={[
                    styles.statusPill,
                    isAccepted ? styles.statusPillPurple : (isPacked ? styles.statusPillGreen : styles.statusPillBlue),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      isAccepted ? styles.statusPillTextPurple : (isPacked ? styles.statusPillTextGreen : styles.statusPillTextBlue),
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
              ) : isPacked ? (
                <View style={styles.activeDetailsRow}>
                  <Ionicons name="car-outline" size={16} color={Colors.textSecondary} />
                  <Text style={styles.activeDetailsText}>
                    {ord.deliveryPartnerId
                      ? 'Driver Assigned: David K.'
                      : 'Searching for driver...'}
                  </Text>
                </View>
              ) : (
                <View style={styles.waitingDriverContainer}>
                  <Ionicons name="hourglass-outline" size={16} color="#1E40AF" />
                  <Text style={styles.waitingDriverText}>
                    READY FOR DELIVERY AGENT TO PICKUP
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
              ) : isPacked ? (
                <TouchableOpacity
                  style={styles.markReadyBtn}
                  onPress={() => handleMarkReady(ord.id)}
                >
                  <Ionicons name="checkmark-circle-outline" size={18} color={Colors.textPrimary} />
                  <Text style={styles.markReadyBtnText}>MARK READY FOR PICKUP</Text>
                </TouchableOpacity>
              ) : null}
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

        {/* Order History Section */}
        {historyOrders.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>Order History</Text>
            {historyOrders.map((ord) => {
              const isDelivered = ord.status === OrderStatus.Delivered;
              const isPickedUp = ord.status === OrderStatus.PickedUp;

              return (
                <View key={ord.id} style={[styles.card, styles.historyCard]}>
                  <View style={styles.cardTopBar}>
                    <Text style={styles.orderIdLabel}>#NF-{ord.id.slice(-5).toUpperCase()}</Text>
                    <View
                      style={[
                        styles.statusPill,
                        isDelivered ? styles.statusPillGreen : (isPickedUp ? styles.statusPillPurple : styles.statusPillGray),
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          isDelivered ? styles.statusPillTextGreen : (isPickedUp ? styles.statusPillTextPurple : styles.statusPillTextGray),
                        ]}
                      >
                        {ord.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.activeCustomerName}>{ord.customerName}</Text>
                  
                  <View style={styles.activeDetailsRow}>
                    <Ionicons name="briefcase-outline" size={16} color={Colors.textMuted} />
                    <Text style={styles.historyDetailsText} numberOfLines={1}>
                      {ord.qty} item{ord.qty > 1 ? 's' : ''} • {ord.productName}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  const renderSearchTab = () => {
    const listData = getFilteredProducts();

    const totalItemsCount = 1280 + stockItems.length;
    const activeCount = 1102 + stockItems.filter((i) => i.stock > 0).length;
    const alertCount = 12 + stockItems.filter((i) => i.stock > 0 && i.stock <= 3).length;

    return (
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Search bar input */}
          <View style={styles.inventorySearchBar}>
            <Ionicons name="search-outline" size={20} color="#8A84A0" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.inventorySearchInput}
              placeholder="Search your inventory (products, category, SKU...)"
              placeholderTextColor="#8A84A0"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Pills row */}
          <View style={styles.filterPillsRow}>
            <TouchableOpacity
              style={[styles.filterPill, stockFilter === 'All' && styles.filterPillActive]}
              onPress={() => setStockFilter('All')}
            >
              <Text style={[styles.filterPillText, stockFilter === 'All' && styles.filterPillTextActive]}>
                All Products
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, stockFilter === 'Low' && styles.filterPillActive]}
              onPress={() => setStockFilter('Low')}
            >
              <Ionicons name="warning-outline" size={14} color={stockFilter === 'Low' ? '#FFF' : '#D97706'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterPillText, stockFilter === 'Low' && styles.filterPillTextActive]}>
                Low Stock
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, stockFilter === 'Out' && styles.filterPillActive]}
              onPress={() => setStockFilter('Out')}
            >
              <Ionicons name="close-circle-outline" size={14} color={stockFilter === 'Out' ? '#FFF' : '#EF4444'} style={{ marginRight: 4 }} />
              <Text style={[styles.filterPillText, stockFilter === 'Out' && styles.filterPillTextActive]}>
                Out of Stock
              </Text>
            </TouchableOpacity>
          </View>

          {/* Statistics Grid */}
          <View style={styles.gridStatsContainer}>
            <View style={styles.gridStatsRow}>
              <View style={styles.statGridCard}>
                <Text style={styles.statGridLabel}>Total Items</Text>
                <Text style={[styles.statGridNumber, { color: Colors.primary }]}>{totalItemsCount}</Text>
              </View>
              <View style={[styles.statGridCard, { backgroundColor: '#C8FF00' }]}>
                <Text style={[styles.statGridLabel, { color: '#1A1135' }]}>Active Now</Text>
                <Text style={[styles.statGridNumber, { color: '#1A1135' }]}>{activeCount}</Text>
              </View>
            </View>
            <View style={styles.gridStatsRow}>
              <View style={styles.statGridCard}>
                <Text style={styles.statGridLabel}>Alerts</Text>
                <Text style={[styles.statGridNumber, { color: '#EF4444' }]}>{alertCount}</Text>
              </View>
              <View style={styles.statGridCard}>
                <Text style={styles.statGridLabel}>SKUs</Text>
                <Text style={styles.statGridNumber}>{432 + stockItems.length}</Text>
              </View>
            </View>
          </View>

          {/* Product Cards list */}
          {listData.map((item, index) => {
            const isOut = item.stock === 0;
            const isLow = !isOut && item.stock <= 5;
            const isSpecial = item.productName === 'Eco-Canvas Totebag';

            return (
              <View
                key={item.id}
                style={[
                  styles.inventoryItemCard,
                  isSpecial && { backgroundColor: Colors.primary },
                ]}
              >
                <View style={styles.inventoryCardMain}>
                  <Image source={{ uri: item.image }} style={styles.inventoryProductImage} />
                  <View style={styles.inventoryInfoContainer}>
                    <Text style={[styles.inventoryProductName, isSpecial && { color: '#FFF' }]}>
                      {item.productName}
                    </Text>
                    <Text style={[styles.inventoryStockLabel, isSpecial && { color: 'rgba(255, 255, 255, 0.7)' }]}>
                      Stock: <Text style={styles.boldText}>{item.stock}</Text> Units
                    </Text>
                    <Text style={[styles.inventorySkuLabel, isSpecial && { color: 'rgba(255, 255, 255, 0.7)' }]}>
                      SKU: {item.sku}
                    </Text>
                  </View>

                  <View style={styles.inventoryRightColumn}>
                    <Text style={[styles.inventoryPriceText, isSpecial && { color: '#C8FF00' }]}>
                      ${item.price.toFixed(2)}
                    </Text>
                    
                    {/* Switch Toggles */}
                    <Switch
                      value={item.isActive}
                      onValueChange={() => {
                        if (item.isMock) {
                          handleToggleMockProduct(item.id, item.isActive);
                        } else {
                          handleToggleDbProduct(item.id, item.stock);
                        }
                      }}
                      thumbColor="#FFFFFF"
                      trackColor={{ false: '#CBD5E1', true: isSpecial ? '#C8FF00' : '#A3D900' }}
                    />

                    {/* Stock level label badge */}
                    <View
                      style={[
                        styles.stockStatusBadge,
                        isOut && styles.badgeOut,
                        isLow && styles.badgeLow,
                        isSpecial && styles.badgePromoted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.stockStatusBadgeText,
                          isOut && styles.badgeOutText,
                          isLow && styles.badgeLowText,
                          isSpecial && styles.badgePromotedText,
                        ]}
                      >
                        {item.tag}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Sticky Add Product Button specifically integrated on the promoted Totebag item banner */}
                {isSpecial && (
                  <TouchableOpacity
                    style={styles.promotedAddBtn}
                    onPress={() => setAddModalVisible(true)}
                  >
                    <Ionicons name="add-circle-outline" size={20} color={Colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.promotedAddBtnText}>Add New Product</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Global Floating Add Product Action */}
        <TouchableOpacity
          style={styles.floatingAddButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={32} color={Colors.white} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderProfileTab = () => {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.profileAvatarBox}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=100&q=80' }}
            style={styles.profileManagerAvatar}
          />
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
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9FF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircleSmall}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=100&q=80' }}
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

      {/* Add New Product Modal Form Overlay */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Product to Inventory</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm}>
              <Text style={styles.inputLabel}>Product Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Organic Strawberries"
                placeholderTextColor="#A1A1AA"
                value={newProductName}
                onChangeText={setNewProductName}
              />

              <Text style={styles.inputLabel}>Retail Price ($)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 5.99"
                keyboardType="decimal-pad"
                placeholderTextColor="#A1A1AA"
                value={newProductPrice}
                onChangeText={setNewProductPrice}
              />

              <Text style={styles.inputLabel}>Opening Stock Units</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 25"
                keyboardType="number-pad"
                placeholderTextColor="#A1A1AA"
                value={newProductStock}
                onChangeText={setNewProductStock}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleAddProductSubmit}
                disabled={addingProduct}
              >
                {addingProduct ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Add Product</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                name="receipt"
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
            onPress={() => setActiveTab('Search')}
          >
            <View style={activeTab === 'Search' ? styles.tabActivePill : null}>
              <Ionicons
                name="search"
                size={20}
                color={activeTab === 'Search' ? '#1A1135' : Colors.textMuted}
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
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  salesTrend: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C8FF00',
  },
  salesRight: {
    flex: 0.8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

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
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  halfCardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  halfCardSubValue: {
    fontSize: 12,
    color: '#8A84A0',
    fontWeight: '500',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1135',
  },
  newActionTag: {
    backgroundColor: '#C8FF00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  newActionTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1A1135',
  },
  viewAllLink: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },

  actionOrderCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    borderLeftWidth: 4,
    borderLeftColor: '#C8FF00', // Lime green highlight
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionOrderId: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  actionTimeBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  actionTimeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  actionProductName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 6,
  },
  actionCustomerText: {
    fontSize: 13,
    color: '#8A84A0',
    marginBottom: 14,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  acceptOrderBtn: {
    flex: 1.5,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptOrderBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  declineOrderBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineOrderBtnText: {
    color: '#1A1135',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyActionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  emptyActionsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A84A0',
  },

  goalCard: {
    backgroundColor: '#E8E5EA',
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 4,
  },
  goalDesc: {
    fontSize: 12,
    color: '#8A84A0',
    marginBottom: 14,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  completedCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  goalTargetText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1135',
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  goalMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  goalMetricColumn: {
    alignItems: 'center',
  },
  metricBigText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 4,
  },
  metricLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
  },
  goalDivider: {
    height: 24,
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },

  quickGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  gridItem: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  gridIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F3EEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1135',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    flexBasis: 0,
    flexShrink: 1,
    borderRadius: 16,
    padding: 10,
    justifyContent: 'space-between',
    minHeight: 80,
  },
  statBoxTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  statBoxNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 8,
  },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
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

  inventorySearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  inventorySearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1135',
    fontWeight: '500',
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: 12,
    color: '#8A84A0',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  gridStatsContainer: {
    marginBottom: 24,
    gap: 10,
  },
  gridStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statGridCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  statGridLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A84A0',
    marginBottom: 6,
  },
  statGridNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1135',
  },

  inventoryItemCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  inventoryCardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inventoryProductImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F8F6FF',
  },
  inventoryInfoContainer: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  inventoryProductName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1135',
    marginBottom: 4,
  },
  inventoryStockLabel: {
    fontSize: 12,
    color: '#8A84A0',
    marginBottom: 2,
  },
  inventorySkuLabel: {
    fontSize: 11,
    color: '#8A84A0',
  },
  boldText: {
    fontWeight: '800',
    color: '#1A1135',
  },
  inventoryRightColumn: {
    alignItems: 'flex-end',
    gap: 6,
  },
  inventoryPriceText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  stockStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockStatusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  badgeOut: {
    backgroundColor: '#FEE2E2',
  },
  badgeOutText: {
    color: '#EF4444',
  },
  badgeLow: {
    backgroundColor: '#FEF3C7',
  },
  badgeLowText: {
    color: '#D97706',
  },
  badgePromoted: {
    backgroundColor: '#C8FF00',
  },
  badgePromotedText: {
    color: '#1A1135',
  },
  promotedAddBtn: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  promotedAddBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 17, 53, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECF9',
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
  },
  modalForm: {
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8A84A0',
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#FAF9FF',
    borderWidth: 1,
    borderColor: '#E9E3FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1135',
    marginBottom: 8,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  modalSubmitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },

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
  profileManagerAvatar: {
    width: '100%',
    height: '100%',
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
  statusPillBlue: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  statusPillTextBlue: {
    color: '#3B82F6',
  },
  statusPillGray: {
    backgroundColor: '#F1F5F9',
    borderColor: '#94A3B8',
  },
  statusPillTextGray: {
    color: '#64748B',
  },
  waitingDriverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
    justifyContent: 'center',
  },
  waitingDriverText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  historySection: {
    marginTop: 28,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 20,
  },
  historySectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  historyCard: {
    opacity: 0.8,
    backgroundColor: '#FAF9FF',
  },
  historyDetailsText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
