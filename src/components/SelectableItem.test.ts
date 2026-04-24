import assert from 'node:assert/strict'
import test from 'node:test'

import { getSelectableItemAriaLabel } from './selectable-item-labels.js'
import { itemStateOptions } from './item-states.js'

test('describes the current item state and next selection action', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'none', 'want', itemStateOptions),
    'Video calls, current state: Not selected. Activate to mark as I want this.',
  )
})

test('describes clearing when active state matches current state', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'avoid', 'avoid', itemStateOptions),
    'Video calls, current state: I do not want this. Activate to clear state.',
  )
})

test('describes clearing when active state is none', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'have', 'none', itemStateOptions),
    'Video calls, current state: We already have this. Activate to clear state.',
  )
})
