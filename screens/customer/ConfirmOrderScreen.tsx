import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { createOrder } from '../../services/firestore';
import type { RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfirmOrder'>;

export default function ConfirmOrderScreen({ route, navigation }: Props) {
  const { customerName, productId, productName, retailerId, retailerName, price, stock } =
    route.params;

  const [qty, setQty] = useState(1);
  const [placing, setPlacing] = useState(false);

  const itemTotal = price * qty;
  const deliveryFee = 0; // Free delivery for prototype
  const grandTotal = itemTotal + deliveryFee;

  const handleDecrement = () => {
    if (qty > 1) setQty(qty - 1);
  };

  const handleIncrement = () => {
    if (qty < stock) setQty(qty + 1);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const orderId = await createOrder({
        productId,
        productName,
        retailerId,
        retailerName,
        qty,
        price,
        customerName,
      });
      // Navigate to order status tracking
      navigation.replace('OrderStatus', { customerName, orderId });
    } catch (error: any) {
      Alert.alert(
        'Order Failed',
        error.message || 'Something went wrong. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Order</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Ionicons name="help-circle-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Ordering From */}
        <View style={styles.orderingFromCard}>
          <View style={styles.orderingFromIcon}>
            <MaterialCommunityIcons name="storefront-outline" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.orderingFromLabel}>Ordering From</Text>
            <Text style={styles.orderingFromName}>{retailerName}</Text>
          </View>
        </View>

        {/* Product Card */}
        <View style={styles.productCard}>
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="cube-outline" size={36} color={Colors.primary} />
          </View>
          <View style={styles.productInfo}>
            <View style={styles.productNameRow}>
              <Text style={styles.productName}>{productName}</Text>
              <View style={styles.vegBadge}>
                <Text style={styles.vegBadgeText}>VEG</Text>
              </View>
            </View>
            <Text style={styles.productMeta}>Standard Pack • Fresh</Text>
            <Text style={styles.perUnitLabel}>Per Unit</Text>
            <Text style={styles.productPrice}>₹{price.toFixed(2)}</Text>
          </View>
        </View>

        {/* Quantity Selector */}
        <View style={styles.qtySection}>
          <Text style={styles.qtyLabel}>Select Quantity</Text>
          <View style={styles.qtyStepper}>
            <TouchableOpacity
              style={[styles.qtyBtn, qty <= 1 && styles.qtyBtnDisabled]}
              onPress={handleDecrement}
              disabled={qty <= 1}
            >
              <Feather name="minus" size={20} color={qty <= 1 ? Colors.textMuted : Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, styles.qtyBtnPlus, qty >= stock && styles.qtyBtnDisabled]}
              onPress={handleIncrement}
              disabled={qty >= stock}
            >
              <Feather name="plus" size={20} color={qty >= stock ? Colors.textMuted : Colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Estimated Time & Distance */}
        <View style={styles.infoRow}>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>ESTIMATED TIME</Text>
            <View style={styles.infoCardValue}>
              <Ionicons name="flash" size={16} color={Colors.primary} />
              <Text style={styles.infoCardText}>12 MINS</Text>
            </View>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>DISTANCE</Text>
            <View style={styles.infoCardValue}>
              <Ionicons name="navigate-outline" size={16} color={Colors.primary} />
              <Text style={styles.infoCardText}>0.8 KM</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>Item Total</Text>
            <Text style={styles.priceRowValue}>₹{itemTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceRowLabel}>Delivery Fee</Text>
            <Text style={[styles.priceRowValue, { color: Colors.success }]}>FREE</Text>
          </View>
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.paymentRow}>
          <View style={styles.paymentLeft}>
            <View style={styles.paymentIcon}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={styles.paymentText}>Payment: Cash on Delivery</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.changeText}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button — fixed at bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, placing && styles.placeOrderBtnDisabled]}
          activeOpacity={0.8}
          onPress={handlePlaceOrder}
          disabled={placing}
        >
          {placing ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  },
  helpBtn: {
    padding: 4,
  },

  // Ordering From
  orderingFromCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 12,
  },
  orderingFromIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.customerCardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderingFromLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  orderingFromName: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  // Product card
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 14,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.customerCardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  productName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  vegBadge: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.success,
  },
  vegBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.success,
    letterSpacing: 0.5,
  },
  productMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  perUnitLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },

  // Quantity
  qtySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  qtyLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qtyBtnPlus: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  qtyBtnDisabled: {
    opacity: 0.4,
  },
  qtyValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    minWidth: 48,
    textAlign: 'center',
  },

  // Info row
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  infoCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoCardValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoCardText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },

  // Price breakdown
  priceBreakdown: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  priceRowLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  priceRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  priceDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 10,
    borderStyle: 'dashed',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  // Payment
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.customerCardBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
    textDecorationLine: 'underline',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  placeOrderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  placeOrderBtnDisabled: {
    opacity: 0.6,
  },
  placeOrderText: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
  },
});
