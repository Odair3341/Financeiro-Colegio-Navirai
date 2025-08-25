import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Plus,
  DollarSign,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  AlertCircle,
  Check
} from "lucide-react";
import { Link } from "react-router-dom";
import { financialDataService, Fornecedor } from "@/services/financialData";
import ModalCliente from "@/components/ModalCliente";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Recebimento {
  id: string;
  data: string;
  valor: number;
  descricao: string;
  categoria: string;
  cliente: string;
  contaBancaria: { id: string; nome: string; };
  conciliado: boolean;
}

const Recebimentos = () => {
  const [formData, setFormData] = useState({
    contaBancariaId: "",
    data: new Date().toISOString().split('T')[0],
    valor: "",
    descricao: "",
    categoria: "",
    cliente: ""
  });
  
  const [contasBancarias, setContasBancarias] = useState<any[]>([]);
  const [lancamentosSistema, setLancamentosSistema] = useState<any[]>([]);
  const [clientes, setClientes] = useState<Fornecedor[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Fornecedor | null>(null);
  const [openCliente, setOpenCliente] = useState(false);
  const { toast } = useToast();

  // Carregar dados reais do serviço
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = () => {
    const contas = financialDataService.getContasBancarias();
    setContasBancarias(contas);
    
    // Carregar fornecedores como clientes
    const fornecedores = financialDataService.getFornecedores();
    setClientes(fornecedores);
    
    const lancamentos = financialDataService.getLancamentosSistema();
    const receitasFormatadas = lancamentos
      .filter(l => l.tipo === 'credito')
      .map(l => ({
        id: l.id,
        data: l.data,
        valor: l.valor,
        descricao: l.descricao,
        categoria: l.categoria,
        cliente: l.numeroDocumento || 'Não informado',
        contaBancaria: { id: '1', nome: 'Sistema' },
        conciliado: false
      }));
    setLancamentosSistema(receitasFormatadas);
  };

  const categorias = [
    "Mensalidades",
    "Vendas",
    "Prestação de Serviços", 
    "Juros e Rendimentos",
    "PIX Recebidos",
    "Outras Receitas"
  ];

  const contasAtivas = contasBancarias.filter(conta => conta.ativa);
  const contaSelecionada = contasAtivas.find(conta => conta.id === formData.contaBancariaId);

  const validarFormulario = () => {
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      toast({
        title: "Erro de validação", 
        description: "Valor deve ser maior que zero",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.descricao.trim()) {
      toast({
        title: "Erro de validação",
        description: "Descrição é obrigatória",
        variant: "destructive"
      });
      return false;
    }

    const dataRecebimento = new Date(formData.data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (dataRecebimento > hoje) {
      toast({
        title: "Data inválida",
        description: "Data do recebimento não pode ser futura",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const salvarRecebimento = () => {
    if (!validarFormulario()) return;

    try {
      // Verificar se uma conta bancária foi selecionada
      if (!formData.contaBancariaId) {
        toast({
          title: "Erro de validação",
          description: "Conta bancária é obrigatória",
          variant: "destructive"
        });
        return;
      }

      // Usar função específica para registrar recebimento
      const novoRecebimento = financialDataService.registrarRecebimento({
        empresaId: '1', // Empresa padrão
        clienteId: clienteSelecionado?.id,
        contaBancariaId: formData.contaBancariaId,
        valor: parseFloat(formData.valor),
        dataRecebimento: formData.data,
        descricao: formData.descricao,
        categoria: formData.categoria || 'Receitas',
        numeroDocumento: clienteSelecionado?.nome || formData.cliente
      });

      // Recarregar dados
      carregarDados();
      
      // Limpar formulário
      setFormData({
        contaBancariaId: "",
        data: new Date().toISOString().split('T')[0],
        valor: "",
        descricao: "",
        categoria: "",
        cliente: ""
      });
      setClienteSelecionado(null);

      toast({
        title: "Recebimento cadastrado!",
        description: `R$ ${parseFloat(formData.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrado com sucesso`
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o recebimento",
        variant: "destructive"
      });
    }
  };

  const totalRecebimentos = lancamentosSistema.reduce((sum, rec) => sum + rec.valor, 0);
  const recebimentosConciliados = lancamentosSistema.filter(rec => rec.conciliado).length;
  const totalRecebimentosCount = lancamentosSistema.length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Recebimentos</h1>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Recebido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRecebimentos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Conciliados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {recebimentosConciliados}/{totalRecebimentosCount}
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {totalRecebimentosCount - recebimentosConciliados}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Novo Recebimento */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Recebimento
              </CardTitle>
              <CardDescription>
                Registre um novo recebimento no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Conta Bancária - OBRIGATÓRIO */}
              <div className="space-y-2">
                <Label htmlFor="conta">Conta Bancária *</Label>
                <Select 
                  value={formData.contaBancariaId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contaBancariaId: value }))}
                >
                  <SelectTrigger className={!formData.contaBancariaId ? "border-red-200" : ""}>
                    <SelectValue placeholder="Selecione uma conta..." />
                  </SelectTrigger>
                  <SelectContent>
                    {contasAtivas.map(conta => (
                      <SelectItem key={conta.id} value={conta.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{conta.nome}</span>
                          <span className="text-xs text-muted-foreground">
                            Ag: {conta.agencia} • Conta: {conta.conta} • Saldo: R$ {conta.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.contaBancariaId && (
                  <p className="text-xs text-red-600">Campo obrigatório</p>
                )}
              </div>

              {contaSelecionada && (
                <Alert>
                  <Building2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{contaSelecionada.nome}</strong><br />
                    {contaSelecionada.banco} • Ag: {contaSelecionada.agencia} • Conta: {contaSelecionada.conta}<br />
                    Saldo atual: R$ {contaSelecionada.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </AlertDescription>
                </Alert>
              )}

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="data">Data do Recebimento *</Label>
                <Input
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor">Valor (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="0,00"
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição/Histórico *</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descreva o recebimento..."
                  rows={3}
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select 
                  value={formData.categoria} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cliente/Empresa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cliente">Cliente/Empresa</Label>
                  <ModalCliente onClienteSalvo={carregarDados} />
                </div>
                <Popover open={openCliente} onOpenChange={setOpenCliente}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCliente}
                      className="w-full justify-between text-left font-normal"
                    >
                      {clienteSelecionado
                        ? clienteSelecionado.nome
                        : "Selecione uma empresa/cliente..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Buscar empresa/cliente..." />
                      <CommandList>
                        <CommandEmpty>
                          <div className="p-4 text-center">
                            <p className="text-sm text-muted-foreground mb-2">Nenhuma empresa encontrada.</p>
                            <p className="text-xs text-muted-foreground">
                              Cadastre empresas como: FACEMS, UNOPAR, CN, CEI, etc.
                            </p>
                          </div>
                        </CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value=""
                            onSelect={() => {
                              setClienteSelecionado(null);
                              setFormData(prev => ({ ...prev, cliente: "" }));
                              setOpenCliente(false);
                            }}
                          >
                            <Check className="mr-2 h-4 w-4 opacity-0" />
                            Nenhum cliente
                          </CommandItem>
                          {clientes.map((cliente) => (
                            <CommandItem
                              key={cliente.id}
                              value={cliente.nome}
                              onSelect={() => {
                                setClienteSelecionado(cliente);
                                setFormData(prev => ({ ...prev, cliente: cliente.nome }));
                                setOpenCliente(false);
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  clienteSelecionado?.id === cliente.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                }`}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{cliente.nome}</span>
                                <span className="text-xs text-muted-foreground">
                                  {cliente.documento}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  Selecione a empresa que fez o pagamento (FACEMS, UNOPAR, CN, CEI, etc.)
                </p>
              </div>

              <Button 
                onClick={salvarRecebimento}
                className="w-full gradient-primary text-white"
                disabled={!formData.valor || !formData.descricao}
              >
                <Plus className="h-4 w-4 mr-2" />
                Salvar Recebimento
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Recebimentos */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle>Recebimentos Recentes</CardTitle>
              <CardDescription>Últimos recebimentos cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lancamentosSistema.map(rec => (
                  <div key={rec.id} className="p-3 border border-border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{rec.data}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={rec.conciliado ? 'default' : 'secondary'}>
                          {rec.conciliado ? 'Conciliado' : 'Pendente'}
                        </Badge>
                        <div className="font-bold text-green-600">
                          R$ {rec.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                    
                    <p className="font-medium mb-1">{rec.descricao}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {rec.cliente || 'Não informado'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {rec.contaBancaria.nome}
                      </div>
                    </div>
                    
                    {rec.categoria && (
                      <Badge variant="outline" className="mt-2">
                        {rec.categoria}
                      </Badge>
                    )}
                  </div>
                ))}
                
                {lancamentosSistema.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="h-8 w-8 mx-auto mb-2" />
                    <p>Nenhum recebimento cadastrado ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Todos os recebimentos devem ter uma conta bancária associada. 
            Após o cadastro, utilize a funcionalidade de conciliação para conferir com o extrato bancário.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default Recebimentos;