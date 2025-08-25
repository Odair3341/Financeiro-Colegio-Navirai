// Script para criar tabelas no banco Neon
import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuração da conexão
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  console.log('🚀 Iniciando criação das tabelas no Neon PostgreSQL...');
  
  try {
    // Ler o arquivo schema.sql
    const schemaPath = join(__dirname, 'database', 'schema.sql');
    const schemaSql = readFileSync(schemaPath, 'utf8');
    
    console.log('📄 Arquivo schema.sql carregado com sucesso');
    
    // Conectar ao banco
    const client = await pool.connect();
    console.log('✅ Conectado ao banco Neon');
    
    // Executar o script SQL
    console.log('⚙️  Executando script de criação das tabelas...');
    await client.query(schemaSql);
    
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Verificar se as tabelas foram criadas
    const tablesQuery = `
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    
    console.log('\n📊 Tabelas criadas no banco:');
    result.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name} (${row.column_count} colunas)`);
    });
    
    // Inserir dados iniciais básicos
    console.log('\n🌱 Inserindo dados iniciais...');
    
    const initialData = `
      -- Categorias padrão
      INSERT INTO categorias (nome, tipo, cor, descricao) VALUES 
      ('Energia Elétrica', 'despesa', '#FF6B6B', 'Contas de energia elétrica'),
      ('Água e Esgoto', 'despesa', '#4ECDC4', 'Contas de água e esgoto'),
      ('Telefone/Internet', 'despesa', '#45B7D1', 'Contas de telefone e internet'),
      ('Aluguel', 'despesa', '#96CEB4', 'Pagamento de aluguel'),
      ('Vendas', 'receita', '#FFEAA7', 'Receitas de vendas'),
      ('Serviços', 'receita', '#DDA0DD', 'Receitas de prestação de serviços')
      ON CONFLICT (nome) DO NOTHING;
      
      -- Conta bancária padrão
      INSERT INTO contas_bancarias (nome, banco, tipo, saldo_inicial, saldo_atual) VALUES 
      ('Conta Principal', 'Banco Principal', 'corrente', 0, 0)
      ON CONFLICT DO NOTHING;
    `;
    
    await client.query(initialData);
    console.log('✅ Dados iniciais inseridos');
    
    client.release();
    
    console.log('\n🎉 Configuração do banco concluída com sucesso!');
    console.log('📝 O sistema está pronto para uso.');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n💡 Algumas tabelas já existem - isso é normal.');
    } else if (error.message.includes('permission denied')) {
      console.log('\n💡 Erro de permissão:');
      console.log('   1. Verifique se o usuário tem privilégios de criação');
      console.log('   2. Confirme se as credenciais estão corretas');
    }
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

// Executar criação das tabelas
createTables().catch(console.error);