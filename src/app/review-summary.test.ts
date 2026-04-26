import assert from 'node:assert/strict'
import test from 'node:test'

import { buildReviewSummary } from './review-summary.js'
import { localizeSchema } from '../content/loader.js'
import type { SelectionState } from '../domain/model.js'

test('builds a localized review summary grouped by category', () => {
  const content = localizeSchema('en')
  const selection: SelectionState = {
    video: 'present',
    sms: 'discuss',
    empathy: 'important',
  }

  assert.equal(
    buildReviewSummary(content, selection),
    [
      'What follows is my assessment of a relationship using the Relationship Anarchy Smorgasbord framework.',
      '',
      'Here’s where I’m at',
      '',
      'Communication',
      '- Already present: Video calls',
      '- To discuss: Text messages',
      '',
      'Emotional support',
      "- I'd like that: Empathy",
    ].join('\n'),
  )
})

test('omits unanswered categories from the copied summary', () => {
  const content = localizeSchema('fr')

  assert.equal(
    buildReviewSummary(content, {}),
    [
      'Ce qui suit est mon évaluation d’une relation, en m’appuyant sur le système du Relationship Anarchy Smorgasbord.',
      '',
      'Voilà où vous en êtes',
    ].join('\n'),
  )
})
