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
  const selection: SelectionState = {
    'video-calls': 'want',
    cuddling: 'have',
  }
  const payload = encodeSparseSelection(schema, selection)
  const parsed = parseUrlState(
    new URL(`https://example.test/?lang=fr#${payload}`),
    schema,
  )

  assert.deepEqual(parsed, {
    locale: 'fr',
    version: 1,
    selection,
    isFallback: false,
  })
})

test('falls back safely for unknown locale and invalid payload', () => {
  assert.deepEqual(
    parseUrlState(new URL('https://example.test/?lang=de#not*valid'), schema),
    {
      locale: 'en',
      version: 1,
      selection: {},
      isFallback: true,
    },
  )

  assert.deepEqual(
    parseUrlState(new URL('https://example.test/?lang=fr#AA'), schema),
    {
      locale: 'fr',
      version: 1,
      selection: {},
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

  assert.equal(
    buildUrlStatePath(new URL('https://example.test/TermsOfUs/fr'), {
      locale: 'en',
      schema,
      selection: { kissing: 'avoid' },
    }),
    '/TermsOfUs/#aQ',
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
    new URL('https://example.test/'),
    {
      locale: 'fr',
      schema,
      selection: { 'text-messages': 'have' },
    },
    history,
  )

  assert.equal(path, '/?lang=fr#al')
  assert.equal(nextPath, path)
})
