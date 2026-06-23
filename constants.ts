// ─── NearFind Constants ─────────────────────────────────────────────────────
// All configurable values live here so they're easy to tweak for demos.

/** How long a retailer has to accept/reject an order before it auto-cancels (ms) */
export const ACCEPT_TIMEOUT_MS = 60_000; // 60 seconds

/** How long a delivery partner has to claim a "ReadyForPickup" order before it fails (ms) */
export const PICKUP_TIMEOUT_MS = 90_000; // 90 seconds

/** How often the client-side timeout checker polls Firestore (ms) */
export const TIMEOUT_CHECK_INTERVAL_MS = 5_000; // every 5 seconds

/**
 * All possible order statuses.
 * The flow is:
 *   Placed → Accepted → Packed → ReadyForPickup → PickedUp → Delivered
 * Terminal / error states:
 *   AutoCancelled, Rejected, NoPartnerFound
 */
export enum OrderStatus {
  Placed = 'Placed',
  Accepted = 'Accepted',
  Packed = 'Packed',
  ReadyForPickup = 'ReadyForPickup',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
  AutoCancelled = 'AutoCancelled',
  Rejected = 'Rejected',
  NoPartnerFound = 'NoPartnerFound',
}

/** Statuses that mean the order is still in-flight (not terminal) */
export const ACTIVE_STATUSES: OrderStatus[] = [
  OrderStatus.Placed,
  OrderStatus.Accepted,
  OrderStatus.Packed,
  OrderStatus.ReadyForPickup,
  OrderStatus.PickedUp,
];

/** Statuses that are terminal (order is done, one way or another) */
export const TERMINAL_STATUSES: OrderStatus[] = [
  OrderStatus.Delivered,
  OrderStatus.AutoCancelled,
  OrderStatus.Rejected,
  OrderStatus.NoPartnerFound,
];

// ─── Brand Colors (matching Figma) ──────────────────────────────────────────

export const Colors = {
  // Primary palette
  primary: '#6C2BD9',       // Deep purple — main brand color
  primaryLight: '#8B5CF6',  // Lighter purple for hover/active states
  primaryDark: '#5320A5',   // Darker variant

  // Accent / highlight
  accent: '#C8FF00',        // Lime/neon green — CTA highlights, search button
  accentDark: '#A3D900',

  // Neutrals
  white: '#FFFFFF',
  background: '#F8F6FF',    // Very faint purple tint
  surface: '#FFFFFF',
  border: '#E8E4F0',
  borderLight: '#F0ECF9',

  // Text
  textPrimary: '#1A1135',   // Near-black with warm purple tint
  textSecondary: '#6B6580',
  textMuted: '#9E97B0',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#1A1135',

  // Status colors
  success: '#22C55E',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  info: '#6C2BD9',
  infoBg: '#F3EEFF',

  // Role card backgrounds (subtle tints)
  customerCardBg: '#F3EEFF',
  retailerCardBg: '#FFF7ED',
  deliveryCardBg: '#ECFDF5',
  adminCardBg: '#F0F4FF',

  // Out of stock
  outOfStock: '#9CA3AF',
  outOfStockBg: '#F3F4F6',
};

// ─── Seed Data Constants ────────────────────────────────────────────────────

export const SEED_RETAILERS = [
  { name: 'Sharma Kirana Store' },
  { name: 'Quick Mart' },
  { name: 'Daily Needs Mart' },
];

export const SEED_PRODUCTS = [
  { name: 'Maggi Noodles' },
  { name: 'Amul Milk 500ml' },
  { name: 'Britannia Bread' },
  { name: 'Tata Salt 1kg' },
  { name: 'Parle-G Biscuits' },
  { name: 'Colgate Toothpaste' },
  { name: 'Surf Excel 1kg' },
  { name: 'Aashirvaad Atta 5kg' },
];

export const SEED_DELIVERY_PARTNERS = [
  { name: 'Ravi' },
  { name: 'Anjali' },
];
