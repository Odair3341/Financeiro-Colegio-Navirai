// Serviço para conectar com o banco Neon PostgreSQL
// Este arquivo faz a ponte entre o frontend e o banco

import type { Categoria, Despesa, Receita } from '@/types';

// Configuração da API Neon (substitua pela sua quando configurar serverless functions)
const NEON_API_BASE = '/api/neon'; // Para Next.js API routes
// const NEON_API_BASE = 'https://sua-funcao-serverless.vercel.app/api'; // Para funções serverless

class NeonDatabaseService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = NEON_API_BASE;
  }

  // Métodos para Categorias
  async getCategorias(): Promise<Categoria[]> {
    try {
      const response = await fetch(`${this.baseUrl}/categorias`);
      if (!response.ok) throw new Error('Erro ao buscar categorias');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      throw error;
    }
  }

  async createCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    try {
      const response = await fetch(`${this.baseUrl}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });
      if (!response.ok) throw new Error('Erro ao criar categoria');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  async updateCategoria(id: string, categoria: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await fetch(`${this.baseUrl}/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });
      if (!response.ok) throw new Error('Erro ao atualizar categoria');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  async deleteCategoria(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/categorias/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar categoria');
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    }
  }

  // Métodos para Despesas
  async getDespesas(): Promise<Despesa[]> {
    try {
      const response = await fetch(`${this.baseUrl}/despesas`);
      if (!response.ok) throw new Error('Erro ao buscar despesas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar despesas:', error);
      throw error;
    }
  }

  async createDespesa(despesa: Omit<Despesa, 'id'>): Promise<Despesa> {
    try {
      const response = await fetch(`${this.baseUrl}/despesas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(despesa)
      });
      if (!response.ok) throw new Error('Erro ao criar despesa');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      throw error;
    }
  }

  async updateDespesa(id: string, despesa: Partial<Despesa>): Promise<Despesa> {
    try {
      const response = await fetch(`${this.baseUrl}/despesas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(despesa)
      });
      if (!response.ok) throw new Error('Erro ao atualizar despesa');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      throw error;
    }
  }

  async deleteDespesa(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/despesas/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar despesa');
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      throw error;
    }
  }

  // Métodos para Receitas
  async getReceitas(): Promise<Receita[]> {
    try {
      const response = await fetch(`${this.baseUrl}/receitas`);
      if (!response.ok) throw new Error('Erro ao buscar receitas');
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      throw error;
    }
  }

  async createReceita(receita: Omit<Receita, 'id'>): Promise<Receita> {
    try {
      const response = await fetch(`${this.baseUrl}/receitas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receita)
      });
      if (!response.ok) throw new Error('Erro ao criar receita');
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      throw error;
    }
  }

  async updateReceita(id: string, receita: Partial<Receita>): Promise<Receita> {
    try {
      const response = await fetch(`${this.baseUrl}/receitas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receita)
      });
      if (!response.ok) throw new Error('Erro ao atualizar receita');
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      throw error;
    }
  }

  async deleteReceita(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/receitas/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao deletar receita');
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      throw error;
    }
  }

  // Método para testar conexão
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      return false;
    }
  }
}

// Exporta uma instância única do serviço
export const neonDB = new NeonDatabaseService();

export default neonDB;