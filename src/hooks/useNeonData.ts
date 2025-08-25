// Hook para usar dados do Neon com fallback para localStorage
// Este hook permite usar o banco Neon quando disponível, e localStorage como backup

import { useState, useEffect, useCallback } from 'react';
import type { Categoria, Despesa, Receita } from '@/types';
import { neonDB } from '@/services/neonAPI';
import { 
  getCategorias as getCategoriasLocal, 
  getDespesas as getDespesasLocal,
  getReceitas as getReceitasLocal,
  addCategoria as addCategoriaLocal,
  addDespesa as addDespesaLocal,
  addReceita as addReceitaLocal,
  updateCategoria as updateCategoriaLocal,
  updateDespesa as updateDespesaLocal,
  updateReceita as updateReceitaLocal,
  deleteCategoria as deleteCategoriaLocal,
  deleteDespesa as deleteDespesaLocal,
  deleteReceita as deleteReceitaLocal
} from '@/services/database';

// Tipos para o estado do hook
interface UseNeonDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

// Hook genérico para dados do Neon
function useNeonData<T>(
  entityType: 'categorias' | 'despesas' | 'receitas'
) {
  const [state, setState] = useState<UseNeonDataState<T>>({
    data: [],
    loading: true,
    error: null,
    isOnline: false
  });

  // Função para carregar dados
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Tenta conectar com o Neon primeiro
      const isConnected = await neonDB.testConnection();
      
      if (isConnected) {
        // Se conectado, usa o Neon
        let neonData: T[];
        switch (entityType) {
          case 'categorias':
            neonData = await neonDB.getCategorias() as T[];
            break;
          case 'despesas':
            neonData = await neonDB.getDespesas() as T[];
            break;
          case 'receitas':
            neonData = await neonDB.getReceitas() as T[];
            break;
          default:
            throw new Error('Tipo de entidade inválido');
        }
        
        setState({
          data: neonData,
          loading: false,
          error: null,
          isOnline: true
        });
      } else {
        // Se não conectado, usa localStorage
        throw new Error('Neon indisponível, usando localStorage');
      }
    } catch (error) {
      // Fallback para localStorage
      console.warn(`Usando localStorage para ${entityType}:`, error);
      
      let localData: T[];
      switch (entityType) {
        case 'categorias':
          localData = getCategoriasLocal() as T[];
          break;
        case 'despesas':
          localData = getDespesasLocal() as T[];
          break;
        case 'receitas':
          localData = getReceitasLocal() as T[];
          break;
        default:
          localData = [];
      }
      
      setState({
        data: localData,
        loading: false,
        error: null,
        isOnline: false
      });
    }
  }, [entityType]);

  // Carrega dados na inicialização
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    ...state,
    reload: loadData
  };
}

// Hook específico para categorias
export function useCategorias() {
  const { data, loading, error, isOnline, reload } = useNeonData<Categoria>('categorias');

  const addCategoria = useCallback(async (categoria: Omit<Categoria, 'id'>) => {
    try {
      if (isOnline) {
        const newCategoria = await neonDB.createCategoria(categoria);
        reload();
        return newCategoria;
      } else {
        return addCategoriaLocal(categoria);
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      return addCategoriaLocal(categoria);
    }
  }, [isOnline, reload]);

  const updateCategoria = useCallback(async (id: string, categoria: Partial<Categoria>) => {
    try {
      if (isOnline) {
        const updated = await neonDB.updateCategoria(id, categoria);
        reload();
        return updated;
      } else {
        return updateCategoriaLocal(id, categoria);
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return updateCategoriaLocal(id, categoria);
    }
  }, [isOnline, reload]);

  const deleteCategoria = useCallback(async (id: string) => {
    try {
      if (isOnline) {
        await neonDB.deleteCategoria(id);
        reload();
      } else {
        deleteCategoriaLocal(id);
      }
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      deleteCategoriaLocal(id);
    }
  }, [isOnline, reload]);

  return {
    categorias: data,
    loading,
    error,
    isOnline,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    reload
  };
}

// Hook específico para despesas
export function useDespesas() {
  const { data, loading, error, isOnline, reload } = useNeonData<Despesa>('despesas');

  const addDespesa = useCallback(async (despesa: Omit<Despesa, 'id'>) => {
    try {
      if (isOnline) {
        const newDespesa = await neonDB.createDespesa(despesa);
        reload();
        return newDespesa;
      } else {
        return addDespesaLocal(despesa);
      }
    } catch (error) {
      console.error('Erro ao adicionar despesa:', error);
      return addDespesaLocal(despesa);
    }
  }, [isOnline, reload]);

  const updateDespesa = useCallback(async (id: string, despesa: Partial<Despesa>) => {
    try {
      if (isOnline) {
        const updated = await neonDB.updateDespesa(id, despesa);
        reload();
        return updated;
      } else {
        return updateDespesaLocal(id, despesa);
      }
    } catch (error) {
      console.error('Erro ao atualizar despesa:', error);
      return updateDespesaLocal(id, despesa);
    }
  }, [isOnline, reload]);

  const deleteDespesa = useCallback(async (id: string) => {
    try {
      if (isOnline) {
        await neonDB.deleteDespesa(id);
        reload();
      } else {
        deleteDespesaLocal(id);
      }
    } catch (error) {
      console.error('Erro ao deletar despesa:', error);
      deleteDespesaLocal(id);
    }
  }, [isOnline, reload]);

  return {
    despesas: data,
    loading,
    error,
    isOnline,
    addDespesa,
    updateDespesa,
    deleteDespesa,
    reload
  };
}

// Hook específico para receitas
export function useReceitas() {
  const { data, loading, error, isOnline, reload } = useNeonData<Receita>('receitas');

  const addReceita = useCallback(async (receita: Omit<Receita, 'id'>) => {
    try {
      if (isOnline) {
        const newReceita = await neonDB.createReceita(receita);
        reload();
        return newReceita;
      } else {
        return addReceitaLocal(receita);
      }
    } catch (error) {
      console.error('Erro ao adicionar receita:', error);
      return addReceitaLocal(receita);
    }
  }, [isOnline, reload]);

  const updateReceita = useCallback(async (id: string, receita: Partial<Receita>) => {
    try {
      if (isOnline) {
        const updated = await neonDB.updateReceita(id, receita);
        reload();
        return updated;
      } else {
        return updateReceitaLocal(id, receita);
      }
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      return updateReceitaLocal(id, receita);
    }
  }, [isOnline, reload]);

  const deleteReceita = useCallback(async (id: string) => {
    try {
      if (isOnline) {
        await neonDB.deleteReceita(id);
        reload();
      } else {
        deleteReceitaLocal(id);
      }
    } catch (error) {
      console.error('Erro ao deletar receita:', error);
      deleteReceitaLocal(id);
    }
  }, [isOnline, reload]);

  return {
    receitas: data,
    loading,
    error,
    isOnline,
    addReceita,
    updateReceita,
    deleteReceita,
    reload
  };
}

// Hook combinado para usar dados híbridos
export function useHybridData() {
  const categorias = useCategorias();
  const despesas = useDespesas();
  const receitas = useReceitas();

  const isOnline = categorias.isOnline || despesas.isOnline || receitas.isOnline;
  const loading = categorias.loading || despesas.loading || receitas.loading;

  return {
    categorias,
    despesas,
    receitas,
    isOnline,
    loading,
    reloadAll: () => {
      categorias.reload();
      despesas.reload();
      receitas.reload();
    }
  };
}