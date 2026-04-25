export type SchemaVersion = number
export type LocaleCode = string
export type CategoryId = string
export type ItemId = string
export type ItemCode = number

export interface ItemDefinition {
  id: ItemId
  code: ItemCode
}

export interface CategoryDefinition {
  id: CategoryId
  items: ItemDefinition[]
}

export interface SchemaDefinition {
  version: SchemaVersion
  categories: CategoryDefinition[]
}

export interface LocaleCategoryContent {
  label: string
}

export interface LocaleItemContent {
  label: string
}

export interface LocaleContent {
  locale: LocaleCode
  categories: Record<CategoryId, LocaleCategoryContent>
  items: Record<ItemId, LocaleItemContent>
  ui?: LocaleUiContent
}

export type ItemState = 'none' | 'important' | 'present' | 'discuss' | 'no'
export type SelectedItemState = Exclude<ItemState, 'none'>
export type SelectionState = Partial<Record<ItemId, SelectedItemState>>

export interface ItemStateOption {
  value: ItemState
  label: string
  longLabel: string
  shortLabel: string
  icon: string
}

export interface LocaleUiContent {
  headline?: string
  subheadline?: string
  states?: Partial<Record<SelectedItemState, {
    label?: string
    longLabel?: string
    shortLabel?: string
  }>>
  actions?: {
    reset?: string
    copyLink?: string
    linkCopied?: string
    copyUnavailable?: string
  }
  share?: {
    label?: string
    accessibleLabel?: string
    title?: string
    body?: string
    copyLink?: string
  }
  review?: {
    label?: string
    accessibleLabel?: string
    title?: string
    countLabel?: string
    organizeBy?: string
    byAnswer?: string
    byCategory?: string
    backToEdit?: string
    emptyTitle?: string
    emptyBody?: string
    emptyCta?: string
  }
  wheel?: {
    description?: string
    emptyHint?: string
  }
  menu?: {
    open?: string
    clearAll?: string
  }
  confirm?: {
    clearTitle?: string
    clearBody?: string
    clearCancel?: string
    clearConfirm?: string
  }
  intro?: {
    title?: string
    body?: string
    privacy?: string
    startCategory?: string
    browseCategories?: string
    seeMap?: string
    learnMore?: string
  }
  learnMore?: {
    title?: string
    intro?: string
    sections?: Array<{
      title?: string
      body?: string
    }>
    cta?: string
    back?: string
  }
  mapPreview?: {
    title?: string
    stopAnytime?: string
  }
  allItems?: {
    title?: string
    subtitle?: string
    searchPlaceholder?: string
    allCategories?: string
    showUnanswered?: string
  }
  header?: {
    languageLabel?: string
  }
  fallback?: {
    linkRestoreFailed?: string
  }
}

export interface SelectionSummary {
  important: number
  present: number
  discuss: number
  no: number
}

const SPARSE_URL_ALPHABET =
  'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const SPARSE_URL_CHUNK_LENGTH = 2
const SPARSE_URL_RADIX = SPARSE_URL_ALPHABET.length

const SPARSE_URL_STATE_BITS = 3
const SPARSE_URL_VERSION_PREFIX = 's1'
const SPARSE_URL_MAX_CODE =
  (SPARSE_URL_RADIX ** SPARSE_URL_CHUNK_LENGTH - 1) >> SPARSE_URL_STATE_BITS

const STATE_TO_BITS: Record<ItemState, number> = {
  none:      0,
  important: 1,
  present:   2,
  discuss:   3,
  no:        4,
}

const BITS_TO_STATE: Partial<Record<number, ItemState>> = {
  0: 'none',
  1: 'important',
  2: 'present',
  3: 'discuss',
  4: 'no',
}

export function getCanonicalItemOrder(schema: SchemaDefinition): ItemId[] {
  return schema.categories.flatMap((category) =>
    category.items.map((item) => item.id),
  )
}

