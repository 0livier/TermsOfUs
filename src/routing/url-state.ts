import {
  decodeSparseSelection,
  encodeSparseSelection,
  type SchemaDefinition,
  type SchemaVersion,
  type SelectionState,
} from '../domain/model.js'
import {
  defaultLocale,
  resolveLocale,
  supportedLocales,
  type SupportedLocale,
} from '../content/loader.js'

export type AppView = 'edit' | 'review' | 'learn-more'

export interface ParsedUrlState {
  locale: SupportedLocale
  version: SchemaVersion
  selection: SelectionState
  view: AppView
  isFallback: boolean
}

export interface UrlStateInput {
  locale: SupportedLocale
  schema: SchemaDefinition
  selection: SelectionState
  view?: AppView
}

export function parseUrlState(
  url: URL,
  schema: SchemaDefinition,
): ParsedUrlState {
  const hashPayload = url.hash.replace(/^#/, '')

  if (!hashPayload) {
    return {
      locale: getUrlLocale(url),
      version: schema.version,
      selection: {},
      view: getUrlView(url),
      isFallback: false,
    }
  }

  const selection = decodeSparseSelection(schema, hashPayload)

  return {
    locale: getUrlLocale(url),
    version: schema.version,
    selection: selection ?? {},
    view: getUrlView(url),
    isFallback: selection === null,
  }
}

export function buildUrlStatePath(
  currentUrl: URL,
  state: UrlStateInput,
): string {
  const payload = encodeSparseSelection(state.schema, state.selection)
  const nextUrl = new URL(currentUrl)

  nextUrl.pathname = getBasePath(currentUrl.pathname)
  nextUrl.search = ''
  nextUrl.hash = ''

  if (state.locale !== defaultLocale) {
    nextUrl.searchParams.set('lang', state.locale)
  }

  if (state.view && state.view !== 'edit') {
    nextUrl.searchParams.set('view', state.view)
  }

  if (!isEmptySelection(state.selection)) {
    nextUrl.hash = payload
  }

  return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
}

export function replaceUrlState(
  currentUrl: URL,
  state: UrlStateInput,
  history: Pick<History, 'replaceState'> = window.history,
): string {
  const path = buildUrlStatePath(currentUrl, state)

  history.replaceState(null, '', path)

  return path
}

export function pushUrlState(
  currentUrl: URL,
  state: UrlStateInput,
  history: Pick<History, 'pushState'> = window.history,
): string {
  const path = buildUrlStatePath(currentUrl, state)

  history.pushState(null, '', path)

  return path
}

export function getLocaleFromUrl(url: URL): SupportedLocale | null {
  const lang = url.searchParams.get('lang')
  if (lang === null) return null
  const resolved = resolveLocale(lang)
  return resolved === lang ? resolved : null
}

function getUrlLocale(url: URL): SupportedLocale {
  return resolveLocale(url.searchParams.get('lang'))
}

function getUrlView(url: URL): AppView {
  const view = url.searchParams.get('view')

  return view === 'review' || view === 'learn-more' ? view : 'edit'
}

function getBasePath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)

  if (isLocalePathPart(parts.at(-1))) {
    parts.pop()
  }

  return parts.length > 0 ? `/${parts.join('/')}/` : '/'
}

function isEmptySelection(selection: SelectionState): boolean {
  return Object.keys(selection).length === 0
}

function isLocalePathPart(part: string | undefined): part is SupportedLocale {
  return supportedLocales.some((locale) => locale === part)
}
