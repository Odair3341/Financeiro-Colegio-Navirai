<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft,
  Building2,
  Link as LinkIcon,
  UnlinkIcon,
  CheckCircle2,
  AlertTriangle,
  Filter,
  Download,
  RefreshCw,
  Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import { financialDataService } from "@/services/financialData";
import { formatDateBR } from "@/lib/dateUtils";
import ModalLancamentoRapido from "@/components/ModalLancamentoRapido";

interface MovimentacaoBanco {
  id: string;
  data: string;
  historico: string;
  valor: number;
  tipo: 'credito' | 'debito';
  conciliado: boolean;
  lancamentoId?: string;
  contaBancariaId?: string;
}

interface LancamentoSistema {
  id: string;
  data: string;
  descricao: string;
  valor: number;
  tipo: 'receita' | 'despesa';
  conciliado: boolean;
  movimentacaoId?: string;
  fornecedor?: string;
  empresa?: string;
  categoria?: string;
  referenciaId?: string;
  origem?: string;
}

const Conciliacao = () => {
  const [contaSelecionada, setContaSelecionada] = useState("all");
  
  // Definir datas padrão como primeiro e último dia do mês atual
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
  
  const [dataInicial, setDataInicial] = useState(primeiroDiaMes.toISOString().split('T')[0]);
  const [dataFinal, setDataFinal] = useState(ultimoDiaMes.toISOString().split('T')[0]);
  const [statusFiltro, setStatusFiltro] = useState("todos");
  const [itemSelecionado, setItemSelecionado] = useState<string | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<'banco' | 'sistema' | null>(null);
  const { toast } = useToast();

  // Estado para contas bancárias reais
<<<<<<< HEAD
  const [contas, setContas] = useState<ContaBancaria[]>([]);
=======
  const [contas, setContas] = useState<any[]>([]);
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92

  // Carregar movimentações bancárias dinamicamente  
  const [movimentacoesBanco, setMovimentacoesBanco] = useState<MovimentacaoBanco[]>([]);
  
  useEffect(() => {
    loadData();
<<<<<<< HEAD
  }, [loadData]);
=======
  }, []);
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92

  // Recarregar dados quando as datas mudarem
  useEffect(() => {
    loadData();
<<<<<<< HEAD
  }, [dataInicial, dataFinal, loadData]);

  const loadData = useCallback(() => {
=======
  }, [dataInicial, dataFinal]);

  const loadData = () => {
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
    // Carregar contas bancárias reais
    const contasReais = financialDataService.getContasBancarias();
    setContas(contasReais);
    
    // Carregar movimentações reais do sistema filtradas por data
    const movimentacoesReais = financialDataService.getMovimentacoesBancarias()
      .filter(mov => {
        const dataMovim = new Date(mov.data);
        const dataIni = new Date(dataInicial);
        const dataFim = new Date(dataFinal);
        return dataMovim >= dataIni && dataMovim <= dataFim;
      });
    const movimentacoesFormatadas: MovimentacaoBanco[] = movimentacoesReais.map(mov => ({
      id: mov.id,
      data: mov.data,
      historico: mov.descricao,
      valor: mov.tipo === 'credito' ? mov.valor : -mov.valor,
      tipo: mov.tipo as 'credito' | 'debito',
      conciliado: false,
      contaBancariaId: mov.contaBancariaId
    }));

    // Carregar lançamentos reais do sistema filtrados por data
    const lancamentosReais = financialDataService.getLancamentosSistema()
      .filter(lanc => {
        const dataLanc = new Date(lanc.data);
        const dataIni = new Date(dataInicial);
        const dataFim = new Date(dataFinal);
        return dataLanc >= dataIni && dataLanc <= dataFim;
      });
    const empresas = financialDataService.getEmpresas();
    const fornecedores = financialDataService.getFornecedores();
    
    console.log('DEBUG: Lançamentos carregados:', lancamentosReais.length);
    console.log('DEBUG: Empresas:', empresas.length);
    console.log('DEBUG: Fornecedores:', fornecedores.length);
    
    const lancamentosFormatados: LancamentoSistema[] = lancamentosReais.map(lanc => {
      // Buscar dados da empresa e fornecedor/cliente
      const empresa = empresas.find(e => e.id === lanc.empresaId);
      // Buscar tanto em fornecedores quanto clientes (usar mesmo array para ambos por agora)
      const fornecedorOuCliente = fornecedores.find(f => f.id === (lanc.fornecedorId || lanc.clienteId));
      
      console.log(`DEBUG: Lançamento ${lanc.id} - Tipo: ${lanc.tipo}, Valor: ${lanc.valor}, Empresa: ${empresa?.nome}, Fornecedor/Cliente: ${fornecedorOuCliente?.nome}`);
      
      return {
        id: lanc.id,
        data: lanc.data,
        descricao: lanc.descricao,
        valor: lanc.valor,
        tipo: lanc.tipo === 'credito' ? 'receita' as const : 'despesa' as const,
        conciliado: false,
        fornecedor: fornecedorOuCliente?.nome || 'Não informado',
        empresa: empresa?.nome || 'Empresa Principal',
        categoria: lanc.categoria || 'Sem categoria',
        referenciaId: lanc.referenciaId,
        origem: lanc.origem
      };
    });

    // Carregar conciliações existentes e marcar itens como conciliados
    const conciliacoes = financialDataService.getConciliacoes();
    
    conciliacoes.forEach(conciliacao => {
      const movIndex = movimentacoesFormatadas.findIndex(m => m.id === conciliacao.movimentacaoId);
      const lancIndex = lancamentosFormatados.findIndex(l => l.id === conciliacao.lancamentoId);
      
      if (movIndex !== -1) {
        movimentacoesFormatadas[movIndex].conciliado = true;
        movimentacoesFormatadas[movIndex].lancamentoId = conciliacao.lancamentoId;
      }
      
      if (lancIndex !== -1) {
        lancamentosFormatados[lancIndex].conciliado = true;
        lancamentosFormatados[lancIndex].movimentacaoId = conciliacao.movimentacaoId;
      }
    });
    
    setMovimentacoesBanco(movimentacoesFormatadas);
    setLancamentosSistema(lancamentosFormatados);
<<<<<<< HEAD
  }, [dataInicial, dataFinal]);
=======
  };
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92

  // Carregar lançamentos do sistema dinamicamente
  const [lancamentosSistema, setLancamentosSistema] = useState<LancamentoSistema[]>([]);

  // Função para garantir que existe pelo menos uma conta bancária
  const garantirContaBancaria = (): string => {
<<<<<<< HEAD
    const contas = financialDataService.getContasBancarias();
=======
    let contas = financialDataService.getContasBancarias();
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
    if (contas.length === 0) {
      // Criar conta principal automaticamente
      const novaConta = financialDataService.saveContaBancaria({
        nome: 'Conta Principal',
        banco: 'Banco Principal',
        agencia: '0001',
        conta: '12345-6',
        tipo: 'corrente',
        saldo: 0,
        ativa: true
      });
      return novaConta.id;
    }
    return contas[0].id;
  };

  // Função para gerar movimento bancário e conciliar automaticamente
  const gerarMovimentoEConciliar = (lancamento: LancamentoSistema) => {
    try {
      // Garantir que existe uma conta bancária
      const contaId = garantirContaBancaria();
      
      // Criar movimentação bancária espelho
      const novaMovimentacao = financialDataService.criarMovimentacaoBancaria({
        contaBancariaId: contaId,
        data: lancamento.data,
        descricao: `Auto: ${lancamento.descricao}`,
        valor: lancamento.valor,
        tipo: lancamento.tipo === 'receita' ? 'credito' : 'debito',
        categoria: lancamento.categoria,
        origem: 'manual'
      });

      // Registrar conciliação imediatamente
      financialDataService.registrarConciliacao({
        movimentacaoId: novaMovimentacao.id,
        lancamentoId: lancamento.id,
        status: 'conciliado',
        dataReconciliacao: new Date().toISOString(),
        observacoes: 'Conciliação automática via geração de movimento bancário'
      });

      // Recarregar dados para refletir as mudanças
      loadData();

      toast({
        title: "Movimento gerado e conciliado!",
        description: "Foi criada uma movimentação bancária automaticamente e conciliada com o lançamento do sistema."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o movimento e conciliar.",
        variant: "destructive"
      });
    }
  };

  const conciliar = (movId: string, lancId: string) => {
    const movimentacao = movimentacoesBanco.find(m => m.id === movId);
    const lancamento = lancamentosSistema.find(l => l.id === lancId);
    
    if (!movimentacao || !lancamento) return;

    // Verificar se algum dos itens já está conciliado
    if (movimentacao.conciliado || lancamento.conciliado) {
      toast({
        title: "Erro na conciliação",
        description: "Um ou ambos os itens já estão conciliados. Desconcilie primeiro antes de fazer uma nova conciliação.",
        variant: "destructive"
      });
      return;
    }

    // Calcular diferença
    const valorMov = Math.abs(movimentacao.valor);
    const valorLanc = lancamento.valor;
    const diferenca = Math.abs(valorMov - valorLanc);

    // Registrar conciliação no serviço
    financialDataService.registrarConciliacao({
      movimentacaoId: movId,
      lancamentoId: lancId,
      status: diferenca === 0 ? 'conciliado' : 'divergente',
      diferenca: diferenca > 0 ? diferenca : undefined,
      dataReconciliacao: new Date().toISOString(),
      observacoes: diferenca > 0 ? `Diferença de R$ ${diferenca.toFixed(2)}` : undefined
    });

    setMovimentacoesBanco(prev => prev.map(mov => 
      mov.id === movId ? { ...mov, conciliado: true, lancamentoId: lancId } : mov
    ));
    
    setLancamentosSistema(prev => prev.map(lanc => 
      lanc.id === lancId ? { ...lanc, conciliado: true, movimentacaoId: movId } : lanc
    ));
    
    setItemSelecionado(null);
    setTipoSelecionado(null);
    
    toast({
      title: "Conciliação realizada!",
      description: diferenca === 0 ? "Itens conciliados com sucesso" : `Conciliado com diferença de R$ ${diferenca.toFixed(2)}`
    });
  };

  const desconciliar = (movId: string, lancId: string) => {
    // Remover conciliação do serviço
    financialDataService.deleteConciliacaoByPair(movId, lancId);

    setMovimentacoesBanco(prev => prev.map(mov => 
      mov.id === movId ? { ...mov, conciliado: false, lancamentoId: undefined } : mov
    ));
    
    setLancamentosSistema(prev => prev.map(lanc => 
      lanc.id === lancId ? { ...lanc, conciliado: false, movimentacaoId: undefined } : lanc
    ));
    
    toast({
      title: "Conciliação desfeita",
      description: "Itens desconciliados com sucesso"
    });
  };

  const conciliacaoAutomatica = () => {
    let conciliados = 0;
    
    const movPendentes = movimentacoesBanco.filter(mov => !mov.conciliado);
    const lancPendentes = lancamentosSistema.filter(lanc => !lanc.conciliado);
    
    console.log('DEBUG: Iniciando conciliação automática');
    console.log('DEBUG: Movimentos pendentes:', movPendentes.length);
    console.log('DEBUG: Lançamentos pendentes:', lancPendentes.length);
    
    // Filtrar movimentos por conta selecionada
    const movimentosParaConciliar = contaSelecionada === "all" ? movPendentes : 
      movPendentes.filter(mov => mov.contaBancariaId === contaSelecionada);
    
    movimentosParaConciliar.forEach(mov => {
      console.log(`DEBUG: Tentando conciliar movimento ${mov.id} - Valor: ${mov.valor}, Data: ${mov.data}`);
      
      const lancCorrespondente = lancPendentes.find(lanc => {
        // Corrigir comparação de valores: usar valor absoluto para ambos
        const valorMovimento = Math.abs(mov.valor);
        const valorLancamento = Math.abs(lanc.valor);
        
        // Adicionar tolerância de R$ 0,05 para pequenas diferenças
        const diferenca = Math.abs(valorMovimento - valorLancamento);
        const valoresCompativeis = diferenca <= 0.05;
        
        // Verificar diferença de data (até 3 dias)
        const diferencaData = Math.abs(new Date(mov.data).getTime() - new Date(lanc.data).getTime());
        const dataCompativel = diferencaData <= 3 * 24 * 60 * 60 * 1000; // 3 dias
        
        console.log(`DEBUG: Comparando com lançamento ${lanc.id} - Valor: ${lanc.valor}, ValoresCompatíveis: ${valoresCompativeis}, DataCompatível: ${dataCompativel}, Diferença: R$ ${diferenca.toFixed(2)}`);
        
        return valoresCompativeis && dataCompativel && !lanc.conciliado;
      });
      
      if (lancCorrespondente) {
        console.log(`DEBUG: Conciliando movimento ${mov.id} com lançamento ${lancCorrespondente.id}`);
        conciliar(mov.id, lancCorrespondente.id);
        conciliados++;
      }
    });
    
    toast({
      title: "Conciliação automática concluída",
      description: `${conciliados} itens foram conciliados automaticamente`
    });
  };

  const movimentacoesFiltradas = movimentacoesBanco.filter(mov => {
    // Filtrar por conta selecionada
    const contaFiltro = contaSelecionada === "all" || mov.contaBancariaId === contaSelecionada;
    
    if (statusFiltro === "conciliados") return mov.conciliado && contaFiltro;
    if (statusFiltro === "pendentes") return !mov.conciliado && contaFiltro;
    return contaFiltro;
  });

  const lancamentosFiltrados = lancamentosSistema.filter(lanc => {
    if (statusFiltro === "conciliados") return lanc.conciliado;
    if (statusFiltro === "pendentes") return !lanc.conciliado;
    return true;
  });

  const totalConciliado = movimentacoesBanco.filter(mov => mov.conciliado).reduce((sum, mov) => sum + Math.abs(mov.valor), 0);
  const totalPendente = movimentacoesBanco.filter(mov => !mov.conciliado).reduce((sum, mov) => sum + Math.abs(mov.valor), 0);
  const taxaConciliacao = ((movimentacoesBanco.filter(mov => mov.conciliado).length / movimentacoesBanco.length) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Conciliação Bancária</h1>
        </div>

        {/* Filtros */}
        <Card className="financial-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Conta Bancária</Label>
                <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as contas</SelectItem>
                    {contas.map(conta => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input 
                  type="date" 
                  value={dataInicial} 
                  onChange={(e) => setDataInicial(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input 
                  type="date" 
                  value={dataFinal} 
                  onChange={(e) => setDataFinal(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="conciliados">Conciliados</SelectItem>
                    <SelectItem value="pendentes">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Conciliado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalConciliado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Valor Pendente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          
          <Card className="financial-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conciliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{taxaConciliacao}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-3">
          <Button onClick={conciliacaoAutomatica} className="gradient-primary text-white">
            <RefreshCw className="h-4 w-4 mr-2" />
            Conciliação Automática
          </Button>
          <ModalLancamentoRapido onSalvo={loadData} />
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>

        {/* Conciliação */}
        {movimentacoesBanco.length === 0 && lancamentosSistema.length > 0 && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Você tem lançamentos no sistema mas nenhuma movimentação bancária. 
              Para fazer a conciliação, você precisa <Link to="/importacao-ofx" className="underline text-primary">importar o arquivo OFX</Link> do seu banco.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movimentações Bancárias */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Extrato Bancário ({movimentacoesFiltradas.length})
              </CardTitle>
              <CardDescription>Movimentações importadas do OFX</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {movimentacoesFiltradas.map(mov => (
                  <div 
                    key={mov.id}
                    className={`conciliacao-item ${mov.conciliado ? 'conciliado' : ''} ${
                      itemSelecionado === mov.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      if (mov.conciliado) return;
                      console.log(`DEBUG: Selecionando movimento bancário ${mov.id}`);
                      setItemSelecionado(mov.id);
                      setTipoSelecionado('banco');
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">{formatDateBR(mov.data)}</div>
                      <div className="flex items-center gap-2">
                        {!mov.conciliado && (
                          <ModalLancamentoRapido 
                            movimentacao={{
                              id: mov.id,
                              data: mov.data,
                              descricao: mov.historico,
                              valor: Math.abs(mov.valor),
                              tipo: mov.tipo
                            }}
                            onSalvo={loadData}
                          />
                        )}
                        {mov.conciliado && (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (mov.lancamentoId) {
                                  desconciliar(mov.id, mov.lancamentoId);
                                }
                              }}
                            >
                              <UnlinkIcon className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Badge variant={mov.tipo === 'credito' ? 'default' : 'secondary'}>
                          {mov.tipo === 'credito' ? '+' : ''}R$ {Math.abs(mov.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Badge>
                      </div>
                    </div>
                    <p className="font-medium">{mov.historico}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lançamentos do Sistema */}
          <Card className="financial-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Lançamentos do Sistema ({lancamentosFiltrados.length})
              </CardTitle>
              <CardDescription>Movimentações registradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lancamentosFiltrados.map(lanc => (
                  <div 
                    key={lanc.id}
                    className={`conciliacao-item ${lanc.conciliado ? 'conciliado' : ''} ${
                      itemSelecionado === lanc.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      if (lanc.conciliado) return;
                      
                      console.log(`DEBUG: Clicou no lançamento ${lanc.id}`);
                      console.log(`DEBUG: Item selecionado: ${itemSelecionado}, Tipo: ${tipoSelecionado}`);
                      
                      if (itemSelecionado && tipoSelecionado === 'banco') {
                        // Conciliar automaticamente com movimento bancário selecionado
                        console.log(`DEBUG: Conciliando movimento ${itemSelecionado} com lançamento ${lanc.id}`);
                        conciliar(itemSelecionado, lanc.id);
                      } else {
                        // Selecionar este lançamento
                        console.log(`DEBUG: Selecionando lançamento ${lanc.id}`);
                        setItemSelecionado(lanc.id);
                        setTipoSelecionado('sistema');
                      }
                    }}
                  >
  
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-muted-foreground">{formatDateBR(lanc.data)}</div>
                      <div className="flex items-center gap-2">
                        {!lanc.conciliado && (
                          <Button
                            size="sm"
                            variant="outline" 
                            className="text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              gerarMovimentoEConciliar(lanc);
                            }}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Gerar & Conciliar
                          </Button>
                        )}
                        {lanc.conciliado && (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (lanc.movimentacaoId) {
                                  desconciliar(lanc.movimentacaoId, lanc.id);
                                }
                              }}
                            >
                              <UnlinkIcon className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Badge variant={lanc.tipo === 'receita' ? 'default' : 'secondary'}>
                          R$ {lanc.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Badge>
                      </div>
                    </div>
                    <p className="font-medium">{lanc.descricao}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span><strong>Empresa:</strong> {lanc.empresa}</span>
                        <span><strong>{lanc.tipo === 'receita' ? 'Cliente' : 'Fornecedor'}:</strong> {lanc.fornecedor}</span>
                        <span><strong>Categoria:</strong> {lanc.categoria}</span>
                      </div>
                      {lanc.origem && (
                        <Badge variant="outline" className="text-xs">
                          {lanc.origem}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instruções */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Como funciona:</strong> Quando você registra recebimentos ou pagamentos no sistema, eles aparecem aqui como "Lançamentos do Sistema". 
            Após importar o OFX, você pode conciliar clicando em um item do extrato bancário e depois no lançamento correspondente do sistema.
          </AlertDescription>
        </Alert>

        {/* Botão para atualizar dados */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => {
              // Recarregar dados do sistema
              const lancamentosReais = financialDataService.getLancamentosSistema();
              const movimentacoesReais = financialDataService.getMovimentacoesBancarias();
              
              // Atualizar estados (manter mocks para demonstração)
              window.location.reload();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Dados
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Conciliacao;