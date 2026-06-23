import { Timestamp } from 'firebase/firestore';
import { OrderStatus } from '../constants';

// ─── Firestore Document Types ───────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
}

export interface Retailer {
  id: string;
  name: string;
}

export interface RetailerStock {
  id: string;
  retailerId: string;
  productId: string;
  price: number;
  stock: number;
}

export interface DeliveryPartner {
  id: string;
  name: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Timestamp;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  retailerId: string;
  retailerName: string;
  qty: number;
  price: number;
  customerName: string;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  deliveryPartnerId: string | null;
  createdAt: Timestamp;
  acceptDeadline: Timestamp;
  pickupDeadline: Timestamp | null;
}

// ─── Navigation Param Types ─────────────────────────────────────────────────

export type RootStackParamList = {
  Landing: undefined;
  CustomerTabs: { customerName: string };
  CustomerSearch: { customerName: string };
  CustomerResults: { customerName: string; productId: string; productName: string };
  ConfirmOrder: {
    customerName: string;
    productId: string;
    productName: string;
    retailerId: string;
    retailerName: string;
    price: number;
    stock: number;
  };
  OrderStatus: { customerName: string; orderId: string };
  RetailerDashboard: { retailerId: string; retailerName: string };
  DeliveryDashboard: { partnerId: string; partnerName: string };
  AdminDashboard: undefined;
};

// ─── Enriched view types (not stored in Firestore, computed client-side) ────

/** A RetailerStock entry enriched with the retailer's display name */
export interface RetailerStockWithName extends RetailerStock {
  retailerName: string;
}
