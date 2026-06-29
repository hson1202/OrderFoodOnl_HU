/**
 * Import menu from Backend/data/menu.json into MongoDB.
 *
 * Usage (from Backend folder):
 *   node scripts/importMenu.js              # upsert by SKU (default)
 *   node scripts/importMenu.js --dry-run      # preview only
 *   node scripts/importMenu.js --replace-all  # delete all foods + hu categories first
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import categoryModel from '../models/categoryModel.js'
import foodModel from '../models/foodModel.js'
import { collectAllergens } from '../utils/allergens.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const MENU_PATH = path.join(__dirname, '../data/menu.json')

const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const REPLACE_ALL = args.includes('--replace-all')

const warnings = []

function warn(msg) {
  warnings.push(msg)
}

/** Extract all numeric HUF values from a price string. */
function extractPrices(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return []

  // Prefer amounts explicitly marked with Ft (avoids "0.5l" → 0)
  const ftMatches = priceStr.match(/\d{3,}\s*Ft/gi) || []
  if (ftMatches.length) {
    return ftMatches
      .map((m) => parseInt(m.replace(/\s*Ft/i, ''), 10))
      .filter((n) => Number.isFinite(n) && n > 0)
  }

  // Range without Ft suffix: "690-990"
  const rangeMatch = priceStr.match(/(\d{3,})\s*-\s*(\d{3,})/)
  if (rangeMatch) {
    return [parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10)].filter((n) => n > 0)
  }

  return []
}

/** Parse a simple price like "2290 Ft" → 2290 */
function parseSimplePrice(priceStr) {
  const prices = extractPrices(priceStr)
  return prices.length ? prices[0] : 0
}

