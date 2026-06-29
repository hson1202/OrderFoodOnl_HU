// EU 14 allergen codes – shared with Frontend/Admin utils.
// Letter codes A–N match Hungarian/EU menu labelling (1–14).

export const ALLERGEN_CODES = [
  'gluten',
  'crustaceans',
  'egg',
  'fish',
  'peanut',
  'soy',
  'milk',
  'nuts',
  'celery',
  'mustard',
  'sesame',
  'sulfites',
  'lupin',
  'molluscs',
]

// EU letter codes used in menu.json (A = 1 … N = 14)
export const LETTER_TO_CODE = {
  A: 'gluten',
  B: 'crustaceans',
  C: 'egg',
  D: 'fish',
  E: 'peanut',
  F: 'soy',
  G: 'milk',
  H: 'nuts',
  I: 'celery',
  J: 'mustard',
  K: 'sesame',
  L: 'sulfites',
  M: 'lupin',
  N: 'molluscs',
}

const NUMERIC_TO_CODE = {
  1: 'gluten',
  2: 'crustaceans',
  3: 'egg',
  4: 'fish',
  5: 'peanut',
  6: 'soy',
  7: 'milk',
  8: 'nuts',
  9: 'celery',
  10: 'mustard',
  11: 'sesame',
  12: 'sulfites',
  13: 'lupin',
  14: 'molluscs',
}

const KNOWN_CODES = new Set(ALLERGEN_CODES)

/**
 * Map a single allergen token (letter, number, or string code) to a known code.
 */
export const mapAllergenCode = (value) => {
  if (value === null || value === undefined) return null
  const raw = String(value).trim()
  if (!raw) return null

  const upper = raw.toUpperCase()
  if (LETTER_TO_CODE[upper]) return LETTER_TO_CODE[upper]

  const lower = raw.toLowerCase()
  if (KNOWN_CODES.has(lower)) return lower

  const num = Number(lower)
  if (Number.isInteger(num) && NUMERIC_TO_CODE[num]) return NUMERIC_TO_CODE[num]

  return null
}

/**
 * Normalize an array of allergen codes (letters, numbers, or strings) into unique string codes.
 */
export const mapAllergenCodes = (codes) => {
  if (!Array.isArray(codes)) return []
  const seen = new Set()
  const result = []
  for (const code of codes) {
    const mapped = mapAllergenCode(code)
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped)
      result.push(mapped)
    }
  }
  return result
}

/**
 * Union allergen codes from item and its variants.
 */
export const collectAllergens = (item) => {
  const all = [...(item.allergenCodes || [])]
  for (const variant of item.variants || []) {
    all.push(...(variant.allergenCodes || []))
  }
  return mapAllergenCodes(all)
}
