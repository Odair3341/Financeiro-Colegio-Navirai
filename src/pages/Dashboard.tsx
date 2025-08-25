
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Wallet, 
  Building2, 
  GitMerge,
  BarChart3,
  FileSpreadsheet,
  Upload,
  Info,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import ImportOFXInstructions from "@/components/ImportOFXInstructions";
import { useToast } from "@/hooks/use-toast";
import { financialDataService } from "@/services/financialData";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("2025");
  const [selectedMonth, setSelectedMonth] = useState("agosto");
  const [dashboardData, setDashboardData] = useState({
    receitas: 0,
    despesas: 0,
    pagamentosPendentes: 0,
    saldoBancario: 0,
    contasAtivas: 0,
    totalTransacoes: 0,
    conciliadas: 0,
    pendentes: 0,
    discrepancias: 0
  });

  // Carregar dados do dashboard
  const loadDashboardData = () => {
    try {
      const despesas = financialDataService.getDespesas();
      const contas = financialDataService.getContasBancarias();
      const pagamentos = financialDataService.getPagamentos();
      const movimentacoes = financialDataService.getMovimentacoesBancarias();
      const lancamentos = financialDataService.getLancamentosSistema();
      
      // Calcular valores
      const totalDespesas = despesas.reduce((acc, despesa) => acc + despesa.valor, 0);
      const totalPago = pagamentos.reduce((acc, pag) => acc + pag.valor, 0);
      const pendentes = totalDespesas - totalPago;
      const saldoBancario = contas.filter(c => c.ativa).reduce((acc, conta) => acc + conta.saldo, 0);
      const contasAtivas = contas.filter(c => c.ativa).length;
      
      // Dados de conciliação (mock por enquanto)
      const totalMovimentacoes = movimentacoes.length + lancamentos.length;
      const conciliadas = Math.floor(totalMovimentacoes * 0.3); // 30% conciliadas
      const pendentesConc = totalMovimentacoes - conciliadas;
      const discrepancias = Math.floor(totalMovimentacoes * 0.1); // 10% com discrepância
      
      setDashboardData({
        receitas: 0, // Por enquanto não temos receitas
        despesas: totalDespesas,
        pagamentosPendentes: pendentes,
        saldoBancario,
        contasAtivas,
        totalTransacoes: totalMovimentacoes,
        conciliadas,
        pendentes: pendentesConc,
        discrepancias
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  };

  const handleClear = () => {
    try {
      // Usar o serviço para garantir limpeza completa
      financialDataService.clearAllData();
      
      // Atualizar dados do dashboard
      setDashboardData({
        receitas: 0,
        despesas: 0,
        pagamentosPendentes: 0,
        saldoBancario: 0,
        contasAtivas: 0,
        totalTransacoes: 0,
        conciliadas: 0,
        pendentes: 0,
        discrepancias: 0
      });
      
      toast({ 
        title: "Dados limpos com sucesso", 
        description: "Todos os dados foram removidos do sistema." 
      });
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      toast({ 
        title: "Erro", 
        description: "Ocorreu um erro ao limpar os dados.",
        variant: "destructive"
      });
    }
  };

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const months = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  return (
    <main className="p-8">
      {/* TOPO */}
      <div className="bg-card p-6 rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-primary">Dashboard Financeiro</h2>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <Button variant="destructive" className="flex items-center gap-2" onClick={handleClear}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Limpar Dados
          </Button>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {/* Receita */}
        <div 
          className="p-6 rounded-xl shadow-lg hover:scale-105 transition text-white" 
          style={{ background: 'var(--gradient-success)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm">Receitas Totais</span>
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-2">
            R$ {dashboardData.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Despesas */}
        <div 
          className="p-6 rounded-xl shadow-lg hover:scale-105 transition text-white"
          style={{ background: 'var(--gradient-danger)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm">Despesas Totais</span>
            <TrendingDown className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-2">
            R$ {dashboardData.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Pagamentos Pendentes */}
        <div 
          className="p-6 rounded-xl shadow-lg hover:scale-105 transition text-white"
          style={{ background: 'var(--gradient-warning)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm">Pagamentos Pendentes</span>
            <Clock className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-2">
            R$ {dashboardData.pagamentosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Saldo */}
        <div 
          className="p-6 rounded-xl shadow-lg hover:scale-105 transition text-white"
          style={{ background: 'var(--gradient-info)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm">Saldo</span>
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold mt-2">
            {(dashboardData.receitas - dashboardData.despesas) >= 0 ? '' : '-'}R$ {Math.abs(dashboardData.receitas - dashboardData.despesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* SALDOS BANCÁRIOS */}
      <h3 className="text-xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5" />
        Saldos Bancários
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-card p-6 rounded-xl shadow-md">
          <p className="text-muted-foreground text-sm">Saldo Total Bancário</p>
          <p className="text-2xl font-bold text-cyan-400">
            R$ {dashboardData.saldoBancario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md">
          <p className="text-muted-foreground text-sm">Contas Ativas</p>
          <p className="text-2xl font-bold text-green-400">{dashboardData.contasAtivas}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md">
          <p className="text-muted-foreground text-sm">Investimento</p>
          <p className="text-2xl font-bold text-pink-400">R$ 0,00</p>
        </div>
      </div>


      {/* CONCILIAÇÃO */}
      <h3 className="text-xl font-bold text-pink-400 mb-4 flex items-center gap-2">
        <GitMerge className="h-5 w-5" />
        Conciliação Bancária
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-md">
          <p className="text-muted-foreground text-sm">Total de Transações</p>
          <p className="text-2xl font-bold">{dashboardData.totalTransacoes}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md">
          <p className="text-muted-foreground text-sm">Conciliadas</p>
          <p className="text-2xl font-bold text-green-400">{dashboardData.conciliadas}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md">
          <p className="text-muted-foreground text-sm">Pendentes</p>
          <p className="text-2xl font-bold text-yellow-400">{dashboardData.pendentes}</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-md">
          <p className="text-muted-foreground text-sm">Discrepâncias</p>
          <p className="text-2xl font-bold text-red-400">{dashboardData.discrepancias}</p>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
