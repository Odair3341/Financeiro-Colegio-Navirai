require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    console.log('📊 Verificando dados nas tabelas...');
    
    const categorias = await pool.query('SELECT COUNT(*) FROM categorias');
    const fornecedores = await pool.query('SELECT COUNT(*) FROM fornecedores');
    const contas = await pool.query('SELECT COUNT(*) FROM contas_bancarias');
    const despesas = await pool.query('SELECT COUNT(*) FROM despesas');
    const receitas = await pool.query('SELECT COUNT(*) FROM receitas');
    
    console.log('\n📈 Dados encontrados:');
    console.log(`   Categorias: ${categorias.rows[0].count}`);
    console.log(`   Fornecedores: ${fornecedores.rows[0].count}`);
    console.log(`   Contas Bancárias: ${contas.rows[0].count}`);
    console.log(`   Despesas: ${despesas.rows[0].count}`);
    console.log(`   Receitas: ${receitas.rows[0].count}`);
    
    if (parseInt(categorias.rows[0].count) > 0) {
      console.log('\n✅ Sistema configurado com dados iniciais!');
    } else {
      console.log('\n⚠️  Tabelas criadas mas sem dados iniciais.');
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();