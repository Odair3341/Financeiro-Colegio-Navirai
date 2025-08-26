const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Caminho para o arquivo Excel
const excelPath = path.join(__dirname, 'uploads', 'Fluxo de caixa - Grupo CN 2024_2025.xlsx');

console.log('=== ANÁLISE DO ARQUIVO EXCEL ===');
console.log('Arquivo:', excelPath);

// Verificar se o arquivo existe
if (!fs.existsSync(excelPath)) {
    console.error('❌ Arquivo não encontrado:', excelPath);
    console.log('\nArquivos na pasta uploads:');
    const uploadsPath = path.join(__dirname, 'uploads');
    if (fs.existsSync(uploadsPath)) {
        const files = fs.readdirSync(uploadsPath);
        files.forEach(file => console.log('  -', file));
    } else {
        console.log('  Pasta uploads não existe');
    }
    process.exit(1);
}

try {
    // Ler o arquivo Excel
    const workbook = XLSX.readFile(excelPath);
    
    console.log('\n✅ Arquivo carregado com sucesso!');
    console.log('\n=== INFORMAÇÕES GERAIS ===');
    console.log('Total de abas:', workbook.SheetNames.length);
    console.log('Nomes das abas:', workbook.SheetNames);
    
    // Analisar cada aba
    workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`\n=== ABA ${index + 1}: "${sheetName}" ===`);
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('Total de linhas:', jsonData.length);
        
        if (jsonData.length === 0) {
            console.log('⚠️  Aba vazia');
            return;
        }
        
        // Mostrar as primeiras 3 linhas
        console.log('\nPrimeiras 3 linhas:');
        for (let i = 0; i < Math.min(3, jsonData.length); i++) {
            console.log(`  Linha ${i + 1}:`, jsonData[i]);
        }
        
        // Identificar colunas (primeira linha não vazia)
        let headerRow = null;
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i] && jsonData[i].length > 0) {
                headerRow = jsonData[i];
                break;
            }
        }
        
        if (headerRow) {
            console.log('\nColunas identificadas:');
            headerRow.forEach((col, idx) => {
                if (col !== undefined && col !== null && col !== '') {
                    console.log(`  ${idx + 1}. "${col}"`);
                }
            });
        }
        
        // Verificar se corresponde aos padrões esperados
        const sheetNameLower = sheetName.toLowerCase();
        console.log('\n🔍 Análise de correspondência:');
        
        if (sheetNameLower.includes('categoria') || sheetNameLower.includes('category')) {
            console.log('  ✅ Possível aba de CATEGORIAS');
        } else if (sheetNameLower.includes('fornecedor') || sheetNameLower.includes('supplier')) {
            console.log('  ✅ Possível aba de FORNECEDORES');
        } else if (sheetNameLower.includes('conta') || sheetNameLower.includes('bank')) {
            console.log('  ✅ Possível aba de CONTAS BANCÁRIAS');
        } else if (sheetNameLower.includes('despesa') || sheetNameLower.includes('expense')) {
            console.log('  ✅ Possível aba de DESPESAS');
        } else if (sheetNameLower.includes('receita') || sheetNameLower.includes('revenue') || sheetNameLower.includes('income')) {
            console.log('  ✅ Possível aba de RECEITAS');
        } else {
            console.log('  ❓ Tipo de aba não identificado automaticamente');
        }
        
        // Verificar dados válidos (linhas não vazias)
        const validRows = jsonData.filter(row => 
            row && row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== '')
        );
        console.log(`Linhas com dados válidos: ${validRows.length}`);
    });
    
    console.log('\n=== RESUMO DA ANÁLISE ===');
    console.log('📊 Resultados da importação reportados:');
    console.log('  - 0 Categorias');
    console.log('  - 323 Fornecedores');
    console.log('  - 0 Contas Bancárias');
    console.log('  - 3012 Despesas');
    console.log('  - 0 Receitas');
    
    console.log('\n🔍 Possíveis causas do problema:');
    console.log('1. Nomes das abas não correspondem aos padrões esperados');
    console.log('2. Estrutura das colunas diferente do esperado');
    console.log('3. Dados em formato não reconhecido pelo parser');
    console.log('4. Linhas de cabeçalho em posições diferentes');
    
} catch (error) {
    console.error('❌ Erro ao processar arquivo:', error.message);
    console.error('Stack trace:', error.stack);
}