import { HttpApiClient } from '@/shared/services/api';
import { User, UserProfile, Order, AuthResult, RegisterData, LoginData } from '@/shared/types';

export class UserService {
  private static readonly BASE_URL = '/users';
  private static readonly AUTH_URL = '/auth';

  /**
   * Get user profile information
   */
  static async getUserProfile(userId?: string): Promise<User> {
    try {
      const response = await HttpApiClient.get(`${this.BASE_URL}/profile`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user profile');
      }
      return response.data as User;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(updates: Partial<UserProfile>): Promise<User> {
    try {
      const response = await HttpApiClient.put(`${this.BASE_URL}/profile`, updates);
      if (!response.success) {
        throw new Error(response.message || 'Failed to update user profile');
      }
      return response.data as User;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  /**
   * Get user order history
   */
  static async getUserOrders(limit: number = 20, offset: number = 0): Promise<Order[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      });
      const response = await HttpApiClient.get(`${this.BASE_URL}/orders?${params}`);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user orders');
      }
      return response.data as Order[];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  static async register(data: RegisterData): Promise<User> {
    try {
      const response = await HttpApiClient.post(`${this.AUTH_URL}/register`, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to register user');
      }
      return response.data as User;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginData): Promise<AuthResult> {
    try {
      const response = await HttpApiClient.post(`${this.AUTH_URL}/login`, data);
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
   * Logout user
   */
  static async logout(): Promise<{ message: string }> {
    try {
      const response = await HttpApiClient.post(`${this.AUTH_URL}/logout`, {});
      if (!response.success) {
        throw new Error(response.message || 'Failed to logout');
      }
      return response.data as { message: string };
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Initiate password reset
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await HttpApiClient.post(`${this.AUTH_URL}/forgot-password`, { email });
      if (!response.success) {
        throw new Error(response.message || 'Failed to initiate password reset');
      }
      return response.data as { message: string };
    } catch (error) {
      console.error('Error initiating password reset:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await HttpApiClient.put(`${this.AUTH_URL}/change-password`, {
        currentPassword,
        newPassword,
      });
      if (!response.success) {
        throw new Error(response.message || 'Failed to change password');
      }
      return response.data as { message: string };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  static async checkAuth(): Promise<User | null> {
    try {
      const response = await HttpApiClient.get(`${this.AUTH_URL}/check`);
      if (!response.success) {
        return null;
      }
      return response.data as User;
    } catch (error) {
      console.error('Error checking auth:', error);
      return null;
    }
  }
}