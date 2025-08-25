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
  constructor() {
    // Garantir que exista pelo menos uma empresa padrão
    this.ensureDefaultEmpresa()
    // Popular dados de teste
    this.popularDadosTeste()
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
    return this.loadFromStorage('contas_bancarias', []) // Não usar mock por padrão
  }

  saveContaBancaria(conta: Omit<ContaBancaria, 'id' | 'createdAt' | 'updatedAt'>): ContaBancaria {
    const contas = this.getContasBancarias()
    const newConta: ContaBancaria = {
      ...conta,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    contas.push(newConta)
    this.saveToStorage('contas_bancarias', contas)
    return newConta
  }

  updateContaBancaria(id: string, updates: Partial<ContaBancaria>): ContaBancaria | null {
    const contas = this.getContasBancarias()
    const index = contas.findIndex(c => c.id === id)
    if (index === -1) return null
    
    contas[index] = { ...contas[index], ...updates, updatedAt: new Date().toISOString() }
    this.saveToStorage('contas_bancarias', contas)
    return contas[index]
  }

  deleteContaBancaria(id: string): boolean {
    const contas = this.getContasBancarias()
    const filtered = contas.filter(c => c.id !== id)
    if (filtered.length === contas.length) return false
    
    this.saveToStorage('contas_bancarias', filtered)
    return true
  }

  // Empresas (Sistema independente)
  getEmpresas(): Empresa[] {
    return this.loadFromStorage('empresas', [])
  }

  saveEmpresa(empresa: Omit<Empresa, 'id' | 'createdAt' | 'updatedAt'>): Empresa {
    const empresas = this.getEmpresas()
    const newEmpresa: Empresa = {
      ...empresa,
      id: Date.now().toString(),
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
    return this.loadFromStorage('fornecedores', []) // Não usar mock por padrão
  }

  saveFornecedor(fornecedor: Omit<Fornecedor, 'id' | 'createdAt' | 'updatedAt'>): Fornecedor {
    const fornecedores = this.getFornecedores()
    const newFornecedor: Fornecedor = {
      ...fornecedor,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    fornecedores.push(newFornecedor)
    this.saveToStorage('fornecedores', fornecedores)
    return newFornecedor
  }

  updateFornecedor(id: string, updates: Partial<Fornecedor>): Fornecedor | null {
    const fornecedores = this.getFornecedores()
    const index = fornecedores.findIndex(f => f.id === id)
    if (index === -1) return null
    
    fornecedores[index] = { ...fornecedores[index], ...updates, updatedAt: new Date().toISOString() }
    this.saveToStorage('fornecedores', fornecedores)
    return fornecedores[index]
  }

  deleteFornecedor(id: string): boolean {
    const fornecedores = this.getFornecedores()
    const filtered = fornecedores.filter(f => f.id !== id)
    if (filtered.length === fornecedores.length) return false
    
    this.saveToStorage('fornecedores', filtered)
    return true
  }

  // Despesas
  getDespesas(): Despesa[] {
    const despesas = this.loadFromStorage('despesas', []) // Não usar mock por padrão
    const fornecedores = this.getFornecedores()
    const empresas = this.getEmpresas()
    
    // Adicionar dados do fornecedor e empresa
    return despesas.map(despesa => ({
      ...despesa,
      fornecedor: fornecedores.find(f => f.id === despesa.fornecedorId),
      empresa: empresas.find(e => e.id === despesa.empresaId)
    }))
  }

  saveDespesa(despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>): Despesa {
    // Usar dados raw do localStorage, não dados enriched
    const despesasRaw = this.loadFromStorage('despesas', [])
    const newDespesa: Despesa = {
      ...despesa,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    despesasRaw.push(newDespesa)
    this.saveToStorage('despesas', despesasRaw)
    
    // Retornar a despesa com dados enriched
    const fornecedores = this.getFornecedores()
    const empresas = this.getEmpresas()
    return {
      ...newDespesa,
      fornecedor: fornecedores.find(f => f.id === newDespesa.fornecedorId),
      empresa: empresas.find(e => e.id === newDespesa.empresaId)
    }
  }

  updateDespesa(id: string, updates: Partial<Despesa>): Despesa | null {
    console.log('🔄 Iniciando updateDespesa para:', id, 'com updates:', updates)
    
    // Usar dados raw do localStorage, não dados enriched
    const despesasRaw = this.loadFromStorage('despesas', [])
    console.log('📋 Total de despesas raw antes da atualização:', despesasRaw.length)
    
    const index = despesasRaw.findIndex(d => d.id === id)
    if (index === -1) {
      console.log('❌ Despesa não encontrada no índice:', id)
      return null
    }
    
    console.log('📄 Despesa encontrada no índice:', index, despesasRaw[index])
    
    // Remover propriedades enriched do updates se existirem
    const { fornecedor, empresa, ...cleanUpdates } = updates as any
    console.log('🧹 Updates limpos (sem propriedades enriched):', cleanUpdates)
    
    const despesaAtualizada = { ...despesasRaw[index], ...cleanUpdates, updatedAt: new Date().toISOString() }
    console.log('📝 Despesa atualizada:', despesaAtualizada)
    
    despesasRaw[index] = despesaAtualizada
    this.saveToStorage('despesas', despesasRaw)
    console.log('💾 Despesa salva no localStorage')
    
    // Verificar se foi realmente salva
    const despesasVerificacao = this.loadFromStorage('despesas', [])
    const despesaVerificada = despesasVerificacao.find(d => d.id === id)
    console.log('🔍 Verificação - despesa após salvar:', despesaVerificada)
    
    // Retornar a despesa com dados enriched
    const fornecedores = this.getFornecedores()
    const empresas = this.getEmpresas()
    const resultado = {
      ...despesaAtualizada,
      fornecedor: fornecedores.find(f => f.id === despesaAtualizada.fornecedorId),
      empresa: empresas.find(e => e.id === despesaAtualizada.empresaId)
    }
    console.log('📊 Resultado final do updateDespesa:', resultado)
    return resultado
  }

  deleteDespesa(id: string): boolean {
    // Usar dados raw do localStorage, não dados enriched
    const despesasRaw = this.loadFromStorage('despesas', [])
    const filtered = despesasRaw.filter(d => d.id !== id)
    if (filtered.length === despesasRaw.length) return false
    
    this.saveToStorage('despesas', filtered)
    return true
  }

  // Pagamentos
  getPagamentos(): Pagamento[] {
    return this.loadFromStorage('pagamentos', [])
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
      id: Date.now().toString(),
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
      id: Date.now().toString(),
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

    let novoStatus: Despesa['status'] = 'pendente'
    
    if (totalPago >= valorDespesa) {
      novoStatus = 'pago_total'
      console.log('✅ [atualizarStatusDespesa] Status definido como: pago_total')
    } else if (totalPago > 0) {
      novoStatus = 'pago_parcial'
      console.log('🟡 [atualizarStatusDespesa] Status definido como: pago_parcial')
    } else if (new Date(despesa.vencimento) < new Date()) {
      novoStatus = 'vencido'
      console.log('🔴 [atualizarStatusDespesa] Status definido como: vencido')
    } else {
      console.log('⏳ [atualizarStatusDespesa] Status mantido como: pendente')
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
      id: Date.now().toString(),
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
      id: Date.now().toString(),
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
    const entities = [
      'contas_bancarias',
      'empresas',
      'fornecedores',
      'despesas',
      'pagamentos',
      'recebimentos',
      'lancamentos_sistema',
      'movimentacoes_bancarias',
      'conciliacoes'
    ]
    entities.forEach((e) => this.saveToStorage(e, [] as any))
  }
}

export const financialDataService = new FinancialDataService()