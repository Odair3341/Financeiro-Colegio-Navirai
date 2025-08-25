import { DatabaseService } from './database';
import { MigrationService } from './migration';
import type {
  ContaBancaria,
  Empresa,
  Fornecedor,
  Despesa,
  Pagamento,
  Recebimento,
  MovimentacaoBancaria,
  LancamentoSistema,
  Conciliacao
} from './financialData';

/**
 * Adaptador que mantém a interface do FinancialDataService
 * mas usa o banco de dados PostgreSQL/Neon ao invés do localStorage
 */
export class FinancialDataAdapter {
  private dbService: DatabaseService;
  private migrationService: MigrationService;
  private idCounter: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    this.dbService = new DatabaseService();
    this.migrationService = new MigrationService();
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      // Verificar se o banco está configurado
      const status = await this.migrationService.checkDatabaseStatus();
      
      if (!status.connected) {
        console.warn('⚠️ Banco de dados não conectado, usando localStorage como fallback');
        return;
      }

      // Se não há tabelas, inicializar o banco
      if (status.tablesCount === 0) {
        console.log('🔄 Inicializando banco de dados...');
        await this.migrationService.initializeDatabase();
        
        // Migrar dados do localStorage se existirem
        const hasLocalData = this.checkLocalStorageData();
        if (hasLocalData) {
          console.log('📦 Migrando dados do localStorage...');
          await this.migrationService.migrateAllData();
        }
      }

