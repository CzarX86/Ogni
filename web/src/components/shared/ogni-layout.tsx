import React from 'react';
import { Card, CardContent } from '../ui/card';
import OgniHeader from './ogni-header';

interface OgniLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const OgniLayout: React.FC<OgniLayoutProps> = ({ 
  title, 
  subtitle, 
  children 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <OgniHeader 
          title={title} 
          subtitle={subtitle} 
          showAuthButtons={false} 
        />
        <Card className="mt-8 shadow-xl">
          <CardContent className="p-6">
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OgniLayout;