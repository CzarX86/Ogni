import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../web/src/services/firebase/config';

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
}

export class AuthService {
  // Sign in with email and password
  static async signIn(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
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
      email: user.email!,
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

  // Check if user is admin
  static async isAdmin(): Promise<boolean> {
    const profile = await this.getCurrentUserProfile();
    return profile?.role === 'admin' || false;
  }
}