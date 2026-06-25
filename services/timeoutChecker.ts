
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { OrderStatus, TIMEOUT_CHECK_INTERVAL_MS } from '../constants';

const ordersCol = collection(db, 'orders');

/**
 * Checks for orders that have exceeded their accept deadline
 * (status == Placed && acceptDeadline < now) and marks them AutoCancelled.
 */
async function checkAcceptTimeouts(): Promise<void> {
  try {
    const now = Timestamp.now();
    const q = query(
      ordersCol,
      where('status', '==', OrderStatus.Placed),
    );
    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const deadline = data.acceptDeadline as Timestamp;
      if (deadline && deadline.toMillis() < now.toMillis()) {
        await updateDoc(docSnap.ref, {
          status: OrderStatus.AutoCancelled,
          statusHistory: arrayUnion({
            status: OrderStatus.AutoCancelled,
            timestamp: now,
          }),
        });
        // NOTE: We intentionally do NOT restock here. The brief says
        // "auto-cancelled" is a timeout, and restocking is only on explicit rejection.
        // A production version would likely restock on any cancellation.
      }
    }
  } catch (error) {
    console.warn('[TimeoutChecker] Error checking accept timeouts:', error);
  }
}

/**
 * Checks for orders that are ReadyForPickup with no delivery partner assigned
 * and have exceeded their pickup deadline → marks them NoPartnerFound.
 */
async function checkPickupTimeouts(): Promise<void> {
  try {
    const now = Timestamp.now();
    const q = query(
      ordersCol,
      where('status', '==', OrderStatus.ReadyForPickup),
      where('deliveryPartnerId', '==', null),
    );
    const snap = await getDocs(q);

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      const deadline = data.pickupDeadline as Timestamp;
      if (deadline && deadline.toMillis() < now.toMillis()) {
        await updateDoc(docSnap.ref, {
          status: OrderStatus.NoPartnerFound,
          statusHistory: arrayUnion({
            status: OrderStatus.NoPartnerFound,
            timestamp: now,
          }),
        });
      }
    }
  } catch (error) {
    console.warn('[TimeoutChecker] Error checking pickup timeouts:', error);
  }
}

/**
 * Starts the global timeout checker. Returns a cleanup function to stop it.
 * Mount this once at the App level.
 */
export function startTimeoutChecker(): () => void {
  const intervalId = setInterval(() => {
    checkAcceptTimeouts();
    checkPickupTimeouts();
  }, TIMEOUT_CHECK_INTERVAL_MS);

  checkAcceptTimeouts();
  checkPickupTimeouts();

  return () => clearInterval(intervalId);
}
