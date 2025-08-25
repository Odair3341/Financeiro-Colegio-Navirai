// Importação condicional para evitar erros no frontend
let pool: any = null;
let pgModule: any = null;

// Função para inicializar o pool de conexões
async function initializePool() {
  if (typeof window !== 'undefined') {
    // Estamos no frontend, não inicializar pg
    return null;
  }
  
  if (!pgModule) {
    try {
      pgModule = await import('pg');
      const { Pool } = pgModule;
      
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
    } catch (error) {
      console.warn('PostgreSQL não disponível:', error);
      return null;
    }
  }
  
  return pool;
}

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

// Classe principal do serviço de banco de dados
export class DatabaseService {
  private static instance: DatabaseService;
  private pool: any;

  private constructor() {
    this.pool = null;
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Método para garantir que o pool está inicializado
  private async ensurePool() {
    if (!this.pool) {
      this.pool = await initializePool();
    }
    if (!this.pool) {
      throw new Error('Database não disponível no frontend');
    }
    return this.pool;
  }

  // Método para executar queries
  async query(text: string, params?: unknown[]): Promise<unknown[]> {
    const pool = await this.ensurePool();
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Método para transações
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const pool = await this.ensurePool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Métodos para Categorias
  async getCategorias(): Promise<Categoria[]> {
    const result = await this.query(
      'SELECT * FROM categorias WHERE ativo = true ORDER BY nome'
    );
    return result as Categoria[];
  }

  async createCategoria(categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>): Promise<Categoria> {
    const result = await this.query(
      `INSERT INTO categorias (nome, tipo, cor, descricao, ativo) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [categoria.nome, categoria.tipo, categoria.cor, categoria.descricao, categoria.ativo]
    );
    return result[0] as Categoria;
  }

  async updateCategoria(id: string, categoria: Partial<Categoria>): Promise<Categoria> {
    const fields = Object.keys(categoria).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
    const values = fields.map(field => categoria[field as keyof Categoria]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await this.query(
      `UPDATE categorias SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result[0] as Categoria;
  }

  async deleteCategoria(id: string): Promise<void> {
    await this.query('UPDATE categorias SET ativo = false WHERE id = $1', [id]);
  }

  // Métodos para Fornecedores
  async getFornecedores(): Promise<Fornecedor[]> {
    const result = await this.query(
      'SELECT * FROM fornecedores WHERE ativo = true ORDER BY nome'
    );
    return result as Fornecedor[];
  }

  async createFornecedor(fornecedor: Omit<Fornecedor, 'id' | 'created_at' | 'updated_at'>): Promise<Fornecedor> {
    const result = await this.query(
      `INSERT INTO fornecedores (nome, cnpj, cpf, email, telefone, endereco, cidade, estado, cep, observacoes, ativo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [fornecedor.nome, fornecedor.cnpj, fornecedor.cpf, fornecedor.email, fornecedor.telefone, 
       fornecedor.endereco, fornecedor.cidade, fornecedor.estado, fornecedor.cep, fornecedor.observacoes, fornecedor.ativo]
    );
    return result[0] as Fornecedor;
  }

  // Métodos para Contas Bancárias
  async getContasBancarias(): Promise<ContaBancaria[]> {
    const result = await this.query(
      'SELECT * FROM contas_bancarias WHERE ativo = true ORDER BY nome'
    );
    return result as ContaBancaria[];
  }

  async createContaBancaria(conta: Omit<ContaBancaria, 'id' | 'created_at' | 'updated_at'>): Promise<ContaBancaria> {
    const result = await this.query(
      `INSERT INTO contas_bancarias (nome, banco, agencia, conta, tipo, saldo_inicial, saldo_atual, ativo) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [conta.nome, conta.banco, conta.agencia, conta.conta, conta.tipo, conta.saldo_inicial, conta.saldo_atual, conta.ativo]
    );
    return result[0] as ContaBancaria;
  }

  // Métodos para Despesas
  async getDespesas(): Promise<Despesa[]> {
    const result = await this.query(
      'SELECT * FROM despesas ORDER BY data_vencimento DESC'
    );
    return result as Despesa[];
  }

  async createDespesa(despesa: Omit<Despesa, 'id' | 'created_at' | 'updated_at'>): Promise<Despesa> {
    const result = await this.query(
      `INSERT INTO despesas (descricao, valor, data_vencimento, data_pagamento, categoria_id, fornecedor_id, 
                            conta_bancaria_id, status, forma_pagamento, numero_documento, observacoes, 
                            recorrente, frequencia_recorrencia, parcela_atual, total_parcelas, valor_pago) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [despesa.descricao, despesa.valor, despesa.data_vencimento, despesa.data_pagamento, despesa.categoria_id,
       despesa.fornecedor_id, despesa.conta_bancaria_id, despesa.status, despesa.forma_pagamento, 
       despesa.numero_documento, despesa.observacoes, despesa.recorrente, despesa.frequencia_recorrencia,
       despesa.parcela_atual, despesa.total_parcelas, despesa.valor_pago]
    );
    return result[0] as Despesa;
  }

  async updateDespesa(id: string, despesa: Partial<Despesa>): Promise<Despesa> {
    const fields = Object.keys(despesa).filter(key => key !== 'id' && key !== 'created_at' && key !== 'updated_at');
    const values = fields.map(field => despesa[field as keyof Despesa]);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    
    const result = await this.query(
      `UPDATE despesas SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result[0] as Despesa;
  }

  // Métodos para Receitas
  async getReceitas(): Promise<Receita[]> {
    const result = await this.query(
      'SELECT * FROM receitas ORDER BY data_vencimento DESC'
    );
    return result as Receita[];
  }

  async createReceita(receita: Omit<Receita, 'id' | 'created_at' | 'updated_at'>): Promise<Receita> {
    const result = await this.query(
      `INSERT INTO receitas (descricao, valor, data_vencimento, data_recebimento, categoria_id, fornecedor_id, 
                            conta_bancaria_id, status, forma_recebimento, numero_documento, observacoes, 
                            recorrente, frequencia_recorrencia, parcela_atual, total_parcelas, valor_recebido) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [receita.descricao, receita.valor, receita.data_vencimento, receita.data_recebimento, receita.categoria_id,
       receita.fornecedor_id, receita.conta_bancaria_id, receita.status, receita.forma_recebimento, 
       receita.numero_documento, receita.observacoes, receita.recorrente, receita.frequencia_recorrencia,
       receita.parcela_atual, receita.total_parcelas, receita.valor_recebido]
    );
    return result[0] as Receita;
  }

  // Métodos para Pagamentos
  async getPagamentos(): Promise<Pagamento[]> {
    const result = await this.query(
      'SELECT * FROM pagamentos ORDER BY data_pagamento DESC'
    );
    return result as Pagamento[];
  }

  async createPagamento(pagamento: Omit<Pagamento, 'id' | 'created_at'>): Promise<Pagamento> {
    const result = await this.query(
      `INSERT INTO pagamentos (despesa_id, receita_id, valor, data_pagamento, forma_pagamento, conta_bancaria_id, observacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [pagamento.despesa_id, pagamento.receita_id, pagamento.valor, pagamento.data_pagamento, 
       pagamento.forma_pagamento, pagamento.conta_bancaria_id, pagamento.observacoes]
    );
    return result[0] as Pagamento;
  }

  async getPagamentosByDespesa(despesaId: string): Promise<Pagamento[]> {
    const result = await this.query(
      'SELECT * FROM pagamentos WHERE despesa_id = $1 ORDER BY data_pagamento',
      [despesaId]
    );
    return result as Pagamento[];
  }

  async getPagamentosByReceita(receitaId: string): Promise<Pagamento[]> {
    const result = await this.query(
      'SELECT * FROM pagamentos WHERE receita_id = $1 ORDER BY data_pagamento',
      [receitaId]
    );
    return result as Pagamento[];
  }

  // Método para testar conexão
  async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Erro ao conectar com o banco:', error);
      return false;
    }
  }

  // Método para executar scripts SQL
  async executeScript(script: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(script);
    } finally {
      client.release();
    }
  }

  // Método para fechar conexões
  async close(): Promise<void> {
    await this.pool.end();
  }
}

// Instância singleton
export const db = DatabaseService.getInstance();