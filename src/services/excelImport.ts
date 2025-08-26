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
          
          // Inicializar arrays para dados extraídos
          const categoriasSet = new Set<string>();
          const contasSet = new Set<string>();
          const receitasArray: Receita[] = [];
          const despesasArray: Despesa[] = [];
          
          // Processar cada aba do Excel
          workbook.SheetNames.forEach(sheetName => {
            console.log(`📄 ExcelImportService: Processando aba '${sheetName}'`);
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            console.log(`📊 ExcelImportService: Dados da aba '${sheetName}':`, jsonData.length, 'registros');
            console.log(`🔍 ExcelImportService: Primeira linha da aba '${sheetName}':`, jsonData[0] || 'Nenhuma linha encontrada');
            console.log(`📝 ExcelImportService: Colunas da aba '${sheetName}':`, jsonData.length > 0 ? Object.keys(jsonData[0]) : []);
            
            const normalizedSheetName = sheetName
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '') // Remove acentos
              .toLowerCase()
              .replace(/[^a-z0-9]/g, ''); // Remove espaços, hífens, etc.
            console.log(`🏷️ ExcelImportService: Nome normalizado da aba: '${normalizedSheetName}'`);
            
            // Verificar se é uma aba específica (categorias, fornecedores, etc.)
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
                // Verificar se é uma aba mensal (formato: Jan 2024, Fev 2024, etc.)
                if (this.isMonthlySheet(sheetName)) {
                  console.log(`📅 ExcelImportService: Processando aba mensal '${sheetName}'...`);
                  
                  // Extrair dados da aba mensal
                  const dadosAba = this.parseMonthlySheetData(jsonData, sheetName);
                  
                  // Adicionar categorias únicas
                  dadosAba.categorias.forEach(cat => categoriasSet.add(cat));
                  
                  // Adicionar contas únicas
                  dadosAba.contas.forEach(conta => contasSet.add(conta));
                  
                  // Adicionar receitas
                  receitasArray.push(...dadosAba.receitas);
                  
                  // Adicionar despesas
                  despesasArray.push(...dadosAba.despesas);
                  
                  console.log(`✅ ExcelImportService: Aba mensal '${sheetName}' processada:`, {
                    categorias: dadosAba.categorias.length,
                    contas: dadosAba.contas.length,
                    receitas: dadosAba.receitas.length,
                    despesas: dadosAba.despesas.length
                  });
                } else {
                  // Tratar como dados financeiros genéricos (compatibilidade)
                  console.log(`💰 ExcelImportService: Tratando aba '${sheetName}' como dados financeiros...`);
                  const despesasAba = this.parseDespesasFinanceiras(jsonData, sheetName);
                  if (despesasAba.length > 0) {
                    despesasArray.push(...despesasAba);
                    console.log(`✅ ExcelImportService: ${despesasAba.length} registros financeiros parseados da aba '${sheetName}'`);
                  }
                }
            }
          });
          
          // Converter categorias extraídas para o formato correto
          if (categoriasSet.size > 0 && !excelData.categorias) {
            excelData.categorias = Array.from(categoriasSet).map((nome, index) => ({
              id: `cat_${Date.now()}_${index}`,
              nome: nome,
              tipo: 'despesa' as const,
              cor: '#cccccc',
              ativo: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            console.log(`✅ ExcelImportService: ${excelData.categorias.length} categorias extraídas das abas mensais`);
          }
          
          // Converter contas extraídas para o formato correto
          if (contasSet.size > 0 && !excelData.contasBancarias) {
            excelData.contasBancarias = Array.from(contasSet).map((nome, index) => ({
              id: `conta_${Date.now()}_${index}`,
              nome: nome,
              banco: 'Banco não informado',
              agencia: '0000',
              conta: '00000-0',
              saldo: 0,
              tipo: 'corrente' as const,
              ativo: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }));
            console.log(`✅ ExcelImportService: ${excelData.contasBancarias.length} contas bancárias extraídas das abas mensais`);
          }
          
          // Adicionar receitas extraídas
          if (receitasArray.length > 0 && !excelData.receitas) {
            excelData.receitas = receitasArray;
            console.log(`✅ ExcelImportService: ${excelData.receitas.length} receitas extraídas das abas mensais`);
          }
          
          // Adicionar despesas extraídas
          if (despesasArray.length > 0) {
            if (!excelData.despesas) excelData.despesas = [];
            excelData.despesas.push(...despesasArray);
            console.log(`✅ ExcelImportService: ${despesasArray.length} despesas extraídas das abas mensais`);
          }
          
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
    const items = (data as any[]) || [];
    return items.map((row, index) => ({
      id: row.id ?? `cat_${Date.now()}_${index}`,
      nome: row.nome ?? row.name ?? '',
      tipo: (row.tipo ?? row.type) ?? 'despesa',
      cor: row.cor ?? '#cccccc',
      ativo: row.ativo ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

private parseFornecedores(data: unknown[]): Fornecedor[] {
  const items = (data as any[]) || [];
  return items.map((row: any, index: number) => ({
    id: row.id ?? `forn_${Date.now()}_${index}`,
    nome: row.nome ?? row.name ?? '',
    documento: row.documento ?? row.cnpj ?? '',
    tipo: (row.tipo ?? row.type) ?? 'pj',
    email: row.email ?? '',
    telefone: row.telefone ?? row.phone ?? '',
    endereco: row.endereco ?? row.address ?? '',
    ativo: row.ativo ?? true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

private parseDespesas(data: unknown[]): Despesa[] {
  const items = (data as any[]) || [];
  return items.map((row: any, index: number) => ({
     id: row.id ?? `desp_${Date.now()}_${index}`,
     empresaId: row.empresaId ?? '1',
     fornecedorId: row.fornecedorId ?? row.fornecedor_id ?? '',
     descricao: row.descricao ?? row.description ?? '',
     valor: parseFloat(String(row.valor ?? row.value ?? '0')) || 0,
     vencimento: row.vencimento ?? row.dataVencimento ?? '',
     categoria: row.categoria ?? '',
     status: (row.status ?? 'pendente') as Despesa['status'],
     valorPago: row.valorPago ?? 0,
     observacoes: row.observacoes ?? row.notes ?? '',
     numeroDocumento: row.numeroDocumento ?? row.numero_documento ?? '',
     createdAt: new Date().toISOString(),
     updatedAt: new Date().toISOString()
  }));
}

private parseReceitas(data: unknown[]): Receita[] {
  const rows = (data as any[]) || [];
  return rows.map((row: any, index: number) => ({
    id: row.id ?? `rec_${Date.now()}_${index}`,
    descricao: row.descricao ?? row.description ?? '',
    valor: parseFloat(String(row.valor ?? row.value ?? 0)) || 0,
    data_vencimento: new Date(this.parseDate(row.data_vencimento ?? row.dueDate ?? '')) as any,
    data_recebimento: row.data_recebimento ?? row.receiptDate ? new Date(this.parseDate(row.data_recebimento ?? row.receiptDate ?? '')) : undefined as any,
    categoria_id: row.categoria_id ?? row.categoryId ?? '',
    fornecedor_id: row.fornecedor_id ?? row.fornecedorId ?? '',
    conta_bancaria_id: row.conta_bancaria_id ?? row.contaBancariaId ?? '',
    status: row.status ?? 'pendente',
    forma_recebimento: row.forma_recebimento ?? '',
    numero_documento: row.numero_documento ?? row.numeroDocumento ?? '',
    observacoes: row.observacoes ?? row.notes ?? '',
    recorrente: row.recorrente ?? false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })) as unknown as Receita[];
}

  private parseContasBancarias(data: unknown[]): ContaBancaria[] {
    const items = (data as any[]) || [];
    return items.map((row, index) => ({
      id: row.id ?? `conta_${Date.now()}_${index}`,
      nome: row.nome ?? row.name ?? '',
      banco: row.banco ?? row.bank ?? '',
      agencia: row.agencia ?? row.agency ?? '',
      conta: row.conta ?? row.account ?? '',
      saldo: parseFloat(String(row.saldo ?? row.balance ?? '0')) || 0,
      tipo: (row.tipo ?? row.type) ?? 'corrente',
      ativo: row.ativo ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  private parseDespesasFinanceiras(data: unknown[], nomeAba: string): Despesa[] {
    const rows = (data as any[]) || [];
    const despesas: Despesa[] = [];
    
    rows.forEach((row, index) => {
      try {
        // Buscar campos da planilha real
        const fornecedor = row['FORNECEDOR'] || row['CLIENTE'] || row['Nome'] || '';
        const descricao = row['DESCRIÇÃO'] || row['Descrição'] || '';
        const valorStr = row['VALOR'] || row['Valor'] || '';
        const vencimento = row['VENCIMENTO'] || row['Data'] || '';
        const grupo = row['GRUPO'] || row['Categoria'] || 'Diversos';
        const situacao = row['SITUAÇÃO'] || row['Status'] || 'pendente';
        const obs1 = row['OBS 1'] || row['Observações'] || '';
        const empresa = row['EMPRESA'] || row['OBS 2'] || 'Empresa Padrão';
        
        let valor = 0;
        if (valorStr) {
          const valorLimpo = String(valorStr).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
          valor = parseFloat(valorLimpo) || 0;
        }
        
        // Processar data
        const vencimentoStr = vencimento ? this.parseDate(vencimento) : '';
        const vencimentoDate = vencimentoStr ? new Date(vencimentoStr) : new Date();
        
        if (fornecedor && String(fornecedor).toString().trim() && valor > 0) {
          despesas.push({
            id: `desp_${nomeAba}_${Date.now()}_${index}`,
            empresaId: '1',
            fornecedorId: `forn_${String(fornecedor).toLowerCase().replace(/\s+/g, '_')}`,
            descricao: String(descricao).trim() || String(fornecedor).trim(),
            valor: valor,
            vencimento: vencimentoStr,
            categoria: String(grupo),
            status: String(situacao).toLowerCase().includes('pago') ? 'pago_total' : 'pendente',
            valorPago: 0,
            observacoes: String(obs1),
            numeroDocumento: `DESP-${nomeAba}-${index}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as any);
        }
      } catch (error) {
        console.error(`Erro ao processar linha ${index + 1} da aba ${nomeAba}:`, error);
      }
    });
    
    return despesas;
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
        const date = XLSX.SSF.parse_date_code(dateValue as any);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }
      
      // Tentar converter para Date
      const date = new Date(dateValue as any);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
      
      return '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Verifica se uma aba é uma aba mensal (formato: Jan 2024, Fev 2024, etc.)
   */
  private isMonthlySheet(sheetName: string): boolean {
    const normalizedName = sheetName.trim().toLowerCase();
    const isMonthlyPattern = /^(jan|fev|mar|abr|mai|jun|jul|ago|set|out|nov|dez)\s*\d{4}$/i;
    return /\d{2}\/\d{2}\/\d{4}/.test(normalizedName) || isMonthlyPattern.test(normalizedName);
  }

  /**
   * Extrai dados de uma aba mensal
   */
  private parseMonthlySheetData(jsonData: any[], sheetName: string): {
    categorias: string[];
    contas: string[];
    receitas: Receita[];
    despesas: Despesa[];
  } {
    const categorias = new Set<string>();
    const contas = new Set<string>();
    const receitas: Receita[] = [];
    const despesas: Despesa[] = [];
    
    console.log(`🔍 ExcelImportService: Analisando estrutura da aba mensal '${sheetName}'`);
    
    if (jsonData.length === 0) {
      console.log(`⚠️ ExcelImportService: Aba '${sheetName}' está vazia`);
      return { categorias: [], contas: [], receitas: [], despesas: [] };
    }
    
    // Identificar colunas disponíveis
    const colunas = Object.keys(jsonData[0]);
    console.log(`📝 ExcelImportService: Colunas encontradas na aba '${sheetName}':`, colunas);
    
    // Mapear colunas para campos conhecidos
    const mapeamentoColunas = this.mapearColunasAba(colunas);
    console.log(`🗺️ ExcelImportService: Mapeamento de colunas:`, mapeamentoColunas);
    
    jsonData.forEach((linha, index) => {
      try {
        // Extrair categoria se disponível
        if (mapeamentoColunas.categoria && linha[mapeamentoColunas.categoria]) {
          const categoria = String(linha[mapeamentoColunas.categoria]).trim();
          if (categoria && categoria !== '' && categoria.toLowerCase() !== 'categoria') {
            categorias.add(categoria);
          }
        }
        
        // Extrair conta se disponível
        if (mapeamentoColunas.conta && linha[mapeamentoColunas.conta]) {
          const conta = String(linha[mapeamentoColunas.conta]).trim();
          if (conta && conta !== '' && conta.toLowerCase() !== 'conta') {
            contas.add(conta);
          }
        }
        
        // Extrair valor
        const valor = this.extrairValor(linha, mapeamentoColunas);
        if (valor === 0) return; // Pular linhas sem valor
        
        // Extrair outros campos
        const descricao = this.extrairDescricao(linha, mapeamentoColunas) || `Transação ${index + 1}`;
        const data = this.extrairData(linha, mapeamentoColunas);
        const fornecedor = this.extrairFornecedor(linha, mapeamentoColunas);
        
        // Determinar se é receita ou despesa
        if (valor > 0 && this.isReceita(linha, mapeamentoColunas)) {
          // É uma receita
          receitas.push({
            id: `rec_${Date.now()}_${index}`,
            descricao,
            valor: Math.abs(valor),
            data_vencimento: data.toISOString(),
            categoria_id: mapeamentoColunas.categoria ? String(linha[mapeamentoColunas.categoria] || 'Receita Geral') : 'Receita Geral',
            fornecedor_id: fornecedor || 'Cliente Geral',
            conta_bancaria_id: mapeamentoColunas.conta ? String(linha[mapeamentoColunas.conta] || 'Conta Principal') : 'Conta Principal',
            status: 'pendente',
            observacoes: `Importado da aba ${sheetName}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as any);
        } else if (valor !== 0) {
          // É uma despesa
          despesas.push({
            id: `desp_${Date.now()}_${index}`,
            descricao,
            valor: Math.abs(valor),
            vencimento: data.toISOString().split('T')[0],
            categoria: mapeamentoColunas.categoria ? String(linha[mapeamentoColunas.categoria] || 'Despesa Geral') : 'Despesa Geral',
            fornecedorId: this.gerarFornecedorId(fornecedor || 'Fornecedor Geral'),
            status: this.extrairStatus(linha, mapeamentoColunas),
            observacoes: `Importado da aba ${sheetName}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as any);
        }
      } catch (error) {
        console.error(`❌ ExcelImportService: Erro ao processar linha ${index + 1} da aba '${sheetName}':`, error);
      }
    });
    
    return {
      categorias: Array.from(categorias),
      contas: Array.from(contas),
      receitas,
      despesas
    };
  }

  /**
   * Mapeia colunas da aba para campos conhecidos
   */
  private mapearColunasAba(colunas: string[]): {
    categoria?: string;
    conta?: string;
    valor?: string;
    descricao?: string;
    data?: string;
    fornecedor?: string;
    status?: string;
  } {
    const mapeamento: {
      categoria?: string;
      conta?: string;
      valor?: string;
      descricao?: string;
      data?: string;
      fornecedor?: string;
      status?: string;
    } = {};
    
    colunas.forEach(coluna => {
      const colunaNormalizada = coluna.toLowerCase().trim();
      
      // Mapear categoria
      if (colunaNormalizada.includes('categoria') || colunaNormalizada.includes('grupo') || colunaNormalizada.includes('tipo')) {
        mapeamento.categoria = coluna;
      }
      
      // Mapear conta
      if (colunaNormalizada.includes('conta') || colunaNormalizada.includes('banco')) {
        mapeamento.conta = coluna;
      }
      
      // Mapear valor
      if (colunaNormalizada.includes('valor') || colunaNormalizada.includes('quantia') || colunaNormalizada.includes('montante')) {
        mapeamento.valor = coluna;
      }
      
      // Mapear descrição
      if (colunaNormalizada.includes('descri') || colunaNormalizada.includes('historico') || colunaNormalizada.includes('observ')) {
        mapeamento.descricao = coluna;
      }
      
      // Mapear data
      if (colunaNormalizada.includes('data') || colunaNormalizada.includes('vencimento') || colunaNormalizada.includes('pagamento')) {
        mapeamento.data = coluna;
      }
      
      // Mapear fornecedor
      if (colunaNormalizada.includes('fornecedor') || colunaNormalizada.includes('cliente') || colunaNormalizada.includes('empresa')) {
        mapeamento.fornecedor = coluna;
      }
      
      // Mapear status
      if (colunaNormalizada.includes('status') || colunaNormalizada.includes('situacao') || colunaNormalizada.includes('estado')) {
        mapeamento.status = coluna;
      }
    });
    
    return mapeamento;
  }

  /**
   * Extrai valor numérico da linha
   */
  private extrairValor(linha: Record<string, unknown>, mapeamento: Record<string, string>): number {
    if (!mapeamento.valor) {
      // Tentar encontrar primeira coluna com valor numérico
      for (const [key, value] of Object.entries(linha)) {
        if (typeof value === 'number' && value !== 0) {
          return value;
        }
        if (typeof value === 'string') {
          const valorLimpo = value.replace(/[^\d,-]/g, '').replace(',', '.');
          const numero = parseFloat(valorLimpo);
          if (!isNaN(numero) && numero !== 0) {
            return numero;
          }
        }
      }
      return 0;
    }
    
    const valor = linha[mapeamento.valor];
    if (typeof valor === 'number') return valor;
    if (typeof valor === 'string') {
      const valorLimpo = valor.replace(/[^\d,-]/g, '').replace(',', '.');
      return parseFloat(valorLimpo) || 0;
    }
    return 0;
  }

  /**
   * Extrai descrição da linha
   */
  private extrairDescricao(linha: Record<string, unknown>, mapeamento: Record<string, string>): string {
    if (mapeamento.descricao && linha[mapeamento.descricao]) {
      return String(linha[mapeamento.descricao]).trim();
    }
    
    // Tentar encontrar primeira coluna de texto que não seja categoria, conta, etc.
    for (const [key, value] of Object.entries(linha)) {
      if (typeof value === 'string' && value.trim() !== '' && 
          !key.toLowerCase().includes('categoria') && 
          !key.toLowerCase().includes('conta') && 
          !key.toLowerCase().includes('valor')) {
        return value.trim();
      }
    }
    
    return 'Descrição não informada';
  }

  /**
   * Extrai data da linha
   */
  private extrairData(linha: Record<string, unknown>, mapeamento: Record<string, string>): Date {
    if (mapeamento.data && linha[mapeamento.data]) {
      return this.parseDateToDate(linha[mapeamento.data]);
    }
    
    // Tentar encontrar primeira coluna que pareça uma data
    for (const [key, value] of Object.entries(linha)) {
      if (value instanceof Date) return value;
      if (typeof value === 'number' && value > 40000 && value < 50000) {
        // Provável serial date do Excel
        return this.parseDateToDate(value);
      }
      if (typeof value === 'string' && /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(value)) {
        return this.parseDateToDate(value);
      }
    }
    
    return new Date();
  }

  /**
   * Converte valor para Date
   */
  private parseDateToDate(dateValue: unknown): Date {
    if (!dateValue) return new Date();
    
    // Se já é uma data
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Se é um número (serial date do Excel)
    if (typeof dateValue === 'number') {
      try {
        const date = XLSX.SSF.parse_date_code(dateValue as any);
        return new Date(date.y, date.m - 1, date.d);
      } catch {
        return new Date();
      }
    }
    
    // Se é uma string
    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    
    return new Date();
  }

  /**
   * Extrai fornecedor da linha
   */
  private extrairFornecedor(linha: Record<string, unknown>, mapeamento: Record<string, string>): string {
    if (mapeamento.fornecedor && linha[mapeamento.fornecedor]) {
      return String(linha[mapeamento.fornecedor]).trim();
    }
    return 'Fornecedor Geral';
  }

  /**
   * Extrai status da linha
   */
  private extrairStatus(linha: Record<string, unknown>, mapeamento: Record<string, string>): 'pendente' | 'pago_parcial' | 'pago_total' | 'cancelado' {
    if (mapeamento.status && linha[mapeamento.status]) {
      const status = String(linha[mapeamento.status]).toLowerCase().trim();
      if (status.includes('pago') || status.includes('quitado')) return 'pago_total';
      if (status.includes('pendente') || status.includes('aberto')) return 'pendente';
      if (status.includes('vencido') || status.includes('atrasado')) return 'pendente';
      if (status.includes('cancelado')) return 'cancelado';
      if (status.includes('parcial')) return 'pago_parcial';
    }
    return 'pendente';
  }

  /**
   * Determina se uma linha representa uma receita
   */
  private isReceita(linha: Record<string, unknown>, mapeamento: Record<string, string>): boolean {
    // Verificar se há indicação explícita de receita
    for (const [key, value] of Object.entries(linha)) {
      if (typeof value === 'string') {
        const valorLower = value.toLowerCase();
        if (valorLower.includes('receita') || valorLower.includes('entrada') || valorLower.includes('credito')) {
          return true;
        }
      }
    }
    
    // Se a categoria indica receita
    if (mapeamento.categoria && linha[mapeamento.categoria]) {
      const categoria = String(linha[mapeamento.categoria]).toLowerCase();
      if (categoria.includes('receita') || categoria.includes('entrada') || categoria.includes('vendas')) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Gera ID de fornecedor baseado no nome
   */
  private gerarFornecedorId(nome: string): string {
    return nome.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
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
            const result_categoria = await financialDataService.saveCategoria(categoria as any);
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
            
            await financialDataService.saveFornecedor(novoFornecedor as any);
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
            await financialDataService.saveContaBancaria(conta as any);
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
              vencimento: despesa.vencimento || (despesa as any).dataVencimento || '',
              categoria: despesa.categoria ?? despesa.categoria_id ?? '',
              status: despesa.status ?? 'pendente',
              valorPago: (despesa.valorPago ?? 0),
              observacoes: despesa.observacoes ?? '',
              numeroDocumento: `DESP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            
            await financialDataService.saveDespesa(despesaFormatada as any);
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
            
            const receitaFormatada = {
              ...receita,
              data_vencimento: receita.data_vencimento instanceof Date 
                ? receita.data_vencimento.toISOString().split('T')[0]
                : receita.data_vencimento,
              data_recebimento: receita.data_recebimento instanceof Date 
                ? receita.data_recebimento.toISOString().split('T')[0]
                : receita.data_recebimento
            };
            
            const result_receita = await financialDataService.saveReceita(receitaFormatada as any);
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
