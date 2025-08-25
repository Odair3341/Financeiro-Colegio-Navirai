import { v4 as uuidv4 } from 'uuid';
import { FinancialDataAdapter } from './financialDataAdapter';

// Tipos principais do sistema financeiro
export interface ContaBancaria {
  id: string
  nome: string
  banco: string
  agencia: string
  conta: string
  tipo: 'corrente' | 'poupanca' | 'aplicacao'
  saldo: number
  ativa: boolean
  createdAt: string
  updatedAt: string
}

export interface Empresa {
  id: string
  nome: string
  documento: string
  tipo: 'pf' | 'pj'
  email?: string
  telefone?: string
  endereco?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface Fornecedor {
  id: string
  nome: string
  documento: string
  tipo: 'pf' | 'pj'
  email?: string
  telefone?: string
  endereco?: string
  ativo: boolean
  createdAt: string
  updatedAt: string
}

export interface Despesa {
  id: string
  empresaId: string
  empresa?: Empresa
  fornecedorId: string
  fornecedor?: Fornecedor
  descricao: string
  valor: number
  vencimento: string
  categoria: string
  status: 'pendente' | 'pago_parcial' | 'pago_total' | 'vencido'
  valorPago: number
  observacoes?: string
  numeroDocumento?: string
  createdAt: string
  updatedAt: string
}

export interface Pagamento {
  id: string
  despesaId: string
  contaBancariaId: string
  valor: number
  dataPagamento: string
  descricao: string
  numeroDocumento?: string
  createdAt: string
}

export interface Recebimento {
  id: string
  empresaId: string
  clienteId?: string
  contaBancariaId: string
  valor: number
  dataRecebimento: string
  descricao: string
  categoria: string
  numeroDocumento?: string
  createdAt: string
}

export interface MovimentacaoBancaria {
  id: string
  contaBancariaId: string
  data: string
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria?: string
  numeroDocumento?: string
  origem: 'ofx' | 'manual'
  createdAt: string
}

export interface LancamentoSistema {
  id: string
  data: string
  descricao: string
  valor: number
  tipo: 'debito' | 'credito'
  categoria: string
  origem: 'pagamento' | 'recebimento' | 'manual'
  referenciaId?: string // ID do pagamento ou recebimento
  numeroDocumento?: string
  empresaId?: string // ID da empresa que fez o lançamento
  fornecedorId?: string // ID do fornecedor (para despesas)
  clienteId?: string // ID do cliente (para receitas)
  createdAt: string
}

export interface Conciliacao {
  id: string
  movimentacaoId: string
  lancamentoId: string
  status: 'conciliado' | 'divergente'
  diferenca?: number
  observacoes?: string
  dataReconciliacao: string
  createdAt: string
}

// Dados mock para desenvolvimento
const mockContasBancarias: ContaBancaria[] = [
  {
    id: '1',
    nome: 'Conta Principal',
    banco: 'Banco do Brasil',
    agencia: '1234-5',
    conta: '12345-6',
    tipo: 'corrente',
    saldo: 15420.50,
    ativa: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-08-15T10:30:00Z'
  },
  {
    id: '2',
    nome: 'Conta Reserva',
    banco: 'Itaú',
    agencia: '5678',
    conta: '98765-4',
    tipo: 'poupanca',
    saldo: 50000.00,
    ativa: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-08-15T10:30:00Z'
  }
]

const mockFornecedores: Fornecedor[] = [
  {
    id: '1',
    nome: 'Fornecedor ABC Ltda',
    documento: '12.345.678/0001-90',
    tipo: 'pj',
    email: 'contato@abc.com.br',
    telefone: '(11) 1234-5678',
    endereco: 'Rua das Flores, 123 - São Paulo/SP',
    ativo: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-08-15T10:30:00Z'
  },
  {
    id: '2',
    nome: 'João Silva',
    documento: '123.456.789-00',
    tipo: 'pf',
    email: 'joao@email.com',
    telefone: '(11) 9876-5432',
    ativo: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-08-15T10:30:00Z'
  },
  {
    id: '3',
    nome: 'TechSoft Sistemas',
    documento: '98.765.432/0001-10',
    tipo: 'pj',
    email: 'financeiro@techsoft.com.br',
    telefone: '(11) 2222-3333',
    endereco: 'Av. Tecnologia, 456 - São Paulo/SP',
    ativo: true,
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-08-15T10:30:00Z'
  }
]

const mockDespesas: Despesa[] = [
  {
    id: '1',
    empresaId: '1', // Empresa padrão
    fornecedorId: '1',
    descricao: 'Fornecimento de materiais de escritório',
    valor: 2500.00,
    vencimento: '2024-08-25',
    categoria: 'Materiais',
    status: 'pendente',
    valorPago: 0,
    numeroDocumento: 'NF-001234',
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-08-01T00:00:00Z'
  },
  {
    id: '2',
    empresaId: '1', // Empresa padrão
    fornecedorId: '2',
    descricao: 'Consultoria em TI',
    valor: 5000.00,
    vencimento: '2024-08-20',
    categoria: 'Serviços',
    status: 'pago_parcial',
    valorPago: 2000.00,
    numeroDocumento: 'REC-5678',
    createdAt: '2024-08-05T00:00:00Z',
    updatedAt: '2024-08-15T00:00:00Z'
  },
  {
    id: '3',
    empresaId: '1', // Empresa padrão
    fornecedorId: '3',
    descricao: 'Licença de software anual',
    valor: 12000.00,
    vencimento: '2024-08-30',
    categoria: 'Software',
    status: 'pendente',
    valorPago: 0,
    numeroDocumento: 'LIC-2024',
    createdAt: '2024-08-10T00:00:00Z',
    updatedAt: '2024-08-10T00:00:00Z'
  },
  {
    id: '4',
    empresaId: '1', // Empresa padrão
    fornecedorId: '1',
    descricao: 'Manutenção predial',
    valor: 1500.00,
    vencimento: '2024-08-15',
    categoria: 'Manutenção',
    status: 'vencido',
    valorPago: 0,
    numeroDocumento: 'OS-789',
    createdAt: '2024-07-20T00:00:00Z',
    updatedAt: '2024-07-20T00:00:00Z'
  }
]

// Serviços de dados (usando localStorage para persistência)
class FinancialDataService {
  private idCounter: number = 0;
  private adapter: FinancialDataAdapter;

