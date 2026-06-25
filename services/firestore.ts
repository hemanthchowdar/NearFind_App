// ─── Firestore Service Layer ────────────────────────────────────────────────
// All Firestore reads/writes go through here — screens never import firestore directly.

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  runTransaction,
  Timestamp,
  arrayUnion,
  increment,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { OrderStatus, ACCEPT_TIMEOUT_MS, PICKUP_TIMEOUT_MS } from '../constants';
import type {
  Product,
  Retailer,
  RetailerStock,
  DeliveryPartner,
  Order,
  RetailerStockWithName,
  StatusHistoryEntry,
} from '../types';

// ─── Collection references ──────────────────────────────────────────────────

const productsCol = collection(db, 'products');
const retailersCol = collection(db, 'retailers');
const retailerStockCol = collection(db, 'retailerStock');
const deliveryPartnersCol = collection(db, 'deliveryPartners');
const ordersCol = collection(db, 'orders');

// ─── Products ───────────────────────────────────────────────────────────────

/** Search products by name (case-insensitive substring match, done client-side) */
export async function searchProducts(searchTerm: string): Promise<Product[]> {
  const snapshot = await getDocs(productsCol);
  const all: Product[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
  const term = searchTerm.toLowerCase().trim();
  if (!term) return all;
  return all.filter((p) => p.name.toLowerCase().includes(term));
}

/** Get all products */
export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
}

// ─── Retailers ──────────────────────────────────────────────────────────────

export async function getAllRetailers(): Promise<Retailer[]> {
  const snapshot = await getDocs(retailersCol);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Retailer));
}

// ─── Delivery Partners ─────────────────────────────────────────────────────

export async function getAllDeliveryPartners(): Promise<DeliveryPartner[]> {
  const snapshot = await getDocs(deliveryPartnersCol);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DeliveryPartner));
}

// ─── Retailer Stock ─────────────────────────────────────────────────────────

/** Get all retailers carrying a specific product, enriched with retailer name */
export async function getStockForProduct(productId: string): Promise<RetailerStockWithName[]> {
  const q = query(retailerStockCol, where('productId', '==', productId));
  const snapshot = await getDocs(q);
  const stocks: RetailerStock[] = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() } as RetailerStock)
  );

  // Fetch retailer names
  const retailers = await getAllRetailers();
  const retailerMap = new Map(retailers.map((r) => [r.id, r.name]));

  return stocks.map((s) => ({
    ...s,
    retailerName: retailerMap.get(s.retailerId) ?? 'Unknown Store',
  }));
}

// ─── Orders ─────────────────────────────────────────────────────────────────

/**
 * Place a new order. Uses a transaction to atomically decrement stock.
 * Returns the new order ID.
 */
export async function createOrder(params: {
  productId: string;
  productName: string;
  retailerId: string;
  retailerName: string;
  qty: number;
  price: number;
  customerName: string;
}): Promise<string> {
  const { productId, retailerId, qty } = params;
  const now = Timestamp.now();

  // Find the retailerStock doc for this product + retailer
  const stockQuery = query(
    retailerStockCol,
    where('productId', '==', productId),
    where('retailerId', '==', retailerId)
  );
  const stockSnap = await getDocs(stockQuery);
  if (stockSnap.empty) throw new Error('Stock entry not found');
  const stockDoc = stockSnap.docs[0];

  // Transaction: check stock ≥ qty, decrement, then create order
  const orderId = await runTransaction(db, async (txn) => {
    const stockData = (await txn.get(stockDoc.ref)).data() as RetailerStock;
    if (stockData.stock < qty) {
      throw new Error('Not enough stock available');
    }

    // Decrement stock
    txn.update(stockDoc.ref, { stock: increment(-qty) });

    // Create order (we can't use addDoc inside a transaction, so use doc() for a new ref)
    const orderRef = doc(ordersCol);
    const acceptDeadline = Timestamp.fromMillis(now.toMillis() + ACCEPT_TIMEOUT_MS);

    const orderData: Omit<Order, 'id'> = {
      productId: params.productId,
      productName: params.productName,
      retailerId: params.retailerId,
      retailerName: params.retailerName,
      qty: params.qty,
      price: params.price,
      customerName: params.customerName,
      status: OrderStatus.Placed,
      statusHistory: [{ status: OrderStatus.Placed, timestamp: now }],
      deliveryPartnerId: null,
      createdAt: now,
      acceptDeadline,
      pickupDeadline: null,
    };

    txn.set(orderRef, orderData);
    return orderRef.id;
  });

  return orderId;
}

