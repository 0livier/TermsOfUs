import assert from 'node:assert/strict'
import test from 'node:test'

import {
  decodeSelection,
  encodeSelection,
  getCanonicalItemOrder,
  summarizeSelection,
  type SchemaDefinition,
  type SelectionState,
} from './model.js'

const schema: SchemaDefinition = {
  version: 1,
  categories: [
    {
      id: 'communication',
      items: [{ id: 'video' }, { id: 'sms' }],
    },
    {
      id: 'intimacy',
      items: [{ id: 'sleeping-together' }, { id: 'cuddling' }, { id: 'kissing' }],
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
