import * as XLSX from 'xlsx';
import { financialDataService } from './financialData';
import type { Categoria, Fornecedor, ContaBancaria, Despesa, Receita } from './financialData';

export interface ExcelImportResult {
  success: boolean;
  message: string;
  imported: {
    categorias: number;
    fornecedores: number;
    contasBancarias: number;
    despesas: number;
    receitas: number;
  };
  errors: string[];
}

export interface ExcelData {
  categorias?: Categoria[];
  fornecedores?: Fornecedor[];
  contasBancarias?: ContaBancaria[];
  despesas?: Despesa[];
  receitas?: Receita[];
}

export class ExcelImportService {
  constructor() {
    // Usando financialDataService para operações de dados
  }

  // Método público para analisar arquivo Excel
  async parseExcelFile(file: File): Promise<XLSX.WorkBook> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('🔄 ExcelImportService: Convertendo arquivo para workbook...');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log('📋 ExcelImportService: Abas encontradas:', workbook.SheetNames);
          resolve(workbook);
        } catch (error) {
          console.error('❌ ExcelImportService: Erro durante parse:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ ExcelImportService: Erro ao ler arquivo');
        reject(new Error('Erro ao ler arquivo'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async importFromFile(file: File): Promise<ExcelImportResult> {
    try {
      console.log('📁 ExcelImport: Iniciando importação do arquivo:', {
        nome: file.name,
        tamanho: file.size,
        tipo: file.type,
        ultimaModificacao: new Date(file.lastModified).toLocaleString()
      });
      
      console.log('🔄 ExcelImport: Fazendo parse do arquivo Excel...');
      const data = await this.parseExcelData(file);
      console.log('✅ ExcelImport: Parse do arquivo concluído');
      
      console.log('📊 ExcelImport: Dados extraídos:', {
        categorias: data.categorias?.length || 0,
        fornecedores: data.fornecedores?.length || 0,
        contasBancarias: data.contasBancarias?.length || 0,
        despesas: data.despesas?.length || 0,
        receitas: data.receitas?.length || 0
      });
      
      console.log('🔄 ExcelImport: Iniciando importação dos dados...');
      const resultado = await this.importData(data);
      console.log('✅ ExcelImport: Importação concluída:', resultado);
      
      return resultado;
    } catch (error) {
      console.error('❌ ExcelImport: Erro na importação:', {
        error: error,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        message: `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        imported: {
          categorias: 0,
          fornecedores: 0,
          contasBancarias: 0,
          despesas: 0,
          receitas: 0
        },
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }

  public async parseExcelFile(file: File): Promise<XLSX.WorkBook> {
    console.log('📖 ExcelImportService: Iniciando leitura do arquivo Excel');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('🔄 ExcelImportService: Convertendo arquivo para workbook...');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log('📋 ExcelImportService: Abas encontradas:', workbook.SheetNames);
          console.log('🎯 ExcelImportService: Parse completo, workbook criado');
          resolve(workbook);
        } catch (error) {
          console.error('❌ ExcelImportService: Erro durante parse:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ ExcelImportService: Erro ao ler arquivo');
        reject(new Error('Erro ao ler arquivo'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private async parseExcelData(file: File): Promise<ExcelData> {
    console.log('📖 ExcelImportService: Iniciando leitura do arquivo Excel para dados');
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          console.log('🔄 ExcelImportService: Convertendo arquivo para workbook...');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          console.log('📋 ExcelImportService: Abas encontradas:', workbook.SheetNames);
          const excelData: ExcelData = {};
          
          // Processar cada aba do Excel
          workbook.SheetNames.forEach(sheetName => {
            console.log(`📄 ExcelImportService: Processando aba '${sheetName}'`);
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            console.log(`📊 ExcelImportService: Dados da aba '${sheetName}':`, jsonData.length, 'registros');
            console.log(`🔍 ExcelImportService: Primeira linha da aba '${sheetName}':`, jsonData[0] || 'Nenhuma linha encontrada');
            console.log(`📝 ExcelImportService: Colunas da aba '${sheetName}':`, jsonData.length > 0 ? Object.keys(jsonData[0]) : []);
            
            const normalizedSheetName = sheetName.toLowerCase().replace(/[\s_-]/g, '');
            console.log(`🏷️ ExcelImportService: Nome normalizado da aba: '${normalizedSheetName}'`);
            
            switch (normalizedSheetName) {
              case 'categorias':
                console.log('🏷️ ExcelImportService: Parseando categorias...');
                excelData.categorias = this.parseCategorias(jsonData);
                console.log('✅ ExcelImportService: Categorias parseadas:', excelData.categorias?.length);
                break;
              case 'fornecedores':
                console.log('🏢 ExcelImportService: Parseando fornecedores...');
                excelData.fornecedores = this.parseFornecedores(jsonData);
                console.log('✅ ExcelImportService: Fornecedores parseados:', excelData.fornecedores?.length);
                break;
              case 'contasbancarias':
              case 'contas':
                console.log('🏦 ExcelImportService: Parseando contas bancárias...');
                excelData.contasBancarias = this.parseContasBancarias(jsonData);
                console.log('✅ ExcelImportService: Contas parseadas:', excelData.contasBancarias?.length);
                break;
              case 'despesas':
                console.log('💸 ExcelImportService: Parseando despesas...');
                excelData.despesas = this.parseDespesas(jsonData);
                console.log('✅ ExcelImportService: Despesas parseadas:', excelData.despesas?.length);
                break;
              case 'receitas':
                console.log('💰 ExcelImportService: Parseando receitas...');
                excelData.receitas = this.parseReceitas(jsonData);
                console.log('✅ ExcelImportService: Receitas parseadas:', excelData.receitas?.length);
                break;
              default:
            // Se não é uma aba especial (categorias, fornecedores), trata como dados financeiros
            console.log(`💰 ExcelImportService: Tratando aba '${sheetName}' como dados financeiros...`);
            const despesasAba = this.parseDespesasFinanceiras(jsonData, sheetName);
            if (despesasAba.length > 0) {
              if (!excelData.despesas) excelData.despesas = [];
              excelData.despesas.push(...despesasAba);
              console.log(`✅ ExcelImportService: ${despesasAba.length} registros financeiros parseados da aba '${sheetName}'`);
            }
            }
          });
          
          console.log('🎯 ExcelImportService: Parse completo, dados finais:', excelData);
          resolve(excelData);
        } catch (error) {
          console.error('❌ ExcelImportService: Erro durante parse:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        console.error('❌ ExcelImportService: Erro ao ler arquivo');
        reject(new Error('Erro ao ler arquivo'));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private parseCategorias(data: unknown[]): Categoria[] {
    return data.map((row, index) => {
      try {
        return {
          id: row.id || `cat_${Date.now()}_${index}`,
          nome: row.nome || row.name || '',
          tipo: row.tipo || row.type || 'despesa',
          descricao: row.descricao || row.description || ''
        };
      } catch (error) {
        throw new Error(`Erro na linha ${index + 1} de categorias: ${error}`);
      }
    });
  }

  private parseFornecedores(data: unknown[]): Fornecedor[] {
    return data.map((row, index) => {
      try {
        return {
          id: row.id || `forn_${Date.now()}_${index}`,
          nome: row.nome || row.name || '',
          cnpj: row.cnpj || '',
          email: row.email || '',
          telefone: row.telefone || row.phone || '',
          endereco: row.endereco || row.address || ''
        };
      } catch (error) {
        throw new Error(`Erro na linha ${index + 1} de fornecedores: ${error}`);
      }
    });
  }

  private parseContasBancarias(data: unknown[]): ContaBancaria[] {
    return data.map((row, index) => {
      try {
        return {
          id: row.id || `conta_${Date.now()}_${index}`,
          nome: row.nome || row.name || '',
          banco: row.banco || row.bank || '',
          agencia: row.agencia || row.agency || '',
          conta: row.conta || row.account || '',
          saldo: parseFloat(row.saldo || row.balance || '0') || 0,
          tipo: row.tipo || row.type || 'corrente'
        };
      } catch (error) {
        throw new Error(`Erro na linha ${index + 1} de contas bancárias: ${error}`);
      }
    });
  }

  private parseDespesas(data: unknown[]): Despesa[] {
    return data.map((row, index) => {
      try {
        return {
          id: row.id || `desp_${Date.now()}_${index}`,
          descricao: row.descricao || row.description || '',
          valor: parseFloat(row.valor || row.value || '0') || 0,
          dataVencimento: this.parseDate(row.dataVencimento || row.dueDate || row.data_vencimento),
          dataPagamento: this.parseDate(row.dataPagamento || row.paymentDate || row.data_pagamento),
          categoriaId: row.categoriaId || row.categoryId || row.categoria_id || '',
          fornecedorId: row.fornecedorId || row.supplierId || row.fornecedor_id || '',
          status: row.status || 'pendente',
          observacoes: row.observacoes || row.notes || row.observations || ''
        };
      } catch (error) {
        throw new Error(`Erro na linha ${index + 1} de despesas: ${error}`);
      }
    });
  }

  private parseDespesasFinanceiras(data: unknown[], nomeAba: string): Despesa[] {
    const despesas: Despesa[] = [];
    
    data.forEach((row, index) => {
      try {
        // Buscar campos da planilha real
        const fornecedor = row['FORNECEDOR'] || row['CLIENTE'] || row['Nome'] || '';
        const descricao = row['DESCRIÇÃO'] || row['DESCRIÇÃO '] || row['Descrição'] || '';
        const valorStr = row['VALOR'] || row['Valor'] || '';
        const vencimento = row['VENCIMENTO'] || row['Data'] || '';
        const grupo = row['GRUPO'] || row['Categoria'] || 'Diversos';
        const situacao = row['SITUAÇÃO'] || row['Status'] || 'pendente';
        const obs1 = row['OBS 1'] || row['Observações'] || '';
        const empresa = row['EMPRESA'] || row['OBS 2'] || 'Empresa Padrão';
        
        // Processar valor
        let valor = 0;
        if (valorStr) {
          const valorLimpo = String(valorStr).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
          valor = parseFloat(valorLimpo) || 0;
        }
        
        // Processar data
        let dataVencimento = '';
        if (vencimento) {
          if (typeof vencimento === 'number') {
            // Data do Excel (número serial)
            const date = new Date((vencimento - 25569) * 86400 * 1000);
            dataVencimento = date.toISOString().split('T')[0];
          } else {
            // String de data
            const parts = String(vencimento).split('/');
            if (parts.length === 3) {
              const dia = parts[0].padStart(2, '0');
              const mes = parts[1].padStart(2, '0');
              const ano = parts[2].length === 2 ? '20' + parts[2] : parts[2];
              dataVencimento = `${ano}-${mes}-${dia}`;
            }
          }
        }
        
        // Só adicionar se tiver dados mínimos
        if (fornecedor && String(fornecedor).trim() && valor > 0) {
          despesas.push({
            id: `desp_${nomeAba}_${Date.now()}_${index}`,
            descricao: String(descricao).trim() || String(fornecedor).trim(),
            valor: valor,
            dataVencimento: this.parseDate(vencimento),
            dataPagamento: undefined,
            categoriaId: String(grupo),
            fornecedorId: `forn_${String(fornecedor).toLowerCase().replace(/\s+/g, '_')}`,
            status: String(situacao).toLowerCase().includes('pago') ? 'pago_total' : 'pendente',
            observacoes: `Aba: ${nomeAba} | Empresa: ${empresa} | Obs: ${obs1}`
          });
        }
      } catch (error) {
        console.error(`Erro ao processar linha ${index + 1} da aba ${nomeAba}:`, error);
      }
    });
    
    return despesas;
  }

  private parseReceitas(data: unknown[]): Receita[] {
    return data.map((row, index) => {
      try {
        return {
          id: row.id || `rec_${Date.now()}_${index}`,
          descricao: row.descricao || row.description || '',
          valor: parseFloat(row.valor || row.value || '0') || 0,
          dataRecebimento: this.parseDate(row.dataRecebimento || row.receiptDate || row.data_recebimento),
          categoriaId: row.categoriaId || row.categoryId || row.categoria_id || '',
          status: row.status || 'pendente',
          observacoes: row.observacoes || row.notes || row.observations || ''
        };
      } catch (error) {
        throw new Error(`Erro na linha ${index + 1} de receitas: ${error}`);
      }
    });
  }
    return data.map((row, index) => {
      try {
        return {
          id: row.id || `rec_${Date.now()}_${index}`,
          descricao: row.descricao || row.description || '',
          valor: parseFloat(row.valor || row.value || '0') || 0,
          dataRecebimento: this.parseDate(row.dataRecebimento || row.receiptDate || row.data_recebimento),
          categoriaId: row.categoriaId || row.categoryId || row.categoria_id || '',
          status: row.status || 'pendente',
          observacoes: row.observacoes || row.notes || row.observations || ''
        };
      } catch (error) {
        throw new Error(`Erro na linha ${index + 1} de receitas: ${error}`);
      }
    });
  }

  private parseDate(dateValue: unknown): string {
    if (!dateValue) return '';
    
    try {
      // Se já é uma string no formato ISO
      if (typeof dateValue === 'string' && dateValue.includes('-')) {
        return dateValue;
      }
      
      // Se é um número (Excel date serial)
      if (typeof dateValue === 'number') {
        const date = XLSX.SSF.parse_date_code(dateValue);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      
      // Tentar converter para Date
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return '';
    } catch (error) {
      return '';
    }
  }

  private async importData(data: ExcelData): Promise<ExcelImportResult> {
    console.log('💾 ExcelImportService: Iniciando importData com:', data);
    console.log('🔧 ExcelImportService: Verificando financialDataService:', {
      service: typeof financialDataService,
      saveCategoria: typeof financialDataService?.saveCategoria,
      saveFornecedor: typeof financialDataService?.saveFornecedor,
      saveContaBancaria: typeof financialDataService?.saveContaBancaria,
      saveDespesa: typeof financialDataService?.saveDespesa,
      saveReceita: typeof financialDataService?.saveReceita
    });
    
    const result: ExcelImportResult = {
      success: true,
      message: '',
      imported: {
        categorias: 0,
        fornecedores: 0,
        contasBancarias: 0,
        despesas: 0,
        receitas: 0
      },
      errors: []
    };

    try {
      // Importar categorias primeiro (dependência para despesas/receitas)
      if (data.categorias && data.categorias.length > 0) {
        console.log('🏷️ ExcelImportService: Importando', data.categorias.length, 'categorias...');
        for (const categoria of data.categorias) {
          try {
            console.log('➕ ExcelImportService: Adicionando categoria:', categoria);
            const result_categoria = await financialDataService.saveCategoria(categoria);
            console.log('✅ ExcelImportService: Categoria adicionada:', result_categoria);
            result.imported.categorias++;
            console.log('✅ ExcelImportService: Categoria adicionada com sucesso');
          } catch (error) {
            console.error('❌ ExcelImportService: Erro ao adicionar categoria:', error);
            result.errors.push(`Erro ao importar categoria ${categoria.nome}: ${error}`);
          }
        }
      }

      // Antes de importar despesas, criar fornecedores automaticamente
      const fornecedoresParaCriar = new Map<string, string>();
      
      if (data.despesas && data.despesas.length > 0) {
        console.log('📈 ExcelImportService: Analisando fornecedores das despesas...');
        
        // Extrair fornecedores únicos das despesas
        data.despesas.forEach(despesa => {
          if (despesa.fornecedorId && !fornecedoresParaCriar.has(despesa.fornecedorId)) {
            // Extrair nome do fornecedor do ID (formato: forn_nome_formatado)
            const nomeFornecedor = despesa.fornecedorId.replace('forn_', '').replace(/_/g, ' ');
            fornecedoresParaCriar.set(despesa.fornecedorId, nomeFornecedor);
          }
        });
        
        console.log(`🏢 ExcelImportService: Criando ${fornecedoresParaCriar.size} fornecedores...`);
        
        // Criar fornecedores
        for (const [fornecedorId, nomeFornecedor] of fornecedoresParaCriar) {
          try {
            const novoFornecedor = {
              id: fornecedorId,
              nome: nomeFornecedor,
              documento: `${Math.floor(Math.random() * 90000000000) + 10000000000}/0001-${Math.floor(Math.random() * 90) + 10}`,
              tipo: 'pj' as const,
              email: `${nomeFornecedor.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@email.com`,
              telefone: `(67) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`,
              endereco: 'Endereço não informado',
              ativo: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            
            financialDataService.saveFornecedor(novoFornecedor);
            result.imported.fornecedores++;
            console.log(`✅ ExcelImportService: Fornecedor '${nomeFornecedor}' criado`);
          } catch (error) {
            console.error(`❌ ExcelImportService: Erro ao criar fornecedor '${nomeFornecedor}':`, error);
            result.errors.push(`Erro ao criar fornecedor ${nomeFornecedor}: ${error}`);
          }
        }
      }

      // Importar contas bancárias
      if (data.contasBancarias && data.contasBancarias.length > 0) {
        console.log('🏦 ExcelImportService: Importando', data.contasBancarias.length, 'contas bancárias...');
        for (const conta of data.contasBancarias) {
          try {
            console.log('➕ ExcelImportService: Adicionando conta bancária:', conta);
            financialDataService.saveContaBancaria(conta);
            result.imported.contasBancarias++;
            console.log('✅ ExcelImportService: Conta bancária adicionada com sucesso');
          } catch (error) {
            console.error('❌ ExcelImportService: Erro ao adicionar conta bancária:', error);
            result.errors.push(`Erro ao importar conta ${conta.nome}: ${error}`);
          }
        }
      }

      // Importar despesas
      if (data.despesas && data.despesas.length > 0) {
        console.log('💸 ExcelImportService: Importando', data.despesas.length, 'despesas...');
        for (const despesa of data.despesas) {
          try {
            console.log('➕ ExcelImportService: Adicionando despesa:', despesa);
            
            // Converter para o formato esperado pelo financialDataService
            const despesaFormatada = {
              empresaId: '1', // Empresa padrão
              fornecedorId: despesa.fornecedorId || 'fornecedor_default',
              descricao: despesa.descricao,
              valor: despesa.valor,
              vencimento: despesa.dataVencimento || new Date().toISOString().split('T')[0],
              categoria: despesa.categoriaId || 'Diversos',
              status: despesa.status || 'pendente',
              valorPago: despesa.status === 'pago_total' ? despesa.valor : 0,
              observacoes: despesa.observacoes || '',
              numeroDocumento: `DESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            
            financialDataService.saveDespesa(despesaFormatada);
            result.imported.despesas++;
            console.log('✅ ExcelImportService: Despesa adicionada com sucesso');
          } catch (error) {
            console.error('❌ ExcelImportService: Erro ao adicionar despesa:', error);
            result.errors.push(`Erro ao importar despesa ${despesa.descricao}: ${error}`);
          }
        }
      }

      // Importar receitas
      if (data.receitas && data.receitas.length > 0) {
        console.log('💰 ExcelImportService: Importando', data.receitas.length, 'receitas...');
        for (const receita of data.receitas) {
          try {
            console.log('➕ ExcelImportService: Adicionando receita:', receita);
            const result_receita = await financialDataService.saveReceita(receita);
            console.log('✅ ExcelImportService: Receita adicionada:', result_receita);
            result.imported.receitas++;
            console.log('✅ ExcelImportService: Receita adicionada com sucesso');
          } catch (error) {
            console.error('❌ ExcelImportService: Erro ao adicionar receita:', error);
            result.errors.push(`Erro ao importar receita ${receita.descricao}: ${error}`);
          }
        }
      }

      const totalImported = Object.values(result.imported).reduce((sum, count) => sum + count, 0);
      
      console.log('📊 ExcelImportService: Resumo da importação:', {
        categorias: result.imported.categorias,
        fornecedores: result.imported.fornecedores,
        contasBancarias: result.imported.contasBancarias,
        despesas: result.imported.despesas,
        receitas: result.imported.receitas,
        totalErros: result.errors.length
      });
      
      if (totalImported === 0) {
        result.success = false;
        result.message = 'Nenhum dado foi importado. Verifique o formato do arquivo Excel.';
        console.log('⚠️ ExcelImportService: Nenhum dado importado');
      } else {
        result.message = `Importação concluída! ${totalImported} registros importados.`;
        if (result.errors.length > 0) {
          result.message += ` ${result.errors.length} erros encontrados.`;
          console.log('⚠️ ExcelImportService: Importação com erros:', result.errors);
        } else {
          console.log('🎉 ExcelImportService: Importação realizada com sucesso!');
        }
      }

    } catch (error) {
      console.error('💥 ExcelImportService: Erro crítico durante importação:', error);
      result.success = false;
      result.message = `Erro durante a importação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      result.errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
    }

    return result;
  }

  // Método para gerar template Excel
  generateTemplate(): void {
    const wb = XLSX.utils.book_new();

    // Template para categorias
    const categoriasData = [
      { nome: 'Alimentação', tipo: 'despesa', descricao: 'Gastos com alimentação' },
      { nome: 'Transporte', tipo: 'despesa', descricao: 'Gastos com transporte' },
      { nome: 'Salário', tipo: 'receita', descricao: 'Receita de salário' }
    ];
    const wsCategoria = XLSX.utils.json_to_sheet(categoriasData);
    XLSX.utils.book_append_sheet(wb, wsCategoria, 'categorias');

    // Template para fornecedores
    const fornecedoresData = [
      { nome: 'Fornecedor A', cnpj: '12.345.678/0001-90', email: 'contato@fornecedora.com', telefone: '(11) 1234-5678', endereco: 'Rua A, 123' },
      { nome: 'Fornecedor B', cnpj: '98.765.432/0001-10', email: 'contato@fornecedorb.com', telefone: '(11) 8765-4321', endereco: 'Rua B, 456' }
    ];
    const wsFornecedor = XLSX.utils.json_to_sheet(fornecedoresData);
    XLSX.utils.book_append_sheet(wb, wsFornecedor, 'fornecedores');

    // Template para contas bancárias
    const contasData = [
      { nome: 'Conta Corrente Principal', banco: 'Banco do Brasil', agencia: '1234-5', conta: '12345-6', saldo: 5000, tipo: 'corrente' },
      { nome: 'Poupança', banco: 'Caixa Econômica', agencia: '6789-0', conta: '67890-1', saldo: 10000, tipo: 'poupanca' }
    ];
    const wsContas = XLSX.utils.json_to_sheet(contasData);
    XLSX.utils.book_append_sheet(wb, wsContas, 'contas_bancarias');

    // Template para despesas
    const despesasData = [
      { descricao: 'Conta de luz', valor: 150.50, dataVencimento: '2024-01-15', categoriaId: '', fornecedorId: '', status: 'pendente', observacoes: '' },
      { descricao: 'Aluguel', valor: 1200.00, dataVencimento: '2024-01-10', categoriaId: '', fornecedorId: '', status: 'pago', dataPagamento: '2024-01-10', observacoes: '' }
    ];
    const wsDespesas = XLSX.utils.json_to_sheet(despesasData);
    XLSX.utils.book_append_sheet(wb, wsDespesas, 'despesas');

    // Template para receitas
    const receitasData = [
      { descricao: 'Salário', valor: 5000.00, dataRecebimento: '2024-01-05', categoriaId: '', status: 'recebido', observacoes: '' },
      { descricao: 'Freelance', valor: 800.00, dataRecebimento: '2024-01-20', categoriaId: '', status: 'pendente', observacoes: '' }
    ];
    const wsReceitas = XLSX.utils.json_to_sheet(receitasData);
    XLSX.utils.book_append_sheet(wb, wsReceitas, 'receitas');

    // Fazer download do template
    XLSX.writeFile(wb, 'template_financeiro.xlsx');
  }
}