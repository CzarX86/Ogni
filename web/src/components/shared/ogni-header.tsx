import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface OgniHeaderProps {
  title: string;
  subtitle?: string;
  showAuthButtons?: boolean;
}

const OgniHeader: React.FC<OgniHeaderProps> = ({ 
  title, 
  subtitle, 
  showAuthButtons = false 
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-0">
        <CardTitle className="text-3xl font-bold text-primary">
          {title}
        </CardTitle>
        {subtitle && (
          <p className="text-lg mt-2 text-muted-foreground">
            {subtitle}
          </p>
        )}
      </CardHeader>
      {showAuthButtons && (
        <CardContent className="flex justify-center gap-4 pt-6">
          <Button variant="outline" className="px-6">
            Entrar
          </Button>
          <Button className="px-6">
            Criar Conta
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default OgniHeader;