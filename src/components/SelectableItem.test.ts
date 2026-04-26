import assert from 'node:assert/strict'
import test from 'node:test'

import { getSelectableItemAriaLabel } from './selectable-item-labels.js'
import { itemStateOptions } from './item-states.js'

test('describes unanswered state and next selection action', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'none', 'important', itemStateOptions),
    "Video calls, current state: Unanswered. Activate to mark as I'd like that.",
  )
})

test('describes clearing when active state matches current state', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'no', 'no', itemStateOptions),
    'Video calls, current state: Not for me. Activate to clear state.',
  )
})

test('describes clearing when active state is none', () => {
  assert.equal(
    getSelectableItemAriaLabel('Video calls', 'present', 'none', itemStateOptions),
    'Video calls, current state: Already present. Activate to clear state.',
  )
})
