/**
 * Integration Test: Admin Product Management Workflow
 * User Story 2: Admin Manages Products
 * 
 * Tests complete admin workflows including:
 * - Admin authentication and authorization
 * - Creating products with all fields
 * - Editing existing products
 * - Managing product inventory
 * - Bulk product operations
 * - Product activation/deactivation
 * 
 * This test simulates real admin user journeys through the product management system.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  query,
  where,
  getDocs,
  DocumentData
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';

// Helper to safely get document data
const getDocData = (doc: any): DocumentData => {
  const data = doc.data();
  if (!data) throw new Error('Document data is undefined');
  return data;
};

describe('Admin Product Management Workflow Integration Tests', () => {
  let app: FirebaseApp;
  let db: Firestore;
  let auth: Auth;
  let adminToken: string;
  const testProductIds: string[] = [];

  const adminCredentials = {
    email: 'admin@test.com',
    password: 'AdminTest123!'
  };

  const regularUserCredentials = {
    email: 'user@test.com',
    password: 'UserTest123!'
  };

  beforeAll(async () => {
    // Initialize Firebase test environment
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || 'test-api-key',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'test-project.firebaseapp.com',
      projectId: process.env.FIREBASE_PROJECT_ID || 'test-project',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'test-project.appspot.com'
    };

    app = initializeApp(firebaseConfig, 'admin-workflow-test');
    db = getFirestore(app);
    auth = getAuth(app);

    // Setup test admin user with custom claims
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        adminCredentials.email,
        adminCredentials.password
      );
      adminToken = await userCredential.user.getIdToken();
    } catch (error) {
      console.warn('Admin user not found in test environment');
    }
  });

  afterAll(async () => {
    // Cleanup test data
    for (const productId of testProductIds) {
      try {
        await deleteDoc(doc(db, 'products', productId));
      } catch (error) {
        console.warn(`Failed to delete test product ${productId}`);
      }
    }

    await signOut(auth);
    await deleteApp(app);
  });

  beforeEach(async () => {
    // Reset state before each test
    // No jest mocks to clear in integration tests
  });

  describe('Workflow 1: Admin Authentication and Authorization', () => {
    it('should authenticate admin user successfully', async () => {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        adminCredentials.email,
        adminCredentials.password
      );

      expect(userCredential.user).toBeDefined();
      expect(userCredential.user.email).toBe(adminCredentials.email);

      const token = await userCredential.user.getIdToken();
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should verify admin has admin role claim', async () => {
      const user = auth.currentUser;
      expect(user).toBeDefined();

      const tokenResult = await user!.getIdTokenResult();
      expect(tokenResult.claims.admin).toBe(true);
    });

    it('should reject non-admin user from admin operations', async () => {
      await signOut(auth);
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        regularUserCredentials.email,
        regularUserCredentials.password
      );

      const tokenResult = await userCredential.user.getIdTokenResult();
      expect(tokenResult.claims.admin).toBeUndefined();

      // Attempt admin operation
      const productData = {
        name: 'Unauthorized Product',
        price: 100,
        createdBy: userCredential.user.uid
      };

      await expect(
        setDoc(doc(db, 'products', 'test-unauthorized'), productData)
      ).rejects.toThrow(/permission-denied|forbidden/i);

      // Re-login as admin
      await signInWithEmailAndPassword(auth, adminCredentials.email, adminCredentials.password);
    });
  });

  describe('Workflow 2: Create New Product', () => {
    it('should create a complete product with all fields', async () => {
      const productId = `test-product-${Date.now()}`;
      testProductIds.push(productId);

      const productData = {
        name: 'Test Electronics Product',
        description: 'High-quality test product for electronics category',
        price: 1299.90,
        category: 'electronics',
        subcategory: 'smartphones',
        images: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg'
        ],
        stock: 100,
        lowStockThreshold: 10,
        reservedStock: 0,
        active: true,
        featured: false,
        tags: ['smartphone', 'android', '5g'],
        specifications: {
          brand: 'TestBrand',
          model: 'TM-2024',
          color: 'Black',
          warranty: '12 months'
        },
        dimensions: {
          weight: 180,
          width: 75,
          height: 160,
          depth: 8
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: auth.currentUser!.uid
      };

      await setDoc(doc(db, 'products', productId), productData);

      // Verify product was created
      const productDoc = await getDoc(doc(db, 'products', productId));
      expect(productDoc.exists()).toBe(true);

      const savedProduct = getDocData(productDoc);
      expect(savedProduct).toBeDefined();
      expect(savedProduct!.name).toBe(productData.name);
      expect(savedProduct!.price).toBe(productData.price);
      expect(savedProduct!.stock).toBe(productData.stock);
      expect(savedProduct!.active).toBe(true);
    });

    it('should validate required fields when creating product', async () => {
      const invalidProduct = {
        description: 'Missing required fields'
        // Missing: name, price, category, stock
      };

      await expect(
        setDoc(doc(db, 'products', 'test-invalid'), invalidProduct)
      ).rejects.toThrow();
    });

    it('should set default values for optional fields', async () => {
      const productId = `test-product-defaults-${Date.now()}`;
      testProductIds.push(productId);

      const minimalProduct = {
        name: 'Minimal Product',
        price: 50.00,
        category: 'general',
        stock: 10,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'products', productId), minimalProduct);

      const productDoc = await getDoc(doc(db, 'products', productId));
      const savedProduct = getDocData(productDoc);

      expect(savedProduct).toBeDefined();
      expect(savedProduct!.featured).toBe(false);
      expect(savedProduct!.reservedStock).toBe(0);
      expect(savedProduct!.tags).toEqual([]);
    });
  });

  describe('Workflow 3: Edit Existing Product', () => {
    let editProductId: string;

    beforeEach(async () => {
      // Create a product to edit
      editProductId = `test-product-edit-${Date.now()}`;
      testProductIds.push(editProductId);

      await setDoc(doc(db, 'products', editProductId), {
        name: 'Original Product',
        price: 100.00,
        category: 'test',
        stock: 50,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should update product fields successfully', async () => {
      const updates = {
        name: 'Updated Product Name',
        price: 150.00,
        description: 'New description added',
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'products', editProductId), updates, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', editProductId));
      const updatedProduct = getDocData(productDoc);

      expect(updatedProduct.name).toBe(updates.name);
      expect(updatedProduct.price).toBe(updates.price);
      expect(updatedProduct.description).toBe(updates.description);
      // Original fields should be preserved
      expect(updatedProduct.category).toBe('test');
      expect(updatedProduct.stock).toBe(50);
    });

    it('should update product images', async () => {
      const newImages = [
        'https://example.com/new-image1.jpg',
        'https://example.com/new-image2.jpg',
        'https://example.com/new-image3.jpg'
      ];

      await setDoc(doc(db, 'products', editProductId), {
        images: newImages,
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', editProductId));
      const updatedProduct = getDocData(productDoc);

      expect(updatedProduct.images).toEqual(newImages);
      expect(updatedProduct.images).toHaveLength(3);
    });

    it('should update product specifications', async () => {
      const newSpecs = {
        brand: 'NewBrand',
        model: 'NM-2024',
        color: 'White',
        storage: '256GB'
      };

      await setDoc(doc(db, 'products', editProductId), {
        specifications: newSpecs,
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', editProductId));
      const updatedProduct = getDocData(productDoc);

      expect(updatedProduct.specifications).toEqual(newSpecs);
    });
  });

  describe('Workflow 4: Manage Product Inventory', () => {
    let inventoryProductId: string;

    beforeEach(async () => {
      inventoryProductId = `test-product-inventory-${Date.now()}`;
      testProductIds.push(inventoryProductId);

      await setDoc(doc(db, 'products', inventoryProductId), {
        name: 'Inventory Test Product',
        price: 200.00,
        category: 'test',
        stock: 100,
        lowStockThreshold: 20,
        reservedStock: 0,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should update stock levels', async () => {
      await setDoc(doc(db, 'products', inventoryProductId), {
        stock: 150,
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', inventoryProductId));
      const product = getDocData(productDoc);
      expect(product.stock).toBe(150);
    });

    it('should handle stock reservations', async () => {
      await setDoc(doc(db, 'products', inventoryProductId), {
        reservedStock: 10,
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', inventoryProductId));
      const product = getDocData(productDoc);

      expect(product.reservedStock).toBe(10);
      const availableStock = product.stock - product.reservedStock;
      expect(availableStock).toBe(90);
    });

    it('should update low stock threshold', async () => {
      await setDoc(doc(db, 'products', inventoryProductId), {
        lowStockThreshold: 30,
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', inventoryProductId));
      expect(getDocData(productDoc).lowStockThreshold).toBe(30);
    });

    it('should detect low stock condition', async () => {
      await setDoc(doc(db, 'products', inventoryProductId), {
        stock: 15,
        lowStockThreshold: 20,
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', inventoryProductId));
      const product = getDocData(productDoc);

      const isLowStock = product.stock <= product.lowStockThreshold;
      expect(isLowStock).toBe(true);
    });
  });

  describe('Workflow 5: Product Activation/Deactivation', () => {
    let activationProductId: string;

    beforeEach(async () => {
      activationProductId = `test-product-activation-${Date.now()}`;
      testProductIds.push(activationProductId);

      await setDoc(doc(db, 'products', activationProductId), {
        name: 'Activation Test Product',
        price: 300.00,
        category: 'test',
        stock: 50,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    it('should deactivate product', async () => {
      await setDoc(doc(db, 'products', activationProductId), {
        active: false,
        deactivatedAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', activationProductId));
      const product = getDocData(productDoc);

      expect(product.active).toBe(false);
      expect(product.deactivatedAt).toBeDefined();
    });

    it('should reactivate product', async () => {
      // First deactivate
      await setDoc(doc(db, 'products', activationProductId), {
        active: false,
        deactivatedAt: new Date()
      }, { merge: true });

      // Then reactivate
      await setDoc(doc(db, 'products', activationProductId), {
        active: true,
        deactivatedAt: null,
        updatedAt: new Date()
      }, { merge: true });

      const productDoc = await getDoc(doc(db, 'products', activationProductId));
      const product = getDocData(productDoc);

      expect(product.active).toBe(true);
      expect(product.deactivatedAt).toBeNull();
    });

    it('should not show inactive products in public catalog', async () => {
      await setDoc(doc(db, 'products', activationProductId), {
        active: false
      }, { merge: true });

      const publicQuery = query(
        collection(db, 'products'),
        where('active', '==', true)
      );

      const querySnapshot = await getDocs(publicQuery);
      const productIds = querySnapshot.docs.map(doc => doc.id);

      expect(productIds).not.toContain(activationProductId);
    });
  });

  describe('Workflow 6: Bulk Product Operations', () => {
    const bulkProductIds: string[] = [];

    beforeEach(async () => {
      // Create multiple test products
      for (let i = 0; i < 5; i++) {
        const productId = `test-bulk-product-${i}-${Date.now()}`;
        bulkProductIds.push(productId);
        testProductIds.push(productId);

        await setDoc(doc(db, 'products', productId), {
          name: `Bulk Test Product ${i}`,
          price: 100 + i * 10,
          category: 'test-bulk',
          stock: 50,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    it('should update multiple products at once', async () => {
      const updates = {
        category: 'updated-bulk',
        tags: ['bulk-updated'],
        updatedAt: new Date()
      };

      // Bulk update
      for (const productId of bulkProductIds) {
        await setDoc(doc(db, 'products', productId), updates, { merge: true });
      }

      // Verify all products were updated
      for (const productId of bulkProductIds) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        const product = getDocData(productDoc);

        expect(product.category).toBe('updated-bulk');
        expect(product.tags).toContain('bulk-updated');
      }
    });

    it('should deactivate multiple products', async () => {
      // Bulk deactivate
      for (const productId of bulkProductIds.slice(0, 3)) {
        await setDoc(doc(db, 'products', productId), {
          active: false,
          updatedAt: new Date()
        }, { merge: true });
      }

      // Verify deactivation
      const deactivatedQuery = query(
        collection(db, 'products'),
        where('category', '==', 'test-bulk'),
        where('active', '==', false)
      );

      const querySnapshot = await getDocs(deactivatedQuery);
      expect(querySnapshot.docs).toHaveLength(3);
    });

    it('should apply discount to multiple products', async () => {
      const discountPercentage = 15;

      // Apply discount to all bulk products
      for (const productId of bulkProductIds) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        const product = getDocData(productDoc);
        const originalPrice = product.price;
        const discountedPrice = originalPrice * (1 - discountPercentage / 100);

        await setDoc(doc(db, 'products', productId), {
          originalPrice,
          price: discountedPrice,
          discountPercentage,
          updatedAt: new Date()
        }, { merge: true });
      }

      // Verify discount applied
      for (const productId of bulkProductIds) {
        const productDoc = await getDoc(doc(db, 'products', productId));
        const product = getDocData(productDoc);

        expect(product.discountPercentage).toBe(15);
        expect(product.price).toBeLessThan(product.originalPrice);
      }
    });
  });
});
