import { ProductService } from '../services/productService';
import { CategoryService } from '../services/categoryService';
import { log } from '../utils/logger';
import { auth, db } from '../services/firebase/config';
import { signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export class SeedService {
  // Ensure we are authenticated and have an admin user document to satisfy security rules
  private static async ensureAdminSession() {
    // Since Firestore rules allow anonymous access, we can skip authentication for seeding
    // But we'll still create an admin user document for consistency
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      // If anonymous auth fails, try with dev credentials
      if (e?.code === 'auth/operation-not-allowed' || e?.code === 'auth/configuration-not-found') {
        const email = process.env.REACT_APP_DEV_ADMIN_EMAIL;
        const password = process.env.REACT_APP_DEV_ADMIN_PASSWORD;

        if (!email || !password) {
          log.warn('Anonymous auth disabled and no dev credentials. Proceeding without authentication since Firestore rules allow it.');
          return null; // Skip authentication
        }

        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
          if (err?.code === 'auth/user-not-found') {
            await createUserWithEmailAndPassword(auth, email, password);
          } else if (err?.code === 'auth/invalid-credential') {
            await createUserWithEmailAndPassword(auth, email, password);
          } else if (err?.code === 'auth/weak-password') {
            throw new Error('REACT_APP_DEV_ADMIN_PASSWORD must be at least 6 characters');
          } else {
            log.warn('Authentication failed, but proceeding since Firestore rules allow anonymous access:', err);
            return null; // Skip authentication
          }
        }
      } else {
        log.warn('Anonymous auth failed, but proceeding since Firestore rules allow access:', e);
        return null; // Skip authentication
      }
    }

    const uid = auth.currentUser?.uid;
    if (uid) {
      const userDocRef = doc(db, 'users', uid);
      const snap = await getDoc(userDocRef);

      if (!snap.exists() || snap.data().role !== 'admin') {
        await setDoc(userDocRef, {
          id: uid,
          email: null,
          displayName: 'Seeder Admin',
          role: 'admin',
          createdAt: new Date(),
        }, { merge: true });
      }
    }

    return uid;
  }
  // Seed categories
  static async seedCategories() {
    try {
      log.info('Starting category seeding...');

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
          const payload = {
            ...category,
            parentId: category.parentId ? categoryIds[category.parentId] : undefined,
          } as any;
          const id = await CategoryService.createCategory(payload);
          categoryIds[category.name] = id;
          log.info(`Created category: ${category.name} (${id})`);
        } catch (error) {
          log.warn(`Category ${category.name} might already exist:`, { error });
        }
      }

      return categoryIds;
    } catch (error) {
      log.error('Failed to seed categories:', { error });
      throw error;
    }
  }

  // Seed products
  static async seedProducts(categoryIds: { [key: string]: string }) {
    try {
      log.info('Starting product seeding...');

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

        // Roupas
        {
          name: 'Camiseta Básica Branca',
          description: 'Camiseta 100% algodão, corte clássico, tamanho P ao GG',
          price: 49.99,
          categoryId: categoryIds['Roupas Masculinas'],
          stock: 200,
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
          tags: ['camiseta', 'basica', 'algodao'],
          rating: 4.5,
          reviewCount: 450,
        },
        {
          name: 'Vestido Midi Floral',
          description: 'Vestido midi com estampa floral, tecido leve e confortável',
          price: 129.99,
          categoryId: categoryIds['Roupas Femininas'],
          stock: 80,
          images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
          tags: ['vestido', 'floral', 'midi'],
          rating: 4.6,
          reviewCount: 320,
        },
        {
          name: 'Tênis Running Nike',
          description: 'Tênis Nike Air Zoom Pegasus 40 - Ideal para corrida',
          price: 599.99,
          categoryId: categoryIds['Esportes'],
          stock: 60,
          images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
          tags: ['nike', 'tenis', 'running'],
          rating: 4.8,
          reviewCount: 675,
        },

        // Casa e Jardim
        {
          name: 'Jogo de Panelas Tramontina',
          description: 'Jogo de panelas antiaderente 5 peças - Tramontina Turim',
          price: 299.99,
          categoryId: categoryIds['Casa e Jardim'],
          stock: 25,
          images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400'],
          tags: ['panelas', 'tramontina', 'cozinha'],
          rating: 4.7,
          reviewCount: 890,
        },
        {
          name: 'Sofá 3 Lugares',
          description: 'Sofá 3 lugares em tecido cinza, estrutura em madeira maciça',
          price: 2499.99,
          categoryId: categoryIds['Casa e Jardim'],
          stock: 10,
          images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
          tags: ['sofa', 'sala', 'mobilia'],
          rating: 4.4,
          reviewCount: 156,
        },

        // Livros
        {
          name: 'O Senhor dos Anéis - Trilogia',
          description: 'Box completo da trilogia O Senhor dos Anéis - J.R.R. Tolkien',
          price: 149.99,
          categoryId: categoryIds['Livros'],
          stock: 35,
          images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'],
          tags: ['fantasia', 'tolkien', 'trilogia'],
          rating: 4.9,
          reviewCount: 1200,
        },
        {
          name: 'Clean Code',
          description: 'A Handbook of Agile Software Craftsmanship - Robert C. Martin',
          price: 89.99,
          categoryId: categoryIds['Livros'],
          stock: 45,
          images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400'],
          tags: ['programacao', 'clean-code', 'software'],
          rating: 4.8,
          reviewCount: 780,
        },

        // Mais produtos para ter variedade
        {
          name: 'Fone de Ouvido Bluetooth Sony',
          description: 'Fone de ouvido wireless Sony WH-1000XM5 com cancelamento de ruído',
          price: 1899.99,
          categoryId: categoryIds['Eletrônicos'],
          stock: 20,
          images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
          tags: ['sony', 'fone', 'bluetooth'],
          rating: 4.6,
          reviewCount: 543,
        },
        {
          name: 'Bicicleta Mountain Bike',
          description: 'Bicicleta MTB Caloi 29" com 21 marchas, freio a disco',
          price: 2499.99,
          categoryId: categoryIds['Esportes'],
          stock: 15,
          images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
          tags: ['bicicleta', 'mtb', 'caloi'],
          rating: 4.5,
          reviewCount: 234,
        },
      ];

      for (const product of products) {
        try {
          const id = await ProductService.createProduct(product);
          log.info(`Created product: ${product.name} (${id})`);
        } catch (error) {
          log.warn(`Product ${product.name} might already exist:`, { error });
        }
      }

      log.info('Product seeding completed');
    } catch (error) {
      log.error('Failed to seed products:', { error });
      throw error;
    }
  }

  // Main seeding function
  static async seedDatabase() {
    try {
      log.info('Starting database seeding...');

      // Ensure admin permissions according to Firestore rules
      await this.ensureAdminSession();

      // Seed categories first
      const categoryIds = await this.seedCategories();

      // Then seed products
      await this.seedProducts(categoryIds);

      log.info('Database seeding completed successfully!');
      return { success: true, message: 'Database seeded with sample data' };
    } catch (error) {
      log.error('Database seeding failed:', { error });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}