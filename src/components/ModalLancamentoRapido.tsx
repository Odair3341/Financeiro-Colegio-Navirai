import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { financialDataService, Fornecedor, Empresa } from "@/services/financialData";
import { categorizationService } from "@/services/categorizationService";

interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  ativo: boolean;
}

// Função para obter categorias padrão
const getCategorias = (): Categoria[] => {
  const categoriasSalvas = localStorage.getItem('financeflow_categorias');
  if (categoriasSalvas) {
    return JSON.parse(categoriasSalvas).filter((cat: Categoria) => cat.ativo);
  }
  
  // Categorias padrão se não houver salvas
  return [
    { id: '1', nome: 'Energia Elétrica', tipo: 'despesa', cor: '#ef4444', ativo: true },
    { id: '2', nome: 'Telecomunicações', tipo: 'despesa', cor: '#3b82f6', ativo: true },
    { id: '3', nome: 'Água e Saneamento', tipo: 'despesa', cor: '#06b6d4', ativo: true },
    { id: '4', nome: 'Combustível', tipo: 'despesa', cor: '#f59e0b', ativo: true },
    { id: '5', nome: 'Alimentação', tipo: 'despesa', cor: '#10b981', ativo: true },
    { id: '6', nome: 'Material de Escritório', tipo: 'despesa', cor: '#8b5cf6', ativo: true },
    { id: '7', nome: 'Folha de Pagamento', tipo: 'despesa', cor: '#ef4444', ativo: true },
    { id: '8', nome: 'Receita de Serviços', tipo: 'receita', cor: '#10b981', ativo: true },
    { id: '9', nome: 'Transferências', tipo: 'receita', cor: '#3b82f6', ativo: true },
    { id: '10', nome: 'Outras Receitas', tipo: 'receita', cor: '#6b7280', ativo: true },
    { id: '11', nome: 'Outras Despesas', tipo: 'despesa', cor: '#6b7280', ativo: true }
  ];
};

// Remove interface duplicada
interface MovimentacaoBancaria {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'credito' | 'debito';
}

interface ModalLancamentoRapidoProps {
  movimentacao?: MovimentacaoBancaria;
  onSalvo?: () => void;
}

