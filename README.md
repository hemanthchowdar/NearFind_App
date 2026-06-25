# 🟣 NearFind — Hyperlocal Delivery App

> **Find anything nearby. Get it delivered fast.**

NearFind is a real-time, hyperlocal delivery platform built with **React Native (Expo)** and **Firebase Firestore**. It connects **Customers**, **Retailers**, and **Delivery Partners** in one seamless order lifecycle — from searching for a product to doorstep delivery.

---

## 📑 Table of Contents

1. [About the Project](#about-the-project)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Getting Started — Local Setup](#getting-started--local-setup)
6. [Running the App](#running-the-app)
7. [Building the APK (Android)](#building-the-apk-android)
8. [Firebase Setup](#firebase-setup)
9. [Understanding the App — Complete Walkthrough](#understanding-the-app--complete-walkthrough)
   - [Landing Screen (Role Selection)](#1-landing-screen-role-selection)
   - [Admin — Seed the Database](#2-admin--seed-the-database)
   - [Customer — Search & Place an Order](#3-customer--search--place-an-order)
   - [Retailer — Accept & Pack the Order](#4-retailer--accept--pack-the-order)
   - [Delivery Partner — Pick Up & Deliver](#5-delivery-partner--pick-up--deliver)
   - [Customer — Track & Receive Delivery](#6-customer--track--receive-delivery)
10. [Order Lifecycle — Complete Flow Diagram](#order-lifecycle--complete-flow-diagram)
11. [Order Statuses Reference](#order-statuses-reference)
12. [Timeout & Auto-Cancellation Rules](#timeout--auto-cancellation-rules)
13. [Firestore Data Model](#firestore-data-model)
14. [Troubleshooting](#troubleshooting)
15. [License](#license)

---

## About the Project

NearFind simulates a complete end-to-end hyperlocal delivery ecosystem. Think of it like a simplified Swiggy Instamart / Zepto / Dunzo, where:

- A **Customer** searches for everyday products (Maggi, Milk, Bread, etc.) from nearby kirana stores.
- A **Retailer** receives the order in real-time, accepts it, packs it, and marks it ready for pickup.
- A **Delivery Partner** sees the ready order, picks it up from the store, and delivers it to the customer.
- An **Admin** can seed/reset the demo database and view operational dashboards.

All of this happens in real-time using Firebase Firestore's `onSnapshot` listeners — every screen updates live without manual refresh.

---

## Tech Stack

| Layer           | Technology                                                  |
|-----------------|-------------------------------------------------------------|
| Framework       | React Native 0.81.5 with Expo SDK 54                        |
| Language        | TypeScript 5.9                                              |
| Navigation      | React Navigation 7 (Native Stack + Bottom Tabs)             |
| Backend / DB    | Firebase Firestore (real-time NoSQL database)               |
| Icons           | @expo/vector-icons (Ionicons, MaterialCommunityIcons, Feather) |
| State Mgmt      | React `useState` + Firestore `onSnapshot` (real-time sync)  |
| Build Tool      | Expo EAS Build (cloud-based APK generation)                 |
| Package Manager | npm                                                         |

---

## Project Structure

```
NearFind_App/
├── App.tsx                          # App entry point
├── index.ts                         # Expo entry point (registers App)
├── app.json                         # Expo project configuration
├── eas.json                         # EAS Build profiles (APK config)
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript compiler options
├── firebaseConfig.ts                # Firebase project credentials & init
├── constants.ts                     # Order statuses, timeouts, colors, seed data
│
├── navigation/
│   └── RootNavigator.tsx            # All screen routes + Customer tab navigator
│
├── screens/
│   ├── LandingScreen.tsx            # Role selection screen (entry point)
│   │
│   ├── customer/
│   │   ├── CustomerHomeScreen.tsx   # Customer home with categories & quick actions
│   │   ├── SearchScreen.tsx         # Product search interface
│   │   ├── ResultsScreen.tsx        # Retailer list for a selected product
│   │   ├── ConfirmOrderScreen.tsx   # Order confirmation & checkout
│   │   ├── OrderStatusScreen.tsx    # Real-time order tracking timeline
│   │   ├── CustomerOrdersScreen.tsx # Order history (all past orders)
│   │   └── ProfileScreen.tsx        # Customer profile
│   │
│   ├── retailer/
│   │   └── IncomingOrdersScreen.tsx # Retailer dashboard (accept/pack/ready orders + inventory + history)
│   │
│   ├── delivery/
│   │   └── AvailableOrdersScreen.tsx # Delivery partner dashboard (claim/pickup/deliver orders)
│   │
│   └── admin/
│       └── AdminScreen.tsx          # Admin console (seed DB, search, reports, settings)
│
├── services/
│   ├── firestore.ts                 # All Firestore CRUD operations & real-time subscriptions
│   └── timeoutChecker.ts            # Background poller for order auto-cancellation
│
├── types/
│   └── index.ts                     # TypeScript interfaces & navigation param types
│
└── assets/
    ├── icon.png                     # App icon (1024×1024)
    ├── splash-icon.png              # Splash screen icon
    ├── android-icon-foreground.png  # Android adaptive icon foreground
    ├── android-icon-background.png  # Android adaptive icon background
    └── ...                          # Product images (PNG)
```

---

## Prerequisites

Before setting up the project, make sure you have the following installed on your machine:

| Tool        | Required Version | How to Check           | How to Install                                                       |
|-------------|------------------|------------------------|----------------------------------------------------------------------|
| **Node.js** | v20 or higher    | `node -v`              | [nodejs.org](https://nodejs.org/) — Download LTS (v22 recommended)   |
| **npm**     | v9 or higher     | `npm -v`               | Comes bundled with Node.js                                           |
| **Git**     | Any recent       | `git --version`        | [git-scm.com](https://git-scm.com/downloads)                        |
| **Expo Go** | Latest           | App Store / Play Store | Install "Expo Go" on your phone                                     |

> **Important:** This project uses **Expo SDK 54** which requires **Node.js v20+**. If you have an older version, the Metro bundler will crash with `configs.toReversed is not a function`. Upgrade Node before proceeding.

---

## Getting Started — Local Setup

Follow these steps **exactly** to set up the project on your local machine:

### Step 1: Clone the Repository

```bash
git clone https://github.com/hemanthchowdar/NearFind_App.git
```

### Step 2: Navigate into the Project Directory

```bash
cd NearFind_App
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages (React Native, Expo, Firebase, React Navigation, etc.). Wait for it to complete — it may take 1–2 minutes.

### Step 4: Verify Node Version

```bash
node -v
```

The output **must** be `v20.x.x` or `v22.x.x`. If you see `v18.x.x` or lower, you need to upgrade Node.js before continuing.

### Step 5: Verify Installation

```bash
npx expo --version
```

This should print the Expo CLI version (e.g., `0.25.x`). If you get errors, try deleting `node_modules` and running `npm install` again.

---

## Running the App

There are multiple ways to run the app depending on your situation:

### Option A: Run on Your Phone (Same Wi-Fi — Recommended for Beginners)

This is the simplest way to test the app. Your computer and phone must be on the **same Wi-Fi network**.

1. **Start the development server:**

   ```bash
   npx expo start --lan
   ```

2. **Open the Expo Go app** on your phone (download from App Store / Play Store if you haven't).

3. **Scan the QR code** shown in your terminal:
   - **Android:** Open Expo Go → tap "Scan QR code" → point your camera at the terminal QR code.
   - **iOS:** Open your default Camera app → point at the QR code → tap the Expo banner that appears.

4. **Wait for the bundle to load.** The app will compile and appear on your phone in ~15–30 seconds.

### Option B: Run on Your Phone (Different Wi-Fi / Remote Access)

If you want to share the app with someone on a different network (e.g., a friend in another city):

1. **Start with tunnel mode:**

   ```bash
   npx expo start --tunnel
   ```

   > If prompted to install `@expo/ngrok`, type `y`.

2. **Send the QR code or the URL** (shown in terminal) to the other person.

3. They open **Expo Go** on their phone and scan the QR code. The app loads over the internet.

   > **Note:** Your computer must stay on and the terminal must remain running for this to work.

### Option C: Run on an Android Emulator

1. Install [Android Studio](https://developer.android.com/studio) and set up an Android Virtual Device (AVD).
2. Start the emulator from Android Studio.
3. Run:

   ```bash
   npx expo start --android
   ```

   The app will automatically install and launch on the emulator.

### Option D: Install the Standalone APK (No Computer Needed)

If you have already built the APK (see section below), simply:

1. Transfer the `.apk` file to your Android phone.
2. Tap on the file → Allow installation from unknown sources → Install.
3. Open the "NearFind" app from your home screen. No computer or Expo Go needed.

---

## Building the APK (Android)

To generate a standalone, installable `.apk` file that works without Expo Go:

### Step 1: Login to Expo

```bash
npx eas-cli login
```

Enter your Expo account credentials (create a free account at [expo.dev](https://expo.dev) if you don't have one).

### Step 2: Build the APK

```bash
npx eas-cli build --platform android --profile preview
```

This uploads your project to Expo's cloud servers, compiles it, and generates a downloadable `.apk` file. The build takes approximately 5–10 minutes.

### Step 3: Download and Install

Once the build completes, you will receive a URL. Open it on your Android phone to download and install the APK directly.

> **Tip:** The `preview` profile in `eas.json` is configured to output an `.apk` file (not `.aab`). This makes it directly installable on any Android device without going through the Play Store.

---

## Firebase Setup

The app uses Firebase Firestore as its real-time database. The project is already configured with a Firebase project, but if you need to use your own:

### Using Your Own Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (or use an existing one).
3. Enable **Cloud Firestore** (in test mode for development).
4. Go to **Project Settings** → **General** → scroll to "Your apps" → click the **Web** icon (`</>`) to add a web app.
5. Copy the `firebaseConfig` object.
6. Open `firebaseConfig.ts` in the project and replace the existing config:

   ```typescript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

7. Save the file and restart the app.

---

## Understanding the App — Complete Walkthrough

This section explains **exactly** how the app works from start to finish. Follow this walkthrough step by step to understand the complete order lifecycle.

> **Important:** Before testing the app for the first time, you **must** seed the database using the Admin role (Step 2 below). Without seeding, there will be no products, retailers, or delivery partners in the system.

---

### 1. Landing Screen (Role Selection)

When you open the app, you see the **Landing Screen** with the NearFind branding and four role cards:

| Role                | Description                                           |
|---------------------|-------------------------------------------------------|
| 🧑 **Customer**     | Search for products, compare prices, and place orders  |
| 🏪 **Retailer**     | Receive orders, accept/reject, pack, and hand off      |
| 🚚 **Delivery Partner** | Pick up packed orders and deliver to customers     |
| 🛡️ **Admin**        | Seed the database, view reports, manage operations     |

**Tap on any role card** to enter that role's dashboard.

---

### 2. Admin — Seed the Database

> **⚠️ Do this first!** Before placing any orders, you must populate the database with demo data.

1. On the Landing Screen, tap **"Admin"** → **"Operator Console"**.
2. You will enter the **Admin Dashboard** with four tabs at the bottom: Home, Search, Reports, Settings.
3. On the **Home** tab, find the **"Seed Demo Data"** button (orange button with a database icon).
4. Tap it → A confirmation alert appears → Tap **"Seed Now"**.
5. Wait a few seconds. You will see a success alert: **"Database seeded with demo data!"**

This creates the following demo data in Firestore:

| Data Type         | Entries Created                                                              |
|-------------------|------------------------------------------------------------------------------|
| **Products** (8)  | Maggi Noodles, Amul Milk 500ml, Britannia Bread, Tata Salt 1kg, Parle-G Biscuits, Colgate Toothpaste, Surf Excel 1kg, Aashirvaad Atta 5kg |
| **Retailers** (3) | Sharma Kirana Store, Quick Mart, Daily Needs Mart                            |
| **Delivery Partners** (2) | Ravi, Anjali                                                        |
| **Stock** (18)    | Various products assigned to retailers with prices and quantities             |

6. Tap the **back arrow** (top left) to return to the Landing Screen.

---

### 3. Customer — Search & Place an Order

Now let's place an order as a Customer.

#### Step 3a: Enter as Customer

1. On the Landing Screen, tap the **"Customer"** card → **"Get Started"**.
2. A modal appears asking **"What should we call you?"**
3. Type your name (e.g., `Yaswanth`) and tap **"Continue"**.
4. You are now on the **Customer Home Screen** with four bottom tabs: **Home**, **Orders**, **Search**, **Profile**.

#### Step 3b: Search for a Product

1. Tap the **"Search"** tab (green circular button in the bottom navigation bar).
2. You see the **Search Screen** with a search box at the top.
3. Type a product name, e.g., `Maggi`.
4. The search results appear below showing matching products with images.
5. Tap on the product you want (e.g., **"Maggi Noodles"**).

#### Step 3c: Choose a Retailer

1. You are taken to the **Results Screen** showing a hero banner with the product image.
2. Below the banner, you see a list of **nearby retailers** that carry this product.
3. Each retailer card shows:
   - Store name (e.g., "Sharma Kirana Store")
   - Price (e.g., ₹14)
   - Available stock (e.g., "2 in stock")
   - Distance (demo data)
4. Tap **"Order Now"** on the retailer you want to order from.

   > **Note:** If a retailer shows "Out of Stock" (0 stock), the "Order Now" button will be disabled/greyed out.

#### Step 3d: Confirm the Order

1. You are taken to the **Confirm Order Screen**.
2. Review the order details:
   - Product name and image
   - Retailer name
   - Price per unit
   - Quantity (use + and − buttons to adjust)
   - Total amount
3. Tap the **"Place Order"** button.
4. A confirmation alert appears. Tap **"Confirm"**.
5. The order is placed! You are taken to the **Order Status Screen**.

#### Step 3e: Order Status — Waiting for Retailer

1. On the **Order Status Screen**, you see a real-time timeline of your order.
2. The current status is **"Placed"** — waiting for the retailer to accept.
3. A countdown timer shows how long the retailer has to respond (60 seconds).
4. **Do NOT close this screen yet.** We will come back to it later.

> **What happens next?** The retailer now needs to accept this order. Let's switch roles.

---

### 4. Retailer — Accept & Pack the Order

Now we need to act as the Retailer to process the order.

#### Step 4a: Go Back to Landing Screen

1. Tap the **back arrow** on the Order Status Screen to go back.
2. Keep tapping back until you reach the **Landing Screen**.

   > Alternatively, if you're on the Customer Home screen, tap the **Profile** tab → tap **"Sign Out"** to return to Landing.

#### Step 4b: Enter as Retailer

1. On the Landing Screen, tap the **"Retailer"** card → **"Merchant Portal"**.
2. A modal appears showing the list of stores: **Sharma Kirana Store**, **Quick Mart**, **Daily Needs Mart**.
3. Tap the **store name that matches the retailer the customer ordered from** (e.g., "Sharma Kirana Store").

   > ⚠️ **Important:** You must select the **same store** the customer chose. If you select a different store, you won't see the order.

#### Step 4c: View Incoming Orders

1. You are now on the **Retailer Dashboard** with three tabs: **Orders**, **Inventory**, **Profile**.
2. On the **Orders** tab, you see:
   - **Stats header** at the top: three equal-width cards showing counts for **ACCEPTED**, **PACKED**, and **READY** orders.
   - **Active Orders** section below: You should see the order just placed by the customer with status **"WAITING FOR ACCEPTANCE"**.

#### Step 4d: Accept the Order

1. Find the order card in the Active Orders list.
2. You will see two buttons: **"Accept"** (green) and **"Reject"** (red).
3. Tap **"Accept"**.
4. The order status changes to **"ACCEPTED"**. The card now shows a **"Mark as Packed"** button.
5. The **ACCEPTED** count in the stats header increases by 1.

#### Step 4e: Pack the Order

1. On the same order card, tap **"Mark as Packed"**.
2. The order status changes to **"PACKED"**. The card now shows a **"Ready for Delivery"** button.
3. The **PACKED** count in the stats header increases by 1.

#### Step 4f: Mark Ready for Delivery

1. On the same order card, tap **"Ready for Delivery"**.
2. The order status changes to **"READY FOR PICKUP"**. The card shows **"READY FOR DELIVERY AGENT TO PICKUP"**.
3. The **READY** count in the stats header increases by 1.
4. The order remains visible in the Active Orders section with a blue "READY FOR PICKUP" badge.

> **What happens next?** A Delivery Partner now needs to pick up this order. The order also appears in the **Order History** section at the bottom once it reaches a terminal state.

---

### 5. Delivery Partner — Pick Up & Deliver

Now we switch to the Delivery Partner role.

#### Step 5a: Go Back to Landing Screen

1. Tap the **back arrow** on the Retailer Dashboard to return to the Landing Screen.

#### Step 5b: Enter as Delivery Partner

1. On the Landing Screen, tap the **"Delivery Partner"** card → **"Join the Fleet"**.
2. A modal appears showing the delivery partners: **Ravi**, **Anjali**.
3. Tap any partner (e.g., **"Ravi"**).

#### Step 5c: View Available Orders

1. You are now on the **Delivery Dashboard**.
2. You see the **Available Orders** section listing orders that are **Ready for Pickup** and not yet claimed.
3. The order from the customer should appear here with details:
   - Product name
   - Retailer name
   - Customer name

#### Step 5d: Accept the Delivery

1. On the order card, tap **"Accept Delivery"** (or similar action button).
2. The order is now claimed by you. It moves from "Available" to your **"My Deliveries"** section.
3. A **"Mark as Picked Up"** button appears.

#### Step 5e: Pick Up the Order

1. Tap **"Mark as Picked Up"**.
2. The status changes to **"PICKED UP"** — you are now on your way to deliver.
3. A **"Mark as Delivered"** button appears.

#### Step 5f: Deliver the Order

1. Tap **"Mark as Delivered"**.
2. The order is now **"DELIVERED"** — the complete lifecycle is finished!
3. The order moves to your completed/history section.

---

### 6. Customer — Track & Receive Delivery

If you go back to the **Customer** role and check the **Orders** tab or the **Order Status Screen**, you will see the order has been updated in real-time through all the statuses:

```
Placed → Accepted → Packed → ReadyForPickup → PickedUp → Delivered ✅
```

Each status transition shows the exact timestamp on the order timeline. The customer sees the delivery as complete.

---

## Order Lifecycle — Complete Flow Diagram

Here is the complete end-to-end journey of a single order, showing which role performs each action:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE ORDER LIFECYCLE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  CUSTOMER                 RETAILER              DELIVERY PARTNER        │
│  ────────                 ────────              ─────────────────        │
│                                                                         │
│  1. Search product                                                      │
│  2. Select retailer                                                     │
│  3. Place order ──────►  4. See new order                               │
│                          5. Accept order                                 │
│     [Status: Placed]        [Status: Accepted]                          │
│                          6. Pack order                                   │
│                             [Status: Packed]                            │
│                          7. Mark Ready ──────► 8. See available order    │
│                             [Status:           9. Claim order            │
│                              ReadyForPickup]  10. Pick up order          │
│                                                  [Status: PickedUp]     │
│                                               11. Deliver order          │
│  12. Order complete ◄─────────────────────────    [Status: Delivered]    │
│      [Status: Delivered]                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Role Switching Summary

| Step | Where to Go                                 | What to Do                                   |
|------|---------------------------------------------|----------------------------------------------|
| 1    | Landing → **Admin**                         | Tap "Seed Demo Data" (first time only)       |
| 2    | Landing → **Customer** → enter your name    | Search a product → Select retailer → Place order |
| 3    | Go back to **Landing**                      | —                                            |
| 4    | Landing → **Retailer** → select same store  | Accept order → Pack → Mark Ready for Delivery |
| 5    | Go back to **Landing**                      | —                                            |
| 6    | Landing → **Delivery** → select a partner   | Accept delivery → Mark Picked Up → Mark Delivered |
| 7    | Go back to **Customer**                      | Check Orders tab — order shows as Delivered ✅ |

---

## Order Statuses Reference

| Status            | Meaning                                                  | Set By           |
|-------------------|----------------------------------------------------------|------------------|
| `Placed`          | Customer has placed the order; waiting for retailer      | Customer         |
| `Accepted`        | Retailer accepted the order; preparing it                | Retailer         |
| `Packed`          | Retailer has packed the order                            | Retailer         |
| `ReadyForPickup`  | Order is ready; waiting for a delivery partner           | Retailer         |
| `PickedUp`        | Delivery partner has picked up the order                 | Delivery Partner |
| `Delivered`       | Order successfully delivered to the customer             | Delivery Partner |
| `Rejected`        | Retailer rejected the order (stock is restocked)         | Retailer         |
| `AutoCancelled`   | Retailer didn't respond within 60 seconds                | System (auto)    |
| `NoPartnerFound`  | No delivery partner claimed the order within 90 seconds  | System (auto)    |

---

## Timeout & Auto-Cancellation Rules

The app includes an automatic timeout system that runs in the background:

| Scenario                              | Timeout | Result                          |
|---------------------------------------|---------|---------------------------------|
| Retailer doesn't accept/reject        | 60 sec  | Order → `AutoCancelled`         |
| No delivery partner claims the order  | 90 sec  | Order → `NoPartnerFound`        |

- The **timeout checker** runs every 5 seconds (configurable in `constants.ts`).
- If a retailer rejects an order, the product stock is automatically restored.
- Auto-cancelled orders do **not** restock (by design — production apps may differ).

---

## Firestore Data Model

The app uses 5 Firestore collections:

### `products`
| Field  | Type   | Description          |
|--------|--------|----------------------|
| `name` | string | Product display name |

### `retailers`
| Field  | Type   | Description        |
|--------|--------|--------------------|
| `name` | string | Store display name |

### `retailerStock`
| Field        | Type   | Description                         |
|--------------|--------|-------------------------------------|
| `retailerId` | string | Reference to the retailer           |
| `productId`  | string | Reference to the product            |
| `price`      | number | Price per unit (₹)                  |
| `stock`      | number | Available quantity                  |

### `deliveryPartners`
| Field  | Type   | Description          |
|--------|--------|----------------------|
| `name` | string | Partner display name |

### `orders`
| Field              | Type             | Description                                      |
|--------------------|------------------|--------------------------------------------------|
| `productId`        | string           | Product being ordered                            |
| `productName`      | string           | Product name (denormalized for display)          |
| `retailerId`       | string           | Retailer fulfilling the order                    |
| `retailerName`     | string           | Retailer name (denormalized)                     |
| `qty`              | number           | Quantity ordered                                 |
| `price`            | number           | Price per unit                                   |
| `customerName`     | string           | Name of the customer                             |
| `status`           | string           | Current order status (see statuses above)        |
| `statusHistory`    | array            | Array of `{ status, timestamp }` entries         |
| `deliveryPartnerId`| string \| null   | Assigned delivery partner (null until claimed)   |
| `createdAt`        | Timestamp        | When the order was placed                        |
| `acceptDeadline`   | Timestamp        | Deadline for retailer to accept                  |
| `pickupDeadline`   | Timestamp \| null | Deadline for delivery partner to claim           |

---

## Troubleshooting

### "configs.toReversed is not a function"

**Cause:** Your Node.js version is below v20. Expo SDK 54 requires Node v20+.

**Fix:**
```bash
# Check your version
node -v

# If below v20, install Node 22
# macOS (Homebrew):
brew install node@22

# Then run with the correct Node:
PATH="/usr/local/opt/node@22/bin:$PATH" npx expo start
```

### "No retailers found" or "No delivery partners found" on Role Selection

**Cause:** The database hasn't been seeded yet.

**Fix:** Go to **Admin** → tap **"Seed Demo Data"** → tap **"Seed Now"**.

### "EACCES: permission denied" when installing npm packages globally

**Cause:** npm global directory has permission conflicts.

**Fix:** Use a local cache instead:
```bash
npm --cache ./npm-cache install <package-name>
```

### Order doesn't appear in Retailer Dashboard

**Cause:** You selected a different retailer than the one the customer ordered from.

**Fix:** Go back to Landing Screen → Retailer → make sure you select the **exact same store** the customer chose during checkout.

### QR code doesn't work / Phone can't connect

**Cause:** Your phone and computer are on different Wi-Fi networks.

**Fix:**
- Make sure both devices are on the **same Wi-Fi network**, OR
- Use tunnel mode: `npx expo start --tunnel`

### Build fails with AAPT2 errors

**Cause:** Image assets are in the wrong format (e.g., JPEG files renamed to `.png`).

**Fix:** Convert all assets to genuine PNG format:
```bash
# macOS:
sips -s format png assets/image_name.png --out assets/image_name.png
```

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Made with 💜 by the NearFind team
</p>
