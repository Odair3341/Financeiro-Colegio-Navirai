// Utility functions for text normalization and search

/**
 * Normalizes text by removing accents, converting to lowercase, and trimming spaces
 */
export function normalizeText(text: string): string {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extracts only digits from a string
 */
export function onlyDigits(text: string): string {
  return String(text || '').replace(/\D/g, '')
}

/**
 * Checks if a normalized name is an exact match
 */
export function isExactNameMatch(searchTerm: string, name: string): boolean {
  return normalizeText(searchTerm) === normalizeText(name)
}

/**
 * Enhanced search function for suppliers with accent-insensitive and intelligent matching
 */
export function searchSuppliers<T extends { nome: string; documento: string; email?: string; telefone?: string }>(
  suppliers: T[],
  searchTerm: string
): T[] {
  if (!searchTerm.trim()) {
    return suppliers
  }

  const normalizedSearchTerm = normalizeText(searchTerm)
  const searchTerms = normalizedSearchTerm.split(' ')

  // First, check for exact name matches
  const exactMatches = suppliers.filter(supplier => 
    isExactNameMatch(searchTerm, supplier.nome)
  )

  // If we have exact matches, return only those
  if (exactMatches.length > 0) {
    return exactMatches
  }

  // Otherwise, use the comprehensive search
  return suppliers.filter(supplier => {
    return searchTerms.every(term => {
      const normalizedName = normalizeText(supplier.nome)
      const normalizedEmail = normalizeText(supplier.email || '')
      const docDigits = onlyDigits(supplier.documento)
      const phoneDigits = onlyDigits(supplier.telefone || '')
      const termDigits = onlyDigits(term)

      return (
        // Name contains term
        normalizedName.includes(term) ||
        // Document matches (digits only)
        (termDigits && docDigits.includes(termDigits)) ||
        // Document contains term as-is
        normalizeText(supplier.documento).includes(term) ||
        // Email contains term
        normalizedEmail.includes(term) ||
        // Phone matches (digits only)
        (termDigits && phoneDigits.includes(termDigits))
      )
    })
  })
}
