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
  const [despesasSelecionadas, setDespesasSelecionadas] = useState<Despesa[]>([]);

  useEffect(() => {
    const dadosDespesas = financialDataService.getDespesas();
    setDespesas(dadosDespesas);
    
    if (typeof window !== 'undefined') {
      (window as Window & { debugSincronizar?: () => void }).debugSincronizar = () => {
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

  const handleSelectDespesa = (despesa: Despesa) => {
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

  const testarPagamentoCompleto = () => {
    console.log('🧪 [TESTE] Iniciando teste de pagamento completo')
    
    const despesasDisponiveis = despesas.filter(d => d.status !== 'pago_total')
    if (despesasDisponiveis.length === 0) {
      console.log('❌ [TESTE] Nenhuma despesa disponível para teste')
      return
    }
    
    const despesaTeste = despesasDisponiveis[0]
    console.log('🎯 [TESTE] Despesa selecionada:', despesaTeste)
    
    const pagamentoTeste = {
      despesaId: despesaTeste.id,
      valor: despesaTeste.valor,
      dataPagamento: new Date().toISOString().split('T')[0],
      descricao: `Teste pagamento completo - ${despesaTeste.descricao}`,
      numeroDocumento: `TESTE-${Date.now()}`
    }
    
    console.log('💰 [TESTE] Dados do pagamento:', pagamentoTeste)
    
    try {
      const resultado = financialDataService.registrarPagamento(pagamentoTeste)
      console.log('✅ [TESTE] Pagamento registrado:', resultado)
      
      // Recarregar dados
      setTimeout(() => {
        setDespesas(financialDataService.getDespesas())
        console.log('🔄 [TESTE] Dados recarregados')
      }, 100)
      
    } catch (error) {
      console.error('❌ [TESTE] Erro ao registrar pagamento:', error)
    }
  }

  const testarMultiplosPagamentos = () => {
    console.log('🧪 [TESTE MÚLTIPLOS] Iniciando teste de múltiplos pagamentos')
    
    const despesasDisponiveis = despesas.filter(d => d.status !== 'pago_total')
    if (despesasDisponiveis.length === 0) {
      console.log('❌ [TESTE MÚLTIPLOS] Nenhuma despesa disponível para teste')
      return
    }
    
    const despesaTeste = despesasDisponiveis[0]
    console.log('🎯 [TESTE MÚLTIPLOS] Despesa selecionada:', despesaTeste)
    
    // Dividir o valor em 3 pagamentos
    const valorTotal = despesaTeste.valor
    const pagamento1 = Math.round((valorTotal * 0.4) * 100) / 100
    const pagamento2 = Math.round((valorTotal * 0.3) * 100) / 100
    const pagamento3 = Math.round((valorTotal - pagamento1 - pagamento2) * 100) / 100
    
    console.log('💰 [TESTE MÚLTIPLOS] Valores dos pagamentos:', { pagamento1, pagamento2, pagamento3, total: pagamento1 + pagamento2 + pagamento3 })
    
    const pagamentos = [
      {
        despesaId: despesaTeste.id,
        valor: pagamento1,
        dataPagamento: new Date().toISOString().split('T')[0],
        descricao: `Pagamento 1/3 - ${despesaTeste.descricao}`,
        numeroDocumento: `TESTE-1-${Date.now()}`
      },
      {
        despesaId: despesaTeste.id,
        valor: pagamento2,
        dataPagamento: new Date().toISOString().split('T')[0],
        descricao: `Pagamento 2/3 - ${despesaTeste.descricao}`,
        numeroDocumento: `TESTE-2-${Date.now()}`
      },
      {
        despesaId: despesaTeste.id,
        valor: pagamento3,
        dataPagamento: new Date().toISOString().split('T')[0],
        descricao: `Pagamento 3/3 - ${despesaTeste.descricao}`,
        numeroDocumento: `TESTE-3-${Date.now()}`
      }
    ]
    
    try {
      // Registrar os 3 pagamentos com intervalo
      pagamentos.forEach((pagamento, index) => {
        setTimeout(() => {
          console.log(`💰 [TESTE MÚLTIPLOS] Registrando pagamento ${index + 1}:`, pagamento)
          const resultado = financialDataService.registrarPagamento(pagamento)
          console.log(`✅ [TESTE MÚLTIPLOS] Pagamento ${index + 1} registrado:`, resultado)
          
          // Verificar localStorage após cada pagamento
          const pagamentosNoStorage = JSON.parse(localStorage.getItem('financeflow_pagamentos') || '[]')
          console.log(`📦 [TESTE MÚLTIPLOS] Pagamentos no localStorage após pagamento ${index + 1}:`, pagamentosNoStorage.length)
          console.log(`🔍 [TESTE MÚLTIPLOS] Pagamentos da despesa no storage:`, pagamentosNoStorage.filter(p => p.despesaId === despesaTeste.id))
          
          // Recarregar dados após o último pagamento
          if (index === pagamentos.length - 1) {
            setTimeout(() => {
              setDespesas(financialDataService.getDespesas())
              console.log('🔄 [TESTE MÚLTIPLOS] Dados recarregados após todos os pagamentos')
              
              // Verificação final
              const pagamentosFinal = JSON.parse(localStorage.getItem('financeflow_pagamentos') || '[]')
              const pagamentosDespesaFinal = pagamentosFinal.filter(p => p.despesaId === despesaTeste.id)
              console.log('📊 [TESTE MÚLTIPLOS] VERIFICAÇÃO FINAL:')
              console.log('  - Total de pagamentos no storage:', pagamentosFinal.length)
              console.log('  - Pagamentos da despesa:', pagamentosDespesaFinal.length)
              console.log('  - Soma dos valores:', pagamentosDespesaFinal.reduce((sum, p) => sum + p.valor, 0))
            }, 100)
          }
        }, index * 500) // 500ms entre cada pagamento
      })
      
    } catch (error) {
      console.error('❌ [TESTE MÚLTIPLOS] Erro ao registrar pagamentos:', error)
    }
  }

  const verificarLocalStorage = () => {
    console.log('🔍 [DEBUG STORAGE] Verificando estado do localStorage:')
    
    const pagamentos = JSON.parse(localStorage.getItem('financeflow_pagamentos') || '[]')
    const despesasStorage = JSON.parse(localStorage.getItem('financeflow_despesas') || '[]')
    
    console.log('📦 [DEBUG STORAGE] Total de pagamentos:', pagamentos.length)
    console.log('📦 [DEBUG STORAGE] Total de despesas:', despesasStorage.length)
    
    // Verificar IDs duplicados nas despesas
    const idsVistos = new Set()
    const idsDuplicados = new Set()
    
    despesasStorage.forEach(despesa => {
      if (idsVistos.has(despesa.id)) {
        idsDuplicados.add(despesa.id)
        console.error('🚨 [DUPLICATE ID] ID duplicado encontrado:', despesa.id)
      } else {
        idsVistos.add(despesa.id)
      }
    })
    
    if (idsDuplicados.size > 0) {
      console.error('🚨 [DUPLICATE IDS] Total de IDs duplicados:', idsDuplicados.size)
      console.error('🚨 [DUPLICATE IDS] IDs duplicados:', Array.from(idsDuplicados))
      
      // Mostrar detalhes das despesas com IDs duplicados
      idsDuplicados.forEach(id => {
        const despesasComMesmoId = despesasStorage.filter(d => d.id === id)
        console.error(`🚨 [DUPLICATE ID ${id}] Despesas com mesmo ID:`, despesasComMesmoId)
      })
    } else {
      console.log('✅ [NO DUPLICATES] Nenhum ID duplicado encontrado nas despesas')
    }
    
    console.log('📋 [DEBUG STORAGE] Despesas detalhadas:')
    despesasStorage.forEach((despesa, index) => {
      console.log(`  ${index + 1}. ID: ${despesa.id} | Status: ${despesa.status} | Valor: ${despesa.valor} | Pago: ${despesa.valorPago}`)
    })
    
    console.log('💰 [DEBUG STORAGE] Pagamentos detalhados:')
    pagamentos.forEach((pagamento, index) => {
      console.log(`  ${index + 1}. ID: ${pagamento.id} | DespesaID: ${pagamento.despesaId} | Valor: ${pagamento.valor}`)
    })
    
    // Agrupar pagamentos por despesa
    const pagamentosPorDespesa = pagamentos.reduce((acc, pag) => {
      if (!acc[pag.despesaId]) acc[pag.despesaId] = []
      acc[pag.despesaId].push(pag)
      return acc
    }, {})
    
    console.log('📊 [DEBUG STORAGE] Pagamentos agrupados por despesa:')
    Object.entries(pagamentosPorDespesa).forEach(([despesaId, pags]) => {
      const total = pags.reduce((sum, p) => sum + (typeof p.valor === 'number' ? p.valor : parseFloat(p.valor) || 0), 0)
      console.log(`  DespesaID: ${despesaId} | Pagamentos: ${pags.length} | Total: R$ ${total.toFixed(2)}`)
    })
  }

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
        <button
          onClick={verificarLocalStorage}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🔍 Verificar LocalStorage + IDs
        </button>
        <button
          onClick={() => {
            console.log('🔧 [FIX DUPLICATES] Corrigindo IDs duplicados...')
            financialDataService.fixDuplicateIds()
            const dadosDespesas = financialDataService.getDespesas()
            setDespesas(dadosDespesas)
            console.log('✅ [FIX DUPLICATES] IDs duplicados corrigidos!')
          }}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          🔧 Corrigir IDs Duplicados
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