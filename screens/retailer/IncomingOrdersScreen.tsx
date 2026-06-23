import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import type { RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'RetailerDashboard'>;

export default function IncomingOrdersScreen({ route, navigation }: Props) {
  const { retailerName } = route.params;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{retailerName}</Text>
        </View>
        <View style={styles.placeholder}>
          <Ionicons name="construct-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.placeholderTitle}>Retailer Dashboard</Text>
          <Text style={styles.placeholderDesc}>
            Coming soon — incoming orders, accept/reject, and status management.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: Colors.textPrimary },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  placeholderTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  placeholderDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', maxWidth: 260, lineHeight: 20 },
});
