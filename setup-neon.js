#!/usr/bin/env node

/**
 * Script de Configuração Automática do Neon PostgreSQL
 * Sistema Financeiro CN
 * 
 * Este script:
 * 1. Testa a conexão com o banco Neon
 * 2. Cria todas as tabelas necessárias
 * 3. Insere dados iniciais
 * 4. Verifica a integridade da configuração
 * 5. Gera relatório de status
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Função para log colorido
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para log de erro
function logError(message) {
  log(`❌ ERRO: ${message}`, 'red');
}

// Função para log de sucesso
function logSuccess(message) {
  log(`✅ SUCESSO: ${message}`, 'green');
}

// Função para log de aviso
function logWarning(message) {
  log(`⚠️  AVISO: ${message}`, 'yellow');
}

// Função para log de info
function logInfo(message) {
  log(`ℹ️  INFO: ${message}`, 'blue');
}

// Função para log de progresso
function logProgress(message) {
  log(`🔄 ${message}`, 'cyan');
}

class NeonSetup {
  constructor() {
    this.client = null;
    this.setupReport = {
      startTime: new Date(),
      steps: [],
      errors: [],
      warnings: [],
      success: false
    };
  }

  // Adiciona step ao relatório
  addStep(step, status, details = '') {
    this.setupReport.steps.push({
      step,
      status,
      details,
      timestamp: new Date()
    });
  }

  // Adiciona erro ao relatório
  addError(error) {
    this.setupReport.errors.push({
      error: error.message || error,
      timestamp: new Date()
    });
  }

  // Adiciona aviso ao relatório
  addWarning(warning) {
    this.setupReport.warnings.push({
      warning,
      timestamp: new Date()
    });
  }

  // Verifica se as variáveis de ambiente estão configuradas
  checkEnvironmentVariables() {
    logProgress('Verificando variáveis de ambiente...');
    
    const requiredVars = ['DATABASE_URL'];
    const missingVars = [];
    
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length > 0) {
      const error = `Variáveis de ambiente faltando: ${missingVars.join(', ')}`;
      logError(error);
      this.addError(error);
      this.addStep('Verificação de Variáveis', 'FALHOU', error);
      return false;
    }
    
    logSuccess('Todas as variáveis de ambiente estão configuradas');
    this.addStep('Verificação de Variáveis', 'SUCESSO', 'Todas as variáveis necessárias encontradas');
    return true;
  }

  // Testa a conexão com o banco
  async testConnection() {
    logProgress('Testando conexão com o banco Neon...');
    
    try {
      this.client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
      
      await this.client.connect();
      
      // Testa uma query simples
      const result = await this.client.query('SELECT NOW() as current_time, version() as pg_version');
      
      logSuccess('Conexão com o banco estabelecida com sucesso!');
      logInfo(`Hora do servidor: ${result.rows[0].current_time}`);
      logInfo(`Versão PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}`);
      
      this.addStep('Teste de Conexão', 'SUCESSO', `PostgreSQL ${result.rows[0].pg_version.split(' ')[0]}`);
      return true;
      
    } catch (error) {
      logError(`Falha na conexão: ${error.message}`);
      this.addError(error);
      this.addStep('Teste de Conexão', 'FALHOU', error.message);
      
      // Sugestões de solução
      logWarning('Possíveis soluções:');
      log('  1. Verifique se a DATABASE_URL está correta no arquivo .env', 'yellow');
      log('  2. Confirme se o projeto Neon está ativo', 'yellow');
      log('  3. Verifique sua conexão com a internet', 'yellow');
      log('  4. Confirme se as credenciais não expiraram', 'yellow');
      
      return false;
    }
  }

  // Executa o schema SQL
  async executeSchema() {
    logProgress('Executando schema.sql para criar tabelas...');
    
    try {
      const schemaPath = path.join(__dirname, 'database', 'schema.sql');
      
      if (!fs.existsSync(schemaPath)) {
        const error = 'Arquivo schema.sql não encontrado em database/schema.sql';
        logError(error);
        this.addError(error);
        this.addStep('Execução do Schema', 'FALHOU', error);
        return false;
      }
      
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      // Executa o schema
      await this.client.query(schemaSQL);
      
      logSuccess('Schema executado com sucesso! Tabelas criadas.');
      this.addStep('Execução do Schema', 'SUCESSO', 'Todas as tabelas foram criadas');
      return true;
      
    } catch (error) {
      logError(`Erro ao executar schema: ${error.message}`);
      this.addError(error);
      this.addStep('Execução do Schema', 'FALHOU', error.message);
      return false;
    }
  }

  // Executa os dados iniciais
  async executeSeed() {
    logProgress('Executando seed.sql para inserir dados iniciais...');
    
    try {
      const seedPath = path.join(__dirname, 'database', 'seed.sql');
      
      if (!fs.existsSync(seedPath)) {
        const warning = 'Arquivo seed.sql não encontrado. Pulando inserção de dados iniciais.';
        logWarning(warning);
        this.addWarning(warning);
        this.addStep('Execução do Seed', 'PULADO', 'Arquivo seed.sql não encontrado');
        return true; // Não é um erro crítico
      }
      
      const seedSQL = fs.readFileSync(seedPath, 'utf8');
      
      // Executa o seed
      await this.client.query(seedSQL);
      
      logSuccess('Dados iniciais inseridos com sucesso!');
      this.addStep('Execução do Seed', 'SUCESSO', 'Dados iniciais inseridos');
      return true;
      
    } catch (error) {
      logError(`Erro ao executar seed: ${error.message}`);
      this.addError(error);
      this.addStep('Execução do Seed', 'FALHOU', error.message);
      return false;
    }
  }

  // Verifica se as tabelas foram criadas
  async verifyTables() {
    logProgress('Verificando se todas as tabelas foram criadas...');
    
    try {
      const expectedTables = [
        'categorias',
        'fornecedores', 
        'contas_bancarias',
        'despesas',
        'receitas',
        'pagamentos',
        'conciliacao_bancaria'
      ];
      
      const result = await this.client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      const existingTables = result.rows.map(row => row.table_name);
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        const error = `Tabelas faltando: ${missingTables.join(', ')}`;
        logError(error);
        this.addError(error);
        this.addStep('Verificação de Tabelas', 'FALHOU', error);
        return false;
      }
      
      logSuccess(`Todas as ${expectedTables.length} tabelas foram criadas com sucesso!`);
      logInfo(`Tabelas encontradas: ${existingTables.join(', ')}`);
      
      this.addStep('Verificação de Tabelas', 'SUCESSO', `${expectedTables.length} tabelas criadas`);
      return true;
      
    } catch (error) {
      logError(`Erro ao verificar tabelas: ${error.message}`);
      this.addError(error);
      this.addStep('Verificação de Tabelas', 'FALHOU', error.message);
      return false;
    }
  }

  // Verifica a estrutura das tabelas
  async verifyTableStructure() {
    logProgress('Verificando estrutura das tabelas...');
    
    try {
      const result = await this.client.query(`
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        ORDER BY table_name, ordinal_position
      `);
      
      const tableStructure = {};
      result.rows.forEach(row => {
        if (!tableStructure[row.table_name]) {
          tableStructure[row.table_name] = [];
        }
        tableStructure[row.table_name].push({
          column: row.column_name,
          type: row.data_type,
          nullable: row.is_nullable === 'YES'
        });
      });
      
      const tableCount = Object.keys(tableStructure).length;
      const columnCount = result.rows.length;
      
      logSuccess(`Estrutura verificada: ${tableCount} tabelas, ${columnCount} colunas`);
      this.addStep('Verificação de Estrutura', 'SUCESSO', `${tableCount} tabelas, ${columnCount} colunas`);
      
      return tableStructure;
      
    } catch (error) {
      logError(`Erro ao verificar estrutura: ${error.message}`);
      this.addError(error);
      this.addStep('Verificação de Estrutura', 'FALHOU', error.message);
      return null;
    }
  }

  // Gera relatório final
  generateReport() {
    this.setupReport.endTime = new Date();
    this.setupReport.duration = this.setupReport.endTime - this.setupReport.startTime;
    
    log('\n' + '='.repeat(60), 'bright');
    log('📊 RELATÓRIO DE CONFIGURAÇÃO DO NEON POSTGRESQL', 'bright');
    log('='.repeat(60), 'bright');
    
    log(`\n🕐 Início: ${this.setupReport.startTime.toLocaleString('pt-BR')}`);
    log(`🕐 Fim: ${this.setupReport.endTime.toLocaleString('pt-BR')}`);
    log(`⏱️  Duração: ${Math.round(this.setupReport.duration / 1000)}s`);
    
    log('\n📋 ETAPAS EXECUTADAS:', 'bright');
    this.setupReport.steps.forEach((step, index) => {
      const status = step.status === 'SUCESSO' ? '✅' : 
                    step.status === 'FALHOU' ? '❌' : 
                    step.status === 'PULADO' ? '⏭️' : '❓';
      log(`  ${index + 1}. ${status} ${step.step} - ${step.status}`);
      if (step.details) {
        log(`     ${step.details}`, 'cyan');
      }
    });
    
    if (this.setupReport.warnings.length > 0) {
      log('\n⚠️  AVISOS:', 'yellow');
      this.setupReport.warnings.forEach((warning, index) => {
        log(`  ${index + 1}. ${warning.warning}`, 'yellow');
      });
    }
    
    if (this.setupReport.errors.length > 0) {
      log('\n❌ ERROS:', 'red');
      this.setupReport.errors.forEach((error, index) => {
        log(`  ${index + 1}. ${error.error}`, 'red');
      });
    }
    
    const successSteps = this.setupReport.steps.filter(s => s.status === 'SUCESSO').length;
    const totalSteps = this.setupReport.steps.length;
    
    log('\n📈 RESUMO:', 'bright');
    log(`  • Etapas concluídas: ${successSteps}/${totalSteps}`);
    log(`  • Avisos: ${this.setupReport.warnings.length}`);
    log(`  • Erros: ${this.setupReport.errors.length}`);
    
    if (this.setupReport.success) {
      log('\n🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!', 'green');
      log('   Seu banco Neon PostgreSQL está pronto para uso.', 'green');
    } else {
      log('\n💥 CONFIGURAÇÃO FALHOU!', 'red');
      log('   Verifique os erros acima e tente novamente.', 'red');
    }
    
    log('\n' + '='.repeat(60), 'bright');
  }

  // Executa todo o processo de configuração
  async run() {
    try {
      log('🚀 INICIANDO CONFIGURAÇÃO DO NEON POSTGRESQL', 'bright');
      log('Sistema Financeiro CN\n', 'bright');
      
      // 1. Verificar variáveis de ambiente
      if (!this.checkEnvironmentVariables()) {
        this.generateReport();
        process.exit(1);
      }
      
      // 2. Testar conexão
      if (!await this.testConnection()) {
        this.generateReport();
        process.exit(1);
      }
      
      // 3. Executar schema
      if (!await this.executeSchema()) {
        this.generateReport();
        process.exit(1);
      }
      
      // 4. Executar seed (não crítico)
      await this.executeSeed();
      
      // 5. Verificar tabelas
      if (!await this.verifyTables()) {
        this.generateReport();
        process.exit(1);
      }
      
      // 6. Verificar estrutura
      await this.verifyTableStructure();
      
      this.setupReport.success = true;
      
    } catch (error) {
      logError(`Erro inesperado: ${error.message}`);
      this.addError(error);
    } finally {
      // Fechar conexão
      if (this.client) {
        await this.client.end();
      }
      
      // Gerar relatório
      this.generateReport();
      
      // Exit code
      process.exit(this.setupReport.success ? 0 : 1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new NeonSetup();
  setup.run();
}

module.exports = NeonSetup;