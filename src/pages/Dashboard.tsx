
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
<<<<<<< HEAD
  ArrowRight,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  X
=======
  ArrowRight
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
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
<<<<<<< HEAD
      const totalDespesas = Array.isArray(despesas) ? despesas.reduce((acc, despesa) => acc + despesa.valor, 0) : 0;
      const totalPago = Array.isArray(pagamentos) ? pagamentos.reduce((acc, pag) => acc + pag.valor, 0) : 0;
      const pendentes = totalDespesas - totalPago;
      const saldoBancario = Array.isArray(contas) ? contas.filter(c => c.ativa).reduce((acc, conta) => acc + conta.saldo, 0) : 0;
      const contasAtivas = Array.isArray(contas) ? contas.filter(c => c.ativa).length : 0;
      
      // Dados de conciliação (mock por enquanto)
      const totalMovimentacoes = (Array.isArray(movimentacoes) ? movimentacoes.length : 0) + (Array.isArray(lancamentos) ? lancamentos.length : 0);
=======
      const totalDespesas = despesas.reduce((acc, despesa) => acc + despesa.valor, 0);
      const totalPago = pagamentos.reduce((acc, pag) => acc + pag.valor, 0);
      const pendentes = totalDespesas - totalPago;
      const saldoBancario = contas.filter(c => c.ativa).reduce((acc, conta) => acc + conta.saldo, 0);
      const contasAtivas = contas.filter(c => c.ativa).length;
      
      // Dados de conciliação (mock por enquanto)
      const totalMovimentacoes = movimentacoes.length + lancamentos.length;
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
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
<<<<<<< HEAD
    <main className="container-elegant spacing-lg animate-fade-in">
      {/* TOPO */}
      <div className="glass-morphism-strong shadow-elevated depth-hover card-spacing flex flex-col md:flex-row items-center justify-between section-spacing rounded-3xl">
        <div>
          <h2 className="text-heading-xl font-poppins text-gradient text-shadow">Dashboard Financeiro</h2>
          <p className="text-body-lg font-inter text-muted-foreground mt-2">Visão geral das suas finanças</p>
        </div>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Button 
            variant="destructive" 
            className="flex items-center gap-2 smooth-transition hover-lift px-6 py-3 rounded-xl font-medium" 
            onClick={handleClear}
          >
            <AlertTriangle className="w-4 h-4" />
            Limpar Dados
          </Button>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 smooth-transition hover-scale rounded-xl border-2">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2">
              {years.map(year => (
                <SelectItem key={year} value={year.toString()} className="rounded-lg">{year}</SelectItem>
=======
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
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
<<<<<<< HEAD
            <SelectTrigger className="w-40 smooth-transition hover-scale rounded-xl border-2">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-2">
              {months.map(month => (
                <SelectItem key={month} value={month} className="rounded-lg">
=======
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month}>
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs PRINCIPAIS */}
<<<<<<< HEAD
      <div className="grid-elegant gap-lg mb-12">
        {/* Receita */}
        <div className="modern-card card-success shadow-floating depth-hover card-spacing text-white animate-scale-in relative z-10 rounded-2xl">
          <div className="flex justify-between items-center mb-4">
            <span className="text-caption font-inter opacity-90">Receitas Totais</span>
            <div className="icon-elegant icon-md icon-success">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="text-currency font-poppins text-shadow tracking-tight">
            R$ {dashboardData.receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 text-xs opacity-75">
            <span className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Período atual
            </span>
          </div>
        </div>

        {/* Despesas */}
        <div className="modern-card card-danger shadow-floating depth-hover card-spacing text-white animate-scale-in relative z-10 rounded-2xl" style={{animationDelay: '0.1s'}}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-caption font-inter opacity-90">Despesas Totais</span>
            <div className="icon-elegant icon-md icon-danger">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <p className="text-currency font-poppins text-shadow tracking-tight">
            R$ {dashboardData.despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 text-xs opacity-75">
            <span className="flex items-center gap-1">
              <ArrowRight className="h-3 w-3" />
              Total registrado
            </span>
          </div>
        </div>

        {/* Pagamentos Pendentes */}
        <div className="modern-card card-warning shadow-floating depth-hover card-spacing text-white animate-scale-in relative z-10 rounded-2xl" style={{animationDelay: '0.2s'}}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-caption font-inter opacity-90">Pagamentos Pendentes</span>
            <div className="icon-elegant icon-md icon-warning">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-currency font-poppins text-shadow tracking-tight">
            R$ {dashboardData.pagamentosPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 text-xs opacity-75">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              Aguardando pagamento
            </span>
          </div>
        </div>

        {/* Saldo */}
        <div className="modern-card card-info shadow-floating depth-hover card-spacing text-white animate-scale-in relative z-10 rounded-2xl" style={{animationDelay: '0.3s'}}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-caption font-inter opacity-90">Saldo</span>
            <div className="icon-elegant icon-md icon-info">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <p className="text-currency font-poppins text-shadow tracking-tight">
            {(dashboardData.receitas - dashboardData.despesas) >= 0 ? '' : '-'}R$ {Math.abs(dashboardData.receitas - dashboardData.despesas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-3 text-xs opacity-75">
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Resultado líquido
            </span>
          </div>
=======
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
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
        </div>
      </div>

      {/* SALDOS BANCÁRIOS */}
<<<<<<< HEAD
      <div className="animate-slide-up" style={{animationDelay: '0.4s'}}>
        <h3 className="text-heading-lg font-poppins text-gradient text-shadow mb-6 flex items-center gap-3">
          <div className="icon-elegant icon-lg icon-primary">
            <Wallet className="h-6 w-6" />
          </div>
          Saldos Bancários
        </h3>
        <div className="glass-morphism-light rounded-3xl spacing-lg section-spacing">
          <div className="grid-elegant gap-lg">
            <div className="frosted-glass shadow-medium depth-hover glow-hover card-spacing group rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-caption font-inter text-muted-foreground">Saldo Total Bancário</p>
                <div className="icon-elegant icon-sm icon-success">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <p className="text-currency font-poppins text-cyan-400 text-shadow tracking-tight">
                R$ {dashboardData.saldoBancario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Todas as contas
                </span>
              </div>
            </div>
            <div className="glass-morphism card-spacing group rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-caption font-inter text-muted-foreground">Contas Ativas</p>
                <div className="icon-elegant icon-sm icon-info">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-currency font-poppins text-green-400 text-shadow tracking-tight">{dashboardData.contasAtivas}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Contas em uso
                </span>
              </div>
            </div>
            <div className="glass-morphism p-8 group rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-caption font-inter text-muted-foreground">Investimento</p>
                <div className="icon-elegant icon-sm icon-primary">
                  <BarChart3 className="h-4 w-4" />
                </div>
              </div>
              <p className="text-currency font-poppins text-pink-400 text-shadow tracking-tight">R$ 0,00</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Portfólio atual
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONCILIAÇÃO BANCÁRIA */}
      <div className="animate-slide-up" style={{animationDelay: '0.6s'}}>
        <h3 className="text-heading-lg font-poppins text-gradient text-shadow mb-6 flex items-center gap-3">
          <div className="icon-elegant icon-lg icon-primary">
            <BarChart3 className="h-6 w-6" />
          </div>
          Conciliação Bancária
        </h3>
        <div className="glass-morphism-gradient rounded-3xl spacing-lg">
          <div className="grid-elegant-sm gap-md">
            <div className="frosted-glass shadow-medium depth-hover glow-hover spacing-md group hover:scale-105 transition-all duration-300 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-caption font-inter text-muted-foreground">Total de Transações</p>
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <FileSpreadsheet className="h-4 w-4 text-blue-400" />
                </div>
              </div>
              <p className="text-heading-md font-poppins text-blue-400 text-shadow tracking-tight">{dashboardData.totalTransacoes}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Este mês
                </span>
              </div>
            </div>
            <div className="glass-morphism-colored spacing-md group hover:scale-105 transition-all duration-300 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-caption font-inter text-muted-foreground">Conciliadas</p>
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <GitMerge className="h-4 w-4 text-green-400" />
                </div>
              </div>
              <p className="text-heading-md font-poppins text-green-400 text-shadow tracking-tight">{dashboardData.conciliadas}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Processadas
                </span>
              </div>
            </div>
            <div className="glass-morphism-colored p-6 group hover:scale-105 transition-all duration-300 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-caption font-inter text-muted-foreground">Pendentes</p>
                <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
              </div>
              <p className="text-heading-md font-poppins text-yellow-400 text-shadow tracking-tight">{dashboardData.pendentes}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Aguardando
                </span>
              </div>
            </div>
            <div className="glass-morphism-colored p-6 group hover:scale-105 transition-all duration-300 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <p className="text-caption font-inter text-muted-foreground">Discrepâncias</p>
                <div className="p-2 bg-red-500/20 rounded-lg group-hover:bg-red-500/30 transition-colors">
                  <Upload className="h-4 w-4 text-red-400" />
                </div>
              </div>
              <p className="text-heading-md font-poppins text-red-400 text-shadow tracking-tight">{dashboardData.discrepancias}</p>
              <div className="mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Requer atenção
                </span>
              </div>
            </div>
          </div>
=======
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
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
