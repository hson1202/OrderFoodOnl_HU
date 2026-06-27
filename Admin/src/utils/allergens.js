// EU 14 allergens shared config for the Admin product forms.
// Keep codes in sync with Frontend/src/utils/allergens.js and Backend/utils/allergens.js

// EU letter codes from menu.json / Hungarian menus (A = 1 … N = 14)
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

export const ALLERGEN_OPTIONS = [
  { code: 'gluten', icon: '🌾', label: 'Gluten' },
  { code: 'crustaceans', icon: '🦐', label: 'Crustaceans' },
  { code: 'egg', icon: '🥚', label: 'Egg' },
  { code: 'fish', icon: '🐟', label: 'Fish' },
  { code: 'peanut', icon: '🥜', label: 'Peanut' },
  { code: 'soy', icon: '🫘', label: 'Soy' },
  { code: 'milk', icon: '🥛', label: 'Milk' },
  { code: 'nuts', icon: '🌰', label: 'Nuts' },
  { code: 'celery', icon: '🥬', label: 'Celery' },
  { code: 'mustard', icon: '🟡', label: 'Mustard' },
  { code: 'sesame', icon: '🌱', label: 'Sesame' },
  { code: 'sulfites', icon: '🧪', label: 'Sulfites' },
  { code: 'lupin', icon: '🌸', label: 'Lupin' },
  { code: 'molluscs', icon: '🐚', label: 'Molluscs' },
]
