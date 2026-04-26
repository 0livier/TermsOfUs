import schemaV1 from './schema.v1.json' with { type: 'json' }
import en from './locales/en.json' with { type: 'json' }
import fr from './locales/fr.json' with { type: 'json' }
import type {
  CategoryId,
  ItemId,
  ItemStateOption,
  LocaleContent,
  SchemaDefinition,
  SelectedItemState,
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
  reset: string
  copyLink: string
  linkCopied: string
  copyUnavailable: string
}

export interface UiShare {
  label: string
  accessibleLabel: string
  title: string
  body: string
  copyLink: string
}

export interface UiReview {
  label: string
  accessibleLabel: string
  title: string
  countLabel: string
  organizeBy: string
  byAnswer: string
  byCategory: string
  backToEdit: string
  emptyTitle: string
  emptyBody: string
  emptyCta: string
}

export interface UiWheel {
  description: string
  emptyHint: string
}

export interface UiIntro {
  title: string
  body: string
  privacy: string
  startCategory: string
  browseCategories: string
  seeMap: string
  learnMore: string
}

export interface UiLearnMoreSection {
  title: string
  body: string
}

export interface UiLearnMore {
  title: string
  intro: string
  sections: UiLearnMoreSection[]
  cta: string
  back: string
}

export interface UiMapPreview {
  title: string
  stopAnytime: string
}

export interface UiAllItems {
  title: string
  subtitle: string
  searchPlaceholder: string
  allCategories: string
  showUnanswered: string
}

export interface UiMenu {
  open: string
  clearAll: string
}

export interface UiConfirm {
  clearTitle: string
  clearBody: string
  clearCancel: string
  clearConfirm: string
}

export interface LocalizedContent {
  locale: SupportedLocale
  schema: SchemaDefinition
  categories: LocalizedCategory[]
  stateOptions: ItemStateOption[]
  uiActions: UiActions
  share: UiShare
  review: UiReview
  intro: UiIntro
  learnMore: UiLearnMore
  mapPreview: UiMapPreview
  allItems: UiAllItems
  headline: string
  subheadline: string
  wheel: UiWheel
  languageLabel: string
  fallbackMessage: string
  menu: UiMenu
  confirm: UiConfirm
}

const SELECTED_STATES: SelectedItemState[] = ['present', 'important', 'discuss', 'no']

const DEFAULT_STATE_OPTIONS: ItemStateOption[] = [
  { value: 'present',   label: 'Present',   longLabel: 'Already present',   shortLabel: 'Present',   icon: '✓' },
  { value: 'important', label: 'Important', longLabel: "I'd like that",  shortLabel: 'Important', icon: '★' },
  { value: 'discuss',   label: 'Discuss',   longLabel: 'To discuss',        shortLabel: 'Discuss',   icon: '◆' },
  { value: 'no',        label: 'No',        longLabel: 'Not for me',        shortLabel: 'No',        icon: '✕' },
]

const DEFAULT_UI_ACTIONS: UiActions = {
  reset:           'Clear all',
  copyLink:        'Copy link',
  linkCopied:      'Link copied',
  copyUnavailable: 'Could not copy',
}

const DEFAULT_UI_SHARE: UiShare = {
  label:           'Share',
  accessibleLabel: 'Share your reflection',
  title:           'Share your reflection',
  body:            'This creates a link containing your current answers. Anyone with the link can view them.',
  copyLink:        'Copy link',
}

const DEFAULT_UI_REVIEW: UiReview = {
  label:           'See where I’m at',
  accessibleLabel: 'See where I’m at in my answers',
  title:           'Your reflection',
  countLabel:      '{count} answers added',
  organizeBy:      'Organize by',
  byAnswer:        'Answer',
  byCategory:      'Category',
  backToEdit:      'Back to edit',
  emptyTitle:      'Nothing to review yet',
  emptyBody:       'Start by marking a few items, then come back here to see your reflection.',
  emptyCta:        'Start answering',
}

const DEFAULT_UI_WHEEL: UiWheel = {
  description: 'Each slice is one item. Colour shows your answer.',
  emptyHint:   'Tap a category to begin. There are no right or wrong answers.',
}

const DEFAULT_UI_INTRO: UiIntro = {
  title:            'What matters to you in a relationship?',
  body:             'Mark what matters, what already exists, what you want to discuss, and what is not for you. There are no right or wrong answers.',
  privacy:          'Your answers stay on your device. If you share a link, it will contain your answers.',
  startCategory:    'Start with one category',
  browseCategories: 'Browse all categories',
  seeMap:           'See the map',
  learnMore:        'Learn more',
}