export function validateItemCodes(schema: SchemaDefinition): string[] {
  const errors: string[] = []
  const usedCodes = new Map<ItemCode, ItemId>()

  for (const item of getSchemaItems(schema)) {
    if (!Number.isInteger(item.code) || item.code <= 0) {
      errors.push(`${item.id} must have a positive integer code`)
      continue
    }

    if (item.code > SPARSE_URL_MAX_CODE) {
      errors.push(
        `${item.id} code ${item.code} exceeds the sparse URL codec limit`,
      )
      continue
    }

    const existingItemId = usedCodes.get(item.code)

    if (existingItemId) {
      errors.push(
        `${item.id} reuses code ${item.code} from ${existingItemId}`,
      )
    } else {
      usedCodes.set(item.code, item.id)
    }
  }

  return errors
}

export function encodeSparseSelection(
  schema: SchemaDefinition,
  selection: SelectionState,
): string {
  assertValidItemCodes(schema)

  const payload = [...getSchemaItems(schema)]
    .sort((left, right) => left.code - right.code)
    .flatMap((item) => {
      const state = selection[item.id]
      if (!state) return []
      return [encodeSparseChunk((item.code << SPARSE_URL_STATE_BITS) | STATE_TO_BITS[state])]
    })
    .join('')

  return payload ? SPARSE_URL_VERSION_PREFIX + payload : ''
}

export function decodeSparseSelection(
  schema: SchemaDefinition,
  payload: string,
): SelectionState | null {
  if (payload === '') {
    return {}
  }

  if (!payload.startsWith(SPARSE_URL_VERSION_PREFIX)) {
    return null
  }

  const encodedSelection = payload.slice(SPARSE_URL_VERSION_PREFIX.length)
  const errors = validateItemCodes(schema)

  if (
    errors.length > 0 ||
    encodedSelection.length % SPARSE_URL_CHUNK_LENGTH !== 0 ||
    !isBase62(encodedSelection)
  ) {
    return null
  }

  const itemIdsByCode = new Map(
    getSchemaItems(schema).map((item) => [item.code, item.id] as const),
  )
  const decodedCodes = new Set<ItemCode>()
  const selection: SelectionState = {}

  for (
    let index = 0;
    index < encodedSelection.length;
    index += SPARSE_URL_CHUNK_LENGTH
  ) {
    const packed = decodeSparseChunk(
      encodedSelection.slice(index, index + SPARSE_URL_CHUNK_LENGTH),
    )
    const stateBits = packed & ((1 << SPARSE_URL_STATE_BITS) - 1)
    const code = packed >> SPARSE_URL_STATE_BITS
    const state = BITS_TO_STATE[stateBits]
    const itemId = itemIdsByCode.get(code)

    if (!itemId || !state || state === 'none' || decodedCodes.has(code)) {
      return null
    }

    decodedCodes.add(code)
    selection[itemId] = state as SelectedItemState
  }

  return selection
}

export function summarizeSelection(selection: SelectionState): SelectionSummary {
  const summary: SelectionSummary = {
    important: 0,
    present:   0,
    discuss:   0,
    no:        0,
  }

  for (const state of Object.values(selection)) {
    if (state) {
      summary[state] += 1
    }
  }

  return summary
}

function getSchemaItems(schema: SchemaDefinition): ItemDefinition[] {
  return schema.categories.flatMap((category) => category.items)
}

function assertValidItemCodes(schema: SchemaDefinition): void {
  const errors = validateItemCodes(schema)

  if (errors.length > 0) {
    throw new Error(errors.join('; '))
  }
}

function encodeSparseChunk(value: number): string {
  const high = Math.floor(value / SPARSE_URL_RADIX)
  const low = value % SPARSE_URL_RADIX

  return `${SPARSE_URL_ALPHABET[high]}${SPARSE_URL_ALPHABET[low]}`
}

function decodeSparseChunk(chunk: string): number {
  const high = SPARSE_URL_ALPHABET.indexOf(chunk[0] ?? '')
  const low = SPARSE_URL_ALPHABET.indexOf(chunk[1] ?? '')

  return high * SPARSE_URL_RADIX + low
}

function isBase62(payload: string): boolean {
  return /^[A-Za-z0-9]*$/.test(payload)
}
