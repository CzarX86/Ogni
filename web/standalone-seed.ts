import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

class StandaloneSeedService {
  // Ensure we are authenticated
  private static async ensureAdminSession() {
    try {
      await signInAnonymously(auth);
      console.log('✅ Signed in anonymously');
    } catch (e: any) {
      console.warn('Anonymous auth failed, trying email/password:', e.message);

      const email = process.env.REACT_APP_DEV_ADMIN_EMAIL;
      const password = process.env.REACT_APP_DEV_ADMIN_PASSWORD;

      if (!email || !password) {
        console.warn('No dev credentials available. Proceeding without authentication.');
        return null;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('✅ Signed in with email/password');
      } catch (err: any) {
        if (err?.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, email, password);
          console.log('✅ Created and signed in with new user');
        } else {
          console.warn('Authentication failed, proceeding anyway:', err.message);
          return null;
        }
      }
    }

    const uid = auth.currentUser?.uid;
    if (uid) {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);

      if (!snap.exists() || snap.data()?.role !== 'admin') {
        await setDoc(userDocRef, {
          id: uid,
          email: null,
          displayName: 'Seeder Admin',
          role: 'admin',
          createdAt: new Date(),
        }, { merge: true });
        console.log('✅ Created admin user document');
      }
    }

    return uid;
  }

  // Seed categories
  static async seedCategories() {
    console.log('🌱 Starting category seeding...');

    const categories = [
      { name: 'Eletrônicos', description: 'Dispositivos e acessórios tecnológicos', image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400', parentId: undefined },
      { name: 'Roupas', description: 'Vestuário e acessórios', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400', parentId: undefined },
      { name: 'Casa e Jardim', description: 'Itens para casa e decoração', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', parentId: undefined },
      { name: 'Esportes', description: 'Equipamentos esportivos', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', parentId: undefined },
      { name: 'Livros', description: 'Livros e materiais de leitura', image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', parentId: undefined },
      { name: 'Celulares', description: 'Smartphones e acessórios', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', parentId: 'Eletrônicos' },
      { name: 'Computadores', description: 'Notebooks e desktops', image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400', parentId: 'Eletrônicos' },
      { name: 'Roupas Masculinas', description: 'Vestuário para homens', image: 'https://images.unsplash.com/photo-1506629905607-0b5ab9a9e21a?w=400', parentId: 'Roupas' },
      { name: 'Roupas Femininas', description: 'Vestuário para mulheres', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', parentId: 'Roupas' },
    ];

    const categoryIds: { [key: string]: string } = {};

    for (const category of categories) {
      try {
        const docRef = await addDoc(collection(db, 'categories'), category);
        categoryIds[category.name] = docRef.id;
        console.log(`✅ Created category: ${category.name} (${docRef.id})`);
      } catch (error) {
        console.warn(`⚠️ Category ${category.name} might already exist:`, error);
      }
    }

    return categoryIds;
  }

  // Seed products
  static async seedProducts(categoryIds: { [key: string]: string }) {
    console.log('📦 Starting product seeding...');

    const products = [
      // Eletrônicos
      {
        name: 'iPhone 15 Pro',
        description: 'Smartphone Apple iPhone 15 Pro 128GB - Titânio Natural',
        price: 8999.99,
        categoryId: categoryIds['Celulares'],
        stock: 50,
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
        tags: ['apple', 'smartphone', 'ios'],
        rating: 4.8,
        reviewCount: 1250,
      },
      {
        name: 'MacBook Air M3',
        description: 'Notebook Apple MacBook Air 13" M3 Chip 8GB RAM 256GB SSD',
        price: 12999.99,
        categoryId: categoryIds['Computadores'],
        stock: 30,
        images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
        tags: ['apple', 'notebook', 'macbook'],
        rating: 4.9,
        reviewCount: 890,
      },
      {
        name: 'Samsung Galaxy S24',
        description: 'Smartphone Samsung Galaxy S24 Ultra 512GB - Titânio Preto',
        price: 7999.99,
        categoryId: categoryIds['Celulares'],
        stock: 40,
        images: ['https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400'],
        tags: ['samsung', 'smartphone', 'android'],
        rating: 4.7,
        reviewCount: 980,
      },
      // ... existing products ...
    ];

    for (const product of products) {
      try {
        const productWithTimestamp = {
          ...product,
          createdAt: new Date(),
        };
        const docRef = await addDoc(collection(db, 'products'), productWithTimestamp);
        console.log(`✅ Created product: ${product.name} (${docRef.id})`);
      } catch (error) {
        console.warn(`⚠️ Product ${product.name} might already exist:`, error);
      }
    }

    console.log('✅ Product seeding completed');
  }

  // Main seeding function
  static async seedDatabase() {
    try {
      console.log('🚀 Starting database seeding...');

      // Ensure admin permissions
      await this.ensureAdminSession();

      // Seed categories first
      const categoryIds = await this.seedCategories();

      // Then seed products
      await this.seedProducts(categoryIds);

      console.log('🎉 Database seeding completed successfully!');
      return { success: true, message: 'Database seeded with sample data' };
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// CLI execution
async function main() {
  console.log('🌱 Ogni Database Seeder');
  console.log('======================');

  const result = await StandaloneSeedService.seedDatabase();

  if (result.success) {
    console.log('✅ Success:', result.message);
    process.exit(0);
  } else {
    console.error('❌ Failed:', result.error);
    process.exit(1);
  }
}

main();