const DEFAULT_UI_LEARN_MORE: UiLearnMore = {
  title: 'What is Terms of Us for?',
  intro: 'Terms of Us is a relationship-reflection tool for noticing what matters to you.',
  sections: [],
  cta:   'Start gently',
  back:  'Back to home',
}

const DEFAULT_UI_MAP_PREVIEW: UiMapPreview = {
  title:      'Your relationship map',
  stopAnytime: 'Stop anytime',
}

const DEFAULT_UI_ALL_ITEMS: UiAllItems = {
  title:             'All items',
  subtitle:          'One page to review and mark items at your own pace.',
  searchPlaceholder: 'Search items',
  allCategories:     'All categories',
  showUnanswered:    'Show unanswered',
}

const DEFAULT_UI_MENU: UiMenu = {
  open:     'Menu',
  clearAll: 'Clear all',
}

const DEFAULT_UI_CONFIRM: UiConfirm = {
  clearTitle:   'Clear your marks?',
  clearBody:    'This will remove all your answers. You can share a link first to keep them.',
  clearCancel:  'Keep them',
  clearConfirm: 'Clear marks',
}

const DEFAULT_HEADLINE    = 'What do you need in a relationship?'
const DEFAULT_SUBHEADLINE = "A quiet space to reflect on what matters, what's already there, and what isn't right for you."
const DEFAULT_LANGUAGE_LABEL = 'Language'
const DEFAULT_FALLBACK_MESSAGE = 'The shared link could not be restored, so the selection was reset.'

const schema = schemaV1 as SchemaDefinition
const locales: Record<SupportedLocale, LocaleContent> = {
  en: en as LocaleContent,
  fr: fr as LocaleContent,
}

export function getSchema(): SchemaDefinition {
  return schema
}

export function getLocaleContent(locale: string): LocaleContent {
  return locales[resolveLocale(locale)]
}

export function resolveLocale(locale: string | null | undefined): SupportedLocale {
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
  } catch {
    // Locale persistence is optional; private browsing can reject localStorage.
  }
}

export function getLocaleFromBrowser(): SupportedLocale | null {
  if (typeof navigator === 'undefined') return null
  const lang = navigator.language.split('-')[0]
  return isSupportedLocale(lang) ? lang : null
}

