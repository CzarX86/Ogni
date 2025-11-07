import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../services/firebase/config';
import { log } from '../utils/logger';

export interface InventoryItem {
  productId: string;
  quantity: number;
  reserved: number; // Quantity reserved for pending orders
  available: number; // quantity - reserved
  lowStockThreshold: number;
  lastUpdated: Timestamp;
  location?: string; // Warehouse location
  sku: string;
}

export interface InventoryUpdate {
  productId: string;
  quantityChange: number; // Positive for increase, negative for decrease
  reason: 'sale' | 'return' | 'adjustment' | 'restock' | 'damage';
  reference?: string; // Order ID, adjustment note, etc.
  performedBy: string; // User ID who performed the action
}

export interface InventoryAlert {
  productId: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  message: string;
  threshold?: number;
  currentStock: number;
}

export class InventoryService {
  private static readonly COLLECTION = 'inventory';
  private static readonly LOG_COLLECTION = 'inventory_logs';

  // Get inventory for a specific product
  static async getInventory(productId: string): Promise<InventoryItem | null> {
    try {
      const docRef = doc(db, this.COLLECTION, productId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as InventoryItem;
      }

      return null;
    } catch (error) {
      log.error('Error getting inventory:', { error });
      throw new Error('Failed to get inventory data');
    }
  }

  // Get inventory for multiple products
  static async getInventoryBatch(productIds: string[]): Promise<Map<string, InventoryItem>> {
    try {
      const inventoryMap = new Map<string, InventoryItem>();

      // Firestore 'in' query has a limit of 10 items, so we need to batch
      const batches = [];
      for (let i = 0; i < productIds.length; i += 10) {
        batches.push(productIds.slice(i, i + 10));
      }

      for (const batch of batches) {
        const q = query(
          collection(db, this.COLLECTION),
          where('__name__', 'in', batch)
        );
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc: DocumentData) => {
          inventoryMap.set(doc.id, doc.data() as InventoryItem);
        });
      }

