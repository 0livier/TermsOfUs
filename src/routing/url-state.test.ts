import assert from 'node:assert/strict'
import test from 'node:test'

import { encodeSparseSelection } from '../domain/model.js'
import type { SchemaDefinition, SelectionState } from '../domain/model.js'
import {
  buildUrlStatePath,
  getLocaleFromUrl,
  parseUrlState,
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
  // sorted by code: video-calls(4) before cuddling(9) → s2aHbm
  const selection: SelectionState = {
    'video-calls': 'important',
    cuddling:      'present',
  }
  const payload = encodeSparseSelection(schema, selection)
  assert.equal(payload, 's2aHbm')

  const parsed = parseUrlState(
    new URL(`https://example.test/?lang=fr#${payload}`),
    schema,
  )

  assert.deepEqual(parsed, {
    locale:     'fr',
    version:    1,
    selection,
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
      isFallback: true,
    },
  )

  assert.deepEqual(
    parseUrlState(new URL('https://example.test/?lang=fr#AA'), schema),
    {
      locale:     'fr',
      version:    1,
      selection:  {},
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

  // kissing (code=10, no=4): (10<<3)|4 = 84 → 'bw' → s2bw
  assert.equal(
    buildUrlStatePath(new URL('https://example.test/TermsOfUs/fr'), {
      locale:    'en',
      schema,
      selection: { kissing: 'no' },
    }),
    '/TermsOfUs/#s2bw',
  )
})

test('updates browser history without a reload hook', () => {
  let nextPath = ''
  const history = {
    replaceState: (_data: unknown, _unused: string, url?: string | URL | null) => {
      nextPath = String(url)
    },
  }

  // text-messages (code=2, present=2): (2<<3)|2 = 18 → 'as' → s2as
  const path = replaceUrlState(
    new URL('https://example.test/'),
    {
      locale:    'fr',
      schema,
      selection: { 'text-messages': 'present' },
    },
    history,
  )

  assert.equal(path, '/?lang=fr#s2as')
  assert.equal(nextPath, path)
})

test('legacy v1 URLs decode with migration (want→important, have→present, avoid→no)', () => {
  // Old format: video-calls (code=4, want=1): (4<<2)|1 = 17 → 'ar'
  // Old format: cuddling (code=9, have=3):    (9<<2)|3 = 39 → 'aP' (P=41... wait)
  // Let me recalculate: 39 → high=0, low=39, ALPHABET[39]='N'...
  // a=0..z=25, A=26, B=27, ..., N=39 → 'aN'
  // sorted: video-calls(4), cuddling(9) → 'araraP'... let me be precise:
  // video-calls: 17 → high=0, low=17 → ALPHABET[17]='r' → 'ar'
  // cuddling:    39 → high=0, low=39 → ALPHABET[39]='N' → 'aN'
  // sorted by code: text-messages(2 < 4=video-calls) — but we only have video-calls and cuddling here
  // sorted: code 4 then code 9 → 'araN'
  const parsed = parseUrlState(
    new URL('https://example.test/?lang=fr#araN'),
    schema,
  )

  assert.deepEqual(parsed, {
    locale:     'fr',
    version:    1,
    selection: {
      'video-calls': 'important',
      cuddling:      'present',
    },
    isFallback: false,
  })
})
