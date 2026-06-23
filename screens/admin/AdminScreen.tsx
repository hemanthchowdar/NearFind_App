import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { seedDatabase } from '../../services/firestore';
import type { RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

export default function AdminScreen({ navigation }: Props) {
  const [seeding, setSeeding] = useState(false);

  const handleSeed = async () => {
    Alert.alert(
      'Seed Database',
      'This will clear all existing data and populate fresh demo data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Now',
          style: 'destructive',
          onPress: async () => {
            setSeeding(true);
            try {
              await seedDatabase();
              Alert.alert('Success', 'Database seeded with demo data!');
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to seed database');
            } finally {
              setSeeding(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Console</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.placeholder}>
            <Ionicons name="server-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.placeholderTitle}>Admin Dashboard</Text>
            <Text style={styles.placeholderDesc}>
              Full order management coming soon. For now, you can seed the database with demo data.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.seedBtn, seeding && styles.seedBtnDisabled]}
            onPress={handleSeed}
            disabled={seeding}
          >
            {seeding ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons name="refresh-outline" size={20} color={Colors.white} />
                <Text style={styles.seedBtnText}>Reset & Seed Database</Text>
              </>
            )}
          </TouchableOpacity>
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
  content: { flex: 1, justifyContent: 'center' },
  placeholder: { alignItems: 'center', gap: 12, marginBottom: 40 },
  placeholderTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  placeholderDesc: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 20 },
  seedBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  seedBtnDisabled: { opacity: 0.6 },
  seedBtnText: { fontSize: 16, fontWeight: '700', color: Colors.white },
});
