import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getSchema,
  localizeContent,
  localizeSchema,
  resolveLocale,
  supportedLocales,
} from './loader.js'
import { validateItemCodes, type LocaleContent, type SchemaDefinition } from '../domain/model.js'

test('resolves supported locales and falls back to the default locale', () => {
  assert.equal(resolveLocale('en'), 'en')
  assert.equal(resolveLocale('fr'), 'fr')
  assert.equal(resolveLocale('de'), 'en')
  assert.equal(resolveLocale(undefined), 'en')
})

test('loads versioned schema content with stable ids', () => {
  const schema = getSchema()

  assert.equal(schema.version, 1)
  assert.ok(schema.categories.length > 0)
  assert.deepEqual(supportedLocales, ['en', 'fr'])

  const categoryIds = new Set(schema.categories.map((category) => category.id))
  const itemIds = new Set(
    schema.categories.flatMap((category) => category.items.map((item) => item.id)),
  )
  const itemCodes = new Set(
    schema.categories.flatMap((category) =>
      category.items.map((item) => item.code),
    ),
  )
  const itemCount = schema.categories.reduce(
    (count, category) => count + category.items.length,
    0,
  )

  assert.equal(categoryIds.size, schema.categories.length)
  assert.equal(itemIds.size, itemCount)
  assert.equal(itemCodes.size, itemCount)
  assert.deepEqual(validateItemCodes(schema), [])
})

test('localizes schema labels for English and French', () => {
  const english = localizeSchema('en')
  const french = localizeSchema('fr')

  assert.equal(english.categories[0]?.label, 'Communication')
  assert.equal(english.categories[0]?.items[0]?.label, 'Video calls')
  assert.equal(french.categories[0]?.label, 'Communication')
  assert.equal(french.categories[0]?.items[0]?.label, 'Appels video')
})

test('falls back to default locale labels when translations are missing', () => {
  const schema: SchemaDefinition = {
    version: 1,
    categories: [
      {
        id: 'communication',
        items: [
          { id: 'video-calls', code: 1 },
          { id: 'unknown-item', code: 2 },
        ],
      },
    ],
  }
  const requested: LocaleContent = {
    locale: 'fr',
    categories: {},
    items: {
      'video-calls': { label: 'Appels video' },
    },
  }
  const fallback: LocaleContent = {
    locale: 'en',
    categories: {
      communication: { label: 'Communication' },
    },
    items: {
      'video-calls': { label: 'Video calls' },
    },
  }

  const localized = localizeContent(schema, 'fr', requested, fallback)

  assert.equal(localized.categories[0]?.label, 'Communication')
  assert.equal(localized.categories[0]?.items[0]?.label, 'Appels video')
  assert.equal(localized.categories[0]?.items[1]?.label, 'unknown-item')
})