/**
 * Subscribe to a single order's changes. Returns an unsubscribe function.
 */
export function subscribeToOrder(
  orderId: string,
  callback: (order: Order | null) => void
): () => void {
  const orderRef = doc(ordersCol, orderId);
  return onSnapshot(orderRef, (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    callback({ id: snap.id, ...snap.data() } as Order);
  });
}

/**
 * Subscribe to orders for a specific retailer. Returns an unsubscribe function.
 */
export function subscribeToRetailerOrders(
  retailerId: string,
  callback: (orders: Order[]) => void
): () => void {
  const q = query(ordersCol, where('retailerId', '==', retailerId));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    callback(orders);
  });
}

/**
 * Subscribe to orders for a specific customer. Returns an unsubscribe function.
 */
export function subscribeToCustomerOrders(
  customerName: string,
  callback: (orders: Order[]) => void
): () => void {
  const q = query(ordersCol, where('customerName', '==', customerName));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    // Sort most recent first
    orders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt as any).getTime();
      const bTime = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt as any).getTime();
      return bTime - aTime;
    });
    callback(orders);
  });
}

/**
 * Subscribe to orders ready for pickup (no delivery partner assigned).
 */
export function subscribeToAvailableDeliveries(
  callback: (orders: Order[]) => void
): () => void {
  const q = query(
    ordersCol,
    where('status', '==', OrderStatus.ReadyForPickup),
    where('deliveryPartnerId', '==', null)
  );
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    callback(orders);
  });
}

/**
 * Subscribe to a delivery partner's active orders.
 */
export function subscribeToMyDeliveries(
  partnerId: string,
  callback: (orders: Order[]) => void
): () => void {
  const q = query(ordersCol, where('deliveryPartnerId', '==', partnerId));
  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    callback(orders);
  });
}

/**
 * Subscribe to all orders (for Admin screen).
 */
export function subscribeToAllOrders(
  callback: (orders: Order[]) => void
): () => void {
  return onSnapshot(ordersCol, (snap) => {
    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    // Sort most recent first
    orders.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    callback(orders);
  });
}

// ─── Order Status Updates ───────────────────────────────────────────────────

/** Generic helper to transition an order to a new status */
async function transitionOrder(
  orderId: string,
  newStatus: OrderStatus,
  extraFields?: Record<string, unknown>
): Promise<void> {
  const orderRef = doc(ordersCol, orderId);
  const now = Timestamp.now();
  await updateDoc(orderRef, {
    status: newStatus,
    statusHistory: arrayUnion({ status: newStatus, timestamp: now }),
    ...extraFields,
  });
}

/** Retailer accepts an incoming order */
export async function acceptOrder(orderId: string): Promise<void> {
  await transitionOrder(orderId, OrderStatus.Accepted);
}