export function localizeSchema(
  requestedLocale: string | null | undefined,
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
    share:        buildUiShare(requestedContent, fallbackContent),
    review:       buildUiReview(requestedContent, fallbackContent),
    intro:        buildUiIntro(requestedContent, fallbackContent),
    learnMore:    buildUiLearnMore(requestedContent, fallbackContent),
    mapPreview:   buildUiMapPreview(requestedContent, fallbackContent),
    allItems:     buildUiAllItems(requestedContent, fallbackContent),
    headline:     requestedContent.ui?.headline    ?? fallbackContent.ui?.headline    ?? DEFAULT_HEADLINE,
    subheadline:  requestedContent.ui?.subheadline ?? fallbackContent.ui?.subheadline ?? DEFAULT_SUBHEADLINE,
    wheel:        buildUiWheel(requestedContent, fallbackContent),
    languageLabel:   requestedContent.ui?.header?.languageLabel   ?? fallbackContent.ui?.header?.languageLabel   ?? DEFAULT_LANGUAGE_LABEL,
    fallbackMessage: requestedContent.ui?.fallback?.linkRestoreFailed ?? fallbackContent.ui?.fallback?.linkRestoreFailed ?? DEFAULT_FALLBACK_MESSAGE,
    menu:    buildUiMenu(requestedContent, fallbackContent),
    confirm: buildUiConfirm(requestedContent, fallbackContent),
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

function buildUiReview(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiReview {
  const req = requestedContent.ui?.review ?? {}
  const fb  = fallbackContent.ui?.review ?? {}
  const key = <K extends keyof UiReview>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_REVIEW[k]
  return {
    label:           key('label'),
    accessibleLabel: key('accessibleLabel'),
    title:           key('title'),
    countLabel:      key('countLabel'),
    organizeBy:      key('organizeBy'),
    byAnswer:        key('byAnswer'),
    byCategory:      key('byCategory'),
    backToEdit:      key('backToEdit'),
    emptyTitle:      key('emptyTitle'),
    emptyBody:       key('emptyBody'),
    emptyCta:        key('emptyCta'),
  }
}

function buildUiShare(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiShare {
  const req = requestedContent.ui?.share ?? {}
  const fb  = fallbackContent.ui?.share ?? {}
  const key = <K extends keyof UiShare>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_SHARE[k]
  return {
    label:           key('label'),
    accessibleLabel: key('accessibleLabel'),
    title:           key('title'),
    body:            key('body'),
    copyLink:        key('copyLink'),
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

function buildUiIntro(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiIntro {
  const req = requestedContent.ui?.intro ?? {}
  const fb  = fallbackContent.ui?.intro  ?? {}
  const key = <K extends keyof UiIntro>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_INTRO[k]
  return {
    title:            key('title'),
    body:             key('body'),
    privacy:          key('privacy'),
    startCategory:    key('startCategory'),
    browseCategories: key('browseCategories'),
    seeMap:           key('seeMap'),
    learnMore:        key('learnMore'),
  }
}

function buildUiLearnMore(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiLearnMore {
  const req = requestedContent.ui?.learnMore ?? {}
  const fb  = fallbackContent.ui?.learnMore  ?? {}
  const fallbackSections = fb.sections ?? DEFAULT_UI_LEARN_MORE.sections
  return {
    title:    req.title ?? fb.title ?? DEFAULT_UI_LEARN_MORE.title,
    intro:    req.intro ?? fb.intro ?? DEFAULT_UI_LEARN_MORE.intro,
    sections: (req.sections?.length ? req.sections : fallbackSections).map((section, index) => ({
      title: section.title ?? fallbackSections[index]?.title ?? '',
      body:  section.body  ?? fallbackSections[index]?.body  ?? '',
    })).filter((section) => section.title && section.body),
    cta:  req.cta  ?? fb.cta  ?? DEFAULT_UI_LEARN_MORE.cta,
    back: req.back ?? fb.back ?? DEFAULT_UI_LEARN_MORE.back,
  }
}

function buildUiMapPreview(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiMapPreview {
  const req = requestedContent.ui?.mapPreview ?? {}
  const fb  = fallbackContent.ui?.mapPreview  ?? {}
  const key = <K extends keyof UiMapPreview>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_MAP_PREVIEW[k]
  return {
    title:       key('title'),
    stopAnytime: key('stopAnytime'),
  }
}

function buildUiAllItems(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiAllItems {
  const req = requestedContent.ui?.allItems ?? {}
  const fb  = fallbackContent.ui?.allItems  ?? {}
  const key = <K extends keyof UiAllItems>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_ALL_ITEMS[k]
  return {
    title:             key('title'),
    subtitle:          key('subtitle'),
    searchPlaceholder: key('searchPlaceholder'),
    allCategories:     key('allCategories'),
    showUnanswered:    key('showUnanswered'),
  }
}

function buildUiMenu(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiMenu {
  const req = requestedContent.ui?.menu ?? {}
  const fb  = fallbackContent.ui?.menu  ?? {}
  const key = <K extends keyof UiMenu>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_MENU[k]
  return {
    open:     key('open'),
    clearAll: key('clearAll'),
  }
}

function buildUiConfirm(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): UiConfirm {
  const req = requestedContent.ui?.confirm ?? {}
  const fb  = fallbackContent.ui?.confirm  ?? {}
  const key = <K extends keyof UiConfirm>(k: K) =>
    req[k] ?? fb[k] ?? DEFAULT_UI_CONFIRM[k]
  return {
    clearTitle:   key('clearTitle'),
    clearBody:    key('clearBody'),
    clearCancel:  key('clearCancel'),
    clearConfirm: key('clearConfirm'),
  }
}

function buildStateOptions(
  requestedContent: LocaleContent,
  fallbackContent: LocaleContent,
): ItemStateOption[] {
  return SELECTED_STATES.map((state) => {
    const defaultOption = DEFAULT_STATE_OPTIONS.find((o) => o.value === state)!
    const req = requestedContent.ui?.states?.[state] ?? {}
    const fb  = fallbackContent.ui?.states?.[state]  ?? {}
    return {
      value:      state,
      icon:       defaultOption.icon,
      label:      req.label      ?? fb.label      ?? defaultOption.label,
      longLabel:  req.longLabel  ?? fb.longLabel  ?? defaultOption.longLabel,
      shortLabel: req.shortLabel ?? fb.shortLabel ?? defaultOption.shortLabel,
    }
  })
}

function isSupportedLocale(
  locale: string | null | undefined,
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
