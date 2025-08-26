import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  Upload, 
  FileSpreadsheet, 
  ArrowLeft, 
  Download, 
  X, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ExcelImportService } from '../services/excelImport';
import { testNeonConnection } from '../utils/neonUsage';

// Criar instância do serviço
const excelImportService = new ExcelImportService();

interface AbaInfo {
  nome: string;
  tipo: string;
  registros: number;
  colunas: number;
  ativa: boolean;
}

const ImportacaoExcel: React.FC = () => {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [abas, setAbas] = useState<AbaInfo[]>([]);
  const [importando, setImportando] = useState(false);
  const [importacaoConcluida, setImportacaoConcluida] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [statusAtual, setStatusAtual] = useState('');
  const [validarEstrutura, setValidarEstrutura] = useState(true);
  const [resultadoImportacao, setResultadoImportacao] = useState<any>(null);

  const totalRegistros = abas.reduce((total, aba) => aba.ativa ? total + aba.registros : total, 0);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setArquivo(file);
    setImportacaoConcluida(false);
    setProgresso(0);
    setStatusAtual('');
    setResultadoImportacao(null);

    try {
      console.log('📁 ImportacaoExcel: Analisando arquivo:', {
        nome: file.name,
        tamanho: file.size,
        tipo: file.type
      });
      const workbook = await excelImportService.parseExcelFile(file);
      
      const abasInfo: AbaInfo[] = workbook.SheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const range = worksheet['!ref'];
        
        let registros = 0;
        let colunas = 0;
        
        if (range) {
          const decoded = XLSX.utils.decode_range(range);
          registros = Math.max(0, decoded.e.r - decoded.s.r);
          colunas = decoded.e.c - decoded.s.c + 1;
        }
        
        let tipo = 'Tipo C';
        if (sheetName.toLowerCase().includes('auxiliar') || 
            sheetName.toLowerCase().includes('manutencao') ||
            sheetName.toLowerCase().includes('cheques') ||
            sheetName.toLowerCase().includes('cashflow')) {
          tipo = 'Auxiliar';
        }
        
        return {
          nome: sheetName,
          tipo,
          registros,
          colunas,
          ativa: tipo === 'Tipo C'
        };
      });
      
      setAbas(abasInfo);
      console.log('📊 ImportacaoExcel: Abas identificadas:', {
        totalAbas: abasInfo.length,
        abas: abasInfo.map(aba => ({
          nome: aba.nome,
          tipo: aba.tipo,
          registros: aba.registros,
          colunas: aba.colunas,
          ativa: aba.ativa
        }))
      });
    } catch (error) {
      console.error('Erro ao analisar arquivo:', error);
      alert('Erro ao analisar o arquivo Excel. Verifique se o arquivo está correto.');
    }
  }, []);

  const toggleAba = useCallback((index: number) => {
    setAbas(prev => prev.map((aba, i) => 
      i === index ? { ...aba, ativa: !aba.ativa } : aba
    ));
  }, []);

  const iniciarImportacao = useCallback(async () => {
    if (!arquivo) return;

    setImportando(true);
    setProgresso(0);
    setStatusAtual('Iniciando importação...');

    try {
      console.log('🚀 ImportacaoExcel: Iniciando importação do arquivo:', {
        nome: arquivo.name,
        tamanho: arquivo.size,
        tipo: arquivo.type,
        ultimaModificacao: arquivo.lastModified
      });
      
      // Verificar se o arquivo é válido
      if (arquivo.size === 0) {
        throw new Error('Arquivo está vazio');
      }
      
      if (!arquivo.name.match(/\.(xlsx|xls|csv)$/i)) {
        throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
      }
      
      const abasSelecionadas = abas.filter(aba => aba.ativa).map(aba => aba.nome);
      console.log('📋 ImportacaoExcel: Abas selecionadas para importação:', abasSelecionadas);
      
      console.log('✅ ImportacaoExcel: Arquivo validado, iniciando processamento...');
      const resultado = await excelImportService.importFromFile(arquivo);
      console.log('📊 ImportacaoExcel: Resultado da importação:', {
        success: resultado.success,
        message: resultado.message,
        imported: resultado.imported,
        errorsCount: resultado.errors?.length || 0,
        errors: resultado.errors
      });

      // Converter o resultado para o formato esperado pelo componente
      const resultadoFormatado = {
        sucesso: resultado.success,
        erro: resultado.success ? undefined : resultado.message,
        categorias: resultado.imported.categorias,
        fornecedores: resultado.imported.fornecedores,
        contasBancarias: resultado.imported.contasBancarias,
        despesas: resultado.imported.despesas,
        receitas: resultado.imported.receitas
      };

      setResultadoImportacao(resultadoFormatado);
      setImportacaoConcluida(true);
      setStatusAtual(resultado.success ? 'Importação concluída com sucesso!' : resultado.message);
      
    } catch (error) {
      console.error('❌ ImportacaoExcel: Erro durante importação:', {
        error: error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      setStatusAtual('Erro durante a importação: ' + (error as Error).message);
      setResultadoImportacao({
        sucesso: false,
        erro: (error as Error).message,
        categorias: 0,
        fornecedores: 0,
        contasBancarias: 0,
        despesas: 0,
        receitas: 0
      });
    } finally {
      setImportando(false);
    }
  }, [arquivo, abas]);

  if (importacaoConcluida && resultadoImportacao) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Importação Concluída</h1>
          </div>

          {/* Resultado */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {resultadoImportacao.sucesso ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {resultadoImportacao.sucesso ? 'Importação Realizada com Sucesso' : 'Erro na Importação'}
              </CardTitle>
              <CardDescription>
                {resultadoImportacao.sucesso 
                  ? 'Todos os dados foram importados e estão disponíveis no sistema'
                  : 'Ocorreu um erro durante a importação dos dados'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultadoImportacao.sucesso ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{resultadoImportacao.categorias || 0}</div>
                    <div className="text-sm text-blue-700">Categorias</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{resultadoImportacao.fornecedores || 0}</div>
                    <div className="text-sm text-green-700">Fornecedores</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{resultadoImportacao.contasBancarias || 0}</div>
                    <div className="text-sm text-purple-700">Contas Bancárias</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{resultadoImportacao.despesas || 0}</div>
                    <div className="text-sm text-red-700">Despesas</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{resultadoImportacao.receitas || 0}</div>
                    <div className="text-sm text-yellow-700">Receitas</div>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {resultadoImportacao.erro || 'Erro desconhecido durante a importação'}
                  </AlertDescription>
                </Alert>
              )}

              {/* Exibir erros detalhados */}
              {resultadoImportacao.errors && resultadoImportacao.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold mb-2 text-sm text-destructive">Detalhes dos Erros:</h4>
                  <Alert variant="destructive" className="max-h-40 overflow-y-auto">
                    <ul className="space-y-1">
                      {resultadoImportacao.errors.map((err, index) => (
                        <li key={index} className="text-xs font-mono">
                          - {err}
                        </li>
                      ))}
                    </ul>
                  </Alert>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => {
                    setArquivo(null);
                    setAbas([]);
                    setImportacaoConcluida(false);
                    setProgresso(0);
                    setStatusAtual("");
                    setResultadoImportacao(null);
                    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                  className="gradient-primary text-white"
                >
                  Nova Importação
                </Button>
                <Link to="/dashboard">
                  <Button variant="outline">
                    Voltar ao Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Importação de Planilha Excel</h1>
        </div>

        {/* Upload Area */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Selecionar Arquivo
            </CardTitle>
            <CardDescription>
              Faça upload da planilha "Fluxo de caixa Grupo CN 2024_2025.xlsx"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="upload-area">
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                {arquivo ? (
                  <div>
                    <p className="text-lg font-medium">{arquivo.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(arquivo.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Clique para selecionar arquivo</p>
                    <p className="text-sm text-muted-foreground">Apenas arquivos .xlsx são aceitos</p>
                  </div>
                )}
              </label>
            </div>
          </CardContent>
        </Card>

        {arquivo && (
          <>
            {/* Configurações */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Configurações da Importação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="validar" 
                    checked={validarEstrutura}
                    onCheckedChange={(checked) => setValidarEstrutura(checked === true)}
                  />
                  <label htmlFor="validar" className="text-sm font-medium">
                    Validar estrutura antes da importação
                  </label>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Total de {totalRegistros.toLocaleString()} registros serão importados de {abas.filter(aba => aba.ativa).length} abas selecionadas.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Seleção de Abas */}
            <Card className="financial-card">
              <CardHeader>
                <CardTitle>Abas Identificadas ({abas.length})</CardTitle>
                <CardDescription>Selecione quais abas deseja importar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {abas.map((aba, index) => (
                    <div 
                      key={index} 
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        aba.ativa ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => toggleAba(index)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${aba.ativa ? 'text-primary' : ''}`}>{aba.nome}</h4>
                        <Checkbox checked={aba.ativa} onClick={(e) => e.stopPropagation()} />
                      </div>
                      <div className="space-y-1">
                        <Badge variant={aba.tipo === 'Auxiliar' ? 'secondary' : 'default'}>
                          {aba.tipo}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {aba.registros} registros • {aba.colunas} colunas
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Collapsible className="mt-4">
                  <CollapsibleTrigger className="flex items-center text-sm text-muted-foreground">
                    <ChevronDown className="h-4 w-4 mr-1" />
                    <span>Ver nomes de abas detectados (Debug)</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-2 bg-muted rounded-md">
                    <p className="text-xs font-mono">{debugSheetNames.join(', ')}</p>
                  </CollapsibleContent>
                </Collapsible>

              </CardContent>
            </Card>

            {/* Importação */}
            <Card className="financial-card">
              <CardContent className="pt-6">
                {importando ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Progresso da Importação</span>
                      <span className="text-sm text-muted-foreground">{Math.round(progresso)}%</span>
                    </div>
                    <Progress value={progresso} className="w-full" />
                    <p className="text-sm text-muted-foreground">{statusAtual}</p>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button 
                      onClick={iniciarImportacao}
                      className="gradient-primary text-white flex-1"
                      disabled={!arquivo || abas.filter(aba => aba.ativa).length === 0}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Iniciar Importação ({abas.filter(aba => aba.ativa).length} abas)
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setArquivo(null);
                        setAbas([]);
                        setImportacaoConcluida(false);
                        setProgresso(0);
                        setStatusAtual("");
                        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Limpar Dados
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default ImportacaoExcel;
