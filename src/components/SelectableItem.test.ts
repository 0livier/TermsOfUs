import assert from 'node:assert/strict'
import test from 'node:test'

import { getSelectableItemAriaLabel } from './selectable-item-labels.js'

test('describes the current item state and next selection action', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'none', 'want'),
    'Video calls, current state: Not selected. Activate to mark as I want this.',
  )
})

test('describes clearing when active state matches current state', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'avoid', 'avoid'),
    'Video calls, current state: I do not want this. Activate to clear state.',
  )
})

test('describes clearing when active state is none', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'have', 'none'),
    'Video calls, current state: We already have this. Activate to clear state.',
  )
})
