// Simulação de banco de dados para frontend (sistema em memória)
// Este arquivo é otimizado para build da Vercel

// Tipos para as entidades do banco
export interface Categoria {
  id: string;
  nome: string;
  tipo: 'receita' | 'despesa';
  cor: string;
  descricao?: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ContaBancaria {
  id: string;
  nome: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo: 'corrente' | 'poupanca' | 'investimento';
  saldo_inicial: number;
  saldo_atual: number;
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: Date;
  data_pagamento?: Date;
  categoria_id?: string;
  fornecedor_id?: string;
  conta_bancaria_id?: string;
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado';
  forma_pagamento?: string;
  numero_documento?: string;
  observacoes?: string;
  recorrente: boolean;
  frequencia_recorrencia?: string;
  parcela_atual: number;
  total_parcelas: number;
  valor_pago: number;
  created_at: Date;
  updated_at: Date;
}

export interface Receita {
  id: string;
  descricao: string;
  valor: number;
  data_vencimento: Date;
  data_recebimento?: Date;
  categoria_id?: string;
  fornecedor_id?: string;
  conta_bancaria_id?: string;
  status: 'pendente' | 'recebido' | 'vencido' | 'cancelado';
  forma_recebimento?: string;
  numero_documento?: string;
  observacoes?: string;
  recorrente: boolean;
  frequencia_recorrencia?: string;
  parcela_atual: number;
  total_parcelas: number;
  valor_recebido: number;
  created_at: Date;
  updated_at: Date;
}

export interface Pagamento {
  id: string;
  despesa_id?: string;
  receita_id?: string;
  valor: number;
  data_pagamento: Date;
  forma_pagamento?: string;
  conta_bancaria_id?: string;
  observacoes?: string;
  created_at: Date;
}

// Classe simulada do serviço de banco de dados para frontend
export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    // Constructor vazio para frontend
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Métodos simulados para frontend - retornam dados vazios ou erros
  async query(text: string, params?: unknown[]): Promise<unknown[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    throw new Error('Transações não disponíveis no frontend');
  }

  // Métodos para Categorias
  async getCategorias(): Promise<Categoria[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
    throw new Error('Database não disponível no frontend');
  }

  async updateCategoria(id: string, categoria: Partial<Categoria>): Promise<Categoria> {
    throw new Error('Database não disponível no frontend');
  }

  async deleteCategoria(id: string): Promise<void> {
    throw new Error('Database não disponível no frontend');
  }

  // Métodos para Fornecedores
  async getFornecedores(): Promise<Fornecedor[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async createFornecedor(fornecedor: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<Fornecedor> {
    throw new Error('Database não disponível no frontend');
  }

  // Métodos para Contas Bancárias
  async getContasBancarias(): Promise<ContaBancaria[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async createContaBancaria(conta: Omit<ContaBancaria, 'id' | 'created_at' | 'updated_at'>): Promise<ContaBancaria> {
    throw new Error('Database não disponível no frontend');
  }

  // Métodos para Despesas
  async getDespesas(): Promise<Despesa[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async createDespesa(despesa: Omit<Despesa, 'id' | 'created_at' | 'updated_at'>): Promise<Despesa> {
    throw new Error('Database não disponível no frontend');
  }

  async updateDespesa(id: string, despesa: Partial<Despesa>): Promise<Despesa> {
    throw new Error('Database não disponível no frontend');
  }

  // Métodos para Receitas
  async getReceitas(): Promise<Receita[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async createReceita(receita: Omit<Receita, 'id' | 'created_at' | 'updated_at'>): Promise<Receita> {
    throw new Error('Database não disponível no frontend');
  }

  // Métodos para Pagamentos
  async getPagamentos(): Promise<Pagamento[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async createPagamento(pagamento: Omit<Pagamento, 'id' | 'created_at'>): Promise<Pagamento> {
    throw new Error('Database não disponível no frontend');
  }

  async getPagamentosByDespesa(despesaId: string): Promise<Pagamento[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  async getPagamentosByReceita(receitaId: string): Promise<Pagamento[]> {
    console.warn('Database não disponível no frontend. Use o financialData service.');
    return [];
  }

  // Método para testar conexão
  async testConnection(): Promise<boolean> {
    console.warn('Database não disponível no frontend');
    return false;
  }

  // Método para executar scripts SQL
  async executeScript(script: string): Promise<void> {
    throw new Error('Database não disponível no frontend');
  }

  // Método para fechar conexões
  async close(): Promise<void> {
    // Não faz nada no frontend
  }
}

// Instância singleton
export const db = DatabaseService.getInstance();