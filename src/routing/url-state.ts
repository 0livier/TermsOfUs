import {
  decodeSelection,
  encodeSelection,
  getCanonicalItemOrder,
  type SchemaDefinition,
  type SchemaVersion,
  type SelectionState,
} from '../domain/model.js'
import {
  resolveLocale,
  supportedLocales,
  type SupportedLocale,
} from '../content/loader.js'

export interface ParsedUrlState {
  locale: SupportedLocale
  version: SchemaVersion
  selection: SelectionState
  isFallback: boolean
}

export interface UrlStateInput {
  locale: SupportedLocale
  schema: SchemaDefinition
  selection: SelectionState
}

export function parseUrlState(
  url: URL,
  schema: SchemaDefinition,
): ParsedUrlState {
  const itemOrder = getCanonicalItemOrder(schema)
  const parsedVersion = Number(url.searchParams.get('v') ?? schema.version)
  const version =
    Number.isInteger(parsedVersion) && parsedVersion === schema.version
      ? parsedVersion
      : schema.version
  const isVersionFallback = version !== parsedVersion
  const payload = url.searchParams.get('s')

  if (!payload || isVersionFallback) {
    return {
      locale: getPathLocale(url.pathname),
      version,
      selection: {},
      isFallback: isVersionFallback,
    }
  }

  const selection = decodeSelection(itemOrder, payload)

  return {
    locale: getPathLocale(url.pathname),
    version,
    selection: selection ?? {},
    isFallback: selection === null,
  }
}

export function buildUrlStatePath(
  currentUrl: URL,
  state: UrlStateInput,
): string {
  const itemOrder = getCanonicalItemOrder(state.schema)
  const payload = encodeSelection(itemOrder, state.selection)
  const nextUrl = new URL(currentUrl)

  nextUrl.pathname = buildLocalePath(currentUrl.pathname, state.locale)
  nextUrl.searchParams.set('v', String(state.schema.version))

  if (isEmptySelection(state.selection)) {
    nextUrl.searchParams.delete('s')
  } else {
    nextUrl.searchParams.set('s', payload)
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

function getPathLocale(pathname: string): SupportedLocale {
  const locale = pathname
    .split('/')
    .filter(Boolean)
    .at(-1)

  return resolveLocale(locale)
}

function buildLocalePath(pathname: string, locale: SupportedLocale): string {
  const parts = pathname.split('/').filter(Boolean)

  if (isLocalePathPart(parts.at(-1))) {
    parts[parts.length - 1] = locale
  } else {
    parts.push(locale)
  }

  return `/${parts.join('/')}`
}

function isEmptySelection(selection: SelectionState): boolean {
  return Object.keys(selection).length === 0
}

function isLocalePathPart(part: string | undefined): part is SupportedLocale {
  return supportedLocales.some((locale) => locale === part)
}