  constructor() {
    this.adapter = new FinancialDataAdapter();
    // Garantir que exista pelo menos uma empresa padrão
    this.ensureDefaultEmpresa()
    // Popular dados de teste
    this.popularDadosTeste()
  }

  private generateUniqueId(): string {
    const timestamp = Date.now();
    this.idCounter = (this.idCounter + 1) % 10000; // Increased to 10000 to reduce collision chance
    const randomSuffix = Math.floor(Math.random() * 1000); // Add random component
    return `${timestamp}_${this.idCounter}_${randomSuffix}`;
  }

  private ensureDefaultEmpresa(): void {
    const empresas = this.getEmpresas()
    if (empresas.length === 0) {
      this.saveEmpresa({
        nome: 'Empresa Principal',
        documento: '00.000.000/0001-00',
        tipo: 'pj',
        email: 'contato@empresa.com.br',
        telefone: '(67) 3333-3333',
        endereco: 'Endereço da empresa principal',
        ativo: true
      })
    }
  }

  private getStorageKey(entity: string): string {
    return `financeflow_${entity}`
  }

  private loadFromStorage<T>(entity: string, defaultData: T[]): T[] {
    const stored = localStorage.getItem(this.getStorageKey(entity))
    return stored ? JSON.parse(stored) : defaultData
  }

  private saveToStorage<T>(entity: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(data))
  }

  // Contas Bancárias
  getContasBancarias(): ContaBancaria[] {
    return this.adapter.getContasBancariasSync();
  }

  async getContasBancariasAsync(): Promise<ContaBancaria[]> {
    return await this.adapter.getContasBancarias();
  }

