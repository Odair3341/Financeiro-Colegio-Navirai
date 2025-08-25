import React from 'react';
import { DatabaseConfig } from '../components/DatabaseConfig';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ConfiguracaoBanco: React.FC = () => {
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