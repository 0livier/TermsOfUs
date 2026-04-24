import assert from 'node:assert/strict'
import test from 'node:test'

import {
  decodeSelection,
  decodeSparseSelection,
  encodeSelection,
  encodeSparseSelection,
  getCanonicalItemOrder,
  summarizeSelection,
  validateItemCodes,
  type SchemaDefinition,
  type SelectionState,
} from './model.js'

const schema: SchemaDefinition = {
  version: 1,
  categories: [
    {
      id: 'communication',
      items: [
        { id: 'video', code: 1 },
        { id: 'sms', code: 2 },
      ],
    },
    {
      id: 'intimacy',
      items: [
        { id: 'sleeping-together', code: 3 },
        { id: 'cuddling', code: 4 },
        { id: 'kissing', code: 5 },
      ],
    },
  ],
}

test('returns canonical flattened item order from schema order', () => {
  assert.deepEqual(getCanonicalItemOrder(schema), [
    'video',
    'sms',
    'sleeping-together',
    'cuddling',
    'kissing',
  ])
})

test('encodes and decodes an empty selection', () => {
  const itemOrder = getCanonicalItemOrder(schema)

  assert.equal(encodeSelection(itemOrder, {}), 'AAA')
  assert.deepEqual(decodeSelection(itemOrder, 'AAA'), {})
})

test('roundtrips non-empty selection state and summarizes counts', () => {
  const itemOrder = getCanonicalItemOrder(schema)
  const selection: SelectionState = {
    video: 'want',
    'sleeping-together': 'avoid',
    cuddling: 'have',
  }

  const payload = encodeSelection(itemOrder, selection)

  assert.deepEqual(decodeSelection(itemOrder, payload), selection)
  assert.deepEqual(summarizeSelection(selection), {
    want: 1,
    avoid: 1,
    have: 1,
  })
})

test('fails safely for malformed payloads', () => {
  const itemOrder = getCanonicalItemOrder(schema)

  assert.equal(decodeSelection(itemOrder, 'not*base64'), null)
})

test('fails safely when payload length does not match schema item count', () => {
  const itemOrder = getCanonicalItemOrder(schema)

  assert.equal(decodeSelection(itemOrder, 'AA'), null)
})

test('validates permanent item codes', () => {
  assert.deepEqual(validateItemCodes(schema), [])
  assert.deepEqual(
    validateItemCodes({
      version: 1,
      categories: [
        {
          id: 'broken',
          items: [
            { id: 'missing-code', code: 0 },
            { id: 'first', code: 1 },
            { id: 'second', code: 1 },
          ],
        },
      ],
    }),
    [
      'missing-code must have a positive integer code',
      'second reuses code 1 from first',
    ],
  )
})

test('sparse codec omits none items and roundtrips selected states by code', () => {
  const selection: SelectionState = {
    video: 'want',
    cuddling: 'have',
  }

  assert.equal(encodeSparseSelection(schema, selection), 'afat')
  assert.deepEqual(decodeSparseSelection(schema, 'afat'), selection)
})

test('sparse decoder fails safely for malformed payloads', () => {
  assert.equal(decodeSparseSelection(schema, 'a'), null)
  assert.equal(decodeSparseSelection(schema, 'a*'), null)
  assert.equal(decodeSparseSelection(schema, 'aa'), null)
  assert.equal(decodeSparseSelection(schema, 'afaf'), null)
})
