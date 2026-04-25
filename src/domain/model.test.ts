import assert from 'node:assert/strict'
import test from 'node:test'

import {
  decodeSparseSelection,
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

test('sparse v2 codec omits none items and roundtrips selected states by code', () => {
  const selection: SelectionState = {
    video:    'important',
    cuddling: 'present',
  }

  // video (code=1, important=1): (1<<3)|1 = 9 → 'aj'
  // cuddling (code=4, present=2): (4<<3)|2 = 34 → 'aI'
  // sorted by code: video(1), cuddling(4) → s2ajaI
  assert.equal(encodeSparseSelection(schema, selection), 's2ajaI')
  assert.deepEqual(decodeSparseSelection(schema, 's2ajaI'), selection)
})

test('sparse v2 encodes discuss and no states', () => {
  const selection: SelectionState = {
    sms:     'discuss',
    kissing: 'no',
  }

  // sms (code=2, discuss=3): (2<<3)|3 = 19 → 'at'
  // kissing (code=5, no=4):  (5<<3)|4 = 44 → 'aS'
  // sorted by code: sms(2), kissing(5) → s2ataS
  assert.equal(encodeSparseSelection(schema, selection), 's2ataS')
  assert.deepEqual(decodeSparseSelection(schema, 's2ataS'), selection)
})

test('sparse v2 encodes empty selection as empty string', () => {
  assert.equal(encodeSparseSelection(schema, {}), '')
  assert.deepEqual(decodeSparseSelection(schema, ''), {})
})

test('sparse v2 decoder fails safely for malformed payloads', () => {
  assert.equal(decodeSparseSelection(schema, 's2a'), null)
  assert.equal(decodeSparseSelection(schema, 's2a*'), null)
  assert.equal(decodeSparseSelection(schema, 's2ajajai'), null) // duplicate code
})

test('sparse v2 decoder fails safely for unknown item codes', () => {
  // code 99 does not exist in schema
  // (99<<3)|1 = 793 → encodeSparseChunk(793): high=floor(793/62)=12, low=793%62=49 → 'mX'
  assert.equal(decodeSparseSelection(schema, 's2mX'), null)
})

test('legacy v1 decoder migrates old want/avoid/have payloads', () => {
  // Old format (no prefix): (code<<2)|state_bits, want=1, avoid=2, have=3
  // video (code=1, want=1): (1<<2)|1 = 5 → 'af'
  // cuddling (code=4, have=3): (4<<2)|3 = 19 → 'at'
  // old encoded: 'afat' → migrated: { video:'important', cuddling:'present' }
  assert.deepEqual(decodeSparseSelection(schema, 'afat'), {
    video:    'important',
    cuddling: 'present',
  })
})

test('legacy v1 decoder migrates avoid to no', () => {
  // sms (code=2, avoid=2): (2<<2)|2 = 10 → 'ak'
  assert.deepEqual(decodeSparseSelection(schema, 'ak'), {
    sms: 'no',
  })
})

test('summarizes selection counts by state', () => {
  const selection: SelectionState = {
    video:           'important',
    sms:             'present',
    'sleeping-together': 'discuss',
    cuddling:        'no',
  }

  assert.deepEqual(summarizeSelection(selection), {
    important: 1,
    present:   1,
    discuss:   1,
    no:        1,
  })
})
