import React, { useState, useRef } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ExcelImportService, ExcelImportResult } from '../services/excelImport';

interface ExcelUploadProps {
  onImportComplete?: (result: ExcelImportResult) => void;
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({ onImportComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelService = new ExcelImportService();

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    // Verificar se é um arquivo Excel
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      '.xlsx',
      '.xls'
    ];

    const isValidType = validTypes.some(type => 
      file.type === type || file.name.toLowerCase().endsWith(type)
    );

    if (!isValidType) {
      setImportResult({
        success: false,
        message: 'Por favor, selecione um arquivo Excel (.xlsx ou .xls)',
        imported: { categorias: 0, fornecedores: 0, contasBancarias: 0, despesas: 0, receitas: 0 },
        errors: ['Tipo de arquivo inválido']
      });
      return;
    }

    setIsUploading(true);
    setImportResult(null);

    try {
      const result = await excelService.importFromFile(file);
      setImportResult(result);
      onImportComplete?.(result);
    } catch (error) {
      setImportResult({
        success: false,
        message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        imported: { categorias: 0, fornecedores: 0, contasBancarias: 0, despesas: 0, receitas: 0 },
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDownloadTemplate = () => {
    excelService.generateTemplate();
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-6 h-6 text-green-600" />
          Importar Dados do Excel
        </h3>
        <p className="text-gray-600">
          Faça upload de um arquivo Excel com seus dados financeiros para importar automaticamente.
        </p>
      </div>

      {/* Área de Upload */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full ${
            dragOver ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <Upload className={`w-8 h-8 ${
              dragOver ? 'text-blue-600' : 'text-gray-600'
            }`} />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-700 mb-1">
              {dragOver ? 'Solte o arquivo aqui' : 'Clique ou arraste um arquivo Excel'}
            </p>
            <p className="text-sm text-gray-500">
              Formatos suportados: .xlsx, .xls
            </p>
          </div>
        </div>
      </div>

      {/* Botão para baixar template */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          Baixar Template Excel
        </button>
      </div>

      {/* Loading */}
      {isUploading && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-700 font-medium">Processando arquivo...</span>
          </div>
        </div>
      )}

      {/* Resultado da Importação */}
      {importResult && (
        <div className={`mt-6 p-4 rounded-lg border ${
          importResult.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start gap-3">
            {importResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            
            <div className="flex-1">
              <p className={`font-medium ${
                importResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {importResult.message}
              </p>
              
              {importResult.success && (
                <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-green-600">
                      {importResult.imported.categorias}
                    </div>
                    <div className="text-xs text-gray-600">Categorias</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-green-600">
                      {importResult.imported.fornecedores}
                    </div>
                    <div className="text-xs text-gray-600">Fornecedores</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-green-600">
                      {importResult.imported.contasBancarias}
                    </div>
                    <div className="text-xs text-gray-600">Contas</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-green-600">
                      {importResult.imported.despesas}
                    </div>
                    <div className="text-xs text-gray-600">Despesas</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-lg font-bold text-green-600">
                      {importResult.imported.receitas}
                    </div>
                    <div className="text-xs text-gray-600">Receitas</div>
                  </div>
                </div>
              )}
              
              {importResult.errors.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Erros encontrados:
                    </span>
                  </div>
                  <div className="max-h-32 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-amber-700 mb-1">
                        • {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Instruções:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• O arquivo Excel deve conter abas com os nomes: categorias, fornecedores, contas_bancarias, despesas, receitas</li>
          <li>• Baixe o template para ver o formato correto das colunas</li>
          <li>• Dados existentes não serão sobrescritos, apenas novos registros serão adicionados</li>
          <li>• Certifique-se de que as categorias e fornecedores sejam importados antes das despesas/receitas</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUpload;