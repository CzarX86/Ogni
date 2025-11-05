import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import OgniLayout from '@/components/shared/ogni-layout';

const DemoComponentsPage: React.FC = () => {
  return (
    <OgniLayout 
      title="Componentes Ogni UI" 
      subtitle="Demonstração dos componentes combinando shadcn/ui com estilos Ogni"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cadastro de Produto</CardTitle>
            <CardDescription>Preencha os dados do novo produto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto</Label>
              <Input id="productName" placeholder="Digite o nome do produto" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productPrice">Preço</Label>
              <Input id="productPrice" type="number" placeholder="0,00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="productCategory">Categoria</Label>
              <select 
                id="productCategory"
                aria-label="Selecione a categoria do produto"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione uma categoria</option>
                <option value="eletronics">Eletrônicos</option>
                <option value="clothing">Vestuário</option>
                <option value="books">Livros</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="outline">Cancelar</Button>
            <Button>Adicionar Produto</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Produtos</CardTitle>
            <CardDescription>Produtos cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <Card key={item} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Produto {item}</h4>
                      <p className="text-sm text-muted-foreground">Categoria: Eletrônicos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R$ {(item * 99.99).toFixed(2)}</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        Editar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">Ver Todos os Produtos</Button>
          </CardFooter>
        </Card>
      </div>
    </OgniLayout>
  );
};

export default DemoComponentsPage;