  saveContaBancaria(conta: Omit<ContaBancaria, 'id' | 'createdAt' | 'updatedAt'>): ContaBancaria {
    // Para compatibilidade, retornamos uma promessa resolvida
    const result = this.adapter.saveContaBancaria(conta);
    
    // Para uso síncrono, criamos um objeto temporário
    const tempConta: ContaBancaria = {
      ...conta,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return tempConta;
  }

  async saveContaBancariaAsync(conta: Omit<ContaBancaria, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContaBancaria> {
    return await this.adapter.saveContaBancaria(conta);
  }

  updateContaBancaria(id: string, updates: Partial<ContaBancaria>): ContaBancaria | null {
    // Para compatibilidade síncrona, buscamos do cache
    const contas = this.adapter.getContasBancariasSync();
    const conta = contas.find(c => c.id === id);
    
    if (!conta) return null;
    
    // Executar atualização assíncrona em background
    this.adapter.updateContaBancaria(id, updates);
    
    // Retornar objeto atualizado para compatibilidade
    return { ...conta, ...updates, updatedAt: new Date().toISOString() };
  }

  async updateContaBancariaAsync(id: string, updates: Partial<ContaBancaria>): Promise<ContaBancaria | null> {
    return await this.adapter.updateContaBancaria(id, updates);
  }

  deleteContaBancaria(id: string): boolean {
    // Executar deleção assíncrona em background
    this.adapter.deleteContaBancaria(id);
    return true;
  }

  async deleteContaBancariaAsync(id: string): Promise<boolean> {
    return await this.adapter.deleteContaBancaria(id);
  }

  // Empresas (Sistema independente)
  getEmpresas(): Empresa[] {
    return this.loadFromStorage('empresas', [])
  }

  saveEmpresa(empresa: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>): Empresa {
    const empresas = this.getEmpresas()
    const newEmpresa: Empresa = {
      ...empresa,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    empresas.push(newEmpresa)
    this.saveToStorage('empresas', empresas)
    return newEmpresa
  }

  updateEmpresa(id: string, updates: Partial<Empresa>): Empresa | null {
    const empresas = this.getEmpresas()
    const index = empresas.findIndex(e => e.id === id)
    if (index === -1) return null
    
    empresas[index] = { ...empresas[index], ...updates, updatedAt: new Date().toISOString() }
    this.saveToStorage('empresas', empresas)
    return empresas[index]
  }

  deleteEmpresa(id: string): boolean {
    const empresas = this.getEmpresas()
    const filtered = empresas.filter(e => e.id !== id)
    if (filtered.length === empresas.length) return false
    
    this.saveToStorage('empresas', filtered)
    return true
  }

  // Fornecedores
  getFornecedores(): Fornecedor[] {
    return this.adapter.getFornecedoresSync();
  }

  async getFornecedoresAsync(): Promise<Fornecedor[]> {
    return await this.adapter.getFornecedores();
  }

  saveFornecedor(fornecedor: Omit<Fornecedor, 'id' | 'createdAt' | 'updatedAt'>): Fornecedor {
    // Para compatibilidade, executamos assíncrono em background
    this.adapter.saveFornecedor(fornecedor);
    
    // Retornar objeto temporário para compatibilidade síncrona
    const tempFornecedor: Fornecedor = {
      ...fornecedor,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return tempFornecedor;
  }

  async saveFornecedorAsync(fornecedor: Omit<Fornecedor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fornecedor> {
    return await this.adapter.saveFornecedor(fornecedor);
  }

  updateFornecedor(id: string, updates: Partial<Fornecedor>): Fornecedor | null {
    const fornecedores = this.adapter.getFornecedoresSync();
    const fornecedor = fornecedores.find(f => f.id === id);
    
    if (!fornecedor) return null;
    
    // Executar atualização assíncrona em background
    this.adapter.updateFornecedor(id, updates);
    
    // Retornar objeto atualizado para compatibilidade
    return { ...fornecedor, ...updates, updatedAt: new Date().toISOString() };
  }

  async updateFornecedorAsync(id: string, updates: Partial<Fornecedor>): Promise<Fornecedor | null> {
    return await this.adapter.updateFornecedor(id, updates);
  }

  deleteFornecedor(id: string): boolean {
    // Executar deleção assíncrona em background
    this.adapter.deleteFornecedor(id);
    return true;
  }

  async deleteFornecedorAsync(id: string): Promise<boolean> {
    return await this.adapter.deleteFornecedor(id);
  }

  // Despesas
  getDespesas(): Despesa[] {
    return this.adapter.getDespesasSync();
  }

  async getDespesasAsync(): Promise<Despesa[]> {
    return await this.adapter.getDespesas();
  }

  saveDespesa(despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>): Despesa {
    // Para compatibilidade, executamos assíncrono em background
    this.adapter.saveDespesa(despesa);
    
    // Retornar objeto temporário para compatibilidade síncrona
    const tempDespesa: Despesa = {
      ...despesa,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return tempDespesa;
  }

  async saveDespesaAsync(despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Despesa> {
    return await this.adapter.saveDespesa(despesa);
  }

  updateDespesa(id: string, updates: Partial<Despesa>): Despesa | null {
    const despesas = this.adapter.getDespesasSync();
    const despesa = despesas.find(d => d.id === id);
    
    if (!despesa) return null;
    
    // Executar atualização assíncrona em background
    this.adapter.updateDespesa(id, updates);
    
    // Retornar objeto atualizado para compatibilidade
    return { ...despesa, ...updates, updatedAt: new Date().toISOString() };
  }

  async updateDespesaAsync(id: string, updates: Partial<Despesa>): Promise<Despesa | null> {
    return await this.adapter.updateDespesa(id, updates);
  }

  deleteDespesa(id: string): boolean {
    // Executar deleção assíncrona em background
    this.adapter.deleteDespesa(id);
    return true;
  }

  async deleteDespesaAsync(id: string): Promise<boolean> {
    return await this.adapter.deleteDespesa(id);
  }

  // Pagamentos
  getPagamentos(): Pagamento[] {
    return this.adapter.getPagamentos() as Pagamento[]; // Temporário para compatibilidade
  }

  async getPagamentosAsync(): Promise<Pagamento[]> {
    return await this.adapter.getPagamentos();
  }

  savePagamento(pagamento: Omit<Pagamento, 'id' | 'createdAt'>): Pagamento {
    // Para compatibilidade, executamos assíncrono em background
    this.adapter.savePagamento(pagamento);
    
    // Retornar objeto temporário para compatibilidade síncrona
    const tempPagamento: Pagamento = {
      ...pagamento,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString()
    };
    
    return tempPagamento;
  }

  async savePagamentoAsync(pagamento: Omit<Pagamento, 'id' | 'createdAt'>): Promise<Pagamento> {
    return await this.adapter.savePagamento(pagamento);
  }

  // Recebimentos
  getRecebimentos(): Recebimento[] {
    return this.loadFromStorage('recebimentos', [])
  }

  registrarPagamento(pagamento: Omit<Pagamento, 'id' | 'createdAt'>): Pagamento {
    console.log('🔄 Iniciando registrarPagamento:', pagamento)
    
    const pagamentos = this.getPagamentos()
    const newPagamento: Pagamento = {
      ...pagamento,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString()
    }
    pagamentos.push(newPagamento)
    this.saveToStorage('pagamentos', pagamentos)
    console.log('💾 Pagamento salvo no localStorage:', newPagamento)

    // Verificar se o pagamento foi realmente salvo
    const pagamentosSalvos = this.getPagamentos()
    console.log('📋 Total de pagamentos após salvar:', pagamentosSalvos.length)
    console.log('🔍 Pagamentos da despesa:', pagamentosSalvos.filter(p => p.despesaId === pagamento.despesaId))

    // Atualizar status da despesa
    console.log('🔄 Chamando atualizarStatusDespesa para:', pagamento.despesaId)
    this.atualizarStatusDespesa(pagamento.despesaId)

    // Verificar se o status foi atualizado
    const despesaAtualizada = this.getDespesas().find(d => d.id === pagamento.despesaId)
    console.log('📊 Despesa após atualização:', despesaAtualizada)


    // Buscar dados da despesa para enriquecer o lançamento
    const despesa = this.getDespesas().find(d => d.id === pagamento.despesaId)

    // Criar lançamento no sistema com dados enriched
    this.criarLancamentoSistema({
      data: pagamento.dataPagamento,
      descricao: `Pagamento: ${pagamento.descricao}`,
      valor: pagamento.valor,
      tipo: 'debito',
      categoria: 'Pagamento',
      origem: 'pagamento',
      referenciaId: newPagamento.id,
      numeroDocumento: pagamento.numeroDocumento,
      empresaId: despesa?.empresaId,
      fornecedorId: despesa?.fornecedorId
    })

    return newPagamento
  }

  registrarRecebimento(recebimento: Omit<Recebimento, 'id' | 'createdAt'>): Recebimento {
    const recebimentos = this.getRecebimentos()
    const newRecebimento: Recebimento = {
      ...recebimento,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString()
    }
    recebimentos.push(newRecebimento)
    this.saveToStorage('recebimentos', recebimentos)

    // Criar lançamento no sistema
    this.criarLancamentoSistema({
      data: recebimento.dataRecebimento,
      descricao: `Recebimento: ${recebimento.descricao}`,
      valor: recebimento.valor,
      tipo: 'credito',
      categoria: recebimento.categoria,
      origem: 'recebimento',
      referenciaId: newRecebimento.id,
      numeroDocumento: recebimento.numeroDocumento,
      empresaId: recebimento.empresaId,
      clienteId: recebimento.clienteId
    })

    return newRecebimento
  }

  // Função para popular dados de teste
  popularDadosTeste(): void {
    // Adicionar fornecedor ENERGISA se não existir
    const fornecedores = this.getFornecedores()
    if (!fornecedores.find(f => f.nome === 'ENERGISA')) {
      this.saveFornecedor({
        nome: 'ENERGISA',
        documento: '33.000.167/0001-20',
        tipo: 'pj',
        email: 'contato@energisa.com.br',
        telefone: '(67) 3000-0000',
        ativo: true
      })
    }
    
    if (!fornecedores.find(f => f.nome === 'PAPELARIA PROGRESSO')) {
      this.saveFornecedor({
        nome: 'PAPELARIA PROGRESSO',
        documento: '01.234.567/0001-89',
        tipo: 'pj',
        email: 'contato@papelariaprogresso.com.br',
        telefone: '(67) 3333-3333',
        ativo: true
      })
    }
    
    // Adicionar conta bancária se não existir
    const contas = this.getContasBancarias()
    if (contas.length === 0) {
      this.saveContaBancaria({
        nome: 'Conta Principal',
        banco: 'Banco do Brasil',
        agencia: '1234-5',
        conta: '12345-6',
        tipo: 'corrente',
        saldo: 15420.50,
        ativa: true
      })
    }
    
    // Adicionar despesas de teste
    const despesas = this.getDespesas()
    if (despesas.length === 0) {
      const fornecedorEnergisa = this.getFornecedores().find(f => f.nome === 'ENERGISA')
      const fornecedorPapelaria = this.getFornecedores().find(f => f.nome === 'PAPELARIA PROGRESSO')
      const empresa = this.getEmpresas()[0]
      
      if (fornecedorEnergisa && empresa) {
        this.saveDespesa({
          empresaId: empresa.id,
          fornecedorId: fornecedorEnergisa.id,
          descricao: 'Pagamento - energia elétrica',
          valor: 136.53,
          vencimento: '2025-08-24',
          categoria: 'Diversos',
          status: 'pendente',
          valorPago: 0,
          numeroDocumento: 'ENERGISA-001'
        })
        
        this.saveDespesa({
          empresaId: empresa.id,
          fornecedorId: fornecedorEnergisa.id,
          descricao: 'Pagamento - energia elétrica',
          valor: 2871.42,
          vencimento: '2025-08-24',
          categoria: 'Diversos',
          status: 'pendente',
          valorPago: 0,
          numeroDocumento: 'ENERGISA-002'
        })
      }
      
      if (fornecedorPapelaria && empresa) {
        this.saveDespesa({
          empresaId: empresa.id,
          fornecedorId: fornecedorPapelaria.id,
          descricao: 'Material de escritório',
          valor: 551.39,
          vencimento: '2025-08-24',
          categoria: 'Diversos',
          status: 'pendente',
          valorPago: 0,
          numeroDocumento: 'PAP-001'
        })
      }
    }
  }

  // Função para sincronizar status de todas as despesas
  sincronizarStatusDespesas(): void {
    const despesasRaw = this.loadFromStorage('despesas', [])
    
    despesasRaw.forEach((despesa) => {
      this.atualizarStatusDespesa(despesa.id)
    })
  }

  private atualizarStatusDespesa(despesaId: string): void {
    console.log('🔄 [atualizarStatusDespesa] Iniciando atualização para despesa:', despesaId)
    
    // Usar dados raw para evitar problemas
    const despesasRaw = this.loadFromStorage('despesas', [])
    const pagamentos = this.getPagamentos()
    
    console.log('📋 [atualizarStatusDespesa] Total de despesas raw:', despesasRaw.length)
    console.log('💰 [atualizarStatusDespesa] Total de pagamentos:', pagamentos.length)
    
    const despesa = despesasRaw.find(d => d.id === despesaId)
    if (!despesa) {
      console.log('❌ [atualizarStatusDespesa] Despesa não encontrada:', despesaId)
      return
    }
    
    console.log('📄 [atualizarStatusDespesa] Despesa encontrada:', despesa)

    const pagamentosDespesa = pagamentos.filter(p => p.despesaId === despesaId)
    console.log('💳 [atualizarStatusDespesa] Pagamentos da despesa:', pagamentosDespesa.length)
    console.log('💳 [atualizarStatusDespesa] DETALHES DOS PAGAMENTOS:')
    pagamentosDespesa.forEach((pag, index) => {
      console.log(`  💵 Pagamento ${index + 1}:`, {
        id: pag.id,
        valor: pag.valor,
        data: pag.dataPagamento,
        descricao: pag.descricao
      })
    })
    
    // Garantir arredondamento correto para evitar problemas de ponto flutuante
    let totalCalculado = 0
    const totalPago = Math.round(pagamentosDespesa.reduce((total, p) => {
      const valor = typeof p.valor === 'number' ? p.valor : parseFloat(p.valor) || 0
      totalCalculado += valor
      console.log(`💵 [atualizarStatusDespesa] Somando pagamento ${p.id}: ${valor} (Total acumulado: ${totalCalculado})`)
      return total + valor
    }, 0) * 100) / 100
    
    const valorDespesa = Math.round((typeof despesa.valor === 'number' ? despesa.valor : parseFloat(despesa.valor) || 0) * 100) / 100
    
    console.log('💰 [atualizarStatusDespesa] Total pago calculado:', totalPago)
    console.log('💰 [atualizarStatusDespesa] Valor da despesa:', valorDespesa)
    console.log('📊 [atualizarStatusDespesa] Status atual:', despesa.status)
    
    // Debug detalhado da comparação
    console.log('🔍 [atualizarStatusDespesa] ANÁLISE DETALHADA:')
    console.log('  - totalPago >= valorDespesa:', totalPago >= valorDespesa)
    console.log('  - totalPago === valorDespesa:', totalPago === valorDespesa)
    console.log('  - Diferença (totalPago - valorDespesa):', totalPago - valorDespesa)
    console.log('  - totalPago > 0:', totalPago > 0)
    console.log('  - Tipos:', typeof totalPago, typeof valorDespesa)

    let novoStatus: Despesa['status'] = 'pendente'
    
    if (totalPago >= valorDespesa) {
      novoStatus = 'pago_total'
      console.log('✅ [atualizarStatusDespesa] Status definido como: pago_total (totalPago >= valorDespesa)')
    } else if (totalPago > 0) {
      novoStatus = 'pago_parcial'
      console.log('🟡 [atualizarStatusDespesa] Status definido como: pago_parcial (totalPago > 0)')
    } else if (new Date(despesa.vencimento) < new Date()) {
      novoStatus = 'vencido'
      console.log('🔴 [atualizarStatusDespesa] Status definido como: vencido (vencimento < hoje)')
    } else {
      console.log('⏳ [atualizarStatusDespesa] Status mantido como: pendente (nenhuma condição atendida)')
    }

    console.log('🔄 [atualizarStatusDespesa] Chamando updateDespesa com:', { valorPago: totalPago, status: novoStatus })
    const resultado = this.updateDespesa(despesaId, { valorPago: totalPago, status: novoStatus })
    console.log('📊 [atualizarStatusDespesa] Resultado do updateDespesa:', resultado)
    
    // Verificar se a atualização foi persistida
    const despesasAtualizadas = this.getDespesas()
    const despesaAtualizada = despesasAtualizadas.find(d => d.id === despesaId)
    console.log('🔍 [atualizarStatusDespesa] Status após atualização:', despesaAtualizada?.status)
  }

  // Lançamentos do Sistema
  getLancamentosSistema(): LancamentoSistema[] {
    return this.loadFromStorage('lancamentos_sistema', [])
  }

  criarLancamentoSistema(lancamento: Omit<LancamentoSistema, 'id' | 'createdAt'>): LancamentoSistema {
    const lancamentos = this.getLancamentosSistema()
    const newLancamento: LancamentoSistema = {
      ...lancamento,
      id: this.generateUniqueId(),
      // Se a data não foi fornecida, usar a data atual
      data: lancamento.data || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    }
    lancamentos.push(newLancamento)
    this.saveToStorage('lancamentos_sistema', lancamentos)
    return newLancamento
  }

  // Movimentações Bancárias
  getMovimentacoesBancarias(): MovimentacaoBancaria[] {
    return this.loadFromStorage('movimentacoes_bancarias', [])
  }

  // Criar movimentação bancária manual para conciliação
  criarMovimentacaoBancaria(movimentacao: Omit<MovimentacaoBancaria, 'id' | 'createdAt'>): MovimentacaoBancaria {
    const movimentacoes = this.getMovimentacoesBancarias()
    const novaMovimentacao: MovimentacaoBancaria = {
      ...movimentacao,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    movimentacoes.push(novaMovimentacao)
    this.saveToStorage('movimentacoes_bancarias', movimentacoes)
    return novaMovimentacao
  }

  importarMovimentacaoOFX(movimentacoes: Omit<MovimentacaoBancaria, 'id' | 'createdAt'>[]): MovimentacaoBancaria[] {
    const movimentacoesExistentes = this.getMovimentacoesBancarias()
    const novasMovimentacoes: MovimentacaoBancaria[] = []

    movimentacoes.forEach(mov => {
      // Verificar duplicatas
      const existe = movimentacoesExistentes.some(m => 
        m.contaBancariaId === mov.contaBancariaId &&
        m.data === mov.data &&
        m.valor === mov.valor &&
        m.descricao === mov.descricao
      )

      if (!existe) {
        const novaMovimentacao: MovimentacaoBancaria = {
          ...mov,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString()
        }
        novasMovimentacoes.push(novaMovimentacao)
        movimentacoesExistentes.push(novaMovimentacao)
      }
    })

    this.saveToStorage('movimentacoes_bancarias', movimentacoesExistentes)
    return novasMovimentacoes
  }

  // Conciliação
  getConciliacoes(): Conciliacao[] {
    return this.loadFromStorage('conciliacoes', [])
  }

  registrarConciliacao(conciliacao: Omit<Conciliacao, 'id' | 'createdAt'>): Conciliacao {
    const conciliacoes = this.getConciliacoes()
    const newConciliacao: Conciliacao = {
      ...conciliacao,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString()
    }
    conciliacoes.push(newConciliacao)
    this.saveToStorage('conciliacoes', conciliacoes)
    return newConciliacao
  }

  deleteConciliacaoByPair(movimentacaoId: string, lancamentoId: string): boolean {
    const conciliacoes = this.getConciliacoes()
    const filtered = conciliacoes.filter(c => 
      !(c.movimentacaoId === movimentacaoId && c.lancamentoId === lancamentoId)
    )
    if (filtered.length === conciliacoes.length) return false
    
    this.saveToStorage('conciliacoes', filtered)
    return true
  }

  // Utilidades internas
  private normalize(text: string): string {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim()
  }

  private onlyDigits(text: string): string {
    return String(text || '').replace(/\D/g, '')
  }

  // Corrigir IDs duplicados nas despesas
  fixDuplicateIds(): { fixedDespesas: number } {
    console.log('🔧 [fixDuplicateIds] Iniciando correção de IDs duplicados...')
    
    const despesasRaw = this.loadFromStorage('despesas', [])
    console.log('📋 [fixDuplicateIds] Total de despesas:', despesasRaw.length)
    
    const idsVistos = new Set<string>()
    const despesasCorrigidas: Despesa[] = []
    let despesasCorrigidasCount = 0
    
    despesasRaw.forEach((despesa, index) => {
      if (idsVistos.has(despesa.id)) {
        // ID duplicado encontrado - gerar novo ID
        const novoId = this.generateUniqueId()
        console.log(`🔧 [fixDuplicateIds] Corrigindo ID duplicado: ${despesa.id} -> ${novoId}`)
        
        const despesaCorrigida = {
          ...despesa,
          id: novoId,
          updatedAt: new Date().toISOString()
        }
        
        despesasCorrigidas.push(despesaCorrigida)
        idsVistos.add(novoId)
        despesasCorrigidasCount++
        
        // Atualizar pagamentos que referenciam o ID antigo
        const pagamentos = this.getPagamentos()
        const pagamentosAtualizados = pagamentos.map(pag => {
          if (pag.despesaId === despesa.id) {
            console.log(`🔧 [fixDuplicateIds] Atualizando referência de pagamento: ${despesa.id} -> ${novoId}`)
            return { ...pag, despesaId: novoId }
          }
          return pag
        })
        this.saveToStorage('pagamentos', pagamentosAtualizados)
        
      } else {
        // ID único - manter como está
        despesasCorrigidas.push(despesa)
        idsVistos.add(despesa.id)
      }
    })
    
    // Salvar despesas corrigidas
    this.saveToStorage('despesas', despesasCorrigidas)
    
    console.log(`✅ [fixDuplicateIds] Correção concluída. ${despesasCorrigidasCount} despesas corrigidas.`)
    return { fixedDespesas: despesasCorrigidasCount }
  }


  // Remove duplicatas em fornecedores e despesas e mantém referências
  removeDuplicates(): { removedFornecedores: number; removedDespesas: number } {
    // Fornecedores: documento (apenas dígitos) ou nome normalizado
    const fornecedores = this.getFornecedores()

    const keyForFornecedor = (f: Fornecedor) => {
      const keyDoc = this.onlyDigits(f.documento)
      const keyName = this.normalize(f.nome)
      return keyDoc || keyName
    }

    const seenFornecedor = new Map<string, Fornecedor>()
    const idRemap = new Map<string, string>() // oldId -> canonicalId
    const uniqueFornecedores: Fornecedor[] = []

    for (const f of fornecedores) {
      const k = keyForFornecedor(f)
      const existing = seenFornecedor.get(k)
      if (!existing) {
        seenFornecedor.set(k, f)
        uniqueFornecedores.push(f)
        idRemap.set(f.id, f.id)
      } else {
        // duplicado: mapear para id canônico
        idRemap.set(f.id, existing.id)
      }
    }

    const removedFornecedores = fornecedores.length - uniqueFornecedores.length
    this.saveToStorage('fornecedores', uniqueFornecedores)

    // Reapontar fornecedorId das despesas para o id canônico
    const despesas = this.getDespesas().map((d) => ({ ...d }))
    for (const d of despesas) {
      const newId = idRemap.get(d.fornecedorId)
      if (newId && newId !== d.fornecedorId) {
        d.fornecedorId = newId
      }
    }

    // Despesas: fornecedorId + descricao normalizada + valor + vencimento
    const seenDespesa = new Map<string, boolean>()
    const uniqueDespesas: typeof despesas = []

    for (const d of despesas) {
      const key = [
        d.fornecedorId,
        this.normalize(d.descricao),
        d.valor.toFixed(2),
        d.vencimento
      ].join('|')
      if (!seenDespesa.has(key)) {
        seenDespesa.set(key, true)
        uniqueDespesas.push(d)
      }
    }

    const removedDespesas = despesas.length - uniqueDespesas.length
    this.saveToStorage('despesas', uniqueDespesas)

    return { removedFornecedores, removedDespesas }
  }

  // Limpa todos os dados persistidos (mantém estrutura vazia)
  clearAllData(): void {
    // Executar limpeza assíncrona em background
    this.adapter.clearAllData();
  }

  async clearAllDataAsync(): Promise<void> {
    return await this.adapter.clearAllData();
  }

  // Métodos específicos para integração com banco
  async forceMigration(): Promise<void> {
    return await this.adapter.forceMigration();
  }

  async getDatabaseStatus(): Promise<{ connected: boolean; error?: string; tables?: string[] }> {
    return await this.adapter.getDatabaseStatus();
  }

  // Método para verificar se está usando banco ou localStorage
  async isUsingDatabase(): Promise<boolean> {
    const status = await this.adapter.getDatabaseStatus();
    return status.connected;
  }
}

export const financialDataService = new FinancialDataService();
export { FinancialDataService };
export { ExcelImportService } from './excelImport';
