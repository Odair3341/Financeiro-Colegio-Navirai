// Serviço para categorização automática baseada em descrições
export interface CategoriaMapping {
  palavrasChave: string[];
  categoria: string;
  tipo: 'credito' | 'debito';
}

export const categoriasMapping: CategoriaMapping[] = [
  // Energia
  {
    palavrasChave: ['energisa', 'cemig', 'copel', 'celpe', 'energia', 'eletrica'],
    categoria: 'Energia Elétrica',
    tipo: 'debito'
  },
  
  // Telecomunicações
  {
    palavrasChave: ['tim', 'vivo', 'claro', 'oi', 'internet', 'telefone', 'telecom'],
    categoria: 'Telecomunicações',
    tipo: 'debito'
  },
  
  // Água e Saneamento
  {
    palavrasChave: ['sabesp', 'cedae', 'sanepar', 'agua', 'saneamento'],
    categoria: 'Água e Saneamento',
    tipo: 'debito'
  },
  
  // Combustível
  {
    palavrasChave: ['posto', 'combustivel', 'gasolina', 'etanol', 'diesel', 'shell', 'petrobras', 'ipiranga'],
    categoria: 'Combustível',
    tipo: 'debito'
  },
  
  // Alimentação
  {
    palavrasChave: ['restaurante', 'lanchonete', 'delivery', 'ifood', 'uber eats', 'mercado', 'supermercado'],
    categoria: 'Alimentação',
    tipo: 'debito'
  },
  
  // Material de Escritório
  {
    palavrasChave: ['papelaria', 'material escritorio', 'impressao', 'cartuchos', 'papel'],
    categoria: 'Material de Escritório',
    tipo: 'debito'
  },
  
  // Serviços Bancários
  {
    palavrasChave: ['tarifa', 'taxa', 'manutencao conta', 'anuidade', 'ted', 'doc'],
    categoria: 'Serviços Bancários',
    tipo: 'debito'
  },
  
  // Folha de Pagamento
  {
    palavrasChave: ['salario', 'folha pagamento', 'inss', 'fgts', '13 salario', 'ferias'],
    categoria: 'Folha de Pagamento',
    tipo: 'debito'
  },
  
  // Receitas
  {
    palavrasChave: ['recebimento', 'vendas', 'servicos prestados', 'consultoria', 'honorarios'],
    categoria: 'Receita de Serviços',
    tipo: 'credito'
  },
  
  // Transferências
  {
    palavrasChave: ['transferencia', 'pix', 'ted recebida', 'doc recebida'],
    categoria: 'Transferências',
    tipo: 'credito'
  }
];

export class CategorizationService {
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9\s]/g, ' ') // remove caracteres especiais
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Identifica automaticamente a categoria baseada na descrição
   */
  public identificarCategoria(descricao: string, tipo: 'credito' | 'debito'): string | null {
    const descricaoNorm = this.normalize(descricao);
    
    for (const mapping of categoriasMapping) {
      if (mapping.tipo === tipo) {
        for (const palavra of mapping.palavrasChave) {
          if (descricaoNorm.includes(this.normalize(palavra))) {
            return mapping.categoria;
          }
        }
      }
    }
    
    return null;
  }

  /**
   * Identifica possíveis fornecedores baseado na descrição
   */
  public identificarFornecedor(descricao: string, fornecedoresExistentes: Array<{id: string, nome: string}>): string | null {
    const descricaoNorm = this.normalize(descricao);
    
    // Buscar fornecedor existente que tenha nome similar na descrição
    for (const fornecedor of fornecedoresExistentes) {
      const nomeNorm = this.normalize(fornecedor.nome);
      
      // Se o nome do fornecedor aparece na descrição
      if (descricaoNorm.includes(nomeNorm) || nomeNorm.includes(descricaoNorm)) {
        return fornecedor.id;
      }
      
      // Busca por palavras-chave do nome (para nomes compostos)
      const palavras = nomeNorm.split(' ').filter(p => p.length > 2);
      if (palavras.some(palavra => descricaoNorm.includes(palavra))) {
        return fornecedor.id;
      }
    }
    
    return null;
  }

  /**
   * Sugere um nome de fornecedor baseado na descrição
   */
  public sugerirNomeFornecedor(descricao: string): string {
    const descricaoNorm = this.normalize(descricao);
    
    // Lista de palavras que não devem ser usadas como nome de fornecedor
    const stopWords = ['compra', 'pagamento', 'transferencia', 'pix', 'ted', 'doc', 'debito', 'credito'];
    
    // Extrair palavras significativas da descrição
    const palavras = descricaoNorm
      .split(' ')
      .filter(palavra => palavra.length > 2 && !stopWords.includes(palavra))
      .slice(0, 3); // Pegar no máximo 3 palavras
    
    // Capitalizar primeira letra de cada palavra
    const nomeFormatado = palavras
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
    
    return nomeFormatado || 'Fornecedor não identificado';
  }

  /**
   * Analisa uma movimentação e retorna sugestões de categorização
   */
  public analisarMovimentacao(descricao: string, valor: number, tipo: 'credito' | 'debito', fornecedoresExistentes: Array<{id: string, nome: string}>) {
    return {
      categoria: this.identificarCategoria(descricao, tipo),
      fornecedorId: this.identificarFornecedor(descricao, fornecedoresExistentes),
      fornecedorSugerido: this.sugerirNomeFornecedor(descricao),
      tipoTransacao: tipo === 'credito' ? 'receita' : 'despesa'
    };
  }
}

export const categorizationService = new CategorizationService();