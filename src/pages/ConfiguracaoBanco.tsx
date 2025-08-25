import React, { useState, useEffect } from 'react';
import { DatabaseConfig } from '../components/DatabaseConfig';
import { ArrowLeft, Database, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { neonDB } from '@/services/neonAPI';
import { useHybridData } from '@/hooks/useNeonData';

const ConfiguracaoBanco: React.FC = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  const { toast } = useToast();
  const { isOnline, categorias, despesas, receitas, reloadAll } = useHybridData();

  useEffect(() => {
    // Testa conexão na inicialização
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await neonDB.testConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
      
      if (isConnected) {
        toast({
          title: "✅ Conectado ao Neon!",
          description: "Sua aplicação está conectada ao banco PostgreSQL"
        });
        reloadAll(); // Recarrega dados do Neon
      } else {
        toast({
          title: "⚠️ Sem conexão com Neon",
          description: "Usando dados locais (localStorage)",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('disconnected');
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível conectar com o Neon",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Configuração do Banco de Dados
            </h1>
            <p className="text-gray-600">
              Configure a integração com o Neon PostgreSQL e gerencie seus dados financeiros.
            </p>
          </div>
        </div>

        {/* Status da Conexão */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Status da Conexão com Neon
              </CardTitle>
              <CardDescription>
                Verifique se sua aplicação está conectada ao banco PostgreSQL do Neon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {connectionStatus === 'connected' && (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        🟢 Conectado ao Neon
                      </Badge>
                    </>
                  )}
                  {connectionStatus === 'disconnected' && (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <Badge variant="destructive">
                        🔴 Usando localStorage
                      </Badge>
                    </>
                  )}
                  {connectionStatus === 'unknown' && (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <Badge variant="secondary">
                        🔄 Verificando...
                      </Badge>
                    </>
                  )}
                </div>
                
                <Button 
                  onClick={testConnection} 
                  disabled={isTestingConnection}
                  variant="outline"
                  size="sm"
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Testar Conexão
                </Button>
              </div>

              {/* Informações dos Dados */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{categorias.categorias?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Categorias</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{despesas.despesas?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Despesas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{receitas.receitas?.length || 0}</div>
                  <div className="text-sm text-muted-foreground">Receitas</div>
                </div>
              </div>

              {/* Informações técnicas */}
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Informações da Conexão:</h4>
                <div className="text-sm space-y-1">
                  <div>🗄️ <strong>Banco:</strong> {isOnline ? 'Neon PostgreSQL' : 'localStorage (offline)'}</div>
                  <div>🌐 <strong>Projeto:</strong> {import.meta.env.VITE_NEON_PROJECT_ID || 'não configurado'}</div>
                  <div>📊 <strong>Database:</strong> {import.meta.env.VITE_NEON_DATABASE || 'neondb'}</div>
                  <div>⚡ <strong>Status:</strong> {isOnline ? 'Online' : 'Modo fallback'}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuração do Banco */}
        <div className="max-w-4xl mx-auto">
          <DatabaseConfig />
        </div>

        {/* Instruções Detalhadas */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📋 Guia de Configuração do Neon
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">1. Criar Conta no Neon</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Acesse <a href="https://neon.tech" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">neon.tech</a> e crie uma conta gratuita.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">2. Criar Projeto</h3>
                <p className="text-sm text-gray-600 mb-2">
                  No painel do Neon, crie um novo projeto e anote as informações de conexão.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">3. Obter String de Conexão</h3>
                <p className="text-sm text-gray-600 mb-2">
                  No painel do projeto, vá em "Connection Details" e copie a string de conexão PostgreSQL.
                </p>
                <div className="bg-gray-100 rounded p-3 text-sm font-mono">
                  postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">4. Configurar Variáveis de Ambiente</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Edite o arquivo <code className="bg-gray-100 px-1 rounded">.env</code> na raiz do projeto:
                </p>
                <div className="bg-gray-100 rounded p-3 text-sm font-mono">
                  DATABASE_URL=postgresql://username:password@host:port/database<br />
                  VITE_DATABASE_URL=postgresql://username:password@host:port/database<br />
                  NEON_PROJECT_ID=your_project_id<br />
                  NEON_API_KEY=your_api_key
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">5. Reiniciar Aplicação</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Após configurar as variáveis, reinicie o servidor de desenvolvimento:
                </p>
                <div className="bg-gray-100 rounded p-3 text-sm font-mono">
                  npm run dev
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">6. Verificar Conexão</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Use o botão "Atualizar" acima para verificar se a conexão foi estabelecida com sucesso.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">7. Migrar Dados (Opcional)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Se você já possui dados no localStorage, use o botão "Migrar Dados" para transferi-los para o banco.
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-700 mb-2">8. Importar Excel (Opcional)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Baixe o template Excel, preencha com seus dados e faça o upload para importação em lote.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">
              🔧 Solução de Problemas
            </h2>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-yellow-700">Erro de Conexão</h4>
                <p className="text-sm text-yellow-600">
                  Verifique se a string de conexão está correta e se o projeto Neon está ativo.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-700">Variáveis de Ambiente</h4>
                <p className="text-sm text-yellow-600">
                  Certifique-se de que o arquivo .env está na raiz do projeto e reinicie o servidor.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-700">Permissões</h4>
                <p className="text-sm text-yellow-600">
                  Verifique se o usuário do banco tem permissões para criar tabelas e inserir dados.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-yellow-700">Firewall/Rede</h4>
                <p className="text-sm text-yellow-600">
                  Alguns firewalls corporativos podem bloquear conexões com bancos externos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfiguracaoBanco;