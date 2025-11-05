// Core entity types based on data-model.md

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discount?: number; // Percentage discount (0-100)
  rating?: number; // Average rating (0-5)
  reviewCount?: number; // Number of reviews
  images: string[];
  stock: number;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  parentId?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  role: 'customer' | 'admin';
  profile?: {
    phone?: string;
    address?: string;
  };
  fcmTokens?: string[];
  appInstalled?: boolean;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  shipping: {
    address: string;
    method: string;
    cost: number;
  };
  payment: {
    method: string;
    status: string;
    transactionId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id?: string; // Firestore document ID
  userId: string;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface PageView {
  id: string;
  userId?: string;
  sessionId: string;
  page: string;
  referrer?: string;
  timeOnPage: number;
  timestamp: Date;
  deviceInfo: {
    type: string;
    os: string;
    browser: string;
  };
}

export interface UserInteraction {
  id: string;
  userId?: string;
  sessionId: string;
  interactionType: 'click' | 'scroll' | 'form_submit' | 'search' | 'add_to_cart' | 'purchase';
  element: string;
  page: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface Session {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  deviceInfo: any;
  source?: string;
}

export interface CartEvent {
  id: string;
  userId?: string;
  sessionId: string;
  eventType: 'add_item' | 'remove_item' | 'update_quantity' | 'abandon' | 'checkout_start' | 'purchase';
  productId: string;
  quantity: number;
  cartValue: number;
  timestamp: Date;
}

export interface ProductLike {
  id: string;
  userId: string;
  productId: string;
  timestamp: Date;
  context: 'feed' | 'product_page' | 'search';
}

export interface FeedInteraction {
  id: string;
  userId?: string;
  sessionId: string;
  productId: string;
  interactionType: 'view' | 'like' | 'skip' | 'click' | 'add_to_cart' | 'purchase' | 'share' | 'save';
  feedPosition: number;
  algorithmScore: number;
  timestamp: Date;
}

export interface ProductComment {
  id: string;
  userId: string;
  productId: string;
  content: string;
  parentId?: string;
  likes: number;
  timestamp: Date;
}

export interface ProductShare {
  id: string;
  userId: string;
  productId: string;
  platform: 'whatsapp' | 'telegram' | 'email' | 'copy_link' | 'native_share';
  timestamp: Date;
}

export interface Wishlist {
  id: string;
  userId: string;
  name?: string;
  products: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  displayName: string;
}

export interface ProductForm {
  name: string;
  description: string;
  price: number;
  images: string[];
  stock: number;
  categoryId: string;
}

export interface CheckoutForm {
  shippingAddress: {
    street: string;
    city: string;
    zip: string;
  };
  paymentMethod: 'pix' | 'card';
}