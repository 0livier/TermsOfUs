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
  paletteMode: string
  cycleMode: string
  reset: string
  copyLink: string
  linkCopied: string
  copyUnavailable: string
}

export interface LocalizedContent {
  locale: SupportedLocale
  schema: SchemaDefinition
  categories: LocalizedCategory[]
  stateOptions: ItemStateOption[]
  uiActions: UiActions
}

const ITEM_STATES: ItemState[] = ['none', 'want', 'have', 'avoid']

const DEFAULT_UI_ACTIONS: UiActions = {
  wheelView:       'Wheel',
  listView:        'List',
  paletteMode:     'Palette',
  cycleMode:       'Cycling',
  reset:           'Reset',
  copyLink:        'Copy link',
  linkCopied:      'Link copied',
  copyUnavailable: 'Copy unavailable',
}

const DEFAULT_STATE_OPTIONS: ItemStateOption[] = [
  { value: 'none', label: 'Not selected', shortLabel: 'None' },
  { value: 'want', label: 'I want this', shortLabel: 'Want' },
  { value: 'have', label: 'We already have this', shortLabel: 'Have' },
  { value: 'avoid', label: 'I do not want this', shortLabel: 'Avoid' },
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
    uiActions: buildUiActions(requestedContent, fallbackContent),
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
    paletteMode:     key('paletteMode'),
    cycleMode:       key('cycleMode'),
    reset:           key('reset'),
    copyLink:        key('copyLink'),
    linkCopied:      key('linkCopied'),
    copyUnavailable: key('copyUnavailable'),
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
