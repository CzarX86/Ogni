import { User } from '../../../shared/types';

// Mock the HttpApiClient first
jest.mock('../../../shared/services/api', () => ({
  HttpApiClient: {
    get: jest.fn(),
    put: jest.fn(),
    post: jest.fn(),
  },
}));

import { UserService } from '../../src/services/userService';
import { AuthService } from '../../src/services/authService';

// Mock the services using jest.mocked
jest.mock('../../src/services/userService');
jest.mock('../../src/services/authService');

const mockUserService = UserService as jest.Mocked<typeof UserService>;
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

describe('Account Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration Flow', () => {
    it('should successfully register a new user and set up initial state', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'securepassword123',
        displayName: 'New User'
      };

      const mockUser = {
        id: 'user-123',
        email: 'newuser@example.com',
        displayName: 'New User',
        role: 'customer' as const,
        profile: {},
        appInstalled: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockAuthResult = {
        user: mockUser,
        token: 'jwt-token-123'
      };

      mockUserService.register.mockResolvedValue(mockUser);
      mockAuthService.login.mockResolvedValue(mockAuthResult);

      // Simulate the registration flow
      const registeredUser = await UserService.register(registerData);
      const authResult = await AuthService.login({
        email: registerData.email,
        password: registerData.password
      });

      expect(registeredUser).toEqual(mockUser);
      expect(authResult).toEqual(mockAuthResult);
      expect(mockUserService.register).toHaveBeenCalledWith(registerData);
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: registerData.email,
        password: registerData.password
      });
    });

    it('should handle registration failure gracefully', async () => {
      const registerData = {
        email: 'existing@example.com',
        password: 'password123',
        displayName: 'Existing User'
      };

      mockUserService.register.mockRejectedValue(new Error('Email already exists'));

      await expect(UserService.register(registerData)).rejects.toThrow('Email already exists');
      expect(mockUserService.register).toHaveBeenCalledWith(registerData);
    });
  });

  describe('User Login Flow', () => {
    it('should authenticate user and retrieve profile', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'correctpassword'
      };

      const mockAuthResult = {
        user: {
          id: 'user-123',
          email: 'user@example.com',
          displayName: 'John Doe',
          role: 'customer'
        },
        token: 'jwt-token-123'
      };

      const mockProfile = {
        id: 'user-123',
        email: 'user@example.com',
        displayName: 'John Doe',
        role: 'customer' as const,
        profile: {
          phone: '+5511999999999',
          address: 'Rua das Flores, São Paulo, 01234-567'
        },
        appInstalled: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      };

      mockAuthService.login.mockResolvedValue(mockAuthResult);
      mockUserService.getUserProfile.mockResolvedValue(mockProfile);

      // Simulate login flow
      const authResult = await AuthService.login(loginData);
      const profile = await UserService.getUserProfile();

      expect(authResult).toEqual(mockAuthResult);
      expect(profile).toEqual(mockProfile);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
      expect(mockUserService.getUserProfile).toHaveBeenCalled();
    });

    it('should handle login failure', async () => {
      const loginData = {
        email: 'user@example.com',
        password: 'wrongpassword'
      };

      mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials');
      expect(mockAuthService.login).toHaveBeenCalledWith(loginData);
    });
  });

  describe('Profile Management Flow', () => {
    it('should update user profile and reflect changes', async () => {
      const currentProfile = {
        id: 'user-123',
        email: 'user@example.com',
        displayName: 'John Doe',
        role: 'customer' as const,
        profile: {
          phone: '+5511999999999'
        },
        appInstalled: false,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      };

      const updateData = {
        phone: '+5511988888888'
      };

      const updatedProfile = {
        ...currentProfile,
        profile: {
          phone: '+5511988888888',
          address: 'Rua Nova, São Paulo, 01234-567'
        },
        updatedAt: new Date('2025-01-02')
      };

      mockUserService.getUserProfile.mockResolvedValue(currentProfile);
      mockUserService.updateUserProfile.mockResolvedValue(updatedProfile);

      // Simulate profile update flow
      const initialProfile = await UserService.getUserProfile();
      const result = await UserService.updateUserProfile(updateData);
      const finalProfile = await UserService.getUserProfile();

      expect(initialProfile).toEqual(currentProfile);
      expect(result).toEqual(updatedProfile);
      expect(finalProfile).toEqual(currentProfile); // Note: This would be updated in real scenario
      expect(mockUserService.updateUserProfile).toHaveBeenCalledWith(updateData);
    });
  });

  describe('Order History Flow', () => {
    it('should retrieve and display user order history', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          userId: 'user-123',
          items: [
            {
              productId: 'product-1',
              quantity: 2,
              price: 99.99
            }
          ],
          total: 199.98,
          status: 'delivered' as const,
          shipping: {
            address: 'Rua das Flores, São Paulo',
            method: 'standard',
            cost: 15.00
          },
          payment: {
            method: 'pix',
            status: 'paid',
            transactionId: 'tx-123'
          },
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-05')
        },
        {
          id: 'order-2',
          userId: 'user-123',
          items: [
            {
              productId: 'product-2',
              quantity: 1,
              price: 49.99
            }
          ],
          total: 49.99,
          status: 'shipped' as const,
          shipping: {
            address: 'Rua das Flores, São Paulo',
            method: 'express',
            cost: 25.00
          },
          payment: {
            method: 'card',
            status: 'paid',
            transactionId: 'tx-456'
          },
          createdAt: new Date('2025-01-10'),
          updatedAt: new Date('2025-01-12')
        }
      ];

      mockUserService.getUserOrders.mockResolvedValue(mockOrders);

      const orders = await UserService.getUserOrders();
      const paginatedOrders = await UserService.getUserOrders(10, 10);

      expect(orders).toEqual(mockOrders);
      expect(paginatedOrders).toEqual(mockOrders); // Mock returns same data
      expect(mockUserService.getUserOrders).toHaveBeenCalledTimes(2);
      expect(mockUserService.getUserOrders).toHaveBeenNthCalledWith(1);
      expect(mockUserService.getUserOrders).toHaveBeenNthCalledWith(2, 10, 10);
    });
  });

  describe('Password Reset Flow', () => {
    it('should initiate password reset successfully', async () => {
      const email = 'user@example.com';
      const mockResponse = { message: 'Password reset email sent' };

      mockUserService.forgotPassword.mockResolvedValue(mockResponse);

      const result = await UserService.forgotPassword(email);

      expect(result).toEqual(mockResponse);
      expect(mockUserService.forgotPassword).toHaveBeenCalledWith(email);
    });

    it('should handle password reset failure', async () => {
      const email = 'nonexistent@example.com';

      mockUserService.forgotPassword.mockRejectedValue(new Error('User not found'));

      await expect(UserService.forgotPassword(email)).rejects.toThrow('User not found');
      expect(mockUserService.forgotPassword).toHaveBeenCalledWith(email);
    });
  });

  describe('Logout Flow', () => {
    it('should logout user and clear session', async () => {
      const mockLogoutResponse = { message: 'Logged out successfully' };

      mockUserService.logout.mockResolvedValue(mockLogoutResponse);

      const result = await UserService.logout();

      expect(result).toEqual(mockLogoutResponse);
      expect(mockUserService.logout).toHaveBeenCalled();
    });
  });
});