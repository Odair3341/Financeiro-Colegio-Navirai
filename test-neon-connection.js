// Script para testar conexão com Neon PostgreSQL
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  console.log('🔄 Testando conexão com Neon PostgreSQL...');
  console.log('📍 URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  try {
    // Teste básico de conexão
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Teste de query simples
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    console.log('⏰ Hora atual do servidor:', result.rows[0].current_time);
    console.log('🐘 Versão PostgreSQL:', result.rows[0].postgres_version.split(' ')[0]);
    
    // Verificar se as tabelas existem
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(tablesQuery);
    console.log('\n📊 Tabelas encontradas no banco:');
    
    if (tablesResult.rows.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada. Execute o script schema.sql primeiro.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }
    
    // Verificar tabelas esperadas
    const expectedTables = ['categorias', 'fornecedores', 'contas_bancarias', 'despesas', 'receitas', 'pagamentos'];
    const existingTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('\n🔍 Verificação de tabelas necessárias:');
    expectedTables.forEach(table => {
      const exists = existingTables.includes(table);
      console.log(`   ${exists ? '✅' : '❌'} ${table}`);
    });
    
    client.release();
    
    if (expectedTables.every(table => existingTables.includes(table))) {
      console.log('\n🎉 Todas as tabelas necessárias estão presentes!');
      console.log('✅ Sistema pronto para uso!');
    } else {
      console.log('\n⚠️  Algumas tabelas estão faltando.');
      console.log('📝 Execute o script database/schema.sql no seu banco Neon.');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Dicas para resolver:');
      console.log('   1. Verifique se a URL do banco está correta no .env');
      console.log('   2. Confirme se o projeto Neon está ativo');
      console.log('   3. Verifique sua conexão com a internet');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Dicas para resolver:');
      console.log('   1. Verifique as credenciais no .env');
      console.log('   2. Confirme se o usuário tem permissões adequadas');
    } else if (error.message.includes('SSL')) {
      console.log('\n💡 Dicas para resolver:');
      console.log('   1. Problema de SSL - verifique as configurações de segurança');
    }
  } finally {
    await pool.end();
    console.log('\n🔌 Conexão encerrada.');
  }
}

// Executar teste
testConnection().catch(console.error);