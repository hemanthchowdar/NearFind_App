import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants';
import { seedDatabase } from '../../services/firestore';
import type { RootStackParamList } from '../../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

export default function AdminScreen({ route, navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'Home' | 'Search' | 'Reports' | 'Settings'>('Home');

  // Seeding state (Settings Tab)
  const [seeding, setSeeding] = useState(false);

  // Search state (Search Tab)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<'All' | 'Orders' | 'Retailers' | 'Couriers'>('All');

  // Reports state (Reports Tab)
  const [reportPeriod, setReportPeriod] = useState<'7Days' | 'Monthly' | 'Quarterly'>('7Days');

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

  const handleSignOut = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Landing' }],
      })
    );
  };

  // ─── TAB RENDERS ───────────────────────────────────────────────────────────

  // Tab 1: Global Operations Home Page (Screenshot 1 Layout)
  const renderHomeTab = () => {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Four Mini Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statsGridRow}>
            <View style={styles.statGridCard}>
              <Text style={styles.statCardLabel}>TOTAL ORDERS</Text>
              <Text style={styles.statCardBigValue}>1,284</Text>
              <Text style={styles.trendGreenText}>📈 +12%</Text>
            </View>
            <View style={styles.statGridCard}>
              <Text style={styles.statCardLabel}>ACTIVE NOW</Text>
              <Text style={styles.statCardBigValue}>42</Text>
              <View style={styles.activeDotRow}>
                <View style={styles.greenActiveDot} />
                <Text style={styles.activeDotLabel}>In-transit units</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGridRow}>
            <View style={styles.statGridCard}>
              <Text style={styles.statCardLabel}>ETA AVG</Text>
              <Text style={[styles.statCardBigValue, { color: Colors.primary }]}>18 min</Text>
              <Text style={styles.trendMutedText}>Target: 20 min</Text>
            </View>
            <View style={[styles.statGridCard, { backgroundColor: '#6C2BD9' }]}>
              <Text style={[styles.statCardLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>SUPPORT QUEUE</Text>
              <Text style={[styles.statCardBigValue, { color: '#FFF' }]}>03</Text>
              <Text style={[styles.trendMutedText, { color: '#C8FF00' }]}>Urgent tickets</Text>
            </View>
          </View>
        </View>

        {/* Live Network Map View */}
        <View style={styles.mapBannerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=400&q=80' }}
            style={styles.absoluteFillImage}
          />
          <View style={styles.liveNetworkBadge}>
            <View style={styles.liveNetworkDot} />
            <Text style={styles.liveNetworkBadgeText}>LIVE NETWORK VIEW</Text>
          </View>
          <View style={styles.zoomButtonsColumn}>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => Alert.alert('Map Zoom', 'Zooming in live network view...')}>
              <Ionicons name="add" size={18} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.zoomBtn} onPress={() => Alert.alert('Map Zoom', 'Zooming out live network view...')}>
              <Ionicons name="remove" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Fleet Status breakdown */}
        <View style={styles.fleetStatusCard}>
          <View style={styles.fleetHeader}>
            <Text style={styles.fleetTitle}>Fleet Status</Text>
            <TouchableOpacity style={styles.broadcastBtn} onPress={() => Alert.alert('Broadcast', 'Enter your operational update for all agents...')}>
              <Ionicons name="megaphone-outline" size={16} color="#1A1135" style={{ marginRight: 6 }} />
              <Text style={styles.broadcastBtnText}>Broadcast Update</Text>
            </TouchableOpacity>
          </View>

          {/* Breakdown items */}
          <View style={styles.fleetStatsRow}>
            <View style={styles.fleetStatItem}>
              <View style={[styles.fleetIconBg, { backgroundColor: '#EBFEDE' }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#22C55E" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.fleetStatNumber}>12</Text>
                <Text style={styles.fleetStatLabel}>AVAILABLE</Text>
              </View>
            </View>

            <View style={styles.fleetStatItem}>
              <View style={[styles.fleetIconBg, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="bicycle-outline" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.fleetStatNumber}>34</Text>
                <Text style={styles.fleetStatLabel}>BUSY</Text>
              </View>
            </View>

            <View style={styles.fleetStatItem}>
              <View style={[styles.fleetIconBg, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="power-outline" size={18} color="#9CA3AF" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.fleetStatNumber}>08</Text>
                <Text style={styles.fleetStatLabel}>OFF-DUTY</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Active Demand bar chart */}
        <View style={styles.demandCard}>
          <Text style={styles.demandTitle}>Active Demand</Text>
          <Text style={styles.demandSubtitle}>Real-time load balancing active</Text>

          <View style={styles.demandGraph}>
            {[
              { time: '08:00', value: 35 },
              { time: '10:00', value: 55 },
              { time: '12:00', value: 90, highlight: true },
              { time: '14:00', value: 70 },
              { time: '16:00', value: 45 },
            ].map((bar, idx) => (
              <View key={idx} style={styles.demandColumn}>
                <View style={styles.demandBarRail}>
                  <View
                    style={[
                      styles.demandBarFill,
                      { height: `${bar.value}%` },
                      bar.highlight && { backgroundColor: '#C8FF00' },
                    ]}
                  />
                </View>
                {bar.highlight ? (
                  <Text style={[styles.demandLabel, { color: '#C8FF00', fontWeight: '800' }]}>{bar.time}</Text>
                ) : (
                  <Text style={styles.demandLabel}>{bar.time}</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* High Priority Orders table list */}
        <View style={styles.priorityOrdersCard}>
          <View style={styles.priorityHeaderRow}>
            <Text style={styles.priorityTitle}>High-Priority Orders</Text>
            <TouchableOpacity onPress={() => setActiveTab('Search')}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.priorityViewAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={Colors.primary} style={{ marginLeft: 4 }} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.tableColHeader, { flex: 1.2 }]}>ORDER ID</Text>
            <Text style={[styles.tableColHeader, { flex: 2.2 }]}>RETAILER</Text>
            <Text style={[styles.tableColHeader, { flex: 1.6, textAlign: 'right' }]}>STATUS</Text>
          </View>

          {/* Table Rows */}
          {[
            { id: '#NF-9021', name: 'Bistro Tech', status: 'LIVE', style: styles.badgeLive, textStyle: styles.badgeLiveText },
            { id: '#NF-8842', name: 'Green Fresh', status: 'SUCCESS', style: styles.badgeSuccess, textStyle: styles.badgeSuccessText },
            { id: '#NF-9184', name: 'Urban Pharma', status: 'DELAYED', style: styles.badgeDelayed, textStyle: styles.badgeDelayedText },
          ].map((row, idx) => (
            <View key={idx} style={styles.tableDataRow}>
              <Text style={[styles.tableCellId, { flex: 1.2 }]}>{row.id}</Text>
              <Text style={[styles.tableCellName, { flex: 2.2 }]} numberOfLines={1}>{row.name}</Text>
              <View style={[styles.tableCellBadgeContainer, { flex: 1.6 }]}>
                <View style={[styles.statusBadgePill, row.style]}>
                  <Text style={[styles.statusBadgePillText, row.textStyle]}>{row.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Tab 2: Admin Search Page (Screenshot 2 Layout)
  const renderSearchTab = () => {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Search input field */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#8A84A0" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders, couriers, or retailers..."
            placeholderTextColor="#8A84A0"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Recent queries list */}
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentItemRow}>
            <Ionicons name="time-outline" size={16} color="#8A84A0" />
            <Text style={styles.recentItemText}>Last 24h Delayed Orders</Text>
          </View>
          <View style={styles.recentItemRow}>
            <Ionicons name="trending-up-outline" size={16} color="#8A84A0" />
            <Text style={styles.recentItemText}>Retailers in West District</Text>
          </View>
        </View>

        {/* Filters Row */}
        <View style={styles.filterPillsRow}>
          {['All', 'Orders', 'Retailers', 'Couriers'].map((filter) => {
            const isActive = searchFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
                onPress={() => setSearchFilter(filter as any)}
              >
                <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Frequently Searched */}
        <Text style={styles.sectionHeadingText}>Frequently Searched</Text>
        <View style={styles.freqRow}>
          <TouchableOpacity style={[styles.freqChip, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]} onPress={() => setSearchQuery('Delayed Orders')}>
            <Ionicons name="warning-outline" size={14} color="#D97706" style={{ marginRight: 4 }} />
            <Text style={[styles.freqChipText, { color: '#D97706' }]}>Delayed Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.freqChip} onPress={() => setSearchQuery('Top Retailers')}>
            <Ionicons name="storefront-outline" size={14} color="#8A84A0" style={{ marginRight: 4 }} />
            <Text style={styles.freqChipText}>Top Retailers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.freqChip} onPress={() => setSearchQuery('High Demand Zones')}>
            <Ionicons name="map-outline" size={14} color="#8A84A0" style={{ marginRight: 4 }} />
            <Text style={styles.freqChipText}>High Demand Zones</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        <View style={styles.resultsHeaderRow}>
          <Text style={styles.resultsHeadingTitle}>Search Results</Text>
          <Text style={styles.resultsHeadingCount}>3 Results Found</Text>
        </View>

        {/* Card 1: Courier Result */}
        {(searchFilter === 'All' || searchFilter === 'Couriers') && (
          <View style={styles.resultCard}>
            <View style={styles.cardHeaderProfile}>
              <View style={styles.resultAvatarContainer}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80' }}
                  style={styles.resultAvatar}
                />
                <View style={styles.avatarStatusIndicator} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.resultNameTitle}>Marcus Vance</Text>
                <Text style={styles.resultDetailsText}>⚡ Courier • 4.9 Rating • 1.2km away</Text>
              </View>
              <View style={styles.resultBadgeActive}>
                <Text style={styles.resultBadgeActiveText}>Active</Text>
              </View>
            </View>
          </View>
        )}

        {/* Card 2: Retailer Result */}
        {(searchFilter === 'All' || searchFilter === 'Retailers') && (
          <View style={styles.resultCard}>
            <View style={styles.cardHeaderProfile}>
              <View style={styles.resultStoreIconBox}>
                <Ionicons name="basket-outline" size={24} color={Colors.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.resultNameTitle}>The Green Pantry</Text>
                <Text style={styles.resultDetailsText}>📍 Retailer • 14 pending pickups • Downtown</Text>
              </View>
              <View style={styles.resultBadgePurple}>
                <Text style={styles.resultBadgePurpleText}>⚡ High Volume</Text>
              </View>
            </View>
          </View>
        )}

        {/* Card 3: Order Result */}
        {(searchFilter === 'All' || searchFilter === 'Orders') && (
          <View style={styles.resultCard}>
            <View style={styles.cardHeaderProfile}>
              <View style={[styles.resultStoreIconBox, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="receipt-outline" size={20} color="#8A84A0" />
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.resultNameTitle}>Order #84922</Text>
                <Text style={styles.resultDetailsText}>🕒 Placed 14m ago • $42.50 • Client: Sarah J.</Text>
              </View>
              <View style={styles.resultBadgeGrey}>
                <Text style={styles.resultBadgeGreyText}>Pending</Text>
              </View>
            </View>

            {/* Custom order timeline progression */}
            <View style={styles.progressTimelineContainer}>
              <View style={styles.progressRowLine}>
                <View style={styles.timelineSegmentActive} />
                <View style={styles.timelineSegmentInactive} />
              </View>
              <View style={styles.timelineDotsRow}>
                <View style={styles.timelineDotActive} />
                <View style={styles.timelineDotActive} />
                <View style={styles.timelineDotInactive} />
              </View>
              <Text style={styles.progressStatusText}>Awaiting Courier</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Tab 3: Admin Reports Page (Screenshot 3 Layout)
  const renderReportsTab = () => {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Analytics Header Section */}
        <View style={styles.analyticsHeaderCard}>
          <View style={styles.analyticsHeaderLeft}>
            <Text style={styles.analyticsHeadingTitle}>Analytics Overview</Text>
            <Text style={styles.analyticsHeadingSubtitle}>Real-time performance tracking</Text>
          </View>
          <TouchableOpacity style={styles.downloadPdfBtn} onPress={() => Alert.alert('Reports', 'Generating and downloading analytics PDF...')}>
            <Ionicons name="document-text-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
            <Text style={styles.downloadPdfBtnText}>Download PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Period Pills selection */}
        <View style={styles.reportPeriodsRow}>
          <TouchableOpacity
            style={[styles.periodPill, reportPeriod === '7Days' && styles.periodPillActive]}
            onPress={() => setReportPeriod('7Days')}
          >
            <Text style={[styles.periodPillText, reportPeriod === '7Days' && styles.periodPillTextActive]}>
              Last 7 Days
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodPill, reportPeriod === 'Monthly' && styles.periodPillActive]}
            onPress={() => setReportPeriod('Monthly')}
          >
            <Text style={[styles.periodPillText, reportPeriod === 'Monthly' && styles.periodPillTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.periodPill, reportPeriod === 'Quarterly' && styles.periodPillActive]}
            onPress={() => setReportPeriod('Quarterly')}
          >
            <Text style={[styles.periodPillText, reportPeriod === 'Quarterly' && styles.periodPillTextActive]}>
              Quarterly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reports stats grid */}
        <View style={styles.reportStatsGrid}>
          <View style={styles.reportStatsRow}>
            <View style={styles.reportStatsCard}>
              <View style={styles.reportStatsHeader}>
                <Text style={styles.reportStatsLabel}>TOTAL GMV</Text>
                <Text style={styles.reportStatsTrendGreen}>+1.2% 📈</Text>
              </View>
              <Text style={styles.reportStatsValue}>₹18.4L</Text>
            </View>

            <View style={styles.reportStatsCard}>
              <View style={styles.reportStatsHeader}>
                <Text style={styles.reportStatsLabel}>ORDERS</Text>
                <Text style={styles.reportStatsTrendRed}>-2% 📉</Text>
              </View>
              <Text style={styles.reportStatsValue}>5,432</Text>
            </View>
          </View>

          <View style={styles.reportStatsRow}>
            <View style={styles.reportStatsCard}>
              <View style={styles.reportStatsHeader}>
                <Text style={styles.reportStatsLabel}>AVG ORDER</Text>
                <Ionicons name="basket-outline" size={14} color={Colors.primary} />
              </View>
              <Text style={styles.reportStatsValue}>₹340</Text>
            </View>

            <View style={styles.reportStatsCard}>
              <View style={styles.reportStatsHeader}>
                <Text style={styles.reportStatsLabel}>RETAILERS</Text>
                <Ionicons name="storefront-outline" size={14} color={Colors.primary} />
              </View>
              <Text style={styles.reportStatsValue}>156</Text>
            </View>
          </View>
        </View>

        {/* Revenue Growth line chart curve */}
        <View style={styles.revenueCard}>
          <View style={styles.revenueHeaderRow}>
            <Text style={styles.revenueTitle}>Revenue Growth</Text>
            <View style={styles.revenueLegendRow}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>Daily</Text>
              <View style={[styles.legendDot, { backgroundColor: '#C8FF00', marginLeft: 10 }]} />
              <Text style={styles.legendText}>Projection</Text>
            </View>
          </View>

          {/* Curved Line chart wave simulation */}
          <View style={styles.revenueWaveContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=400&q=80' }}
              style={styles.absoluteFillImage}
            />
            {/* Deep purple tint overlay to style graph look */}
            <View style={styles.revenueGraphTintOverlay} />
            <View style={styles.graphPointsContainer}>
              <View style={styles.graphTimelinePoint} />
              <View style={styles.graphTimelinePointHighlight} />
              <View style={styles.graphTimelinePoint} />
            </View>
          </View>

          <View style={styles.timelineXAxisRow}>
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <Text key={day} style={styles.xAxisLabelText}>{day}</Text>
            ))}
          </View>
        </View>

        {/* Efficiency performance metrics */}
        <View style={styles.efficiencyCard}>
          <Text style={styles.efficiencyCardTitle}>Efficiency</Text>

          {/* Fulfillment meter */}
          <View style={styles.efficiencyMetricRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricRowLabel}>Avg Fulfillment</Text>
              <Text style={styles.metricRowBigValue}>24 mins</Text>
            </View>
            {/* Circular progress simulated */}
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircleCheckBg}>
                <Ionicons name="checkmark" size={14} color="#658C00" />
              </View>
            </View>
          </View>

          {/* Cancellation meter */}
          <View style={[styles.efficiencyMetricRow, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.metricRowLabel}>Cancellation Rate</Text>
              <Text style={styles.metricRowBigValue}>1.2%</Text>
            </View>
            <View style={styles.optimalBadge}>
              <Text style={styles.optimalBadgeText}>OPTIMAL</Text>
            </View>
          </View>
        </View>

        {/* Fleet Distribution ratios */}
        <View style={styles.fleetDistributionCard}>
          <Text style={styles.distCardTitle}>Fleet Distribution</Text>

          {/* Bar ratios */}
          <View style={styles.ratioItem}>
            <View style={styles.ratioLabelRow}>
              <Text style={styles.ratioNameLabel}>ACTIVE (421)</Text>
              <Text style={styles.ratioPercentLabel}>68%</Text>
            </View>
            <View style={styles.ratioRail}>
              <View style={[styles.ratioFill, { width: '68%', backgroundColor: '#658C00' }]} />
            </View>
          </View>

          <View style={styles.ratioItem}>
            <View style={styles.ratioLabelRow}>
              <Text style={styles.ratioNameLabel}>IDLE (112)</Text>
              <Text style={styles.ratioPercentLabel}>18%</Text>
            </View>
            <View style={styles.ratioRail}>
              <View style={[styles.ratioFill, { width: '18%', backgroundColor: Colors.primary }]} />
            </View>
          </View>

          <View style={styles.ratioItem}>
            <View style={styles.ratioLabelRow}>
              <Text style={styles.ratioNameLabel}>OFFLINE (87)</Text>
              <Text style={styles.ratioPercentLabel}>14%</Text>
            </View>
            <View style={styles.ratioRail}>
              <View style={[styles.ratioFill, { width: '14%', backgroundColor: '#9CA3AF' }]} />
            </View>
          </View>
        </View>

        {/* Top Zones Leaderboard leaderboard */}
        <View style={styles.topZonesCard}>
          <View style={styles.topZonesHeaderRow}>
            <Text style={styles.topZonesTitle}>Top Zones</Text>
            <TouchableOpacity onPress={() => Alert.alert('Zones', 'Displaying list of all 18 operational zones...')}>
              <Text style={styles.topZonesViewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Zone Item 1 */}
          <View style={styles.zoneLeaderboardRow}>
            <View style={styles.zoneRankBadge}>
              <Text style={styles.zoneRankText}>1</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.zoneNameTitle}>Downtown Cluster</Text>
              <Text style={styles.zoneOrdersSubText}>2,104 Orders this week</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.zoneGMVValue}>₹7.2L</Text>
              <Text style={styles.zoneTrendPercentage}>↑ 14%</Text>
            </View>
          </View>

          {/* Zone Item 2 */}
          <View style={styles.zoneLeaderboardRow}>
            <View style={[styles.zoneRankBadge, { backgroundColor: '#F3EEFF' }]}>
              <Text style={[styles.zoneRankText, { color: Colors.primary }]}>2</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.zoneNameTitle}>West District</Text>
              <Text style={styles.zoneOrdersSubText}>1,452 Orders this week</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.zoneGMVValue}>₹4.8L</Text>
              <Text style={styles.zoneTrendPercentage}>↑ 8%</Text>
            </View>
          </View>

          {/* Zone Item 3 */}
          <View style={styles.zoneLeaderboardRow}>
            <View style={[styles.zoneRankBadge, { backgroundColor: '#F3F4F6' }]}>
              <Text style={[styles.zoneRankText, { color: '#8A84A0' }]}>3</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.zoneNameTitle}>Airport Corridor</Text>
              <Text style={styles.zoneOrdersSubText}>988 Orders this week</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.zoneGMVValue}>₹3.1L</Text>
              <Text style={[styles.zoneTrendPercentage, { color: '#EF4444' }]}>↓ 2%</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Tab 4: Admin Settings Tab (Database Seeder)
  const renderSettingsTab = () => {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.placeholder}>
          <Ionicons name="server-outline" size={48} color={Colors.textMuted} />
          <Text style={styles.placeholderTitle}>Operational Settings</Text>
          <Text style={styles.placeholderDesc}>
            Seed or reset your Firestore tables to default values.
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

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={18} color={Colors.error} />
          <Text style={styles.signOutBtnText}>Log Out Console</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF9FF" />

      {/* Header (Adaptive title based on tabs) */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircleSmall}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80' }}
              style={{ width: '100%', height: '100%' }}
            />
          </View>
          <Text style={styles.headerTitle}>
            {activeTab === 'Home'
              ? 'Global Operations'
              : activeTab === 'Reports'
              ? 'Delivery Admin'
              : 'NearFind'}
          </Text>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <View style={styles.notifDot} />
          <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab selections */}
      {activeTab === 'Home'
        ? renderHomeTab()
        : activeTab === 'Search'
        ? renderSearchTab()
        : activeTab === 'Reports'
        ? renderReportsTab()
        : renderSettingsTab()}

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
            onPress={() => setActiveTab('Reports')}
          >
            <View style={activeTab === 'Reports' ? styles.tabActivePill : null}>
              <Ionicons
                name="stats-chart"
                size={20}
                color={activeTab === 'Reports' ? '#1A1135' : Colors.textMuted}
              />
            </View>
            <Text style={activeTab === 'Reports' ? styles.tabLabelActive : styles.tabLabel}>
              Reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setActiveTab('Settings')}
          >
            <View style={activeTab === 'Settings' ? styles.tabActivePill : null}>
              <Ionicons
                name="settings"
                size={20}
                color={activeTab === 'Settings' ? '#1A1135' : Colors.textMuted}
              />
            </View>
            <Text style={activeTab === 'Settings' ? styles.tabLabelActive : styles.tabLabel}>
              Settings
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
    paddingHorizontal: 32,
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
    fontSize: 20,
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

  // Stats Grid (Tab 1)
  statsGrid: {
    marginBottom: 16,
    gap: 10,
  },
  statsGridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statGridCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  statCardLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statCardBigValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1135',
    marginBottom: 4,
  },
  trendGreenText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
  },
  activeDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  greenActiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A3D900',
  },
  activeDotLabel: {
    fontSize: 11,
    color: '#8A84A0',
    fontWeight: '600',
  },
  trendMutedText: {
    fontSize: 11,
    color: '#8A84A0',
    fontWeight: '600',
  },

  // Map preview
  mapBannerContainer: {
    height: 180,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  liveNetworkBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  liveNetworkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  liveNetworkBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primary,
  },
  zoomButtonsColumn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    gap: 8,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C2BD9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // Fleet Status Card
  fleetStatusCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  fleetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  fleetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1135',
  },
  broadcastBtn: {
    backgroundColor: '#C8FF00',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  broadcastBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1135',
  },
  fleetStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fleetStatItem: {
    flex: 1,
    backgroundColor: '#FAF9FF',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  fleetIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fleetStatNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1135',
  },
  fleetStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#8A84A0',
  },

  // Demand graph card
  demandCard: {
    backgroundColor: '#6C2BD9',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
  },
  demandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 4,
  },
  demandSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
  },
  demandGraph: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  demandColumn: {
    alignItems: 'center',
    width: `${100 / 5}%`,
  },
  demandBarRail: {
    height: 80,
    width: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
    justifyContent: 'flex-end',
  },
  demandBarFill: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
  },
  demandLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontWeight: '600',
  },

  // Priority orders list table
  priorityOrdersCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0ECF9',
    marginBottom: 16,
  },
  priorityTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
  },
  priorityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityViewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECF9',
    paddingBottom: 8,
    marginBottom: 12,
  },
  tableColHeader: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
    letterSpacing: 0.5,
  },
  tableDataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF9FF',
  },
  tableCellId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1135',
  },
  tableCellName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8A84A0',
  },
  tableCellBadgeContainer: {
    alignItems: 'flex-end',
  },
  statusBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgePillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  badgeLive: {
    backgroundColor: '#EBFEDE',
  },
  badgeLiveText: {
    color: '#658C00',
  },
  badgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  badgeSuccessText: {
    color: '#10B981',
  },
  badgeDelayed: {
    backgroundColor: '#FEE2E2',
  },
  badgeDelayedText: {
    color: '#EF4444',
  },

  // ─── SEARCH TAB STYLES ─────────────────────────────────────────────────────

  searchBar: {
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
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1135',
    fontWeight: '500',
    padding: 0,
  },
  recentSearchesContainer: {
    marginBottom: 20,
    gap: 10,
    paddingHorizontal: 4,
  },
  recentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recentItemText: {
    fontSize: 13,
    color: '#8A84A0',
    fontWeight: '600',
  },
  filterPillsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  filterPill: {
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
  sectionHeadingText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 12,
  },
  freqRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  freqChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0ECF9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  freqChipText: {
    fontSize: 12,
    color: '#8A84A0',
    fontWeight: '700',
  },
  resultsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultsHeadingTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
  },
  resultsHeadingCount: {
    fontSize: 12,
    color: '#8A84A0',
    fontWeight: '600',
  },

  // Result cards
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  cardHeaderProfile: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultAvatarContainer: {
    position: 'relative',
  },
  resultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarStatusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A3D900',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  resultNameTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 4,
  },
  resultDetailsText: {
    fontSize: 12,
    color: '#8A84A0',
  },
  resultBadgeActive: {
    backgroundColor: '#C8FF00',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  resultBadgeActiveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A1135',
  },
  resultStoreIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F3EEFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultBadgePurple: {
    backgroundColor: '#F3EEFF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  resultBadgePurpleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  resultBadgeGrey: {
    backgroundColor: '#E8E5EA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  resultBadgeGreyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1135',
  },

  // Search card progress timeline
  progressTimelineContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0ECF9',
    marginTop: 14,
    paddingTop: 14,
  },
  progressRowLine: {
    height: 2,
    backgroundColor: '#E2E8F0',
    position: 'absolute',
    top: 22,
    left: 20,
    right: 20,
  },
  timelineSegmentActive: {
    width: '50%',
    height: '100%',
    backgroundColor: Colors.primary,
  },
  timelineSegmentInactive: {
    width: '50%',
    height: '100%',
  },
  timelineDotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  timelineDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  timelineDotInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  progressStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    textAlign: 'right',
    marginTop: 8,
    marginRight: 10,
  },

  // ─── REPORTS/ANALYTICS TAB STYLES ──────────────────────────────────────────

  analyticsHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  analyticsHeaderLeft: {
    flex: 1,
  },
  analyticsHeadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 4,
  },
  analyticsHeadingSubtitle: {
    fontSize: 12,
    color: '#8A84A0',
    fontWeight: '600',
  },
  downloadPdfBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadPdfBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
  },
  reportPeriodsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  periodPill: {
    backgroundColor: '#E8E5EA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  periodPillActive: {
    backgroundColor: '#C8FF00',
  },
  periodPillText: {
    fontSize: 12,
    color: '#8A84A0',
    fontWeight: '700',
  },
  periodPillTextActive: {
    color: '#1A1135',
  },

  // Analytics Stats Grid
  reportStatsGrid: {
    marginBottom: 20,
    gap: 10,
  },
  reportStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  reportStatsCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  reportStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportStatsLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
  },
  reportStatsTrendGreen: {
    fontSize: 11,
    fontWeight: '800',
    color: '#22C55E',
  },
  reportStatsTrendRed: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  reportStatsValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1135',
  },

  // Revenue Growth wave chart
  revenueCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  revenueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  revenueTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
  },
  revenueLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
  },
  revenueWaveContainer: {
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  revenueGraphTintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(108, 43, 217, 0.82)', // Deep purple tint overlay
  },
  graphPointsContainer: {
    position: 'absolute',
    top: '35%',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  graphTimelinePoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFF',
  },
  graphTimelinePointHighlight: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#C8FF00',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  timelineXAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 10,
  },
  xAxisLabelText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8A84A0',
  },

  // Efficiency section
  efficiencyCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  efficiencyCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 16,
  },
  efficiencyMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF9FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  metricRowLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A84A0',
    marginBottom: 4,
  },
  metricRowBigValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  progressCircleContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3,
    borderColor: '#658C00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircleCheckBg: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EBFEDE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optimalBadge: {
    backgroundColor: '#C8FF00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  optimalBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#1A1135',
  },

  // Fleet distribution progress bars
  fleetDistributionCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  distCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
    marginBottom: 18,
  },
  ratioItem: {
    marginBottom: 14,
  },
  ratioLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratioNameLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8A84A0',
  },
  ratioPercentLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1A1135',
  },
  ratioRail: {
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ratioFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Top Zones leaderboard
  topZonesCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0ECF9',
  },
  topZonesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1135',
  },
  topZonesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topZonesViewAllText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  zoneLeaderboardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF9FF',
  },
  zoneRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#C8FF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneRankText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1135',
  },
  zoneNameTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1135',
  },
  zoneOrdersSubText: {
    fontSize: 11,
    color: '#8A84A0',
    fontWeight: '500',
  },
  zoneGMVValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1a1135',
  },
  zoneTrendPercentage: {
    fontSize: 10,
    fontWeight: '800',
    color: '#658C00',
  },

  // Settings Tab
  placeholder: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 40,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  placeholderDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
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
    elevation: 3,
    width: '100%',
  },
  seedBtnDisabled: {
    backgroundColor: Colors.primaryLight,
  },
  seedBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.errorBg,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
    width: '100%',
    justifyContent: 'center',
  },
  signOutBtnText: {
    fontSize: 15,
    fontWeight: '800',
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
  absoluteFillImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
