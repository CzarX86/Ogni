import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Login } from '../../components/auth/Login';
import { Register } from '../../components/auth/Register';
import { useAppInstalled, openMobileApp } from '../../hooks/useAppInstalled';
import { Button } from '../../components/ui/button';
import { Smartphone, Download } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';

export const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isMobile, platform, canOpenApp } = useAppInstalled();

  // Check if user wants to register
  React.useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  const handleSuccess = () => {
    // Redirect to intended page or home
    const redirectTo = searchParams.get('redirect') || '/';
    navigate(redirectTo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Mobile App Banner */}
        {isMobile && canOpenApp && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Open in App</p>
                    <p className="text-sm text-blue-700">Better experience on our mobile app</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => platform !== 'unknown' && openMobileApp(platform)}
                  disabled={platform === 'unknown'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auth Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-6">
            <Login
              onSuccess={handleSuccess}
              redirectTo={searchParams.get('redirect') || '/'}
            />
          </TabsContent>

          <TabsContent value="register" className="mt-6">
            <Register
              onSuccess={handleSuccess}
              redirectTo={searchParams.get('redirect') || '/'}
            />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};