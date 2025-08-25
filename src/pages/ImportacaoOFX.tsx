import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  ArrowLeft,
  Calendar,
  Building2
} from "lucide-react";
import { Link } from "react-router-dom";
import { financialDataService } from "@/services/financialData";

interface Conta {
  id: string;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: string;
}

interface MovimentacaoOFX {
  data: string;
  historico: string;
  valor: number;
  tipo: 'credito' | 'debito';
}

const ImportacaoOFX = () => {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [contaSelecionada, setContaSelecionada] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoOFX[]>([]);
  const [concluido, setConcluido] = useState(false);
  const { toast } = useToast();

  // Carregar contas bancárias do serviço
  const contas = financialDataService.getContasBancarias().map(conta => ({
    id: conta.id,
    nome: `${conta.banco} - ${conta.nome}`,
    banco: conta.banco,
    agencia: conta.agencia,
    conta: conta.conta,
    tipo: conta.tipo
  }));

  // Função para fazer o parsing do arquivo OFX
  const parseOFXFile = (ofxContent: string): MovimentacaoOFX[] => {
    const movimentacoes: MovimentacaoOFX[] = [];
    
    try {
      // Encontrar todas as transações <STMTTRN>
      const transactionRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs;
      let match;
      
      while ((match = transactionRegex.exec(ofxContent)) !== null) {
        const transactionData = match[1];
        
        // Extrair dados da transação
        const trnTypeMatch = transactionData.match(/<TRNTYPE>(.*?)<\/TRNTYPE>/);
        const dateMatch = transactionData.match(/<DTPOSTED>(.*?)<\/DTPOSTED>/);
        const amountMatch = transactionData.match(/<TRNAMT>(.*?)<\/TRNAMT>/);
        const memoMatch = transactionData.match(/<MEMO>(.*?)<\/MEMO>/);
        
        if (trnTypeMatch && dateMatch && amountMatch && memoMatch) {
          const amount = parseFloat(amountMatch[1]);
          const tipo = trnTypeMatch[1] === 'CREDIT' ? 'credito' : 'debito';
          
          // Converter data do formato OFX (YYYYMMDD000000[-3:GMT]) para YYYY-MM-DD
          const dateStr = dateMatch[1];
          const year = dateStr.substring(0, 4);
          const month = dateStr.substring(4, 6);
          const day = dateStr.substring(6, 8);
          const formattedDate = `${year}-${month}-${day}`;
          
          movimentacoes.push({
            data: formattedDate,
            historico: memoMatch[1].trim(),
            valor: Math.abs(amount), // Sempre valor absoluto
            tipo: tipo
          });
        }
      }
      
      return movimentacoes;
    } catch (error) {
      console.error('Erro ao fazer parsing do arquivo OFX:', error);
      return [];
    }
  };

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.ofx')) {
        toast({
          title: "Arquivo inválido",
          description: "Por favor selecione um arquivo .ofx",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setArquivo(file);
      toast({
        title: "Arquivo carregado",
        description: `${file.name} - ${(file.size / 1024).toFixed(1)} KB`
      });
    }
  }, [toast]);

  const processarOFX = async () => {
    if (!arquivo || !contaSelecionada) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um arquivo e uma conta bancária",
        variant: "destructive"
      });
      return;
    }

    setProcessando(true);
    setProgresso(0);

    try {
      // Ler o conteúdo do arquivo OFX
      setProgresso(20);
      const ofxContent = await arquivo.text();
      
      // Fazer o parsing do arquivo OFX
      setProgresso(40);
      const movimentacoesOFX = parseOFXFile(ofxContent);
      
      if (movimentacoesOFX.length === 0) {
        throw new Error('Nenhuma transação encontrada no arquivo OFX');
      }
      
      // Simular processamento
      const etapas = [
        "Validando movimentações...",
        "Verificando duplicatas...",
        "Salvando no banco de dados..."
      ];

      let progressoAtual = 40;
      for (let i = 0; i < etapas.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200));
        progressoAtual += (60 / etapas.length);
        setProgresso(progressoAtual);
      }

      // Converter movimentações OFX para o formato do serviço e salvar
      const movimentacoesParaImportar = movimentacoesOFX.map(mov => ({
        contaBancariaId: contaSelecionada,
        data: mov.data,
        descricao: mov.historico,
        valor: mov.valor,
        tipo: mov.tipo,
        origem: 'ofx' as const,
        numeroDocumento: `OFX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }));

      // Importar movimentações usando o serviço
      const novasMovimentacoes = financialDataService.importarMovimentacaoOFX(movimentacoesParaImportar);
      
      setMovimentacoes(movimentacoesOFX);
      setConcluido(true);
      setProcessando(false);
      
      toast({
        title: "Processamento concluído!",
        description: `${novasMovimentacoes.length} movimentações importadas e salvas no sistema`
      });
    } catch (error) {
      setProcessando(false);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro durante o processamento do arquivo OFX",
        variant: "destructive"
      });
    }
  };

  const contaSelecionadaInfo = contas.find(c => c.id === contaSelecionada);

  if (concluido) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Processamento OFX Concluído</h1>
          </div>

          <Card className="financial-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <CardTitle className="text-green-700">Sucesso!</CardTitle>
                  <CardDescription>Arquivo OFX processado com sucesso</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{movimentacoes.length}</div>
                  <div className="text-sm text-green-700">Movimentações Importadas</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{movimentacoes.filter(m => m.tipo === 'credito').length}</div>
                  <div className="text-sm text-blue-700">Créditos</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{movimentacoes.filter(m => m.tipo === 'debito').length}</div>
                  <div className="text-sm text-red-700">Débitos</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Movimentações Processadas</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {movimentacoes.map((mov, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{mov.historico}</p>
                        <p className="text-sm text-muted-foreground">{mov.data}</p>
                      </div>
                      <div className={`font-bold ${mov.tipo === 'credito' ? 'text-green-600' : 'text-red-600'}`}>
                        {mov.tipo === 'credito' ? '+' : ''}R$ {Math.abs(mov.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Link to="/conciliacao" className="flex-1">
                  <Button className="w-full gradient-primary text-white">
                    Ir para Conciliação
                  </Button>
                </Link>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setArquivo(null);
                    setContaSelecionada("");
                    setConcluido(false);
                    setMovimentacoes([]);
                  }}
                >
                  Nova Importação
                </Button>
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
          <h1 className="text-3xl font-bold">Importação de Arquivo OFX</h1>
        </div>

        {/* Upload e Configuração */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Selecionar Arquivo OFX
              </CardTitle>
              <CardDescription>
                Faça upload do extrato bancário no formato OFX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="upload-area">
                <input
                  type="file"
                  accept=".ofx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="ofx-upload"
                />
                <label htmlFor="ofx-upload" className="cursor-pointer">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  {arquivo ? (
                    <div>
                      <p className="text-lg font-medium">{arquivo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(arquivo.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-medium">Clique para selecionar arquivo</p>
                      <p className="text-sm text-muted-foreground">Apenas arquivos .ofx (máx. 5MB)</p>
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Defina a conta bancária e período
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conta">Conta Bancária *</Label>
                <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contas.map(conta => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="data-inicial">Data Inicial</Label>
                  <Input
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data-final">Data Final</Label>
                  <Input
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                  />
                </div>
              </div>

              {contaSelecionadaInfo && (
                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{contaSelecionadaInfo.nome}</strong><br />
                    Ag: {contaSelecionadaInfo.agencia} | Conta: {contaSelecionadaInfo.conta}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Processamento */}
        <Card className="financial-card">
          <CardContent className="pt-6">
            {processando ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Processando arquivo OFX...</span>
                  <span className="text-sm text-muted-foreground">{Math.round(progresso)}%</span>
                </div>
                <Progress value={progresso} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  Isso pode levar alguns minutos dependendo do tamanho do arquivo.
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button 
                  onClick={processarOFX}
                  className="gradient-primary text-white flex-1"
                  disabled={!arquivo || !contaSelecionada}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Processar Arquivo OFX
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setArquivo(null);
                    setContaSelecionada("");
                    setDataInicial("");
                    setDataFinal("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações sobre OFX */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle>Sobre Arquivos OFX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Como obter o arquivo OFX:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Acesse seu internet banking</li>
                  <li>• Vá em "Extratos" ou "Movimentação"</li>
                  <li>• Selecione o período desejado</li>
                  <li>• Escolha formato "OFX" para download</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Bancos suportados:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Banco do Brasil</li>
                  <li>• Itaú Unibanco</li>
                  <li>• Santander</li>
                  <li>• Caixa Econômica Federal</li>
                  <li>• Outros bancos com OFX padrão</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportacaoOFX;