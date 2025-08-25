
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Wallet,
  Building2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  GitMerge,
  Trash2,
  ArrowDown
} from "lucide-react";
import { financialDataService } from "@/services/financialData";
import { ModalBaixaDespesa } from "@/components/ModalBaixaDespesa";
import { formatDateBR } from "@/lib/dateUtils";
import ModalLancamentoRapido from "@/components/ModalLancamentoRapido";

const Despesas = () => {
  const [despesas, setDespesas] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [filtroAno, setFiltroAno] = useState("2025");
  const [filtroMes, setFiltroMes] = useState("agosto");
  const [filtroConciliacao, setFiltroConciliacao] = useState("todos");
  const [busca, setBusca] = useState("");
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [despesaSelecionada, setDespesaSelecionada] = useState<any>(null);

  useEffect(() => {
    const dadosDespesas = financialDataService.getDespesas();
    // Adicionar status de conciliação calculado dinamicamente
    const despesasComConciliacao = dadosDespesas.map(despesa => ({
      ...despesa,
      conciliado: calcularStatusConciliacao(despesa.id)
    }));
    setDespesas(despesasComConciliacao);
  }, []);

  // Função para calcular se uma despesa está conciliada
  const calcularStatusConciliacao = (despesaId: string): boolean => {
    try {
      const pagamentos = financialDataService.getPagamentos();
      const lancamentos = financialDataService.getLancamentosSistema();
      const conciliacoes = financialDataService.getConciliacoes();

      // Encontrar pagamentos relacionados a esta despesa
      const pagamentosDespesa = pagamentos.filter(p => p.despesaId === despesaId);
      
      // Para cada pagamento, verificar se há lançamento do sistema correspondente
      for (const pagamento of pagamentosDespesa) {
        const lancamento = lancamentos.find(l => 
          l.origem === 'pagamento' && l.referenciaId === pagamento.id
        );
        
        if (lancamento) {
          // Verificar se este lançamento está conciliado (aceita 'conciliado' e 'divergente')
          const conciliacao = conciliacoes.find(c => 
            c.lancamentoId === lancamento.id && (c.status === 'conciliado' || c.status === 'divergente')
          );
          
          if (conciliacao) {
            return true; // Pelo menos um pagamento está conciliado
          }
        }
      }
      
      return false; // Nenhum pagamento está conciliado
    } catch (error) {
      console.error('Erro ao calcular status de conciliação:', error);
      return false;
    }
  };

  const calcularTotais = () => {
    const receitas = 0;
    const totalDespesas = despesas.reduce((acc, despesa) => acc + (despesa.valor || 0), 0);
    const pendentes = despesas.filter(d => d.status === 'pendente').reduce((acc, despesa) => acc + (despesa.valor || 0), 0);
    const conciliados = despesas.filter(d => d.conciliado).reduce((acc, despesa) => acc + (despesa.valor || 0), 0);
    const naoConciliados = totalDespesas - conciliados;
    
    return {
      receitas,
      despesas: totalDespesas,
      pendentes,
      saldo: receitas - totalDespesas,
      conciliados,
      naoConciliados
    };
  };

  const totais = calcularTotais();

  const anos = ["2023", "2024", "2025"];
  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  const despesasFiltradas = despesas.filter(despesa => {
    const buscaLower = busca.toLowerCase();
    const matchBusca = !busca || 
      despesa.fornecedor?.nome?.toLowerCase().includes(buscaLower) ||
      despesa.descricao?.toLowerCase().includes(buscaLower) ||
      despesa.categoria?.toLowerCase().includes(buscaLower) ||
      despesa.valor?.toString().includes(busca) ||
      despesa.numeroDocumento?.toLowerCase().includes(buscaLower);
      
    const matchTipo = filtroTipo === "todos" || despesa.tipo === filtroTipo;
    const matchStatus = filtroStatus === "todos" || despesa.status === filtroStatus;
    const matchConciliacao = filtroConciliacao === "todos" || 
      (filtroConciliacao === "conciliado" && despesa.conciliado) ||
      (filtroConciliacao === "pendente" && !despesa.conciliado);
    
    return matchBusca && matchTipo && matchStatus && matchConciliacao;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Gestão Financeira</h1>
            <p className="text-muted-foreground">Controle suas receitas, despesas e fornecedores</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <ModalLancamentoRapido onSalvo={() => {
            const dadosDespesas = financialDataService.getDespesas();
            // Recalcular status de conciliação após lançamento rápido
            const despesasComConciliacao = dadosDespesas.map(despesa => ({
              ...despesa,
              conciliado: calcularStatusConciliacao(despesa.id)
            }));
            setDespesas(despesasComConciliacao);
          }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b">
        <Button variant="ghost" className="text-primary border-b-2 border-primary">
          <TrendingUp className="h-4 w-4 mr-2" />
          Transações
        </Button>
        <Button variant="ghost" className="text-muted-foreground">
          <Building2 className="h-4 w-4 mr-2" />
          Fornecedores
        </Button>
      </div>

      {/* KPIs Compactos */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4" />
            <span className="text-xs">Receitas</span>
          </div>
          <p className="text-lg font-bold">R$ {totais.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="h-4 w-4" />
            <span className="text-xs">Despesas</span>
          </div>
          <p className="text-lg font-bold">R$ {totais.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Pendentes</span>
          </div>
          <p className="text-lg font-bold">R$ {totais.pendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4" />
            <span className="text-xs">Saldo</span>
          </div>
          <p className="text-lg font-bold">R$ {totais.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <GitMerge className="h-4 w-4" />
            <span className="text-xs">Conciliados</span>
          </div>
          <p className="text-lg font-bold">R$ {totais.conciliados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="h-4 w-4" />
            <span className="text-xs">Não Conciliados</span>
          </div>
          <p className="text-lg font-bold">R$ {totais.naoConciliados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-card rounded-lg">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por fornecedor, descrição, categoria, valor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-80"
          />
        </div>
        
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            <SelectItem value="receita">Receita</SelectItem>
            <SelectItem value="despesa">Despesa</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="pago">Pago</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filtroAno} onValueChange={setFiltroAno}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {anos.map(ano => (
              <SelectItem key={ano} value={ano}>{ano}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroMes} onValueChange={setFiltroMes}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {meses.map(mes => (
              <SelectItem key={mes} value={mes}>
                {mes.charAt(0).toUpperCase() + mes.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filtroConciliacao} onValueChange={setFiltroConciliacao}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Conciliação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Conciliação</SelectItem>
            <SelectItem value="conciliado">Conciliado</SelectItem>
            <SelectItem value="pendente">Pendente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">FORNECEDOR</th>
                <th className="text-left p-4 font-medium">TIPO</th>
                <th className="text-left p-4 font-medium">VALOR</th>
                <th className="text-left p-4 font-medium">CATEGORIA</th>
                <th className="text-left p-4 font-medium">VENCIMENTO</th>
                <th className="text-left p-4 font-medium">STATUS</th>
                <th className="text-left p-4 font-medium">CONCILIAÇÃO</th>
                <th className="text-left p-4 font-medium">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {despesasFiltradas.map((despesa, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{despesa.fornecedor?.nome || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{despesa.categoria || 'Não categorizado'}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      Despesa
                    </span>
                  </td>
                  <td className="p-4 font-medium">
                    R$ {(despesa.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {despesa.categoria || 'Não categorizado'}
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {despesa.vencimento ? formatDateBR(despesa.vencimento) : '22/08/2025'}
                  </td>
                  <td className="p-4">
                    {(() => {
                      const status = despesa.status || 'pago_total';
                      const statusConfig = {
                        'pendente': { label: 'Pendente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
                        'pago_parcial': { label: 'Pago Parcial', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
                        'pago_total': { label: 'Pago', bgColor: 'bg-green-100', textColor: 'text-green-800' },
                        'vencido': { label: 'Vencido', bgColor: 'bg-red-100', textColor: 'text-red-800' }
                      };
                      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
                      return (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${config.bgColor} ${config.textColor}`}>
                          {config.label}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      despesa.conciliado 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {despesa.conciliado ? 'Conciliado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setDespesaSelecionada(despesa);
                          setModalPagamentoAberto(true);
                        }}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <GitMerge className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ModalBaixaDespesa 
        isOpen={modalPagamentoAberto}
        onClose={() => {
          setModalPagamentoAberto(false);
          setDespesaSelecionada(null);
        }}
        onSuccess={() => {
          const dadosDespesas = financialDataService.getDespesas();
          // Recalcular status de conciliação após pagamento
          const despesasComConciliacao = dadosDespesas.map(despesa => ({
            ...despesa,
            conciliado: calcularStatusConciliacao(despesa.id)
          }));
          setDespesas(despesasComConciliacao);
        }}
        despesa={despesaSelecionada}
      />
    </div>
  );
};

export default Despesas;
