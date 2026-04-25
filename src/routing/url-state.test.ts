import assert from 'node:assert/strict'
import test from 'node:test'

import { encodeSparseSelection } from '../domain/model.js'
import type { SchemaDefinition, SelectionState } from '../domain/model.js'
import {
  buildUrlStatePath,
  getLocaleFromUrl,
  parseUrlState,
  pushUrlState,
  replaceUrlState,
} from './url-state.js'

const schema: SchemaDefinition = {
  version: 1,
  categories: [
    {
      id: 'communication',
      items: [
        { id: 'video-calls', code: 4 },
        { id: 'text-messages', code: 2 },
      ],
    },
    {
      id: 'intimacy',
      items: [
        { id: 'cuddling', code: 9 },
        { id: 'kissing', code: 10 },
      ],
    },
  ],
}

test('getLocaleFromUrl returns locale when present and supported, null otherwise', () => {
  assert.equal(getLocaleFromUrl(new URL('https://example.test/?lang=fr')), 'fr')
  assert.equal(getLocaleFromUrl(new URL('https://example.test/?lang=en')), 'en')
  assert.equal(getLocaleFromUrl(new URL('https://example.test/?lang=de')), null)
  assert.equal(getLocaleFromUrl(new URL('https://example.test/')), null)
})

test('restores locale, version, and sparse selection from the URL', () => {
  // video-calls (code=4, important=1): (4<<3)|1 = 33 → 'aH'
  // cuddling (code=9, present=2): (9<<3)|2 = 74 → 'bm'
  // sorted by code: video-calls(4) before cuddling(9) → s1aHbm
  const selection: SelectionState = {
    'video-calls': 'important',
    cuddling:      'present',
  }
  const payload = encodeSparseSelection(schema, selection)
  assert.equal(payload, 's1aHbm')

  const parsed = parseUrlState(
    new URL(`https://example.test/?lang=fr#${payload}`),
    schema,
  )

  assert.deepEqual(parsed, {
    locale:     'fr',
    version:    1,
    selection,
    view:       'edit',
    isFallback: false,
  })
})

test('falls back safely for unknown locale and invalid payload', () => {
  assert.deepEqual(
    parseUrlState(new URL('https://example.test/?lang=de#not*valid'), schema),
    {
      locale:     'en',
      version:    1,
      selection:  {},
      view:       'edit',
      isFallback: true,
    },
  )

  assert.deepEqual(
    parseUrlState(new URL('https://example.test/?lang=fr#AA'), schema),
    {
      locale:     'fr',
      version:    1,
      selection:  {},
      view:       'edit',
      isFallback: true,
    },
  )
})

test('builds hash payload URLs and omits default locale and empty selections', () => {
  assert.equal(
    buildUrlStatePath(new URL('https://example.test/en?old=1'), {
      locale: 'fr',
      schema,
      selection: {},
    }),
    '/?lang=fr',
  )

  // kissing (code=10, no=4): (10<<3)|4 = 84 → 'bw' → s1bw
  assert.equal(
    buildUrlStatePath(new URL('https://example.test/TermsOfUs/fr'), {
      locale:    'en',
      schema,
      selection: { kissing: 'no' },
    }),
    '/TermsOfUs/#s1bw',
  )
})

test('parses and builds review view URLs without changing the hash payload', () => {
  const selection: SelectionState = {
    cuddling: 'important',
  }
  const payload = encodeSparseSelection(schema, selection)

  assert.deepEqual(
    parseUrlState(new URL(`https://example.test/?lang=fr&view=review#${payload}`), schema),
    {
      locale:     'fr',
      version:    1,
      selection,
      view:       'review',
      isFallback: false,
    },
  )

  assert.equal(
    buildUrlStatePath(new URL('https://example.test/TermsOfUs/?view=old'), {
      locale:    'fr',
      schema,
      selection,
      view:      'review',
    }),
    `/TermsOfUs/?lang=fr&view=review#${payload}`,
  )
})

test('parses and builds learn more view URLs without changing the hash payload', () => {
  const selection: SelectionState = {
    kissing: 'discuss',
  }
  const payload = encodeSparseSelection(schema, selection)

  assert.deepEqual(
    parseUrlState(new URL(`https://example.test/?view=learn-more#${payload}`), schema),
    {
      locale:     'en',
      version:    1,
      selection,
      view:       'learn-more',
      isFallback: false,
    },
  )

  assert.equal(
    buildUrlStatePath(new URL('https://example.test/TermsOfUs/'), {
      locale:    'fr',
      schema,
      selection,
      view:      'learn-more',
    }),
    `/TermsOfUs/?lang=fr&view=learn-more#${payload}`,
  )
})

test('updates browser history without a reload hook', () => {
  let nextPath = ''
  const history = {
    replaceState: (_data: unknown, _unused: string, url?: string | URL | null) => {
      nextPath = String(url)
    },
  }

  // text-messages (code=2, present=2): (2<<3)|2 = 18 → 'as' → s1as
  const path = replaceUrlState(
    new URL('https://example.test/'),
    {
      locale:    'fr',
      schema,
      selection: { 'text-messages': 'present' },
      view:      'review',
    },
    history,
  )

  assert.equal(path, '/?lang=fr&view=review#s1as')
  assert.equal(nextPath, path)
})

test('pushes view changes onto browser history', () => {
  let nextPath = ''
  const history = {
    pushState: (_data: unknown, _unused: string, url?: string | URL | null) => {
      nextPath = String(url)
    },
  }

  const path = pushUrlState(
    new URL('https://example.test/?lang=fr'),
    {
      locale:    'fr',
      schema,
      selection: {},
      view:      'learn-more',
    },
    history,
  )

  assert.equal(path, '/?lang=fr&view=learn-more')
  assert.equal(nextPath, path)
})

test('unknown view falls back to edit', () => {
  assert.deepEqual(
    parseUrlState(new URL('https://example.test/?view=unknown'), schema),
    {
      locale:     'en',
      version:    1,
      selection:  {},
      view:       'edit',
      isFallback: false,
    },
  )
})

test('unversioned sparse payloads fail safely', () => {
  assert.deepEqual(
    parseUrlState(new URL('https://example.test/?lang=fr#araN'), schema),
    {
      locale:     'fr',
      version:    1,
      selection:  {},
      view:       'edit',
      isFallback: true,
    },
  )
})