/** Detect dual uramaki-style price: "2990 Ft / 4690 Ft" with 4db/8db in name */
function parseDualSizePrice(priceStr, item) {
  if (!priceStr || typeof priceStr !== 'string') return null
  const name = `${item.name?.hu || ''} ${item.name?.en || ''}`
  const isPieceSize = /\((4\s*db|4\s*pcs|8\s*db|8\s*pcs)/i.test(name)
  if (!isPieceSize) return null

  const prices = extractPrices(priceStr)
  if (prices.length === 2 && priceStr.includes('/')) {
    return { small: prices[0], large: prices[1] }
  }
  return null
}

function buildVariantOptions(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return []

  const choices = variants.map((v) => ({
    code: v.sku || v.id || String(v.label?.hu || v.label?.en || '').toLowerCase().replace(/\s+/g, '-'),
    label: v.label?.hu || v.label?.en || v.sku || 'Option',
    labelEN: v.label?.en || v.label?.hu || '',
    labelHU: v.label?.hu || v.label?.en || '',
    price: parseSimplePrice(v.price),
    image: v.image || '',
  }))

  return [{
    name: 'Választás',
    nameEN: 'Choice',
    nameHU: 'Választás',
    type: 'select',
    defaultChoiceCode: choices[0].code,
    pricingMode: 'override',
    choices,
  }]
}

function buildDualSizeOptions(item, dual) {
  const baseSku = item.sku || item.id
  return [{
    name: 'Méret',
    nameEN: 'Size',
    nameHU: 'Méret',
    type: 'select',
    defaultChoiceCode: `${baseSku}-4`,
    pricingMode: 'override',
    choices: [
      {
        code: `${baseSku}-4`,
        label: '4 db',
        labelEN: '4 pcs',
        labelHU: '4 db',
        price: dual.small,
        image: item.image || '',
      },
      {
        code: `${baseSku}-8`,
        label: '8 db',
        labelEN: '8 pcs',
        labelHU: '8 db',
        price: dual.large,
        image: item.image || '',
      },
    ],
  }]
}

function resolvePriceAndOptions(item) {
  let options = []
  let price = 0
  let portion = item.portion || ''
  let description = item.description?.hu || item.description?.en || ''

  if (Array.isArray(item.variants) && item.variants.length > 0) {
    options = buildVariantOptions(item.variants)
    price = options[0]?.choices[0]?.price || 0
    return { price, options, portion, description }
  }

  const dual = parseDualSizePrice(item.price, item)
  if (dual) {
    options = buildDualSizeOptions(item, dual)
    price = dual.small
    return { price, options, portion, description }
  }

  const allPrices = extractPrices(item.price)
  if (allPrices.length > 1) {
    price = Math.min(...allPrices)
    const priceNote = item.price.trim()
    if (!portion.includes(priceNote)) {
      portion = portion ? `${portion} | ${priceNote}` : priceNote
    }
    warn(`Complex price for ${item.sku} (${item.id}): "${item.price}" → using min ${price} HUF`)
  } else if (allPrices.length === 1) {
    price = allPrices[0]
  } else if (item.price) {
    warn(`Could not parse price for ${item.sku} (${item.id}): "${item.price}"`)
  }

  return { price, options, portion, description }
}

function transformItem(item, categoryId, categoryImage) {
  const { price, options, portion, description } = resolvePriceAndOptions(item)

  if (!price && options.length === 0) {
    warn(`No price for ${item.sku} (${item.id})`)
  }

  return {
    sku: item.sku,
    slug: item.id,
    name: item.name?.hu || item.name?.en || item.id,
    nameHU: item.name?.hu || '',
    nameEN: item.name?.en || '',
    nameVI: item.name?.en || '',
    description: description || 'No description provided',
    portion,
    price: price || 0,
    image: item.image || categoryImage || '',
    category: categoryId,
    quantity: 999,
    status: 'active',
    allergens: collectAllergens(item),
    isRecommended: !!item.featured,
    recommendPriority: item.featured ? 10 : 999,
    options,
  }
}

async function upsertCategory(cat, sortOrder, dryRun) {
  const name = cat.label?.hu || cat.label?.en || cat.id
  const doc = {
    name,
    description: cat.description?.hu || cat.description?.en || '',
    image: cat.image || '',
    sortOrder,
    language: 'hu',
    isActive: true,
  }

  if (dryRun) {
    return { _id: `dry-run-${cat.id}`, ...doc }
  }

  const result = await categoryModel.findOneAndUpdate(
    { name, language: 'hu' },
    { $set: doc },
    { upsert: true, new: true, runValidators: true }
  )
  return result
}

async function upsertFood(foodDoc, dryRun) {
  if (dryRun) return { upserted: true, sku: foodDoc.sku }

  const result = await foodModel.findOneAndUpdate(
    { sku: foodDoc.sku },
    { $set: foodDoc },
    { upsert: true, new: true, runValidators: true }
  )
  return result
}

async function importMenu() {
  const mongoUrl = process.env.MONGODB_URL || process.env.MONGODB_URI
  if (!mongoUrl) {
    console.error('❌ MONGODB_URL or MONGODB_URI is not set')
    process.exit(1)
  }

  if (!fs.existsSync(MENU_PATH)) {
    console.error(`❌ Menu file not found: ${MENU_PATH}`)
    process.exit(1)
  }

  const menu = JSON.parse(fs.readFileSync(MENU_PATH, 'utf8'))
  const categories = menu.categories || []

  console.log(`📂 Loaded menu.json: ${categories.length} categories`)
  if (DRY_RUN) console.log('🔍 DRY RUN – no database writes\n')
  if (REPLACE_ALL && !DRY_RUN) console.log('⚠️  REPLACE ALL – deleting existing foods and hu categories\n')

  const cleanMongoUrl = mongoUrl.replace(/[?&]appName=[^&]*/g, '').replace(/[?&]$/, '')
  await mongoose.connect(cleanMongoUrl, { retryWrites: true, w: 'majority' })
  console.log('✅ Connected to MongoDB\n')

  if (REPLACE_ALL && !DRY_RUN) {
    const foodDel = await foodModel.deleteMany({})
    const catDel = await categoryModel.deleteMany({ language: 'hu' })
    console.log(`🗑️  Deleted ${foodDel.deletedCount} foods, ${catDel.deletedCount} hu categories\n`)
  }

  const categoryIdBySlug = {}
  let categoryCount = 0

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    const saved = await upsertCategory(cat, i, DRY_RUN)
    categoryIdBySlug[cat.id] = saved._id.toString()
    categoryCount++
    console.log(`  📁 Category [${i + 1}/${categories.length}]: ${saved.name} (${cat.id})`)
  }

  let foodCount = 0
  let optionCount = 0

  for (const cat of categories) {
    const categoryId = categoryIdBySlug[cat.id]
    const items = cat.items || []

    for (const item of items) {
      if (!item.sku) {
        warn(`Skipping item without SKU in category ${cat.id}: ${item.id}`)
        continue
      }

      const foodDoc = transformItem(item, categoryId, cat.image)
      await upsertFood(foodDoc, DRY_RUN)
      foodCount++
      if (foodDoc.options.length > 0) {
        optionCount += foodDoc.options[0].choices.length
      }
      console.log(`  🍣 ${foodDoc.sku} – ${foodDoc.name} (${foodDoc.price} Ft${foodDoc.options.length ? `, ${foodDoc.options[0].choices.length} options` : ''})`)
    }
  }

  console.log('\n📊 IMPORT SUMMARY')
  console.log('=================')
  console.log(`Categories: ${categoryCount}`)
  console.log(`Products:   ${foodCount}`)
  console.log(`Variant choices: ${optionCount}`)
  console.log(`Warnings:   ${warnings.length}`)

  if (warnings.length) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach((w) => console.log(`  - ${w}`))
  }

  if (DRY_RUN) {
    console.log('\n✅ Dry run complete – no changes written.')
  } else {
    console.log('\n✅ Import complete.')
  }
}

importMenu()
  .catch((err) => {
    console.error('❌ Import failed:', err.message)
    if (err.errors) {
      Object.values(err.errors).forEach((e) => console.error('  ', e.message))
    }
    process.exit(1)
  })
  .finally(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close()
      console.log('\n🔌 Database connection closed')
    }
    process.exit(0)
  })