/** Retailer rejects an order — also restocks the product */
export async function rejectOrder(orderId: string): Promise<void> {
  // Get the order to find product + retailer + qty
  const orderRef = doc(ordersCol, orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error('Order not found');
  const order = orderSnap.data() as Order;

  // Restock
  const stockQuery = query(
    retailerStockCol,
    where('productId', '==', order.productId),
    where('retailerId', '==', order.retailerId)
  );
  const stockSnap = await getDocs(stockQuery);
  if (!stockSnap.empty) {
    await updateDoc(stockSnap.docs[0].ref, { stock: increment(order.qty) });
  }

  await transitionOrder(orderId, OrderStatus.Rejected);
}

/** Retailer marks order as packed */
export async function markPacked(orderId: string): Promise<void> {
  await transitionOrder(orderId, OrderStatus.Packed);
}

/** Retailer marks order as ready for pickup — sets the pickup deadline */
export async function markReadyForPickup(orderId: string): Promise<void> {
  const now = Timestamp.now();
  const pickupDeadline = Timestamp.fromMillis(now.toMillis() + PICKUP_TIMEOUT_MS);
  await transitionOrder(orderId, OrderStatus.ReadyForPickup, { pickupDeadline });
}

/**
 * Delivery partner claims an order. Uses a transaction to prevent race conditions.
 */
export async function claimDelivery(orderId: string, partnerId: string): Promise<void> {
  const orderRef = doc(ordersCol, orderId);
  await runTransaction(db, async (txn) => {
    const orderSnap = await txn.get(orderRef);
    if (!orderSnap.exists()) throw new Error('Order not found');
    const data = orderSnap.data() as Order;
    if (data.deliveryPartnerId !== null) {
      throw new Error('Order already claimed by another partner');
    }
    const now = Timestamp.now();
    txn.update(orderRef, {
      deliveryPartnerId: partnerId,
      statusHistory: arrayUnion({ status: OrderStatus.ReadyForPickup, timestamp: now }),
    });
  });
}

/** Delivery partner marks order as picked up */
export async function markPickedUp(orderId: string): Promise<void> {
  await transitionOrder(orderId, OrderStatus.PickedUp);
}

/** Delivery partner marks order as delivered */
export async function markDelivered(orderId: string): Promise<void> {
  await transitionOrder(orderId, OrderStatus.Delivered);
}

// ─── Seed Database ──────────────────────────────────────────────────────────

import {
  SEED_RETAILERS,
  SEED_PRODUCTS,
  SEED_DELIVERY_PARTNERS,
} from '../constants';

/** Clears existing seed data and re-populates Firestore with fresh demo data */
export async function seedDatabase(): Promise<void> {
  const batch = writeBatch(db);

  // Clear existing collections
  const collections = [productsCol, retailersCol, retailerStockCol, deliveryPartnersCol, ordersCol];
  for (const col of collections) {
    const snap = await getDocs(col);
    snap.docs.forEach((d) => batch.delete(d.ref));
  }
  await batch.commit();

  // Seed products
  const productIds: string[] = [];
  for (const p of SEED_PRODUCTS) {
    const ref = await addDoc(productsCol, { name: p.name });
    productIds.push(ref.id);
  }

  // Seed retailers
  const retailerIds: string[] = [];
  for (const r of SEED_RETAILERS) {
    const ref = await addDoc(retailersCol, { name: r.name });
    retailerIds.push(ref.id);
  }

  // Seed delivery partners
  for (const dp of SEED_DELIVERY_PARTNERS) {
    await addDoc(deliveryPartnersCol, { name: dp.name });
  }

  // Seed retailerStock — each product carried by 2–3 retailers at different prices
  const stockEntries: Array<Omit<RetailerStock, 'id'>> = [
    // Maggi Noodles: Sharma (₹14, stock 2), Quick Mart (₹15, stock 0 — out of stock demo)
    { retailerId: retailerIds[0], productId: productIds[0], price: 14, stock: 2 },
    { retailerId: retailerIds[1], productId: productIds[0], price: 15, stock: 0 },
    { retailerId: retailerIds[2], productId: productIds[0], price: 13, stock: 5 },

    // Amul Milk 500ml
    { retailerId: retailerIds[0], productId: productIds[1], price: 28, stock: 10 },
    { retailerId: retailerIds[1], productId: productIds[1], price: 30, stock: 8 },

    // Britannia Bread
    { retailerId: retailerIds[0], productId: productIds[2], price: 45, stock: 3 },
    { retailerId: retailerIds[2], productId: productIds[2], price: 42, stock: 6 },

    // Tata Salt 1kg
    { retailerId: retailerIds[1], productId: productIds[3], price: 25, stock: 15 },
    { retailerId: retailerIds[2], productId: productIds[3], price: 24, stock: 12 },

    // Parle-G Biscuits
    { retailerId: retailerIds[0], productId: productIds[4], price: 10, stock: 20 },
    { retailerId: retailerIds[1], productId: productIds[4], price: 10, stock: 18 },
    { retailerId: retailerIds[2], productId: productIds[4], price: 10, stock: 25 },

    // Colgate Toothpaste
    { retailerId: retailerIds[0], productId: productIds[5], price: 55, stock: 7 },
    { retailerId: retailerIds[1], productId: productIds[5], price: 58, stock: 4 },

    // Surf Excel 1kg
    { retailerId: retailerIds[1], productId: productIds[6], price: 120, stock: 3 },
    { retailerId: retailerIds[2], productId: productIds[6], price: 115, stock: 5 },

    // Aashirvaad Atta 5kg
    { retailerId: retailerIds[0], productId: productIds[7], price: 280, stock: 4 },
    { retailerId: retailerIds[2], productId: productIds[7], price: 275, stock: 6 },
  ];

  const batch2 = writeBatch(db);
  for (const entry of stockEntries) {
    const ref = doc(retailerStockCol);
    batch2.set(ref, entry);
  }
  await batch2.commit();
}
