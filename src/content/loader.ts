import schemaV1 from './schema.v1.json' with { type: 'json' }
import en from './locales/en.json' with { type: 'json' }
import fr from './locales/fr.json' with { type: 'json' }
import type {
  CategoryId,
  ItemId,
  ItemState,
  ItemStateOption,
  LocaleCode,
  LocaleContent,
  SchemaDefinition,
} from '../domain/model.js'

export const defaultLocale = 'en'
export const supportedLocales = ['en', 'fr'] as const

export type SupportedLocale = (typeof supportedLocales)[number]

export interface LocalizedItem {
  id: ItemId
  label: string
}

export interface LocalizedCategory {
  id: CategoryId
  label: string
  items: LocalizedItem[]
}

export interface UiActions {
  wheelView: string
  listView: string
  reset: string
  copyLink: string
  linkCopied: string
  copyUnavailable: string
}

export interface UiWheel {
  description: string
  emptyHint: string
}

export interface LocalizedContent {
  locale: SupportedLocale
  schema: SchemaDefinition
  categories: LocalizedCategory[]
  stateOptions: ItemStateOption[]
  uiActions: UiActions
  headline: string
  subheadline: string
  wheel: UiWheel
}

const ITEM_STATES: ItemState[] = ['none', 'want', 'have', 'avoid']

const DEFAULT_UI_ACTIONS: UiActions = {
  wheelView:       'Map',
  listView:        'List',
  reset:           'Clear all',
  copyLink:        'Copy link',
  linkCopied:      'Link copied',
  copyUnavailable: 'Could not copy',
}

const DEFAULT_UI_WHEEL: UiWheel = {
  description: 'Each slice is one item. Colour shows your answer. Tap a slice to review or change it.',
  emptyHint:   'Tap any slice to begin. There are no right or wrong answers.',
}

const DEFAULT_HEADLINE    = 'What do you need in a relationship?'
const DEFAULT_SUBHEADLINE = "A quiet space to reflect on what matters, what's already there, and what isn't right for you."

const DEFAULT_STATE_OPTIONS: ItemStateOption[] = [
  { value: 'none', label: 'Not yet answered',  shortLabel: '–' },
  { value: 'want', label: 'This matters to me', shortLabel: 'Matters' },
  { value: 'have', label: 'Already present',    shortLabel: 'Present' },
  { value: 'avoid', label: 'Not for me',        shortLabel: 'Limit' },
]

const schema = schemaV1 as SchemaDefinition
const locales: Record<SupportedLocale, LocaleContent> = {
  en: en as LocaleContent,
  fr: fr as LocaleContent,
}

export function getSchema(): SchemaDefinition {
  return schema
}

export function getLocaleContent(locale: LocaleCode): LocaleContent {
  return locales[resolveLocale(locale)]
}

export function resolveLocale(locale: LocaleCode | null | undefined): SupportedLocale {
  if (isSupportedLocale(locale)) {
    return locale
  }

  return defaultLocale
}

const LOCALE_STORAGE_KEY = 'locale'

export function getLocalePreference(): SupportedLocale | null {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY)
    return isSupportedLocale(stored) ? stored : null
  } catch {
    return null
  }
}

export function saveLocalePreference(locale: SupportedLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {}
}

export function getLocaleFromBrowser(): SupportedLocale | null {
  if (typeof navigator === 'undefined') return null
  const lang = navigator.language.split('-')[0]
  return isSupportedLocale(lang) ? lang : null
}

export function localizeSchema(
  requestedLocale: LocaleCode | null | undefined,
  options: { logMissing?: boolean } = {},
): LocalizedContent {
  const locale = resolveLocale(requestedLocale)

  return localizeContent(schema, locale, locales[locale], locales[defaultLocale], options)
}

export function localizeContent(
  schema: SchemaDefinition,
  locale: SupportedLocale,
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
  options: { logMissing?: boolean } = {},
): LocalizedContent {
  return {
    locale,
    schema,
    stateOptions: buildStateOptions(requestedContent, fallbackContent),
    uiActions:    buildUiActions(requestedContent, fallbackContent),
    headline:     requestedContent.ui?.headline ?? fallbackContent.ui?.headline ?? DEFAULT_HEADLINE,
    subheadline:  requestedContent.ui?.subheadline ?? fallbackContent.ui?.subheadline ?? DEFAULT_SUBHEADLINE,
    wheel:        buildUiWheel(requestedContent, fallbackContent),
    categories: schema.categories.map((category) => ({
      id: category.id,
      label: getCategoryLabel(
        category.id,
        requestedContent,
        fallbackContent,
        options.logMissing,
      ),
      items: category.items.map((item) => ({
        id: item.id,
        label: getItemLabel(
          item.id,
          requestedContent,
          fallbackContent,
          options.logMissing,
        ),
      })),
    })),
  }
}

function buildUiActions(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiActions {
  const req = requestedContent.ui?.actions ?? {}
  const fb  = fallbackContent.ui?.actions ?? {}
  const key = <K extends keyof UiActions>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_ACTIONS[k]
  return {
    wheelView:       key('wheelView'),
    listView:        key('listView'),
    reset:           key('reset'),
    copyLink:        key('copyLink'),
    linkCopied:      key('linkCopied'),
    copyUnavailable: key('copyUnavailable'),
  }
}

function buildUiWheel(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiWheel {
  const req = requestedContent.ui?.wheel ?? {}
  const fb  = fallbackContent.ui?.wheel ?? {}
  return {
    description: req.description ?? fb.description ?? DEFAULT_UI_WHEEL.description,
    emptyHint:   req.emptyHint   ?? fb.emptyHint   ?? DEFAULT_UI_WHEEL.emptyHint,
  }
}

function buildStateOptions(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): ItemStateOption[] {
  return ITEM_STATES.map((state) => {
    const defaultOption = DEFAULT_STATE_OPTIONS.find((o) => o.value === state)!
    return {
      value: state,
      label:
        requestedContent.ui?.states?.[state]?.label ??
        fallbackContent.ui?.states?.[state]?.label ??
        defaultOption.label,
      shortLabel:
        requestedContent.ui?.states?.[state]?.shortLabel ??
        fallbackContent.ui?.states?.[state]?.shortLabel ??
        defaultOption.shortLabel,
    }
  })
}

function isSupportedLocale(
  locale: LocaleCode | null | undefined,
): locale is SupportedLocale {
  return supportedLocales.some((supportedLocale) => supportedLocale === locale)
}

function getCategoryLabel(
  id: CategoryId,
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
  logMissing = false,
): string {
  return getLabel(
    `category:${id}`,
    requestedContent.categories[id]?.label,
    fallbackContent.categories[id]?.label,
    id,
    logMissing,
  )
}

function getItemLabel(
  id: ItemId,
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
  logMissing = false,
): string {
  return getLabel(
    `item:${id}`,
    requestedContent.items[id]?.label,
    fallbackContent.items[id]?.label,
    id,
    logMissing,
  )
}

function getLabel(
  key: string,
  requestedLabel: string | undefined,
  fallbackLabel: string | undefined,
  finalFallback: string,
  logMissing: boolean,
): string {
  if (requestedLabel) {
    return requestedLabel
  }

  if (logMissing && import.meta.env?.DEV) {
    console.warn(`Missing translation for ${key}`)
  }

  return fallbackLabel ?? finalFallback
}
