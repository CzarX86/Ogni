import React, { useState } from 'react';
import { SeedService } from '../../services/seedService';
import OgniLayout from '../../components/shared/ogni-layout';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

const SeedPage: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setResult(null);

    try {
      const seedResult = await SeedService.seedDatabase();
      setResult(seedResult);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <OgniLayout
      title="Seed Database"
      subtitle="Popular banco de dados com dados de exemplo"
    >
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Esta página permite popular o banco de dados com categorias e produtos de exemplo.
            Use apenas em ambiente de desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Firebase Project:</strong> {process.env.REACT_APP_FIREBASE_PROJECT_ID}</p>
            <p><strong>Status:</strong> {seeding ? 'Executando...' : 'Pronto'}</p>
          </div>

          <Button
            onClick={handleSeed}
            disabled={seeding}
            className="w-full"
            size="lg"
          >
            {seeding ? 'Executando Seed...' : 'Executar Seed Database'}
          </Button>

          {result && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Sucesso!' : '❌ Erro'}
              </h3>
              <p className={`text-sm mt-1 ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message || result.error}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>Nota:</strong> Esta página deve ser removida após o seed inicial.</p>
          </div>
        </CardContent>
      </Card>
    </OgniLayout>
  );
};

export default SeedPage;