const ModalLancamentoRapido = ({ movimentacao, onSalvo }: ModalLancamentoRapidoProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState("");
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [openFornecedor, setOpenFornecedor] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: movimentacao ? (movimentacao.tipo === 'credito' ? 'receita' : 'despesa') : 'despesa',
    data: movimentacao?.data || new Date().toISOString().split('T')[0],
    valor: movimentacao?.valor?.toString() || '',
    descricao: movimentacao?.descricao || '',
    categoria: '',
    empresa: '',
    fornecedor: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      carregarDados();
    }
  }, [isOpen]);

  const carregarDados = async () => {
    try {
      // Carregar fornecedores, categorias e empresas do serviço correto
      const fornecedoresData = financialDataService.getFornecedores().filter(f => f.ativo);
      const categoriasData = getCategorias();
      const empresasData = financialDataService.getEmpresas().filter(e => e.ativo);
      
      setFornecedores(fornecedoresData);
      setCategorias(categoriasData);
      setEmpresas(empresasData);

      // Selecionar primeira empresa por padrão se houver
      if (empresasData.length > 0 && !formData.empresa) {
        setFormData(prev => ({ ...prev, empresa: empresasData[0].id }));
        setEmpresaSelecionada(empresasData[0].id);
      }

      // Se há movimentação, tentar identificar fornecedor e categoria automaticamente
      if (movimentacao) {
        detectarFornecedorECategoria(movimentacao.descricao, fornecedoresData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const detectarFornecedorECategoria = (descricao: string, fornecedoresDisponiveis: Fornecedor[]) => {
    const tipo = movimentacao?.tipo || 'debito';
    
    // Usar o serviço de categorização para análise inteligente
    const analise = categorizationService.analisarMovimentacao(
      descricao, 
      parseFloat(formData.valor) || 0, 
      tipo, 
      fornecedoresDisponiveis
    );
    
    // Definir categoria automaticamente se identificada
    if (analise.categoria) {
      setFormData(prev => ({ ...prev, categoria: analise.categoria }));
    }

    // Definir fornecedor se encontrado
    if (analise.fornecedorId) {
      setFormData(prev => ({ ...prev, fornecedor: analise.fornecedorId }));
      setFornecedorSelecionado(analise.fornecedorId);
    }
  };

  const categoriasDisponiveis = categorias.filter(cat => 
    (formData.tipo === 'receita' && cat.tipo === 'receita') ||
    (formData.tipo === 'despesa' && cat.tipo === 'despesa')
  );

  const salvarLancamento = () => {
    if (!formData.descricao.trim() || !formData.valor || !formData.empresa) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha a descrição, valor e empresa",
        variant: "destructive"
      });
      return;
    }

    try {
      // Salvar no sistema com dados corretos
      const novoLancamento = financialDataService.criarLancamentoSistema({
        data: formData.data,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        tipo: formData.tipo === 'receita' ? 'credito' : 'debito',
        categoria: formData.categoria || (formData.tipo === 'receita' ? 'Outras Receitas' : 'Outras Despesas'),
        origem: 'manual',
        empresaId: formData.empresa,
        fornecedorId: formData.tipo === 'despesa' ? formData.fornecedor : undefined,
        clienteId: formData.tipo === 'receita' ? formData.fornecedor : undefined
      });

      // Se há movimentação bancária, fazer conciliação automática
      if (movimentacao) {
        const valorMovimentacao = Math.abs(movimentacao.valor);
        const valorLancamento = parseFloat(formData.valor);
        const diferenca = Math.abs(valorMovimentacao - valorLancamento);
        
        financialDataService.registrarConciliacao({
          movimentacaoId: movimentacao.id,
          lancamentoId: novoLancamento.id,
          status: diferenca === 0 ? 'conciliado' : 'divergente',
          diferenca: diferenca > 0 ? diferenca : undefined,
          dataReconciliacao: new Date().toISOString(),
          observacoes: diferenca > 0 ? `Diferença de R$ ${diferenca.toFixed(2)}` : undefined
        });
      }

      toast({
        title: "Lançamento criado!",
        description: `${formData.tipo === 'receita' ? 'Receita' : 'Despesa'} de R$ ${parseFloat(formData.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} registrada${movimentacao ? ' e conciliada' : ''}`
      });

      setIsOpen(false);
      setFormData({
        tipo: 'despesa',
        data: new Date().toISOString().split('T')[0],
        valor: '',
        descricao: '',
        categoria: '',
        empresa: '',
        fornecedor: ''
      });
      setEmpresaSelecionada('');
      setFornecedorSelecionado('');
      
      onSalvo?.();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao criar o lançamento",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {movimentacao ? (
          <Button size="sm" variant="outline">
            <Plus className="h-3 w-3 mr-1" />
            Lançar
          </Button>
        ) : (
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {movimentacao ? 'Lançar Movimentação' : 'Novo Lançamento'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {movimentacao && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Movimentação do Banco:</p>
              <p className="text-xs text-muted-foreground">{movimentacao.descricao}</p>
              <Badge variant={movimentacao.tipo === 'credito' ? 'default' : 'secondary'} className="mt-1">
                {movimentacao.tipo === 'credito' ? '+' : ''}R$ {movimentacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Badge>
            </div>
          )}

          {/* Tipo */}
          <div className="space-y-2">
            <Label>Tipo *</Label>
            <Select 
              value={formData.tipo} 
              onValueChange={(value: 'receita' | 'despesa') => setFormData(prev => ({ ...prev, tipo: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita (+)</SelectItem>
                <SelectItem value="despesa">Despesa (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label>Data *</Label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData(prev => ({ ...prev, data: e.target.value }))}
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label>Valor (R$) *</Label>
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
            <Label>Descrição *</Label>
            <Textarea
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o lançamento..."
              rows={3}
            />
          </div>

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !empresaSelecionada && "text-muted-foreground"
                  )}
                >
                  {empresaSelecionada
                    ? empresas.find((empresa) => empresa.id === empresaSelecionada)?.nome
                    : "Selecione uma empresa..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-background border shadow-md z-50">
                <Command>
                  <CommandInput placeholder="Buscar empresa..." />
                  <CommandList>
                    <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                    <CommandGroup>
                      {empresas.map((empresa) => (
                        <CommandItem
                          key={empresa.id}
                          value={empresa.nome}
                          onSelect={() => {
                            setEmpresaSelecionada(empresa.id);
                            setFormData(prev => ({ ...prev, empresa: empresa.id }));
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              empresaSelecionada === empresa.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {empresa.nome}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select 
              value={formData.categoria} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-md z-50">
                {categoriasDisponiveis.map(categoria => (
                  <SelectItem key={categoria.id} value={categoria.nome}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cliente/Fornecedor */}
          <div className="space-y-2">
            <Label htmlFor="fornecedor">{formData.tipo === 'receita' ? 'Cliente' : 'Fornecedor'}</Label>
            <Popover open={openFornecedor} onOpenChange={setOpenFornecedor}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className={cn(
                    "w-full justify-between",
                    !fornecedorSelecionado && "text-muted-foreground"
                  )}
                >
                  {fornecedorSelecionado
                    ? fornecedores.find((fornecedor) => fornecedor.id === fornecedorSelecionado)?.nome
                    : `Selecione um ${formData.tipo === 'receita' ? 'cliente' : 'fornecedor'}...`}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 bg-background border shadow-md z-50">
                <Command>
                  <CommandInput placeholder={`Buscar ${formData.tipo === 'receita' ? 'cliente' : 'fornecedor'}...`} />
                  <CommandList>
                    <CommandEmpty>Nenhum {formData.tipo === 'receita' ? 'cliente' : 'fornecedor'} encontrado.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value=""
                        onSelect={() => {
                          setFornecedorSelecionado("");
                          setFormData(prev => ({ ...prev, fornecedor: "" }));
                          setOpenFornecedor(false);
                        }}
                      >
                        <Check className="mr-2 h-4 w-4 opacity-0" />
                        Nenhum {formData.tipo === 'receita' ? 'cliente' : 'fornecedor'}
                      </CommandItem>
                      {fornecedores.map((fornecedor) => (
                        <CommandItem
                          key={fornecedor.id}
                          value={fornecedor.nome}
                          onSelect={() => {
                            setFornecedorSelecionado(fornecedor.id);
                            setFormData(prev => ({ ...prev, fornecedor: fornecedor.id }));
                            setOpenFornecedor(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              fornecedorSelecionado === fornecedor.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">{fornecedor.nome}</span>
                            <span className="text-xs text-muted-foreground">
                              {fornecedor.documento}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <Button 
            onClick={salvarLancamento}
            className="w-full gradient-primary text-white"
            disabled={!formData.descricao || !formData.valor || !formData.empresa}
          >
            <Plus className="h-4 w-4 mr-2" />
            Salvar Lançamento
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModalLancamentoRapido;