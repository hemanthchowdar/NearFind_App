import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import type { RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Customer Home tab — shown in the bottom tabs.
 * Displays a welcome message and quick-action cards.
 */
type Props = NativeStackScreenProps<RootStackParamList, 'CustomerTabs'>;

export default function CustomerHomeScreen({ route, navigation }: Props) {
  const { customerName } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {customerName} 👋</Text>
            <Text style={styles.subtitle}>What do you need today?</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Quick actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('CustomerSearch', { customerName })}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.customerCardBg }]}>
              <Ionicons name="search" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.actionTitle}>Search Products</Text>
            <Text style={styles.actionDesc}>Find items from nearby stores</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: Colors.deliveryCardBg }]}>
              <Ionicons name="receipt-outline" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionTitle}>My Orders</Text>
            <Text style={styles.actionDesc}>Track your deliveries</Text>
          </TouchableOpacity>
        </View>

        {/* Popular categories */}
        <Text style={styles.sectionTitle}>Popular Categories</Text>
        <View style={styles.categoriesRow}>
          {[
            { icon: 'nutrition-outline', label: 'Groceries', color: '#F59E0B' },
            { icon: 'water-outline', label: 'Dairy', color: '#3B82F6' },
            { icon: 'pizza-outline', label: 'Snacks', color: '#EF4444' },
            { icon: 'sparkles-outline', label: 'Personal', color: '#8B5CF6' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.label}
              style={styles.categoryChip}
              onPress={() => navigation.navigate('CustomerSearch', { customerName })}
            >
              <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  greeting: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  notifBtn: { padding: 4 },
  quickActions: { flexDirection: 'row', gap: 14, marginBottom: 28 },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  actionDesc: { fontSize: 12, color: Colors.textSecondary, lineHeight: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 14 },
  categoriesRow: { flexDirection: 'row', gap: 10 },
  categoryChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 6,
  },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: { fontSize: 11, fontWeight: '600', color: Colors.textPrimary },
});
