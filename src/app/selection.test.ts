import assert from 'node:assert/strict'
import test from 'node:test'

import { applyActiveState } from './selection.js'

test('applies the active state to an unselected item', () => {
  assert.deepEqual(applyActiveState({}, 'video-calls', 'important'), {
    'video-calls': 'important',
  })
})

test('replaces a different selected state', () => {
  assert.deepEqual(
    applyActiveState({ 'video-calls': 'no' }, 'video-calls', 'present'),
    {
      'video-calls': 'present',
    },
  )
})

test('clears an item when applying the same active state twice', () => {
  assert.deepEqual(
    applyActiveState({ 'video-calls': 'important' }, 'video-calls', 'important'),
    {},
  )
})

test('clears an item when applying the none state', () => {
  assert.deepEqual(
    applyActiveState({ 'video-calls': 'no' }, 'video-calls', 'none'),
    {},
  )
})
