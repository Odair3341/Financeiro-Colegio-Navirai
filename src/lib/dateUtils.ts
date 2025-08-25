import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data para o padrão brasileiro dd/mm/aaaa
 */
export function formatDateBR(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return typeof date === 'string' ? date : '';
  }
}

/**
 * Formata uma data para o padrão brasileiro com horário
 */
export function formatDateTimeBR(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    return typeof date === 'string' ? date : '';
  }
}