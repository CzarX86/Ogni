import React from 'react';
import { Settings, User, Lock, Package } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ProfileOverview } from './ProfileOverview';
import { ProfileForm } from './ProfileForm';
import { PasswordChange } from './PasswordChange';
import { OrderHistoryList } from './OrderHistoryList';
import { User as UserType, Order } from '@/shared/types';

interface AccountSettingsProps {
  user: UserType;
  orders: Order[];
  hasMoreOrders: boolean;
  isLoadingOrders: boolean;
  onLoadMoreOrders: () => void;
  onProfileUpdate: (updatedUser: UserType) => void;
  onPasswordChanged: () => void;
}

export const AccountSettings: React.FC<AccountSettingsProps> = ({
  user,
  orders,
  hasMoreOrders,
  isLoadingOrders,
  onLoadMoreOrders,
  onProfileUpdate,
  onPasswordChanged,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information, security settings, and order history
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileOverview user={user} />
          <ProfileForm
            initialData={{
              displayName: user.displayName || '',
              phone: user.profile?.phone || '',
              address: user.profile?.address || '',
            }}
            onUpdate={onProfileUpdate}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <PasswordChange onPasswordChanged={onPasswordChanged} />

          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Additional security settings and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Account Created</span>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Account Role</span>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View and track your past orders
              </CardDescription>
            </CardHeader>
          </Card>

          <OrderHistoryList
            orders={orders}
            hasMore={hasMoreOrders}
            isLoading={isLoadingOrders}
            onLoadMore={onLoadMoreOrders}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};