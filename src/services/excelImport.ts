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

  async importFromFile(file: File): Promise<ExcelImportResult> {
    try {
      const data = await this.parseExcelFile(file);
      return await this.importData(data);
    } catch (error) {
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

  private async parseExcelFile(file: File): Promise<ExcelData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const excelData: ExcelData = {};
          
          // Processar cada aba do Excel
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            switch (sheetName.toLowerCase()) {
              case 'categorias':
                excelData.categorias = this.parseCategorias(jsonData);
                break;
              case 'fornecedores':
                excelData.fornecedores = this.parseFornecedores(jsonData);
                break;
              case 'contas_bancarias':
              case 'contas':
                excelData.contasBancarias = this.parseContasBancarias(jsonData);
                break;
              case 'despesas':
                excelData.despesas = this.parseDespesas(jsonData);
                break;
              case 'receitas':
                excelData.receitas = this.parseReceitas(jsonData);
                break;
            }
          });
          
          resolve(excelData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
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
        for (const categoria of data.categorias) {
          try {
            await this.dbService.createCategoria(categoria);
            result.imported.categorias++;
          } catch (error) {
            result.errors.push(`Erro ao importar categoria ${categoria.nome}: ${error}`);
          }
        }
      }

      // Importar fornecedores
      if (data.fornecedores && data.fornecedores.length > 0) {
        for (const fornecedor of data.fornecedores) {
          try {
            await this.dbService.createFornecedor(fornecedor);
            result.imported.fornecedores++;
          } catch (error) {
            result.errors.push(`Erro ao importar fornecedor ${fornecedor.nome}: ${error}`);
          }
        }
      }

      // Importar contas bancárias
      if (data.contasBancarias && data.contasBancarias.length > 0) {
        for (const conta of data.contasBancarias) {
          try {
            await this.dbService.createContaBancaria(conta);
            result.imported.contasBancarias++;
          } catch (error) {
            result.errors.push(`Erro ao importar conta ${conta.nome}: ${error}`);
          }
        }
      }

      // Importar despesas
      if (data.despesas && data.despesas.length > 0) {
        for (const despesa of data.despesas) {
          try {
            await this.dbService.createDespesa(despesa);
            result.imported.despesas++;
          } catch (error) {
            result.errors.push(`Erro ao importar despesa ${despesa.descricao}: ${error}`);
          }
        }
      }

      // Importar receitas
      if (data.receitas && data.receitas.length > 0) {
        for (const receita of data.receitas) {
          try {
            await this.dbService.createReceita(receita);
            result.imported.receitas++;
          } catch (error) {
            result.errors.push(`Erro ao importar receita ${receita.descricao}: ${error}`);
          }
        }
      }

      const totalImported = Object.values(result.imported).reduce((sum, count) => sum + count, 0);
      
      if (totalImported === 0) {
        result.success = false;
        result.message = 'Nenhum dado foi importado. Verifique o formato do arquivo Excel.';
      } else {
        result.message = `Importação concluída! ${totalImported} registros importados.`;
        if (result.errors.length > 0) {
          result.message += ` ${result.errors.length} erros encontrados.`;
        }
      }

    } catch (error) {
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