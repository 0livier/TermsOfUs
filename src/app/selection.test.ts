import assert from 'node:assert/strict'
import test from 'node:test'

import { applyActiveState } from './selection.js'

test('applies the active state to an unselected item', () => {
  assert.deepEqual(applyActiveState({}, 'video-calls', 'want'), {
    'video-calls': 'want',
  })
})

test('replaces a different selected state', () => {
  assert.deepEqual(
    applyActiveState({ 'video-calls': 'avoid' }, 'video-calls', 'have'),
    {
      'video-calls': 'have',
    },
  )
})

test('clears an item when applying the same active state twice', () => {
  assert.deepEqual(
    applyActiveState({ 'video-calls': 'want' }, 'video-calls', 'want'),
    {},
  )
})

test('clears an item when applying the none state', () => {
  assert.deepEqual(
    applyActiveState({ 'video-calls': 'avoid' }, 'video-calls', 'none'),
    {},
  )
})
