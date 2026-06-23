import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import type { RootStackParamList } from '../types';

// Screens
import LandingScreen from '../screens/LandingScreen';
import CustomerHomeScreen from '../screens/customer/CustomerHomeScreen';
import SearchScreen from '../screens/customer/SearchScreen';
import ResultsScreen from '../screens/customer/ResultsScreen';
import ConfirmOrderScreen from '../screens/customer/ConfirmOrderScreen';
import OrderStatusScreen from '../screens/customer/OrderStatusScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import IncomingOrdersScreen from '../screens/retailer/IncomingOrdersScreen';
import AvailableOrdersScreen from '../screens/delivery/AvailableOrdersScreen';
import AdminScreen from '../screens/admin/AdminScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// ─── Customer Bottom Tabs ───────────────────────────────────────────────────

function CustomerTabNavigator({ route }: any) {
  const { customerName } = route.params;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: Colors.borderLight,
          paddingTop: 6,
          paddingBottom: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      >
        {(props) => <CustomerHomeScreen {...props} route={{ ...props.route, params: { customerName } } as any} />}
      </Tab.Screen>

      <Tab.Screen
        name="Orders"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      >
        {() => (
          <ProfileScreen customerName={customerName} navigation={null} />
        )}
      </Tab.Screen>

      <Tab.Screen
        name="Search"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={22} color={Colors.white} />
          ),
          tabBarIconStyle: {
            backgroundColor: Colors.accent,
            width: 48,
            height: 48,
            borderRadius: 24,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          },
          tabBarLabel: 'Search',
        }}
      >
        {(props) => <SearchScreen {...props} route={{ ...props.route, params: { customerName } } as any} />}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      >
        {(props) => <ProfileScreen customerName={customerName} navigation={props.navigation} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ─── Root Stack Navigator ───────────────────────────────────────────────────

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Landing" component={LandingScreen} />
      <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
      <Stack.Screen name="CustomerSearch" component={SearchScreen} />
      <Stack.Screen name="CustomerResults" component={ResultsScreen} />
      <Stack.Screen name="ConfirmOrder" component={ConfirmOrderScreen} />
      <Stack.Screen name="OrderStatus" component={OrderStatusScreen} />
      <Stack.Screen name="RetailerDashboard" component={IncomingOrdersScreen} />
      <Stack.Screen name="DeliveryDashboard" component={AvailableOrdersScreen} />
      <Stack.Screen name="AdminDashboard" component={AdminScreen} />
    </Stack.Navigator>
  );
}