      this.isInitialized = true;
      console.log('✅ FinancialDataAdapter inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar FinancialDataAdapter:', error);
    }
  }

  private checkLocalStorageData(): boolean {
    const entities = ['contas_bancarias', 'empresas', 'fornecedores', 'despesas', 'pagamentos', 'recebimentos'];
    return entities.some(entity => {
      const data = localStorage.getItem(`financeflow_${entity}`);
      return data && JSON.parse(data).length > 0;
    });
  }

  private generateUniqueId(): string {
    const timestamp = Date.now();
    this.idCounter = (this.idCounter + 1) % 10000;
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${timestamp}_${this.idCounter}_${randomSuffix}`;
  }

  private getStorageKey(entity: string): string {
    return `financeflow_${entity}`;
  }

  private loadFromStorage<T>(entity: string, defaultData: T): T {
    const stored = localStorage.getItem(this.getStorageKey(entity));
    return stored ? JSON.parse(stored) : defaultData;
  }

  private saveToStorage<T>(entity: string, data: T[]): void {
    localStorage.setItem(this.getStorageKey(entity), JSON.stringify(data));
  }

  // Métodos para usar banco ou localStorage como fallback
  private async useDatabase(): Promise<boolean> {
    return this.isInitialized && await this.migrationService.checkDatabaseStatus().then(s => s.connected);
  }

  // === CONTAS BANCÁRIAS ===
  async getContasBancarias(): Promise<ContaBancaria[]> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.getContasBancarias();
      }
    } catch (error) {
      console.warn('Erro ao buscar contas do banco, usando localStorage:', error);
    }
    return this.loadFromStorage('contas_bancarias', []);
  }

  async saveContaBancaria(conta: Omit<ContaBancaria, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContaBancaria> {
    const newConta: ContaBancaria = {
      ...conta,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (await this.useDatabase()) {
        return await this.dbService.createContaBancaria(newConta);
      }
    } catch (error) {
      console.warn('Erro ao salvar conta no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const contas = this.loadFromStorage('contas_bancarias', []);
    contas.push(newConta);
    this.saveToStorage('contas_bancarias', contas);
    return newConta;
  }

  async updateContaBancaria(id: string, updates: Partial<ContaBancaria>): Promise<ContaBancaria | null> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.updateContaBancaria(id, updates);
      }
    } catch (error) {
      console.warn('Erro ao atualizar conta no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const contas = this.loadFromStorage('contas_bancarias', []);
    const index = contas.findIndex(c => c.id === id);
    if (index === -1) return null;
    
    contas[index] = { ...contas[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage('contas_bancarias', contas);
    return contas[index];
  }

  async deleteContaBancaria(id: string): Promise<boolean> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.deleteContaBancaria(id);
      }
    } catch (error) {
      console.warn('Erro ao deletar conta no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const contas = this.loadFromStorage('contas_bancarias', []);
    const filtered = contas.filter(c => c.id !== id);
    if (filtered.length === contas.length) return false;
    
    this.saveToStorage('contas_bancarias', filtered);
    return true;
  }

  // === FORNECEDORES ===
  async getFornecedores(): Promise<Fornecedor[]> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.getFornecedores();
      }
    } catch (error) {
      console.warn('Erro ao buscar fornecedores do banco, usando localStorage:', error);
    }
    return this.loadFromStorage('fornecedores', []);
  }

  async saveFornecedor(fornecedor: Omit<Fornecedor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fornecedor> {
    const newFornecedor: Fornecedor = {
      ...fornecedor,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (await this.useDatabase()) {
        return await this.dbService.createFornecedor(newFornecedor);
      }
    } catch (error) {
      console.warn('Erro ao salvar fornecedor no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const fornecedores = this.loadFromStorage('fornecedores', []);
    fornecedores.push(newFornecedor);
    this.saveToStorage('fornecedores', fornecedores);
    return newFornecedor;
  }

  async updateFornecedor(id: string, updates: Partial<Fornecedor>): Promise<Fornecedor | null> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.updateFornecedor(id, updates);
      }
    } catch (error) {
      console.warn('Erro ao atualizar fornecedor no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const fornecedores = this.loadFromStorage('fornecedores', []);
    const index = fornecedores.findIndex(f => f.id === id);
    if (index === -1) return null;
    
    fornecedores[index] = { ...fornecedores[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage('fornecedores', fornecedores);
    return fornecedores[index];
  }

  async deleteFornecedor(id: string): Promise<boolean> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.deleteFornecedor(id);
      }
    } catch (error) {
      console.warn('Erro ao deletar fornecedor no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const fornecedores = this.loadFromStorage('fornecedores', []);
    const filtered = fornecedores.filter(f => f.id !== id);
    if (filtered.length === fornecedores.length) return false;
    
    this.saveToStorage('fornecedores', filtered);
    return true;
  }

  // === DESPESAS ===
  async getDespesas(): Promise<Despesa[]> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.getDespesas();
      }
    } catch (error) {
      console.warn('Erro ao buscar despesas do banco, usando localStorage:', error);
    }
    return this.loadFromStorage('despesas', []);
  }

  async saveDespesa(despesa: Omit<Despesa, 'id' | 'createdAt' | 'updatedAt'>): Promise<Despesa> {
    const newDespesa: Despesa = {
      ...despesa,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      if (await this.useDatabase()) {
        return await this.dbService.createDespesa(newDespesa);
      }
    } catch (error) {
      console.warn('Erro ao salvar despesa no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const despesas = this.loadFromStorage('despesas', []);
    despesas.push(newDespesa);
    this.saveToStorage('despesas', despesas);
    return newDespesa;
  }

  async updateDespesa(id: string, updates: Partial<Despesa>): Promise<Despesa | null> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.updateDespesa(id, updates);
      }
    } catch (error) {
      console.warn('Erro ao atualizar despesa no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const despesas = this.loadFromStorage('despesas', []);
    const index = despesas.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    despesas[index] = { ...despesas[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveToStorage('despesas', despesas);
    return despesas[index];
  }

  async deleteDespesa(id: string): Promise<boolean> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.deleteDespesa(id);
      }
    } catch (error) {
      console.warn('Erro ao deletar despesa no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const despesas = this.loadFromStorage('despesas', []);
    const filtered = despesas.filter(d => d.id !== id);
    if (filtered.length === despesas.length) return false;
    
    this.saveToStorage('despesas', filtered);
    return true;
  }

  // === PAGAMENTOS ===
  async getPagamentos(): Promise<Pagamento[]> {
    try {
      if (await this.useDatabase()) {
        return await this.dbService.getPagamentos();
      }
    } catch (error) {
      console.warn('Erro ao buscar pagamentos do banco, usando localStorage:', error);
    }
    return this.loadFromStorage('pagamentos', []);
  }

  async savePagamento(pagamento: Omit<Pagamento, 'id' | 'createdAt'>): Promise<Pagamento> {
    const newPagamento: Pagamento = {
      ...pagamento,
      id: this.generateUniqueId(),
      createdAt: new Date().toISOString()
    };

    try {
      if (await this.useDatabase()) {
        return await this.dbService.createPagamento(newPagamento);
      }
    } catch (error) {
      console.warn('Erro ao salvar pagamento no banco, usando localStorage:', error);
    }

    // Fallback para localStorage
    const pagamentos = this.loadFromStorage('pagamentos', []);
    pagamentos.push(newPagamento);
    this.saveToStorage('pagamentos', pagamentos);
    return newPagamento;
  }

  // === MÉTODOS DE UTILIDADE ===
  async clearAllData(): Promise<void> {
    try {
      if (await this.useDatabase()) {
        await this.migrationService.clearAllData();
      }
    } catch (error) {
      console.warn('Erro ao limpar dados do banco, limpando localStorage:', error);
    }

    // Limpar localStorage também
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
    ];
    entities.forEach(entity => this.saveToStorage(entity, []));
  }

  // Método para forçar migração manual
  async forceMigration(): Promise<void> {
    if (await this.useDatabase()) {
      await this.migrationService.migrateAllData();
    }
  }

  // Método para verificar status do banco
  async getDatabaseStatus(): Promise<{ connected: boolean; error?: string; tables?: string[] }> {
    return await this.migrationService.checkDatabaseStatus();
  }

  // === MÉTODOS SÍNCRONOS PARA COMPATIBILIDADE ===
  // Estes métodos mantêm a interface síncrona original
  // mas internamente fazem cache dos dados assíncronos

  private cache: { [key: string]: unknown } = {};
  private cacheTimestamps: { [key: string]: number } = {};
  private readonly CACHE_TTL = 30000; // 30 segundos

  private isCacheValid(key: string): boolean {
    const timestamp = this.cacheTimestamps[key];
    return timestamp && (Date.now() - timestamp) < this.CACHE_TTL;
  }

  private async getCachedData<T>(key: string, fetcher: () => Promise<T[]>): Promise<T[]> {
    if (this.isCacheValid(key)) {
      return this.cache[key];
    }

    try {
      const data = await fetcher();
      this.cache[key] = data;
      this.cacheTimestamps[key] = Date.now();
      return data;
    } catch (error) {
      console.warn(`Erro ao buscar ${key}:`, error);
      return this.cache[key] || [];
    }
  }

  // Métodos síncronos que usam cache
  getContasBancariasSync(): ContaBancaria[] {
    if (this.isCacheValid('contas_bancarias')) {
      return this.cache['contas_bancarias'] || [];
    }
    
    // Buscar assincronamente e atualizar cache
    this.getContasBancarias().then(data => {
      this.cache['contas_bancarias'] = data;
      this.cacheTimestamps['contas_bancarias'] = Date.now();
    });
    
    return this.loadFromStorage('contas_bancarias', []);
  }

  getFornecedoresSync(): Fornecedor[] {
    if (this.isCacheValid('fornecedores')) {
      return this.cache['fornecedores'] || [];
    }
    
    this.getFornecedores().then(data => {
      this.cache['fornecedores'] = data;
      this.cacheTimestamps['fornecedores'] = Date.now();
    });
    
    return this.loadFromStorage('fornecedores', []);
  }

  getDespesasSync(): Despesa[] {
    if (this.isCacheValid('despesas')) {
      return this.cache['despesas'] || [];
    }
    
    this.getDespesas().then(data => {
      this.cache['despesas'] = data;
      this.cacheTimestamps['despesas'] = Date.now();
    });
    
    return this.loadFromStorage('despesas', []);
  }

  // Invalidar cache quando dados são modificados
  private invalidateCache(entity: string): void {
    delete this.cache[entity];
    delete this.cacheTimestamps[entity];
  }
}