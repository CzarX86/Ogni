import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase/config';

export interface UserProfile {
  uid: string;
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
  lastLoginAt?: Date;
}

export interface AdminPermissions {
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canManageInventory: boolean;
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login timestamp
    await this.updateLastLogin(user.uid);

    return user;
  }

  // Register new user
  static async register(email: string, password: string, displayName: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userDoc: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
      role: 'customer',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return user;
  }

  // Sign out
  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  // Get current user profile
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as UserProfile;
  }

  // Update user profile
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    // Update Firebase Auth profile if displayName is provided
    if (updates.displayName !== undefined) {
      await updateProfile(user, { displayName: updates.displayName });
    }

    // Update Firestore document
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, updates, { merge: true });
  }

  // Send password reset email
  static async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  // Admin role validation methods

  // Check if current user is admin
  static async isAdmin(): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    return profile?.role === 'admin' || false;
  }

  // Validate admin access - throws error if not admin
  static async requireAdmin(): Promise<UserProfile> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Authentication required');
    }

    const profile = await this.getCurrentUserProfile();
    if (!profile) {
      throw new Error('User profile not found');
    }

    if (profile.role !== 'admin') {
      throw new Error('Admin access required');
    }

    return profile;
  }

  // Get admin permissions for current user
  static async getAdminPermissions(): Promise<AdminPermissions | null> {
    const isAdmin = await this.isAdmin();
    if (!isAdmin) return null;

    // For now, all admins have full permissions
    // This can be extended with role-based permissions later
    return {
      canManageProducts: true,
      canManageOrders: true,
      canManageUsers: true,
      canViewAnalytics: true,
      canManageInventory: true,
    };
  }

  // Create admin user (only callable by existing admins or during setup)
  static async createAdminUser(email: string, password: string, displayName: string): Promise<User> {
    // In production, this should only be callable by existing admins
    // For development/setup, we'll allow it
    const currentUser = auth.currentUser;
    if (currentUser) {
      await this.requireAdmin(); // Ensure current user is admin
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name
    await updateProfile(user, { displayName });

    // Create admin user document in Firestore
    const userDoc: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName,
      role: 'admin',
      createdAt: new Date(),
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    return user;
  }

  // Promote user to admin (admin only)
  static async promoteToAdmin(userId: string): Promise<void> {
    await this.requireAdmin(); // Ensure current user is admin

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date(),
    });
  }

  // Demote admin to customer (admin only)
  static async demoteFromAdmin(userId: string): Promise<void> {
    await this.requireAdmin(); // Ensure current user is admin

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    await updateDoc(userRef, {
      role: 'customer',
      updatedAt: new Date(),
    });
  }

  // Get all users (admin only)
  static async getAllUsers(): Promise<UserProfile[]> {
    await this.requireAdmin();

    // Note: In production, this should use pagination and proper security rules
    // Implementation would need proper Firestore query
    return [];
  }

  // Private helper methods

  private static async updateLastLogin(uid: string): Promise<void> {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastLoginAt: new Date(),
    }).catch(() => {
      // Ignore errors if document doesn't exist yet
    });
  }
}