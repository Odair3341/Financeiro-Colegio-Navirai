const fs = require('fs');
const path = require('path');

// Lista de arquivos com conflitos
const files = [
  'src/components/ui/command.tsx',
  'src/pages/ImportacaoExcel.tsx',
  'src/components/ModalBaixaDespesa.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Despesas.tsx',
  'src/pages/Recebimentos.tsx',
  'src/components/ModalCliente.tsx',
  'src/services/financialData.ts',
  'src/pages/Conciliacao.tsx',
  'src/index.css',
  'src/components/ui/textarea.tsx',
  'src/components/AppSidebar.tsx',
  'src/components/ModalRecebimento.tsx'
];

console.log('🔧 Removendo marcadores de conflito...');

files.forEach(file => {
  try {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove todos os marcadores de conflito
    content = content.replace(/<<<<<<< HEAD\n/g, '');
    content = content.replace(/=======\n/g, '');
    content = content.replace(/>>>>>>> [a-f0-9]+\n/g, '');
    
    // Remove linhas vazias extras
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigido: ${file}`);
    
  } catch (error) {
    console.error(`❌ Erro ao processar ${file}:`, error.message);
  }
});

console.log('✨ Todos os marcadores de conflito foram removidos!');