      return inventoryMap;
    } catch (error) {
      log.error('Error getting inventory batch:', { error });
      throw new Error('Failed to get inventory batch data');
    }
  }

  // Update inventory quantity
  static async updateInventory(
    productId: string,
    update: InventoryUpdate
  ): Promise<InventoryItem> {
    try {
      const inventoryRef = doc(db, this.COLLECTION, productId);

      // Get current inventory
      const currentInventory = await this.getInventory(productId);
      const now = Timestamp.fromDate(new Date());

      let newInventory: InventoryItem;

      if (currentInventory) {
        // Update existing inventory
        const newQuantity = Math.max(0, currentInventory.quantity + update.quantityChange);
        const newReserved = Math.max(0, currentInventory.reserved);
        const newAvailable = Math.max(0, newQuantity - newReserved);

        newInventory = {
          ...currentInventory,
          quantity: newQuantity,
          available: newAvailable,
          lastUpdated: now,
        };
        await updateDoc(inventoryRef, {
          quantity: newQuantity,
          available: newAvailable,
          lastUpdated: now,
        });
      } else {
        const newQuantity = Math.max(0, update.quantityChange);
        newInventory = {
          productId,
          quantity: newQuantity,
          reserved: 0,
          available: newQuantity,
          lowStockThreshold: 10, // Default threshold
          lastUpdated: now,
          sku: `SKU-${productId}`,
        };

        await setDoc(inventoryRef, newInventory);
      }

      // Log the inventory change
      await this.logInventoryChange(update);

      return newInventory;
    } catch (error) {
      log.error('Error updating inventory:', { error });
      throw new Error('Failed to update inventory');
    }
  }

  // Reserve inventory for an order
  static async reserveInventory(productId: string, quantity: number): Promise<boolean> {
    try {
      const inventoryRef = doc(db, this.COLLECTION, productId);
      const inventory = await this.getInventory(productId);

      if (!inventory || inventory.available < quantity) {
        return false; // Not enough available inventory
      }

      await updateDoc(inventoryRef, {
        reserved: inventory.reserved + quantity,
        available: inventory.available - quantity,
        lastUpdated: Timestamp.fromDate(new Date()),
      });

      return true;
    } catch (error) {
      log.error('Error reserving inventory:', { error });
      throw new Error('Failed to reserve inventory');
    }
  }

  // Release reserved inventory (e.g., order cancelled)
  static async releaseInventory(productId: string, quantity: number): Promise<void> {
    try {
      const inventoryRef = doc(db, this.COLLECTION, productId);
      const inventory = await this.getInventory(productId);

      if (!inventory) return;

      const newReserved = Math.max(0, inventory.reserved - quantity);
      const newAvailable = inventory.quantity - newReserved;

      await updateDoc(inventoryRef, {
        reserved: newReserved,
        available: newAvailable,
        lastUpdated: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      log.error('Error releasing inventory:', { error });
      throw new Error('Failed to release inventory');
    }
  }

  // Get low stock alerts
  static async getLowStockAlerts(): Promise<InventoryAlert[]> {
    try {
      const alerts: InventoryAlert[] = [];
      const q = query(collection(db, this.COLLECTION));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const inventory = doc.data() as InventoryItem;

        if (inventory.quantity <= inventory.lowStockThreshold && inventory.quantity > 0) {
          alerts.push({
            productId: inventory.productId,
            type: 'low_stock',
            message: `Produto ${inventory.productId} está com estoque baixo`,
            threshold: inventory.lowStockThreshold,
            currentStock: inventory.quantity,
          });
        } else if (inventory.quantity === 0) {
          alerts.push({
            productId: inventory.productId,
            type: 'out_of_stock',
            message: `Produto ${inventory.productId} está esgotado`,
            currentStock: 0,
          });
        }
      });

      return alerts;
    } catch (error) {
      log.error('Error getting low stock alerts:', { error });
      throw new Error('Failed to get low stock alerts');
    }
  }

  // Bulk update inventory
  static async bulkUpdateInventory(updates: InventoryUpdate[]): Promise<void> {
    try {
      const promises = updates.map(update =>
        this.updateInventory(update.productId, update)
      );

      await Promise.all(promises);
    } catch (error) {
      log.error('Error bulk updating inventory:', { error });
      throw new Error('Failed to bulk update inventory');
    }
  }

  // Set low stock threshold
  static async setLowStockThreshold(productId: string, threshold: number): Promise<void> {
    try {
      const inventoryRef = doc(db, this.COLLECTION, productId);

      await updateDoc(inventoryRef, {
        lowStockThreshold: Math.max(0, threshold),
        lastUpdated: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      log.error('Error setting low stock threshold:', { error });
      throw new Error('Failed to set low stock threshold');
    }
  }

  // Get inventory summary
  static async getInventorySummary(): Promise<{
    totalProducts: number;
    totalQuantity: number;
    lowStockCount: number;
    outOfStockCount: number;
  }> {
    try {
      const q = query(collection(db, this.COLLECTION));
      const querySnapshot = await getDocs(q);

      let totalProducts = 0;
      let totalQuantity = 0;
      let lowStockCount = 0;
      let outOfStockCount = 0;

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const inventory = doc.data() as InventoryItem;
        totalProducts++;
        totalQuantity += inventory.quantity;

        if (inventory.quantity === 0) {
          outOfStockCount++;
        } else if (inventory.quantity <= inventory.lowStockThreshold) {
          lowStockCount++;
        }
      });

      return {
        totalProducts,
        totalQuantity,
        lowStockCount,
        outOfStockCount,
      };
    } catch (error) {
      log.error('Error getting inventory summary:', { error });
      throw new Error('Failed to get inventory summary');
    }
  }

  // Private method to log inventory changes
  private static async logInventoryChange(update: InventoryUpdate): Promise<void> {
    try {
      const logRef = doc(collection(db, this.LOG_COLLECTION), `${update.productId}_${Date.now()}`);

      await setDoc(logRef, {
        ...update,
        timestamp: Timestamp.fromDate(new Date()),
      });
    } catch (error) {
      // Log the error but don't fail the main operation
      log.error('Error logging inventory change:', { error });
    }
  }
}