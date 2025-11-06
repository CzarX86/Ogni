import { HttpApiClient } from '@/shared/services/api';
import { AuthResult, LoginData } from '@/shared/types';
import { auth } from './firebase/config';
import { signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth';

export class AuthService {
  private static readonly BASE_URL = '/auth';

  /**
   * Login user with email and password
   */
  static async login(data: LoginData): Promise<AuthResult> {
    try {
      const response = await HttpApiClient.post(`${this.BASE_URL}/login`, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to login');
      }
      return response.data as AuthResult;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Login with Google
   */
  static async loginWithGoogle(): Promise<AuthResult> {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Transform Firebase user to our User type
      const user = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName,
        role: 'customer' as const,
        profile: {},
        fcmTokens: [],
        appInstalled: false,
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now())
      };

      // Optional: Send user data to your backend
      try {
        await HttpApiClient.post(`${this.BASE_URL}/google-login`, {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified
        });
      } catch (backendError) {
        console.warn('Backend sync failed, but Google auth succeeded:', backendError);
      }

      return {
        user,
        token: await firebaseUser.getIdToken()
      };
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw new Error('Google login failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      // Also call backend logout if needed
      await HttpApiClient.post(`${this.BASE_URL}/logout`, {});
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async checkAuth(): Promise<boolean> {
    try {
      const response = await HttpApiClient.get(`${this.BASE_URL}/check`);
      return response.success;
    } catch (error) {
      console.error('Error checking auth:', error);
      return false;
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }
}