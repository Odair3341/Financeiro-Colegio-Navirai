// Utilitário para sincronização de dados entre dispositivos
// Permite compartilhar dados via URL ou código

export class DataSync {
  // Gerar código de compartilhamento
  static generateShareCode(): string {
    const data = {
      categorias: localStorage.getItem('categorias') || '[]',
      despesas: localStorage.getItem('despesas') || '[]', 
      receitas: localStorage.getItem('receitas') || '[]',
      timestamp: Date.now()
    };
    
    // Comprimir dados usando base64
    const compressed = btoa(JSON.stringify(data));
    return compressed;
  }
  
  // Importar dados de um código
  static importFromCode(code: string): boolean {
    try {
      const data = JSON.parse(atob(code));
      
      // Validar se é um código válido
      if (!data.timestamp || !data.categorias) {
        return false;
      }
      
      // Confirmar importação
      const confirm = window.confirm(
        `Importar dados de ${new Date(data.timestamp).toLocaleString()}?\n\n` +
        `Isso substituirá seus dados atuais!`
      );
      
      if (confirm) {
        localStorage.setItem('categorias', data.categorias);
        localStorage.setItem('despesas', data.despesas);
        localStorage.setItem('receitas', data.receitas);
        
        // Recarregar página para refletir mudanças
        window.location.reload();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
  
  // Gerar URL de compartilhamento
  static generateShareUrl(): string {
    const code = this.generateShareCode();
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?import=${encodeURIComponent(code)}`;
  }
  
  // Verificar se há dados para importar na URL
  static checkForImport(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const importCode = urlParams.get('import');
    
    if (importCode) {
      // Remover parâmetro da URL
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', newUrl);
      
      // Tentar importar
      this.importFromCode(decodeURIComponent(importCode));
    }
  }
  
  // Resetar dados (limpar tudo)
  static resetData(): void {
    const confirm = window.confirm(
      'Tem certeza que deseja limpar todos os dados?\n\n' +
      'Esta ação não pode ser desfeita!'
    );
    
    if (confirm) {
      localStorage.removeItem('categorias');
      localStorage.removeItem('despesas');
      localStorage.removeItem('receitas');
      window.location.reload();
    }
  }
  
  // Backup dos dados
  static downloadBackup(): void {
    const data = {
      categorias: JSON.parse(localStorage.getItem('categorias') || '[]'),
      despesas: JSON.parse(localStorage.getItem('despesas') || '[]'),
      receitas: JSON.parse(localStorage.getItem('receitas') || '[]'),
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }
}