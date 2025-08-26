const XLSX = require('xlsx');
const fs = require('fs');

// Criar dados de teste
const categorias = [
  { nome: 'Alimentação', tipo: 'despesa', descricao: 'Gastos com alimentação' },
  { nome: 'Transporte', tipo: 'despesa', descricao: 'Gastos com transporte' },
  { nome: 'Salário', tipo: 'receita', descricao: 'Receita de salário' }
];

const fornecedores = [
  { nome: 'Supermercado ABC', cnpj: '12.345.678/0001-90', email: 'contato@abc.com', telefone: '(11) 1234-5678' },
  { nome: 'Posto de Gasolina XYZ', cnpj: '98.765.432/0001-10', email: 'vendas@xyz.com', telefone: '(11) 8765-4321' }
];

const contas = [
  { nome: 'Conta Corrente', banco: 'Banco do Brasil', agencia: '1234', conta: '56789-0', saldo: 1000.00 },
  { nome: 'Poupança', banco: 'Caixa Econômica', agencia: '5678', conta: '12345-6', saldo: 5000.00 }
];

const despesas = [
  { descricao: 'Compras no supermercado', valor: 150.50, data: '2024-01-15', categoria: 'Alimentação', fornecedor: 'Supermercado ABC', conta: 'Conta Corrente' },
  { descricao: 'Combustível', valor: 80.00, data: '2024-01-16', categoria: 'Transporte', fornecedor: 'Posto de Gasolina XYZ', conta: 'Conta Corrente' }
];

const receitas = [
  { descricao: 'Salário mensal', valor: 3000.00, data: '2024-01-01', categoria: 'Salário', conta: 'Conta Corrente' }
];

// Criar workbook
const wb = XLSX.utils.book_new();

// Adicionar planilhas
const wsCategorias = XLSX.utils.json_to_sheet(categorias);
XLSX.utils.book_append_sheet(wb, wsCategorias, 'categorias');

const wsFornecedores = XLSX.utils.json_to_sheet(fornecedores);
XLSX.utils.book_append_sheet(wb, wsFornecedores, 'fornecedores');

const wsContas = XLSX.utils.json_to_sheet(contas);
XLSX.utils.book_append_sheet(wb, wsContas, 'contas');

const wsDespesas = XLSX.utils.json_to_sheet(despesas);
XLSX.utils.book_append_sheet(wb, wsDespesas, 'despesas');

const wsReceitas = XLSX.utils.json_to_sheet(receitas);
XLSX.utils.book_append_sheet(wb, wsReceitas, 'receitas');

// Salvar arquivo
XLSX.writeFile(wb, 'exemplo_importacao.xlsx');
console.log('Arquivo exemplo_importacao.xlsx criado com sucesso!');