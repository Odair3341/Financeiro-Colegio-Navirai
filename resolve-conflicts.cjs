const fs = require('fs');
const path = require('path');

// Lista de arquivos com conflitos
const conflictFiles = [
  'src/components/AppSidebar.tsx',
  'src/pages/Recebimentos.tsx',
  'src/pages/Despesas.tsx',
  'src/pages/ImportacaoExcel.tsx',
  'src/pages/Conciliacao.tsx',
  'src/index.css',
  'src/pages/Dashboard.tsx',
  'src/components/ModalRecebimento.tsx',
  'src/services/financialData.ts',
  'src/components/ui/command.tsx',
  'src/pages/Categorias.tsx',
  'src/components/ModalCliente.tsx',
  'src/components/ui/textarea.tsx',
  'src/components/ModalBaixaDespesa.tsx'
];

function resolveConflicts(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remove conflict markers and keep HEAD version
    content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n[\s\S]*?>>>>>>> [a-f0-9]+\n?/g, '$1');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Resolvido: ${filePath}`);
  } catch (error) {
    console.error(`❌ Erro ao resolver ${filePath}:`, error.message);
  }
}

console.log('🔧 Resolvendo conflitos de merge...');
conflictFiles.forEach(resolveConflicts);
console.log('✨ Todos os conflitos foram resolvidos!');