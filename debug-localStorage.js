// Script de debug para verificar localStorage
console.log('=== DEBUG LOCALSTORAGE ===');

// Verificar todas as chaves do localStorage
console.log('Chaves no localStorage:', Object.keys(localStorage));

// Verificar dados específicos do FinanceFlow
const keys = ['financeflow_empresas', 'financeflow_fornecedores', 'financeflow_despesas', 'financeflow_contas_bancarias'];

keys.forEach(key => {
  const data = localStorage.getItem(key);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      console.log(`${key}:`, parsed.length, 'items');
      console.log(`${key} dados:`, parsed);
    } catch (e) {
      console.log(`${key}: erro ao parsear`, data);
    }
  } else {
    console.log(`${key}: não encontrado`);
  }
});

// Forçar inicialização do serviço
console.log('\n=== FORÇANDO INICIALIZAÇÃO ===');
import('./src/services/financialData.js').then(module => {
  console.log('Módulo carregado:', module);
  const service = module.financialDataService;
  console.log('Serviço:', service);
  
  // Verificar dados após inicialização
  console.log('Empresas:', service.getEmpresas());
  console.log('Fornecedores:', service.getFornecedores());
  console.log('Despesas:', service.getDespesas());
  console.log('Contas:', service.getContasBancarias());
}).catch(err => {
  console.error('Erro ao carregar módulo:', err);
});