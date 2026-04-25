import assert from 'node:assert/strict'
import test from 'node:test'

import { getSelectableItemAriaLabel } from './selectable-item-labels.js'
import { itemStateOptions } from './item-states.js'

test('describes the current item state and next selection action', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'none', 'want', itemStateOptions),
    'Video calls, current state: Not yet answered. Activate to mark as This matters to me.',
  )
})

test('describes clearing when active state matches current state', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'avoid', 'avoid', itemStateOptions),
    'Video calls, current state: Not for me. Activate to clear state.',
  )
})

test('describes clearing when active state is none', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'have', 'none', itemStateOptions),
    'Video calls, current state: Already present. Activate to clear state.',
  )
})
