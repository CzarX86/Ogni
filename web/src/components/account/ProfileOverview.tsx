import React from 'react';
import { User, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { User as UserType } from '@/shared/types';

interface ProfileOverviewProps {
  user: UserType;
}

export const ProfileOverview: React.FC<ProfileOverviewProps> = ({ user }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Your basic account information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">Email</span>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">Member since</span>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};