import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, RefreshCw, Upload, Download, AlertTriangle } from 'lucide-react';
import { FinancialDataService, ExcelImportService } from '../services';
import ExcelUpload from './ExcelUpload';

interface DatabaseStatus {
  connected: boolean;
  tablesCount: number;
  error?: string;
  lastCheck: string;
}

export const DatabaseConfig: React.FC = () => {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  const [envConfigured, setEnvConfigured] = useState(false);

  const financialService = new FinancialDataService();
  const excelService = new ExcelImportService();

  useEffect(() => {
    checkDatabaseStatus();
    checkEnvConfiguration();
  }, []);

  const checkEnvConfiguration = () => {
    // Verificar se as variáveis de ambiente estão configuradas
    const hasDbUrl = process.env.VITE_DATABASE_URL || process.env.DATABASE_URL;
    setEnvConfigured(!!hasDbUrl);
  };

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      const dbStatus = await financialService.getDatabaseStatus();
      setStatus({
        connected: dbStatus.connected,
        tablesCount: dbStatus.tablesCount || 0,
        error: dbStatus.error,
        lastCheck: new Date().toLocaleString()
      });
    } catch (error) {
      setStatus({
        connected: false,
        tablesCount: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        lastCheck: new Date().toLocaleString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMigration = async () => {
    setMigrating(true);
    try {
      await financialService.forceMigration();
      await checkDatabaseStatus();
      alert('✅ Migração concluída com sucesso!');
    } catch (error) {
      alert(`❌ Erro na migração: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setMigrating(false);
    }
  };

  const downloadTemplate = () => {
    try {
      excelService.generateTemplate();
    } catch (error) {
      alert(`❌ Erro ao gerar template: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    if (status?.connected) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Verificando...';
    if (!envConfigured) return 'Variáveis de ambiente não configuradas';
    if (status?.connected) return `Conectado (${status.tablesCount} tabelas)`;
    return status?.error || 'Desconectado';
  };

  const getStatusColor = () => {
    if (loading) return 'text-blue-600';
    if (!envConfigured) return 'text-yellow-600';
    if (status?.connected) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Database className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Configuração do Banco de Dados Neon</h2>
      </div>

      {/* Status do Banco */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-700">Status da Conexão</h3>
          <button
            onClick={checkDatabaseStatus}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        {status?.lastCheck && (
          <p className="text-sm text-gray-500 mt-2">
            Última verificação: {status.lastCheck}
          </p>
        )}
      </div>

      {/* Configuração de Variáveis de Ambiente */}
      {!envConfigured && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Configuração Necessária</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Configure as variáveis de ambiente no arquivo <code className="bg-yellow-100 px-1 rounded">.env</code>:
              </p>
              <div className="bg-yellow-100 rounded p-3 text-sm font-mono text-yellow-800">
                DATABASE_URL=postgresql://username:password@host:port/database<br />
                VITE_DATABASE_URL=postgresql://username:password@host:port/database<br />
                NEON_PROJECT_ID=your_project_id<br />
                NEON_API_KEY=your_api_key
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Obtenha essas informações no painel do Neon Console.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Migração de Dados */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Migração de Dados</h4>
          <p className="text-sm text-gray-600 mb-3">
            Migre dados do localStorage para o banco Neon.
          </p>
          <button
            onClick={handleMigration}
            disabled={migrating || !status?.connected}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {migrating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {migrating ? 'Migrando...' : 'Migrar Dados'}
          </button>
        </div>

        {/* Template Excel */}
        <div className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">Template Excel</h4>
          <p className="text-sm text-gray-600 mb-3">
            Baixe o template para importação de dados.
          </p>
          <button
            onClick={downloadTemplate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Baixar Template
          </button>
        </div>
      </div>

      {/* Upload de Excel */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">Importação de Dados Excel</h3>
          <button
            onClick={() => setShowExcelUpload(!showExcelUpload)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showExcelUpload ? 'Ocultar' : 'Mostrar'} Upload
          </button>
        </div>
        
        {showExcelUpload && (
          <div className="bg-gray-50 rounded-lg p-4">
            <ExcelUpload />
          </div>
        )}
      </div>

      {/* Informações Adicionais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">ℹ️ Informações Importantes</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• O sistema funciona com localStorage como fallback se o banco não estiver disponível</li>
          <li>• A migração preserva todos os dados existentes no localStorage</li>
          <li>• Use o template Excel para importar dados em lote</li>
          <li>• Verifique as permissões de rede se houver problemas de conexão</li>
        </ul>
      </div>
    </div>
  );
};

export default DatabaseConfig;