import { db } from './database';
import { financialDataService } from './financialData';

export interface MigrationResult {
  success: boolean;
  message: string;
  details: {
    categorias: number;
    fornecedores: number;
    contasBancarias: number;
    despesas: number;
    receitas: number;
    pagamentos: number;
  };
  errors: string[];
}

export class MigrationService {
  private static instance: MigrationService;

  private constructor() {}

  public static getInstance(): MigrationService {
    if (!MigrationService.instance) {
      MigrationService.instance = new MigrationService();
    }
    return MigrationService.instance;
  }

  async migrateAllData(): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      message: '',
      details: {
        categorias: 0,
        fornecedores: 0,
        contasBancarias: 0,
        despesas: 0,
        receitas: 0,
        pagamentos: 0
      },
      errors: []
    };

    try {
      // Verificar conexão com o banco
      const isConnected = await db.testConnection();
      if (!isConnected) {
        throw new Error('Não foi possível conectar ao banco de dados');
      }

      console.log('🚀 Iniciando migração de dados do localStorage para o banco...');

      // Migrar categorias
      try {
        const categorias = financialDataService.getCategorias();
        for (const categoria of categorias) {
          try {
            await db.createCategoria({
              nome: categoria.nome,
              tipo: categoria.tipo as 'receita' | 'despesa',
              cor: categoria.cor || '#3B82F6',
              descricao: categoria.descricao,
              ativo: true
            });
            result.details.categorias++;
          } catch (error) {
            console.warn(`Categoria ${categoria.nome} já existe ou erro:`, error);
          }
        }
        console.log(`✅ Migradas ${result.details.categorias} categorias`);
      } catch (error) {
        const errorMsg = `Erro ao migrar categorias: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Migrar fornecedores
      try {
        const fornecedores = financialDataService.getFornecedores();
        for (const fornecedor of fornecedores) {
          try {
            await db.createFornecedor({
              nome: fornecedor.nome,
              cnpj: fornecedor.cnpj,
              cpf: fornecedor.cpf,
              email: fornecedor.email,
              telefone: fornecedor.telefone,
              endereco: fornecedor.endereco,
              cidade: fornecedor.cidade,
              estado: fornecedor.estado,
              cep: fornecedor.cep,
              observacoes: fornecedor.observacoes,
              ativo: true
            });
            result.details.fornecedores++;
          } catch (error) {
            console.warn(`Fornecedor ${fornecedor.nome} já existe ou erro:`, error);
          }
        }
        console.log(`✅ Migrados ${result.details.fornecedores} fornecedores`);
      } catch (error) {
        const errorMsg = `Erro ao migrar fornecedores: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Migrar contas bancárias
      try {
        const contas = financialDataService.getContasBancarias();
        for (const conta of contas) {
          try {
            await db.createContaBancaria({
              nome: conta.nome,
              banco: conta.banco,
              agencia: conta.agencia,
              conta: conta.conta,
              tipo: (conta.tipo as 'corrente' | 'poupanca' | 'investimento') || 'corrente',
              saldo_inicial: conta.saldoInicial || 0,
              saldo_atual: conta.saldoAtual || conta.saldoInicial || 0,
              ativo: true
            });
            result.details.contasBancarias++;
          } catch (error) {
            console.warn(`Conta ${conta.nome} já existe ou erro:`, error);
          }
        }
        console.log(`✅ Migradas ${result.details.contasBancarias} contas bancárias`);
      } catch (error) {
        const errorMsg = `Erro ao migrar contas bancárias: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Migrar despesas
      try {
        const despesas = financialDataService.getDespesas();
        for (const despesa of despesas) {
          try {
            // Buscar IDs das entidades relacionadas
            const categorias = await db.getCategorias();
            const fornecedores = await db.getFornecedores();
            const contas = await db.getContasBancarias();

            const categoria = categorias.find(c => c.nome === despesa.categoria);
            const fornecedor = fornecedores.find(f => f.nome === despesa.fornecedor);
            const conta = contas.find(c => c.nome === despesa.contaBancaria);

            await db.createDespesa({
              descricao: despesa.descricao,
              valor: despesa.valor,
              data_vencimento: new Date(despesa.dataVencimento),
              data_pagamento: despesa.dataPagamento ? new Date(despesa.dataPagamento) : undefined,
              categoria_id: categoria?.id,
              fornecedor_id: fornecedor?.id,
              conta_bancaria_id: conta?.id,
              status: despesa.status as 'pendente' | 'pago' | 'vencido' | 'cancelado',
              forma_pagamento: despesa.formaPagamento,
              numero_documento: despesa.numeroDocumento,
              observacoes: despesa.observacoes,
              recorrente: despesa.recorrente || false,
              frequencia_recorrencia: despesa.frequenciaRecorrencia,
              parcela_atual: despesa.parcelaAtual || 1,
              total_parcelas: despesa.totalParcelas || 1,
              valor_pago: despesa.valorPago || 0
            });
            result.details.despesas++;
          } catch (error) {
            console.warn(`Despesa ${despesa.descricao} erro:`, error);
          }
        }
        console.log(`✅ Migradas ${result.details.despesas} despesas`);
      } catch (error) {
        const errorMsg = `Erro ao migrar despesas: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Migrar receitas
      try {
        const receitas = financialDataService.getReceitas();
        for (const receita of receitas) {
          try {
            // Buscar IDs das entidades relacionadas
            const categorias = await db.getCategorias();
            const fornecedores = await db.getFornecedores();
            const contas = await db.getContasBancarias();

            const categoria = categorias.find(c => c.nome === receita.categoria);
            const fornecedor = fornecedores.find(f => f.nome === receita.fornecedor);
            const conta = contas.find(c => c.nome === receita.contaBancaria);

            await db.createReceita({
              descricao: receita.descricao,
              valor: receita.valor,
              data_vencimento: new Date(receita.dataVencimento),
              data_recebimento: receita.dataRecebimento ? new Date(receita.dataRecebimento) : undefined,
              categoria_id: categoria?.id,
              fornecedor_id: fornecedor?.id,
              conta_bancaria_id: conta?.id,
              status: receita.status as 'pendente' | 'recebido' | 'vencido' | 'cancelado',
              forma_recebimento: receita.formaRecebimento,
              numero_documento: receita.numeroDocumento,
              observacoes: receita.observacoes,
              recorrente: receita.recorrente || false,
              frequencia_recorrencia: receita.frequenciaRecorrencia,
              parcela_atual: receita.parcelaAtual || 1,
              total_parcelas: receita.totalParcelas || 1,
              valor_recebido: receita.valorRecebido || 0
            });
            result.details.receitas++;
          } catch (error) {
            console.warn(`Receita ${receita.descricao} erro:`, error);
          }
        }
        console.log(`✅ Migradas ${result.details.receitas} receitas`);
      } catch (error) {
        const errorMsg = `Erro ao migrar receitas: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }

      // Migrar pagamentos
      try {
        const pagamentos = financialDataService.getPagamentos();
        for (const pagamento of pagamentos) {
          try {
            // Buscar IDs das entidades relacionadas
            const despesas = await db.getDespesas();
            const receitas = await db.getReceitas();
            const contas = await db.getContasBancarias();

            const despesa = despesas.find(d => d.descricao === pagamento.despesaDescricao);
            const receita = receitas.find(r => r.descricao === pagamento.receitaDescricao);
            const conta = contas.find(c => c.nome === pagamento.contaBancaria);

            await db.createPagamento({
              despesa_id: despesa?.id,
              receita_id: receita?.id,
              valor: pagamento.valor,
              data_pagamento: new Date(pagamento.dataPagamento),
              forma_pagamento: pagamento.formaPagamento,
              conta_bancaria_id: conta?.id,
              observacoes: pagamento.observacoes
            });
            result.details.pagamentos++;
          } catch (error) {
            console.warn(`Pagamento erro:`, error);
          }
        }
        console.log(`✅ Migrados ${result.details.pagamentos} pagamentos`);
      } catch (error) {
        const errorMsg = `Erro ao migrar pagamentos: ${error}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }

      result.success = true;
      result.message = `Migração concluída com sucesso! Total: ${Object.values(result.details).reduce((a, b) => a + b, 0)} registros migrados.`;
      
      console.log('🎉 Migração concluída com sucesso!');
      console.log('📊 Resumo:', result.details);
      
      if (result.errors.length > 0) {
        console.warn('⚠️ Avisos durante a migração:', result.errors);
      }

    } catch (error) {
      result.success = false;
      result.message = `Erro durante a migração: ${error}`;
      result.errors.push(String(error));
      console.error('❌ Erro durante a migração:', error);
    }

    return result;
  }

  async clearAllData(): Promise<void> {
    console.log('🗑️ Limpando todos os dados do banco...');
    
    try {
      await db.query('TRUNCATE TABLE pagamentos CASCADE');
      await db.query('TRUNCATE TABLE despesas CASCADE');
      await db.query('TRUNCATE TABLE receitas CASCADE');
      await db.query('TRUNCATE TABLE contas_bancarias CASCADE');
      await db.query('TRUNCATE TABLE fornecedores CASCADE');
      await db.query('TRUNCATE TABLE categorias CASCADE');
      
      console.log('✅ Dados limpos com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      throw error;
    }
  }

  async initializeDatabase(): Promise<void> {
    console.log('🔧 Inicializando banco de dados...');
    
    try {
      // Ler e executar o script de schema
      const schemaResponse = await fetch('/database/schema.sql');
      const schemaScript = await schemaResponse.text();
      await db.executeScript(schemaScript);
      
      // Ler e executar o script de dados iniciais
      const seedResponse = await fetch('/database/seed.sql');
      const seedScript = await seedResponse.text();
      await db.executeScript(seedScript);
      
      console.log('✅ Banco de dados inicializado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao inicializar banco:', error);
      throw error;
    }
  }

  async checkDatabaseStatus(): Promise<{
    connected: boolean;
    tablesExist: boolean;
    hasData: boolean;
    counts: Record<string, number>;
  }> {
    try {
      // Se estamos no frontend, retornar status padrão
      if (typeof window !== 'undefined') {
        return {
          connected: false,
          tablesExist: false,
          hasData: false,
          counts: {}
        };
      }
      
      const connected = await db.testConnection();
      
      if (!connected) {
        return {
          connected: false,
          tablesExist: false,
          hasData: false,
          counts: {}
        };
      }

      // Verificar se as tabelas existem
      const tables = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('categorias', 'fornecedores', 'contas_bancarias', 'despesas', 'receitas', 'pagamentos')
      `);
      
      const tablesExist = (tables as { table_name: string }[]).length === 6;
      
      if (!tablesExist) {
        return {
          connected: true,
          tablesExist: false,
          hasData: false,
          counts: {}
        };
      }

      // Contar registros em cada tabela
      const counts: Record<string, number> = {};
      const tableNames = ['categorias', 'fornecedores', 'contas_bancarias', 'despesas', 'receitas', 'pagamentos'];
      
      for (const tableName of tableNames) {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        counts[tableName] = parseInt((result[0] as { count: string }).count);
      }

      const hasData = Object.values(counts).some(count => count > 0);

      return {
        connected: true,
        tablesExist: true,
        hasData,
        counts
      };
    } catch (error) {
      console.error('Erro ao verificar status do banco:', error);
      return {
        connected: false,
        tablesExist: false,
        hasData: false,
        counts: {}
      };
    }
  }
}

// Instância singleton
export const migrationService = MigrationService.getInstance();