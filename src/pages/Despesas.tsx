import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [despesasSelecionadas, setDespesasSelecionadas] = useState<any[]>([]);

  useEffect(() => {
    const dadosDespesas = financialDataService.getDespesas();
    setDespesas(dadosDespesas);
    
    if (typeof window !== 'undefined') {
      (window as any).debugSincronizar = () => {
        financialDataService.sincronizarStatusDespesas()
        const dadosAtualizados = financialDataService.getDespesas()
        setDespesas(dadosAtualizados)
      }
    }
  }, []);

  const calcularStatusConciliacao = (despesaId: string): boolean => {
    return false; 
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

  const handleSelectDespesa = (despesa: any) => {
    setDespesasSelecionadas(prev => 
      prev.find(d => d.id === despesa.id)
        ? prev.filter(d => d.id !== despesa.id)
        : [...prev, despesa]
    );
  };

  const handleSelectAll = () => {
    if (despesasSelecionadas.length === despesasFiltradas.length) {
      setDespesasSelecionadas([]);
    } else {
      setDespesasSelecionadas(despesasFiltradas);
    }
  };

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
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => {
              financialDataService.sincronizarStatusDespesas()
              const dadosDespesas = financialDataService.getDespesas()
              setDespesas(dadosDespesas)
            }}
          >
            <GitMerge className="h-4 w-4" />
            Sincronizar Status
          </Button>
          <Button
            onClick={() => {
              setModalPagamentoAberto(true);
            }}
            disabled={despesasSelecionadas.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            <ArrowDown className="h-4 w-4" />
            Baixar Selecionadas ({despesasSelecionadas.length})
          </Button>
          <ModalLancamentoRapido onSalvo={() => {
            const dadosDespesas = financialDataService.getDespesas();
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
        {/* ... KPIs ... */}
      </div>

      {/* Debug Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={testarPagamentoCompleto}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          🧪 Testar Pagamento Completo
        </button>
        <button
          onClick={testarMultiplosPagamentos}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          🧪 Testar Múltiplos Pagamentos
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 bg-card rounded-lg">
        {/* ... Filtros ... */}
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left">
                  <Checkbox
                    checked={despesasSelecionadas.length === despesasFiltradas.length && despesasFiltradas.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
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
              {despesasFiltradas.map((despesa) => (
                <tr key={despesa.id} className="hover:bg-muted/30">
                  <td className="p-4">
                    <Checkbox
                      checked={despesasSelecionadas.some(d => d.id === despesa.id)}
                      onCheckedChange={() => handleSelectDespesa(despesa)}
                    />
                  </td>
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
                      const status = despesa.status || 'pendente';
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
          setDespesasSelecionadas([]);
        }}
        onSuccess={() => {
          console.log('🔄 [Despesas] onSuccess chamado - atualizando lista de despesas');
          const dadosDespesas = financialDataService.getDespesas();
          console.log('📊 [Despesas] Despesas carregadas:', dadosDespesas.length);
          setDespesas([...dadosDespesas]);
          setDespesasSelecionadas([]);
          console.log('✅ [Despesas] Estado atualizado com novas despesas');
        }}
        despesas={despesasSelecionadas}
      />
    </div>
  );
};

export default Despesas;