// Exemplo de componente usando os hooks do Neon
// Este arquivo demonstra como integrar o banco Neon com seus componentes existentes

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCategorias, useDespesas, useReceitas } from '@/hooks/useNeonData';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const ExemploNeonIntegration: React.FC = () => {
  // Usando os hooks que criamos
  const { 
    categorias, 
    loading: loadingCategorias, 
    isOnline: categoriasOnline, 
    addCategoria,
    reload: reloadCategorias 
  } = useCategorias();
  
  const { 
    despesas, 
    loading: loadingDespesas, 
    isOnline: despesasOnline,
    reload: reloadDespesas 
  } = useDespesas();

  const { 
    receitas, 
    loading: loadingReceitas, 
    isOnline: receitasOnline,
    reload: reloadReceitas 
  } = useReceitas();

  const isOnline = categoriasOnline || despesasOnline || receitasOnline;
  const isLoading = loadingCategorias || loadingDespesas || loadingReceitas;

  const handleReloadAll = () => {
    reloadCategorias();
    reloadDespesas();
    reloadReceitas();
  };

  const handleAddExampleCategory = async () => {
    try {
      await addCategoria({
        nome: 'Categoria Teste Neon',
        tipo: 'despesa',
        cor: '#3b82f6',
        ativo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Categoria adicionada com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Exemplo de Integração com Neon
          </CardTitle>
          <CardDescription>
            Demonstração dos hooks híbridos funcionando com Neon + localStorage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status da Conexão */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge className="bg-green-100 text-green-800">🟢 Conectado ao Neon</Badge>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                  <Badge variant="secondary">🔴 Modo localStorage</Badge>
                </>
              )}
            </div>
            <Button onClick={handleReloadAll} disabled={isLoading} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Recarregar
            </Button>
          </div>

          {/* Dados Carregados */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {loadingCategorias ? '...' : categorias.length}
              </div>
              <div className="text-sm text-muted-foreground">Categorias</div>
              <div className="text-xs mt-1">
                {categoriasOnline ? '🟢 Neon' : '🔴 Local'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {loadingDespesas ? '...' : despesas.length}
              </div>
              <div className="text-sm text-muted-foreground">Despesas</div>
              <div className="text-xs mt-1">
                {despesasOnline ? '🟢 Neon' : '🔴 Local'}
              </div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {loadingReceitas ? '...' : receitas.length}
              </div>
              <div className="text-sm text-muted-foreground">Receitas</div>
              <div className="text-xs mt-1">
                {receitasOnline ? '🟢 Neon' : '🔴 Local'}
              </div>
            </div>
          </div>

          {/* Exemplo de Uso */}
          <div className="space-y-4">
            <h3 className="font-semibold">Exemplo de Uso dos Hooks:</h3>
            
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-auto">
{`// Como usar nos seus componentes:
import { useCategorias } from '@/hooks/useNeonData';

function MeuComponente() {
  const { categorias, isOnline, addCategoria } = useCategorias();
  
  return (
    <div>
      {isOnline ? '🟢 Dados do Neon' : '🔴 Dados locais'}
      <p>Total: {categorias.length} categorias</p>
    </div>
  );
}`}
              </pre>
            </div>

            <Button onClick={handleAddExampleCategory} className="w-full">
              Testar Adição de Categoria
            </Button>
          </div>

          {/* Lista das Primeiras Categorias */}
          {categorias.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Primeiras Categorias:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categorias.slice(0, 5).map((categoria) => (
                  <div key={categoria.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{categoria.nome}</span>
                    <Badge variant={categoria.tipo === 'receita' ? 'default' : 'secondary'}>
                      {categoria.tipo}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExemploNeonIntegration;