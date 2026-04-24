import assert from 'node:assert/strict'
import test from 'node:test'

import { encodeSelection, getCanonicalItemOrder } from '../domain/model.js'
import type { SchemaDefinition, SelectionState } from '../domain/model.js'
import {
  buildUrlStatePath,
  parseUrlState,
  replaceUrlState,
} from './url-state.js'

const schema: SchemaDefinition = {
  version: 1,
  categories: [
    {
      id: 'communication',
      items: [{ id: 'video-calls' }, { id: 'text-messages' }],
    },
    {
      id: 'intimacy',
      items: [{ id: 'cuddling' }, { id: 'kissing' }],
    },
  ],
}

test('restores locale, version, and selection from the URL', () => {
  const selection: SelectionState = {
    'video-calls': 'want',
    cuddling: 'have',
  }
  const payload = encodeSelection(getCanonicalItemOrder(schema), selection)
  const parsed = parseUrlState(
    new URL(`https://example.test/fr?v=1&s=${payload}`),
    schema,
  )

  assert.deepEqual(parsed, {
    locale: 'fr',
    version: 1,
    selection,
    isFallback: false,
  })
})

test('falls back safely for unknown locale, unsupported version, and invalid payload', () => {
  assert.deepEqual(
    parseUrlState(new URL('https://example.test/de?v=1&s=not*valid'), schema),
    {
      locale: 'en',
      version: 1,
      selection: {},
      isFallback: true,
    },
  )

  assert.deepEqual(
    parseUrlState(new URL('https://example.test/fr?v=99&s=AA'), schema),
    {
      locale: 'fr',
      version: 1,
      selection: {},
      isFallback: true,
    },
  )
})

test('builds path-based locale URLs and omits empty selection payloads', () => {
  assert.equal(
    buildUrlStatePath(new URL('https://example.test/en?old=1'), {
      locale: 'fr',
      schema,
      selection: {},
    }),
    '/fr?old=1&v=1',
  )

  assert.equal(
    buildUrlStatePath(new URL('https://example.test/TermsOfUs/fr'), {
      locale: 'en',
      schema,
      selection: { kissing: 'avoid' },
    }),
    '/TermsOfUs/en?v=1&s=Ag',
  )
})

test('updates browser history without a reload hook', () => {
  let nextPath = ''
  const history = {
    replaceState: (_data: unknown, _unused: string, url?: string | URL | null) => {
      nextPath = String(url)
    },
  }

  const path = replaceUrlState(
    new URL('https://example.test/fr?v=1'),
    {
      locale: 'fr',
      schema,
      selection: { 'text-messages': 'have' },
    },
    history,
  )

  assert.equal(path, '/fr?v=1&s=MA')
  assert.equal(nextPath, path)
})
